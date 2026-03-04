"""
AI Timetable Scheduling Engine v3.1.0
Enhanced with:
  • Elective Basket Scheduling (HC12) — all options in a basket fire at same (day, slot)
  • Gap Minimization (SO5) — compact daily schedules; penalises idle slots per batch per day
  • Smart variable-space pre-filtering
  • 12 hard constraints + 5 soft objectives
"""

from __future__ import annotations

import math
import logging
import itertools
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set, Tuple

from ortools.sat.python import cp_model

from app.models import (
    GenerateRequest, SlotResult, GenerateResponse,
    ElectiveBasket, Faculty, Batch, Course, Resource,
)

log = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Helper: time arithmetic
# ─────────────────────────────────────────────────────────────────────────────

def _add_minutes(t_str: str, mins: int) -> str:
    dt = datetime.strptime(t_str, "%H:%M") + timedelta(minutes=mins)
    return dt.strftime("%H:%M")


# ─────────────────────────────────────────────────────────────────────────────
# Main Scheduler
# ─────────────────────────────────────────────────────────────────────────────

class TimetableScheduler:
    """
    CP-SAT based scheduler.

    Key concepts (v3.1.0):
      • Decision variables: BoolVar per (day, slot, course, faculty, room, batch)
      • Elective options are modelled as virtual batches (prefix ELECTIVE_)
      • HC12 enforces same (day, slot) for all options within one basket
      • SO5 penalises idle slots in a batch's daily window
    """

    # ── Construction ─────────────────────────────────────────────────────

    def __init__(self, request: GenerateRequest):
        self.request = request
        self.model = cp_model.CpModel()

        cfg = request.config
        # Resolve daysPerWeek (legacy top-level field takes precedence if config default)
        self.days: List[int] = list(range(1, cfg.daysPerWeek + 1))

        # Build slot timeline
        self.lecture_slots: List[int] = []
        self.break_slots: List[int] = []
        self.slot_times: Dict[int, Tuple[str, str]] = {}  # slot_number → (start, end)
        self._build_slot_timeline()

        # Normalization (Scaling) is now primarily handled in main.py pre-flight.
        # We only ensure labDuration is at least 1 if it's a lab course.
        for c in request.courses:
            if c.labDuration < 1 and c.type.lower() in ("lab", "practical", "theory+lab"):
                c.labDuration = 1

        # Pre-process elective baskets into virtual batches / courses
        self._elective_virtual_batches: List[Batch] = []
        self._elective_virtual_courses: Dict[str, Course] = {}
        self._basket_option_batch_ids: Dict[str, List[str]] = {}  # basketId → [vBatchId]
        self._option_id_for_batch: Dict[str, str] = {}            # vBatchId → optionId
        self._basket_for_option_batch: Dict[str, str] = {}        # vBatchId → basketId
        self._basket_division_ids: Dict[str, List[str]] = {}      # basketId → [divisionIds]
        
        # Basket weeklyHrs already scaled in main.py
        # for b in request.electiveBaskets:
        #     b.weeklyHrs = math.ceil(b.weeklyHrs / slot_hrs)

        self._process_elective_baskets()

        # Effective batches / courses (real + virtual)
        self._all_batches: List[Batch] = list(request.batches) + self._elective_virtual_batches
        self._all_courses: List[Course] = list(request.courses) + list(self._elective_virtual_courses.values())

        # Locked slots
        self._all_locked = [
            s for s in (request.existingSlots + request.lockedSlots) if s.isLocked
        ]

        # Solver decision variables: (d, p, c_id, f_id, r_id, b_id) → BoolVar
        self.vars: Dict[Tuple, cp_model.IntVar] = {}
        self._valid_combos: List[Tuple[str, str, Optional[str], str, str, int]] = []

        self._build_valid_combos()
        self._setup_variables()

        log.info(
            "[Solver] Courses=%d(+%d elec), Faculty=%d, Batches=%d(+%d elec), "
            "Rooms=%d, Days=%d, Periods=%d, ValidCombos=%d",
            len(request.courses), len(self._elective_virtual_courses),
            len(request.faculty),
            len(request.batches), len(self._elective_virtual_batches),
            len(request.resources),
            len(self.days), len(self.lecture_slots),
            len(self._valid_combos),
        )

    # ── Timeline builder ─────────────────────────────────────────────────

    def _build_slot_timeline(self):
        cfg = self.request.config
        if cfg.useCustomBlocks and cfg.timeBlocks:
            for i, block in enumerate(cfg.timeBlocks):
                slot_num = i + 1
                if block.isBreak:
                    self.break_slots.append(slot_num)
                else:
                    self.lecture_slots.append(slot_num)
                self.slot_times[slot_num] = (block.startTime, block.endTime)
            return

        slot_num = 1
        from datetime import datetime, timedelta
        
        try:
            curr = datetime.strptime(cfg.startTime, "%H:%M")
            end_limit = datetime.strptime(cfg.endTime, "%H:%M")
        except:
            log.error("Invalid startTime/endTime format. Using 09:00-17:00 default.")
            curr = datetime.strptime("09:00", "%H:%M")
            end_limit = datetime.strptime("17:00", "%H:%M")

        lect_dur = cfg.lectureDuration if cfg.lectureDuration > 0 else 60
        break_dur = cfg.breakDuration if cfg.breakDuration > 0 else 0
        num_breaks = cfg.numberOfBreaks
        
        # Simple heuristic: insert breaks after every few lectures if not specified
        break_after = 2 if num_breaks > 0 else 999
        lectures_since_break = 0
        breaks_done = 0

        while curr + timedelta(minutes=lect_dur) <= end_limit:
            # Add lecture slot
            start_str = curr.strftime("%H:%M")
            curr += timedelta(minutes=lect_dur)
            end_str = curr.strftime("%H:%M")
            
            self.lecture_slots.append(slot_num)
            self.slot_times[slot_num] = (start_str, end_str)
            slot_num += 1
            lectures_since_break += 1

            # Check if we should insert a break
            if breaks_done < num_breaks and lectures_since_break >= break_after:
                if curr + timedelta(minutes=break_dur) <= end_limit:
                    b_start = curr.strftime("%H:%M")
                    curr += timedelta(minutes=break_dur)
                    b_end = curr.strftime("%H:%M")
                    
                    self.break_slots.append(slot_num)
                    self.slot_times[slot_num] = (b_start, b_end)
                    slot_num += 1
                    breaks_done += 1
                    lectures_since_break = 0

        print(f"[Solver Debug] Generated lecture slots: {self.lecture_slots}")
        print(f"[Solver Debug] Generated break slots: {self.break_slots}")
        print(f"[Solver Debug] Slot times: {self.slot_times}")

    # ── Elective basket pre-processing ───────────────────────────────────

    def _process_elective_baskets(self):
        """
        For each ElectiveBasket, create one virtual Batch per ElectiveOption.
        The virtual course inherits most properties from the real course but is
        scoped to the virtual batch only.
        """
        real_course_map = {c.id: c for c in self.request.courses}

        for basket in self.request.electiveBaskets:
            vbatch_ids: List[str] = []
            
            # Map this basket to its parent division IDs
            self._basket_division_ids[basket.basketId] = basket.divisionIds

            for opt in basket.options:
                from app.models import ElectiveSubgroup
                subgroups = opt.subgroups if opt.subgroups else [
                    # fallback to 1 subgroup if not provided by older API
                    ElectiveSubgroup(
                        subgroupId=opt.optionId,
                        name="Group 1",
                        enrollmentCount=opt.enrollmentCount
                    )
                ]

                for sg in subgroups:
                    vbatch_id = f"ELECTIVE_{basket.basketId}_OPT_{opt.optionId}_SG_{sg.subgroupId}"
                    vbatch_name = f"{basket.name} – {opt.courseId} ({sg.name})"

                    # Virtual batch for the subgroup
                    vbatch = Batch(
                        id=vbatch_id,
                        name=vbatch_name,
                        strength=sg.enrollmentCount,
                        program=basket.program,
                        semester=basket.semester,
                    )
                    self._elective_virtual_batches.append(vbatch)
                    vbatch_ids.append(vbatch_id)
                    self._option_id_for_batch[vbatch_id] = opt.optionId
                    self._basket_for_option_batch[vbatch_id] = basket.basketId

                    # Virtual course (scoped to this option & subgroup)
                    real_c = real_course_map.get(opt.courseId)
                    if real_c:
                        vcourse_id = f"ELEC_{vbatch_id}_{opt.courseId}"
                        vcourse = Course(
                            id=vcourse_id,
                            code=real_c.code,
                            name=real_c.name,
                            type=real_c.type,
                            weeklyHrs=basket.weeklyHrs,
                            program=basket.program,
                            semester=basket.semester,
                            isElective=True,
                            requiredRoomType=real_c.requiredRoomType,
                            labDuration=real_c.labDuration,
                        )
                        self._elective_virtual_courses[vcourse_id] = vcourse

            self._basket_option_batch_ids[basket.basketId] = vbatch_ids

    # ── Valid combo pre-filter ────────────────────────────────────────────

    def _build_valid_combos(self):
        """Pre-filter (course, faculty, room, batch) 4-tuples to remove obviously
        infeasible assignments before variable creation."""
        cfg = self.request.config

        excluded_f: Set[str] = set()
        excluded_r: Set[str] = set()

        faculty_courses: Dict[str, Set[str]] = {}
        for f in self.request.faculty:
            faculty_courses[f.id] = {s.courseId for s in f.subjects}
            if not f.subjects:
                excluded_f.add(f.id)

        for r in self.request.resources:
            if r.capacity <= 0:
                excluded_r.add(r.id)

        def _add_combos(courses: List[Course], batches: List[Batch], elective=False):
            for c in courses:
                req_room_type = c.requiredRoomType
                if not req_room_type and c.type.lower() in ("lab", "theory+lab", "practical"):
                    req_room_type = "Lab"
                is_theory_only = c.type.lower() == "theory"

                # SKIP: If we are processing regular batches but the course is marked elective,
                # it should only be handled via virtual elective batches/courses path.
                if not elective and c.isElective:
                    continue

                for b in batches:
                    if c.program and b.program and c.program != b.program:
                        continue
                    if c.semester and b.semester and c.semester != b.semester:
                        continue

                    # For virtual elective courses, only match their intended virtual batch
                    is_vcourse = c.id.startswith("ELEC_")
                    is_vbatch = b.id.startswith("ELECTIVE_")
                    if is_vbatch and is_vcourse:
                        if not c.id.startswith(f"ELEC_{b.id}_"):
                            continue

                    # Potential Faculty Pairs for this batch/course if elective
                    potential_pairs: List[Tuple[str, Optional[str], int]] = [] # f1, f2, day (0=any)
                    if elective:
                        basket_id = self._basket_for_option_batch.get(b.id)
                        basket = next((bk for bk in self.request.electiveBaskets if bk.basketId == basket_id), None)
                        if basket and basket.facultyPairs:
                            # Use pairs if defined
                            for fpair in basket.facultyPairs:
                                potential_pairs.append((fpair.faculty1Id, fpair.faculty2Id, fpair.dayOfWeek))
                    
                    if not potential_pairs:
                        # Fallback to single faculty assignments
                        for f in self.request.faculty:
                            if f.id in excluded_f: continue
                            real_cid = c.id
                            if c.isElective:
                                parts = c.id.split("_")
                                real_cid = parts[-1] if len(parts) > 1 else c.id
                            if real_cid in faculty_courses.get(f.id, set()) or c.id in faculty_courses.get(f.id, set()):
                                potential_pairs.append((f.id, None, 0))

                    for (f1_id, f2_id, assigned_day) in potential_pairs:
                        for r in self.request.resources:
                            if r.id in excluded_r: continue
                            if r.capacity < b.strength: continue
                            if req_room_type and r.type != req_room_type: continue
                            if is_theory_only and r.type.lower() == "lab": continue
                            # We'll filter by assigned_day during _setup_variables
                            self._valid_combos.append((c.id, f1_id, f2_id, r.id, b.id, assigned_day))

        # Add regular course/batch combos
        _add_combos(self.request.courses, self.request.batches)
        # Add elective virtual course/batch combos
        if self._elective_virtual_courses:
            _add_combos(
                list(self._elective_virtual_courses.values()),
                self._elective_virtual_batches,
                elective=True,
            )

        # Diagnostic: Count combos per (course, batch)
        cb_combo_counts = {}
        for (cid, f1, f2, rid, bid, day) in self._valid_combos:
            cb_combo_counts[(cid, bid)] = cb_combo_counts.get((cid, bid), 0) + 1
        
        print("--- COMBO PRE-FILTER SUMMARY ---")
        for (cid, bid), count in cb_combo_counts.items():
            if count < 5:
                print(f"[Solver Debug] Suspicously few combos for {cid} in {bid}: {count}")

    # ── Variable creation ─────────────────────────────────────────────────

    def _setup_variables(self):
        for d in self.days:
            if d in self.request.excludedDayIds:
                continue
            for p in self.lecture_slots:
                for (c_id, f1_id, f2_id, r_id, b_id, assigned_day) in self._valid_combos:
                    if assigned_day != 0 and assigned_day != d:
                        continue
                    key = (d, p, c_id, f1_id, f2_id, r_id, b_id)
                    # Safe ID slicing for variable names
                    c_short = str(c_id)[-4:] if len(str(c_id)) >= 4 else str(c_id)
                    f1_short = str(f1_id)[-2:] if len(str(f1_id)) >= 2 else str(f1_id)
                    f2_short = str(f2_id)[-2:] if f2_id and len(str(f2_id)) >= 2 else ""
                    r_short = str(r_id)[-2:] if len(str(r_id)) >= 2 else str(r_id)
                    b_short = str(b_id)[-2:] if len(str(b_id)) >= 2 else str(b_id)
                    
                    self.vars[key] = self.model.NewBoolVar(
                        f"d{d}p{p}c{c_short}f{f1_short}{f2_short}r{r_short}b{b_short}"
                    )
        print(f"[Solver Debug] Total decision variables created: {len(self.vars)}")
        
        # Optional: Print count per (course, batch)
        cb_counts = {}
        for (d, p, c_id, f1_id, f2_id, r_id, b_id) in self.vars:
            cb_counts[(c_id, b_id)] = cb_counts.get((c_id, b_id), 0) + 1
        
        for (c_id, b_id), count in cb_counts.items():
            if count < 5: # Arbitrary threshold for "suspiciously low"
                print(f"[Solver Debug] Low variable count: {c_id} for batch {b_id} has only {count} potential slots.")

    # ── Hard Constraints ──────────────────────────────────────────────────

    def _add_hard_constraints(self):
        days = [d for d in self.days if d not in self.request.excludedDayIds]
        cfg = self.request.config
        slot_list = sorted(self.lecture_slots)

        # Pre-aggregate vars for efficient constraint building
        cb_vars: Dict[Tuple[str, str], List[cp_model.IntVar]] = {}   # (c_id, b_id) → vars
        fdp_vars: Dict[Tuple[int, int, str], List[cp_model.IntVar]] = {}  # (d, p, f_id) → vars
        bdp_vars: Dict[Tuple[int, int, str], List[cp_model.IntVar]] = {}  # (d, p, b_id) → vars
        rdp_vars: Dict[Tuple[int, int, str], List[cp_model.IntVar]] = {}  # (d, p, r_id) → vars
        fd_vars: Dict[Tuple[int, str], List[cp_model.IntVar]] = {}   # (d, f_id) → vars
        cbd_vars: Dict[Tuple[str, str, int], List[cp_model.IntVar]] = {}  # (c_id, b_id, d) → vars
        bd_vars: Dict[Tuple[str, int], List[cp_model.IntVar]] = {}   # (b_id, d) → vars
        
        # New: Specific grouping for Lab pairing (HC9)
        # (d, c_id, f_id, b_id, p) → var
        dcfbp_vars: Dict[Tuple[int, str, str, str, int], cp_model.IntVar] = {}

        for key, var in self.vars.items():
            d, p, c_id, f1_id, f2_id, r_id, b_id = key
            cb_vars.setdefault((c_id, b_id), []).append(var)
            
            fdp_vars.setdefault((d, p, f1_id), []).append(var)
            fd_vars.setdefault((d, f1_id), []).append(var)
            dcfbp_vars[(d, c_id, f1_id, b_id, p)] = var
            
            if f2_id:
                fdp_vars.setdefault((d, p, f2_id), []).append(var)
                fd_vars.setdefault((d, f2_id), []).append(var)
                dcfbp_vars[(d, c_id, f2_id, b_id, p)] = var

            bdp_vars.setdefault((d, p, b_id), []).append(var)
            rdp_vars.setdefault((d, p, r_id), []).append(var)
            cbd_vars.setdefault((c_id, b_id, d), []).append(var)
            bd_vars.setdefault((b_id, d), []).append(var)

        # ── HC1 : Weekly slot count per (course, batch) ───────────────
        for b in self._all_batches:
            for c in self._all_courses:
                course_vars = cb_vars.get((c.id, b.id), [])
                program_ok = not c.program or not b.program or c.program == b.program
                semester_ok = not c.semester or not b.semester or c.semester == b.semester
                can_be_taught = any(
                    c.id in {s.courseId for s in f.subjects}
                    for f in self.request.faculty
                )
                # For virtual elective courses check against any faculty with real courseId
                if c.isElective and not can_be_taught:
                    can_be_taught = True  # validated by _build_valid_combos

                is_vcourse = c.id.startswith("ELEC_")
                is_vbatch = b.id.startswith("ELECTIVE_")
                if is_vbatch and is_vcourse:
                    if not c.id.startswith(f"ELEC_{b.id}_"):
                        continue

                if not program_ok or not semester_ok or not can_be_taught or not course_vars:
                    if course_vars:
                        # Force 0 for incompatible pairs that somehow have vars
                        self.model.Add(sum(course_vars) == 0)
                else:
                    print(f"[Solver Debug] Adding requirement: {c.id} for batch {b.id} == {c.weeklyHrs} (Vars: {len(course_vars)})")
                    if len(course_vars) < c.weeklyHrs:
                        print(f"[Solver Debug] CRITICAL: Not enough vars ({len(course_vars)}) for Course/Batch {c.id}/{b.id}. Needs {c.weeklyHrs} slots.")
                    self.model.Add(sum(course_vars) == c.weeklyHrs)


        # ── HC2 : Faculty no double-booking ──────────────────────────
        for (d, p, f_id), fvars in fdp_vars.items():
            if len(fvars) > 1:
                self.model.AddAtMostOne(fvars)

        # ── HC3 : Batch no overlap ────────────────────────────────────
        for (d, p, b_id), bvars in bdp_vars.items():
            if len(bvars) > 1:
                self.model.AddAtMostOne(bvars)

        # ── HC4 : Room no double-allocation ──────────────────────────
        for (d, p, r_id), rvars in rdp_vars.items():
            if len(rvars) > 1:
                self.model.AddAtMostOne(rvars)

        # ── HC5,6 : Room capacity & faculty assignment ─────────────── (enforced in pre-filter)

        # ── HC7 : Faculty availability (blocked windows) ─────────────
        for f in self.request.faculty:
            if not f.availability:
                continue
            blocked = {(a.dayOfWeek, a.slotNumber) for a in f.availability}
            for (d, p, f_id), fvars in fdp_vars.items():
                if f_id == f.id and (d, p) in blocked:
                    self.model.Add(sum(fvars) == 0)

        # ── HC9 : Consecutive slot pairing for Lab courses ────────────
        def _break_between(si: int, sj: int) -> bool:
            return any(bi > si and bi < sj for bi in self.break_slots)

        def _valid_start_indices(dur: int) -> List[int]:
            valid = []
            for i in range(len(slot_list) - dur + 1):
                ok = all(
                    not _break_between(slot_list[i + k], slot_list[i + k + 1])
                    for k in range(dur - 1)
                )
                if ok:
                    valid.append(i)
            return valid

        for c in self._all_courses:
            if c.labDuration < 2:
                continue
            lab_dur = c.labDuration
            valid_starts_idx = _valid_start_indices(lab_dur)

            for d in days:
                for b in self._all_batches:
                    for f in self.request.faculty:
                        for r in self.request.resources:
                            idx_to_p = {
                                si: slot_list[si]
                                for si in range(len(slot_list))
                                if (d, c.id, f.id, b.id, slot_list[si]) in dcfbp_vars
                            }
                            if not idx_to_p:
                                continue
                            sv_local = {
                                p: dcfbp_vars[(d, c.id, f.id, b.id, p)]
                                for p in idx_to_p.values()
                            }
                            start_vars: Dict[int, cp_model.IntVar] = {}
                            for si in valid_starts_idx:
                                if not all(slot_list[si + k] in sv_local for k in range(lab_dur)):
                                    continue
                                c_short = c.id[-4:] if len(c.id) >= 4 else c.id
                                b_short = b.id[-4:] if len(b.id) >= 4 else b.id
                                sv = self.model.NewBoolVar(
                                    f"lbst_d{d}i{si}c{c_short}b{b_short}"
                                )
                                start_vars[si] = sv
                                for k in range(lab_dur):
                                    self.model.Add(
                                        sv_local[slot_list[si + k]] == 1
                                    ).OnlyEnforceIf(sv)

                            for si, p in idx_to_p.items():
                                raw = sv_local[p]
                                covering = [
                                    start_vars[sj]
                                    for sj in valid_starts_idx
                                    if sj in start_vars and sj <= si < sj + lab_dur
                                ]
                                if covering:
                                    self.model.Add(sum(covering) >= 1).OnlyEnforceIf(raw)
                                    for sv in covering:
                                        self.model.Add(sv == 0).OnlyEnforceIf(raw.Not())
                                else:
                                    self.model.Add(raw == 0)

        # ── HC10 : Locked slot pinning ────────────────────────────────
        for slot in self._all_locked:
            if slot.isBreak or not slot.courseId or not slot.facultyId or not slot.roomId:
                continue
            key = (slot.dayOfWeek, slot.slotNumber,
                   slot.courseId, slot.facultyId, slot.roomId, slot.batchId)
            if key in self.vars:
                self.model.Add(self.vars[key] == 1)

        # ── HC11, HC14 : Elective Synchronization & Overlap ──
        for basket in self.request.electiveBaskets:
            vbatch_ids = self._basket_option_batch_ids.get(basket.basketId, [])
            parent_batch_ids = self._basket_division_ids.get(basket.basketId, [])
            if not vbatch_ids:
                continue

            for d in days:
                for p in slot_list:
                    # HC11: All groups in a basket must occur at the same time
                    vbatch_vars = []
                    for vb_id in vbatch_ids:
                        if (d, p, vb_id) in bdp_vars:
                            vbatch_vars.append(sum(bdp_vars[(d, p, vb_id)]))
                        else:
                            vbatch_vars.append(0)

                    if not vbatch_vars:
                        continue

                    # Represents true/false if this basket is scheduled at (d,p)
                    basket_active = self.model.NewBoolVar(f"bask_act_d{d}_p{p}_{basket.basketId[:4]}")
                    for vb_v in vbatch_vars:
                        if isinstance(vb_v, int) and vb_v == 0:
                            self.model.Add(basket_active == 0)
                        else:
                            self.model.Add(vb_v == 1).OnlyEnforceIf(basket_active)
                            self.model.Add(vb_v == 0).OnlyEnforceIf(basket_active.Not())

                    # HC14: Parent batches must not have regular classes at this same time
                    for pb_id in parent_batch_ids:
                        if (d, p, pb_id) in bdp_vars:
                            parent_active = sum(bdp_vars[(d, p, pb_id)])
                            self.model.Add(parent_active == 0).OnlyEnforceIf(basket_active)

    # ── Soft Constraints / Objective ──────────────────────────────────────

    def _add_soft_constraints(self):
        cfg = self.request.config
        days = [d for d in self.days if d not in self.request.excludedDayIds]
        slot_list = sorted(self.lecture_slots)
        n_slots = len(slot_list)

        objective_terms: List[cp_model.LinearExpr] = []

        # SO1 : Room utilisation (prefer tight-capacity rooms)
        for (d, p, c_id, f1_id, f2_id, r_id, b_id), var in self.vars.items():
            b = next((x for x in self._all_batches if x.id == b_id), None)
            r = next((x for x in self.request.resources if x.id == r_id), None)
            if b and r and r.capacity > 0:
                fit_score = int(100 * b.strength / r.capacity)
                objective_terms.append(var * fit_score)

        # SO2 : Prefer earlier slots (morning-dense)
        for (d, p, c_id, f1_id, f2_id, r_id, b_id), var in self.vars.items():
            slot_idx = slot_list.index(p) if p in slot_list else 0
            morning_bonus = max(0, n_slots - slot_idx) * 2
            objective_terms.append(var * morning_bonus)

        # SO3 : Even cross-day distribution (reward different days per course-batch)
        # Build cbd_vars (course, batch, day) → list of vars
        cbd_vars: Dict[Tuple, List] = {}
        for (d, p, c_id, f1_id, f2_id, r_id, b_id), var in self.vars.items():
            cbd_vars.setdefault((c_id, b_id, d), []).append(var)

        for (c_id, b_id, d), cvars in cbd_vars.items():
            day_used = self.model.NewBoolVar(f"du_{c_id[-4:]}_{b_id[-4:]}_{d}")
            self.model.Add(sum(cvars) >= 1).OnlyEnforceIf(day_used)
            self.model.Add(sum(cvars) == 0).OnlyEnforceIf(day_used.Not())
            objective_terms.append(day_used * 50)


        # SO5 : Gap minimization — penalise idle slots within batch's daily window
        # gap_weight: 0 = off, 100 = balanced, 300 = strict
        gap_weight_map = {"off": 0, "balanced": 100, "strict": 300}
        gap_weight = gap_weight_map.get(cfg.continuousMode, 100)

        if gap_weight > 0:
            bd_vars: Dict[Tuple, List] = {}
            for (d, p, c_id, f1_id, f2_id, r_id, b_id), var in self.vars.items():
                bd_vars.setdefault((b_id, d), []).append((p, var))

            # Add virtual elective batch vars to parent division's bd_vars
            for basket in self.request.electiveBaskets:
                vbatch_ids = self._basket_option_batch_ids.get(basket.basketId, [])
                div_ids = self._basket_division_ids.get(basket.basketId, [])
                for d_id in div_ids:
                    for d in days:
                        # Find all variables for any of the vbatch_ids on day d
                        for (dd, p, c_id, f1_id, f2_id, r_id, b_id), var in self.vars.items():
                            if dd == d and b_id in vbatch_ids:
                                bd_vars.setdefault((d_id, d), []).append((p, var))

            for (b_id, d), pv_list in bd_vars.items():
                if len(pv_list) < 2:
                    continue
                # For each pair of lecture slots (earlier, later), if batch uses both
                # but there's a gap slot in between, penalise.
                p_list_sorted = sorted(slot_list)
                # Collapse per slot: slot_active[p] = OR of all vars at (b_id, d, p, ...)
                slot_active: Dict[int, cp_model.IntVar] = {}
                for p, var in pv_list:
                    if p not in slot_active:
                        # collect all vars for this (b_id, d, p)
                        all_at_p = [v for (pp, v) in pv_list if pp == p]
                        sa = self.model.NewBoolVar(f"sa_{b_id[-4:]}_{d}_{p}")
                        self.model.Add(sum(all_at_p) >= 1).OnlyEnforceIf(sa)
                        self.model.Add(sum(all_at_p) == 0).OnlyEnforceIf(sa.Not())
                        slot_active[p] = sa

                # For each slot index, if the slot is between first and last used slot
                # but is itself unused, that's a gap.
                # Approximate: reward for each consecutive pair of active slots
                for i in range(len(p_list_sorted) - 1):
                    p_cur = p_list_sorted[i]
                    p_nxt = p_list_sorted[i + 1]
                    if p_cur not in slot_active or p_nxt not in slot_active:
                        continue
                    # If both are active, reward compactness
                    both_active = self.model.NewBoolVar(
                        f"ca_{b_id[-4:]}_{d}_{p_cur}_{p_nxt}"
                    )
                    self.model.Add(
                        slot_active[p_cur] + slot_active[p_nxt] == 2
                    ).OnlyEnforceIf(both_active)
                    self.model.Add(
                        slot_active[p_cur] + slot_active[p_nxt] < 2
                    ).OnlyEnforceIf(both_active.Not())
                    objective_terms.append(both_active * gap_weight)

        if objective_terms:
            self.model.Maximize(sum(objective_terms))

    # ── Solve ──────────────────────────────────────────────────────────────

    def solve(self) -> GenerateResponse:
        import time
        start_ts = time.time()

        self._add_hard_constraints()
        self._add_soft_constraints()

        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = 60
        solver.parameters.num_search_workers = 8
        solver.parameters.random_seed = 42
        solver.parameters.log_search_progress = False

        status = solver.Solve(self.model)
        elapsed_ms = int((time.time() - start_ts) * 1000)

        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            slots, metrics = self._extract_solution(solver)
            log.info(
                "[Solver] Status=%s | Slots=%d "
                "| UtilizationScore=%.2f%% | GapScore=%.2f",
                solver.StatusName(status), len(slots),
                metrics.get("utilizationScore", 0.0),
                metrics.get("gapScore", 0.0),
            )
            return GenerateResponse(
                status=solver.StatusName(status),
                message="Timetable generated successfully.",
                slots=slots,
                solveTimeMs=elapsed_ms,
                utilizationScore=metrics.get("utilizationScore", 0.0),
                gapScore=metrics.get("gapScore", 0.0),
                electiveGroupCount=metrics.get("electiveGroupCount", 0),
            )
        else:
            log.warning("[Solver] Status=%s — no solution found.", solver.StatusName(status))
            return GenerateResponse(
                status=solver.StatusName(status),
                message=(
                    "The solver could not find a valid timetable satisfying all constraints. "
                    "Common causes: too many courses for the available time slots, "
                    "insufficient faculty coverage, or overly restrictive availability blocks. "
                    "Try relaxing constraints or adding more resources."
                ),
                solveTimeMs=elapsed_ms,
            )

    # ── Solution extraction ───────────────────────────────────────────────

    def _extract_solution(self, solver: cp_model.CpSolver):
        cfg = self.request.config
        slots: List[SlotResult] = []

        course_map = {c.id: c for c in self._all_courses}
        faculty_map = {f.id: f for f in self.request.faculty}
        room_map = {r.id: r for r in self.request.resources}
        batch_map = {b.id: b for b in self._all_batches}

        room_used: Dict[str, int] = {}
        room_total: Dict[str, int] = {}
        batch_day_slots: Dict[Tuple, List[int]] = {}  # (b_id, d) → [p]

        days = [d for d in self.days if d not in self.request.excludedDayIds]

        for (d, p, c_id, f1_id, f2_id, r_id, b_id), var in self.vars.items():
            if solver.Value(var) != 1:
                continue

            c = course_map.get(c_id)
            f = faculty_map.get(f1_id)
            r = room_map.get(r_id)
            b = batch_map.get(b_id)
            t_start, t_end = self.slot_times.get(p, ("?", "?"))

            r_cap = r.capacity if r else 1
            room_used[r_id] = room_used.get(r_id, 0) + (b.strength if b else 0)
            room_total[r_id] = room_total.get(r_id, 0) + r_cap

            # Gap tracking
            batch_day_slots.setdefault((b_id, d), []).append(p)

            # Elective metadata
            basket_id = self._basket_for_option_batch.get(b_id)
            opt_id = self._option_id_for_batch.get(b_id)
            
            # TimeBlock reference
            block_id = None
            if self.request.config.useCustomBlocks:
                block = self.request.config.timeBlocks[p-1] if 0 <= p-1 < len(self.request.config.timeBlocks) else None
                if block: block_id = block.id

            slots.append(SlotResult(
                dayOfWeek=d,
                slotNumber=p,
                startTime=t_start,
                endTime=t_end,
                courseId=c.id if c else c_id,
                courseName=c.name if c else None,
                courseCode=c.code if c else None,
                slotType=c.type if c else None,
                facultyId=f1_id,
                facultyName=f.name if f else None,
                faculty2Id=f2_id,
                roomId=r_id,
                roomName=r.name if r else None,
                batchId=b_id,
                batchName=b.name if b else None,
                isBreak=False,
                basketId=basket_id,
                isElective=bool(basket_id),
                optionId=opt_id,
                blockId=block_id,
                sessionTypeId=c.sessionTypeId if c else None
            ))

        # Add break slots
        for d in days:
            for p in self.break_slots:
                if p in self.slot_times:
                    t_s, t_e = self.slot_times[p]
                else:
                    # estimate break time
                    t_s, t_e = "?", "?"
                slots.append(SlotResult(
                    dayOfWeek=d, slotNumber=p,
                    startTime=t_s, endTime=t_e, isBreak=True,
                ))

        # Compute metrics

        util = 0.0
        total_cap = sum(room_total.values())
        total_used = sum(room_used.values())
        if total_cap > 0:
            util = round(total_used / total_cap * 100, 2)

        # Gap score: avg idle slots per (batch, day)
        total_idle = 0
        gap_count = 0
        for (b_id, d), ps in batch_day_slots.items():
            if len(ps) < 2:
                continue
            min_p = min(ps)
            max_p = max(ps)
            slot_list = sorted(self.lecture_slots)
            window = [s for s in slot_list if min_p <= s <= max_p]
            idle = sum(1 for s in window if s not in ps)
            total_idle += idle
            gap_count += 1

        gap_score = float(round(total_idle / gap_count, 2)) if gap_count > 0 else 0.0

        # Elective group count
        elec_groups = len([
            b.id for b in self._all_batches
            if b.id.startswith("ELECTIVE_")
            and any(solver.Value(v) == 1 for k, v in self.vars.items() if k[5] == b.id)
        ])

        return slots, {
            "utilizationScore": util,
            "gapScore": gap_score,
            "electiveGroupCount": elec_groups,
        }
