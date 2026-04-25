from fastapi import APIRouter, Depends

from app.core.security import get_authenticated_user_profile
from app.schemas.auth import AuthMeResponse, AuthenticatedUserProfile

auth_router = APIRouter(prefix="/auth", tags=["Auth"])


@auth_router.get("/me", response_model=AuthMeResponse)
def get_my_authenticated_profile(
    authenticated_user_profile: AuthenticatedUserProfile = Depends(get_authenticated_user_profile),
) -> AuthMeResponse:
    return AuthMeResponse(profile=authenticated_user_profile)
