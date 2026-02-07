import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '../hooks/useWallet';
import type { ChatMessage } from '../types';

export function ChatPage() {
  const { balances, refreshBalances } = useWallet();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const history = await window.totemWallet.getChatHistory();
      setMessages(history || []);
    })();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const result = await window.totemWallet.sendChatMessage(msg);
      if (result.success && result.data) {
        const history = await window.totemWallet.getChatHistory();
        setMessages(history || []);
        await refreshBalances();
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${result.error || 'Unknown error'}` },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Balances bar */}
      <div className="px-6 py-3 border-b border-totem-border bg-totem-surface/50">
        <div className="flex items-center gap-4 overflow-x-auto">
          <span className="text-xs text-totem-text-dim whitespace-nowrap">Balances:</span>
          {balances.length === 0 ? (
            <span className="text-xs text-totem-text-dim">No balances</span>
          ) : (
            balances.map((b, i) => {
              const [amount, symbol] = b.balance.split(' ');
              return (
                <div key={i} className="flex items-center gap-1.5 bg-totem-bg rounded-md px-3 py-1.5 whitespace-nowrap">
                  <span className="text-xs font-bold text-totem-primary">{symbol}</span>
                  <span className="text-xs text-totem-text">{amount}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Header */}
      <div className="px-6 py-3 border-b border-totem-border flex items-center justify-between">
        <h2 className="text-lg font-bold">AI Chat</h2>
        <button
          onClick={async () => {
            await window.totemWallet.clearChat();
            setMessages([]);
          }}
          className="text-sm text-totem-text-dim hover:text-totem-text transition-colors"
        >
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-totem-text-dim py-16">
            <p className="text-lg mb-2">Ask me anything about your wallet</p>
            <p className="text-sm">Try: "Send 1.0000 TEST to bob", "Mint 100 TEST", "Burn 5 TEST"</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === 'user' && (
              <div className="flex justify-end">
                <div className="bg-totem-primary/20 border border-totem-primary/30 rounded-lg px-4 py-2.5 max-w-[80%]">
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            )}

            {msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0 && (
              <div className="space-y-2">
                {msg.toolCalls.map((tc, j) => (
                  <div
                    key={j}
                    className="bg-totem-surface border border-totem-border rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-totem-accent/20 text-totem-accent px-2 py-0.5 rounded">
                        Tool
                      </span>
                      <span className="text-sm font-mono">{tc.name}</span>
                    </div>
                    <div className="text-xs font-mono text-totem-text-dim bg-totem-bg rounded p-2 mb-1 overflow-x-auto">
                      {JSON.stringify(tc.input, null, 2)}
                    </div>
                    <div className="text-xs font-mono text-totem-text-dim bg-totem-bg rounded p-2 overflow-x-auto">
                      {JSON.stringify(tc.result, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {msg.role === 'assistant' && msg.content && (
              <div className="flex justify-start">
                <div className="bg-totem-surface border border-totem-border rounded-lg px-4 py-2.5 max-w-[80%]">
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-totem-surface border border-totem-border rounded-lg px-4 py-2.5">
              <p className="text-sm text-totem-text-dim animate-pulse">Thinking...</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-totem-border">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your wallet..."
            disabled={loading}
            className="flex-1 bg-totem-surface border border-totem-border rounded-lg px-4 py-3 text-totem-text placeholder:text-totem-text-dim/50 focus:border-totem-primary transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 bg-totem-primary hover:bg-totem-primary-hover disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
