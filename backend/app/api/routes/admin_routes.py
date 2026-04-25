from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import require_admin_or_higher, require_super_admin
from app.schemas.admin import RoleUpdateResponse, UserRoleUpdatePayload
from app.schemas.auth import AuthenticatedUserProfile
from app.schemas.common import ApiMessageResponse
from app.schemas.game import (
    CategoryPayload,
    CategoryReadModel,
    ScoreboardEntryResponse,
    WordCreatePayload,
    WordReadModel,
    WordUpdatePayload,
)
from app.services.admin_service import update_user_role
from app.services.game_service import (
    create_category,
    create_word,
    delete_category,
    delete_word,
    list_categories,
    list_leaderboard,
    list_words,
    reset_player_score,
    update_category,
    update_word,
)

admin_router = APIRouter(prefix="/admin", tags=["Admin"])


@admin_router.get("/categories", response_model=list[CategoryReadModel])
def get_categories_for_admin(
    _: AuthenticatedUserProfile = Depends(require_admin_or_higher),
) -> list[CategoryReadModel]:
    return [CategoryReadModel(**category_row) for category_row in list_categories()]


@admin_router.post("/categories", response_model=CategoryReadModel)
def create_new_category(
    category_payload: CategoryPayload,
    _: AuthenticatedUserProfile = Depends(require_admin_or_higher),
) -> CategoryReadModel:
    return CategoryReadModel(**create_category(category_payload.name))


@admin_router.put("/categories/{category_id}", response_model=CategoryReadModel)
def update_existing_category(
    category_id: int,
    category_payload: CategoryPayload,
    _: AuthenticatedUserProfile = Depends(require_admin_or_higher),
) -> CategoryReadModel:
    return CategoryReadModel(**update_category(category_id, category_payload.name))


@admin_router.delete("/categories/{category_id}", response_model=ApiMessageResponse)
def remove_category(
    category_id: int,
    _: AuthenticatedUserProfile = Depends(require_admin_or_higher),
) -> ApiMessageResponse:
    delete_category(category_id)
    return ApiMessageResponse(message="Category deleted successfully.")


@admin_router.get("/words", response_model=list[WordReadModel])
def get_words_for_admin(
    _: AuthenticatedUserProfile = Depends(require_admin_or_higher),
) -> list[WordReadModel]:
    return [WordReadModel(**word_row) for word_row in list_words()]


@admin_router.post("/words", response_model=WordReadModel)
def create_new_word(
    word_payload: WordCreatePayload,
    _: AuthenticatedUserProfile = Depends(require_admin_or_higher),
) -> WordReadModel:
    return WordReadModel(**create_word(word_payload.category_id, word_payload.word, word_payload.hint))


@admin_router.put("/words/{word_id}", response_model=WordReadModel)
def update_existing_word(
    word_id: int,
    word_payload: WordUpdatePayload,
    _: AuthenticatedUserProfile = Depends(require_admin_or_higher),
) -> WordReadModel:
    serialized_update_payload = word_payload.model_dump(exclude_none=True)
    if not serialized_update_payload:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No update field was provided.")
    return WordReadModel(**update_word(word_id, serialized_update_payload))


@admin_router.delete("/words/{word_id}", response_model=ApiMessageResponse)
def remove_word(
    word_id: int,
    _: AuthenticatedUserProfile = Depends(require_admin_or_higher),
) -> ApiMessageResponse:
    delete_word(word_id)
    return ApiMessageResponse(message="Word deleted successfully.")


@admin_router.get("/scoreboard", response_model=list[ScoreboardEntryResponse])
def get_scoreboard_for_admin(
    _: AuthenticatedUserProfile = Depends(require_admin_or_higher),
) -> list[ScoreboardEntryResponse]:
    return [ScoreboardEntryResponse(**entry) for entry in list_leaderboard()]


@admin_router.post("/scoreboard/reset", response_model=ScoreboardEntryResponse)
def reset_scoreboard_entry(
    profile_id: str = Query(...),
    _: AuthenticatedUserProfile = Depends(require_admin_or_higher),
) -> ScoreboardEntryResponse:
    reset_result = reset_player_score(profile_id)
    return ScoreboardEntryResponse(profile_id=reset_result["profile_id"], wins=reset_result["wins"], username=None)


@admin_router.post("/roles/promote-admin", response_model=RoleUpdateResponse)
def promote_player_to_admin(
    role_update_payload: UserRoleUpdatePayload,
    _: AuthenticatedUserProfile = Depends(require_super_admin),
) -> RoleUpdateResponse:
    return RoleUpdateResponse(**update_user_role(role_update_payload.target_user_id, "admin"))


@admin_router.post("/roles/demote-admin", response_model=RoleUpdateResponse)
def demote_admin_to_player(
    role_update_payload: UserRoleUpdatePayload,
    _: AuthenticatedUserProfile = Depends(require_super_admin),
) -> RoleUpdateResponse:
    return RoleUpdateResponse(**update_user_role(role_update_payload.target_user_id, "player"))
