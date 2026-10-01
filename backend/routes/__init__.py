from .auth_routes import router as auth_router
from .ai_routes import router as ai_router
from .documents_routes import router as documents_router
from .cases_routes import router as cases_router
from .case_data_routes import router as case_data_router
from .admin_routes import router as admin_router
from .payments_routes import router as payments_router
from .export_routes import router as export_router
from .calendar_routes import router as calendar_router
from .legal_routes import router as legal_router
from .courtlistener_routes import router as courtlistener_router
from .community_routes import router as community_router
from .section1983_routes import router as section1983_router
from .podcast_routes import router as podcast_router
from .caselaw_routes import router as caselaw_router
from .ada_routes import router as ada_router
from .strategy_routes import router as strategy_router
from .case_memory_routes import router as case_memory_router
from .porch_mode_routes import router as porch_mode_router
from .foia_routes import router as foia_router
from .lawsuit_architect_routes import router as lawsuit_architect_router
from .integrity_db_routes import router as integrity_db_router
from .immutable_vault_routes import router as immutable_vault_router
from .political_strike_routes import router as political_strike_router
from .citation_routes import router as citation_router
from .ai_jobs_routes import router as ai_jobs_router

all_routers = [
    auth_router,
    ai_router,
    documents_router,
    cases_router,
    case_data_router,
    admin_router,
    payments_router,
    export_router,
    calendar_router,
    legal_router,
    courtlistener_router,
    community_router,
    section1983_router,
    podcast_router,
    caselaw_router,
    ada_router,
    strategy_router,
    case_memory_router,
    porch_mode_router,
    foia_router,
    lawsuit_architect_router,
    integrity_db_router,
    immutable_vault_router,
    political_strike_router,
    citation_router,
    ai_jobs_router,
]
