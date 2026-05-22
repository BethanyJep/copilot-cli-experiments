from .schedule import get_class_schedule, get_next_class
from .fees import get_fee_structure, get_payment_deadlines, get_financial_aid_info
from .services import get_campus_service, get_registration_info, get_ucu_website_info

__all__ = [
    "get_class_schedule",
    "get_next_class",
    "get_fee_structure",
    "get_payment_deadlines",
    "get_financial_aid_info",
    "get_campus_service",
    "get_registration_info",
    "get_ucu_website_info",
]
