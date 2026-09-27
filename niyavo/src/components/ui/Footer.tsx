'use client';

import React, { useState } from 'react';
import { ArrowUp, ArrowRight, ShieldCheck, Leaf, Globe } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-zinc-950 border-t border-white/10 text-zinc-400 text-xs font-mono">
      {/* Newsletter Allocation Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-2">
            <span className="text-amber-400 uppercase tracking-widest text-[11px] block">
              Private Allocation Dispatch
            </span>
            <h3 className="text-2xl sm:text-3xl font-extralight text-white tracking-tight">
              Access Unreleased Editions & Kyoto Lab Notes
            </h3>
            <p className="text-zinc-400 font-light text-xs max-w-md">
              Invitations to limited-batch bespoke runs, private audio previews, and architectural sound installations.
            </p>
          </div>

          <div className="lg:col-span-6">
            {subscribed ? (
              <div className="p-4 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Your private collector credentials have been registered.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md ml-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter collector email address"
                  className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-white hover:bg-amber-400 text-zinc-950 font-medium uppercase tracking-wider transition-all duration-200 shrink-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4 pr-6">
            <a href="#" className="flex items-center gap-2 text-white text-base tracking-[0.25em]">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-semibold tracking-[0.3em]">NIYAVO</span>
            </a>
            <p className="text-xs text-zinc-500 font-light leading-relaxed max-w-sm">
              Tokyo • Kyoto • Zurich. An acoustic design atelier dedicated to sculptural minimalism, planar magnetic precision, and uncompromised physical permanence.
            </p>
            <div className="flex items-center gap-4 text-zinc-500 pt-2 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-amber-400" /> 100% Recyclable Titanium
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> 5-Year Atelier Warranty
              </span>
            </div>
          </div>

          {/* Instruments */}
          <div className="space-y-3">
            <div className="text-white uppercase tracking-wider text-[11px] font-semibold">
              Instruments
            </div>
            <ul className="space-y-2 text-zinc-400 font-light">
              <li><a href="#collection" className="hover:text-white transition-colors">Sphere I</a></li>
              <li><a href="#collection" className="hover:text-white transition-colors">Aura Studio</a></li>
              <li><a href="#collection" className="hover:text-white transition-colors">Kanso Monolith</a></li>
              <li><a href="#collection" className="hover:text-white transition-colors">Orbit Luminaire</a></li>
              <li><a href="#customizer" className="hover:text-amber-400 transition-colors">3D Bespoke Studio</a></li>
            </ul>
          </div>

          {/* Engineering */}
          <div className="space-y-3">
            <div className="text-white uppercase tracking-wider text-[11px] font-semibold">
              Acoustics
            </div>
            <ul className="space-y-2 text-zinc-400 font-light">
              <li><a href="#craftsmanship" className="hover:text-white transition-colors">Titanium Monocoque</a></li>
              <li><a href="#craftsmanship" className="hover:text-white transition-colors">Planar Transducers</a></li>
              <li><a href="#acoustic-science" className="hover:text-white transition-colors">DSP Soundstage</a></li>
              <li><a href="#craftsmanship" className="hover:text-white transition-colors">Piezo Damping</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">Lab Whitepapers</a></li>
            </ul>
          </div>

          {/* Atelier */}
          <div className="space-y-3">
            <div className="text-white uppercase tracking-wider text-[11px] font-semibold">
              Atelier
            </div>
            <ul className="space-y-2 text-zinc-400 font-light">
              <li><a href="#" className="hover:text-white transition-colors">Kyoto Workshop</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Private Appointments</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Complimentary Courier</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Trade & Architecture</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press Inquiries</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 mt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div className="flex items-center gap-4">
            <span>© 2026 NIYAVO ACOUSTICS GMBH / TOKYO ATELIER.</span>
            <span>PATENTS PENDING.</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 hover:text-white cursor-pointer">
              <Globe className="w-3 h-3 text-amber-400" /> Global (EN)
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-amber-400 transition-colors"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
