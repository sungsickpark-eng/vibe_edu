# backend/seed.py
from database import SessionLocal, engine  # . 제거
import models  # . 제거 (이미 models 내부에서도 .database를 쓰고 있을 것이므로 아래 2번 단계 확인 필수)

# 테이블 생성
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

def seed_data():
    # 중복 삽입 방지를 위한 체크 (선택사항)
    existing = db.query(models.Lecture).filter(models.Lecture.title == "테스트 전자책").first()
    if existing:
        print("⚠️ 이미 데이터가 존재합니다.")
        return

    test_lecture = models.Lecture(
        title="테스트 전자책",
        description="vibe_edu의 첫 번째 보안 테스트용 전자책입니다.",
        category="PDF",
        file_url="storage/test.pdf" 
    )
    
    db.add(test_lecture)
    try:
        db.commit()
        print("✅ 데이터 삽입 성공!")
    except Exception as e:
        db.rollback()
        print(f"❌ 에러 발생: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()