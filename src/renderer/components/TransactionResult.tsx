import React from 'react';

interface TransactionResultProps {
  result: { transactionId: string } | null;
  error: string | null;
  onDismiss: () => void;
}

export function TransactionResult({ result, error, onDismiss }: TransactionResultProps) {
  if (!result && !error) return null;

  return (
    <div className="mt-4">
      {result && (
        <div className="bg-totem-success/10 border border-totem-success/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-totem-success font-medium text-sm">Transaction Successful</span>
            <button onClick={onDismiss} className="text-totem-text-dim hover:text-totem-text text-sm">
              Dismiss
            </button>
          </div>
          <p className="text-xs text-totem-text-dim font-mono break-all">
            TX: {result.transactionId}
          </p>
        </div>
      )}
      {error && (
        <div className="bg-totem-error/10 border border-totem-error/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-totem-error font-medium text-sm">Transaction Failed</span>
            <button onClick={onDismiss} className="text-totem-text-dim hover:text-totem-text text-sm">
              Dismiss
            </button>
          </div>
          <p className="text-xs text-totem-text-dim">{error}</p>
        </div>
      )}
    </div>
  );
}
