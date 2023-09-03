import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const makeStreamingRequest = (element: any, callback: Function) => {
  window.electron.channels.startCommunication(element, callback);
};

export const randomChat = (element: any, callback: Function) => {
  window.electron.channels.chat(element, callback);
};
