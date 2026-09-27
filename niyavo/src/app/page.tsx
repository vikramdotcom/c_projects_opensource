'use client';

import React, { useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import HeroSection from '@/components/ui/HeroSection';
import ProductGrid from '@/components/ui/ProductGrid';
import StudioCustomizer from '@/components/ui/StudioCustomizer';
import CraftsmanshipSection from '@/components/ui/CraftsmanshipSection';
import SoundExperience from '@/components/ui/SoundExperience';
import Testimonials from '@/components/ui/Testimonials';
import Footer from '@/components/ui/Footer';
import CartDrawer from '@/components/ui/CartDrawer';
import CheckoutModal from '@/components/ui/CheckoutModal';
import Product3DModal from '@/components/3d/Product3DModal';
import AmbientCanvas from '@/components/3d/AmbientCanvas';
import QuickSearchModal from '@/components/ui/QuickSearchModal';
import WishlistModal from '@/components/ui/WishlistModal';
import Toast from '@/components/ui/Toast';

export default function Home() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#090A0C] text-[#EDEDED] selection:bg-amber-400 selection:text-zinc-950 font-sans overflow-x-hidden">
      {/* Three.js Ambient Particle Grid in Background */}
      <AmbientCanvas />

      {/* Main Navigation */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      <main className="relative z-10">
        {/* Hero Section with Interactive 3D Model */}
        <HeroSection />

        {/* Curated Product Catalogue */}
        <ProductGrid />

        {/* Bespoke 3D Customizer Studio */}
        <StudioCustomizer />

        {/* Acoustic Engineering & Materials */}
        <CraftsmanshipSection />

        {/* Interactive Soundstage Equalizer Demo */}
        <SoundExperience />

        {/* Critical Acclaim */}
        <Testimonials />
      </main>

      {/* Architectural Modernist Footer */}
      <Footer />

      {/* Modals & Slide-out Drawers */}
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <Product3DModal />
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <WishlistModal isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
      <Toast />
    </div>
  );
}
