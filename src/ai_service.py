"""
AI Service - Customer Support Chatbot
Production service handling 50K+ requests/day
"""

import openai
import anthropic

openai_client = openai.OpenAI()
anthropic_client = anthropic.Anthropic()


def answer_customer_query(query: str, context: str) -> str:
    """Main customer support endpoint - called on every user message"""
    response = openai_client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": f"You are a helpful support agent. Context: {context}"},
            {"role": "user", "content": query}
        ],
        max_tokens=2000
    )
    return response.choices[0].message.content


def summarize_ticket(ticket_history: str) -> str:
    """Summarize support ticket for handoff to human agent"""
    response = anthropic_client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=1000,
        messages=[{"role": "user", "content": f"Summarize this support ticket:\n{ticket_history}"}]
    )
    return response.content[0].text


def classify_intent(message: str) -> str:
    """Classify user intent for routing"""
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": f"Classify intent: {message}"}],
        max_tokens=50
    )
    return response.choices[0].message.content


def batch_process_feedback(feedbacks: list[str]) -> list[str]:
    """Process customer feedback in batch - runs nightly"""
    results = []
    for feedback in feedbacks:
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": f"Analyze sentiment: {feedback}"}]
        )
        results.append(response.choices[0].message.content)
    return results


def generate_knowledge_base_article(topic: str) -> str:
    """Generate help article from topic"""
    response = openai_client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": f"Write a help article about: {topic}"}],
        max_tokens=4000
    )
    return response.choices[0].message.content
