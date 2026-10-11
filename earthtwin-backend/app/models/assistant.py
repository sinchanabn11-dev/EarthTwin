"""
Pydantic data models for AI Digital Twin Assistant.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List


class AssistantQuestionRequest(BaseModel):
    ecosystem_id: str = Field(..., description="Target ecosystem identifier")
    question: str = Field(..., min_length=2, description="Natural language question about the ecosystem")

    class Config:
        json_schema_extra = {
            "example": {
                "ecosystem_id": "forest-001",
                "question": "Why is the ecosystem at risk?"
            }
        }


class AssistantAnswerResponse(BaseModel):
    ecosystem_id: str
    question: str
    answer: str
    source: str = Field(
        default="earthtwin_rule_based_assistant",
        description="Origin source: earthtwin_rule_based_assistant or llm_model"
    )
    confidence: float = Field(0.92, description="Confidence score (0.0 to 1.0)")
    related_metrics: Optional[Dict[str, Any]] = Field(None, description="Current telemetry or risk metrics used for context")
    suggested_follow_ups: List[str] = Field(default_factory=list, description="Relevant questions the user might ask next")
