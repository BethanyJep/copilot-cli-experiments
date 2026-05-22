# Retail Agent — Multi-Agent Order Processor

A collaborative multi-agent retail order processing system powered by **Microsoft Agent Framework**, where four specialist agents work as a team — sharing insights and building on each other's findings — to process orders from intake through to dispatch readiness. Each agent adapts its analysis based on order type (standard, express, subscription).

Inspired by the [writing-editor](https://github.com/BethanyJep/writing-editor) multi-agent architecture.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Customer Order Input                       │
│              (standard / express / subscription)              │
└──────────────────────────┬──────────────────────────────────┘
                           │
              Phase 1: Independent Analysis (parallel)
                           │
         ┌─────────┬───────┴───────┬──────────┐
         ▼         ▼               ▼          ▼
    ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐
    │  Order  │ │ Delivery │ │ Payment │ │ Dispatch │
    │  Agent  │ │  Agent   │ │  Agent  │ │  Agent   │
    └────┬────┘ └────┬─────┘ └────┬────┘ └────┬─────┘
         │           │            │            │
         └─────────┬─┴────────┬──┘────────────┘
                   │           │
              Phase 2: Team Synthesis
              (agents refine with awareness of teammates)
                   │           │
         ┌─────────┴───────────┴──────────┐
         ▼                                ▼
    ┌──────────────────────────────────────────┐
    │         Lead Coordinator Agent            │
    │    Phase 3: Unified Order Plan            │
    │    + Order Annotator (flags & comments)   │
    └──────────────────────────────────────────┘
                       │
                       ▼
              📋 Order Fulfillment Plan
              🚦 Flags & Dispatch Readiness
```

## Agents

| Agent | Responsibility | Order-Type Adaptations |
|-------|---------------|------------------------|
| **Order Agent** | Validates items, checks availability, applies catalog pricing, confirms quantities | Standard: normal processing. Express: real-time stock, inventory reservation. Subscription: recurring items, tier benefits. |
| **Delivery Agent** | Determines shipping options, estimates delivery times, validates addresses | Standard: 5-7 day shipping. Express: same-day/next-day with cutoff times. Subscription: scheduled delivery windows. |
| **Payment Agent** | Validates payment, calculates totals with tax/discounts, checks fraud signals | Standard: all methods, standard discounts. Express: instant methods, surcharges. Subscription: stored payment, subscriber discounts. |
| **Dispatch Agent** | Plans warehouse fulfillment, picking/packing, shipping documentation, dispatch prerequisites | Standard: nearest warehouse, batch-friendly. Express: closest to destination, priority lane. Subscription: pre-pick, branded packaging. |

## Workflow

1. **Phase 1 — Parallel Analysis**: All 4 agents analyze the order simultaneously using ConcurrentBuilder (fan-out)
2. **Phase 2 — Team Synthesis**: Each agent refines their analysis considering teammates' findings (fan-in/fan-out)
3. **Phase 3 — Unified Output**: Lead Coordinator synthesizes all recommendations into an actionable order plan

### What It Takes for an Order to Be Dispatched

The multi-agent system evaluates dispatch readiness across all dimensions:

- ✅ **Order validated** — all items available, quantities confirmed, pricing correct
- ✅ **Payment authorized** — payment method valid, funds available, fraud check passed
- ✅ **Delivery planned** — shipping method selected, address validated, carrier assigned
- ✅ **Dispatch ready** — warehouse assigned, items picked & packed, label generated

Any **critical flags** from any agent will block dispatch until resolved.

## Supported Order Types

- **standard**: Normal retail order — balanced processing across all agents
- **express**: Rush/priority order — real-time inventory, fast payment, priority dispatch
- **subscription**: Recurring order — scheduled delivery, stored payment, loyalty benefits

## Project Structure

```
retail-agent/
├── client.py                 # Interactive CLI
├── app.py                    # Flask web UI
├── requirements.txt          # Microsoft Agent Framework dependencies
├── .env.example              # Azure OpenAI configuration template
├── README.md
│
├── src/
│   ├── __init__.py
│   ├── orchestrator.py       # RetailOrchestrator using ConcurrentBuilder
│   │
│   ├── agents/
│   │   ├── __init__.py
│   │   └── base.py           # Agent factory functions & AGENT_CONFIGS
│   │
│   └── models/
│       ├── __init__.py
│       ├── context.py        # OrderContext
│       └── results.py        # AgentResult, OrderSynthesis
│
├── templates/                # Flask HTML templates
│   ├── base.html
│   └── index.html
│
├── static/css/               # Flask static assets
│   └── style.css
│
└── config/
    └── order_types.json      # Order-type specific rules
```

## Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Azure OpenAI** — Create a `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env with your Azure OpenAI credentials
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
   AZURE_OPENAI_CHAT_DEPLOYMENT_NAME=gpt-4o-mini
   ```

3. **Authenticate** (if not using API key):
   ```bash
   az login
   ```

## Usage

### CLI Mode
```bash
python client.py
```

The CLI offers sample orders and custom order input. It walks through:
- Order type selection (standard/express/subscription)
- 3-phase multi-agent processing
- Full report with flags, agent analysis, and unified plan

### Web UI Mode
```bash
python app.py
# Open http://localhost:5002
```

The web UI provides a form to enter orders, load samples, and view results with:
- 🚦 Color-coded severity flags (critical/warning/info)
- 🤖 Per-agent analysis with cross-references
- 📋 Unified order fulfillment plan
- 💬 Operational comments

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main web UI |
| `/process` | POST | Process an order (JSON body: `order_details`, `order_type`) |
| `/health` | GET | Health check |

## Example Output

```
============================================================
  🛒 RETAIL ORDER REPORT — STANDARD ORDER
============================================================

── Order Agent ─────────────────────────────────────────────
  Items validated: 3 items, all in stock
  Subtotal: UGX 2,875,000
  Promo SAVE10 applied: -UGX 287,500

  Actions:
    1. Reserve inventory for 2x Wireless Headphones
    2. Apply SAVE10 promo code (10% off)
    3. Confirm item availability in nearest warehouse

── Delivery Agent ──────────────────────────────────────────
  Address validated: Plot 14, Ntinda Road, Kampala ✓
  Recommended: Standard shipping (5-7 business days)

  Actions:
    1. Offer free standard shipping (order > UGX 150,000 threshold)
    2. Present economy (UGX 8,000) and express (UGX 25,000) options

── Payment Agent ───────────────────────────────────────────
  Payment method: MTN MoMo 0772****78 — valid
  Fraud risk: LOW

  Actions:
    1. Authorize UGX 2,587,500 + VAT
    2. Apply SAVE10 discount
    3. Calculate 18% VAT for Uganda

── Dispatch Agent ──────────────────────────────────────────
  Warehouse: Kampala-NTD-01 (all items in stock)
  Estimated dispatch: within 24 hours of payment

  Actions:
    1. Generate pick list for 3 items
    2. Standard packaging (no special handling)
    3. Print shipping label after carrier selection

============================================================
  📋 UNIFIED ORDER PLAN
============================================================
  1. Order Summary: 3 items, UGX 2,587,500 after 10% promo
  2. Payment: Authorize MTN MoMo transaction, low fraud risk
  3. Delivery: Free standard shipping (5-7 days)
  4. Dispatch: Kampala warehouse, ship within 24h
  5. No blockers — ready for dispatch ✅
```

## Notes

- Built on **Microsoft Agent Framework** for enterprise-grade multi-agent orchestration
- Uses **ConcurrentBuilder** for parallel fan-out/fan-in workflow patterns
- Agents collaborate rather than override — actions show cross-agent connections
- Follows the same architecture as [writing-editor](https://github.com/BethanyJep/writing-editor)
