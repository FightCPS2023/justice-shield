from .auth_routes import router as auth_router
from .ai_routes import router as ai_router
from .documents_routes import router as documents_router
from .cases_routes import router as cases_router
from .admin_routes import router as admin_router
from .payments_routes import router as payments_router
from .export_routes import router as export_router
from .porch_mode_routes import router as porch_mode_router
from .foia_routes import router as foia_router
from .lawsuit_architect_routes import router as lawsuit_architect_router
from .integrity_db_routes import router as integrity_db_router
from .immutable_vault_routes import router as immutable_vault_router
from .political_strike_routes import router as political_strike_router

all_routers = [
    auth_router,
    ai_router,
    documents_router,
    cases_router,
    admin_router,
    payments_router,
    export_router,
    porch_mode_router,
    foia_router,
    lawsuit_architect_router,
    integrity_db_router,
    immutable_vault_router,
    political_strike_router,
]
