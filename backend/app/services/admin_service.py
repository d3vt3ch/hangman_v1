from fastapi import HTTPException, status

from app.core.supabase_clients import create_service_role_supabase_client


def list_user_profiles_for_role_management() -> list[dict]:
    supabase_client = create_service_role_supabase_client()
    profiles_response = supabase_client.table("profiles").select("id, username, role").order("created_at").execute()
    profile_rows = profiles_response.data or []
    return [
        {
            "user_id": profile_row["id"],
            "username": profile_row.get("username"),
            "role": profile_row["role"],
        }
        for profile_row in profile_rows
    ]


def update_user_role(target_user_id: str, target_role: str) -> dict:
    supabase_client = create_service_role_supabase_client()
    updated_profile_response = (
        supabase_client.table("profiles").update({"role": target_role}).eq("id", target_user_id).execute()
    )
    if not updated_profile_response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found.")
    return {"user_id": target_user_id, "role": target_role}
