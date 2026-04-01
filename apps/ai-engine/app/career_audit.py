import json
import ollama
from typing import List, Dict, Any

async def perform_career_audit(context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze a student profile and generate a career roadmap using Llama 3.2.
    """
    student_name = context.get('studentName', 'Student')
    program = context.get('program', 'University Program')
    semester = context.get('semester', 1)
    sgpa = context.get('currentSgpa', 0.0)
    attendance = context.get('attendanceRate', 0.0)
    courses = context.get('completedCourses', [])

    prompt = f"""Analyze this student profile and provide a strategic career roadmap in JSON format.
Student: {student_name}
Program: {program}
Semester: {semester}
Academic Standing: SGPA {sgpa}
Engagement: {attendance}% attendance
Completed Coursework: {", ".join(courses)}

Response MUST be a valid JSON object ONLY with the following structure:
{{
    "careerTrack": "Name of recommended track",
    "optimalityScore": 0-100,
    "skillGap": ["Skill 1", "Skill 2"],
    "nextMilestone": {{
        "title": "Immediate goal",
        "difficulty": "Easy/Medium/Hard"
    }},
    "growthOrbit": [
        {{ "phase": "Next 6 Months", "focus": "Description", "badge": "Icon-Name" }},
        {{ "phase": "Year 1", "focus": "Description", "badge": "Icon-Name" }}
    ]
}}"""

    try:
        response = ollama.chat(
            model='llama3.2',
            messages=[
                {'role': 'user', 'content': prompt}
            ],
            format='json'
        )
        content = response['message']['content']
        return json.loads(content)
    except Exception as e:
        return {
            "error": str(e),
            "careerTrack": "Error",
            "optimalityScore": 0,
            "skillGap": ["Failed to reach Local AI Core"],
            "nextMilestone": {"title": "Retry Audit", "difficulty": "Low"},
            "growthOrbit": []
        }
