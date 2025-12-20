import OpenAI from 'openai';

const openai = new OpenAI();

export async function generate(prompt: string): Promise<string> {
  try {
    // ... existing code ...
  } catch (error) {
    // Retry or handle error
  try {
    // ... existing code ...
  } catch (error) {
    // Retry or handle error
  }
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });
  return response.choices[0].message.content || '';
}
