"""Campus services tools – let the agent look up services and registration info."""

import json
çimport re
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

DATA_PATH = Path(__file__).parent.parent / "data" / "services.json"
UCU_BASE_URL = "https://ucu.ac.ug"
UCU_TOPIC_URLS = {
    "admissions": f"{UCU_BASE_URL}/application-procedures/",
    "application": f"{UCU_BASE_URL}/application-procedures/",
    "fees": f"{UCU_BASE_URL}/Downloads/FEES-STRUCTURE-2025-INTAKE.pdf",
    "fee_structure": f"{UCU_BASE_URL}/Downloads/FEES-STRUCTURE-2025-INTAKE.pdf",
    "payment": f"{UCU_BASE_URL}/application-procedures/",
    "payment_methods": f"{UCU_BASE_URL}/application-procedures/",
    "financial_aid": f"{UCU_BASE_URL}/application-procedures/",
    "scholarships": f"{UCU_BASE_URL}/application-procedures/",
    "academics": f"{UCU_BASE_URL}/academics/",
    "programmes": f"{UCU_BASE_URL}/undergraduate-programs/",
    "undergraduate": f"{UCU_BASE_URL}/undergraduate-programs/",
    "postgraduate": f"{UCU_BASE_URL}/postgraduate-programs/",
    "international_students": f"{UCU_BASE_URL}/international-students/",
    "library": "https://library.ucu.ac.ug/",
    "contact": f"{UCU_BASE_URL}/contact-us/",
    "emergency_numbers": f"{UCU_BASE_URL}/emergency-numbers/",
    "about": f"{UCU_BASE_URL}/about-us/",
}

SERVICE_TOPIC_HINTS = {
    "library": "library",
    "health_center": "contact",
    "it_helpdesk": "contact",
    "registrar": "admissions",
    "career_center": "about",
    "student_housing": "about",
    "cafeteria": "about",
}


class _HTMLTextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self._skip_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "noscript"}:
            self._skip_depth += 1

    def handle_endtag(self, tag):
        if tag in {"script", "style", "noscript"} and self._skip_depth:
            self._skip_depth -= 1

    def handle_data(self, data):
        if self._skip_depth:
            return
        text = data.strip()
        if text:
            self.parts.append(text)


def _clean_web_text(html: str) -> str:
    parser = _HTMLTextExtractor()
    parser.feed(html)
    text = "\n".join(parser.parts)
    text = re.sub(r"\n{2,}", "\n", text)
    return text[:1800]


def _resolve_ucu_url(topic: str) -> str:
    candidate = topic.strip().lower().replace(" ", "_")
    if candidate.startswith("http://") or candidate.startswith("https://"):
        parsed = urlparse(topic)
        if parsed.netloc.endswith("ucu.ac.ug"):
            return topic
        raise ValueError("Only ucu.ac.ug URLs are allowed for this tool.")

    if candidate in UCU_TOPIC_URLS:
        return UCU_TOPIC_URLS[candidate]

    for key, url in UCU_TOPIC_URLS.items():
        if candidate in key or key in candidate:
            return url

    available = ", ".join(sorted(UCU_TOPIC_URLS))
    raise ValueError(f"Unknown UCU website topic '{topic}'. Available topics: {available}")


def get_ucu_website_info(topic: str) -> str:
    """Fetch concise information from the official UCU website.

    Args:
        topic: A supported topic such as admissions, academics, programmes,
               postgraduate, international_students, contact, or a full UCU URL.

    Returns:
        A cleaned summary from the requested UCU page.
    """
    url = _resolve_ucu_url(topic)

    if url.lower().endswith(".pdf"):
        return f"Official UCU resource for {topic}: {url}"

    request = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; NexusCampusAgent/1.0)"
        },
    )

    try:
        with urlopen(request, timeout=10) as response:
            html = response.read().decode("utf-8", errors="ignore")
    except HTTPError as exc:
        return f"UCU website request failed with status {exc.code} for {url}"
    except URLError as exc:
        return f"Unable to reach the UCU website for {url}: {exc.reason}"

    text = _clean_web_text(html)
    return f"Official UCU website source: {url}\n\n{text}"


def _is_website_success(result: str) -> bool:
    failed_prefixes = (
        "UCU website request failed",
        "Unable to reach the UCU website",
        "Unknown UCU website topic",
        "Only ucu.ac.ug URLs are allowed",
    )
    return not result.startswith(failed_prefixes)


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

    # Website-first grounding for services.
    website_topic = SERVICE_TOPIC_HINTS.get(service_key, "about")
    website_result = get_ucu_website_info(website_topic)
    if _is_website_success(website_result):
        return website_result

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
    website_result = get_ucu_website_info("admissions")
    if _is_website_success(website_result):
        return website_result

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
