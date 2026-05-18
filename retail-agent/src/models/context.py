"""Data model for the order context passed to each agent."""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

CONFIG_PATH = Path(__file__).resolve().parent.parent.parent / "config" / "order_types.json"


@dataclass
class OrderContext:
    """All the information agents need to process a retail order."""

    order_details: str
    order_type: str  # "standard" | "express" | "subscription"
    rules: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.rules:
            self.rules = self._load_rules()

    def _load_rules(self) -> dict[str, Any]:
        with open(CONFIG_PATH) as f:
            all_rules = json.load(f)
        return all_rules.get(self.order_type, {})

    @property
    def label(self) -> str:
        return self.rules.get("label", self.order_type)
