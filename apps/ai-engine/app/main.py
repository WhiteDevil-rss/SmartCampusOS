"""
FastAPI entrypoint for the AI Timetable Engine — v3.1.0
"""

import math
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models import (
    GenerateRequest, 
    GenerateResponse, 
    ForecastRequest, 
    ForecastResponse,
    SynergyRequest,
    SynergyResponse,
    AlumniMatchRequest,
    AlumniMatchResponse,
    InventoryForecastResponse,
    SecurityIncidentDetails,
    SecurityIncidentAnalysis,
    SecurityIntelligenceRequest,
    SecurityIntelligenceResponse,
    ChatRequest,
    ChatResponse,
    CareerAuditRequest,
    CareerAuditResponse
)
from app.solver import TimetableScheduler
from app.predictor import calculate_forecast
from app.synergy import calculate_synergy
from app.alumni import match_student_to_alumni
from app.inventory import calculate_inventory_forecast
from app.security import analyze_security_incident, generate_security_intelligence
from app.chatbot import get_chatbot_response
from app.career_audit import perform_career_audit

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

# ── Metrics Store ────────────────────────────────────────────────────────────

class MetricsStore:
    def __init__(self):
        self.total_solves = 0
        self.avg_solve_time_ms = 0.0
        self.last_solve_time_ms = 0.0
        self.total_requests = 0
        self.errors = 0

    def record_solve(self, duration_ms: int):
        self.total_solves += 1
        self.last_solve_time_ms = duration_ms
        # Simple rolling average
        self.avg_solve_time_ms = (
            (self.avg_solve_time_ms * (self.total_solves - 1) + duration_ms) 
            / self.total_solves
        )

metrics = MetricsStore()

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
        "metrics": {
            "total_solves": metrics.total_solves,
            "avg_solve_time_ms": round(metrics.avg_solve_time_ms, 2),
            "last_solve_time_ms": metrics.last_solve_time_ms,
            "uptime_requests": metrics.total_requests,
            "error_count": metrics.errors
        },
        "features": [
            "constraint-satisfaction-opt",
            "predictive-resource-forecast",
            "elective-basket-sync",
            "gap-minimization",
            "realtime-solver-stats",
        ],
    }

@app.middleware("http")
async def track_metrics_middleware(request, call_next):
    metrics.total_requests += 1
    response = await call_next(request)
    if response.status_code >= 400:
        metrics.errors += 1
    return response


# ─────────────────────────────────────────────────────────────────────────────
# Solve endpoint
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/solve", response_model=GenerateResponse)
def solve_timetable(req: GenerateRequest):
    """
    Main entry point for timetable generation.
    Uses OR-Tools CP-SAT solver for global optimization.
    """
    import time
    start = time.time()
    try:
        scheduler = TimetableScheduler(req)
        response = scheduler.solve()
        
        duration_ms = int((time.time() - start) * 1000)
        metrics.record_solve(duration_ms)
        
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


# ─────────────────────────────────────────────────────────────────────────────
# Synergy endpoint
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/synergy", response_model=SynergyResponse)
def compute_synergy(req: SynergyRequest):
    """
    Research matchmaking endpoint.
    Calculates semantic similarity between faculty members' outputs.
    """
    try:
        return calculate_synergy(req)
    except Exception as exc:
        log.exception("Synergy calculation failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# ─────────────────────────────────────────────────────────────────────────────
# Alumni Match endpoint
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/match/alumni", response_model=AlumniMatchResponse)
def alumni_matching(req: AlumniMatchRequest):
    """
    Career matchmaking endpoint.
    Connects current students with relevant alumni based on skills and industry profile.
    """
    try:
        return match_student_to_alumni(req)
    except Exception as exc:
        log.exception("Alumni matching failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# ─────────────────────────────────────────────────────────────────────────────
# Inventory Forecast endpoint
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/inventory/forecast", response_model=InventoryForecastResponse)
def inventory_forecasting(req: InventoryForecastRequest):
    """
    Asset management endpoint.
    Predicts stock depletion and recommends procurement actions.
    """
    try:
        return calculate_inventory_forecast(req)
    except Exception as exc:
        log.exception("Inventory forecasting failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# ─────────────────────────────────────────────────────────────────────────────
# Security endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/security/analyze-incident", response_model=SecurityIncidentAnalysis)
def security_incident_analysis(req: SecurityIncidentDetails):
    """
    Analyzes a security incident report to determine priority and provide a summary.
    """
    try:
        return analyze_security_incident(req)
    except Exception as exc:
        log.exception("Security incident analysis failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))

@app.post("/security/generate-intelligence", response_model=SecurityIntelligenceResponse)
def security_intelligence_generation(req: SecurityIntelligenceRequest):
    """
    Generates campus-wide security intelligence from historical incidents.
    """
    try:
        return generate_security_intelligence(req)
    except Exception as exc:
        log.exception("Security intelligence generation failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


# ─────────────────────────────────────────────────────────────────────────────
# Assistant & Career Intelligence (v11.1.0)
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/chat", response_model=ChatResponse)
async def chat_assistant(req: ChatRequest):
    try:
        reply = await get_chatbot_response(req.message, req.context)
        return ChatResponse(reply=reply)
    except Exception as exc:
        log.exception("Chat failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))

@app.post("/career/audit", response_model=CareerAuditResponse)
async def career_audit(req: CareerAuditRequest):
    try:
        result = await perform_career_audit(req.model_dump())
        return CareerAuditResponse(**result)
    except Exception as exc:
        log.exception("Career audit failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))
