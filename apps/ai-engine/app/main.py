"""
FastAPI entrypoint for the AI Timetable Engine — v3.1.0
"""

import math
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models import GenerateRequest, GenerateResponse
from app.engine import generate

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

app = FastAPI(title="AI Timetable Engine", version="8.0.0")
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
        "solver": "Standard Lib Greedy CSP",
        "version": "8.0.0",
        "features": [
            "credit-based-slot-calculation",
            "multi-faculty-rotation",
            "timeline-config",
            "preflight-capacity-checks",
            "json-csv-output",
        ],
    }


# ─────────────────────────────────────────────────────────────────────────────
# Solve endpoint
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/solve", response_model=GenerateResponse)
def solve_timetable(req: GenerateRequest):
    try:
        # 1. Convert Pydantic request to dictionary
        # The new engine expects a flat dict or a { "data": ... } structure.
        # We'll pass it the whole thing as a dict.
        payload = req.dict()
        
        # 2. Call the new engine
        result = generate(payload)
        
        # 3. Map result to GenerateResponse
        # Note: 'slots' in GenerateResponse expects 'SlotResult' objects.
        # The engine's result['slots'] already matches most fields.
        
        return GenerateResponse(
            status=result["status"],
            message=result["message"],
            slots=result["slots"],
            stats=result["stats"]
        )
    except Exception as exc:
        log.exception("Solver crashed: %s", exc)
        return GenerateResponse(
            status="ERROR",
            message=f"Internal solver error: {str(exc)}",
        )
