from .auth import router as auth_router
from .chat import router as chat_router
from .health_records import router as health_records_router
from .medications import router as medications_router
from .mental_health import router as mental_health_router
from .mood_records import router as mood_records_router
from .meditation import router as meditation_router
from .music_therapy import router as music_therapy_router
from .meals import router as meals_router
from .sleep import router as sleep_router
from .disease import router as disease_router
from .pregnancy import router as pregnancy_router
from .voice_health import router as voice_health_router
from .health_schedule import router as health_schedule_router
from .emotion import router as emotion_router
from .speech import router as speech_router

__all__ = [
    "auth_router",
    "chat_router",
    "health_records_router",
    "medications_router",
    "mental_health_router",
    "mood_records_router",
    "meditation_router",
    "music_therapy_router",
    "meals_router",
    "sleep_router",
    "disease_router",
    "pregnancy_router",
    "voice_health_router",
    "health_schedule_router",
    "emotion_router",
    "speech_router",
]
