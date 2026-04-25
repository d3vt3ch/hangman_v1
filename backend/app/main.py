from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.admin_routes import admin_router
from app.api.routes.auth_routes import auth_router
from app.api.routes.game_routes import game_router
from app.core.config import application_settings

application_instance = FastAPI(title=application_settings.app_name)

application_instance.add_middleware(
    CORSMiddleware,
    allow_origins=[application_settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@application_instance.get("/health", tags=["System"])
def get_health_check() -> dict:
    return {"status": "ok", "environment": application_settings.app_env}


application_instance.include_router(auth_router, prefix="/api/v1")
application_instance.include_router(admin_router, prefix="/api/v1")
application_instance.include_router(game_router, prefix="/api/v1")
