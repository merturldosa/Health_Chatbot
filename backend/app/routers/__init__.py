from .auth import router as auth_router
from .chat import router as chat_router
from .health_records import router as health_records_router
from .medications import router as medications_router
from .mental_health import router as mental_health_router

__all__ = [
    "auth_router",
    "chat_router",
    "health_records_router",
    "medications_router",
    "mental_health_router",
]
