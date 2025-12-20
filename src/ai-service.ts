/**
 * AI Service Demo - Multiple Providers
 * Demonstrates various inference patterns across different LLM providers
 */

import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// ANTHROPIC CLAUDE (Primary)
// ============================================================================

const anthropic = new Anthropic();

/**
 * Complex analysis with Claude Opus (high cost, no error handling)
 */
export async function analyzeWithClaude(document: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: `Analyze: ${document}` }],
  });
  return response.content[0].type === 'text' ? response.content[0].text : '';
}

/**
 * Chat with Claude Sonnet (no streaming)
 */
export async function chatWithClaude(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.content[0].type === 'text' ? response.content[0].text : '';
}

/**
 * Streaming with Claude Haiku (optimized)
 */
export async function* streamWithClaude(prompt: string): AsyncGenerator<string> {
  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  } catch (error) {
    console.error('Stream error:', error);
    throw error;
  }
}

// ============================================================================
// OLLAMA (Open Source - Local)
// ============================================================================

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

/**
 * Local inference with Ollama (no auth, no error handling)
 */
export async function chatWithOllama(prompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2',
      prompt: prompt,
      stream: false,
    }),
  });
  const data = await response.json();
  return data.response;
}

/**
 * Ollama with Mistral model (no timeout)
 */
export async function analyzeWithMistral(text: string): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'mistral',
      prompt: `Analyze the following: ${text}`,
      stream: false,
    }),
  });
  const data = await response.json();
  return data.response;
}

// ============================================================================
// vLLM (Open Source - High Performance)
// ============================================================================

const VLLM_BASE_URL = process.env.VLLM_URL || 'http://localhost:8000';

/**
 * High-throughput inference with vLLM (no batching)
 */
export async function chatWithVLLM(prompt: string): Promise<string> {
  const response = await fetch(`${VLLM_BASE_URL}/v1/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3.2-8B-Instruct',
      prompt: prompt,
      max_tokens: 1000,
    }),
  });
  const data = await response.json();
  return data.choices[0].text;
}

// ============================================================================
// AWS BEDROCK (Infrastructure)
// ============================================================================

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({ region: 'us-east-1' });

/**
 * AWS Bedrock with Claude (no retry logic)
 */
export async function chatWithBedrock(prompt: string): Promise<string> {
  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const response = await bedrockClient.send(command);
  const body = JSON.parse(new TextDecoder().decode(response.body));
  return body.content[0].text;
}

/**
 * Bedrock with Llama (no error handling)
 */
export async function chatWithBedrockLlama(prompt: string): Promise<string> {
  const command = new InvokeModelCommand({
    modelId: 'meta.llama3-70b-instruct-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      prompt: prompt,
      max_gen_len: 1000,
    }),
  });
  const response = await bedrockClient.send(command);
  const body = JSON.parse(new TextDecoder().decode(response.body));
  return body.generation;
}

// ============================================================================
// AZURE OPENAI (Infrastructure)
// ============================================================================

const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_API_KEY = process.env.AZURE_OPENAI_API_KEY;

/**
 * Azure OpenAI deployment (no fallback)
 */
export async function chatWithAzure(prompt: string): Promise<string> {
  const response = await fetch(
    `${AZURE_ENDPOINT}/openai/deployments/gpt-4/chat/completions?api-version=2024-02-15-preview`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_API_KEY!,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      }),
    }
  );
  const data = await response.json();
  return data.choices[0].message.content;
}

// ============================================================================
// TOGETHER AI (Infrastructure - Open Source Models)
// ============================================================================

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

/**
 * Together AI with Mixtral (no caching)
 */
export async function chatWithTogether(prompt: string): Promise<string> {
  const response = await fetch('https://api.together.xyz/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOGETHER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    }),
  });
  const data = await response.json();
  return data.choices[0].message.content;
}

// ============================================================================
// GOOD PATTERNS (Reference implementations)
// ============================================================================

/**
 * Robust multi-provider with fallback chain
 */
export async function robustChat(prompt: string): Promise<string> {
  const maxRetries = 3;

  // Try Claude first
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch (error) {
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  // Fallback to local Ollama
  try {
    return await chatWithOllama(prompt);
  } catch {
    throw new Error('All providers failed');
  }
}
