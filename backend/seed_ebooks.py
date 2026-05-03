from database import SessionLocal, engine
import models

models.Base.metadata.create_all(bind=engine)
db = SessionLocal()

def seed_ebooks():
    ebooks = [
        {
            "title": "VIBE CODING: THE MASTERPIECE",
            "description": "코딩을 몰라도 AI를 활용해 상용 서비스를 구현하는 바이브 코딩의 정수를 담았습니다.",
            "category": "PDF",
            "file_url": "storage/vibe_coding_masterpiece.pdf"
        },
        {
            "title": "Next.js 14 실전 압축 가이드",
            "description": "최신 App Router 기반의 Next.js를 단 3일만에 마스터할 수 있는 최고의 실전 가이드입니다.",
            "category": "PDF",
            "file_url": "storage/dummy.pdf"
        },
        {
            "title": "FastAPI 백엔드 A to Z",
            "description": "파이썬 비동기 프레임워크의 꽃, FastAPI를 활용한 고성능 백엔드 서버 구축 비법.",
            "category": "PDF",
            "file_url": "storage/dummy.pdf"
        },
        {
            "title": "초보자를 위한 UI/UX 디자인 패턴",
            "description": "개발자도 쉽게 따라할 수 있는 모던 UI/UX 디자인 법칙과 Tailwind CSS 활용법.",
            "category": "PDF",
            "file_url": "storage/dummy.pdf"
        },
        {
            "title": "Ollama와 함께하는 로컬 LLM 구축기",
            "description": "비싼 API 비용 없이 내 컴퓨터에서 AI를 돌리는 로컬 모델 구축 및 활용 전략.",
            "category": "PDF",
            "file_url": "storage/dummy.pdf"
        },
        {
            "title": "자동화 수익형 웹사이트 만들기",
            "description": "크롤링, AI 자동 작성, SEO를 결합하여 잠자는 동안에도 돈을 버는 파이프라인 구축.",
            "category": "PDF",
            "file_url": "storage/dummy.pdf"
        },
        {
            "title": "SQL과 데이터 모델링 마스터북",
            "description": "데이터베이스 설계부터 복잡한 JOIN 쿼리까지, 탄탄한 백엔드의 기초를 다지는 책.",
            "category": "PDF",
            "file_url": "storage/dummy.pdf"
        },
        {
            "title": "프롬프트 엔지니어링 바이블",
            "description": "AI의 잠재력을 200% 끌어올리는 마법의 프롬프트 작성 공식과 100가지 예제.",
            "category": "PDF",
            "file_url": "storage/dummy.pdf"
        },
        {
            "title": "Supabase로 하루만에 앱 런칭하기",
            "description": "서버 관리 없이 BaaS를 활용하여 인증, DB, 스토리지를 완벽하게 구현하는 방법.",
            "category": "PDF",
            "file_url": "storage/dummy.pdf"
        },
        {
            "title": "실전 리액트 상태관리 (Zustand & React Query)",
            "description": "더 이상 Redux에 고통받지 마세요. 현대적인 프론트엔드 상태관리의 모든 것.",
            "category": "PDF",
            "file_url": "storage/dummy.pdf"
        }
    ]

    for data in ebooks:
        # 중복 체크
        existing = db.query(models.Lecture).filter(models.Lecture.title == data["title"]).first()
        if not existing:
            lecture = models.Lecture(
                title=data["title"],
                description=data["description"],
                category=data["category"],
                file_url=data["file_url"]
            )
            db.add(lecture)
    
    db.commit()
    print("✅ 10개의 가상 전자책이 성공적으로 생성되었습니다.")

if __name__ == "__main__":
    seed_ebooks()
