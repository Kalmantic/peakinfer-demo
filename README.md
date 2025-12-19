# AI Customer Support Service

Production customer support chatbot powered by GPT-4 and Claude.

## Features

- Real-time customer query answering
- Ticket summarization for agent handoff
- Intent classification and routing
- Batch feedback analysis
- Knowledge base article generation

## Setup

```bash
pip install openai anthropic
export OPENAI_API_KEY=your-key
export ANTHROPIC_API_KEY=your-key
```

## Usage

```python
from src.ai_service import answer_customer_query

response = answer_customer_query(
    query="How do I reset my password?",
    context="User is on settings page"
)
```
# trigger Fri Dec 19 17:12:47 IST 2025
