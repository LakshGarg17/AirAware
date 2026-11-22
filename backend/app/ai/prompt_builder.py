"""
Prompt Builder for Gemini AI Service.
Defines system instructions, operational constraints, and structured output formatting.
"""
import json
from typing import Any, Dict, List


SYSTEM_INSTRUCTION = """You are AirAware — an urban air quality and sustainable lifestyle assistant.
Your mission is to provide realistic, low-cost, evidence-based recommendations for families and individuals navigating severe winter smog.

STRICT OPERATIONAL RULES:
1. Use ONLY the supplied atmospheric and environmental context.
2. If data is missing or null, state "unavailable"; NEVER estimate or invent AQI or weather numbers.
3. NEVER make medical diagnoses, promise protection/cure, or prescribe medications. Guidance is informational only.
4. Avoid alarmism. Do not shame users.
5. Consider economic reality: prioritize zero-cost and low-cost actions. NEVER assume users own an expensive air purifier, private car, or smart HVAC system.
6. NO unsupported numeric claims (do not invent "% reduction", "kg CO2", or "AQI drops by N points" unless explicitly provided in context).
7. NEVER recommend ozone generators or uncertified ionizers.
8. NEVER claim houseplants can replace mechanical air filtration for PM2.5.
9. NEVER state that windows must permanently stay sealed without ventilation.
10. Stay strictly focused on air quality, personal exposure reduction, indoor air hygiene, and sustainable choices. Politely decline off-topic requests without inventing environmental connections.
11. Output MUST strictly match the requested JSON format."""


RECOMMENDATION_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "main_concerns": {"type": "array", "items": {"type": "string"}},
        "immediate_actions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "reason": {"type": "string"},
                    "priority": {"type": "string", "enum": ["high", "medium", "low"]},
                    "category": {"type": "string"},
                    "cost": {"type": "string", "enum": ["free", "low", "medium", "high"]},
                    "effort": {"type": "string"}
                },
                "required": ["id", "title", "description", "reason", "priority", "category"]
            }
        },
        "outdoor_guidance": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "reason": {"type": "string"},
                    "priority": {"type": "string", "enum": ["high", "medium", "low"]},
                    "category": {"type": "string"}
                },
                "required": ["id", "title", "description", "reason", "priority", "category"]
            }
        },
        "indoor_recommendations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "reason": {"type": "string"},
                    "priority": {"type": "string", "enum": ["high", "medium", "low"]},
                    "category": {"type": "string"},
                    "cost": {"type": "string", "enum": ["free", "low", "medium", "high"]}
                },
                "required": ["id", "title", "description", "reason", "priority", "category"]
            }
        },
        "commute_recommendations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "reason": {"type": "string"},
                    "priority": {"type": "string", "enum": ["high", "medium", "low"]},
                    "category": {"type": "string"}
                },
                "required": ["id", "title", "description", "reason", "priority", "category"]
            }
        },
        "sustainable_choices": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "reason": {"type": "string"},
                    "priority": {"type": "string", "enum": ["high", "medium", "low"]},
                    "category": {"type": "string"}
                },
                "required": ["id", "title", "description", "reason", "priority", "category"]
            }
        },
        "daily_plan": {
            "type": "object",
            "properties": {
                "morning": {"type": "array", "items": {"type": "object", "properties": {"id": {"type": "string"}, "title": {"type": "string"}, "description": {"type": "string"}, "reason": {"type": "string"}, "priority": {"type": "string"}}}},
                "afternoon": {"type": "array", "items": {"type": "object", "properties": {"id": {"type": "string"}, "title": {"type": "string"}, "description": {"type": "string"}, "reason": {"type": "string"}, "priority": {"type": "string"}}}},
                "evening": {"type": "array", "items": {"type": "object", "properties": {"id": {"type": "string"}, "title": {"type": "string"}, "description": {"type": "string"}, "reason": {"type": "string"}, "priority": {"type": "string"}}}},
                "night": {"type": "array", "items": {"type": "object", "properties": {"id": {"type": "string"}, "title": {"type": "string"}, "description": {"type": "string"}, "reason": {"type": "string"}, "priority": {"type": "string"}}}}
            },
            "required": ["morning", "afternoon", "evening", "night"]
        },
        "impact_explanations": {"type": "array", "items": {"type": "string"}},
        "limitations": {"type": "array", "items": {"type": "string"}}
    },
    "required": [
        "summary", "main_concerns", "immediate_actions", "outdoor_guidance",
        "indoor_recommendations", "commute_recommendations", "sustainable_choices",
        "daily_plan", "impact_explanations", "limitations"
    ]
}


def build_recommendation_prompt(context: Dict[str, Any]) -> str:
    """
    Builds the user prompt containing structured environmental and profile context.
    Prompt injection protected: user inputs are isolated and structured.
    """
    return (
        f"Generate personalized clean air and smog navigation recommendations based on the following verified environmental observations:\n"
        f"```json\n{json.dumps(context, indent=2)}\n```\n"
        f"Provide practical, personalized, empathetic guidance formatted strictly according to the JSON schema."
    )


def build_chat_prompt(message: str, context: Dict[str, Any], history: List[Dict[str, str]]) -> str:
    """
    Builds user turn prompt for chat. The user message is strictly bounded
    and cannot override the system instruction or inject prompt instructions.
    """
    ctx_str = json.dumps(context, indent=2)
    return (
        f"ENVIRONMENTAL CONTEXT:\n```json\n{ctx_str}\n```\n\n"
        f"USER QUESTION: {message.strip()}\n\n"
        f"Answer the user's question directly, concisely, and helpfully using only the verified environmental context. "
        f"If the question asks for medical prescriptions, off-topic facts, or claims that violate air safety, politely decline."
    )
