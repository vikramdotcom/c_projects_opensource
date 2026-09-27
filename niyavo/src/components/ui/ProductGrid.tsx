'use client';

import React, { useState } from 'react';
import { PRODUCTS } from '@/data/products';
import { ProductFinish } from '@/types';
import { useCart } from '@/context/CartContext';
import { Heart, Plus, Sparkles, Star } from 'lucide-react';

export default function ProductGrid() {
  const { addToCart, setActive3DProduct, formatPrice, toggleWishlist, isWishlisted } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cardFinishes, setCardFinishes] = useState<{ [productId: string]: ProductFinish }>(() => {
    const initial: { [key: string]: ProductFinish } = {};
    PRODUCTS.forEach((p) => {
      initial[p.id] = p.finishes[0];
    });
    return initial;
  });

  const categories = [
    { id: 'all', label: 'Complete Collection' },
    { id: 'systems', label: 'Acoustic Systems' },
    { id: 'headphones', label: 'Studio Headphones' },
    { id: 'ambient', label: 'Ambient Objects' },
    { id: 'accessories', label: 'Accessories' },
  ];

  const filteredProducts =
    selectedCategory === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === selectedCategory);

  const handleFinishChange = (productId: string, finish: ProductFinish) => {
    setCardFinishes((prev) => ({ ...prev, [productId]: finish }));
  };

  return (
    <section id="collection" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-2">
            Curated Catalogue
          </div>
          <h2 className="text-3xl sm:text-4xl font-extralight text-white tracking-tight">
            Objects of Sound & Solitude
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-200 ${
                selectedCategory === cat.id
                  ? 'bg-white text-zinc-950 font-medium shadow-md'
                  : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => {
          const currentFinish = cardFinishes[product.id] || product.finishes[0];
          const wishlisted = isWishlisted(product.id);

          return (
            <div
              key={product.id}
              className="group relative bg-zinc-900/40 hover:bg-zinc-900/70 border border-white/10 hover:border-amber-400/40 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between backdrop-blur-sm"
            >
              {/* Top Row: Tag, Rating, Wishlist */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  {product.tag ? (
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                      {product.tag}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                      {product.category}
                    </span>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{product.rating}</span>
                      <span className="text-zinc-600">({product.reviewCount})</span>
                    </div>

                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`p-1.5 rounded-full transition-colors ${
                        wishlisted
                          ? 'text-amber-400 bg-amber-400/10'
                          : 'text-zinc-500 hover:text-white hover:bg-white/5'
                      }`}
                      title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                      aria-label="Wishlist"
                    >
                      <Heart
                        className={`w-4 h-4 ${wishlisted ? 'fill-amber-400' : ''}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Minimalist Graphic Visual Frame */}
                <div
                  className="relative w-full h-56 rounded-2xl flex items-center justify-center overflow-hidden mb-6 border border-white/5 transition-transform duration-500 group-hover:scale-[1.01]"
                  style={{
                    background: `radial-gradient(circle at center, ${currentFinish.hex}33 0%, #0d0e12 100%)`,
                  }}
                >
                  {/* Subtle 3D Graphic Wireframe Representation */}
                  <div className="relative flex items-center justify-center">
                    {product.modelType === 'sphere' && (
                      <div className="relative w-32 h-32 rounded-full border border-white/20 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:rotate-12">
                        <div
                          className="w-24 h-24 rounded-full border border-dashed border-amber-400/40 flex items-center justify-center"
                          style={{ backgroundColor: currentFinish.hex }}
                        >
                          <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/60" />
                        </div>
                      </div>
                    )}

                    {product.modelType === 'headphones' && (
                      <div className="relative w-36 h-32 flex items-center justify-center">
                        <div className="absolute top-2 w-28 h-20 border-t-2 border-l-2 border-r-2 border-white/30 rounded-t-full" />
                        <div className="flex justify-between w-28 mt-8">
                          <div
                            className="w-8 h-12 rounded-2xl border border-white/20 shadow-xl"
                            style={{ backgroundColor: currentFinish.hex }}
                          />
                          <div
                            className="w-8 h-12 rounded-2xl border border-white/20 shadow-xl"
                            style={{ backgroundColor: currentFinish.hex }}
                          />
                        </div>
                      </div>
                    )}

                    {product.modelType === 'monolith' && (
                      <div className="relative flex flex-col items-center">
                        <div
                          className="w-16 h-32 rounded-lg border border-white/20 shadow-2xl flex flex-col items-center justify-around py-3"
                          style={{ backgroundColor: currentFinish.hex }}
                        >
                          <div className="w-8 h-8 rounded-full border border-amber-400/60 bg-amber-400/10" />
                          <div className="w-10 h-10 rounded-full border border-white/10" />
                        </div>
                        <div className="w-20 h-2 bg-amber-400/80 rounded-sm mt-1" />
                      </div>
                    )}

                    {product.modelType === 'orbit' && (
                      <div className="relative flex flex-col items-center">
                        <div className="w-16 h-28 rounded-t-full border border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center">
                          <div className="w-2 h-14 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50" />
                        </div>
                        <div
                          className="w-20 h-6 rounded-b-md border border-white/20"
                          style={{ backgroundColor: currentFinish.hex }}
                        />
                      </div>
                    )}
                  </div>

                  {/* 3D Inspect Overlay Trigger */}
                  <button
                    onClick={() => setActive3DProduct(product)}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-amber-400 text-zinc-300 hover:text-zinc-950 border border-white/15 text-[11px] font-mono uppercase tracking-wider backdrop-blur-md transition-all duration-200 shadow-lg"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>3D Inspect</span>
                  </button>
                </div>

                {/* Product Titles */}
                <h3 className="text-xl font-light text-white tracking-tight mb-1 group-hover:text-amber-300 transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-zinc-400 font-light mb-4 line-clamp-2">
                  {product.subtitle}
                </p>

                {/* Finish Swatches */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                    Finish:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {product.finishes.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => handleFinishChange(product.id, f)}
                        className={`w-4 h-4 rounded-full transition-transform ${
                          currentFinish.id === f.id
                            ? 'ring-2 ring-amber-400 scale-125'
                            : 'opacity-70 hover:opacity-100 hover:scale-110'
                        }`}
                        style={{ backgroundColor: f.hex }}
                        title={f.name}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-zinc-400 ml-1 font-mono">
                    {currentFinish.name}
                  </span>
                </div>
              </div>

              {/* Bottom Price and Add to Bag */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                    Price
                  </div>
                  <div className="text-lg font-light text-white font-mono">
                    {formatPrice(product.price)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addToCart(product, currentFinish)}
                    className="flex items-center gap-1.5 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-amber-400 text-white hover:text-zinc-950 font-mono text-xs uppercase tracking-wider border border-white/15 transition-all duration-200 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
