"""
Flask Web UI for the Campus Agent demo.
Provides a clean chat interface for the session presentation.
"""

import os
import json
import logging
import datetime
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

from agent import SYSTEM_PROMPT, TOOLS, execute_tool_call

load_dotenv()

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("nexus.web")

app = Flask(__name__)

# Session state
_openai_client = None
_model = None
_messages = None


def get_client():
    global _openai_client, _model, _messages

    if _openai_client is None:
        project_endpoint = os.getenv("FOUNDRY_PROJECT_ENDPOINT")
        _model = os.getenv("MODEL_DEPLOYMENT_NAME", "gpt-4o-mini")
        credential = DefaultAzureCredential()

        project_client = AIProjectClient(
            endpoint=project_endpoint,
            credential=credential,
        )
        _openai_client = project_client.get_openai_client()
        _messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    return _openai_client, _model


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    global _messages
    data = request.json
    user_message = data.get("message", "").strip()

    if not user_message:
        return jsonify({"error": "Empty message"}), 400

    def now():
        return datetime.datetime.now().strftime("%H:%M:%S")

    logs = []

    try:
        client, model = get_client()

        logger.info("─" * 50)
        logger.info("📨 User query: %s", user_message)
        logs.append({"type": "query", "time": now(), "msg": f"📨 {user_message}"})

        _messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model=model,
            messages=_messages,
            tools=TOOLS,
            tool_choice="auto",
        )

        assistant_message = response.choices[0].message
        round_num = 0

        # Handle tool-calling loop
        while assistant_message.tool_calls:
            round_num += 1
            logger.info("🔁 Tool-calling round %d — %d tool(s) requested", round_num, len(assistant_message.tool_calls))
            logs.append({"type": "round", "time": now(), "msg": f"🔁 Round {round_num} — {len(assistant_message.tool_calls)} tool call(s)"})
            _messages.append(assistant_message)

            for tool_call in assistant_message.tool_calls:
                fn_name = tool_call.function.name
                fn_args = json.loads(tool_call.function.arguments)
                logger.info("  🔧 Tool called : %s", fn_name)
                logger.info("     Arguments   : %s", json.dumps(fn_args))
                logs.append({"type": "tool", "time": now(), "msg": f"🔧 {fn_name}", "detail": json.dumps(fn_args, indent=2)})

                result = execute_tool_call(tool_call)

                try:
                    parsed = json.loads(result)
                    detail = json.dumps(parsed, indent=2)
                    logger.info("     Result data : %s", detail)
                except (json.JSONDecodeError, TypeError):
                    detail = result
                    logger.info("     Result data : %s", result)

                logs.append({"type": "result", "time": now(), "msg": f"📦 {fn_name} result", "detail": detail})

                _messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": result,
                })

            response = client.chat.completions.create(
                model=model,
                messages=_messages,
                tools=TOOLS,
                tool_choice="auto",
            )
            assistant_message = response.choices[0].message

        _messages.append({"role": "assistant", "content": assistant_message.content})
        logger.info("✅ Final response generated (no further tool calls)")
        logger.info("─" * 50)
        logs.append({"type": "final", "time": now(), "msg": "✅ Response ready"})
        return jsonify({"response": assistant_message.content, "logs": logs})

    except Exception as e:
        logs.append({"type": "error", "time": now(), "msg": f"❌ Error: {str(e)}"})
        return jsonify({"error": str(e), "logs": logs}), 500


@app.route("/reset", methods=["POST"])
def reset():
    global _messages
    _messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    return jsonify({"status": "ok", "message": "Conversation reset"})


@app.route("/health")
def health():
    return jsonify({"status": "healthy", "agent": "Nexus 🎓"})


if __name__ == "__main__":
    print("🎓 Starting Nexus Web UI on http://localhost:5001")
    app.run(debug=True, port=5001)
