from .auth_routes import router as auth_router
from .admin_routes import router as admin_router
from .cases_routes import router as cases_router
from .documents_routes import router as documents_router
from .case_data_routes import router as case_data_router
from .ai_routes import router as ai_router
from .payments_routes import router as payments_router
from .calendar_routes import router as calendar_router
from .legal_routes import router as legal_router
from .courtlistener_routes import router as courtlistener_router
from .community_routes import router as community_router
from .export_routes import router as export_router
from .section1983_routes import router as section1983_router
from .podcast_routes import router as podcast_router
from .caselaw_routes import router as caselaw_router
from .ada_routes import router as ada_router
from .strategy_routes import router as strategy_router
from .case_memory_routes import router as case_memory_router

all_routers = [
    auth_router,
    admin_router,
    cases_router,
    documents_router,
    case_data_router,
    ai_router,
    payments_router,
    calendar_router,
    legal_router,
    courtlistener_router,
    community_router,
    export_router,
    section1983_router,
    podcast_router,
    caselaw_router,
    ada_router,
    strategy_router,
    case_memory_router,
]
