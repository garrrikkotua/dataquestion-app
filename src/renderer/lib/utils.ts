import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChatMessage } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function completeWithStreaming(
  msg: ChatMessage,
  callback: Function
) {
  return window.electron.channels.chatWithStreaming(msg, callback);
}

export async function complete(msg: ChatMessage): Promise<string> {
  return window.electron.channels.chat(msg);
}
