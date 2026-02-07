import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // Session
  login: (privateKey: string, accountName: string, chainId: string) =>
    ipcRenderer.invoke('login', privateKey, accountName, chainId),
  logout: () => ipcRenderer.invoke('logout'),
  lock: () => ipcRenderer.invoke('lock'),
  getSessionInfo: () => ipcRenderer.invoke('get-session-info'),
  restoreSession: () => ipcRenderer.invoke('restore-session'),
  hasSavedSession: () => ipcRenderer.invoke('has-saved-session'),
  promptTouchID: () => ipcRenderer.invoke('prompt-touch-id'),

  // Blockchain Read
  getBalances: (account?: string) => ipcRenderer.invoke('get-balances', account),
  getEosBalances: (account?: string) => ipcRenderer.invoke('get-eos-balances', account),
  listTotems: (limit?: number, cursor?: string) =>
    ipcRenderer.invoke('list-totems', limit, cursor),
  getTotemStats: (ticker?: string) => ipcRenderer.invoke('get-totem-stats', ticker),
  listMods: (limit?: number, cursor?: string) =>
    ipcRenderer.invoke('list-mods', limit, cursor),
  getFee: () => ipcRenderer.invoke('get-fee'),
  getAccountInfo: (account: string) => ipcRenderer.invoke('get-account-info', account),
  checkAccountExists: (account: string) => ipcRenderer.invoke('check-account-exists', account),
  getTransaction: (txId: string) => ipcRenderer.invoke('get-transaction', txId),
  getTopHolders: (ticker: string, limit?: number) =>
    ipcRenderer.invoke('get-top-holders', ticker, limit),

  // Blockchain Write
  transfer: (to: string, quantity: string, memo: string) =>
    ipcRenderer.invoke('transfer', to, quantity, memo),
  transferEosToken: (to: string, quantity: string, memo: string) =>
    ipcRenderer.invoke('transfer-eos-token', to, quantity, memo),
  mint: (mod: string, quantity: string, payment: string, memo: string) =>
    ipcRenderer.invoke('mint', mod, quantity, payment, memo),
  burn: (quantity: string, memo: string) =>
    ipcRenderer.invoke('burn', quantity, memo),
  openBalance: (ticker: string) => ipcRenderer.invoke('open-balance', ticker),
  closeBalance: (ticker: string) => ipcRenderer.invoke('close-balance', ticker),

  // AI Chat
  setAiConfig: (provider: string, model: string, apiKey?: string) =>
    ipcRenderer.invoke('set-ai-config', provider, model, apiKey),
  getAiConfig: () => ipcRenderer.invoke('get-ai-config'),
  sendChatMessage: (message: string) =>
    ipcRenderer.invoke('send-chat-message', message),
  getChatHistory: () => ipcRenderer.invoke('get-chat-history'),
  clearChat: () => ipcRenderer.invoke('clear-chat'),

  // Duplicate transaction confirmation
  onConfirmDuplicateTx: (callback: (data: { action: string; params: Record<string, any> }) => void) => {
    ipcRenderer.on('confirm-duplicate-tx', (_event, data) => callback(data));
  },
  respondDuplicateTx: (confirmed: boolean) => {
    ipcRenderer.send('respond-duplicate-tx', confirmed);
  },
};

contextBridge.exposeInMainWorld('totemWallet', api);

export type TotemWalletAPI = typeof api;
