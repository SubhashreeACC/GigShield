"""Health check endpoint for the ML service."""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "gigshield-ml",
        "timestamp": datetime.utcnow().isoformat(),
    }
