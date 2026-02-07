export interface SessionInfo {
  accountName: string;
  chainId: string;
  chainLabel: string;
}

export interface Balance {
  balance: string;
}

export interface TotemDetails {
  name: string;
  description: string;
  image: string;
  website: string;
  seed: string;
}

export interface TotemMods {
  transfer: string[];
  mint: string[];
  burn: string[];
  open: string[];
  close: string[];
  created: string[];
}

export interface TotemRow {
  creator: string;
  supply: string;
  max_supply: string;
  details: TotemDetails;
  mods: TotemMods;
  created_at: string;
}

export interface TotemStat {
  ticker: string;
  mints: number;
  burns: number;
  transfers: number;
  holders: number;
}

export interface ModDetails {
  name: string;
  summary: string;
  markdown: string;
  image: string;
  website: string;
  website_token_path: string;
  is_minter: boolean;
}

export interface ModRow {
  contract: string;
  seller: string;
  price: number;
  details: ModDetails;
  hooks: string[];
  score: number;
}

export interface PaginatedResult<T> {
  rows: T[];
  more: boolean;
  next_key?: string;
}

export interface IpcResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginResult {
  success: boolean;
  session?: SessionInfo;
  error?: string;
}

export interface TransactionResult {
  transactionId: string;
}

export interface ChatMessage {
  role: string;
  content: string;
  toolCalls?: Array<{
    name: string;
    input: Record<string, any>;
    result: any;
  }>;
}

export type AiProvider = 'claude' | 'openai' | 'ollama' | 'chutes';

export interface AiConfig {
  provider: AiProvider;
  model: string;
  apiKey?: string;
}

export interface AiConfigInfo {
  provider: AiProvider;
  model: string;
  hasKey: boolean;
}

export interface SavedSessionInfo {
  exists: true;
  accountName: string;
  chainId: string;
  chainLabel: string;
}

export interface NoSavedSession {
  exists: false;
}

export type SavedSessionResult = SavedSessionInfo | NoSavedSession;

declare global {
  interface Window {
    totemWallet: {
      login: (privateKey: string, accountName: string, chainId: string) => Promise<LoginResult>;
      logout: () => Promise<{ success: boolean }>;
      lock: () => Promise<{ success: boolean }>;
      getSessionInfo: () => Promise<SessionInfo | null>;
      restoreSession: () => Promise<LoginResult>;
      hasSavedSession: () => Promise<SavedSessionResult>;
      promptTouchID: () => Promise<LoginResult>;
      getBalances: (account?: string) => Promise<IpcResult<Balance[]>>;
      getEosBalances: (account?: string) => Promise<IpcResult<Balance[]>>;
      listTotems: (limit?: number, cursor?: string) => Promise<IpcResult<PaginatedResult<TotemRow>>>;
      getTotemStats: (ticker?: string) => Promise<IpcResult<TotemStat[]>>;
      listMods: (limit?: number, cursor?: string) => Promise<IpcResult<PaginatedResult<ModRow>>>;
      getFee: () => Promise<IpcResult<{ fee: number }>>;
      getAccountInfo: (account: string) => Promise<IpcResult<any>>;
      checkAccountExists: (account: string) => Promise<IpcResult<{ exists: boolean; account?: string }>>;
      getTransaction: (txId: string) => Promise<IpcResult<any>>;
      getTopHolders: (ticker: string, limit?: number) => Promise<IpcResult<any[]>>;
      transfer: (to: string, quantity: string, memo: string) => Promise<IpcResult<TransactionResult>>;
      transferEosToken: (to: string, quantity: string, memo: string) => Promise<IpcResult<TransactionResult>>;
      mint: (mod: string, quantity: string, payment: string, memo: string) => Promise<IpcResult<TransactionResult>>;
      burn: (quantity: string, memo: string) => Promise<IpcResult<TransactionResult>>;
      openBalance: (ticker: string) => Promise<IpcResult<TransactionResult>>;
      closeBalance: (ticker: string) => Promise<IpcResult<TransactionResult>>;
      setAiConfig: (provider: string, model: string, apiKey?: string) => Promise<IpcResult>;
      getAiConfig: () => Promise<AiConfigInfo | null>;
      sendChatMessage: (message: string) => Promise<IpcResult<string>>;
      getChatHistory: () => Promise<ChatMessage[]>;
      clearChat: () => Promise<{ success: boolean }>;
      onConfirmAction: (callback: (data: { action: string; params: Record<string, any> }) => void) => void;
      respondConfirmAction: (confirmed: boolean) => void;
      onConfirmDuplicateTx: (callback: (data: { action: string; params: Record<string, any> }) => void) => void;
      respondDuplicateTx: (confirmed: boolean) => void;
    };
  }
}
