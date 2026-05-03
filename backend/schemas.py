from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LectureBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str  # 'VOD' or 'PDF'
    file_url: str
    cover_image_url: Optional[str] = None
    thumbnail_urls: Optional[str] = None
    md_file_url: Optional[str] = None
    html_file_url: Optional[str] = None

class LectureCreate(LectureBase):
    pass

class LectureResponse(LectureBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ViewLogRequest(BaseModel):
    duration: int = 0
    is_new_view: bool = False


class MarkdownUpdateRequest(BaseModel):
    markdown_content: str


class AdminLectureUpdateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    category: str