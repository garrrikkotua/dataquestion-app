import OpenAI from 'openai';
import { MessagePortMain } from 'electron';
import type Store from 'electron-store';
import type { StoreType } from './store';

export async function chat(
  port: MessagePortMain,
  store: Store<StoreType>,
  prompt: string,
  functions?: any[]
) {
  const openai = new OpenAI({
    apiKey: store.get('openAIKey'),
  });

  const stream = await openai.chat.completions.create({
    model: 'gpt-4-0613',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    stream: true,
    ...(functions && { function_call: 'auto', functions }),
  });
  for await (const part of stream) {
    port.postMessage(part.choices[0]?.delta?.content || '');
  }
}
