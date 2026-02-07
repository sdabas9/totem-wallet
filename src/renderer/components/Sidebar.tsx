import React from 'react';
import { NavLink } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';

const navItems = [
  { to: '/', label: 'AI Chat', icon: '◎' },
  { to: '/transfer', label: 'Transfer', icon: '→' },
  { to: '/mint', label: 'Mint', icon: '+' },
  { to: '/burn', label: 'Burn', icon: '✕' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export function Sidebar() {
  const { session, lock } = useWallet();

  return (
    <div className="w-56 bg-totem-surface border-r border-totem-border flex flex-col h-full">
      <div className="p-4 pt-8 border-b border-totem-border">
        <h1 className="text-lg font-bold text-totem-primary">Totem Wallet</h1>
        {session && (
          <p className="text-xs text-totem-text-dim mt-1 truncate">
            {session.accountName} · {session.chainLabel}
          </p>
        )}
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-totem-primary/10 text-totem-primary border-r-2 border-totem-primary'
                  : 'text-totem-text-dim hover:text-totem-text hover:bg-white/5'
              }`
            }
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-totem-border">
        <button
          onClick={lock}
          className="w-full py-2 px-3 text-sm text-totem-text-dim hover:text-totem-text transition-colors rounded hover:bg-white/5"
        >
          Lock
        </button>
      </div>
    </div>
  );
}
