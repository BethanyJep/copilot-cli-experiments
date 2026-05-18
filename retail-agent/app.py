#!/usr/bin/env python3
"""Flask web UI for the Retail multi-agent assistant using Microsoft Agent Framework."""

from __future__ import annotations

import logging
import os
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


@app.route("/health")
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5002))
    app.run(debug=True, host="0.0.0.0", port=port)
