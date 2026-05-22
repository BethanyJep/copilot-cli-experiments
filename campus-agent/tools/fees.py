"""Fees tools – let the agent look up tuition, payment info, and financial aid."""

import json
from pathlib import Path

from .services import get_ucu_website_info

DATA_PATH = Path(__file__).parent.parent / "data" / "fees.json"


def _load_fees() -> dict:
    with open(DATA_PATH) as f:
        return json.load(f)


def _is_website_success(result: str) -> bool:
    failed_prefixes = (
        "UCU website request failed",
        "Unable to reach the UCU website",
        "Unknown UCU website topic",
        "Only ucu.ac.ug URLs are allowed",
    )
    return not result.startswith(failed_prefixes)


def get_fee_structure(program: str) -> str:
    """Get the fee structure for a specific academic program.

    Args:
        program: The program name (e.g., 'BSc Computer Science' or 'BA Business Administration')

    Returns:
        Detailed fee breakdown for the program.
    """
    website_result = get_ucu_website_info("fees")
    if _is_website_success(website_result):
        return website_result

    data = _load_fees()
    fee_info = data["tuition"].get(program)

    if not fee_info:
        available = ", ".join(data["tuition"].keys())
        return f"Program '{program}' not found. Available programs: {available}"

    lines = [
        f"💰 Fee Structure: {program}",
        f"   Total per Semester: KES {fee_info['per_semester']:,}\n",
        "   Breakdown:",
    ]
    for item, amount in fee_info["breakdown"].items():
        label = item.replace("_", " ").title()
        lines.append(f"     • {label}: KES {amount:,}")

    return "\n".join(lines)


def get_payment_deadlines(semester: str = "Fall 2026") -> str:
    """Get payment deadlines for a specific semester.

    Args:
        semester: The semester (e.g., 'Fall 2026')

    Returns:
        Payment deadlines and accepted payment methods.
    """
    website_result = get_ucu_website_info("payment")
    if _is_website_success(website_result):
        return website_result

    data = _load_fees()
    deadlines = data["payment_deadlines"].get(semester)

    if not deadlines:
        return f"No deadline info for '{semester}'."

    lines = [
        f"📅 Payment Deadlines – {semester}\n",
        f"  Full Payment:    {deadlines['full_payment']}",
        f"  Installment 1:   {deadlines['installment_1']} (minimum 60%)",
        f"  Installment 2:   {deadlines['installment_2']}",
        f"  Installment 3:   {deadlines['installment_3']}",
        f"  Late Fee:        KES {deadlines['late_fee_per_day']}/day\n",
        "  💳 Payment Methods:",
    ]
    for method in data["payment_methods"]:
        lines.append(f"     • {method}")

    return "\n".join(lines)


def get_financial_aid_info() -> str:
    """Get information about available financial aid options.

    Returns:
        Details about scholarships, bursaries, work-study, and loans.
    """
    website_result = get_ucu_website_info("financial_aid")
    if _is_website_success(website_result):
        return website_result

    data = _load_fees()
    aid = data["financial_aid"]

    lines = ["🎓 Financial Aid Options\n"]
    for aid_type, description in aid.items():
        label = aid_type.replace("_", " ").title()
        lines.append(f"  • {label}: {description}")

    return "\n".join(lines)
