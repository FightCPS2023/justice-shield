"""
THE CPS PUNISHER - Backend API Server
Child Protective Services Case Defense Platform
AI-powered legal document analysis, defense strategy generation, court research

VERSION 5.0 - MODULAR ARCHITECTURE
Routes split into separate modules for maintainability.
"""

import os
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.gzip import GZipMiddleware
from starlette.responses import Response
from dotenv import load_dotenv

from database import init_db, close_db, get_db
from routes import all_routers

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="The CPS Punisher API",
    description="AI-powered Child Protective Services case defense platform - Full Feature Set",
    version="5.0.0",
    lifespan=lifespan
)


# CORS middleware
@app.middleware("http")
async def cors_middleware(request, call_next):
    origin = request.headers.get("origin", "*")
    if request.method == "OPTIONS":
        response = Response(status_code=200)
        response.headers["Access-Control-Allow-Origin"] = origin if origin != "*" else "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-Session-ID"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Max-Age"] = "86400"
        return response
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = origin if origin != "*" else "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-Session-ID"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

app.add_middleware(GZipMiddleware, minimum_size=500)


# Include all route modules
for router in all_routers:
    app.include_router(router)


# System endpoints (kept in server.py as they reference app directly)
@app.get("/health")
async def kubernetes_health_probe():
    return {"status": "healthy"}


@app.get("/api")
@app.post("/api")
async def api_root():
    return {
        "service": "CPS Punisher API",
        "status": "operational",
        "version": "5.0.0",
        "docs": "/docs"
    }


@app.get("/api/user/")
async def api_user_root():
    return {"status": "ok", "endpoint": "user"}


@app.get("/api-docs/swagger.json")
async def swagger_json_docs():
    return app.openapi()


@app.get("/api/swagger.json")
async def api_swagger_json():
    return app.openapi()


@app.post("/api/graphql")
@app.post("/api/gql")
async def graphql_not_supported():
    return {
        "error": "GraphQL not supported",
        "message": "This is a REST API. See /docs for available endpoints.",
        "docs": "/docs"
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CPS Punisher API",
        "version": "5.0.0",
        "features": "Smart Research Engine | Smart Doc Generator | AI Defense | 50-State Coverage",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/stats")
async def get_stats():
    db = get_db()
    return {
        "total_users": await db.users.count_documents({}),
        "total_cases": await db.cases.count_documents({}),
        "total_documents": await db.documents.count_documents({}),
        "total_violations": await db.violations.count_documents({}),
        "states_covered": 50,
        "features": 150
    }
