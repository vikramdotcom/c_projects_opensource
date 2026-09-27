'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, ShieldCheck, Lock, CreditCard, ArrowRight } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { subtotal, formatPrice, clearCart } = useCart();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Form states
  const [fullName, setFullName] = useState('Alexander Wright');
  const [email, setEmail] = useState('alexander.wright@studio.design');
  const [address, setAddress] = useState('442 Omotesando Hill, Shibuya-ku');
  const [city, setCity] = useState('Tokyo');
  const [postal, setPostal] = useState('150-0001');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'wire'>('card');

  if (!isOpen) return null;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const generatedId = `NYV-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      setIsSuccess(true);
      clearCart();

      // Launch celebratory gold and white confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#E5C378', '#FFFFFF', '#141416'],
        });
      } catch {
        // ignore
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="absolute inset-0"
        onClick={() => !isProcessing && onClose()}
      />

      <div className="relative z-10 w-full max-w-2xl bg-zinc-950 border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h3 className="text-lg font-light text-white font-mono uppercase tracking-widest">
              {isSuccess ? 'Allocation Confirmed' : 'Acquisition Checkout'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-amber-400 block mb-1">
                Serial Registered to Atelier
              </span>
              <h2 className="text-2xl sm:text-3xl font-extralight text-white tracking-tight">
                Order Confirmed
              </h2>
              <p className="text-xs font-mono text-zinc-400 mt-2">
                ORDER REFERENCE: <span className="text-white font-medium">{orderId}</span>
              </p>
            </div>

            <p className="text-sm text-zinc-300 font-light leading-relaxed max-w-md mx-auto">
              Thank you, {fullName}. Your bespoke acoustic instruments have entered calibration in Kyoto. A secure courier tracking link and certificate have been dispatched to <span className="text-white">{email}</span>.
            </p>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 max-w-md mx-auto text-xs text-left text-zinc-400 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Estimated Atelier Dispatch:</span>
                <span className="text-white">Within 48 Hours</span>
              </div>
              <div className="flex justify-between">
                <span>Courier Service:</span>
                <span className="text-white">Insured White-Glove Air</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono text-xs uppercase tracking-wider font-semibold transition-all shadow-xl"
            >
              Return to Gallery
            </button>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="p-6 sm:p-8 space-y-6">
            {/* Express Pay options */}
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
                Express Checkout
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('apple')}
                  className={`py-3 rounded-xl border text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'apple'
                      ? 'border-amber-400 bg-white/10 text-white'
                      : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20'
                  }`}
                >
                  <span> Apple Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-3 rounded-xl border text-xs font-mono font-medium flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-amber-400 bg-white/10 text-white'
                      : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Credit Card</span>
                </button>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                1. Delivery & Recipient
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street Address"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                <input
                  type="text"
                  required
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                  placeholder="Postal Code"
                  className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>
            </div>

            {/* Payment Details */}
            {paymentMethod === 'card' && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                  <span>2. Payment Information</span>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <input
                  type="text"
                  required
                  defaultValue="4242 •••• •••• 4242"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    defaultValue="12/28"
                    placeholder="MM/YY"
                    className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <input
                    type="text"
                    required
                    defaultValue="888"
                    placeholder="CVC"
                    className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Total and Submit */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                  Total Acquisition
                </span>
                <div className="text-2xl font-light text-white font-mono">
                  {formatPrice(subtotal)}
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="flex items-center gap-2 py-3.5 px-8 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-200 shadow-xl disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Authorizing...</span>
                ) : (
                  <>
                    <span>Confirm Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Complimentary Carbon-Neutral Courier • 30-Day Atelier Trial</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
