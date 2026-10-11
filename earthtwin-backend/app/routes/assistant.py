"""
EarthTwin — AI Assistant Query Routes
"""

from fastapi import APIRouter, HTTPException
from app.models.assistant import AssistantQuestionRequest, AssistantAnswerResponse
from app.services.ai_service import ai_assistant_service

router = APIRouter(prefix="/api/assistant", tags=["AI Digital Twin Assistant"])


@router.post(
    "/ask",
    response_model=AssistantAnswerResponse,
    summary="Ask AI Assistant About Ecosystem",
    description="Ask natural language questions regarding ecosystem status, fire/drought risks, vegetation health, moisture depletion, and climate change projections."
)
async def ask_assistant(request: AssistantQuestionRequest):
    answer = ai_assistant_service.answer_question(request)
    if not answer:
        raise HTTPException(
            status_code=404,
            detail=f"Ecosystem with ID '{request.ecosystem_id}' was not found. Please verify the ecosystem ID."
        )
    return answer
