from supabase import Client, create_client

from app.core.config import application_settings


def create_service_role_supabase_client() -> Client:
    return create_client(application_settings.supabase_url, application_settings.supabase_service_role_key)
