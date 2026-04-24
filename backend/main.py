from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Query # Query 추가
from sqlalchemy.orm import Session
from typing import List
import os
import io
import shutil
from pathlib import Path

# 커스텀 모듈 임포트
import auth 
from database import engine, get_db
import models
import schemas

# 테이블 자동 생성
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="vibe_edu API")

# 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 업로드 경로 설정
UPLOAD_DIR = Path("storage")
UPLOAD_DIR.mkdir(exist_ok=True)

# --- 경로(Route) 정의 시작 ---

@app.get("/")
def read_root():
    return {"message": "vibe_edu API is running"}

# 1. 강의 목록 조회 (프론트엔드 메인 페이지용)
# 프론트엔드에서 fetch("http://127.0.0.1:8000/api/lectures") 로 호출한다면 아래 경로가 맞습니다.
@app.get("/api/lectures", response_model=List[schemas.LectureResponse])
def read_lectures(db: Session = Depends(get_db)):
    return db.query(models.Lecture).all()

# 2. 강의 업로드 (Admin 전용)
@app.post("/api/v1/admin/upload")
async def upload_lecture(
    title: str = Form(...),
    description: str = Form(None),
    category: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    file_path = UPLOAD_DIR / file.filename
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    new_lecture = models.Lecture(
        title=title,
        description=description,
        category=category,
        file_url=str(file_path)
    )
    db.add(new_lecture)
    db.commit()
    db.refresh(new_lecture)
    return {"message": "업로드 성공", "id": new_lecture.id}

# 3. 회원가입
@app.post("/api/v1/signup")
def signup(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        raise HTTPException(status_code=400, detail="이미 등록된 이메일입니다.")
    
    new_user = models.User(
        email=email,
        hashed_password=auth.get_password_hash(password)
    )
    db.add(new_user)
    db.commit()
    return {"message": "회원가입 성공"}

# 4. 로그인
@app.post("/api/v1/login")
def login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not auth.verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀렸습니다.")
    
    access_token = auth.create_access_token(data={"sub": user.email, "is_admin": user.is_admin})
    return {"access_token": access_token, "token_type": "bearer"}

# 5. 구매하기
@app.post("/api/v1/purchase/{lecture_id}")
def purchase_lecture(
    lecture_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(auth.get_current_user)
):
    user = db.query(models.User).filter(models.User.email == current_user["email"]).first()
    existing = db.query(models.Purchase).filter(
        models.Purchase.user_id == user.id, 
        models.Purchase.lecture_id == lecture_id
    ).first()
    
    if existing:
        return {"message": "이미 구매한 강의입니다."}

    new_purchase = models.Purchase(user_id=user.id, lecture_id=lecture_id)
    db.add(new_purchase)
    db.commit()
    return {"message": "구매가 완료되었습니다."}

# 6. 보안 스트리밍 (권한 체크 포함)
@app.get("/api/v1/contents/{content_id}/stream")
async def stream_pdf(
    content_id: int, 
    db: Session = Depends(get_db),
    token: str = Depends(auth.oauth2_scheme)
):
    # 토큰 검증 및 유저 확인
    user_info = auth.get_current_user(token)
    user = db.query(models.User).filter(models.User.email == user_info["email"]).first()

    # 구매 내역 확인 (관리자는 무조건 허용)
    is_purchased = db.query(models.Purchase).filter(
        models.Purchase.user_id == user.id, 
        models.Purchase.lecture_id == content_id
    ).first()

    if not is_purchased and not user.is_admin:
        raise HTTPException(status_code=403, detail="강의 구매가 필요합니다.")

    # 파일 스트리밍 로직
    content = db.query(models.Lecture).filter(models.Lecture.id == content_id).first()
    if not content or not os.path.exists(content.file_url):
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")

    def iterfile():
        with open(content.file_url, mode="rb") as f:
            yield from f

    return StreamingResponse(iterfile(), media_type="application/pdf")

@app.get("/api/v1/contents/{content_id}/stream")
async def stream_pdf(
    content_id: int, 
    db: Session = Depends(get_db),
    # token을 헤더가 아닌 쿼리 파라미터에서도 받을 수 있게 설정 (Optional)
    token: str = Query(None) 
):
    # 만약 쿼리에 토큰이 없다면? auth.oauth2_scheme(헤더)에서 가져오기 시도
    if token is None:
        raise HTTPException(status_code=401, detail="토큰이 필요합니다.")

    # 토큰 검증 로직 (auth.get_current_user 기능을 직접 호출)
    user_info = auth.get_current_user(token)
    user = db.query(models.User).filter(models.User.email == user_info["email"]).first()