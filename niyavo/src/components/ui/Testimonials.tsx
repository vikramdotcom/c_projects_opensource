'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      source: 'Wallpaper* Design Awards 2026',
      badge: 'Best Audio Sculpture',
      quote:
        'NIYAVO achieves what so many industrial designers aspire to: a sound instrument that holds the room with the contemplative poise of a Brâncuși bronze, backed by surgical planar acoustics.',
      author: 'Design Jury Review',
    },
    {
      source: 'Architectural Digest',
      badge: 'Curator’s Selection',
      quote:
        'No cables, no plastic seamlines, no gaudy logos. The Sphere I dissolves into high-modernist interiors while filling voluminous loft spaces with effortlessly deep, uncolored bass.',
      author: 'Julian Vance, Architecture Editor',
    },
    {
      source: 'Sound & Precision Quarterly',
      badge: 'Reference Grade',
      quote:
        'Dual-opposed planar drivers firing in push-push alignment yield zero cabinet vibration at full volume. An extraordinary engineering feat that outclasses monitors twice its physical size.',
      author: 'Dr. Evelyn Sato, Senior Electroacoustic Analyst',
    },
  ];

  return (
    <section id="reviews" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="text-center max-w-xl mx-auto mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-2 block">
          Critical Reception
        </span>
        <h2 className="text-3xl sm:text-4xl font-extralight text-white tracking-tight">
          Lauded by Designers & Acousticians
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reviews.map((r, i) => (
          <div
            key={i}
            className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8 flex flex-col justify-between backdrop-blur-sm hover:border-amber-400/40 transition-colors duration-300"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[11px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-300">
                  {r.badge}
                </span>
                <Quote className="w-5 h-5 text-zinc-600" />
              </div>

              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>

              <p className="text-zinc-300 text-sm font-light leading-relaxed mb-6 italic">
                &ldquo;{r.quote}&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="text-white text-xs font-medium font-mono uppercase tracking-wider">
                {r.source}
              </div>
              <div className="text-[11px] text-zinc-500 font-light mt-0.5">
                {r.author}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
