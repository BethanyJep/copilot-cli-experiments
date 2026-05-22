"""
Flask Web UI for the Campus Agent demo.
Provides a clean chat interface for the session presentation.
"""

import os
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify
from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

from agent import SYSTEM_PROMPT, TOOLS, execute_tool_call

load_dotenv()

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

    try:
        client, model = get_client()
        _messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model=model,
            messages=_messages,
            tools=TOOLS,
            tool_choice="auto",
        )

        assistant_message = response.choices[0].message

        # Handle tool-calling loop
        while assistant_message.tool_calls:
            _messages.append(assistant_message)

            for tool_call in assistant_message.tool_calls:
                result = execute_tool_call(tool_call)
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
        return jsonify({"response": assistant_message.content})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


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
