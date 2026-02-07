import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { TransactionResult } from './TransactionResult';

export function TransferPage() {
  const { balances, refreshBalances } = useWallet();
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [symbol, setSymbol] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [txResult, setTxResult] = useState<{ transactionId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const symbols = balances.map((b) => b.balance.split(' ')[1]).filter(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setLoading(true);
    setError(null);
    setTxResult(null);

    // Get precision from balances
    const matchingBalance = balances.find((b) => b.balance.includes(symbol));
    const precision = matchingBalance
      ? matchingBalance.balance.split(' ')[0].split('.')[1]?.length || 4
      : 4;
    const formattedAmount = parseFloat(amount).toFixed(precision);
    const quantity = `${formattedAmount} ${symbol}`;

    try {
      const result = await window.totemWallet.transfer(to, quantity, memo);
      if (result.success && result.data) {
        setTxResult(result.data);
        setTo('');
        setAmount('');
        setMemo('');
        await refreshBalances();
      } else {
        setError(result.error || 'Transfer failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-2xl font-bold mb-6">Transfer Tokens</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-totem-text-dim mb-1.5">Recipient</label>
          <input
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value.toLowerCase())}
            placeholder="accountname"
            required
            maxLength={12}
            pattern="[a-z1-5.]{1,12}"
            className="w-full bg-totem-surface border border-totem-border rounded-lg px-4 py-3 text-totem-text placeholder:text-totem-text-dim/50 focus:border-totem-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-totem-text-dim mb-1.5">Token</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            required
            className="w-full bg-totem-surface border border-totem-border rounded-lg px-4 py-3 text-totem-text focus:border-totem-primary transition-colors"
          >
            <option value="">Select token</option>
            {symbols.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-totem-text-dim mb-1.5">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0000"
            required
            min="0"
            step="any"
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
          disabled={loading || !to || !amount || !symbol}
          className="w-full bg-totem-primary hover:bg-totem-primary-hover disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {loading ? 'Sending...' : 'Send Transfer'}
        </button>
      </form>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-totem-surface border border-totem-border rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirm Transfer</h3>
            <div className="bg-totem-bg rounded-lg p-4 mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-totem-text-dim">To</span>
                <span className="font-mono">{to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-totem-text-dim">Amount</span>
                <span className="font-mono">{amount} {symbol}</span>
              </div>
              {memo && (
                <div className="flex justify-between">
                  <span className="text-totem-text-dim">Memo</span>
                  <span>{memo}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 border border-totem-border rounded-lg text-sm hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 bg-totem-primary hover:bg-totem-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <TransactionResult result={txResult} error={error} onDismiss={() => { setTxResult(null); setError(null); }} />
    </div>
  );
}
