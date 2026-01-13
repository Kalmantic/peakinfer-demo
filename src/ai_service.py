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
        model="gpt-4",
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


def extract_keywords(text: str) -> str:
    """Extract keywords from text for search indexing"""
    response = anthropic_client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=200,
        messages=[{"role": "user", "content": f"Extract keywords from: {text}"}]
    )
    return response.content[0].text


def translate_message(message: str, target_lang: str) -> str:
    """Translate customer message to target language"""
    response = openai_client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": f"Translate to {target_lang}: {message}"}],
        max_tokens=1000
    )
    return response.choices[0].message.content


def generate_email_response(ticket: str, tone: str) -> str:
    """Generate email response for customer - shown directly to user"""
    response = anthropic_client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=2000,
        messages=[{"role": "user", "content": f"Write a {tone} email response for: {ticket}"}]
    )
    return response.content[0].text


def check_profanity(messages: list[str]) -> list[bool]:
    """Check messages for profanity - content moderation"""
    results = []
    for msg in messages:
        response = openai_client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[{"role": "user", "content": f"Does this contain profanity? Reply yes/no: {msg}"}],
            max_tokens=10
        )
        results.append("yes" in response.choices[0].message.content.lower())
    return results


def generate_faq_answer(question: str) -> str:
    """Generate FAQ answer - cached responses shown to users"""
    response = openai_client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": f"Answer this FAQ: {question}"}],
        max_tokens=500
    )
    return response.choices[0].message.content


def analyze_conversation_quality(conversation: str) -> str:
    """Analyze agent conversation quality for QA - internal tool"""
    response = anthropic_client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=1500,
        messages=[{"role": "user", "content": f"Analyze this conversation quality:\n{conversation}"}]
    )
    return response.content[0].text


def generate_chat_suggestions(context: str) -> str:
    """Generate quick reply suggestions - real-time feature"""
    response = openai_client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": f"Generate 3 quick reply suggestions for: {context}"}],
        max_tokens=200
    )
    return response.choices[0].message.content


def categorize_tickets(tickets: list[str]) -> list[str]:
    """Categorize support tickets into departments"""
    categories = []
    for ticket in tickets:
        response = anthropic_client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=50,
            messages=[{"role": "user", "content": f"Categorize this ticket (billing/technical/general): {ticket}"}]
        )
        categories.append(response.content[0].text)
    return categories


def detect_language(text: str) -> str:
    """Detect the language of incoming message"""
    response = openai_client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": f"What language is this? Reply with language code only: {text}"}],
        max_tokens=10
    )
    return response.choices[0].message.content


def generate_product_description(product_data: dict) -> str:
    """Generate product description for help center"""
    response = anthropic_client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=1000,
        messages=[{"role": "user", "content": f"Write a product description: {product_data}"}]
    )
    return response.content[0].text


def score_urgency(message: str) -> str:
    """Score message urgency for prioritization"""
    response = openai_client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": f"Rate urgency 1-5: {message}"}],
        max_tokens=10
    )
    return response.choices[0].message.content

