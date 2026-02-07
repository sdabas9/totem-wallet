import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider, useWallet } from './hooks/useWallet';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/LoginPage';
import { TransferPage } from './components/TransferPage';
import { MintPage } from './components/MintPage';
import { BurnPage } from './components/BurnPage';
import { ChatPage } from './components/ChatPage';
import { SettingsPage } from './components/SettingsPage';
import { DuplicateTxDialog } from './components/DuplicateTxDialog';

function AppContent() {
  const { session, loading } = useWallet();
  const [duplicateTx, setDuplicateTx] = useState<{ action: string; params: Record<string, any> } | null>(null);

  useEffect(() => {
    window.totemWallet.onConfirmDuplicateTx((data) => {
      setDuplicateTx(data);
    });
  }, []);

  const handleDuplicateConfirm = useCallback(() => {
    window.totemWallet.respondDuplicateTx(true);
    setDuplicateTx(null);
  }, []);

  const handleDuplicateCancel = useCallback(() => {
    window.totemWallet.respondDuplicateTx(false);
    setDuplicateTx(null);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-totem-bg">
        <p className="text-totem-text-dim">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/transfer" element={<TransferPage />} />
          <Route path="/mint" element={<MintPage />} />
          <Route path="/burn" element={<BurnPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      {duplicateTx && (
        <DuplicateTxDialog
          action={duplicateTx.action}
          params={duplicateTx.params}
          onConfirm={handleDuplicateConfirm}
          onCancel={handleDuplicateCancel}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <HashRouter>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </HashRouter>
  );
}
