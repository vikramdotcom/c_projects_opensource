'use client';

import React, { useState } from 'react';
import { PRODUCTS, FINISHES } from '@/data/products';
import { ProductFinish } from '@/types';
import { useCart } from '@/context/CartContext';
import { Sparkles, Check, ShoppingBag, ShieldCheck, Award } from 'lucide-react';

export default function StudioCustomizer() {
  const baseProduct = PRODUCTS[0]; // Niyavo Sphere I
  const standProduct = PRODUCTS[4]; // Billet Dock
  const cableProduct = PRODUCTS[5]; // Silver Cable

  const [selectedFinish, setSelectedFinish] = useState<ProductFinish>(FINISHES.titanium);
  const [engravingText, setEngravingText] = useState('');
  const [includeStand, setIncludeStand] = useState(true);
  const [includeCable, setIncludeCable] = useState(false);

  const { addToCart, formatPrice } = useCart();

  const totalPrice =
    baseProduct.price +
    (includeStand ? standProduct.price : 0) +
    (includeCable ? cableProduct.price : 0);

  const handleOrderCustomized = () => {
    // Add main customized sphere with engraving
    addToCart(baseProduct, selectedFinish, 1, engravingText.trim() || undefined);

    // Add optional accessories if selected
    if (includeStand) {
      addToCart(standProduct, standProduct.finishes[0], 1);
    }
    if (includeCable) {
      addToCart(cableProduct, cableProduct.finishes[0], 1);
    }
  };

  return (
    <section id="customizer" className="py-24 bg-zinc-950/80 border-y border-white/10 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-mono tracking-widest uppercase mb-3">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Interactive Bespoke Studio</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extralight text-white tracking-tight">
            Configure Your NIYAVO
          </h2>
          <p className="text-sm text-zinc-400 mt-3 font-light">
            Each bespoke unit is hand-calibrated in our Kyoto atelier. Tailor the finish, commission laser engraving, and pair matched accessories.
          </p>
        </div>

        {/* Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Interactive Visual Display (6 cols) */}
          <div className="lg:col-span-6 bg-gradient-to-b from-zinc-900/60 to-zinc-950 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[480px] relative overflow-hidden">
            {/* Visual representation with real-time finish color */}
            <div className="relative flex items-center justify-center my-8">
              {/* Outer Ring */}
              <div
                className="w-64 h-64 sm:w-72 sm:h-72 rounded-full border-4 transition-all duration-500 flex items-center justify-center shadow-2xl relative"
                style={{
                  borderColor: selectedFinish.hex,
                  boxShadow: `0 0 60px ${selectedFinish.hex}33`,
                }}
              >
                {/* Secondary Gimbal Arch */}
                <div className="absolute inset-4 rounded-full border border-dashed border-white/20 animate-spin-slow" />

                {/* Inner Sphere Core */}
                <div
                  className="w-44 h-44 rounded-full transition-all duration-500 flex flex-col items-center justify-center text-center p-4 relative"
                  style={{
                    backgroundColor: selectedFinish.id === 'ceramic' ? '#f0f2f5' : selectedFinish.hex,
                    color: selectedFinish.id === 'ceramic' ? '#111' : '#fff',
                  }}
                >
                  <div className="w-12 h-12 rounded-full border border-amber-400/60 bg-amber-400/20 flex items-center justify-center mb-2">
                    <div className="w-4 h-4 rounded-full bg-amber-400 animate-pulse" />
                  </div>

                  <span className="text-[10px] font-mono tracking-widest uppercase opacity-75">
                    NIYAVO SPHERE I
                  </span>

                  {/* Monogram / Engraving Preview on the metal chassis */}
                  {engravingText && (
                    <div className="mt-2 px-2.5 py-0.5 rounded bg-black/40 border border-white/20 text-[10px] font-mono tracking-widest text-amber-300">
                      ENGRAVED: &quot;{engravingText.toUpperCase()}&quot;
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Live Config Summary Tags */}
            <div className="w-full flex items-center justify-between text-xs font-mono text-zinc-400 pt-6 border-t border-white/10 mt-auto">
              <div>
                <span className="text-zinc-500 uppercase">Finish:</span>{' '}
                <span className="text-white font-medium">{selectedFinish.name}</span>
              </div>
              <div>
                <span className="text-zinc-500 uppercase">Serial:</span>{' '}
                <span className="text-amber-400">#NYV-2026-4892</span>
              </div>
            </div>
          </div>

          {/* Right Column: Customization Controls (6 cols) */}
          <div className="lg:col-span-6 space-y-8">
            {/* Step 1: Material Finish */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-mono tracking-wider text-zinc-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px]">
                    01
                  </span>
                  Chassis Finish
                </span>
                <span className="text-xs text-amber-400 font-mono">
                  {selectedFinish.name}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {baseProduct.finishes.map((f) => {
                  const isSelected = selectedFinish.id === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFinish(f)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all duration-200 ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/10 scale-[1.02]'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-white/20"
                        style={{ backgroundColor: f.hex }}
                      />
                      <span className="text-xs font-mono text-white tracking-tight">
                        {f.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Custom Laser Engraving */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-mono tracking-wider text-zinc-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px]">
                    02
                  </span>
                  Laser Monogram Engraving
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  Complimentary Atelier Service
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-light mb-3">
                Fiber laser etched directly into the titanium rim. Enter initials, name, or private serial (up to 14 characters).
              </p>
              <input
                type="text"
                maxLength={14}
                value={engravingText}
                onChange={(e) => setEngravingText(e.target.value)}
                placeholder="e.g. V.K. 2026 or STUDIO"
                className="w-full px-4 py-3 bg-zinc-900/90 border border-white/15 rounded-xl text-white placeholder-zinc-600 text-sm font-mono tracking-widest focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {/* Step 3: Curated Accessories Bundle */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-mono tracking-wider text-zinc-400 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px]">
                    03
                  </span>
                  Companion Hardware
                </span>
              </div>

              <div className="space-y-3">
                {/* Accessory 1: Dock Stand */}
                <label
                  onClick={() => setIncludeStand(!includeStand)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    includeStand
                      ? 'border-amber-400/60 bg-amber-400/5'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        includeStand
                          ? 'bg-amber-400 border-amber-400 text-zinc-950'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      {includeStand && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs text-white font-medium">
                        {standProduct.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-light">
                        Machined 6061 Billet Aluminum + 15W Qi Charger
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-white">
                    +{formatPrice(standProduct.price)}
                  </div>
                </label>

                {/* Accessory 2: Silver Cable */}
                <label
                  onClick={() => setIncludeCable(!includeCable)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    includeCable
                      ? 'border-amber-400/60 bg-amber-400/5'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        includeCable
                          ? 'bg-amber-400 border-amber-400 text-zinc-950'
                          : 'border-white/20 bg-white/5'
                      }`}
                    >
                      {includeCable && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs text-white font-medium">
                        {cableProduct.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-light">
                        8-Strand 7N Pure Monocrystalline OCC Silver
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-white">
                    +{formatPrice(cableProduct.price)}
                  </div>
                </label>
              </div>
            </div>

            {/* Total and Order Button */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">
                  Custom Atelier Total
                </span>
                <div className="text-3xl font-light text-white font-mono">
                  {formatPrice(totalPrice)}
                </div>
              </div>

              <button
                onClick={handleOrderCustomized}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 py-4 px-8 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-medium text-xs font-mono uppercase tracking-wider transition-all duration-300 shadow-xl shadow-amber-400/10 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Order Custom Build</span>
              </button>
            </div>

            {/* Assurance */}
            <div className="flex items-center justify-center gap-6 text-[11px] font-mono text-zinc-500 pt-2">
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" /> Individually Calibrated
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Certificate of Authenticity
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
