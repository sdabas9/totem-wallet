import React from 'react';

interface ConfirmDialogProps {
  action: string;
  params: Record<string, any>;
  onConfirm: () => void;
  onCancel: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  transfer_tokens: 'Transfer Tokens',
  mint_tokens: 'Mint Tokens',
  burn_tokens: 'Burn Tokens',
  open_balance: 'Open Balance',
  close_balance: 'Close Balance',
};

export function ConfirmDialog({ action, params, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-totem-surface border border-totem-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-lg font-bold mb-1">Confirm Action</h3>
        <p className="text-totem-text-dim text-sm mb-4">
          {ACTION_LABELS[action] || action}
        </p>

        <div className="bg-totem-bg rounded-lg p-4 mb-5 space-y-2">
          {Object.entries(params).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-totem-text-dim">{key}</span>
              <span className="text-totem-text font-mono">{String(value)}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-totem-border rounded-lg text-sm hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-totem-primary hover:bg-totem-primary-hover text-white rounded-lg text-sm font-medium transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
