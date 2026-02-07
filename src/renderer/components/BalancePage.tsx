import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { TransactionResult } from './TransactionResult';

export function BalancePage() {
  const { balances, refreshBalances } = useWallet();
  const [openTicker, setOpenTicker] = useState('');
  const [openPrecision, setOpenPrecision] = useState('4');
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<{ transactionId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const zeroBalances = balances.filter((b) => {
    const amount = parseFloat(b.balance.split(' ')[0]);
    return amount === 0;
  });

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTxResult(null);

    const ticker = `${openPrecision},${openTicker.toUpperCase()}`;
    try {
      const result = await window.totemWallet.openBalance(ticker);
      if (result.success && result.data) {
        setTxResult(result.data);
        setOpenTicker('');
        await refreshBalances();
      } else {
        setError(result.error || 'Open failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (balance: string) => {
    setLoading(true);
    setError(null);
    setTxResult(null);

    const symbol = balance.split(' ')[1];
    const precision = balance.split(' ')[0].split('.')[1]?.length || 4;
    const ticker = `${precision},${symbol}`;

    try {
      const result = await window.totemWallet.closeBalance(ticker);
      if (result.success && result.data) {
        setTxResult(result.data);
        await refreshBalances();
      } else {
        setError(result.error || 'Close failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-2xl font-bold mb-6">Manage Balances</h2>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Open Balance</h3>
        <p className="text-totem-text-dim text-sm mb-4">
          Open a balance row to receive a new token type
        </p>
        <form onSubmit={handleOpen} className="space-y-4">
          <div className="flex gap-3">
            <div className="w-24">
              <label className="block text-sm text-totem-text-dim mb-1.5">Precision</label>
              <select
                value={openPrecision}
                onChange={(e) => setOpenPrecision(e.target.value)}
                className="w-full bg-totem-surface border border-totem-border rounded-lg px-3 py-3 text-totem-text focus:border-totem-primary transition-colors"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm text-totem-text-dim mb-1.5">Token Symbol</label>
              <input
                type="text"
                value={openTicker}
                onChange={(e) => setOpenTicker(e.target.value.toUpperCase())}
                placeholder="TEST"
                required
                maxLength={7}
                className="w-full bg-totem-surface border border-totem-border rounded-lg px-4 py-3 text-totem-text placeholder:text-totem-text-dim/50 focus:border-totem-primary transition-colors"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !openTicker}
            className="w-full bg-totem-primary hover:bg-totem-primary-hover disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? 'Opening...' : 'Open Balance'}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Close Balance</h3>
        <p className="text-totem-text-dim text-sm mb-4">
          Close a zero-balance row to reclaim RAM
        </p>
        {zeroBalances.length === 0 ? (
          <div className="bg-totem-surface border border-totem-border rounded-lg p-4 text-center text-totem-text-dim text-sm">
            No zero balances to close
          </div>
        ) : (
          <div className="space-y-2">
            {zeroBalances.map((b, i) => {
              const symbol = b.balance.split(' ')[1];
              return (
                <div
                  key={i}
                  className="flex items-center justify-between bg-totem-surface border border-totem-border rounded-lg px-4 py-3"
                >
                  <span className="font-mono text-sm">{symbol}</span>
                  <button
                    onClick={() => handleClose(b.balance)}
                    disabled={loading}
                    className="text-sm text-totem-error hover:text-totem-error/80 disabled:opacity-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TransactionResult result={txResult} error={error} onDismiss={() => { setTxResult(null); setError(null); }} />
    </div>
  );
}
