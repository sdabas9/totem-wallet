import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';

export function SettingsPage() {
  const { session, logout } = useWallet();
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setError(null);

    try {
      const result = await window.totemWallet.setClaudeApiKey(apiKey);
      if (result.success) {
        setSaved(true);
        setApiKey('');
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error || 'Failed to save key');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleClearChat = async () => {
    await window.totemWallet.clearChat();
  };

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Session</h3>
          <div className="bg-totem-surface border border-totem-border rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-totem-text-dim">Account</span>
              <span className="font-mono">{session?.accountName || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-totem-text-dim">Chain</span>
              <span>{session?.chainLabel || '—'}</span>
            </div>
            <button
              onClick={logout}
              className="w-full mt-2 py-2 border border-totem-error/30 text-totem-error rounded-lg text-sm hover:bg-totem-error/10 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Claude AI</h3>
          <form onSubmit={handleSaveKey} className="space-y-4">
            <div>
              <label className="block text-sm text-totem-text-dim mb-1.5">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                required
                className="w-full bg-totem-surface border border-totem-border rounded-lg px-4 py-3 text-totem-text placeholder:text-totem-text-dim/50 focus:border-totem-primary transition-colors"
              />
              <p className="text-xs text-totem-text-dim mt-1">
                Encrypted and stored securely on your device
              </p>
            </div>

            {saved && (
              <div className="bg-totem-success/10 border border-totem-success/30 rounded-lg p-3 text-sm text-totem-success">
                API key saved successfully
              </div>
            )}

            {error && (
              <div className="bg-totem-error/10 border border-totem-error/30 rounded-lg p-3 text-sm text-totem-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-totem-primary hover:bg-totem-primary-hover text-white font-medium py-3 rounded-lg transition-colors"
            >
              Save API Key
            </button>
          </form>

          <button
            onClick={handleClearChat}
            className="w-full mt-3 py-2 border border-totem-border rounded-lg text-sm text-totem-text-dim hover:text-totem-text hover:bg-white/5 transition-colors"
          >
            Clear Chat History
          </button>
        </div>
      </div>
    </div>
  );
}
