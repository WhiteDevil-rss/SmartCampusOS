"""
Pydantic models for the AI Timetable Engine v3.1.0
Backward-compatible: all new fields are Optional with safe defaults.
"""

from __future__ import annotations
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ─────────────────────────────────────────────────────────────────────────────
# Sub-models
# ─────────────────────────────────────────────────────────────────────────────

class FacultyAvailability(BaseModel):
    """A blocked (unavailable) time window for a faculty member."""
    dayOfWeek: int    # 1=Mon … 7=Sun
    slotNumber: int   # 1-indexed lecture slot within that day


class FacultySubject(BaseModel):
    courseId: str


class Faculty(BaseModel):
    id: str
    name: str
    subjects: List[FacultySubject] = []
    availability: List[FacultyAvailability] = []   # blocked slots


class Course(BaseModel):
    id: str
    code: str
    name: str
    type: str = "Theory"                           # Theory | Lab | Theory+Lab | Practical | Project
    weeklyHrs: int = 1
    program: Optional[str] = None
    semester: Optional[int] = None
    isElective: bool = False
    requiredRoomType: Optional[str] = None         # "Lab" | "Classroom" | None
    labDuration: int = 1                           # consecutive slots for lab (≥2 = lab block)
    credits: int = 4                               # NEW v8.0.0: used for session count calculation
    sessionTypeId: Optional[str] = None


class Batch(BaseModel):
    id: str
    name: str
    strength: int = 30
    program: Optional[str] = None
    semester: Optional[int] = None


class Resource(BaseModel):
    id: str
    name: str
    capacity: int
    type: str = "Classroom"                        # Classroom | Lab | Seminar | etc.


class TimeBlock(BaseModel):
    id: str
    name: str
    startTime: str
    endTime: str
    duration: int
    isBreak: bool = False

class SessionType(BaseModel):
    id: str
    name: str
    durationRule: int = 60
    roomTypeRequired: Optional[str] = None

class ScheduleConfig(BaseModel):
    startTime: str = "09:00"
    endTime: str = "17:00"
    lectureDuration: int = 60                      # minutes per slot
    breakDuration: int = 60                        # minutes per break
    numberOfBreaks: int = 1
    daysPerWeek: int = 5
    continuousMode: str = "balanced"               # "off" | "balanced" | "strict"
    useCustomBlocks: bool = False
    timeBlocks: List[TimeBlock] = []


# ─────────────────────────────────────────────────────────────────────────────
# Elective Basket Models
# ─────────────────────────────────────────────────────────────────────────────

class ElectiveSubgroup(BaseModel):
    """A capacity-split piece of an elective option (e.g. 90 students split into 60 and 30)."""
    subgroupId: str
    name: str
    enrollmentCount: int


class ElectiveOption(BaseModel):
    """One option within an elective basket (e.g. Blockchain, Python)."""
    optionId: str
    courseId: str
    enrollmentCount: int = 30                      # Total sub-batch head-count
    facultyId: Optional[str] = None                # preferred faculty if specified
    subgroups: List[ElectiveSubgroup] = []         # Splits for room capacities


class FacultyPair(BaseModel):
    faculty1Id: str
    faculty2Id: str
    dayOfWeek: int

class ElectiveBasket(BaseModel):
    """A group of parallel elective options sharing the SAME time slot."""
    basketId: str
    subjectCode: str                               # e.g. "204"
    name: str                                      # display name
    semester: Optional[int] = None
    program: Optional[str] = None
    weeklyHrs: int = 2
    divisionIds: List[str] = []                    # Parent batches (divisions) this basket belongs to
    options: List[ElectiveOption] = []
    facultyPairs: List[FacultyPair] = []           # NEW: rotating pairs


# ─────────────────────────────────────────────────────────────────────────────
# Slot models (locked / existing)
# ─────────────────────────────────────────────────────────────────────────────

class ExistingSlot(BaseModel):
    dayOfWeek: int
    slotNumber: int
    courseId: Optional[str] = None
    facultyId: Optional[str] = None
    roomId: Optional[str] = None
    batchId: Optional[str] = None
    isBreak: bool = False
    isLocked: bool = False                         # True = pin this slot, do not overwrite


# ─────────────────────────────────────────────────────────────────────────────
# Generate Request / Response
# ─────────────────────────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    faculty: List[Faculty] = []
    courses: List[Course] = []
    batches: List[Batch] = []
    resources: List[Resource] = []
    config: ScheduleConfig = Field(default_factory=ScheduleConfig)
    daysPerWeek: int = 5                           # alias kept for backward compat
    excludedDayIds: List[int] = []
    existingSlots: List[ExistingSlot] = []
    lockedSlots: List[ExistingSlot] = []           # alias for existingSlots

    # ── NEW v3.1 ──────────────────────────────────────────────────────────
    electiveBaskets: List[ElectiveBasket] = []
    sessionTypes: List[SessionType] = []


class SlotResult(BaseModel):
    dayOfWeek: int
    slotNumber: int
    startTime: str
    endTime: str
    courseId: Optional[str] = None
    courseName: Optional[str] = None
    courseCode: Optional[str] = None
    slotType: Optional[str] = None
    facultyId: Optional[str] = None
    facultyName: Optional[str] = None
    roomId: Optional[str] = None
    roomName: Optional[str] = None
    batchId: Optional[str] = None
    batchName: Optional[str] = None
    isBreak: bool = False
    # Elective metadata
    basketId: Optional[str] = None
    isElective: bool = False
    optionId: Optional[str] = None
    # NEW v4.0
    faculty2Id: Optional[str] = None
    blockId: Optional[str] = None
    sessionTypeId: Optional[str] = None


class GenerateResponse(BaseModel):
    status: str                                    # "OPTIMAL" | "FEASIBLE" | "INFEASIBLE" | "ERROR"
    message: str = ""
    slots: List[SlotResult] = []
    solveTimeMs: int = 0
    utilizationScore: float = 0.0
    # ── NEW v3.1 ──────────────────────────────────────────────────────────
    gapScore: float = 0.0                          # avg idle slots per batch per day (lower = better)
    electiveGroupCount: int = 0                    # number of elective baskets scheduled
    stats: Optional[Dict[str, Any]] = None         # NEW v8.0.0 mapping


# ─────────────────────────────────────────────────────────────────────────────
# Predictive / Forecasting Models
# ─────────────────────────────────────────────────────────────────────────────

class HistoricalAttendance(BaseModel):
    courseId: str
    dayOfWeek: int
    slotNumber: int
    attendancePercentage: float  # 0.0 to 1.0


class ResourceSnapshot(BaseModel):
    resourceId: str
    capacity: int
    currentAllocation: int


class ForecastRequest(BaseModel):
    departmentId: str
    slots: List[SlotResult]
    history: List[HistoricalAttendance] = []
    resources: List[ResourceSnapshot] = []


class ResourceRisk(BaseModel):
    slotId: str
    riskScore: float  # 0.0 (low) to 1.0 (high)
    reason: str
    predictedAttendance: int


class ForecastResponse(BaseModel):
    status: str = "SUCCESS"
    risks: List[ResourceRisk] = []
    overallEfficiency: float = 0.0


# ─────────────────────────────────────────────────────────────────────────────
# Synergy / Collaboration Models
# ─────────────────────────────────────────────────────────────────────────────

class FacultyResearchProfile(BaseModel):
    facultyId: str
    name: str
    department: str
    abstracts: List[str] = []
    keywords: List[str] = []


class SynergyMatch(BaseModel):
    targetFacultyId: str
    score: float                                   # 0.0 to 1.0
    sharedKeywords: List[str] = []
    reason: str                                    # Human-readable explanation


class SynergyRequest(BaseModel):
    sourceFacultyId: str
    profiles: List[FacultyResearchProfile]


class SynergyResponse(BaseModel):
    matches: List[SynergyMatch] = []
    clusters: Optional[Dict[str, List[str]]] = None # Optional groupings


# ─────────────────────────────────────────────────────────────────────────────
# Alumni & Placement Matching Models
# ─────────────────────────────────────────────────────────────────────────────

class AlumniProfile(BaseModel):
    studentId: str
    userId: str
    name: str
    department: str
    batch: str
    currentCompany: Optional[str] = None
    currentRole: Optional[str] = None
    skills: List[str] = []
    experience: List[Dict[str, str]] = [] # { company, role, duration }

class AlumniMatch(BaseModel):
    alumnusId: str
    alumnusUserId: str
    name: str
    score: float                            # 0.0 to 1.0
    commonSkills: List[str] = []
    matchReason: str                        # Human-readable explanation

class AlumniMatchRequest(BaseModel):
    studentId: str
    skills: List[str] = []
    interestAreas: List[str] = []
    alumniProfiles: List[AlumniProfile]

class AlumniMatchResponse(BaseModel):
    matches: List[AlumniMatch] = []
    topSkillsInDemand: List[str] = []


# ─────────────────────────────────────────────────────────────────────────────
# Inventory & Procurement Models
# ─────────────────────────────────────────────────────────────────────────────

class InventoryItemProfile(BaseModel):
    id: str
    name: str
    category: str
    currentStock: float
    minThreshold: float
    unit: str

class StockUsageHistory(BaseModel):
    itemId: str
    quantity: float
    timestamp: str # ISO string
    type: str     # OUT for usage

class InventoryForecast(BaseModel):
    itemId: str
    itemName: str
    daysUntilDepletion: int
    depletionDate: str # ISO string
    recommendedOrderQty: float
    riskLevel: str    # LOW | MEDIUM | HIGH | CRITICAL
    reasoning: str

class InventoryForecastRequest(BaseModel):
    items: List[InventoryItemProfile]
    usageHistory: List[StockUsageHistory] = []
    leadTimeDays: int = 7 # Default vendor lead time

class InventoryForecastResponse(BaseModel):
    status: str = "SUCCESS"
    forecasts: List[InventoryForecast] = []
    criticalSummary: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# Security & Emergency Intelligence Models
# ─────────────────────────────────────────────────────────────────────────────

class SecurityIncidentDetails(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    type: str
    location: Optional[str] = None
    severity: Optional[str] = "MEDIUM"

class SecurityIncidentAnalysis(BaseModel):
    incidentId: Optional[str] = None
    priority: int                   # 1 (Critical) to 10 (Low)
    summary: str                    # AI generated brief
    riskAssessment: str             # Deep analysis
    recommendation: str             # Next steps for security
    isEmergency: bool = False

class SecurityIntelligenceRequest(BaseModel):
    incidents: List[SecurityIncidentDetails]
    timeRangeDays: int = 7

class Hotspot(BaseModel):
    location: str
    incidentCount: int
    primaryThreat: str

class SecurityIntelligenceResponse(BaseModel):
    status: str = "SAFE"            # SAFE | ELEVATED | CRITICAL
    summary: str
    hotspots: List[Hotspot] = []
    trendAnalysis: str
    suggestedPatrolFocus: List[str] = []


# ─────────────────────────────────────────────────────────────────────────────
# Chat & Career Intelligence Models (v11.1.0)
# ─────────────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    context: Dict[str, Any] = {}

class ChatResponse(BaseModel):
    reply: str

class CareerAuditRequest(BaseModel):
    studentName: str
    program: str
    semester: int
    currentSgpa: float
    attendanceRate: float
    completedCourses: List[str] = []

class GrowthOrbitNode(BaseModel):
    phase: str
    focus: str
    badge: str

class CareerAuditResponse(BaseModel):
    careerTrack: str
    optimalityScore: float
    skillGap: List[str]
    nextMilestone: Dict[str, Any]
    growthOrbit: List[GrowthOrbitNode]
