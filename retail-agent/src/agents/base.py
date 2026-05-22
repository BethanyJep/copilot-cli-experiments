"""Agent factory functions using Microsoft Agent Framework."""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from agent_framework import Agent
    from agent_framework_openai import OpenAIChatClient

from src.models.context import OrderContext


def create_agent(
    client: "OpenAIChatClient",
    name: str,
    role_description: str,
    order_type_instructions: str,
    context: OrderContext,
) -> "Agent":
    """Create an agent using Microsoft Agent Framework.

    Args:
        client: Azure OpenAI Chat Client instance.
        name: Name of the agent.
        role_description: Description of the agent's role.
        order_type_instructions: Order-type specific instructions.
        context: The order context.

    Returns:
        A configured Agent instance.
    """
    system_prompt = (
        f"You are the {name} in a collaborative retail order-processing team.\n\n"
        f"Role: {role_description}\n\n"
        f"Order type: {context.label}\n"
        f"{order_type_instructions}\n\n"
        "Respond in JSON with keys: findings (string, markdown), "
        "suggestions (list of actionable strings), cross_references (object mapping "
        "agent names to relevance notes — leave empty for now)."
    )

    return client.as_agent(
        name=name,
        instructions=system_prompt,
    )


def create_refinement_agent(
    client: "OpenAIChatClient",
    name: str,
    role_description: str,
    context: OrderContext,
) -> "Agent":
    """Create an agent for the refinement phase.

    Args:
        client: Azure OpenAI Chat Client instance.
        name: Name of the agent.
        role_description: Description of the agent's role.
        context: The order context.

    Returns:
        A configured Agent instance for refinement.
    """
    system_prompt = (
        f"You are the {name} in a collaborative retail order-processing team.\n\n"
        f"Role: {role_description}\n\n"
        "You are now in the TEAM SYNTHESIS phase. You have seen your "
        "teammates' findings and should refine your analysis:\n"
        "- Add cross-references where your insights connect to others'\n"
        "- Adjust actions that conflict with or complement teammates'\n"
        "- Remove redundant points already covered better by another agent\n"
        "- Flag any blockers that would prevent the order from being dispatched\n\n"
        "Respond in JSON with keys: findings (string, markdown), "
        "suggestions (list of actionable strings), cross_references (object mapping "
        "agent names to relevance notes)."
    )

    return client.as_agent(
        name=f"{name} (Refinement)",
        instructions=system_prompt,
    )


# ---------------------------------------------------------------------------
# Agent configuration data
# ---------------------------------------------------------------------------

AGENT_CONFIGS = {
    "Order Agent": {
        "role_description": (
            "You validate and process incoming orders for a Ugandan e-commerce platform. "
            "You check item availability, verify quantities, apply catalog pricing rules "
            "in Ugandan Shillings (UGX), and ensure VAT (18%) is correctly applied. "
            "You flag missing information, out-of-stock items, quantity limits, and "
            "district-restricted products."
        ),
        "get_instructions": lambda context: _get_order_instructions(context),
    },
    "Delivery Agent": {
        "role_description": (
            "You determine delivery options for customers across Uganda's districts. "
            "You estimate delivery times based on origin (Kampala-area warehouses) and "
            "destination district/division, validate delivery addresses and landmarks, select "
            "optimal carriers (SafeBoda, Glovo Uganda, DHL Uganda, Posta Uganda), and present "
            "delivery choices. You consider same-day eligibility within Greater Kampala, "
            "upcountry lead times, and special handling requirements."
        ),
        "get_instructions": lambda context: _get_delivery_instructions(context),
    },
    "Payment Agent": {
        "role_description": (
            "You handle payment processing for Ugandan customers. "
            "You validate payment methods including MTN MoMo, Airtel Money, "
            "bank cards (Stanbic, Centenary, dfcu, Equity Bank Uganda), and "
            "cash on delivery (COD). You calculate totals in UGX including 18% VAT "
            "and applicable discounts, assess fraud signals, apply promo codes, "
            "and ensure transactions can be completed securely."
        ),
        "get_instructions": lambda context: _get_payment_instructions(context),
    },
    "Dispatch Agent": {
        "role_description": (
            "You manage order fulfillment and dispatch logistics from Ugandan warehouses. "
            "You determine which warehouse (Kampala Central, Namanve, or Mbarara) "
            "should fulfil the order, plan picking and packing operations, coordinate "
            "with local couriers (SafeBoda riders, Glovo routes), and ensure all prerequisites "
            "are met before dispatch. You account for upcountry delivery hand-offs "
            "and Posta Uganda collection points."
        ),
        "get_instructions": lambda context: _get_dispatch_instructions(context),
    },
}


def _get_order_instructions(context: OrderContext) -> str:
    rules = context.rules.get("order", {})
    priority = rules.get("priority", "normal")
    notes = rules.get("notes", "")
    return (
        f"Processing priority: {priority}\n"
        f"Guidelines: {notes}\n\n"
        "Your analysis should include:\n"
        "- Item validation (availability, quantities, pricing)\n"
        "- Order completeness check (required fields, customer info)\n"
        "- Catalog rule application (bundles, limits, restrictions)\n"
        "- Any substitution or backorder recommendations\n"
        "- Estimated order value breakdown"
    )


def _get_delivery_instructions(context: OrderContext) -> str:
    rules = context.rules.get("delivery", {})
    speed = rules.get("speed", "standard")
    notes = rules.get("notes", "")
    return (
        f"Delivery speed tier: {speed}\n"
        f"Guidelines: {notes}\n\n"
        "Your analysis should include:\n"
        "- Available shipping methods and estimated delivery dates\n"
        "- Address validation status\n"
        "- Shipping cost breakdown per method\n"
        "- Special handling requirements (fragile, oversized, temperature)\n"
        "- Carrier recommendations and cutoff times"
    )


def _get_payment_instructions(context: OrderContext) -> str:
    rules = context.rules.get("payment", {})
    urgency = rules.get("urgency", "normal")
    notes = rules.get("notes", "")
    return (
        f"Payment urgency: {urgency}\n"
        f"Guidelines: {notes}\n\n"
        "Your analysis should include:\n"
        "- Payment method validation\n"
        "- Order total calculation (subtotal, tax, shipping, discounts)\n"
        "- Applicable promotions or loyalty rewards\n"
        "- Fraud risk assessment (low/medium/high)\n"
        "- Payment authorization status and next steps"
    )


def _get_dispatch_instructions(context: OrderContext) -> str:
    rules = context.rules.get("dispatch", {})
    priority = rules.get("priority", "normal")
    notes = rules.get("notes", "")
    return (
        f"Dispatch priority: {priority}\n"
        f"Guidelines: {notes}\n\n"
        "Your analysis should include:\n"
        "- Warehouse selection and stock allocation\n"
        "- Picking and packing plan\n"
        "- Packaging requirements (size, materials, branding)\n"
        "- Shipping label and documentation needs\n"
        "- Dispatch readiness checklist (all prerequisites for dispatch)\n"
        "- Estimated time from order confirmation to dispatch"
    )
