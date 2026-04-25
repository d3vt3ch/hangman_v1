from pydantic import BaseModel


class ApiMessageResponse(BaseModel):
    message: str
