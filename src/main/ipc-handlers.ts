import { ipcMain, BrowserWindow, systemPreferences } from 'electron';
import { createSession, getSessionInfo, destroySession, lockSession, SUPPORTED_CHAINS } from './session-manager';
import { loadSession, hasSavedSession } from './store';
import * as blockchain from './blockchain';
import * as ai from './ai-assistant';

export function registerIpcHandlers(getMainWindow: () => BrowserWindow | null): void {
  // ─── Session ───

  ipcMain.handle('login', async (_event, privateKey: string, accountName: string, chainId: string) => {
    try {
      blockchain.clearTxLog();
      createSession(privateKey, accountName, chainId);
      return { success: true, session: getSessionInfo() };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('logout', async () => {
    destroySession();
    blockchain.clearTxLog();
    ai.clearChat();
    return { success: true };
  });

  ipcMain.handle('lock', async () => {
    lockSession();
    blockchain.clearTxLog();
    ai.clearChat();
    return { success: true };
  });

  ipcMain.handle('get-session-info', async () => {
    return getSessionInfo();
  });

  ipcMain.handle('restore-session', async () => {
    const saved = loadSession();
    if (saved) {
      try {
        createSession(saved.privateKey, saved.accountName, saved.chainId);
        return { success: true, session: getSessionInfo() };
      } catch {
        return { success: false };
      }
    }
    return { success: false };
  });

  ipcMain.handle('has-saved-session', async () => {
    const result = hasSavedSession();
    if (result.exists) {
      const chainLabel = SUPPORTED_CHAINS[result.chainId]?.label || result.chainId;
      return { exists: true, accountName: result.accountName, chainId: result.chainId, chainLabel };
    }
    return { exists: false };
  });

  ipcMain.handle('prompt-touch-id', async () => {
    try {
      await systemPreferences.promptTouchID('Unlock Totem Wallet');
      const saved = loadSession();
      if (saved) {
        createSession(saved.privateKey, saved.accountName, saved.chainId);
        return { success: true, session: getSessionInfo() };
      }
      return { success: false, error: 'No saved session found' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Touch ID authentication failed' };
    }
  });

  // ─── Blockchain Read ───

  ipcMain.handle('get-balances', async (_event, account?: string) => {
    try {
      return { success: true, data: await blockchain.getBalances(account) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('list-totems', async (_event, limit?: number, cursor?: string) => {
    try {
      return { success: true, data: await blockchain.listTotems(limit, cursor) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('get-totem-stats', async (_event, ticker?: string) => {
    try {
      return { success: true, data: await blockchain.getTotemStats(ticker) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('list-mods', async (_event, limit?: number, cursor?: string) => {
    try {
      return { success: true, data: await blockchain.listMods(limit, cursor) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('get-eos-balances', async (_event, account?: string) => {
    try {
      return { success: true, data: await blockchain.getEosBalances(account) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('get-fee', async () => {
    try {
      return { success: true, data: await blockchain.getFee() };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('get-account-info', async (_event, account: string) => {
    try {
      return { success: true, data: await blockchain.getAccountInfo(account) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('check-account-exists', async (_event, account: string) => {
    try {
      return { success: true, data: await blockchain.checkAccountExists(account) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('get-transaction', async (_event, txId: string) => {
    try {
      return { success: true, data: await blockchain.getTransaction(txId) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('get-top-holders', async (_event, ticker: string, limit?: number) => {
    try {
      return { success: true, data: await blockchain.getTopHolders(ticker, limit) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // ─── Blockchain Write ───

  ipcMain.handle('transfer', async (_event, to: string, quantity: string, memo: string) => {
    try {
      return { success: true, data: await blockchain.transfer(to, quantity, memo) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('transfer-eos-token', async (_event, to: string, quantity: string, memo: string) => {
    try {
      return { success: true, data: await blockchain.transferEosToken(to, quantity, memo) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('mint', async (_event, mod: string, quantity: string, payment: string, memo: string) => {
    try {
      return { success: true, data: await blockchain.mint(mod, quantity, payment, memo) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('burn', async (_event, quantity: string, memo: string) => {
    try {
      return { success: true, data: await blockchain.burn(quantity, memo) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('open-balance', async (_event, ticker: string) => {
    try {
      return { success: true, data: await blockchain.openBalance(ticker) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('close-balance', async (_event, ticker: string) => {
    try {
      return { success: true, data: await blockchain.closeBalance(ticker) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // ─── AI Chat ───

  ipcMain.handle('set-ai-config', async (_event, provider: string, model: string, apiKey?: string) => {
    try {
      ai.setAiConfig(provider as any, model, apiKey);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('get-ai-config', async () => {
    return ai.getAiConfig();
  });

  ipcMain.handle('send-chat-message', async (_event, message: string) => {
    try {
      const win = getMainWindow();
      if (!win) throw new Error('No window available');
      const response = await ai.sendMessage(message, win);
      return { success: true, data: response };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('get-chat-history', async () => {
    return ai.getChatHistory();
  });

  ipcMain.handle('clear-chat', async () => {
    ai.clearChat();
    return { success: true };
  });
}
