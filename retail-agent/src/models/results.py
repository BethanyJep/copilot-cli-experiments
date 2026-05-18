"""Result models returned by agents and the orchestrator."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class OrderFlag:
    """A flag or action item on the order."""

    area: str  # e.g. "inventory", "payment", "address"
    description: str
    severity: str  # "critical", "warning", "info"
    agent: str


@dataclass
class OrderComment:
    """A comment or recommendation attached to an order aspect."""

    anchor: str  # what part of the order this refers to
    comment: str
    agent: str
    category: str = ""  # e.g. "order", "delivery", "payment", "dispatch"


@dataclass
class AnnotatedOrder:
    """The order with flags and comments overlaid from all agents."""

    flags: list[OrderFlag] = field(default_factory=list)
    comments: list[OrderComment] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "flags": [
                {
                    "area": f.area,
                    "description": f.description,
                    "severity": f.severity,
                    "agent": f.agent,
                }
                for f in self.flags
            ],
            "comments": [
                {
                    "anchor": c.anchor,
                    "comment": c.comment,
                    "agent": c.agent,
                    "category": c.category,
                }
                for c in self.comments
            ],
        }


@dataclass
class AgentResult:
    """Output produced by a single retail agent."""

    agent_name: str
    findings: str  # markdown-formatted analysis
    suggestions: list[str] = field(default_factory=list)
    cross_references: dict[str, str] = field(default_factory=dict)

    def summary_line(self) -> str:
        return f"[{self.agent_name}] {len(self.suggestions)} action(s)"


@dataclass
class OrderSynthesis:
    """Combined output from all agents after team synthesis."""

    individual_results: list[AgentResult]
    refined_results: list[AgentResult]
    unified_plan: str
    order_type: str
    annotations: AnnotatedOrder = field(default_factory=AnnotatedOrder)
    original_order: str = ""
    trace_id: str = ""
    evaluation_metrics: Any = None

    def format_report(self) -> str:
        lines: list[str] = []
        CYAN = "\033[36m"
        GREEN = "\033[32m"
        RED = "\033[31m"
        YELLOW = "\033[33m"
        DIM = "\033[2m"
        BOLD = "\033[1m"
        RESET = "\033[0m"

        lines.append("=" * 60)
        lines.append(f"  🛒 RETAIL ORDER REPORT — {self.order_type.upper()}")
        lines.append("=" * 60)

        for result in self.refined_results:
            lines.append("")
            lines.append(f"── {result.agent_name} {'─' * (45 - len(result.agent_name))}")
            lines.append(result.findings)
            if result.suggestions:
                lines.append("")
                lines.append("  Actions:")
                for i, s in enumerate(result.suggestions, 1):
                    lines.append(f"    {i}. {s}")
            if result.cross_references:
                lines.append("")
                lines.append("  Cross-agent connections:")
                for agent, note in result.cross_references.items():
                    lines.append(f"    ↔ {agent}: {note}")

        lines.append("")
        lines.append("=" * 60)
        lines.append("  📋 UNIFIED ORDER PLAN")
        lines.append("=" * 60)
        lines.append(self.unified_plan)
        lines.append("")

        if self.annotations and (self.annotations.flags or self.annotations.comments):
            lines.append("=" * 60)
            lines.append("  🚦 ORDER STATUS & FLAGS")
            lines.append("=" * 60)

            if self.annotations.flags:
                lines.append("")
                lines.append("  Flags:")
                for f in self.annotations.flags:
                    severity_color = {
                        "critical": RED,
                        "warning": YELLOW,
                        "info": GREEN,
                    }.get(f.severity, RESET)
                    icon = {"critical": "🔴", "warning": "🟡", "info": "🟢"}.get(
                        f.severity, "⚪"
                    )
                    lines.append(
                        f"    {icon} {severity_color}[{f.severity.upper()}]{RESET} "
                        f"{BOLD}{f.area}{RESET}: {f.description}  "
                        f"{DIM}[{f.agent}]{RESET}"
                    )

            if self.annotations.comments:
                lines.append("")
                lines.append("  Comments:")
                for c in self.annotations.comments:
                    cat = f" ({c.category})" if c.category else ""
                    lines.append(f"    {CYAN}💬 {c.anchor}{RESET}")
                    lines.append(
                        f"       {c.comment}  {DIM}[{c.agent}{cat}]{RESET}"
                    )
            lines.append("")

        return "\n".join(lines)
