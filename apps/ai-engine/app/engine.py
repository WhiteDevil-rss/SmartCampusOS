import math
import logging
import json
import sys
from collections import defaultdict
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional, Any

log = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
@dataclass
class ScheduleConfig:
    opening_time:         str       = "09:00"
    closing_time:         str       = "17:00"
    lecture_duration:     int       = 60        # minutes per slot
    short_break_duration: int       = 0        # minutes; 0 = disabled
    short_break_after:    int       = 0         # lectures between short breaks; 0 = disabled
    lunch_start:          str       = "12:30"
    lunch_end:            str       = "13:00"
    days_per_week:        int       = 6
    day_names:            List[str] = field(
        default_factory=lambda: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    )

    @classmethod
    def from_dict(cls, raw: Dict) -> "ScheduleConfig":
        cfg = raw.get("config", raw)
        return cls(
            opening_time         = cfg.get("openingTime",         cfg.get("startTime",       "09:00")),
            closing_time         = cfg.get("closingTime",         cfg.get("endTime",         "17:00")),
            lecture_duration     = int(cfg.get("lectureDuration",     60)),
            short_break_duration = int(cfg.get("shortBreakDuration",  10)),
            short_break_after    = int(cfg.get("shortBreakAfter",     2)),
            lunch_start          = cfg.get("lunchStart",          cfg.get("lunchBreakStart", "12:30")),
            lunch_end            = cfg.get("lunchEnd",            cfg.get("lunchBreakEnd",   "13:00")),
            days_per_week        = int(cfg.get("daysPerWeek",     5)),
        )

# ─────────────────────────────────────────────────────────────────────────────
KIND_LECTURE = "lecture"
KIND_SHORT   = "short_break"
KIND_LUNCH   = "lunch"

LAB_TYPES  = {"lab", "practical"}
LAB_AND_THEORY = {"theory+lab"}
PROJ_TYPES = {"project"}

# ─────────────────────────────────────────────────────────────────────────────
def credits_to_sessions(course: Dict, lecture_duration_min: int) -> Tuple[int, int]:
    """
    Return (theory_sessions, lab_sessions) per week.
    """
    credits  = int(course.get("credits") or 0)
    wh       = int(course.get("weeklyHrs") or course.get("weeklyHours") or 0)
    lab_dur  = int(course.get("labDuration") or 0) or lecture_duration_min
    ctype    = course.get("type", "Theory").lower().strip()
    block_hrs = lecture_duration_min / 60

    # Choose credit source: prefer credits, fall back to weeklyHrs
    credit_src = credits if credits > 0 else wh
    if credit_src == 0:
        credit_src = 2   # absolute default

    if ctype in PROJ_TYPES:
        return max(1, math.ceil(wh / block_hrs)), 0

    if ctype in LAB_TYPES:
        ld_hrs = lab_dur / 60
        return 0, max(1, math.ceil(wh / ld_hrs))

    if ctype in LAB_AND_THEORY:
        theory_n  = max(1, math.ceil(credit_src / block_hrs))
        # Lab component = hours beyond the credit hours
        lab_hrs   = max(0, wh - credits) if credits > 0 else 0
        if lab_hrs > 0:
            lab_n = max(1, math.ceil(lab_hrs / (lab_dur / 60)))
        else:
            lab_n = 1   # always at least one lab block for Theory+Lab
        return theory_n, lab_n

    # Pure Theory (default)
    return max(1, math.ceil(credit_src / block_hrs)), 0

# ─────────────────────────────────────────────────────────────────────────────
def _tomin(t: str) -> int:
    h, m = map(int, t.split(":")); return h * 60 + m

def _tostr(m: int) -> str:
    return f"{m // 60:02d}:{m % 60:02d}"


def build_timeline(cfg: ScheduleConfig) -> List[Dict]:
    open_m   = _tomin(cfg.opening_time)
    close_m  = _tomin(cfg.closing_time)
    lunch_s  = _tomin(cfg.lunch_start)
    lunch_e  = _tomin(cfg.lunch_end)
    ld       = cfg.lecture_duration
    sb       = cfg.short_break_duration
    sba      = cfg.short_break_after

    slots:    List[Dict] = []
    sn        = 1
    cur       = open_m
    lsb       = 0        # lectures since last short break
    lunch_done = False

    while True:
        if not lunch_done and cur >= lunch_s:
            slots.append({"slot_number": sn, "kind": KIND_LUNCH,
                           "start": _tostr(max(cur, lunch_s)), "end": _tostr(lunch_e),
                           "is_break": True, "label": "Lunch break"})
            sn += 1; cur = lunch_e; lunch_done = True; lsb = 0
            continue

        if not lunch_done and cur + ld > lunch_s:
            slots.append({"slot_number": sn, "kind": KIND_LUNCH,
                           "start": _tostr(lunch_s), "end": _tostr(lunch_e),
                           "is_break": True, "label": "Lunch break"})
            sn += 1; cur = lunch_e; lunch_done = True; lsb = 0
            continue

        if cur + ld > close_m:
            break

        slots.append({"slot_number": sn, "kind": KIND_LECTURE,
                       "start": _tostr(cur), "end": _tostr(cur + ld),
                       "is_break": False, "label": f"Slot {sn}"})
        sn += 1; cur += ld; lsb += 1

        if sba > 0 and sb > 0 and lsb >= sba:
            sb_end = cur + sb
            if (not lunch_done and sb_end > lunch_s) or sb_end > close_m:
                pass  # skip
            else:
                slots.append({"slot_number": sn, "kind": KIND_SHORT,
                               "start": _tostr(cur), "end": _tostr(sb_end),
                               "is_break": True, "label": "Short break"})
                sn += 1; cur = sb_end; lsb = 0

    return slots


def lecture_slots(tl: List[Dict]) -> List[Dict]:
    return [s for s in tl if s["kind"] == KIND_LECTURE]

def break_slots(tl: List[Dict]) -> List[Dict]:
    return [s for s in tl if s["is_break"]]

# ─────────────────────────────────────────────────────────────────────────────
def assign_faculty_to_batches(batches: List[Dict], all_fac: List[Dict]) -> List[Tuple[Dict, Dict]]:
    n = len(all_fac)
    return [(b, all_fac[i % n]) for i, b in enumerate(batches)]

class TimetableScheduler:
    def __init__(self, cfg: ScheduleConfig, timeline: List[Dict], resources: List[Dict], existing_slots: List[Dict] = None):
        self.cfg        = cfg
        self.timeline   = timeline
        self.lec_slots  = lecture_slots(timeline)
        self.days       = list(range(1, cfg.days_per_week + 1))
        self.resources  = resources or [
            {"id": "_default", "name": "Main Room", "type": "Classroom", "capacity": 999}
        ]
        self._fac_busy:   Dict[Tuple, bool] = {}
        self._batch_busy: Dict[Tuple, bool] = {}
        self._room_busy:  Dict[Tuple, bool] = {}
        self._cb_days:    Dict[str, set]    = defaultdict(set)
        self.placed:  List[Dict] = []
        self.failed:  List[str]  = []

        # Pre-fill busy tables from existing/locked slots
        if existing_slots:
            for s in existing_slots:
                d, sl = s.get("dayOfWeek"), s.get("slotNumber")
                if not d or not sl: continue
                if s.get("facultyId"): self._fac_busy[(d, sl, s["facultyId"])] = True
                if s.get("batchId"):   self._batch_busy[(d, sl, s["batchId"])] = True
                if s.get("roomId"):    self._room_busy[(d, sl, s["roomId"])] = True

    def _free(self, day: int, slot: int,
              fac_id: str, fac2_id: Optional[str],
              batch_id: str, room_id: str) -> bool:
        if self._fac_busy.get((day, slot, fac_id)):
            return False
        if fac2_id and self._fac_busy.get((day, slot, fac2_id)):
            return False
        if self._batch_busy.get((day, slot, batch_id)):
            return False
        if self._room_busy.get((day, slot, room_id)):
            return False
        return True

    def _book(self, day: int, slot: int,
              fac_id: str, fac2_id: Optional[str],
              batch_id: str, room_id: str):
        self._fac_busy[(day, slot, fac_id)] = True
        if fac2_id:
            self._fac_busy[(day, slot, fac2_id)] = True
        self._batch_busy[(day, slot, batch_id)] = True
        self._room_busy[(day, slot, room_id)] = True

    def block_faculty(self, fac_id: str, availability: Dict):
        """
        Block faculty based on their availability map: { "1": [1, 2], "5": [1] }
        """
        if not availability: return
        for day_str, slots in availability.items():
            try:
                d = int(day_str)
                for sl in slots:
                    self._fac_busy[(d, sl, fac_id)] = True
            except (ValueError, TypeError):
                continue

    def _score(self, day: int, si: int,
               cid: str, bid: str, stype: str) -> int:
        s = si * 5                                            # SO2: earlier slots
        if day in self._cb_days.get(f"{cid}|{bid}", set()):
            s += 200                                          # SO3: spread across days
        if stype == "Project" and day <= max(1, self.cfg.days_per_week - 2):
            s += 80                                           # SO4: projects → end of week
        return s

    def _pick_rooms(self, stype: str, strength: int) -> List[Dict]:
        is_lab = stype in ("Lab", "Practical")
        ok = [
            r for r in self.resources
            if r["capacity"] >= strength
            and ("lab" in r["type"].lower() if is_lab else "lab" not in r["type"].lower())
        ]
        if not ok:
            ok = [r for r in self.resources if r["capacity"] >= strength]
        if not ok:
            ok = sorted(self.resources, key=lambda r: -r["capacity"])
        return sorted(ok, key=lambda r: abs(r["capacity"] - strength))

    def place(self, course: Dict, batch: Dict,
              fac_id: str, fac_name: str,
              stype: str,
              fac2_id: Optional[str] = None,
              fac2_name: Optional[str] = None,
              is_elective: bool = False,
              basket_id: str = None) -> bool:
        rooms = self._pick_rooms(stype, batch.get("strength", 30))
        fname = fac_name if not fac2_name else f"{fac_name} / {fac2_name}"

        cands = sorted(
            (self._score(d, si, course["id"], batch["id"], stype), d, si)
            for d in self.days
            for si in range(len(self.lec_slots))
        )

        for _, day, si in cands:
            slot = self.lec_slots[si]["slot_number"]
            for room in rooms:
                if self._free(day, slot, fac_id, fac2_id, batch["id"], room["id"]):
                    self._book(day, slot, fac_id, fac2_id, batch["id"], room["id"])
                    self._cb_days[f"{course['id']}|{batch['id']}"].add(day)
                    sl = self.lec_slots[si]
                    self.placed.append({
                        "dayOfWeek":   day,
                        "dayName":     self.cfg.day_names[day - 1],
                        "slotNumber":  slot,
                        "startTime":   sl["start"],
                        "endTime":     sl["end"],
                        "courseId":    course["id"],
                        "courseCode":  course.get("code", "?"),
                        "courseName":  course.get("name", ""),
                        "credits":     course.get("credits", 0),
                        "slotType":    stype,
                        "facultyId":   fac_id,
                        "faculty2Id":  fac2_id,
                        "facultyName": fname,
                        "roomId":      room["id"],
                        "roomName":    room["name"],
                        "batchId":     batch["id"],
                        "batchName":   batch["name"],
                        "isBreak":     False,
                        "isElective":  is_elective,
                        "basketId":    basket_id
                    })
                    return True
        return False

        desc = (f"{course.get('code','?')} ({stype}) → {batch['name']} "
                f"[{fac_name}] credits={course.get('credits',0)}")
        self.failed.append(desc)
        log.warning("FAILED: %s", desc)
        return False

    def add_breaks(self):
        for d in self.days:
            for sl in break_slots(self.timeline):
                self.placed.append({
                    "dayOfWeek":   d,
                    "dayName":     self.cfg.day_names[d - 1],
                    "slotNumber":  sl["slot_number"],
                    "startTime":   sl["start"],
                    "endTime":     sl["end"],
                    "isBreak":     True,
                    "kind":        sl["kind"],
                    "label":       sl["label"],
                    "courseId":    None, "courseCode": None, "courseName":  None,
                    "credits":     None, "slotType":   None, "facultyId":   None,
                    "faculty2Id":  None, "facultyName": None, "roomId":     None,
                    "roomName":    None, "batchId":    None, "batchName":   None,
                })

# ─────────────────────────────────────────────────────────────────────────────
def _parse_faculty(d: Dict) -> List[Dict]:
    tbl: Dict[str, List[str]] = defaultdict(list)
    for fs in d.get("facultySubjects", []):
        fid, cid = fs.get("facultyId"), fs.get("courseId")
        if fid and cid:
            tbl[fid].append(cid)
    result = []
    for f in d.get("faculty") or d.get("faculties") or []:
        inline   = [(s["courseId"] if isinstance(s, dict) else s) for s in f.get("subjects", [])]
        from_tbl = tbl.get(f["id"], [])
        result.append({
            "id":       f["id"],
            "name":     f.get("name", "Faculty"),
            "subjects": list(dict.fromkeys(inline + from_tbl)),
        })
    return result


def _auto_assign(faculty: List[Dict], courses: List[Dict]) -> None:
    ne = [c for c in courses if not c.get("isElective")]
    for i, c in enumerate(ne):
        f = faculty[i % len(faculty)]
        if c["id"] not in f["subjects"]:
            f["subjects"].append(c["id"])
    log.warning("[AutoAssign] %d courses → %d faculty (round-robin)", len(ne), len(faculty))


def generate(raw: Dict) -> Dict:
    d   = raw.get("data", raw)
    cfg = ScheduleConfig.from_dict(raw)

    batches = [{
        "id":       b["id"],
        "name":     b.get("name", "Batch"),
        "program":  b.get("program", ""),
        "semester": b.get("semester"),
        "strength": int(b.get("strength") or b.get("totalStudents") or 30),
    } for b in d.get("batches", [])]

    courses = [{
        "id":         c["id"],
        "code":       c.get("code", "?"),
        "name":       c.get("name", ""),
        "type":       c.get("type", "Theory"),
        "credits":    int(c.get("credits") or 0),
        "weeklyHrs":  int(c.get("weeklyHrs") or c.get("weeklyHours") or 0),
        "labDuration": int(c.get("labDuration") or 0),
        "program":    c.get("program", ""),
        "semester":   c.get("semester"),
        "isElective": bool(c.get("isElective")),
    } for c in d.get("courses", [])]

    resources = [{
        "id":       r["id"],
        "name":     r.get("name", "Room"),
        "type":     r.get("type", "Classroom"),
        "capacity": int(r.get("capacity") or 60),
    } for r in (d.get("resources") or d.get("rooms") or [])]

    faculty = _parse_faculty(d)
    if not faculty:
        return {"status": "ERROR", "message": "No faculty found in JSON."}
    if not any(f["subjects"] for f in faculty):
        _auto_assign(faculty, courses)

    # 1. Create lookup for faculty and their availability
    fac_by_id:     Dict[str, Dict] = {f["id"]: f for f in faculty}
    fac_by_course: Dict[str, List[Dict]] = defaultdict(list)
    for f in faculty:
        for cid in f["subjects"]:
            fac_by_course[cid].append(f)

    # 2. Logic for elective baskets
    baskets = []
    for bk in d.get("electiveBaskets", []):
        opt_data = []
        for opt in bk.get("options", []):
            cid = opt.get("courseId")
            fid = opt.get("facultyId")
            # Fallback for faculty if not provided in option
            if not fid:
                pot = fac_by_course.get(cid, [])
                if pot: fid = pot[0]["id"]
            
            if cid:
                opt_data.append({
                    "courseId": cid,
                    "facultyId": fid,
                    "enrollment": int(opt.get("enrollmentCount") or 0)
                })
        
        if opt_data:
            baskets.append({
                "id": bk.get("basketId") or bk.get("id"),
                "name": bk.get("name", "Elective Basket"),
                "weeklyHrs": int(bk.get("weeklyHrs") or 0),
                "divisionIds": bk.get("divisionIds") or [],
                "options": opt_data
            })

    timeline  = build_timeline(cfg)
    lec_count = len(lecture_slots(timeline))
    total_wk  = lec_count * cfg.days_per_week

    warnings: List[str] = []
    # (Simple capacity check omitted for brevity, but could be added back)

    # 3. Build sessions to schedule
    sessions: List[Dict] = []
    
    # A. Regular courses
    for c in courses:
        if c["isElective"]: continue
        all_fac = fac_by_course.get(c["id"], [])
        if not all_fac: continue

        matched = [b for b in batches
                   if (not c["program"] or not b["program"] or c["program"] == b["program"])
                   and (not c["semester"] or not b["semester"] or str(c["semester"]) == str(b["semester"]))]
        
        theory_n, lab_n = credits_to_sessions(c, cfg.lecture_duration)
        ct = c["type"].lower().strip()
        
        for batch, fac in assign_faculty_to_batches(matched, all_fac):
            fid, fname = fac["id"], fac["name"]
            if ct in LAB_TYPES:
                for _ in range(lab_n):
                    sessions.append(dict(course=c, batch=batch, fac_id=fid, fac_name=fname, stype="Lab", pri=0))
            elif ct in PROJ_TYPES:
                for _ in range(theory_n):
                    sessions.append(dict(course=c, batch=batch, fac_id=fid, fac_name=fname, stype="Project", pri=2))
            else:
                for _ in range(theory_n):
                    sessions.append(dict(course=c, batch=batch, fac_id=fid, fac_name=fname, stype="Theory", pri=1))
                for _ in range(lab_n):
                    sessions.append(dict(course=c, batch=batch, fac_id=fid, fac_name=fname, stype="Lab", pri=0))

    # B. Elective Baskets (converted to virtual courses for scheduling)
    for bk in baskets:
        # Schedule the basket for each assigned division
        matched_batches = [b for b in batches if b["id"] in bk["divisionIds"]]
        if not matched_batches: continue
        
        # Calculate session count (assume theory)
        n_sessions = math.ceil(bk["weeklyHrs"] * 60 / cfg.lecture_duration)
        
        for batch in matched_batches:
            for _ in range(n_sessions):
                # We'll schedule based on the first option's faculty/course primarily
                # Complex multi-room booking for electives is handled by a special 'place' call
                opt0 = bk["options"][0]
                c_data = next((c for c in courses if c["id"] == opt0["courseId"]), {"id": opt0["courseId"]})
                f_data = fac_by_id.get(opt0["facultyId"], {"id": opt0["facultyId"], "name": "Faculty"})
                
                sessions.append({
                    "course": c_data,
                    "batch": batch,
                    "fac_id": f_data["id"],
                    "fac_name": f_data.get("name", "Faculty"),
                    "stype": "Theory",
                    "pri": 1,
                    "is_elective": True,
                    "basket_id": bk["id"]
                })

    sessions.sort(key=lambda s: (s["pri"], -s["course"].get("credits", 0)))

    # 4. Initialize Scheduler
    sched = TimetableScheduler(cfg, timeline, resources, existing_slots=d.get("existingSlots") or d.get("lockedSlots"))
    
    # Apply faculty availability
    for f in faculty:
        if f.get("availability"):
            sched.block_faculty(f["id"], f["availability"])

    # 5. Place sessions
    for sess in sessions:
        ok = sched.place(
            course=sess["course"], 
            batch=sess["batch"], 
            fac_id=sess["fac_id"], 
            fac_name=sess["fac_name"], 
            stype=sess["stype"],
            is_elective=sess.get("is_elective", False),
            basket_id=sess.get("basket_id")
        )
        if not ok:
            sched.failed.append(f"{sess['course'].get('code','?')} for {sess['batch']['name']}")
    sched.add_breaks()

    n_placed = len([s for s in sched.placed if not s["isBreak"]])
    n_fail   = len(sched.failed)
    n_total  = len(sessions)
    status   = ("OPTIMAL" if n_fail == 0 else "FEASIBLE" if n_placed > 0 else "INFEASIBLE")

    return {
        "status":  status,
        "message": f"{n_placed}/{n_total} placed." + (f" {n_fail} failed." if n_fail else ""),
        "config": {
            "openingTime":        cfg.opening_time,
            "closingTime":        cfg.closing_time,
            "lectureDuration":    cfg.lecture_duration,
            "shortBreakDuration": cfg.short_break_duration,
            "shortBreakAfter":    cfg.short_break_after,
            "lunchStart":         cfg.lunch_start,
            "lunchEnd":           cfg.lunch_end,
            "daysPerWeek":        cfg.days_per_week,
        },
        "timeline":          timeline,
        "slots":             sched.placed,
        "failed":            sched.failed,
        "preflightWarnings": warnings,
        "stats": {
            "placed":             n_placed,
            "total":              n_total,
            "failed":             n_fail,
            "lectureSlotsPerDay": lec_count,
            "slotsPerWeek":       total_wk,
            "batches":            len(batches),
            "courses":            len(courses),
            "faculty":            len(faculty),
            "rooms":              len(resources),
        },
    }
