from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from postgrest.exceptions import APIError

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

    try:
        user_response = supabase_client.auth.get_user(access_token)
    except Exception as authentication_error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate authentication token.",
        ) from authentication_error

    authenticated_user = user_response.user
    if authenticated_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token.")

    profile_response = (
        supabase_client.table("profiles").select("id, username, role").eq("id", authenticated_user.id).maybe_single().execute()
    )
    profile_data = profile_response.data

    if profile_data is None:
        default_username = None
        if authenticated_user.user_metadata and isinstance(authenticated_user.user_metadata, dict):
            default_username = authenticated_user.user_metadata.get("username")
        if not default_username and authenticated_user.email:
            default_username = authenticated_user.email.split("@")[0]
        if not default_username:
            default_username = f"player_{authenticated_user.id[:8]}"

        username_candidates = [
            default_username,
            f"{default_username}_{authenticated_user.id[:6]}",
            f"player_{authenticated_user.id[:8]}",
        ]
        for candidate_username in username_candidates:
            try:
                supabase_client.table("profiles").insert(
                    {
                        "id": authenticated_user.id,
                        "username": candidate_username,
                        "role": "player",
                    }
                ).execute()
                break
            except APIError:
                # Could be unique username collision or race-condition.
                continue

        profile_response = (
            supabase_client.table("profiles")
            .select("id, username, role")
            .eq("id", authenticated_user.id)
            .maybe_single()
            .execute()
        )
        profile_data = profile_response.data

    if profile_data is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Profile record is missing. Please contact admin.",
        )

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
