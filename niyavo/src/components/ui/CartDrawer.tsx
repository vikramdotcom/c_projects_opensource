'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export default function CartDrawer({ onProceedToCheckout }: CartDrawerProps) {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    formatPrice,
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  if (!isCartOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 500;
  const progressPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    if (promoCode.trim().toUpperCase() === 'NIYAVO10') {
      setDiscountPercent(10);
      setPromoSuccess('10% Collector Privilege discount applied');
    } else if (promoCode.trim().toUpperCase() === 'STUDIO') {
      setDiscountPercent(15);
      setPromoSuccess('15% Studio VIP access discount applied');
    } else {
      setPromoError('Invalid code. Try "NIYAVO10" or "STUDIO"');
    }
  };

  const discountAmount = (subtotal * discountPercent) / 100;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0 ? 0 : 35;
  const finalTotal = subtotal - discountAmount + shippingCost;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-light text-white tracking-tight uppercase font-mono">
                  Curated Bag ({items.reduce((s, i) => s + i.quantity, 0)})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                aria-label="Close bag"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="mt-4 bg-zinc-900/80 p-3 rounded-2xl border border-white/5">
              <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
                <span>Complimentary Insured Courier</span>
                <span className="text-amber-400">
                  {remainingForFreeShipping === 0
                    ? 'Qualified'
                    : `Add ${formatPrice(remainingForFreeShipping)}`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 mb-4">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-medium text-white mb-1">Your bag is empty</h4>
                <p className="text-xs text-zinc-500 max-w-xs mb-6">
                  Select an acoustic instrument from the curated catalogue to begin.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.selectedFinish.id}-${idx}`}
                  className="bg-zinc-900/50 border border-white/10 rounded-2xl p-4 flex gap-4 transition-all hover:border-white/20"
                >
                  {/* Color Thumbnail */}
                  <div
                    className="w-16 h-16 rounded-xl border border-white/15 shrink-0 flex items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: item.selectedFinish.hex }}
                  >
                    <div className="w-6 h-6 rounded-full border border-white/30 bg-black/20" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-medium text-white truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() =>
                          removeFromCart(item.product.id, item.selectedFinish.id)
                        }
                        className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-zinc-400 font-mono">
                      <span>{item.selectedFinish.name}</span>
                    </div>

                    {item.customEngraving && (
                      <div className="mt-1 text-[10px] font-mono text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 inline-block">
                        Laser Etch: &quot;{item.customEngraving}&quot;
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 bg-zinc-800/80 border border-white/10 rounded-lg px-2 py-1">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.selectedFinish.id,
                              item.quantity - 1
                            )
                          }
                          className="text-zinc-400 hover:text-white"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono text-white px-1">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.selectedFinish.id,
                              item.quantity + 1
                            )
                          }
                          className="text-zinc-400 hover:text-white"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-xs font-mono text-white font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-zinc-950 space-y-4">
              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Privilege Code (NIYAVO10)"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white border border-white/10 transition-colors"
                >
                  Apply
                </button>
              </form>

              {promoSuccess && (
                <div className="text-[11px] font-mono text-amber-400">{promoSuccess}</div>
              )}
              {promoError && (
                <div className="text-[11px] font-mono text-red-400">{promoError}</div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-white/5">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Privilege Discount ({discountPercent}%)</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Insured Courier</span>
                  <span className="text-white">
                    {shippingCost === 0 ? 'Complimentary' : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-white font-medium pt-2 border-t border-white/10">
                  <span>Estimated Total</span>
                  <span className="text-amber-400">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-medium text-xs font-mono uppercase tracking-wider transition-all duration-200 shadow-xl shadow-amber-400/10 active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>256-Bit Encrypted Secure Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
