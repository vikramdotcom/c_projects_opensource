'use client';

import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Search, X, Sparkles } from 'lucide-react';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickSearchModal({ isOpen, onClose }: QuickSearchModalProps) {
  const [query, setQuery] = useState('');
  const { setActive3DProduct, formatPrice } = useCart();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim() === ''
    ? PRODUCTS.slice(0, 4)
    : PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xl flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl bg-zinc-950 border border-white/15 rounded-3xl shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search instruments, materials (Titanium, Planar, Headphone)..."
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm font-mono focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 px-2 py-1">
            {query.trim() === '' ? 'Curated Highlights' : `Results (${results.length})`}
          </div>

          {results.length === 0 ? (
            <div className="text-center py-8 text-xs font-mono text-zinc-500">
              No matching acoustic objects found for &quot;{query}&quot;
            </div>
          ) : (
            results.map((product) => (
              <div
                key={product.id}
                className="group flex items-center justify-between p-3 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900 border border-white/5 hover:border-amber-400/30 transition-all cursor-pointer"
                onClick={() => {
                  setActive3DProduct(product);
                  onClose();
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl border border-white/10 shrink-0 flex items-center justify-center text-xs font-mono"
                    style={{ backgroundColor: product.finishes[0].hex }}
                  >
                    <span className="w-3 h-3 rounded-full bg-white/40" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-medium text-white group-hover:text-amber-300 transition-colors">
                      {product.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-light truncate">
                      {product.subtitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-white">
                    {formatPrice(product.price)}
                  </span>
                  <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-amber-400 group-hover:text-zinc-950 text-zinc-400 transition-all">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-zinc-900/60 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-500 px-4">
          <span>Click any item to view in interactive 3D</span>
          <span>ESC to exit</span>
        </div>
      </div>
    </div>
  );
}
