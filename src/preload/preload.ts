import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // Session
  login: (privateKey: string, accountName: string, chainId: string) =>
    ipcRenderer.invoke('login', privateKey, accountName, chainId),
  logout: () => ipcRenderer.invoke('logout'),
  getSessionInfo: () => ipcRenderer.invoke('get-session-info'),
  restoreSession: () => ipcRenderer.invoke('restore-session'),

  // Blockchain Read
  getBalances: (account?: string) => ipcRenderer.invoke('get-balances', account),
  listTotems: (limit?: number, cursor?: string) =>
    ipcRenderer.invoke('list-totems', limit, cursor),
  getTotemStats: (ticker?: string) => ipcRenderer.invoke('get-totem-stats', ticker),
  listMods: (limit?: number, cursor?: string) =>
    ipcRenderer.invoke('list-mods', limit, cursor),

  // Blockchain Write
  transfer: (to: string, quantity: string, memo: string) =>
    ipcRenderer.invoke('transfer', to, quantity, memo),
  mint: (mod: string, quantity: string, payment: string, memo: string) =>
    ipcRenderer.invoke('mint', mod, quantity, payment, memo),
  burn: (quantity: string, memo: string) =>
    ipcRenderer.invoke('burn', quantity, memo),
  openBalance: (ticker: string) => ipcRenderer.invoke('open-balance', ticker),
  closeBalance: (ticker: string) => ipcRenderer.invoke('close-balance', ticker),

  // AI Chat
  setClaudeApiKey: (apiKey: string) =>
    ipcRenderer.invoke('set-claude-api-key', apiKey),
  sendChatMessage: (message: string) =>
    ipcRenderer.invoke('send-chat-message', message),
  getChatHistory: () => ipcRenderer.invoke('get-chat-history'),
  clearChat: () => ipcRenderer.invoke('clear-chat'),

};

contextBridge.exposeInMainWorld('totemWallet', api);

export type TotemWalletAPI = typeof api;
