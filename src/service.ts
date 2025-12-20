import OpenAI from 'openai';

const openai = new OpenAI();

export async function answer(question: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: question }]
  });
  return response.choices[0].message.content || '';
}
