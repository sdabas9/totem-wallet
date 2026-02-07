import React, { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';

export function DashboardPage() {
  const { session, balances, refreshBalances } = useWallet();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshBalances();
    setRefreshing(false);
  };

  useEffect(() => {
    refreshBalances();
  }, [refreshBalances]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-totem-text-dim text-sm mt-1">
            {session?.accountName} on {session?.chainLabel}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-totem-surface border border-totem-border rounded-lg text-sm hover:border-totem-primary transition-colors disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <h3 className="text-lg font-semibold mb-4">Your Balances</h3>

      {balances.length === 0 ? (
        <div className="bg-totem-surface border border-totem-border rounded-lg p-8 text-center">
          <p className="text-totem-text-dim">No token balances found</p>
          <p className="text-totem-text-dim text-sm mt-2">
            Open a balance row or receive tokens to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.map((b, i) => {
            const parts = b.balance.split(' ');
            const amount = parts[0];
            const symbol = parts[1] || '';
            return (
              <div
                key={i}
                className="bg-totem-surface border border-totem-border rounded-lg p-5 hover:border-totem-primary/50 transition-colors"
              >
                <div className="text-sm text-totem-text-dim mb-1">{symbol}</div>
                <div className="text-2xl font-bold text-totem-text">{amount}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
