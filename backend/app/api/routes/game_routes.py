from fastapi import APIRouter, Depends, Query

from app.core.security import require_player_or_higher
from app.schemas.auth import AuthenticatedUserProfile
from app.schemas.game import CategoryReadModel, RandomWordResponse, RecordWinResponse, ScoreboardEntryResponse
from app.services.game_service import get_random_word_for_category, list_categories, list_leaderboard, record_player_win

game_router = APIRouter(prefix="/game", tags=["Game"])


@game_router.get("/categories", response_model=list[CategoryReadModel])
def get_public_categories_for_gameplay() -> list[CategoryReadModel]:
    return [CategoryReadModel(**category_row) for category_row in list_categories()]


@game_router.get("/random-word", response_model=RandomWordResponse)
def get_random_word(category_id: int = Query(..., gt=0)) -> RandomWordResponse:
    return RandomWordResponse(**get_random_word_for_category(category_id))


@game_router.post("/record-win", response_model=RecordWinResponse)
def record_authenticated_player_win(
    authenticated_user_profile: AuthenticatedUserProfile = Depends(require_player_or_higher),
) -> RecordWinResponse:
    return RecordWinResponse(**record_player_win(authenticated_user_profile.user_id))


@game_router.get("/leaderboard", response_model=list[ScoreboardEntryResponse])
def get_leaderboard() -> list[ScoreboardEntryResponse]:
    return [ScoreboardEntryResponse(**entry) for entry in list_leaderboard()]
