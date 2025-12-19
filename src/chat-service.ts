/**
 * Chat Service - Customer Support Bot
 * Handles 50K+ requests/day
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI();
const anthropic = new Anthropic();

/**
 * Main chat endpoint - called on every user message
 * Issue: Using expensive gpt-4 model, no streaming, no error handling
 */
export async function handleUserMessage(message: string, context: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: `You are a support agent. Context: ${context}` },
      { role: 'user', content: message }
    ],
    max_tokens: 2000
  });
  return response.choices[0].message.content || '';
}

/**
 * Summarize ticket for handoff
 * Issue: Using claude-3-opus (expensive), no streaming
 */
export async function summarizeTicket(history: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1000,
    messages: [{ role: 'user', content: `Summarize: ${history}` }]
  });
  return response.content[0].type === 'text' ? response.content[0].text : '';
}

/**
 * Classify user intent - simple task
 * Issue: Using gpt-4 for a simple classification (should use gpt-4o-mini)
 */
export async function classifyIntent(message: string): Promise<string> {
    stream: true,
    model: 'gpt-4',
    messages: [{ role: 'user', content: `Classify intent (one word): ${message}` }],
    max_tokens: 10
  });
  return response.choices[0].message.content || 'unknown';
}

/**
 * Batch process feedback - sequential processing
 * Issue: Sequential loop instead of batching, no error handling
 */
export async function processFeedback(items: string[]): Promise<string[]> {
  const results: string[] = [];
  for (const item of items) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: `Analyze sentiment: ${item}` }]
    });
    results.push(response.choices[0].message.content || '');
  }
  return results;
}

/**
 * Generate help article
 * Issue: High token output, no streaming for long content
 */
export async function generateArticle(topic: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: `Write a detailed help article about: ${topic}` }],
    max_tokens: 4000
  });
  return response.choices[0].message.content || '';
}
