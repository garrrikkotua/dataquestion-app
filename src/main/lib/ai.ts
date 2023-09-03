import OpenAI from 'openai';
import { MessagePortMain } from 'electron';
import type Store from 'electron-store';
import type { StoreType } from './store';
import { ChatMessage } from './types';

const modelSelector = (store: Store<StoreType>): string => {
  const version = store.get('gptVersion');

  if (version === 'GPT-4') {
    return 'gpt-4';
  }

  return 'gpt-3.5-turbo';
};

export async function chatWithStreaming(
  port: MessagePortMain,
  store: Store<StoreType>,
  msg: ChatMessage
) {
  const openai = new OpenAI({
    apiKey: store.get('openAIKey'),
  });

  const stream = await openai.chat.completions.create({
    model: modelSelector(store),
    messages: [
      {
        role: 'user',
        content: msg.prompt,
      },
    ],
    stream: true,
  });
  for await (const part of stream) {
    port.postMessage(part.choices[0]?.delta?.content || '');
  }
}

export async function chat(
  store: Store<StoreType>,
  msg: ChatMessage
): Promise<string> {
  const openai = new OpenAI({
    apiKey: store.get('openAIKey'),
  });

  const response = await openai.chat.completions.create({
    model: modelSelector(store),
    messages: [
      {
        role: 'user',
        content: msg.prompt,
      },
    ],
  });
  return response.choices[0].message.content || '';
}
