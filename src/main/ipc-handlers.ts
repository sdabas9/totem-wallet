import { ipcMain, BrowserWindow } from 'electron';
import { createSession, getSessionInfo, destroySession } from './session-manager';
import { loadSession } from './store';
import * as blockchain from './blockchain';
import * as ai from './ai-assistant';

export function registerIpcHandlers(getMainWindow: () => BrowserWindow | null): void {
  // ─── Session ───

  ipcMain.handle('login', async (_event, privateKey: string, accountName: string, chainId: string) => {
    try {
      createSession(privateKey, accountName, chainId);
      return { success: true, session: getSessionInfo() };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('logout', async () => {
    destroySession();
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

  // ─── Blockchain Write ───

  ipcMain.handle('transfer', async (_event, to: string, quantity: string, memo: string) => {
    try {
      return { success: true, data: await blockchain.transfer(to, quantity, memo) };
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

  ipcMain.handle('set-claude-api-key', async (_event, apiKey: string) => {
    try {
      ai.setApiKey(apiKey);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
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
