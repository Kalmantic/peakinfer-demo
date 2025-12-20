import OpenAI from 'openai';

const openai = new OpenAI();

export async function generate(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  });
  return response.choices[0].message.content || '';
}
