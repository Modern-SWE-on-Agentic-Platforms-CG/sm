"""Alembic migration environment — async SQLAlchemy with smarthire schema."""

import asyncio
import os
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# ---------------------------------------------------------------------------
# Import all models so their metadata is registered before autogenerate runs.
# ---------------------------------------------------------------------------
from smarthire.models.base import Base  # noqa: F401
import smarthire.models.masters  # noqa: F401
import smarthire.models.employee  # noqa: F401
import smarthire.models.candidate  # noqa: F401
import smarthire.models.calendar  # noqa: F401
import smarthire.models.feedback  # noqa: F401
import smarthire.models.demand  # noqa: F401
import smarthire.models.bench  # noqa: F401
import smarthire.models.referral  # noqa: F401

# ---------------------------------------------------------------------------
# Alembic Config object
# ---------------------------------------------------------------------------
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Override sqlalchemy.url from environment if provided
# Escape '%' as '%%' so configparser does not treat percent-encoded chars
# (e.g. %40 for '@' in passwords) as interpolation sequences.
database_url = os.getenv("DATABASE_URL")
if database_url:
    config.set_main_option("sqlalchemy.url", database_url.replace("%", "%%"))

target_metadata = Base.metadata

# The schema all tables reside in
SCHEMA = os.getenv("SMARTHIRE_DB_SCHEMA", "smarthire")


def include_name(name: str | None, type_: str, parent_names: dict) -> bool:  # type: ignore[type-arg]
    """Restrict autogenerate to the smarthire schema only."""
    if type_ == "schema":
        return name == SCHEMA
    return True


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (no live DB connection)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_schemas=True,
        include_name=include_name,
        version_table_schema=SCHEMA,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_schemas=True,
        include_name=include_name,
        version_table_schema=SCHEMA,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
