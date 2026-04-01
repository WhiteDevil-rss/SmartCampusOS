"""
Security Intelligence and Incident Analysis Module
"""

from typing import List, Dict
from app.models import (
    SecurityIncidentDetails, 
    SecurityIncidentAnalysis, 
    SecurityIntelligenceRequest, 
    SecurityIntelligenceResponse,
    Hotspot
)

def analyze_security_incident(incident: SecurityIncidentDetails) -> SecurityIncidentAnalysis:
    """
    Analyzes a single security report to determine priority and provide an AI summary.
    """
    desc = incident.description.lower()
    title = incident.title.lower()
    
    # Priority logic (1=Highest, 10=Lowest)
    priority = 5
    is_emergency = False
    
    critical_keywords = ['fire', 'smoke', 'weapon', 'gun', 'knife', 'assault', 'explosion', 'bleeding', 'unconscious']
    high_keywords = ['theft', 'robbery', 'fight', 'violence', 'harassment', 'intrusion']
    
    if any(k in desc or k in title for k in critical_keywords):
        priority = 1
        is_emergency = True
    elif any(k in desc or k in title for k in high_keywords):
        priority = 3
    elif incident.severity == "HIGH":
        priority = 3
    elif incident.severity == "CRITICAL":
        priority = 1
        is_emergency = True

    # Mocked AI Response generation
    summary = f"Incident involving {incident.type} at {incident.location or 'Unknown'}. "
    if is_emergency:
        summary += "IMMEDIATE DISPATCH REQUIRED."
    else:
        summary += "Requires investigation."

    return SecurityIncidentAnalysis(
        incidentId=incident.id,
        priority=priority,
        summary=summary,
        riskAssessment="Potential escalation likely if not addressed." if is_emergency else "Contained situation.",
        recommendation="Deploy emergency response team immediately." if is_emergency else "Assign security officer for verification.",
        isEmergency=is_emergency
    )

def generate_security_intelligence(req: SecurityIntelligenceRequest) -> SecurityIntelligenceResponse:
    """
    Analyzes historical incidents to find trends and hotspots.
    """
    if not req.incidents:
        return SecurityIntelligenceResponse(
            status="SAFE",
            summary="No incidents reported in the given timeframe.",
            trendAnalysis="Stable safety levels."
        )

    # Count incidents per location
    location_counts: Dict[str, int] = {}
    type_counts: Dict[str, int] = {}
    
    for inc in req.incidents:
        loc = inc.location or "Unknown"
        location_counts[loc] = location_counts.get(loc, 0) + 1
        type_counts[inc.type] = type_counts.get(inc.type, 0) + 1

    # Find hotspots (locations with > 2 incidents)
    hotspots = [
        Hotspot(location=loc, incidentCount=count, primaryThreat="Theft/Vandalism")
        for loc, count in location_counts.items() if count >= 3
    ]

    status = "SAFE"
    if any(inc.severity in ["HIGH", "CRITICAL"] for inc in req.incidents):
        status = "CRITICAL"
    elif len(req.incidents) > 10:
        status = "ELEVATED"

    summary = f"Detected {len(req.incidents)} incidents across the campus. "
    if hotspots:
        summary += f"Critical attention needed at {len(hotspots)} hotspots."
    else:
        summary += "Incidents are scattered, no significant cluster detected."

    return SecurityIntelligenceResponse(
        status=status,
        summary=summary,
        hotspots=hotspots,
        trendAnalysis="Upward trend in minor reports." if len(req.incidents) > 5 else "Incident rate is stable.",
        suggestedPatrolFocus=[h.location for h in hotspots] if hotspots else ["Main Gate", "Library", "Hostels"]
    )
