from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.supabase_clients import create_service_role_supabase_client
from app.schemas.auth import AuthenticatedUserProfile

http_bearer_scheme = HTTPBearer(auto_error=False)

role_rank_map = {
    "player": 1,
    "admin": 2,
    "super_admin": 3,
}


def get_authenticated_user_profile(
    authorization_credentials: HTTPAuthorizationCredentials | None = Depends(http_bearer_scheme),
) -> AuthenticatedUserProfile:
    if authorization_credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token.")

    access_token = authorization_credentials.credentials
    supabase_client = create_service_role_supabase_client()

    user_response = supabase_client.auth.get_user(access_token)
    authenticated_user = user_response.user
    if authenticated_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token.")

    profile_response = (
        supabase_client.table("profiles")
        .select("id, username, role")
        .eq("id", authenticated_user.id)
        .single()
        .execute()
    )
    profile_data = profile_response.data
    if profile_data is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Profile was not found for this account.")

    return AuthenticatedUserProfile(
        user_id=profile_data["id"],
        email=authenticated_user.email,
        username=profile_data.get("username"),
        role=profile_data["role"],
    )


def create_role_guard_dependency(required_minimum_role: str) -> Callable[[AuthenticatedUserProfile], AuthenticatedUserProfile]:
    required_rank = role_rank_map[required_minimum_role]

    def enforce_role_permission(
        authenticated_user_profile: AuthenticatedUserProfile = Depends(get_authenticated_user_profile),
    ) -> AuthenticatedUserProfile:
        current_rank = role_rank_map.get(authenticated_user_profile.role, 0)
        if current_rank < required_rank:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role permissions.")
        return authenticated_user_profile

    return enforce_role_permission


require_player_or_higher = create_role_guard_dependency("player")
require_admin_or_higher = create_role_guard_dependency("admin")
require_super_admin = create_role_guard_dependency("super_admin")
