from pydantic import BaseModel


class UserRoleUpdatePayload(BaseModel):
    target_user_id: str


class RoleUpdateResponse(BaseModel):
    user_id: str
    role: str


class UserRoleListItemResponse(BaseModel):
    user_id: str
    username: str | None = None
    role: str
