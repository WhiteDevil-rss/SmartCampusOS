"""
Predictive Resource Management - SmartCampus OS v1.0
Calculates over-crowding risk and Predicted Attendance.
"""

from typing import List, Dict, Any
from app.models import ForecastRequest, ForecastResponse, ResourceRisk, ResourceSnapshot, HistoricalAttendance, SlotResult

def calculate_forecast(req: ForecastRequest) -> ForecastResponse:
    """
    Core forecasting logic.
    - Matches historical attendance % by course, day, and slot.
    - Compares predicted headcount with room capacity.
    - Identifies 'High Risk' (Overcrowding) and 'Low Efficiency' (Under-utilized) slots.
    """
    risks: List[ResourceRisk] = []
    
    # Pre-map history for O(1) lookup: (courseId, day, slot) -> attendance %
    history_map: Dict[str, float] = {}
    for h in req.history:
        key = f"{h.courseId}_{h.dayOfWeek}_{h.slotNumber}"
        history_map[key] = h.attendancePercentage
        
    # Pre-map resources: resourceId -> capacity
    resource_map: Dict[str, int] = {r.resourceId: r.capacity for r in req.resources}
    
    total_slots = 0
    over_capacity_slots = 0
    
    for slot in req.slots:
        if slot.isBreak or not slot.courseId or not slot.roomId:
            continue
            
        total_slots += 1
        key = f"{slot.courseId}_{slot.dayOfWeek}_{slot.slotNumber}"
        
        # Default attendance: 85% if no history exists
        att_pct = history_map.get(key, 0.85)
        
        # Predicted Headcount = Resource Allocation * Historical Attendance %
        # In this project, 'allocation' isn't explicitly defined in models yet,
        # but we can assume predicted attendance is derived from batch strength/history.
        # Since 'SlotResult' doesn't have batch strength, we look it up or use a proxy.
        
        # For simplicity, predicted headcount = History or default
        # If no history, we assume 90% of capacity for lack of better data.
        capacity = resource_map.get(slot.roomId, 50)
        predicted_attendance = int(capacity * att_pct)
        
        risk_score = 0.0
        reason = "Optimal"
        
        # Risk Calculation:
        if predicted_attendance > capacity:
            risk_score = min(1.0, (predicted_attendance - capacity) / capacity + 0.5)
            reason = "High Overcrowding Risk"
            over_capacity_slots += 1
        elif predicted_attendance < (capacity * 0.3):
            risk_score = 0.3
            reason = "Low Resource Efficiency (Under-utilized)"
        
        risks.append(ResourceRisk(
            slotId=f"{slot.dayOfWeek}_{slot.slotNumber}_{slot.batchId or 'global'}",
            riskScore=risk_score,
            reason=reason,
            predictedAttendance=predicted_attendance
        ))
        
    efficiency = 0.0
    if total_slots > 0:
        efficiency = round(1.0 - (over_capacity_slots / total_slots), 2)
        
    return ForecastResponse(
        status="SUCCESS",
        risks=risks,
        overallEfficiency=efficiency
    )
