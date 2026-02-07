import Store from 'electron-store';
import { safeStorage } from 'electron';

export type AiProvider = 'claude' | 'openai' | 'ollama' | 'chutes';

export interface AiProviderConfig {
  provider: AiProvider;
  model: string;
  encryptedApiKey?: string;
}

interface StoreSchema {
  encryptedKey?: string;
  accountName?: string;
  chainId?: string;
  encryptedClaudeKey?: string;
  aiProvider?: AiProvider;
  aiModel?: string;
  aiEncryptedApiKey?: string;
}

const store = new Store<StoreSchema>();

export function saveSession(privateKey: string, accountName: string, chainId: string): void {
  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(privateKey).toString('base64');
    store.set('encryptedKey', encrypted);
  }
  store.set('accountName', accountName);
  store.set('chainId', chainId);
}

export function loadSession(): { privateKey: string; accountName: string; chainId: string } | null {
  const encrypted = store.get('encryptedKey');
  const accountName = store.get('accountName');
  const chainId = store.get('chainId');

  if (!encrypted || !accountName || !chainId) return null;

  if (safeStorage.isEncryptionAvailable()) {
    const privateKey = safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
    return { privateKey, accountName, chainId };
  }

  return null;
}

export function hasSavedSession(): { exists: true; accountName: string; chainId: string } | { exists: false } {
  const encrypted = store.get('encryptedKey');
  const accountName = store.get('accountName');
  const chainId = store.get('chainId');

  if (encrypted && accountName && chainId) {
    return { exists: true, accountName, chainId };
  }
  return { exists: false };
}

export function clearSession(): void {
  store.delete('encryptedKey');
  store.delete('accountName');
  store.delete('chainId');
}

export function saveAiConfig(provider: AiProvider, model: string, apiKey?: string): void {
  store.set('aiProvider', provider);
  store.set('aiModel', model);

  // Only update the key if a new one is provided; preserve existing key otherwise
  if (apiKey && safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(apiKey).toString('base64');
    store.set('aiEncryptedApiKey', encrypted);
  }
}

export function loadAiConfig(): { provider: AiProvider; model: string; apiKey: string | null } | null {
  const provider = store.get('aiProvider');
  const model = store.get('aiModel');

  if (!provider || !model) {
    // Migrate from old Claude-only config
    const oldKey = store.get('encryptedClaudeKey');
    if (oldKey && safeStorage.isEncryptionAvailable()) {
      const apiKey = safeStorage.decryptString(Buffer.from(oldKey, 'base64'));
      return { provider: 'claude', model: 'claude-sonnet-4-5-20250929', apiKey };
    }
    return null;
  }

  let apiKey: string | null = null;
  const encrypted = store.get('aiEncryptedApiKey');
  if (encrypted && safeStorage.isEncryptionAvailable()) {
    apiKey = safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
  }

  return { provider: provider as AiProvider, model, apiKey };
}

// Keep for backward compat during migration
export function saveClaudeApiKey(apiKey: string): void {
  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(apiKey).toString('base64');
    store.set('encryptedClaudeKey', encrypted);
  }
}

export function loadClaudeApiKey(): string | null {
  const encrypted = store.get('encryptedClaudeKey');
  if (!encrypted) return null;

  if (safeStorage.isEncryptionAvailable()) {
    return safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
  }
  return null;
}

export function clearClaudeApiKey(): void {
  store.delete('encryptedClaudeKey');
}
