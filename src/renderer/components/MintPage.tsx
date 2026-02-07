import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { TransactionResult } from './TransactionResult';
import type { ModRow } from '../types';

export function MintPage() {
  const { refreshBalances } = useWallet();
  const [mods, setMods] = useState<ModRow[]>([]);
  const [selectedMod, setSelectedMod] = useState('');
  const [quantity, setQuantity] = useState('');
  const [payment, setPayment] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMods, setLoadingMods] = useState(true);
  const [txResult, setTxResult] = useState<{ transactionId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.totemWallet.listMods(50);
        if (result.success && result.data) {
          const minterMods = result.data.rows.filter((m) => m.details.is_minter);
          setMods(minterMods);
        }
      } catch {
        // silent
      } finally {
        setLoadingMods(false);
      }
    })();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError(null);
    setTxResult(null);

    try {
      const result = await window.totemWallet.mint(selectedMod, quantity, payment, memo);
      if (result.success && result.data) {
        setTxResult(result.data);
        setQuantity('');
        setPayment('');
        setMemo('');
        await refreshBalances();
      } else {
        setError(result.error || 'Mint failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-2xl font-bold mb-6">Mint Tokens</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-totem-text-dim mb-1.5">Minter Mod</label>
          {loadingMods ? (
            <p className="text-totem-text-dim text-sm py-3">Loading mods...</p>
          ) : (
            <select
              value={selectedMod}
              onChange={(e) => setSelectedMod(e.target.value)}
              required
              className="w-full bg-totem-surface border border-totem-border rounded-lg px-4 py-3 text-totem-text focus:border-totem-primary transition-colors"
            >
              <option value="">Select a minter mod</option>
              {mods.map((m) => (
                <option key={m.contract} value={m.contract}>
                  {m.details.name} ({m.contract})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm text-totem-text-dim mb-1.5">Quantity</label>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder='e.g. "100.0000 TEST"'
            required
            className="w-full bg-totem-surface border border-totem-border rounded-lg px-4 py-3 text-totem-text placeholder:text-totem-text-dim/50 focus:border-totem-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-totem-text-dim mb-1.5">Payment</label>
          <input
            type="text"
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            placeholder='e.g. "1.0000 EOS"'
            required
            className="w-full bg-totem-surface border border-totem-border rounded-lg px-4 py-3 text-totem-text placeholder:text-totem-text-dim/50 focus:border-totem-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-totem-text-dim mb-1.5">Memo (optional)</label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Optional memo"
            className="w-full bg-totem-surface border border-totem-border rounded-lg px-4 py-3 text-totem-text placeholder:text-totem-text-dim/50 focus:border-totem-primary transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !selectedMod || !quantity || !payment}
          className="w-full bg-totem-primary hover:bg-totem-primary-hover disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {loading ? 'Minting...' : 'Mint Tokens'}
        </button>
      </form>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-totem-surface border border-totem-border rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirm Mint</h3>
            <div className="bg-totem-bg rounded-lg p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-totem-text-dim">Mod</span>
                <span className="font-mono">{selectedMod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-totem-text-dim">Quantity</span>
                <span className="font-mono">{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-totem-text-dim">Payment</span>
                <span className="font-mono">{payment}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 border border-totem-border rounded-lg text-sm hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleConfirm} className="flex-1 py-2.5 bg-totem-primary hover:bg-totem-primary-hover text-white rounded-lg text-sm font-medium transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <TransactionResult result={txResult} error={error} onDismiss={() => { setTxResult(null); setError(null); }} />
    </div>
  );
}
