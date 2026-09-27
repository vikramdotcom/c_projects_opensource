'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Search, Heart, Menu, X, ChevronDown, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
}

export default function Navbar({ onOpenSearch, onOpenWishlist }: NavbarProps) {
  const { cartCount, setIsCartOpen, currency, setCurrency, wishlist } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currencies: Array<'USD' | 'EUR' | 'GBP' | 'JPY'> = ['USD', 'EUR', 'GBP', 'JPY'];

  return (
    <>
      {/* Top micro-announcement banner */}
      <div className="w-full bg-zinc-950 text-zinc-400 border-b border-white/5 py-1.5 px-4 text-center text-[11px] font-mono tracking-wider flex items-center justify-center gap-3">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>NIYAVO EDITION 2026 • COMPLIMENTARY WORLDWIDE INSURED COURIER</span>
        <span className="hidden sm:inline text-zinc-600">|</span>
        <span className="hidden sm:inline text-zinc-300">LIMITED SERIAL ALLOCATION</span>
      </div>

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-zinc-950/85 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3.5'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="group flex items-center gap-2.5 text-white tracking-[0.25em] font-light text-xl hover:opacity-85 transition-opacity"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
              <span className="font-semibold text-lg tracking-[0.3em]">NIYAVO</span>
            </a>
            <span className="hidden md:inline-block text-[10px] font-mono uppercase tracking-widest text-zinc-500 border border-white/10 px-2 py-0.5 rounded-full">
              Studio Acoustic
            </span>
          </div>

          {/* Center: Minimalist Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-mono uppercase tracking-widest text-zinc-400">
            <a
              href="#collection"
              className="hover:text-white transition-colors duration-200"
            >
              Collection
            </a>
            <a
              href="#customizer"
              className="hover:text-amber-400 transition-colors duration-200 flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              3D Studio
            </a>
            <a
              href="#craftsmanship"
              className="hover:text-white transition-colors duration-200"
            >
              Craftsmanship
            </a>
            <a
              href="#acoustic-science"
              className="hover:text-white transition-colors duration-200"
            >
              Sound Science
            </a>
            <a
              href="#reviews"
              className="hover:text-white transition-colors duration-200"
            >
              Acclaim
            </a>
          </nav>

          {/* Right: Actions (Currency, Search, Wishlist, Cart) */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Currency Selector */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
                aria-label="Select currency"
              >
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-24 bg-zinc-900 border border-white/15 rounded-xl shadow-xl py-1 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  {currencies.map((cur) => (
                    <button
                      key={cur}
                      onClick={() => {
                        setCurrency(cur);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors ${
                        currency === cur
                          ? 'text-amber-400 bg-white/5 font-semibold'
                          : 'text-zinc-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {cur}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
              title="Search collection"
              aria-label="Search collection"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist Trigger */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
              title="Saved items"
              aria-label="Saved items"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 py-1.5 px-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-mono transition-all duration-200 group active:scale-95"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5 group-hover:text-amber-400 transition-colors" />
              <span className="hidden sm:inline">Bag</span>
              <span className="w-5 h-5 rounded-full bg-amber-400 text-zinc-950 font-bold text-[10px] flex items-center justify-center">
                {cartCount}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-zinc-950/95 border-b border-white/10 px-6 py-6 backdrop-blur-2xl animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col space-y-4 text-sm font-mono uppercase tracking-widest text-zinc-300">
              <a
                href="#collection"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1"
              >
                Collection
              </a>
              <a
                href="#customizer"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-amber-400 text-amber-300 flex items-center gap-2 py-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                3D Studio Customizer
              </a>
              <a
                href="#craftsmanship"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1"
              >
                Craftsmanship
              </a>
              <a
                href="#acoustic-science"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1"
              >
                Sound Science
              </a>
              <a
                href="#reviews"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-white py-1"
              >
                Acclaim
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
