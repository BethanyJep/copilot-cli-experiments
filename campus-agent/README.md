# 🎓 UniBot – Campus AI Agent

A lightweight AI agent built with **Microsoft Foundry** and **AI Toolkit** that helps students navigate campus life — from checking class schedules to answering everyday questions about fees, registration, and campus services.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  Student Query                  │
└──────────────────────┬──────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────┐
│         Microsoft Foundry (Agent Service)       │
│  ┌───────────────────────────────────────────┐  │
│  │  UniBot Agent (GPT-4.1-mini)              │  │
│  │  • System Prompt                          │  │
│  │  • Tool Calling                           │  │
│  └───────────────────┬───────────────────────┘  │
└──────────────────────┼──────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────┐
│              Campus Tools (Python)              │
│  ┌──────────┐ ┌──────────┐ ┌────────────────┐   │
│  │ Schedule │ │   Fees   │ │    Services    │   │
│  │  Tools   │ │  Tools   │ │     Tools      │   │
│  └──────────┘ └──────────┘ └────────────────┘   │
└─────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Azure subscription with [Microsoft Foundry](https://ai.azure.com) project
- Azure CLI logged in (`az login`)

### Setup

```bash
# 1. Navigate to the project
cd campus-agent

# 2. Create virtual environment
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your Foundry project endpoint

# 5. Login to Azure (for DefaultAzureCredential)
az login
```

### Run the Agent

**Interactive CLI** (great for demos):
```bash
python agent.py
```

**Web UI** (presentation-ready):
```bash
python app.py
# Open http://localhost:5001
```

## 🛠️ How It Works

### 1. Prompt Engineering
The agent uses a carefully crafted system prompt that defines its personality, capabilities, and guidelines. See `SYSTEM_PROMPT` in `agent.py`.

### 2. Tool Calling (Function Calling)
The agent has 7 tools it can call to fetch real campus data:

| Tool | Description |
|------|-------------|
| `get_class_schedule` | Full timetable for a student |
| `get_next_class` | Today's upcoming classes |
| `get_fee_structure` | Tuition breakdown by program |
| `get_payment_deadlines` | Payment dates & methods |
| `get_financial_aid_info` | Scholarships, loans, bursaries |
| `get_campus_service` | Info about any campus service |
| `get_registration_info` | Registration process, dates, requirements |

### 3. Microsoft Foundry Connection
- Uses `azure-ai-projects` SDK to connect to Foundry
- Agent runs server-side with automatic tool execution
- `DefaultAzureCredential` for secure authentication (no API keys in code!)

## 💬 Example Conversations

```
You: What's Amara's schedule for this semester?
UniBot: 📚 Here's Amara's full schedule for Fall 2026...

You: How much are the fees for Computer Science?
UniBot: 💰 The total is KES 85,000 per semester. Here's the breakdown...
        🎓 Don't forget about financial aid options!

You: How do I register for courses?
UniBot: 📋 Here's the step-by-step process...
        📅 Key date: Registration opens July 20, 2026!
```

## 📂 Project Structure

```
campus-agent/
├── agent.py              # Main agent + CLI (prompt engineering + tool-calling)
├── app.py                # Flask web UI
├── requirements.txt      # Dependencies
├── .env.example          # Configuration template
├── tools/
│   ├── __init__.py       # Tool exports
│   ├── schedule.py       # Class schedule tools
│   ├── fees.py           # Fees & payment tools
│   └── services.py       # Campus services tools
├── data/
│   ├── schedules.json    # Student timetables
│   ├── fees.json         # Fee structures
│   └── services.json     # Campus service directory
├── templates/
│   └── index.html        # Web chat UI
└── static/css/
    └── style.css         # UI styling
```

## 🎯 Key Takeaways (for the session)

1. **Agents = LLM + Tools + Instructions** — The magic is in combining a well-prompted model with callable functions
2. **Tool-calling turns scattered info into conversations** — Instead of students hunting through PDFs, the agent fetches exactly what they need
3. **Microsoft Foundry handles the heavy lifting** — Agent orchestration, tool execution, and conversation management
4. **Start simple, iterate** — This agent was built incrementally: prompt first, then tools, then UI

## 📚 Resources

- [Microsoft Foundry Documentation](https://learn.microsoft.com/azure/ai-studio/)
- [AI Toolkit for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-windows-ai-studio.windows-ai-studio)
- [Azure AI Projects SDK](https://learn.microsoft.com/python/api/azure-ai-projects/)
