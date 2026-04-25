from pydantic import BaseModel, Field


class CategoryPayload(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class CategoryReadModel(BaseModel):
    id: int
    name: str


class WordCreatePayload(BaseModel):
    category_id: int
    word: str = Field(min_length=1, max_length=100)
    hint: str = Field(min_length=1, max_length=200)


class WordUpdatePayload(BaseModel):
    word: str | None = Field(default=None, min_length=1, max_length=100)
    hint: str | None = Field(default=None, min_length=1, max_length=200)
    category_id: int | None = None


class WordReadModel(BaseModel):
    id: int
    category_id: int
    word: str
    hint: str


class RandomWordResponse(BaseModel):
    word_id: int
    category_id: int
    category_name: str
    word: str
    hint: str


class ScoreboardEntryResponse(BaseModel):
    profile_id: str
    username: str | None = None
    wins: int


class RecordWinResponse(BaseModel):
    profile_id: str
    wins: int
