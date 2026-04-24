from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LectureBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str  # 'VOD' or 'PDF'
    file_url: str

class LectureCreate(LectureBase):
    pass

class LectureResponse(LectureBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True