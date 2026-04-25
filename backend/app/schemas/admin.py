from pydantic import BaseModel


class UserRoleUpdatePayload(BaseModel):
    target_user_id: str


class RoleUpdateResponse(BaseModel):
    user_id: str
    role: str
