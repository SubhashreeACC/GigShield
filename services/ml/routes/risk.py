"""Risk scoring and premium suggestion endpoints with ML model support."""

from fastapi import APIRouter
from pydantic import BaseModel
from enum import Enum
import pickle
import os
import numpy as np

router = APIRouter()


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class RiskScoreRequest(BaseModel):
    city: str
    zone: str
    season: str  # "summer" | "monsoon" | "winter" | "spring"


class RiskScoreResponse(BaseModel):
    risk_score: float
    risk_level: RiskLevel
    confidence: float


class PremiumRequest(BaseModel):
    city: str
    zone: str
    risk_level: RiskLevel


class PremiumResponse(BaseModel):
    suggested_premium: int
    min_premium: int
    max_premium: int


# --- Load ML model if available ---
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
model = None
encoders = None

try:
    with open(os.path.join(MODEL_DIR, "risk_model.pkl"), "rb") as f:
        model = pickle.load(f)
    with open(os.path.join(MODEL_DIR, "encoders.pkl"), "rb") as f:
        encoders = pickle.load(f)
    print("✅ ML model loaded successfully")
except Exception:
    print("⚠️ ML model not found, using rule-based fallback")


# --- Fallback: Rule-based risk scoring ---
SEASON_RISK = {
    "summer": 0.7,    # High heat risk
    "monsoon": 0.85,  # Highest — rain + flooding
    "winter": 0.3,    # Low
    "spring": 0.4,    # Moderate
}

CITY_RISK = {
    "mumbai": 0.8,     # Flood-prone
    "delhi": 0.75,     # AQI + heat
    "bangalore": 0.5,  # Moderate
    "chennai": 0.65,   # Cyclone-prone
    "hyderabad": 0.55,
}

PREMIUM_TABLE = {
    RiskLevel.LOW: {"suggested": 29, "min": 20, "max": 50},
    RiskLevel.MEDIUM: {"suggested": 59, "min": 40, "max": 100},
    RiskLevel.HIGH: {"suggested": 99, "min": 80, "max": 150},
}


def predict_with_model(city: str, zone: str, season: str):
    """Use trained ML model for prediction."""
    try:
        le_city = encoders["city"]
        le_zone = encoders["zone"]
        le_season = encoders["season"]

        # Encode inputs (handle unknown labels gracefully)
        city_enc = le_city.transform([city.lower()])[0] if city.lower() in le_city.classes_ else 0
        zone_enc = le_zone.transform([zone.lower()])[0] if zone.lower() in le_zone.classes_ else 0
        season_enc = le_season.transform([season.lower()])[0] if season.lower() in le_season.classes_ else 0

        # Use average values for weather features (will be enhanced with real data later)
        features = np.array([[city_enc, zone_enc, season_enc, 15.0, 32.0, 150, 40, 0.4]])
        score = float(model.predict(features)[0])
        score = max(0.0, min(1.0, score))  # Clamp to [0, 1]
        return score, 0.85  # Higher confidence with ML model
    except Exception:
        return None, None


@router.post("/risk-score", response_model=RiskScoreResponse)
async def get_risk_score(req: RiskScoreRequest):
    """Calculate risk score for a city/zone/season combination."""

    # Try ML model first
    if model and encoders:
        ml_score, ml_confidence = predict_with_model(req.city, req.zone, req.season)
        if ml_score is not None:
            if ml_score >= 0.7:
                level = RiskLevel.HIGH
            elif ml_score >= 0.45:
                level = RiskLevel.MEDIUM
            else:
                level = RiskLevel.LOW

            return RiskScoreResponse(
                risk_score=round(ml_score, 3),
                risk_level=level,
                confidence=ml_confidence,
            )

    # Fallback: Rule-based
    season_factor = SEASON_RISK.get(req.season.lower(), 0.5)
    city_factor = CITY_RISK.get(req.city.lower(), 0.5)

    # Weighted combination
    score = round(0.6 * season_factor + 0.4 * city_factor, 3)

    if score >= 0.7:
        level = RiskLevel.HIGH
    elif score >= 0.45:
        level = RiskLevel.MEDIUM
    else:
        level = RiskLevel.LOW

    return RiskScoreResponse(
        risk_score=score,
        risk_level=level,
        confidence=0.78,  # Lower confidence with rule-based
    )


@router.post("/premium-suggest", response_model=PremiumResponse)
async def suggest_premium(req: PremiumRequest):
    """Suggest weekly premium based on risk level."""
    entry = PREMIUM_TABLE.get(req.risk_level, PREMIUM_TABLE[RiskLevel.MEDIUM])
    return PremiumResponse(
        suggested_premium=entry["suggested"],
        min_premium=entry["min"],
        max_premium=entry["max"],
    )
