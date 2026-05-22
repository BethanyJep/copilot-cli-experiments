#!/usr/bin/env python3
"""Interactive CLI for the Retail multi-agent assistant using Microsoft Agent Framework."""

from __future__ import annotations

import os
import sys

from dotenv import load_dotenv

from agent_framework_openai import OpenAIChatClient
from azure.identity import AzureCliCredential

from src.orchestrator import RetailOrchestrator

load_dotenv()

ORDER_TYPES = {
    "1": "standard",
    "2": "express",
    "3": "subscription",
}

SAMPLE_ORDERS = {
    "1": (
        "Customer: Amina Namusoke, amina.namusoke@gmail.com, +256 772 345 678\n"
        "Delivery Address: Ntinda, Kampala, Uganda\n"
        "Items:\n"
        "  - 2x Wireless Bluetooth Earbuds (UGX 95,000 each)\n"
        "  - 1x USB-C Charging Cable (UGX 25,000)\n"
        "  - 1x Laptop Cooling Stand (UGX 75,000)\n"
        "Payment: MTN MoMo (0772345678)\n"
        "Promo Code: SAVE10"
    ),
    "2": (
        "Customer: Daniel Okello, daniel.okello@gmail.com, +256 783 987 654\n"
        "Delivery Address: Kiwatule, Kampala, Uganda\n"
        "Items:\n"
        "  - 1x Samsung 4K Smart TV 55\" (UGX 2,850,000)\n"
        "  - 1x HDMI Cable 2.1 (UGX 75,000)\n"
        "  - 1x Universal TV Wall Mount (UGX 180,000)\n"
        "Payment: Stanbic Bank Card ending in 7891\n"
        "Notes: Gift wrap requested, must arrive before Saturday"
    ),
    "3": (
        "Customer: Grace Achieng, grace@outlook.com, +256 702 654 321\n"
        "Delivery Address: Makindye, Kampala, Uganda\n"
        "Items:\n"
        "  - Monthly Tea Subscription - Rwenzori Gold Premium Blend (500g)\n"
        "  - Add-on: Ugandan Organic Coffee Pack (250g)\n"
        "Frequency: Monthly (next shipment: May 1)\n"
        "Payment: Stored MTN MoMo Merchant Code 123456\n"
        "Subscriber since: January 2025\n"
        "Loyalty Points: 2,400"
    ),
}


def get_order_details() -> str:
    """Read order details from user input."""
    print("\n📦 How would you like to provide the order?")
    print("  1. Use a sample order")
    print("  2. Enter custom order details")
    choice = input("\nEnter choice (1/2): ").strip()

    if choice == "1":
        print("\n📋 Select a sample order:")
        print("  1. Standard retail order (earbuds, cable, laptop stand — Kampala)")
        print("  2. Express gift order (Smart TV — Kampala)")
        print("  3. Subscription order (monthly Rwenzori tea — Kampala)")
        sample = input("\nEnter choice (1/2/3): ").strip()
        order = SAMPLE_ORDERS.get(sample)
        if order:
            print(f"\n--- Order Details ---\n{order}\n---")
            return order
        print("Invalid choice, using sample 1.")
        print(f"\n--- Order Details ---\n{SAMPLE_ORDERS['1']}\n---")
        return SAMPLE_ORDERS["1"]

    print("\n📋 Enter order details below (press Enter twice on an empty line to finish):\n")
    lines: list[str] = []
    empty_count = 0
    while True:
        try:
            line = input()
        except EOFError:
            break
        if line == "":
            empty_count += 1
            if empty_count >= 2:
                break
            lines.append(line)
        else:
            empty_count = 0
            lines.append(line)
    return "\n".join(lines).strip()


def get_order_type() -> str:
    """Prompt user to select an order type."""
    print("\n🔖 Select order type:")
    print("  1. Standard Order")
    print("  2. Express Order")
    print("  3. Subscription Order")
    choice = input("\nEnter choice (1/2/3): ").strip()
    order_type = ORDER_TYPES.get(choice)
    if not order_type:
        print("Invalid choice — defaulting to 'standard'.")
        order_type = "standard"
    return order_type


def main() -> None:
    endpoint = os.environ.get("AZURE_OPENAI_ENDPOINT")
    deployment = os.environ.get("AZURE_OPENAI_CHAT_DEPLOYMENT_NAME", "gpt-4o-mini")
    api_key = os.environ.get("AZURE_OPENAI_API_KEY")

    if not endpoint:
        print("❌ Please set AZURE_OPENAI_ENDPOINT environment variable.")
        print("   Create a .env file from .env.example:")
        print("   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/")
        print("   AZURE_OPENAI_CHAT_DEPLOYMENT_NAME=gpt-4o-mini")
        print("   AZURE_OPENAI_API_KEY=your-api-key (optional if using Azure CLI auth)")
        sys.exit(1)

    if api_key:
        client = OpenAIChatClient(
            deployment,
            azure_endpoint=endpoint,
            api_key=api_key,
        )
    else:
        client = OpenAIChatClient(
            deployment,
            azure_endpoint=endpoint,
            credential=AzureCliCredential(),
        )

    orchestrator = RetailOrchestrator(client, model=deployment)

    print("=" * 60)
    print("  🛒  Duka Agent — Multi-Agent Order Processor (Uganda)")
    print("  📦 Powered by Microsoft Agent Framework")
    print("=" * 60)

    while True:
        order_details = get_order_details()
        if not order_details:
            print("No order provided. Exiting.")
            break

        order_type = get_order_type()
        synthesis = orchestrator.run(order_details, order_type)
        print("\n" + synthesis.format_report())

        again = input("\n🔄 Process another order? (y/n): ").strip().lower()
        if again != "y":
            print("👋 Goodbye!")
            break


if __name__ == "__main__":
    main()
