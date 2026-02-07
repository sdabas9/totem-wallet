import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import type { AiProvider } from '../types';

const DEFAULT_MODELS: Record<AiProvider, string> = {
  claude: 'claude-sonnet-4-5-20250929',
  openai: 'gpt-4o',
  ollama: 'llama3',
  chutes: 'moonshotai/Kimi-K2-Instruct',
};

const PROVIDER_LABELS: Record<AiProvider, string> = {
  claude: 'Claude (Anthropic)',
  openai: 'OpenAI',
  ollama: 'Ollama (Local)',
  chutes: 'Chutes',
};

const KEY_PLACEHOLDERS: Record<AiProvider, string> = {
  claude: 'sk-ant-...',
  openai: 'sk-...',
  ollama: '',
  chutes: 'cpk_...',
};

export function SettingsPage() {
  const { session, lock, logout } = useWallet();
  const [provider, setProvider] = useState<AiProvider>('claude');
  const [model, setModel] = useState(DEFAULT_MODELS.claude);
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [changingKey, setChangingKey] = useState(false);

  useEffect(() => {
    window.totemWallet.getAiConfig()
      .then((config) => {
        if (config) {
          setProvider(config.provider);
          setModel(config.model);
          setHasKey(config.hasKey);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const handleProviderChange = (newProvider: AiProvider) => {
    setProvider(newProvider);
    setModel(DEFAULT_MODELS[newProvider]);
    setApiKey('');
    setHasKey(false);
    setChangingKey(false);
    setError(null);
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setError(null);

    const needsKey = provider !== 'ollama';
    const providingNewKey = needsKey && changingKey;

    if (needsKey && !hasKey && !apiKey) {
      setError('API key is required for this provider');
      return;
    }

    if (providingNewKey && !apiKey) {
      setError('Enter a new API key or cancel');
      return;
    }

    try {
      const keyToSend = providingNewKey ? apiKey : (!hasKey && needsKey ? apiKey : undefined);
      const result = await window.totemWallet.setAiConfig(
        provider,
        model,
        provider === 'ollama' ? undefined : keyToSend || undefined,
      );
      if (result.success) {
        setSaved(true);
        setApiKey('');
        setChangingKey(false);
        if (needsKey && keyToSend) setHasKey(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error || 'Failed to save configuration');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleClearChat = async () => {
    await window.totemWallet.clearChat();
  };

  if (!loaded) return null;

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
              onClick={lock}
              className="w-full mt-2 py-2 border border-totem-border text-totem-text-dim rounded-lg text-sm hover:text-totem-text hover:bg-white/5 transition-colors"
            >
              Lock
            </button>
            <button
              onClick={logout}
              className="w-full mt-2 py-2 border border-totem-error/30 text-totem-error rounded-lg text-sm hover:bg-totem-error/10 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">AI Assistant</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm text-totem-text-dim mb-1.5">Provider</label>
              <select
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value as AiProvider)}
                className="w-full bg-totem-surface border border-totem-border rounded-lg px-4 py-3 text-totem-text focus:border-totem-primary transition-colors appearance-none"
              >
                {(Object.keys(PROVIDER_LABELS) as AiProvider[]).map((p) => (
                  <option key={p} value={p} className="bg-totem-surface text-totem-text">{PROVIDER_LABELS[p]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-totem-text-dim mb-1.5">Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={DEFAULT_MODELS[provider]}
                required
                className="w-full bg-totem-surface border border-totem-border rounded-lg px-4 py-3 text-totem-text placeholder:text-totem-text-dim/50 focus:border-totem-primary transition-colors"
              />
              <p className="text-xs text-totem-text-dim mt-1">
                Enter any model ID supported by {PROVIDER_LABELS[provider]}
              </p>
            </div>

            {provider !== 'ollama' && (
              <div>
                <label className="block text-sm text-totem-text-dim mb-1.5">API Key</label>
                {hasKey && !changingKey ? (
                  <div className="flex items-center justify-between bg-totem-surface border border-totem-border rounded-lg px-4 py-3">
                    <span className="text-sm text-totem-success">Key saved</span>
                    <button
                      type="button"
                      onClick={() => setChangingKey(true)}
                      className="text-xs text-totem-text-dim hover:text-totem-text transition-colors"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={KEY_PLACEHOLDERS[provider]}
                      className="w-full bg-totem-surface border border-totem-border rounded-lg px-4 py-3 text-totem-text placeholder:text-totem-text-dim/50 focus:border-totem-primary transition-colors"
                    />
                    {changingKey && (
                      <button
                        type="button"
                        onClick={() => { setChangingKey(false); setApiKey(''); }}
                        className="text-xs text-totem-text-dim hover:text-totem-text mt-1 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </>
                )}
                <p className="text-xs text-totem-text-dim mt-1">
                  Encrypted and stored securely on your device
                </p>
              </div>
            )}

            {saved && (
              <div className="bg-totem-success/10 border border-totem-success/30 rounded-lg p-3 text-sm text-totem-success">
                Configuration saved successfully
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
              Save Configuration
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
