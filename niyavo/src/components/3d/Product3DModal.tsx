'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useCart } from '@/context/CartContext';
import { X, RotateCcw, Layers, ShoppingBag, Check, ShieldCheck, Truck } from 'lucide-react';

export default function Product3DModal() {
  const { active3DProduct, setActive3DProduct, addToCart, formatPrice } = useCart();
  const [selectedFinishId, setSelectedFinishId] = useState<string | null>(null);
  const [isExploded, setIsExploded] = useState(false);
  const [activeTab, setActiveTab] = useState<'3d' | 'specs'>('3d');

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const explodedPartsRef = useRef<THREE.Mesh[]>([]);

  // Drag controls
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotTargetRef = useRef({ x: 0.15, y: 0.3 });
  const rotCurrentRef = useRef({ x: 0.15, y: 0.3 });
  const zoomRef = useRef(4.8);

  const currentSelectedFinish =
    (active3DProduct && active3DProduct.finishes.find((f) => f.id === selectedFinishId)) ||
    active3DProduct?.finishes[0] ||
    null;

  useEffect(() => {
    if (!active3DProduct || !containerRef.current || !currentSelectedFinish) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0, zoomRef.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);
    explodedPartsRef.current = [];

    // Lighting
    const amb = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(amb);

    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(4, 5, 4);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x7ea8d8, 1.8);
    fill.position.set(-4, 2, -3);
    scene.add(fill);

    const accent = new THREE.PointLight(0xf59e0b, 1.4, 5);
    accent.position.set(0, -1, 2);
    scene.add(accent);

    const finishColor = currentSelectedFinish.threeColor;
    const finishRoughness = currentSelectedFinish.roughness;
    const finishMetalness = currentSelectedFinish.metalness;

    // Build specific 3D Model based on modelType
    if (active3DProduct.modelType === 'headphones') {
      // 1. HEADBAND ARCH
      const headbandCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.25, -0.1, 0),
        new THREE.Vector3(-1.0, 1.3, 0),
        new THREE.Vector3(0, 1.6, 0),
        new THREE.Vector3(1.0, 1.3, 0),
        new THREE.Vector3(1.25, -0.1, 0),
      ]);
      const headbandGeo = new THREE.TubeGeometry(headbandCurve, 64, 0.08, 16, false);
      const headbandMat = new THREE.MeshStandardMaterial({
        color: 0x1f2127,
        roughness: 0.7,
        metalness: 0.1,
      });
      const headband = new THREE.Mesh(headbandGeo, headbandMat);
      modelGroup.add(headband);

      // Cushioned inner leather strap
      const innerStrapGeo = new THREE.TubeGeometry(headbandCurve, 64, 0.05, 16, false);
      const innerStrapMat = new THREE.MeshStandardMaterial({
        color: finishColor,
        roughness: 0.4,
        metalness: 0.6,
      });
      const innerStrap = new THREE.Mesh(innerStrapGeo, innerStrapMat);
      innerStrap.scale.set(0.96, 0.96, 0.96);
      modelGroup.add(innerStrap);

      // 2. EARCUPS (Left & Right)
      [-1.3, 1.3].forEach((xPos, idx) => {
        const cupGroup = new THREE.Group();
        cupGroup.position.set(xPos, -0.2, 0);

        // Gimbal fork
        const forkGeo = new THREE.TorusGeometry(0.55, 0.04, 16, 32, Math.PI);
        const forkMat = new THREE.MeshStandardMaterial({
          color: finishColor,
          roughness: finishRoughness,
          metalness: finishMetalness,
        });
        const fork = new THREE.Mesh(forkGeo, forkMat);
        fork.rotation.z = idx === 0 ? Math.PI / 2 : -Math.PI / 2;
        cupGroup.add(fork);

        // Acoustic cup body
        const cupGeo = new THREE.CylinderGeometry(0.7, 0.65, 0.45, 48);
        const cupMat = new THREE.MeshStandardMaterial({
          color: finishColor,
          roughness: finishRoughness,
          metalness: finishMetalness,
        });
        const cupMesh = new THREE.Mesh(cupGeo, cupMat);
        cupMesh.rotation.z = Math.PI / 2;
        cupGroup.add(cupMesh);
        explodedPartsRef.current.push(cupMesh);

        // Memory foam ear cushion
        const cushionGeo = new THREE.TorusGeometry(0.55, 0.22, 24, 48);
        const cushionMat = new THREE.MeshStandardMaterial({
          color: 0x111215,
          roughness: 0.85,
          metalness: 0.05,
        });
        const cushion = new THREE.Mesh(cushionGeo, cushionMat);
        cushion.position.x = idx === 0 ? 0.25 : -0.25;
        cushion.rotation.y = Math.PI / 2;
        cupGroup.add(cushion);

        // Acoustic driver face plate
        const driverPlateGeo = new THREE.CircleGeometry(0.5, 32);
        const driverMat = new THREE.MeshStandardMaterial({
          color: 0xd4af37,
          roughness: 0.3,
          metalness: 0.9,
        });
        const driverPlate = new THREE.Mesh(driverPlateGeo, driverMat);
        driverPlate.position.x = idx === 0 ? 0.15 : -0.15;
        driverPlate.rotation.y = idx === 0 ? Math.PI / 2 : -Math.PI / 2;
        cupGroup.add(driverPlate);

        modelGroup.add(cupGroup);
      });
    } else if (active3DProduct.modelType === 'monolith') {
      // ARCHITECTURAL MONOLITH
      const columnGeo = new THREE.BoxGeometry(1.2, 2.6, 1.2);
      const columnMat = new THREE.MeshStandardMaterial({
        color: finishColor,
        roughness: Math.max(0.4, finishRoughness),
        metalness: finishMetalness * 0.7,
      });
      const column = new THREE.Mesh(columnGeo, columnMat);
      modelGroup.add(column);
      explodedPartsRef.current.push(column);

      // Coaxial Point Source Driver Horn
      const hornGeo = new THREE.ConeGeometry(0.45, 0.25, 36);
      const hornMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.2,
        metalness: 0.95,
      });
      const horn = new THREE.Mesh(hornGeo, hornMat);
      horn.rotation.x = Math.PI / 2;
      horn.position.set(0, 0.45, 0.61);
      modelGroup.add(horn);

      // Bass Woofer Rim
      const wooferGeo = new THREE.TorusGeometry(0.42, 0.04, 24, 48);
      const wooferMat = new THREE.MeshStandardMaterial({
        color: 0x1f2228,
        roughness: 0.3,
        metalness: 0.8,
      });
      const woofer = new THREE.Mesh(wooferGeo, wooferMat);
      woofer.position.set(0, -0.5, 0.61);
      modelGroup.add(woofer);

      // Solid Decoupling Base
      const baseGeo = new THREE.BoxGeometry(1.4, 0.15, 1.4);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.25,
        metalness: 0.9,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = -1.35;
      modelGroup.add(base);
    } else if (active3DProduct.modelType === 'orbit') {
      // ORBIT ACOUSTIC LUMINAIRE
      const glassGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.6, 48);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.15,
        transmission: 0.85,
        thickness: 0.4,
        transparent: true,
        opacity: 0.75,
      });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.y = 0.3;
      modelGroup.add(glass);
      explodedPartsRef.current.push(glass);

      // Internal Glowing Acoustic Filament
      const filamentGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.2, 32);
      const filamentMat = new THREE.MeshBasicMaterial({
        color: 0xffb74d,
      });
      const filament = new THREE.Mesh(filamentGeo, filamentMat);
      filament.position.y = 0.3;
      modelGroup.add(filament);

      // Spun Brass Base
      const baseGeo = new THREE.CylinderGeometry(0.75, 0.85, 0.5, 48);
      const baseMat = new THREE.MeshStandardMaterial({
        color: finishColor,
        roughness: finishRoughness,
        metalness: finishMetalness,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = -0.75;
      modelGroup.add(base);
    } else {
      // Default SPHERE
      const ringGeo = new THREE.TorusGeometry(1.3, 0.1, 32, 96);
      const ringMat = new THREE.MeshStandardMaterial({
        color: finishColor,
        roughness: finishRoughness,
        metalness: finishMetalness,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      modelGroup.add(ring);

      const sphereGeo = new THREE.SphereGeometry(1.0, 48, 48);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: finishColor,
        roughness: finishRoughness,
        metalness: finishMetalness,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      modelGroup.add(sphere);
      explodedPartsRef.current.push(sphere);

      const coreLensGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.15, 32);
      const coreLensMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.25,
        metalness: 0.95,
      });
      const coreLens = new THREE.Mesh(coreLensGeo, coreLensMat);
      coreLens.rotation.x = Math.PI / 2;
      coreLens.position.z = 0.95;
      modelGroup.add(coreLens);
    }

    // Mouse drag handlers
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      rotTargetRef.current.y += dx * 0.01;
      rotTargetRef.current.x += dy * 0.01;
      rotTargetRef.current.x = Math.max(-0.8, Math.min(0.8, rotTargetRef.current.x));
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomRef.current += e.deltaY * 0.003;
      zoomRef.current = Math.max(2.8, Math.min(7.0, zoomRef.current));
      if (cameraRef.current) {
        cameraRef.current.position.z = zoomRef.current;
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isDraggingRef.current) {
        rotTargetRef.current.y += 0.004;
      }

      rotCurrentRef.current.x += (rotTargetRef.current.x - rotCurrentRef.current.x) * 0.08;
      rotCurrentRef.current.y += (rotTargetRef.current.y - rotCurrentRef.current.y) * 0.08;

      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.x = rotCurrentRef.current.x;
        modelGroupRef.current.rotation.y = rotCurrentRef.current.y;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);

      // Memory leak prevention: traverse and dispose geometry and materials
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        }
      });
      renderer.dispose();
    };
  }, [active3DProduct, currentSelectedFinish]);

  // Exploded View effect
  useEffect(() => {
    explodedPartsRef.current.forEach((mesh) => {
      if (isExploded) {
        mesh.scale.set(1.15, 1.15, 1.15);
      } else {
        mesh.scale.set(1.0, 1.0, 1.0);
      }
    });
  }, [isExploded]);

  if (!active3DProduct || !currentSelectedFinish) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div
        className="absolute inset-0"
        onClick={() => setActive3DProduct(null)}
      />

      {/* Main Modal Card */}
      <div className="relative z-10 w-full max-w-5xl bg-zinc-950/95 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] max-h-[820px]">
        {/* Close Button */}
        <button
          onClick={() => setActive3DProduct(null)}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-all backdrop-blur-md"
          aria-label="Close 3D viewer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: 3D Canvas Viewport */}
        <div className="relative flex-1 h-[45%] md:h-full bg-gradient-to-b from-zinc-900/60 to-black/90 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
          <div
            ref={containerRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            title="Drag to rotate, scroll to zoom"
          />

          {/* 3D Viewport Controls Overlay */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-[11px] font-mono text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              Real-time 3D
            </span>
          </div>

          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
            {/* Reset View */}
            <button
              onClick={() => {
                rotTargetRef.current = { x: 0.15, y: 0.3 };
                zoomRef.current = 4.8;
                if (cameraRef.current) cameraRef.current.position.z = 4.8;
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-mono text-zinc-300 backdrop-blur-md border border-white/10 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Explode View */}
            <button
              onClick={() => setIsExploded(!isExploded)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono backdrop-blur-md border transition-all ${
                isExploded
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-white/10 border-white/10 text-zinc-300 hover:text-white hover:bg-white/20'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isExploded ? 'Assembly' : 'Explode'}</span>
            </button>
          </div>

          <div className="absolute bottom-4 right-4 pointer-events-none text-[10px] font-mono text-zinc-500">
            DRAG TO ROTATE • SCROLL TO ZOOM
          </div>
        </div>

        {/* Right Side: Product Details, Customization & Actions */}
        <div className="w-full md:w-[420px] flex flex-col justify-between p-6 sm:p-8 bg-zinc-950 overflow-y-auto">
          <div>
            {/* Header info */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono tracking-widest text-amber-400">
                {active3DProduct.category}
              </span>
              {active3DProduct.tag && (
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                  {active3DProduct.tag}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              {active3DProduct.name}
            </h2>
            <p className="text-sm text-zinc-400 mt-1 mb-4 font-light">
              {active3DProduct.subtitle}
            </p>

            <div className="text-2xl font-light text-white mb-6">
              {formatPrice(active3DProduct.price)}
              <span className="text-xs text-zinc-400 font-mono ml-2 font-normal">
                Includes duties & insured courier
              </span>
            </div>

            {/* Tabs: 3D Info vs Specs */}
            <div className="flex items-center border-b border-white/10 mb-6">
              <button
                onClick={() => setActiveTab('3d')}
                className={`pb-2.5 text-xs font-mono uppercase tracking-wider transition-all border-b-2 mr-6 ${
                  activeTab === '3d'
                    ? 'border-amber-400 text-white font-medium'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Customizer
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`pb-2.5 text-xs font-mono uppercase tracking-wider transition-all border-b-2 ${
                  activeTab === 'specs'
                    ? 'border-amber-400 text-white font-medium'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Specifications
              </button>
            </div>

            {activeTab === '3d' ? (
              <div className="space-y-6">
                {/* Finish Selection */}
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-3">
                    Select Material Finish:{' '}
                    <span className="text-white font-normal">
                      {currentSelectedFinish.name}
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {active3DProduct.finishes.map((f) => {
                      const isSelected = currentSelectedFinish.id === f.id;
                      return (
                        <button
                          key={f.id}
                          onClick={() => setSelectedFinishId(f.id)}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-amber-400 bg-amber-500/10 shadow-sm'
                              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <span
                            className="w-5 h-5 rounded-full shrink-0 border border-white/20"
                            style={{ backgroundColor: f.hex }}
                          />
                          <span className="text-xs text-white truncate font-medium">
                            {f.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <h4 className="text-xs uppercase font-mono tracking-wider text-zinc-400 mb-2">
                    Design Highlights
                  </h4>
                  <ul className="space-y-2">
                    {active3DProduct.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="text-xs text-zinc-300 flex items-start gap-2 leading-relaxed"
                      >
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(active3DProduct.specs).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between py-2 border-b border-white/5 text-xs"
                  >
                    <span className="text-zinc-400 font-mono">{key}</span>
                    <span className="text-white text-right font-medium max-w-[55%]">
                      {value}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-b border-white/5 text-xs">
                  <span className="text-zinc-400 font-mono">Dimensions</span>
                  <span className="text-white font-medium">{active3DProduct.dimensions}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5 text-xs">
                  <span className="text-zinc-400 font-mono">Weight</span>
                  <span className="text-white font-medium">{active3DProduct.weight}</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
            <button
              onClick={() => {
                addToCart(active3DProduct, currentSelectedFinish);
                setActive3DProduct(null);
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-medium text-sm transition-all shadow-lg hover:shadow-amber-400/20 active:scale-[0.99]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart ({currentSelectedFinish.name})</span>
            </button>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono px-1">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                Complimentary Courier
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                5-Year Guarantee
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
