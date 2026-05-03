from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

# 1. 강의(콘텐츠) 테이블
class Lecture(Base):
    __tablename__ = "lectures"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    category = Column(String(50))      # 'VOD' 또는 'PDF'
    file_url = Column(String(255))     # 로컬 파일 경로 또는 스트리밍 주소
    cover_image_url = Column(String(255), nullable=True)  # 표지 이미지 경로
    thumbnail_urls = Column(Text, nullable=True)          # 썸네일 이미지 경로 목록(JSON 문자열)
    md_file_url = Column(String(255), nullable=True)      # 원본 MD 파일 경로
    html_file_url = Column(String(255), nullable=True)    # 생성된 HTML 파일 경로
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# 2. 사용자 테이블
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=True) # 소셜 로그인은 비밀번호가 없을 수 있음
    
    # 소셜 로그인 아이디
    google_id = Column(String(255), unique=True, index=True, nullable=True)
    kakao_id = Column(String(255), unique=True, index=True, nullable=True)
    naver_id = Column(String(255), unique=True, index=True, nullable=True)
    
    is_admin = Column(Boolean, default=False)  # 관리자 여부 (True면 모든 강의 접근 가능)

# 3. 구매 내역(연결) 및 시청 기록 테이블
class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lecture_id = Column(Integer, ForeignKey("lectures.id"))
    purchased_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # 열람 기록 추가
    view_count = Column(Integer, default=0) # 열람 횟수
    total_view_time = Column(Integer, default=0) # 총 열람 시간 (초 단위)

    # 관계 설정: SQLAlchemy의 relationship을 통해 객체 단위로 접근 가능하게 함
    user = relationship("User", backref="purchases")
    lecture = relationship("Lecture", backref="purchased_by")