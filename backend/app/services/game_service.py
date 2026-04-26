import random

from fastapi import HTTPException, status
from postgrest.exceptions import APIError

from app.core.supabase_clients import create_service_role_supabase_client

default_category_word_hint_map = {
    "fruits": [
        ("apple", "Sweet fruit, usually red or green"),
        ("banana", "Long yellow fruit"),
        ("cherry", "Small red fruit"),
        ("date", "Sweet brown fruit often from Middle East"),
        ("fig", "Soft fruit with many seeds inside"),
        ("grape", "Small round fruit, used for wine"),
    ],
    "animals": [
        ("cat", "Small pet that says meow"),
        ("dog", "Man's best friend"),
        ("elephant", "Large animal with trunk"),
        ("giraffe", "Animal with long neck"),
        ("lion", "King of the jungle"),
        ("tiger", "Striped big cat"),
    ],
    "countries": [
        ("usa", "Country in North America"),
        ("canada", "Cold country above USA"),
        ("brazil", "Famous for football"),
        ("india", "Second most populous country"),
        ("china", "Most populous country"),
        ("australia", "Country with kangaroo"),
    ],
}


def seed_default_game_data_if_database_is_empty() -> None:
    supabase_client = create_service_role_supabase_client()
    existing_category_rows_response = supabase_client.table("categories").select("id").limit(1).execute()
    existing_category_rows = existing_category_rows_response.data or []
    if existing_category_rows:
        return

    for category_name, word_and_hint_pairs in default_category_word_hint_map.items():
        inserted_category_response = supabase_client.table("categories").insert({"name": category_name}).execute()
        inserted_category_id = inserted_category_response.data[0]["id"]

        words_to_insert_payload = []
        for word_text, word_hint in word_and_hint_pairs:
            words_to_insert_payload.append(
                {
                    "category_id": inserted_category_id,
                    "word": word_text,
                    "hint": word_hint,
                }
            )
        supabase_client.table("words").insert(words_to_insert_payload).execute()


def list_categories() -> list[dict]:
    supabase_client = create_service_role_supabase_client()
    response = supabase_client.table("categories").select("id, name").order("id").execute()
    return response.data or []


def create_category(category_name: str) -> dict:
    normalized_category_name = category_name.strip().lower()
    supabase_client = create_service_role_supabase_client()
    created_response = supabase_client.table("categories").insert({"name": normalized_category_name}).execute()
    return created_response.data[0]


def update_category(category_id: int, category_name: str) -> dict:
    normalized_category_name = category_name.strip().lower()
    supabase_client = create_service_role_supabase_client()
    updated_response = (
        supabase_client.table("categories")
        .update({"name": normalized_category_name})
        .eq("id", category_id)
        .execute()
    )
    if not updated_response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
    return updated_response.data[0]


def delete_category(category_id: int) -> None:
    supabase_client = create_service_role_supabase_client()
    deleted_response = supabase_client.table("categories").delete().eq("id", category_id).execute()
    if not deleted_response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")


def list_words() -> list[dict]:
    supabase_client = create_service_role_supabase_client()
    response = supabase_client.table("words").select("id, category_id, word, hint").order("id").execute()
    return response.data or []


def create_word(category_id: int, word: str, hint: str) -> dict:
    supabase_client = create_service_role_supabase_client()
    payload = {"category_id": category_id, "word": word.strip().lower(), "hint": hint.strip()}
    created_response = supabase_client.table("words").insert(payload).execute()
    return created_response.data[0]


def update_word(word_id: int, update_payload: dict) -> dict:
    if "word" in update_payload and isinstance(update_payload["word"], str):
        update_payload["word"] = update_payload["word"].strip().lower()
    if "hint" in update_payload and isinstance(update_payload["hint"], str):
        update_payload["hint"] = update_payload["hint"].strip()
    supabase_client = create_service_role_supabase_client()
    updated_response = supabase_client.table("words").update(update_payload).eq("id", word_id).execute()
    if not updated_response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found.")
    return updated_response.data[0]


def delete_word(word_id: int) -> None:
    supabase_client = create_service_role_supabase_client()
    deleted_response = supabase_client.table("words").delete().eq("id", word_id).execute()
    if not deleted_response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Word not found.")


def get_random_word_for_category(category_id: int) -> dict:
    supabase_client = create_service_role_supabase_client()
    category_response = supabase_client.table("categories").select("id, name").eq("id", category_id).single().execute()
    if category_response.data is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    words_response = supabase_client.table("words").select("id, category_id, word, hint").eq("category_id", category_id).execute()
    category_words = words_response.data or []
    if not category_words:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No words found in this category.")

    chosen_word_record = random.choice(category_words)
    return {
        "word_id": chosen_word_record["id"],
        "category_id": chosen_word_record["category_id"],
        "category_name": category_response.data["name"],
        "word": chosen_word_record["word"],
        "hint": chosen_word_record["hint"],
    }


def record_player_win(profile_id: str) -> dict:
    supabase_client = create_service_role_supabase_client()
    current_score_response = (
        supabase_client.table("scoreboard").select("id, wins").eq("profile_id", profile_id).maybe_single().execute()
    )
    current_score_data = current_score_response.data if current_score_response else None

    if current_score_data is None:
        try:
            created_score_response = (
                supabase_client.table("scoreboard").insert({"profile_id": profile_id, "wins": 1}).execute()
            )
            created_score_data = created_score_response.data[0] if created_score_response and created_score_response.data else None
            if created_score_data is None:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Could not create player score entry.",
                )
            return {"profile_id": profile_id, "wins": created_score_data["wins"]}
        except APIError:
            # Another request may have inserted simultaneously. Read latest row and continue.
            concurrent_score_response = (
                supabase_client.table("scoreboard").select("id, wins").eq("profile_id", profile_id).maybe_single().execute()
            )
            current_score_data = concurrent_score_response.data if concurrent_score_response else None
            if current_score_data is None:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Could not resolve player score after concurrent insert.",
                )

    existing_wins = current_score_data["wins"]
    updated_wins = existing_wins + 1
    updated_score_response = (
        supabase_client.table("scoreboard").update({"wins": updated_wins}).eq("profile_id", profile_id).execute()
    )
    if not updated_score_response or not updated_score_response.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update player score.")

    return {"profile_id": profile_id, "wins": updated_wins}


def list_leaderboard() -> list[dict]:
    supabase_client = create_service_role_supabase_client()
    leaderboard_response = (
        supabase_client.table("scoreboard")
        .select("profile_id, wins, profiles(username)")
        .order("wins", desc=True)
        .execute()
    )
    leaderboard_entries = []
    for row in leaderboard_response.data or []:
        profile_reference = row.get("profiles") or {}
        leaderboard_entries.append(
            {
                "profile_id": row["profile_id"],
                "wins": row["wins"],
                "username": profile_reference.get("username"),
            }
        )
    return leaderboard_entries


def reset_player_score(profile_id: str) -> dict:
    supabase_client = create_service_role_supabase_client()
    updated_response = supabase_client.table("scoreboard").update({"wins": 0}).eq("profile_id", profile_id).execute()
    if not updated_response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Score record not found.")
    return {"profile_id": profile_id, "wins": 0}
