import ollama
from typing import Optional

async def get_chatbot_response(message: str, context: dict) -> str:
    """
    Generate a response for the student doubt assistant using Llama 3.2 via Ollama.
    """
    program = context.get('program', 'General')
    semester = context.get('semester', 'N/A')
    
    system_prompt = f"""You are the SmartCampus OS Assistant, an advanced AI tutor and institutional guide for students.
The user is a student in the {program} program, currently in Semester {semester}.
Provide accurate, helpful, and polite answers regarding syllabus, exam patterns, attendance rules, and general academic support.
If the question is about university-specific deadlines or policies, remind them to check the official 'Notices' section for the most current data.
Current institutional policy: 75% attendance is mandatory.
Keep responses concise and professional."""

    try:
        response = ollama.chat(
            model='llama3.2',
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': message},
            ]
        )
        return response['message']['content']
    except Exception as e:
        return f"System Error: Failed to generate AI response via Ollama. Details: {str(e)}"
