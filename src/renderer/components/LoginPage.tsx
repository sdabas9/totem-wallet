import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';

function TouchIDLockScreen() {
  const { savedSession, unlockWithTouchID, clearSavedSession, loading, error, clearError } = useWallet();

  const handleUnlock = async () => {
    clearError();
    await unlockWithTouchID();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-totem-bg">
      <div className="w-full max-w-md p-8 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-totem-primary mb-2">Totem Wallet</h1>
          <p className="text-totem-text-dim">
            {savedSession!.accountName} &middot; {savedSession!.chainLabel}
          </p>
        </div>

        <div className="mb-6">
          <svg className="mx-auto w-16 h-16 text-totem-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a48.667 48.667 0 00-1.26 8.01M12 10.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 0v3.75m-3.75 3a48.733 48.733 0 017.5 0" />
          </svg>
        </div>

        {error && (
          <div className="bg-totem-error/10 border border-totem-error/30 rounded-lg p-3 text-sm text-totem-error mb-5">
            {error}
          </div>
        )}

        <button
          onClick={handleUnlock}
          disabled={loading}
          className="w-full bg-totem-primary hover:bg-totem-primary-hover disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors mb-4"
        >
          {loading ? 'Authenticating...' : 'Unlock with Touch ID'}
        </button>

        <button
          onClick={clearSavedSession}
          disabled={loading}
          className="text-sm text-totem-text-dim hover:text-totem-text transition-colors"
        >
          Use Different Account
        </button>
      </div>
    </div>
  );
}

function LoginForm() {
  const { login, loading, error, clearError } = useWallet();
  const [privateKey, setPrivateKey] = useState('');
  const [accountName, setAccountName] = useState('');
  const [chainId, setChainId] = useState('jungle4');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(privateKey, accountName, chainId);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-totem-bg">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-totem-primary mb-2">Totem Wallet</h1>
          <p className="text-totem-text-dim">Connect to the Totems ecosystem</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-totem-text-dim mb-1.5">Private Key</label>
            <input
              type="password"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="5K..."
              required
              className="w-full bg-totem-surface border border-totem-border rounded-lg px-4 py-3 text-totem-text placeholder:text-totem-text-dim/50 focus:border-totem-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-totem-text-dim mb-1.5">Account Name</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value.toLowerCase())}
              placeholder="myaccount123"
              required
              maxLength={12}
              pattern="[a-z1-5.]{1,12}"
              className="w-full bg-totem-surface border border-totem-border rounded-lg px-4 py-3 text-totem-text placeholder:text-totem-text-dim/50 focus:border-totem-primary transition-colors"
            />
            <p className="text-xs text-totem-text-dim mt-1">1-12 characters: a-z, 1-5, periods</p>
          </div>

          <div>
            <label className="block text-sm text-totem-text-dim mb-1.5">Chain</label>
            <select
              value={chainId}
              onChange={(e) => setChainId(e.target.value)}
              className="w-full bg-totem-surface border border-totem-border rounded-lg px-4 py-3 text-totem-text focus:border-totem-primary transition-colors"
            >
              <option value="jungle4">Jungle4 Testnet</option>
              <option value="eos">EOS Mainnet</option>
            </select>
          </div>

          {error && (
            <div className="bg-totem-error/10 border border-totem-error/30 rounded-lg p-3 text-sm text-totem-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-totem-primary hover:bg-totem-primary-hover disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { savedSession } = useWallet();

  if (savedSession) {
    return <TouchIDLockScreen />;
  }

  return <LoginForm />;
}
