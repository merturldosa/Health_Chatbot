from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserResponse, UserLogin
from ..services.auth_service import AuthService
from ..dependencies import get_current_user as get_current_user_dependency
from datetime import timedelta
from ..config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """사용자 회원가입"""

    # 이메일 중복 확인
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 등록된 이메일입니다.",
        )

    # 사용자명 중복 확인
    result = await db.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 사용자명입니다.",
        )

    # 비밀번호 해시
    hashed_password = AuthService.get_password_hash(user_data.password)

    # 사용자 생성 (빈 문자열을 None으로 변환)
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        age=user_data.age,
        gender=user_data.gender if user_data.gender else None,
        phone=user_data.phone,
        chronic_conditions=user_data.chronic_conditions,
        allergies=user_data.allergies,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


@router.post("/login")
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """로그인"""

    # 사용자 조회 (email로 변경)
    result = await db.execute(
        select(User).where(User.email == user_data.username)
    )
    user = result.scalar_one_or_none()

    if not user or not AuthService.verify_password(
        user_data.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # JWT 토큰 생성 (email 사용)
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = AuthService.create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=access_token_expires,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
    }


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user_dependency),
):
    """현재 로그인한 사용자 정보 조회"""
    return current_user
