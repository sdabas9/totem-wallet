import Store from 'electron-store';
import { safeStorage } from 'electron';

interface StoreSchema {
  encryptedKey?: string;
  accountName?: string;
  chainId?: string;
  encryptedClaudeKey?: string;
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

export function clearSession(): void {
  store.delete('encryptedKey');
  store.delete('accountName');
  store.delete('chainId');
}

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
