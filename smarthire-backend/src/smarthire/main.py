"""FastAPI application factory."""

import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from smarthire.config import get_settings
from smarthire.tasks.scheduler import get_scheduler, register_all_jobs

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application startup and shutdown."""
    settings = get_settings()

    # Start APScheduler
    scheduler = get_scheduler()
    register_all_jobs(scheduler, settings)
    scheduler.start()
    logger.info("APScheduler started")

    yield

    # Shutdown APScheduler
    scheduler.shutdown(wait=False)
    logger.info("APScheduler stopped")


def create_app() -> FastAPI:
    settings = get_settings()

    logging.basicConfig(level=settings.log_level.upper())

    application = FastAPI(
        title="SmartHire Backend API",
        version="1.0.0",
        lifespan=lifespan,
        # Swagger/ReDoc served at /docs and /redoc — no auth required
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            "http://localhost:8051",
            "http://127.0.0.1:8051",
            "http://localhost:8086",
            "http://127.0.0.1:8086",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    _register_routers(application)

    return application


def _register_routers(application: FastAPI) -> None:
    """Import and include all routers.

    Routers are imported lazily here to avoid circular imports at module level.
    Public paths (/prescreen/**, /health, /docs, /redoc, /openapi.json) must be
    registered without the global auth dependency — see each router module.
    """
    from smarthire.routers import auth  # noqa: PLC0415

    application.include_router(auth.router)

    from smarthire.routers import keycloak  # noqa: PLC0415

    application.include_router(keycloak.router)

    from smarthire.routers import candidate  # noqa: PLC0415

    application.include_router(candidate.router)

    from smarthire.routers import lookup  # noqa: PLC0415

    application.include_router(lookup.router)

    from smarthire.routers import scheduling  # noqa: PLC0415

    application.include_router(scheduling.router)

    from smarthire.routers import user  # noqa: PLC0415

    application.include_router(user.router)

    from smarthire.routers import feedback  # noqa: PLC0415

    application.include_router(feedback.router)

    from smarthire.routers import reports  # noqa: PLC0415

    application.include_router(reports.router)

    from smarthire.routers.prescreen import router as prescreen_router, referral_router  # noqa: PLC0415

    application.include_router(prescreen_router)
    application.include_router(referral_router)

    from smarthire.routers import interviewer  # noqa: PLC0415

    application.include_router(interviewer.router)

    from smarthire.routers import recruiter  # noqa: PLC0415

    application.include_router(recruiter.router)

    from smarthire.routers import alerts  # noqa: PLC0415

    application.include_router(alerts.router)

    from smarthire.routers.user_management import (  # noqa: PLC0415
        register_router,
        role_router,
        users_router,
    )

    application.include_router(register_router)
    application.include_router(role_router)
    application.include_router(users_router)

    from smarthire.routers.demand_bench import (  # noqa: PLC0415
        demand_router,
        demand_upload_router,
        bench_router,
        bench_upload_router,
        supply_router,
    )

    application.include_router(demand_router)
    application.include_router(demand_upload_router)
    application.include_router(bench_router)
    application.include_router(bench_upload_router)
    application.include_router(supply_router)

    from smarthire.routers.excel_report import excel_router, report_router  # noqa: PLC0415

    application.include_router(excel_router)
    application.include_router(report_router)

    from smarthire.routers import workflow  # noqa: PLC0415

    application.include_router(workflow.router)

    from smarthire.routers.files import (  # noqa: PLC0415
        image_router,
        msg_router,
        pdf_router,
        slot_router,
    )

    application.include_router(image_router)
    application.include_router(msg_router)
    application.include_router(pdf_router)
    application.include_router(slot_router)

    from smarthire.routers.misc import (  # noqa: PLC0415
        teams_router,
        config_router,
        feedback_form_router,
        referral_candidate_router,
        referral_router_v2,
    )

    application.include_router(teams_router)
    application.include_router(config_router)
    application.include_router(feedback_form_router)
    application.include_router(referral_candidate_router)
    application.include_router(referral_router_v2)

    # Dev-only router — mock JWT for local testing (never runs in production)
    import os  # noqa: PLC0415
    if os.getenv("APP_ENV", "development").lower() == "development":
        from smarthire.routers.dev import router as dev_router  # noqa: PLC0415
        application.include_router(dev_router)


app = create_app()
