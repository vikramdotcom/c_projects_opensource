'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Sliders, Waves, Activity } from 'lucide-react';

export default function SoundExperience() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bassLevel, setBassLevel] = useState(80);
  const [midLevel, setMidLevel] = useState(70);
  const [trebleLevel, setTrebleLevel] = useState(90);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Play audio synthesizer
  const togglePlay = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, ctx.currentTime);
      master.connect(ctx.destination);

      // Low shelf for bass
      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = 'lowshelf';
      bassFilter.frequency.setValueAtTime(120, ctx.currentTime);
      bassFilter.gain.setValueAtTime((bassLevel - 50) * 0.2, ctx.currentTime);

      // High shelf for treble
      const trebleFilter = ctx.createBiquadFilter();
      trebleFilter.type = 'highshelf';
      trebleFilter.frequency.setValueAtTime(6000, ctx.currentTime);
      trebleFilter.gain.setValueAtTime((trebleLevel - 50) * 0.2, ctx.currentTime);

      bassFilter.connect(trebleFilter);
      trebleFilter.connect(master);

      // Harmonic chords
      const notes = [130.81, 164.81, 196.0, 246.94, 329.63]; // Cmaj9 chord
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.05 / (idx + 1), ctx.currentTime);

        osc.connect(gain);
        gain.connect(bassFilter);
        osc.start();
      });

      audioCtxRef.current = ctx;
      bassFilterRef.current = bassFilter;
      trebleFilterRef.current = trebleFilter;
      masterGainRef.current = master;
    }

    if (isPlaying) {
      if (masterGainRef.current && audioCtxRef.current) {
        masterGainRef.current.gain.linearRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.5);
      }
      setIsPlaying(false);
    } else {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (masterGainRef.current && audioCtxRef.current) {
        masterGainRef.current.gain.linearRampToValueAtTime(0.16, audioCtxRef.current.currentTime + 0.8);
      }
      setIsPlaying(true);
    }
  };

  // Adjust EQ
  useEffect(() => {
    if (bassFilterRef.current && audioCtxRef.current) {
      bassFilterRef.current.gain.setValueAtTime((bassLevel - 50) * 0.2, audioCtxRef.current.currentTime);
    }
  }, [bassLevel]);

  useEffect(() => {
    if (trebleFilterRef.current && audioCtxRef.current) {
      trebleFilterRef.current.gain.setValueAtTime((trebleLevel - 50) * 0.2, audioCtxRef.current.currentTime);
    }
  }, [trebleLevel]);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Equalizer visualizer wave canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      step += isPlaying ? 0.05 : 0.01;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Draw responsive sound waves
      const lines = 4;
      for (let l = 0; l < lines; l++) {
        ctx.beginPath();
        ctx.lineWidth = l === 0 ? 2 : 1;
        ctx.strokeStyle =
          l === 0
            ? 'rgba(212, 175, 55, 0.9)'
            : `rgba(255, 255, 255, ${0.15 - l * 0.03})`;

        const amplitude = isPlaying ? 25 + (bassLevel / 100) * 20 : 6;
        const freq = 0.015 + l * 0.005;

        for (let x = 0; x < width; x += 3) {
          const y =
            height / 2 +
            Math.sin(x * freq + step + l) *
              amplitude *
              Math.sin((x / width) * Math.PI);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, bassLevel]);

  return (
    <section id="acoustic-science" className="py-24 bg-zinc-950 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-zinc-900/60 to-zinc-950 border border-white/15 rounded-3xl p-8 sm:p-12 relative overflow-hidden backdrop-blur-xl">
          {/* Background acoustic glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Visualizer Canvas & Audio Playback (7 cols) */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-mono tracking-widest uppercase mb-4">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Real-Time Acoustic Chamber Demo</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extralight text-white tracking-tight mb-3">
                Experience Harmonic Transparency
              </h2>
              <p className="text-sm text-zinc-400 font-light leading-relaxed mb-8 max-w-lg">
                Listen to the acoustic tuning curve of NIYAVO. Toggle playback and adjust frequency bands to simulate real-time room compensation.
              </p>

              {/* Waveform Canvas */}
              <div className="relative w-full h-40 bg-zinc-950/80 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center mb-6">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={160}
                  className="w-full h-full"
                />

                <div className="absolute top-3 left-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  DSP FREQUENCY RESPONSE • 96kHz / 24-bit
                </div>

                <div className="absolute bottom-3 right-4 flex items-center gap-2 text-[10px] font-mono text-amber-400">
                  <span className={`w-1.5 h-1.5 rounded-full bg-amber-400 ${isPlaying ? 'animate-ping' : ''}`} />
                  <span>{isPlaying ? 'STREAMING HARMONICS' : 'STANDBY'}</span>
                </div>
              </div>

              {/* Play / Pause Button */}
              <button
                onClick={togglePlay}
                className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-200 shadow-xl shadow-amber-400/10 active:scale-95"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-zinc-950" />
                    <span>Mute Acoustic Simulator</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-zinc-950" />
                    <span>Initiate Acoustic Soundstage</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Interactive Sliders (5 cols) */}
            <div className="lg:col-span-5 bg-zinc-900/60 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs uppercase font-mono tracking-widest text-zinc-300">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>DSP Equalization Matrix</span>
                </div>
                <span className="text-[11px] font-mono text-amber-400">Pure Bypass</span>
              </div>

              {/* Slider 1: Sub-Bass */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-zinc-400">Deep Sub-Bass (22Hz – 80Hz)</span>
                  <span className="text-white font-medium">{bassLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bassLevel}
                  onChange={(e) => setBassLevel(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
              </div>

              {/* Slider 2: Vocals & Midrange */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-zinc-400">Acoustic Midrange (500Hz – 2.5kHz)</span>
                  <span className="text-white font-medium">{midLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={midLevel}
                  onChange={(e) => setMidLevel(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
              </div>

              {/* Slider 3: Air & Presence */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-zinc-400">Air & Transients (8kHz – 38kHz)</span>
                  <span className="text-white font-medium">{trebleLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={trebleLevel}
                  onChange={(e) => setTrebleLevel(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs text-zinc-400 font-light">
                <Waves className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  NIYAVO automatically profiles your acoustics upon power-on using proprietary inverted impulse response filters.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
