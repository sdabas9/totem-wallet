import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { SessionInfo, Balance } from '../types';

interface WalletState {
  session: SessionInfo | null;
  balances: Balance[];
  loading: boolean;
  error: string | null;
}

interface WalletContextValue extends WalletState {
  login: (privateKey: string, accountName: string, chainId: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  clearError: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    session: null,
    balances: [],
    loading: true,
    error: null,
  });

  const refreshBalances = useCallback(async () => {
    if (!state.session) return;
    try {
      const result = await window.totemWallet.getBalances();
      if (result.success && result.data) {
        setState((s) => ({ ...s, balances: result.data! }));
      }
    } catch {
      // silent fail on balance refresh
    }
  }, [state.session]);

  const login = useCallback(async (privateKey: string, accountName: string, chainId: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const result = await window.totemWallet.login(privateKey, accountName, chainId);
      if (result.success && result.session) {
        setState((s) => ({ ...s, session: result.session!, loading: false }));
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
    setState({ session: null, balances: [], loading: false, error: null });
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  // Try to restore saved session on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await window.totemWallet.restoreSession();
        if (result.success && result.session) {
          setState((s) => ({ ...s, session: result.session!, loading: false }));
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
    <WalletContext.Provider value={{ ...state, login, logout, refreshBalances, clearError }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider');
  return ctx;
}
