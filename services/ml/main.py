"""
GigShield ML Service
AI/ML microservice for risk scoring and premium suggestion.
Built with FastAPI + Scikit-learn.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from datetime import datetime

from routes.health import router as health_router
from routes.risk import router as risk_router

load_dotenv()

app = FastAPI(
    title="GigShield ML Service",
    description="Risk scoring and premium suggestion microservice",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],  # Allow requests from Fastify API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/ml")
app.include_router(risk_router, prefix="/ml")
