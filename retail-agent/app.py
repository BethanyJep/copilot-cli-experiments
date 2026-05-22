#!/usr/bin/env python3
"""Flask web UI for the Retail multi-agent assistant using Microsoft Agent Framework."""

from __future__ import annotations

from collections import deque
import logging
import os
from threading import Lock
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

from agent_framework_openai import OpenAIChatClient
from azure.identity import AzureCliCredential

from src.orchestrator import RetailOrchestrator

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

MAX_LOG_LINES = 500
_LOG_BUFFER = deque(maxlen=MAX_LOG_LINES)
_LOG_LOCK = Lock()
_LOG_COUNTER = 0


class InMemoryLogHandler(logging.Handler):
    """Capture log lines in memory so the web UI can fetch them."""

    def emit(self, record: logging.LogRecord) -> None:
        global _LOG_COUNTER
        try:
            message = self.format(record)
        except Exception:
            message = record.getMessage()

        with _LOG_LOCK:
            _LOG_COUNTER += 1
            _LOG_BUFFER.append(
                {
                    "id": _LOG_COUNTER,
                    "level": record.levelname,
                    "logger": record.name,
                    "message": message,
                }
            )


def _setup_log_capture() -> None:
    """Attach one in-memory handler to root logger for live UI streaming."""
    root_logger = logging.getLogger()
    already_attached = any(
        isinstance(handler, InMemoryLogHandler) for handler in root_logger.handlers
    )
    if already_attached:
        return

    memory_handler = InMemoryLogHandler()
    memory_handler.setLevel(logging.INFO)
    memory_handler.setFormatter(
        logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s")
    )
    root_logger.addHandler(memory_handler)


_setup_log_capture()

ORDER_TYPES = {
    "standard": "Kawaida (Standard Order)",
    "express": "Haraka (Express Order)",
    "subscription": "Kujiunga (Subscription Order)",
}


def get_client() -> OpenAIChatClient:
    """Create Azure OpenAI Chat Client."""
    endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT")
    deployment = os.environ.get("AZURE_OPENAI_CHAT_DEPLOYMENT_NAME", "gpt-4o-mini")
    api_key = os.environ.get("AZURE_OPENAI_API_KEY")

    if not endpoint:
        raise ValueError("AZURE_OPENAI_ENDPOINT environment variable is required")

    if api_key:
        return OpenAIChatClient(
            deployment,
            azure_endpoint=endpoint,
            api_key=api_key,
        )
    else:
        return OpenAIChatClient(
            deployment,
            azure_endpoint=endpoint,
            credential=AzureCliCredential(),
        )


@app.route("/")
def index():
    """Render the main page."""
    return render_template("index.html", order_types=ORDER_TYPES)


@app.route("/process", methods=["POST"])
def process_order():
    """Process an order using the multi-agent system."""
    try:
        data = request.get_json()
        order_details = data.get("order_details", "").strip()
        order_type = data.get("order_type", "standard")

        logger.info("Received order request (type=%s)", order_type)

        if not order_details:
            return jsonify({"error": "No order details provided"}), 400

        if order_type not in ORDER_TYPES:
            return jsonify({"error": "Invalid order type"}), 400

        client = get_client()
        deployment = os.environ.get("AZURE_OPENAI_CHAT_DEPLOYMENT_NAME", "gpt-4o-mini")
        orchestrator = RetailOrchestrator(client, model=deployment)

        synthesis = orchestrator.run(order_details, order_type)

        results = {
            "order_type": synthesis.order_type,
            "original_order": order_details,
            "individual_results": [
                {
                    "agent_name": r.agent_name,
                    "findings": r.findings,
                    "suggestions": r.suggestions,
                    "cross_references": r.cross_references,
                }
                for r in synthesis.individual_results
            ],
            "refined_results": [
                {
                    "agent_name": r.agent_name,
                    "findings": r.findings,
                    "suggestions": r.suggestions,
                    "cross_references": r.cross_references,
                }
                for r in synthesis.refined_results
            ],
            "unified_plan": synthesis.unified_plan,
            "annotations": synthesis.annotations.to_dict(),
        }

        logger.info("Order processing completed successfully")
        return jsonify(results)

    except Exception as e:
        logger.exception("Error during order processing")
        return jsonify({"error": str(e)}), 500


@app.route("/logs", methods=["GET"])
def get_logs():
    """Return captured logs for live display in the web UI."""
    since = request.args.get("since", default="0")
    try:
        since_id = int(since)
    except ValueError:
        since_id = 0

    with _LOG_LOCK:
        lines = [line for line in _LOG_BUFFER if line["id"] > since_id]
        last_id = _LOG_COUNTER

    return jsonify({"logs": lines, "last_id": last_id})


@app.route("/logs/reset", methods=["POST"])
def reset_logs():
    """Clear captured logs so each run starts with a clean log view."""
    global _LOG_COUNTER
    with _LOG_LOCK:
        _LOG_BUFFER.clear()
        _LOG_COUNTER = 0
    logger.info("Log buffer reset")
    return jsonify({"status": "ok"})


@app.route("/health")
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    app.run(debug=True, host="0.0.0.0", port=port)
