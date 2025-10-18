from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    """사용자 생성 스키마"""

    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    chronic_conditions: Optional[str] = None
    allergies: Optional[str] = None


class UserLogin(BaseModel):
    """로그인 스키마"""

    username: str
    password: str


class UserResponse(BaseModel):
    """사용자 응답 스키마"""

    id: int
    email: str
    username: str
    full_name: Optional[str]
    age: Optional[int]
    gender: Optional[str]
    phone: Optional[str]
    chronic_conditions: Optional[str]
    allergies: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
