'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Sparkles } from 'lucide-react';

export default function Toast() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-none">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-zinc-900/95 border border-amber-400/40 text-white shadow-2xl backdrop-blur-xl text-xs font-mono tracking-wide">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
