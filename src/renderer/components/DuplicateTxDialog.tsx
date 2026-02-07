import React from 'react';

const ACTION_LABELS: Record<string, string> = {
  transfer: 'Transfer Tokens',
  transferEos: 'Transfer EOS Tokens',
  mint: 'Mint Tokens',
  burn: 'Burn Tokens',
};

interface DuplicateTxDialogProps {
  action: string;
  params: Record<string, any>;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DuplicateTxDialog({ action, params, onConfirm, onCancel }: DuplicateTxDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-totem-surface border border-totem-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold">Duplicate Transaction</h3>
            <p className="text-yellow-500 text-sm">
              {ACTION_LABELS[action] || action} was already executed with these parameters
            </p>
          </div>
        </div>

        <div className="bg-totem-bg rounded-lg p-4 mb-5 space-y-2">
          {Object.entries(params)
            .filter(([, value]) => value !== '')
            .map(([key, value]) => (
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
            className="flex-1 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Proceed Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
