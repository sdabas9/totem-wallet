import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';

export function LoginPage() {
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
