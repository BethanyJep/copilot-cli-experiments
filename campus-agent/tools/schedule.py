"""Schedule tools – let the agent look up class timetables."""

import json
from pathlib import Path
from datetime import datetime

DATA_PATH = Path(__file__).parent.parent / "data" / "schedules.json"


def _load_schedules() -> dict:
    with open(DATA_PATH) as f:
        return json.load(f)


def get_class_schedule(student_id: str) -> str:
    """Get the full class schedule for a student.

    Args:
        student_id: The student's ID (e.g., STU001)

    Returns:
        A formatted string with the student's complete schedule.
    """
    data = _load_schedules()
    student = data["students"].get(student_id)

    if not student:
        return f"Student {student_id} not found. Valid IDs: {', '.join(data['students'].keys())}"

    lines = [
        f"📚 Schedule for {student['name']} ({student['program']}, Year {student['year']})",
        f"   Semester: {student['semester']}\n",
    ]
    for course in student["courses"]:
        lines.append(f"  [{course['code']}] {course['name']}")
        lines.append(f"    Instructor: {course['instructor']}")
        lines.append(f"    Time:       {course['schedule']}")
        lines.append(f"    Room:       {course['room']}")
        lines.append(f"    Credits:    {course['credits']}\n")

    return "\n".join(lines)


def get_next_class(student_id: str) -> str:
    """Get the next upcoming class for a student based on the current day.

    Args:
        student_id: The student's ID (e.g., STU001)

    Returns:
        Information about the student's next class.
    """
    data = _load_schedules()
    student = data["students"].get(student_id)

    if not student:
        return f"Student {student_id} not found."

    day_map = {
        0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 4: "Fri", 5: "Sat", 6: "Sun"
    }
    today = day_map[datetime.now().weekday()]

    today_classes = []
    for course in student["courses"]:
        schedule = course["schedule"]
        # Check if today's day abbreviation is in the schedule string
        if today in schedule:
            today_classes.append(course)

    if not today_classes:
        return f"No classes today ({today}) for {student['name']}. Enjoy your free day! 🎉"

    lines = [f"📅 Today's classes for {student['name']} ({today}):\n"]
    for course in today_classes:
        lines.append(f"  • {course['code']} - {course['name']}")
        lines.append(f"    {course['schedule']} | {course['room']}")
        lines.append(f"    Instructor: {course['instructor']}\n")

    return "\n".join(lines)
