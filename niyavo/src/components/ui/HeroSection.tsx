'use client';

import React, { useState } from 'react';
import HeroCanvas from '@/components/3d/HeroCanvas';
import { PRODUCTS, FINISHES } from '@/data/products';
import { ProductFinish } from '@/types';
import { useCart } from '@/context/CartContext';
import { ArrowUpRight, ShieldCheck, Zap, Radio, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const flagshipProduct = PRODUCTS[0]; // Niyavo Sphere I
  const [currentFinish, setCurrentFinish] = useState<ProductFinish>(FINISHES.titanium);
  const { addToCart, setActive3DProduct, formatPrice } = useCart();

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between pt-4 pb-16 overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Hero Header Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4 sm:pt-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[11px] font-mono tracking-widest text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-amber-400">NIYAVO SPHERE I</span>
            <span className="text-zinc-600">/</span>
            <span>AEROSPACE GRADE 5 TITANIUM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extralight tracking-tight text-white leading-[1.08]">
            Pure Form.
            <br />
            <span className="italic font-serif text-zinc-200">Architectural</span> Sound.
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto font-light leading-relaxed">
            A radical departure in acoustic geometry. Dual-opposed planar magnetic drivers encased in a vibration-neutral titanium chassis.
          </p>
        </div>
      </div>

      {/* Main Interactive 3D Canvas Showcase */}
      <div className="relative w-full max-w-6xl mx-auto px-2 sm:px-4 my-2">
        <HeroCanvas
          currentFinish={currentFinish}
          onFinishChange={setCurrentFinish}
          finishes={flagshipProduct.finishes}
        />
      </div>

      {/* Hero Action Bar & Quick Specs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
          {/* Left: Direct Acquisition */}
          <div className="flex flex-wrap items-center gap-4 text-center md:text-left">
            <div>
              <div className="text-xs uppercase font-mono tracking-widest text-zinc-400">
                {currentFinish.name} Edition
              </div>
              <div className="text-2xl font-light text-white tracking-tight">
                {formatPrice(flagshipProduct.price)}
                <span className="text-xs font-mono text-zinc-500 font-normal ml-2">
                  USD base • In Stock
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => addToCart(flagshipProduct, currentFinish)}
                className="flex items-center gap-2 py-3 px-6 rounded-full bg-white text-zinc-950 hover:bg-amber-300 font-medium text-xs font-mono uppercase tracking-wider transition-all duration-300 shadow-xl hover:shadow-amber-400/20 active:scale-95"
              >
                <span>Acquire Sphere I</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActive3DProduct(flagshipProduct)}
                className="flex items-center gap-2 py-3 px-5 rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs font-mono uppercase tracking-wider transition-all backdrop-blur-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>360° Studio</span>
              </button>
            </div>
          </div>

          {/* Right: Technical Credentials */}
          <div className="grid grid-cols-3 gap-6 sm:gap-10 text-left border-l border-white/10 pl-6 hidden sm:grid">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                <Radio className="w-3 h-3 text-amber-400" />
                <span>RESPONSE</span>
              </div>
              <div className="text-sm font-medium text-white mt-0.5">22Hz – 38kHz</div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>THD DISTORTION</span>
              </div>
              <div className="text-sm font-medium text-white mt-0.5">&lt; 0.005%</div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>WARRANTY</span>
              </div>
              <div className="text-sm font-medium text-white mt-0.5">5-Year Global</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
