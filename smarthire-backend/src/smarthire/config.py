"""Application settings — all configuration read from environment variables.

Uses pydantic-settings so values can be supplied via environment or .env file.
No secrets are hardcoded here.
Targets Python 3.12+.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ------------------------------------------------------------------
    # Database
    # ------------------------------------------------------------------
    database_url: str = "postgresql+asyncpg://smarthire:smarthire@localhost:5432/smarthiredb001"
    smarthire_db_schema: str = "smarthire"
    smarthire_test_schema: str = "smarthire_test"

    # ------------------------------------------------------------------
    # JWT
    # ------------------------------------------------------------------
    jwt_secret: str = "CHANGE_ME_IN_PRODUCTION"
    jwt_algorithm: str = "HS256"

    # ------------------------------------------------------------------
    # Keycloak
    # ------------------------------------------------------------------
    keycloak_url: str = "http://localhost:8080"
    keycloak_realm: str = "smarthire"
    keycloak_client_id: str = "smarthire-backend"
    keycloak_admin_username: str = "admin"
    keycloak_admin_password: str = ""
    keycloak_verify_ssl: bool = True

    # ------------------------------------------------------------------
    # AWS
    # ------------------------------------------------------------------
    aws_region: str = "eu-west-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    s3_bucket_name: str = "smarthire-dev"
    s3_feedback_bucket: str = "smarthireprod"
    ses_from_address: str = "noreply@smarthire.internal"

    # ------------------------------------------------------------------
    # Microsoft Graph API (Teams)
    # ------------------------------------------------------------------
    ms_tenant_id: str = ""
    ms_client_id: str = ""
    ms_client_secret: str = ""

    # ------------------------------------------------------------------
    # Application
    # ------------------------------------------------------------------
    app_port: int = 8083
    log_level: str = "INFO"
    app_env: str = "development"


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (singleton per process)."""
    return Settings()
