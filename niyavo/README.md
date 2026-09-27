# NIYAVO — Modern Minimalist 3D E-Commerce Platform

A production-ready, minimalist 3D e-commerce landing page built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **Three.js**.

---

## ✨ Features

- **Procedural 3D Hero Model (Three.js & WebGL)**:
  - Real-time 360° drag & inertia rotation with mouse parallax.
  - Live finish switcher (*Obsidian Noir*, *Raw Titanium*, *Champagne Sand*, *Alabaster Ceramic*).
  - 3D annotated hotspot callouts projected onto screen space.
  - Interactive ambient binaural sound synthesizer via Web Audio API.
  - Wireframe topology inspection toggle.
- **3D Product Inspection Modal**:
  - Full-screen 3D viewer for every product in the catalogue (*Niyavo Sphere*, *Aura Wireless Headphones*, *Kanso Monolith*, *Orbit Luminaire*).
  - Exploded assembly view showing internal acoustic layers.
- **Bespoke Atelier Customizer**:
  - Material selection with live visual updates.
  - Interactive **Laser Monogram Engraving** etched directly into the titanium rim.
  - Companion accessory bundles with dynamic price calculation.
- **Acoustic Science Studio**:
  - Real-time Web Audio simulator with harmonic chords.
  - Interactive HTML5 canvas frequency wave equalizer visualizer.
  - 3-band DSP tuning sliders (Sub-Bass, Midrange, Air Presence).
- **Full E-Commerce Cart & Checkout**:
  - Slide-out cart drawer with local storage persistence.
  - Free insured worldwide courier progress bar.
  - Promo discount engine (`NIYAVO10` for 10% off, `STUDIO` for 15% off).
  - Multi-currency converter (`USD`, `EUR`, `GBP`, `JPY`).
  - Full simulated checkout with celebratory confetti fireworks and Kyoto atelier order tracking receipt.
- **Zero Memory Leaks**:
  - Comprehensive WebGL scene traversal and geometry/material disposal on unmount.
  - 100% strict type safety, zero ESLint warnings, and zero hydration mismatches.

---

## 🚀 Quick Start

### 1. Development Server

```bash
cd C:\Users\VIKRAM\.gemini\antigravity\scratch\niyavo
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Production Build & Test

```bash
npm run build
npm run start
```

### 3. Linting & Type Checking

```bash
npm run lint
npx tsc --noEmit
```

---

## 🌐 Deployment Options

### Option A: Vercel (Recommended — Zero Config)

1. Deploy directly using the Vercel CLI without installing git:
   ```bash
   npx vercel
   ```
2. Follow the interactive prompts to link your Vercel account and deploy.
3. For production:
   ```bash
   npx vercel --prod
   ```

### Option B: Netlify

1. Deploy via Netlify CLI:
   ```bash
   npx netlify deploy --build
   ```
2. For production release:
   ```bash
   npx netlify deploy --prod
   ```

### Option C: Docker Container (AWS ECS, Google Cloud Run, Railway, Render)

Build and run the production multi-stage Docker container:

```bash
# Build Docker image
docker build -t niyavo-ecommerce .

# Run container on port 3000
docker run -p 3000:3000 niyavo-ecommerce
```

---

## 📁 Project Architecture

```
niyavo/
├── src/
│   ├── app/
│   │   ├── globals.css         # Dark luxury theme, minimal scrollbar, animations
│   │   ├── layout.tsx          # Root layout with metadata and providers
│   │   └── page.tsx            # Main landing page integration
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── AmbientCanvas.tsx    # Background floating constellation particles
│   │   │   ├── HeroCanvas.tsx       # Procedural 3D Niyavo Sphere I with WebGL controls
│   │   │   └── Product3DModal.tsx   # 3D inspection modal with exploded assembly
│   │   ├── ui/
│   │   │   ├── CartDrawer.tsx       # Slide-out bag with shipping threshold & promo codes
│   │   │   ├── CheckoutModal.tsx    # Checkout flow with confetti and receipt
│   │   │   ├── CraftsmanshipSection.tsx # Material science & acoustic physics
│   │   │   ├── Footer.tsx           # Modernist architectural footer & newsletter
│   │   │   ├── HeroSection.tsx      # High-impact typography & acquisition CTA
│   │   │   ├── Navbar.tsx           # Frosted glass navbar with currency switcher
│   │   │   ├── ProductGrid.tsx      # Filterable catalogue with finish swatches
│   │   │   ├── QuickSearchModal.tsx # Instant search overlay
│   │   │   ├── SoundExperience.tsx  # Web Audio synthesizer & waveform canvas
│   │   │   ├── StudioCustomizer.tsx # Bespoke 3D laser engraving & configuration
│   │   │   ├── Testimonials.tsx     # Press acclaim (Wallpaper*, AD, Monocle)
│   │   │   ├── Toast.tsx            # Action notification toasts
│   │   │   └── WishlistModal.tsx    # Saved items collection
│   │   └── providers.tsx            # Global client providers
│   ├── context/
│   │   └── CartContext.tsx          # Cart, wishlist, currency & 3D state
│   ├── data/
│   │   └── products.ts              # Product catalog and acoustic specifications
│   └── types/
│       └── index.ts                 # TypeScript interfaces
├── Dockerfile                       # Multi-stage production container
├── package.json
└── tsconfig.json
```
