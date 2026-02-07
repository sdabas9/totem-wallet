import React, { useState, useEffect } from 'react';
import type { TotemRow } from '../types';

export function TotemsPage() {
  const [totems, setTotems] = useState<TotemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchTotems = async (nextCursor?: string) => {
    setLoading(true);
    try {
      const result = await window.totemWallet.listTotems(20, nextCursor);
      if (result.success && result.data) {
        if (nextCursor) {
          setTotems((prev) => [...prev, ...result.data!.rows]);
        } else {
          setTotems(result.data.rows);
        }
        setHasMore(result.data.more);
        setCursor(result.data.next_key);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotems();
  }, []);

  const toggleExpand = (index: number) => {
    setExpanded(expanded === index ? null : index);
  };

  const getSymbol = (supply: string) => supply.split(' ')[1] || '';
  const getAmount = (supply: string) => supply.split(' ')[0] || '0';
  const getModCount = (mods: TotemRow['mods']) =>
    Object.values(mods).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Totems</h2>

      {totems.length === 0 && !loading ? (
        <div className="bg-totem-surface border border-totem-border rounded-lg p-8 text-center text-totem-text-dim">
          No totems found
        </div>
      ) : (
        <div className="space-y-2">
          {totems.map((totem, i) => (
            <div
              key={i}
              className="bg-totem-surface border border-totem-border rounded-lg overflow-hidden hover:border-totem-primary/30 transition-colors"
            >
              <button
                onClick={() => toggleExpand(i)}
                className="w-full px-5 py-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="font-bold text-totem-primary">{getSymbol(totem.max_supply)}</span>
                  <span className="text-sm text-totem-text-dim">{totem.details.name}</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-totem-text-dim">
                  <span>Supply: {getAmount(totem.supply)} / {getAmount(totem.max_supply)}</span>
                  <span>Mods: {getModCount(totem.mods)}</span>
                  <span className="text-xs">{expanded === i ? '▲' : '▼'}</span>
                </div>
              </button>

              {expanded === i && (
                <div className="px-5 pb-4 border-t border-totem-border pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-totem-text-dim">Creator</span>
                      <p className="font-mono">{totem.creator}</p>
                    </div>
                    <div>
                      <span className="text-totem-text-dim">Created</span>
                      <p>{totem.created_at}</p>
                    </div>
                  </div>

                  {totem.details.description && (
                    <div className="text-sm">
                      <span className="text-totem-text-dim">Description</span>
                      <p className="mt-1">{totem.details.description}</p>
                    </div>
                  )}

                  {totem.details.website && (
                    <div className="text-sm">
                      <span className="text-totem-text-dim">Website</span>
                      <p className="mt-1 text-totem-accent">{totem.details.website}</p>
                    </div>
                  )}

                  <div className="text-sm">
                    <span className="text-totem-text-dim">Mods</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {Object.entries(totem.mods).map(([hook, modList]) =>
                        modList.map((mod: string) => (
                          <span
                            key={`${hook}-${mod}`}
                            className="px-2 py-0.5 bg-totem-bg rounded text-xs font-mono"
                          >
                            {hook}: {mod}
                          </span>
                        ))
                      )}
                      {getModCount(totem.mods) === 0 && (
                        <span className="text-totem-text-dim">None</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {loading && (
        <p className="text-center text-totem-text-dim py-8">Loading totems...</p>
      )}

      {hasMore && !loading && (
        <div className="mt-4 text-center">
          <button
            onClick={() => fetchTotems(cursor)}
            className="px-6 py-2.5 bg-totem-surface border border-totem-border rounded-lg text-sm hover:border-totem-primary transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
