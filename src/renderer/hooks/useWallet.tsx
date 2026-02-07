import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { SessionInfo, Balance, SavedSessionInfo } from '../types';

interface WalletState {
  session: SessionInfo | null;
  savedSession: SavedSessionInfo | null;
  balances: Balance[];
  eosBalances: Balance[];
  loading: boolean;
  error: string | null;
}

interface WalletContextValue extends WalletState {
  login: (privateKey: string, accountName: string, chainId: string) => Promise<boolean>;
  logout: () => Promise<void>;
  lock: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  clearError: () => void;
  unlockWithTouchID: () => Promise<boolean>;
  clearSavedSession: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    session: null,
    savedSession: null,
    balances: [],
    eosBalances: [],
    loading: true,
    error: null,
  });

  const refreshBalances = useCallback(async () => {
    if (!state.session) return;
    try {
      const [totemResult, eosResult] = await Promise.all([
        window.totemWallet.getBalances(),
        window.totemWallet.getEosBalances(),
      ]);
      setState((s) => ({
        ...s,
        balances: totemResult.success && totemResult.data ? totemResult.data : s.balances,
        eosBalances: eosResult.success && eosResult.data ? eosResult.data : s.eosBalances,
      }));
    } catch {
      // silent fail on balance refresh
    }
  }, [state.session]);

  const login = useCallback(async (privateKey: string, accountName: string, chainId: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await window.totemWallet.login(privateKey, accountName, chainId);
      if (result.success && result.session) {
        setState((s) => ({ ...s, session: result.session!, savedSession: null, loading: false }));
        return true;
      }
      setState((s) => ({ ...s, loading: false, error: result.error || 'Login failed' }));
      return false;
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await window.totemWallet.logout();
    setState({ session: null, savedSession: null, balances: [], eosBalances: [], loading: false, error: null });
  }, []);

  const lock = useCallback(async () => {
    await window.totemWallet.lock();
    const result = await window.totemWallet.hasSavedSession();
    if (result.exists) {
      setState({ session: null, savedSession: result, balances: [], eosBalances: [], loading: false, error: null });
    } else {
      setState({ session: null, savedSession: null, balances: [], eosBalances: [], loading: false, error: null });
    }
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  const unlockWithTouchID = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await window.totemWallet.promptTouchID();
      if (result.success && result.session) {
        setState((s) => ({ ...s, session: result.session!, savedSession: null, loading: false }));
        return true;
      }
      setState((s) => ({ ...s, loading: false, error: result.error || 'Authentication failed' }));
      return false;
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
      return false;
    }
  }, []);

  const clearSavedSession = useCallback(() => {
    setState((s) => ({ ...s, savedSession: null, error: null }));
  }, []);

  // Check for saved session on mount (don't auto-restore — wait for Touch ID)
  useEffect(() => {
    (async () => {
      try {
        const result = await window.totemWallet.hasSavedSession();
        if (result.exists) {
          setState((s) => ({ ...s, savedSession: result, loading: false }));
        } else {
          setState((s) => ({ ...s, loading: false }));
        }
      } catch {
        setState((s) => ({ ...s, loading: false }));
      }
    })();
  }, []);

  // Refresh balances when session changes
  useEffect(() => {
    if (state.session) {
      refreshBalances();
    }
  }, [state.session, refreshBalances]);

  return (
    <WalletContext.Provider value={{ ...state, login, logout, lock, refreshBalances, clearError, unlockWithTouchID, clearSavedSession }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider');
  return ctx;
}
