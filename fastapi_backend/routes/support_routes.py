from fastapi import APIRouter

from models import SupportChatRequest, SupportChatResponse


router = APIRouter(prefix="/support", tags=["support"])


def _build_reply(message: str) -> SupportChatResponse:
    normalized = message.lower()
    suggested_actions: list[str] = []
    resources: list[str] = []

    if any(keyword in normalized for keyword in ["hurt", "hit", "choke", "kill", "weapon"]):
        reply = (
            "If you are in immediate danger, move to a safe place and contact emergency services or a trusted contact. "
            "You can also trigger a panic alert in the app so the NGO team can respond quickly."
        )
        suggested_actions.extend([
            "Trigger the panic alert",
            "Reach a safe location",
            "Contact emergency services",
        ])
        resources.append("Local emergency helpline")
    elif any(keyword in normalized for keyword in ["complaint", "report", "police"]):
        reply = (
            "You can file a complaint through the local police station or a women protection cell. "
            "The NGO team can help prepare supporting documents and guide you through the process."
        )
        suggested_actions.extend([
            "Collect incident evidence",
            "Prepare a written statement",
            "Ask NGO for legal support",
        ])
        resources.append("Nearest legal aid clinic")
    elif any(keyword in normalized for keyword in ["shelter", "safe", "home", "stay"]):
        reply = (
            "Safe shelter options may be available through local NGOs or government-run homes. "
            "Share your location with the NGO team to coordinate a safe transfer."
        )
        suggested_actions.extend([
            "Share current location",
            "Request safe shelter referral",
        ])
        resources.append("Emergency shelter directory")
    else:
        reply = (
            "I can help you with next steps, safety planning, and where to report. "
            "Tell me what you need most right now."
        )
        suggested_actions.extend([
            "Describe what happened",
            "Ask about reporting options",
            "Request counseling support",
        ])
        resources.append("NGO support hotline")

    return SupportChatResponse(
        reply=reply,
        suggestedActions=suggested_actions,
        resources=resources,
    )


@router.post("/chat", response_model=SupportChatResponse)
async def chat_support(payload: SupportChatRequest) -> SupportChatResponse:
    return _build_reply(payload.message or "")
