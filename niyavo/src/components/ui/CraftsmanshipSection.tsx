'use client';

import React, { useState } from 'react';
import { Layers, Shield, Cpu, Wind } from 'lucide-react';

export default function CraftsmanshipSection() {
  const [activeMaterial, setActiveMaterial] = useState<number>(0);

  const materials = [
    {
      id: 0,
      title: 'Aerospace Grade 5 Titanium',
      subtitle: '5-Axis CNC Continuous Billet Monocoque',
      desc: 'Each exoskeleton ring is carved over 14 hours from a solid 12kg billet of Grade 5 (Ti-6Al-4V) aerospace titanium. The resulting structure provides unmatched structural rigidity, eliminating micro-flexing and delivering pristine transient response.',
      stat: '0.003%',
      statLabel: 'Total Harmonic Distortion',
      icon: Layers,
      highlight: 'Continuous Monocoque Structure',
    },
    {
      id: 1,
      title: 'Damped Acoustic Ceramic',
      subtitle: 'Sintered Alumina Matrix with Zero Resonance',
      desc: 'Unlike conventional wood, plastic, or resin enclosures, our proprietary sintered alumina acoustic ceramic possesses ultra-high internal sound velocity and internal damping. Standing waves are absorbed before they can color the acoustic field.',
      stat: '98.4%',
      statLabel: 'Vibration Dissipation Efficiency',
      icon: Shield,
      highlight: 'Piezo-Damped Acoustic Chambers',
    },
    {
      id: 2,
      title: 'Dual Opposed Planar Drivers',
      subtitle: 'Push-Push Mechanical Recoil Cancellation',
      desc: 'Two identical 70mm planar magnetic transducers fire in exact opposing symmetry. Newton’s third law dictates that internal physical momentum cancels out entirely—yielding a sound vessel that remains completely inert even at full 180W peak output.',
      stat: '0.0 mm',
      statLabel: 'Enclosure Kinetic Displacement',
      icon: Cpu,
      highlight: 'Newtonian Force Cancellation',
    },
    {
      id: 3,
      title: 'Room-Sensing Acoustic DSP',
      subtitle: 'Ultrasonic Boundary Correction at 96kHz',
      desc: 'An array of MEMS microphones measures the boundary reflections of your room upon startup. The custom 64-bit floating-point DSP compensates for corner bass gain and surface reflections in real time.',
      stat: '96 kHz / 64-bit',
      statLabel: 'Continuous Room Phase Correction',
      icon: Wind,
      highlight: 'Adaptive Boundary Linearization',
    },
  ];

  const current = materials[activeMaterial];
  const CurrentIcon = current.icon;

  return (
    <section id="craftsmanship" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="max-w-2xl mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-2 block">
          Acoustic Engineering
        </span>
        <h2 className="text-3xl sm:text-5xl font-extralight text-white tracking-tight leading-tight">
          Obsession with Material Honesty.
        </h2>
        <p className="text-sm text-zinc-400 mt-4 font-light leading-relaxed">
          Every contour exists for acoustic justification. No superficial ornamentation, no synthetic veneers. Only raw elements refined to micron tolerances.
        </p>
      </div>

      {/* Interactive Material Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Navigation Tabs (4 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {materials.map((mat) => {
            const Icon = mat.icon;
            const isSelected = activeMaterial === mat.id;
            return (
              <button
                key={mat.id}
                onClick={() => setActiveMaterial(mat.id)}
                className={`p-5 rounded-2xl border text-left transition-all duration-300 flex items-start gap-4 ${
                  isSelected
                    ? 'border-amber-400/80 bg-zinc-900/90 shadow-xl shadow-amber-400/5'
                    : 'border-white/10 bg-zinc-950/40 hover:border-white/20 hover:bg-zinc-900/40 text-zinc-400'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-amber-400 text-zinc-950 border-amber-300'
                      : 'bg-white/5 border-white/10 text-zinc-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div
                    className={`text-sm font-medium transition-colors ${
                      isSelected ? 'text-white' : 'text-zinc-300'
                    }`}
                  >
                    {mat.title}
                  </div>
                  <div className="text-xs text-zinc-500 font-light mt-0.5">
                    {mat.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail Display Panel (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900/40 border border-white/10 rounded-3xl p-8 sm:p-10 flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/5 rounded-full blur-[100px] pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-amber-300 mb-6">
              <CurrentIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>{current.highlight}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-2">
              {current.title}
            </h3>
            <div className="text-xs font-mono uppercase text-zinc-400 mb-6">
              {current.subtitle}
            </div>

            <p className="text-zinc-300 text-sm sm:text-base font-light leading-relaxed mb-8">
              {current.desc}
            </p>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-3xl sm:text-4xl font-extralight text-amber-400 font-mono">
                {current.stat}
              </div>
              <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider mt-1">
                {current.statLabel}
              </div>
            </div>

            <div className="text-xs font-mono text-zinc-500 text-right">
              ATELIER VERIFIED • KYOTO LAB
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
