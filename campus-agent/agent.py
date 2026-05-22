"""
Campus AI Agent – Built with Azure AI Foundry + AI Toolkit
Helps students navigate campus life using tool-calling and prompt engineering.
"""

import os
import json
import logging
from dotenv import load_dotenv
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

from tools import (
    get_class_schedule,
    get_next_class,
    get_fee_structure,
    get_payment_deadlines,
    get_financial_aid_info,
    get_campus_service,
    get_registration_info,
)

load_dotenv()

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("nexus.agent")

# --- System Prompt (Prompt Engineering) ---
SYSTEM_PROMPT = """You are Nexus 🎓, a friendly and knowledgeable campus assistant for university students.

Your role is to help students navigate campus life efficiently so they can focus on what truly matters: learning.

## Personality
- Warm, encouraging, and student-friendly
- Use emojis sparingly to keep things approachable
- Be concise but thorough — students are busy
- If you don't know something, say so honestly and suggest who to contact

## Capabilities (use your tools!)
- **Class Schedules**: Look up a student's timetable, find their next class
- **Fees & Payments**: Explain fee structures, deadlines, payment methods, and financial aid
- **Campus Services**: Provide info about library, health center, IT support, career services, housing, dining
- **Registration**: Guide students through course registration process, dates, and requirements

## Guidelines
- Always use the appropriate tool to fetch accurate, up-to-date information
- When a student asks about fees, always mention financial aid options too
- For schedule questions, offer to show today's classes or the full timetable
- If a student seems stressed, acknowledge their feelings and point them to counseling services
- Proactively suggest related information (e.g., if asking about registration, mention important deadlines)

## Important
- Student IDs for demo: STU001 (Aisha - Computer Science), STU002 (Brian - Business)
- All fees are in Ugandan Shillings (UGX)
- Current semester: Fall 2026
"""

# --- Tool Definitions (OpenAI function-calling format) ---
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_class_schedule",
            "description": "Get the full class schedule/timetable for a student given their student ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "student_id": {
                        "type": "string",
                        "description": "The student's ID, e.g. STU001 or STU002"
                    }
                },
                "required": ["student_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_next_class",
            "description": "Get today's classes for a student based on the current day of the week.",
            "parameters": {
                "type": "object",
                "properties": {
                    "student_id": {
                        "type": "string",
                        "description": "The student's ID, e.g. STU001 or STU002"
                    }
                },
                "required": ["student_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_fee_structure",
            "description": "Get the fee structure and tuition breakdown for a specific academic program.",
            "parameters": {
                "type": "object",
                "properties": {
                    "program": {
                        "type": "string",
                        "description": "The program name, e.g. 'BSc Computer Science' or 'BA Business Administration'"
                    }
                },
                "required": ["program"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_payment_deadlines",
            "description": "Get payment deadlines and accepted payment methods for a semester.",
            "parameters": {
                "type": "object",
                "properties": {
                    "semester": {
                        "type": "string",
                        "description": "The semester, e.g. 'Fall 2026'. Defaults to current semester."
                    }
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_financial_aid_info",
            "description": "Get information about available financial aid options including scholarships, bursaries, work-study, and loans.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_campus_service",
            "description": "Get information about a specific campus service including location, hours, and offerings.",
            "parameters": {
                "type": "object",
                "properties": {
                    "service_name": {
                        "type": "string",
                        "description": "The service to look up: library, health_center, it_helpdesk, registrar, career_center, student_housing, or cafeteria"
                    }
                },
                "required": ["service_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_registration_info",
            "description": "Get course registration information including the process, important dates, or requirements.",
            "parameters": {
                "type": "object",
                "properties": {
                    "topic": {
                        "type": "string",
                        "enum": ["process", "dates", "requirements"],
                        "description": "'process' for step-by-step guide, 'dates' for important dates, 'requirements' for credit rules"
                    }
                },
                "required": ["topic"]
            }
        }
    },
]

# Maps function names to their Python implementations
TOOL_FUNCTIONS = {
    "get_class_schedule": get_class_schedule,
    "get_next_class": get_next_class,
    "get_fee_structure": get_fee_structure,
    "get_payment_deadlines": get_payment_deadlines,
    "get_financial_aid_info": get_financial_aid_info,
    "get_campus_service": get_campus_service,
    "get_registration_info": get_registration_info,
}


def execute_tool_call(tool_call) -> str:
    """Execute a tool call and return the result."""
    function_name = tool_call.function.name
    arguments = json.loads(tool_call.function.arguments)

    func = TOOL_FUNCTIONS.get(function_name)
    if not func:
        return f"Unknown tool: {function_name}"

    try:
        result = func(**arguments)
        return result
    except Exception as e:
        return f"Error calling {function_name}: {str(e)}"


def create_client():
    """Connect to Azure AI Foundry and return an OpenAI-compatible client."""

    project_endpoint = os.getenv("FOUNDRY_PROJECT_ENDPOINT")
    if not project_endpoint:
        raise ValueError(
            "FOUNDRY_PROJECT_ENDPOINT not set. Copy .env.example to .env and configure it.\n"
            "Format: https://<resource>.services.ai.azure.com/api/projects/<project>"
        )

    model = os.getenv("MODEL_DEPLOYMENT_NAME", "gpt-4.1-mini")

    # Connect to Azure AI Foundry using DefaultAzureCredential (az login)
    credential = DefaultAzureCredential()
    project_client = AIProjectClient(
        endpoint=project_endpoint,
        credential=credential,
    )

    # Get an OpenAI-compatible client pointed at Foundry
    openai_client = project_client.get_openai_client()

    print(f"✅ Connected to Azure AI Foundry")
    print(f"   Endpoint: {project_endpoint[:50]}...")
    print(f"   Model: {model}")
    print(f"   Tools: {len(TOOLS)} campus tools registered\n")

    return openai_client, model


def chat(openai_client, model: str, messages: list, user_input: str) -> str:
    """Send a message and handle the tool-calling loop."""

    logger.info("─" * 50)
    logger.info("📨 User query: %s", user_input)

    messages.append({"role": "user", "content": user_input})

    # Call the model with tools
    response = openai_client.chat.completions.create(
        model=model,
        messages=messages,
        tools=TOOLS,
        tool_choice="auto",
    )

    assistant_message = response.choices[0].message
    round_num = 0

    # Tool-calling loop: the agent may call multiple tools before responding
    while assistant_message.tool_calls:
        round_num += 1
        logger.info("🔁 Tool-calling round %d — %d tool(s) requested", round_num, len(assistant_message.tool_calls))

        # Add assistant's message with tool calls
        messages.append(assistant_message)

        # Execute each tool call
        for tool_call in assistant_message.tool_calls:
            fn_name = tool_call.function.name
            fn_args = json.loads(tool_call.function.arguments)
            logger.info("  🔧 Tool called : %s", fn_name)
            logger.info("     Arguments   : %s", json.dumps(fn_args))

            result = execute_tool_call(tool_call)

            try:
                parsed = json.loads(result)
                logger.info("     Result data : %s", json.dumps(parsed, indent=2))
            except (json.JSONDecodeError, TypeError):
                logger.info("     Result data : %s", result)

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": result,
            })

        # Get the model's response after tool execution
        response = openai_client.chat.completions.create(
            model=model,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
        )
        assistant_message = response.choices[0].message

    # Final text response
    messages.append({"role": "assistant", "content": assistant_message.content})
    logger.info("✅ Final response generated (no further tool calls)")
    logger.info("─" * 50)
    return assistant_message.content


def main():
    """Run the interactive campus agent CLI."""

    openai_client, model = create_client()

    # Initialize conversation with system prompt
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    print("=" * 60)
    print("🎓 Nexus – Your Campus Assistant")
    print("   Built with Azure AI Foundry + AI Toolkit")
    print("=" * 60)
    print("Ask me about class schedules, fees, registration, or campus services!")
    print("Type 'quit' to exit.\n")

    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n\n👋 Good luck with your studies!")
            break

        if not user_input:
            continue
        if user_input.lower() in ("quit", "exit", "bye"):
            print("\n👋 Good luck with your studies! Nexus is always here to help.")
            break

        response = chat(openai_client, model, messages, user_input)
        print(f"\n🤖 Nexus: {response}\n")


if __name__ == "__main__":
    main()
