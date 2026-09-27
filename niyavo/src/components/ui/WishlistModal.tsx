'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { PRODUCTS } from '@/data/products';
import { X, Heart, ShoppingBag, Sparkles, Trash2 } from 'lucide-react';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WishlistModal({ isOpen, onClose }: WishlistModalProps) {
  const { wishlist, toggleWishlist, addToCart, setActive3DProduct, formatPrice } = useCart();

  if (!isOpen) return null;

  const wishlistedProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-zinc-950 border border-white/15 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Heart className="w-4 h-4 text-amber-400 fill-amber-400" />
            <h3 className="text-sm font-mono uppercase tracking-widest text-white">
              Private Saved Wishlist ({wishlistedProducts.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[460px] overflow-y-auto space-y-4">
          {wishlistedProducts.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Heart className="w-10 h-10 mx-auto mb-3 stroke-1 text-zinc-600" />
              <div className="text-sm text-white font-medium mb-1">
                Your wishlist is empty
              </div>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Save bespoke models from the collection to curate your private acquisition list.
              </p>
            </div>
          ) : (
            wishlistedProducts.map((product) => (
              <div
                key={product.id}
                className="bg-zinc-900/60 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-12 h-12 rounded-xl border border-white/15 shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: product.finishes[0].hex }}
                  >
                    <span className="w-4 h-4 rounded-full bg-white/40" />
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-medium text-white truncate">
                      {product.name}
                    </h4>
                    <p className="text-[11px] font-mono text-amber-400">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setActive3DProduct(product);
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/10 text-xs transition-colors"
                    title="View in 3D"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      addToCart(product, product.finishes[0]);
                      toggleWishlist(product.id);
                    }}
                    className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono text-xs transition-all"
                    title="Move to bag"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
