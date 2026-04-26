"""
Backend Mastery — FastAPI Server Template (2026)
==================================================
Production-ready FastAPI application with middleware,
auth, database, validation, and structured logging.
"""

from contextlib import asynccontextmanager
from datetime import datetime
import logging
import uuid

from fastapi import FastAPI, Request, Response, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings


# ============================================
# CONFIGURATION
# ============================================
class Settings(BaseSettings):
    """App settings loaded from environment variables."""
    APP_NAME: str = "My API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/myapp"

    # Auth
    JWT_SECRET: str = "change-me-in-production-32-chars-min"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Redis
    REDIS_URL: str | None = None

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


# ============================================
# LOGGING
# ============================================
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(settings.APP_NAME)


# ============================================
# DATABASE (SQLAlchemy Async)
# ============================================
# from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
# from sqlalchemy.orm import DeclarativeBase
#
# engine = create_async_engine(settings.DATABASE_URL, pool_size=10, max_overflow=20)
# async_session = async_sessionmaker(engine, expire_on_commit=False)
#
# class Base(DeclarativeBase):
#     pass
#
# async def get_db() -> AsyncGenerator[AsyncSession, None]:
#     async with async_session() as session:
#         try:
#             yield session
#             await session.commit()
#         except Exception:
#             await session.rollback()
#             raise


# ============================================
# LIFESPAN (startup/shutdown)
# ============================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    # await engine.connect()  # Test DB connection
    yield
    # Shutdown
    logger.info("Shutting down...")
    # await engine.dispose()


# ============================================
# FASTAPI APP
# ============================================
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-ready API built with FastAPI",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)


# ============================================
# MIDDLEWARE
# ============================================

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
    max_age=86400,
)

# Trusted Host
# app.add_middleware(TrustedHostMiddleware, allowed_hosts=["example.com", "*.example.com"])


# Request ID + Logging middleware
@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    request.state.request_id = request_id

    start_time = datetime.now()
    response: Response = await call_next(request)
    duration = (datetime.now() - start_time).total_seconds() * 1000

    response.headers["X-Request-Id"] = request_id
    response.headers["X-Response-Time"] = f"{duration:.2f}ms"

    logger.info(
        f"{request.method} {request.url.path} "
        f"{response.status_code} {duration:.1f}ms "
        f"[{request_id[:8]}]"
    )

    return response


# ============================================
# EXCEPTION HANDLERS
# ============================================
class ErrorResponse(BaseModel):
    status: str = "error"
    error: dict


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "error": {
                "code": exc.detail if isinstance(exc.detail, str) else "HTTP_ERROR",
                "message": str(exc.detail),
            },
            "requestId": getattr(request.state, "request_id", None),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error": {
                "code": "INTERNAL_ERROR",
                "message": str(exc) if settings.DEBUG else "Internal server error",
            },
            "requestId": getattr(request.state, "request_id", None),
        },
    )


# ============================================
# SCHEMAS (Pydantic v2)
# ============================================
class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str
    uptime: float | None = None


class SuccessResponse(BaseModel):
    status: str = "success"
    data: dict | list | None = None
    message: str | None = None


class PaginationMeta(BaseModel):
    total: int
    page: int
    limit: int
    total_pages: int = Field(alias="totalPages")
    has_next: bool = Field(alias="hasNext")
    has_prev: bool = Field(alias="hasPrev")

    class Config:
        populate_by_name = True


# ============================================
# ROUTES
# ============================================

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": settings.APP_VERSION,
    }


@app.get("/api/v1", tags=["API"])
async def api_root():
    """API root — returns version and docs link."""
    return {
        "status": "success",
        "message": f"{settings.APP_NAME} is running",
        "version": "v1",
        "docs": "/docs",
    }


# ============================================
# EXAMPLE CRUD MODULE (Users)
# ============================================
# from pydantic import EmailStr
#
# class CreateUserRequest(BaseModel):
#     name: str = Field(min_length=2, max_length=100)
#     email: EmailStr
#     password: str = Field(min_length=8, max_length=128)
#
# class UserResponse(BaseModel):
#     id: str
#     name: str
#     email: str
#     role: str
#     created_at: datetime
#
#     class Config:
#         from_attributes = True
#
# @app.post("/api/v1/users", response_model=SuccessResponse, status_code=201, tags=["Users"])
# async def create_user(data: CreateUserRequest, db: AsyncSession = Depends(get_db)):
#     """Create a new user."""
#     user = User(name=data.name, email=data.email)
#     user.set_password(data.password)
#     db.add(user)
#     await db.flush()
#     return {"status": "success", "data": UserResponse.from_orm(user).dict()}


# ============================================
# RUN (for development)
# ============================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info",
        access_log=False,  # We handle logging in middleware
    )
