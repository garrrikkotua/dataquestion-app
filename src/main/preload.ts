// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import {
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
  MessageBoxSyncOptions,
} from 'electron';
import { ChatMessage } from './lib/types';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  store: {
    get(key: any): Promise<any> {
      return ipcRenderer.invoke('electron-store-get', key);
    },
    set(property: any, val: any): Promise<void> {
      return ipcRenderer.invoke('electron-store-set', property, val);
    },
    has(key: any): Promise<boolean> {
      return ipcRenderer.invoke('electron-store-has', key);
    },
    reset(key: any): Promise<void> {
      return ipcRenderer.invoke('electron-store-reset', key);
    },
    delete(key: any): Promise<void> {
      return ipcRenderer.invoke('electron-store-delete', key);
    },
  },
  clipboard: {
    writeText(text: string): void {
      ipcRenderer.send('clipboard-write', text);
    },
  },
  dialog: {
    showErrorBox(title: string, content: string): void {
      ipcRenderer.send('show-error-box', title, content);
    },
    showMessageBox(options: MessageBoxSyncOptions): number {
      return ipcRenderer.sendSync('show-message-box', options);
    },
  },
  channels: {
    chatWithStreaming: (msg: ChatMessage, callback: Function) => {
      const { port1, port2 } = new MessageChannel();
      port1.onmessage = (event) => {
        callback(event.data);
      };
      ipcRenderer.postMessage('chat-stream', msg, [port2]);
    },
    chat: (msg: ChatMessage): Promise<string> => {
      return ipcRenderer.invoke('chat', msg);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
