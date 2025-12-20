import OpenAI from 'openai';

const openai = new OpenAI();

export async function chat(message: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: message }],
    max_tokens: 1000
  });
  return response.choices[0].message.content || '';
}

export async function classify(text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: `Classify: ${text}` }],
    max_tokens: 50
  });
  return response.choices[0].message.content || '';
}
