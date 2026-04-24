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
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# 2. 사용자 테이블
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=False)  # 관리자 여부 (True면 모든 강의 접근 가능)

# 3. 구매 내역(연결) 테이블
class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    lecture_id = Column(Integer, ForeignKey("lectures.id"))
    purchased_at = Column(DateTime, default=datetime.datetime.utcnow)

    # 관계 설정: SQLAlchemy의 relationship을 통해 객체 단위로 접근 가능하게 함
    # 예: user.purchases 로 해당 유저의 모든 구매 내역 확인 가능
    user = relationship("User", backref="purchases")
    lecture = relationship("Lecture", backref="purchased_by")