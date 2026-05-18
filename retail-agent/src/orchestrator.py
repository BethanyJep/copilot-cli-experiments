"""RetailOrchestrator — coordinates the multi-agent retail workflow using Microsoft Agent Framework."""

from __future__ import annotations

import asyncio
import json
import logging
from dataclasses import dataclass
from time import perf_counter
from typing import Any

from agent_framework import Agent, Message
from agent_framework_openai import OpenAIChatClient
from agent_framework.orchestrations import ConcurrentBuilder

from src.agents.base import AGENT_CONFIGS, create_agent, create_refinement_agent
from src.models.context import OrderContext
from src.models.results import AgentResult, AnnotatedOrder, OrderComment, OrderFlag, OrderSynthesis

logger = logging.getLogger(__name__)


def parse_agent_response(agent_name: str, response_text: str) -> AgentResult:
    """Parse an agent's response into an AgentResult."""
    try:
        data: dict[str, Any] = json.loads(response_text)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown fences
        cleaned = response_text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned
            cleaned = cleaned.rsplit("```", 1)[0]
            try:
                data = json.loads(cleaned)
            except json.JSONDecodeError:
                data = {"findings": response_text, "suggestions": [], "cross_references": {}}
        else:
            data = {"findings": response_text, "suggestions": [], "cross_references": {}}

    return AgentResult(
        agent_name=agent_name,
        findings=data.get("findings", response_text),
        suggestions=data.get("suggestions", []),
        cross_references=data.get("cross_references", {}),
    )


class RetailOrchestrator:
    """Coordinates four specialist agents through a 3-phase retail workflow using Microsoft Agent Framework."""

    def __init__(self, client: OpenAIChatClient, model: str = "gpt-4o-mini") -> None:
        self.client = client
        self.model = model
        self.agent_names = list(AGENT_CONFIGS.keys())

    def run(self, order_details: str, order_type: str) -> OrderSynthesis:
        """Execute the full 3-phase retail workflow."""
        return asyncio.run(self._run_async(order_details, order_type))

    async def _run_async(self, order_details: str, order_type: str) -> OrderSynthesis:
        """Async implementation of the retail workflow."""
        context = OrderContext(order_details=order_details, order_type=order_type)
        start_time = perf_counter()

        print(f"\n🛒 Processing {context.label}…")

        # Phase 1 — parallel independent analysis using ConcurrentBuilder
        print("  Phase 1: Independent agent analysis…")
        phase1_start = perf_counter()
        phase1_results = await self._run_parallel_analysis(context)
        phase1_duration = perf_counter() - phase1_start
        for r in phase1_results:
            print(f"    ✓ {r.summary_line()}")

        # Phase 2 — team synthesis (each agent refines with awareness of others)
        print("  Phase 2: Team synthesis…")
        phase2_start = perf_counter()
        phase2_results = await self._run_team_synthesis(phase1_results, context)
        phase2_duration = perf_counter() - phase2_start
        for r in phase2_results:
            print(f"    ✓ {r.summary_line()} (refined)")

        # Phase 3 — unified order plan + annotations
        print("  Phase 3: Generating unified order plan…")
        phase3_start = perf_counter()
        unified = await self._generate_unified_plan(phase2_results, context)
        print("  Phase 3b: Generating order annotations…")
        annotations = await self._generate_annotations(phase2_results, context)
        phase3_duration = perf_counter() - phase3_start

        total_duration = perf_counter() - start_time
        print(f"\n  ✅ Order processing complete in {total_duration:.1f}s")

        return OrderSynthesis(
            individual_results=phase1_results,
            refined_results=phase2_results,
            unified_plan=unified,
            order_type=context.label,
            annotations=annotations,
            original_order=order_details,
        )

    async def _run_parallel_analysis(self, context: OrderContext) -> list[AgentResult]:
        """Run parallel analysis using ConcurrentBuilder fan-out/fan-in pattern."""
        agents: list[Agent] = []
        for name, config in AGENT_CONFIGS.items():
            instructions = config["get_instructions"](context)
            agent = create_agent(
                self.client,
                name=name,
                role_description=config["role_description"],
                order_type_instructions=instructions,
                context=context,
            )
            agents.append(agent)

        # Build concurrent workflow
        workflow = ConcurrentBuilder(participants=agents).build()

        user_prompt = f"Process the following {context.label}:\n\n{context.order_details}"

        results: list[AgentResult] = []
        async for event in workflow.run(user_prompt, stream=True):
            if event.type == "output":
                output_data = event.data
                if isinstance(output_data, list):
                    for i, msg in enumerate(output_data):
                        agent_name = self.agent_names[i] if i < len(self.agent_names) else f"Agent {i}"
                        text = msg.text if hasattr(msg, "text") else str(msg)
                        result = parse_agent_response(agent_name, text or "")
                        results.append(result)

        # Fallback: run agents individually if concurrent workflow doesn't return expected output
        if not results:
            results = await self._run_agents_individually(agents, context)

        return results

    async def _run_agents_individually(
        self, agents: list[Agent], context: OrderContext
    ) -> list[AgentResult]:
        """Fallback: run agents individually if concurrent workflow doesn't return expected output."""
        user_prompt = f"Process the following {context.label}:\n\n{context.order_details}"

        async def run_single_agent(agent: Agent, name: str) -> AgentResult:
            response = await agent.run(user_prompt)
            return parse_agent_response(name, response.text or "")

        tasks = [
            run_single_agent(agent, name)
            for agent, name in zip(agents, self.agent_names)
        ]
        return list(await asyncio.gather(*tasks))

    async def _run_team_synthesis(
        self,
        phase1_results: list[AgentResult],
        context: OrderContext,
    ) -> list[AgentResult]:
        """Run team synthesis phase where agents refine their analysis."""
        agents: list[Agent] = []
        for name, config in AGENT_CONFIGS.items():
            agent = create_refinement_agent(
                self.client,
                name=name,
                role_description=config["role_description"],
                context=context,
            )
            agents.append(agent)

        phase1_by_name = {r.agent_name: r for r in phase1_results}

        async def run_refinement(agent: Agent, name: str, own_result: AgentResult) -> AgentResult:
            teammates = "\n\n".join(
                f"### {r.agent_name}\n{r.findings}\nActions: {r.suggestions}"
                for r in phase1_results
                if r.agent_name != name
            )
            prompt = (
                f"Original order ({context.label}):\n{context.order_details}\n\n"
                f"--- YOUR INITIAL ANALYSIS ---\n{own_result.findings}\n"
                f"Your actions: {own_result.suggestions}\n\n"
                f"--- TEAMMATES' FINDINGS ---\n{teammates}\n\n"
                "Refine your analysis considering the above. Produce updated JSON."
            )
            response = await agent.run(prompt)
            return parse_agent_response(name, response.text or "")

        tasks = [
            run_refinement(agent, name, phase1_by_name.get(name, phase1_results[i]))
            for i, (agent, name) in enumerate(zip(agents, self.agent_names))
        ]
        return list(await asyncio.gather(*tasks))

    async def _generate_unified_plan(
        self,
        refined_results: list[AgentResult],
        context: OrderContext,
    ) -> str:
        """Generate unified order plan using a lead coordinator agent."""
        all_findings = "\n\n".join(
            f"### {r.agent_name}\n{r.findings}\nActions: {r.suggestions}"
            for r in refined_results
        )

        lead_coordinator = self.client.as_agent(
            name="Lead Coordinator",
            instructions=(
                "You are the lead coordinator synthesising your team's findings into "
                "a clear, actionable order fulfillment plan. Your plan should cover:\n\n"
                "1. **Order Summary** — what's being ordered, validated status\n"
                "2. **Payment Status** — payment verification, totals, any issues\n"
                "3. **Delivery Plan** — selected shipping method, estimated dates\n"
                "4. **Dispatch Readiness** — warehouse, packing, all prerequisites\n"
                "5. **Blockers & Risks** — anything preventing dispatch\n"
                "6. **Recommended Next Steps** — prioritised actions to complete the order\n\n"
                "Highlight cross-agent agreements and note any tensions. Be concise and practical."
            ),
        )

        prompt = (
            f"Order type: {context.label}\n\n"
            f"Original order:\n{context.order_details}\n\n"
            f"--- TEAM FINDINGS ---\n{all_findings}\n\n"
            "Produce a unified, prioritised order fulfillment plan."
        )

        response = await lead_coordinator.run(prompt)
        return response.text or ""

    async def _generate_annotations(
        self,
        refined_results: list[AgentResult],
        context: OrderContext,
    ) -> AnnotatedOrder:
        """Generate structured flags and comments for the order."""
        all_findings = "\n\n".join(
            f"### {r.agent_name}\n{r.findings}\nActions: {r.suggestions}"
            for r in refined_results
        )

        annotator = self.client.as_agent(
            name="Order Annotator",
            instructions=(
                "You are a retail operations assistant. Given the original order and "
                "team findings, produce a JSON object with two arrays:\n\n"
                '1. "flags": order status flags. Each object has:\n'
                '   - "area": what area this flag covers (e.g. "inventory", "payment", "address", "shipping")\n'
                '   - "description": what the flag is about\n'
                '   - "severity": one of "critical", "warning", "info"\n'
                '   - "agent": which agent raised this\n\n'
                '2. "comments": operational comments. Each object has:\n'
                '   - "anchor": what part of the order this refers to\n'
                '   - "comment": the recommendation or observation\n'
                '   - "agent": which agent this is from\n'
                '   - "category": one of "order", "delivery", "payment", "dispatch"\n\n'
                "IMPORTANT:\n"
                "- Use 'critical' severity for blockers that prevent dispatch\n"
                "- Use 'warning' for issues that should be addressed but don't block dispatch\n"
                "- Use 'info' for informational notes and optimizations\n"
                "- Respond ONLY with the JSON object, no other text."
            ),
        )

        prompt = (
            f"Order type: {context.label}\n\n"
            f"=== ORIGINAL ORDER ===\n{context.order_details}\n\n"
            f"=== TEAM FINDINGS ===\n{all_findings}\n\n"
            "Produce the JSON with flags and comments."
        )

        response = await annotator.run(prompt)
        raw = response.text or "{}"

        # Parse the JSON response
        try:
            cleaned = raw.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1]
                cleaned = cleaned.rsplit("```", 1)[0]
            data: dict = json.loads(cleaned)
        except json.JSONDecodeError:
            logger.warning("Failed to parse annotation JSON, returning empty annotations")
            return AnnotatedOrder()

        flags = [
            OrderFlag(
                area=f.get("area", ""),
                description=f.get("description", ""),
                severity=f.get("severity", "info"),
                agent=f.get("agent", ""),
            )
            for f in data.get("flags", [])
        ]
        comments = [
            OrderComment(
                anchor=c.get("anchor", ""),
                comment=c.get("comment", ""),
                agent=c.get("agent", ""),
                category=c.get("category", ""),
            )
            for c in data.get("comments", [])
        ]

        return AnnotatedOrder(flags=flags, comments=comments)
