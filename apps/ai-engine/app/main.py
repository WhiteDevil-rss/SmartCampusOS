"""
FastAPI entrypoint for the AI Timetable Engine — v3.1.0
"""

import math
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models import GenerateRequest, GenerateResponse, ForecastRequest, ForecastResponse
from app.solver import TimetableScheduler
from app.predictor import calculate_forecast

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

app = FastAPI(title="AI Timetable Engine", version="11.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ai-engine",
        "solver": "ortools-cp-sat-v3.1.0",
        "version": "11.0.0",
        "features": [
            "constraint-satisfaction-opt",
            "predictive-resource-forecast",
            "elective-basket-sync",
            "gap-minimization",
            "realtime-solver-stats",
        ],
    }


# ─────────────────────────────────────────────────────────────────────────────
# Solve endpoint
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/solve", response_model=GenerateResponse)
def solve_timetable(req: GenerateRequest):
    """
    Main entry point for timetable generation.
    Uses OR-Tools CP-SAT solver for global optimization.
    """
    try:
        scheduler = TimetableScheduler(req)
        response = scheduler.solve()
        return response
    except Exception as exc:
        log.exception("Solver crashed: %s", exc)
        return GenerateResponse(
            status="ERROR",
            message=f"Internal solver error: {str(exc)}",
        )


# ─────────────────────────────────────────────────────────────────────────────
# Forecast endpoint
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/forecast", response_model=ForecastResponse)
def forecast_resource_usage(req: ForecastRequest):
    """
    Predictive resource management endpoint.
    Calculates overcrowding risks based on historical attendance patterns.
    """
    try:
        return calculate_forecast(req)
    except Exception as exc:
        log.exception("Forecaster failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
