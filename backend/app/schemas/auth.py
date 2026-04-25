from pydantic import BaseModel


class AuthenticatedUserProfile(BaseModel):
    user_id: str
    email: str | None = None
    username: str | None = None
    role: str


class AuthMeResponse(BaseModel):
    profile: AuthenticatedUserProfile
