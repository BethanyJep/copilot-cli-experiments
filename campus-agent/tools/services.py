"""Campus services tools – let the agent look up services and registration info."""

import json
from pathlib import Path

DATA_PATH = Path(__file__).parent.parent / "data" / "services.json"


def _load_services() -> dict:
    with open(DATA_PATH) as f:
        return json.load(f)


def get_campus_service(service_name: str) -> str:
    """Get information about a specific campus service.

    Args:
        service_name: The service to look up. Options: library, health_center,
                      it_helpdesk, registrar, career_center, student_housing, cafeteria

    Returns:
        Details about the service including location, hours, and available services.
    """
    data = _load_services()
    services = data["campus_services"]

    # Fuzzy match: allow partial names
    service_key = None
    for key in services:
        if service_name.lower().replace(" ", "_") in key or key in service_name.lower().replace(" ", "_"):
            service_key = key
            break

    if not service_key:
        available = ", ".join(services.keys())
        return f"Service '{service_name}' not found. Available: {available}"

    svc = services[service_key]
    lines = [
        f"🏛️  {svc['name']}",
        f"   📍 Location: {svc['location']}",
        f"   🕐 Hours:    {svc['hours']}",
        f"   📧 Contact:  {svc['contact']}\n",
        "   Services offered:",
    ]
    for service in svc["services"]:
        lines.append(f"     • {service}")

    return "\n".join(lines)


def get_registration_info(topic: str = "process") -> str:
    """Get information about course registration.

    Args:
        topic: What to look up – 'process' for step-by-step guide,
               'dates' for important dates, or 'requirements' for credit rules.

    Returns:
        Registration information based on the requested topic.
    """
    data = _load_services()
    reg = data["registration"]

    if topic == "process":
        lines = ["📋 Course Registration Process\n"]
        for step in reg["process"]:
            lines.append(f"  {step}")
        return "\n".join(lines)

    elif topic == "dates":
        lines = ["📅 Important Dates – Fall 2026\n"]
        for event, date in reg["important_dates"].items():
            label = event.replace("_", " ").title()
            lines.append(f"  • {label}: {date}")
        return "\n".join(lines)

    elif topic == "requirements":
        lines = ["📝 Registration Requirements\n"]
        for req, detail in reg["requirements"].items():
            label = req.replace("_", " ").title()
            lines.append(f"  • {label}: {detail}")
        return "\n".join(lines)

    else:
        return f"Unknown topic '{topic}'. Use: 'process', 'dates', or 'requirements'."
