'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ProductFinish } from '@/types';
import { Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';

interface HeroCanvasProps {
  currentFinish: ProductFinish;
  onFinishChange: (finish: ProductFinish) => void;
  finishes: ProductFinish[];
}

export default function HeroCanvas({ currentFinish, onFinishChange, finishes }: HeroCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isWireframe, setIsWireframe] = useState(false);
  const [activePin, setActivePin] = useState<number | null>(null);

  // References to three objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialsRef = useRef<{
    outerRing?: THREE.MeshStandardMaterial;
    core?: THREE.MeshPhysicalMaterial;
    innerRings?: THREE.MeshStandardMaterial;
    accentBrass?: THREE.MeshStandardMaterial;
    pedestal?: THREE.MeshStandardMaterial;
  }>({});
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const innerGroupRef = useRef<THREE.Group | null>(null);
  const pinPointsRef = useRef<{ [key: number]: THREE.Vector3 }>({
    1: new THREE.Vector3(0, 1.3, 0.4),
    2: new THREE.Vector3(-1.4, 0.1, 0.5),
    3: new THREE.Vector3(1.2, -0.6, 0.7),
  });
  const [pinScreenCoords, setPinScreenCoords] = useState<{ [key: number]: { x: number; y: number; visible: boolean } }>({});

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const initialFinishRef = useRef(currentFinish);

  // Interaction tracking
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.1, y: 0.2 });
  const currentRotationRef = useRef({ x: 0.1, y: 0.2 });
  const mouseScreenRef = useRef({ x: 0, y: 0 });

  // Web Audio ambient synthesizer
  const toggleAmbientAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.connect(ctx.destination);

      // Create rich ambient binaural chord (D minor - 73.4Hz D2, 110Hz A2, 146.8Hz D3, 220Hz A3)
      const freqs = [73.42, 110.0, 146.83, 220.0, 440.0];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.1 + idx * 0.05, ctx.currentTime);
        lfoGain.gain.setValueAtTime(15, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        gain.gain.setValueAtTime(0.06 / (idx + 1), ctx.currentTime);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        osc.start();
      });

      audioCtxRef.current = ctx;
      gainNodeRef.current = masterGain;
    }

    if (isPlayingAudio) {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.8);
      }
      setIsPlayingAudio(false);
    } else {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(0.12, audioCtxRef.current.currentTime + 1.2);
      }
      setIsPlayingAudio(true);
    }
  }, [isPlayingAudio]);

  // Clean up audio on unmount
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

  // Update materials when finish changes
  useEffect(() => {
    const mats = materialsRef.current;
    if (mats.outerRing) {
      mats.outerRing.color.setHex(currentFinish.threeColor);
      mats.outerRing.roughness = currentFinish.roughness;
      mats.outerRing.metalness = currentFinish.metalness;
      mats.outerRing.needsUpdate = true;
    }
    if (mats.core) {
      mats.core.color.setHex(currentFinish.id === 'ceramic' ? 0xf0f2f5 : currentFinish.threeColor);
      mats.core.roughness = currentFinish.roughness * 0.8;
      mats.core.metalness = currentFinish.metalness * 0.7;
      mats.core.needsUpdate = true;
    }
    if (mats.innerRings) {
      mats.innerRings.color.setHex(currentFinish.id === 'champagne' ? 0xebd2a4 : 0x484b54);
      mats.innerRings.needsUpdate = true;
    }
  }, [currentFinish]);

  // Toggle wireframe
  useEffect(() => {
    Object.values(materialsRef.current).forEach((mat) => {
      if (mat) mat.wireframe = isWireframe;
    });
  }, [isWireframe]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group hierarchies
    const rootGroup = new THREE.Group();
    const modelGroup = new THREE.Group();
    const innerGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    innerGroupRef.current = innerGroup;
    modelGroup.add(innerGroup);
    rootGroup.add(modelGroup);
    scene.add(rootGroup);

    // Initial finish snapshot for geometry creation
    const initFinish = initialFinishRef.current;

    // ==========================================
    // PROCEDURAL HIGH-END 3D PRODUCT GEOMETRIES
    // ==========================================

    // 1. Outer Torus Exoskeleton (Titanium / Ceramic / Obsidian)
    const outerRingGeo = new THREE.TorusGeometry(1.6, 0.14, 48, 120);
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: initFinish.threeColor,
      roughness: initFinish.roughness,
      metalness: initFinish.metalness,
      envMapIntensity: 1.5,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.castShadow = true;
    outerRing.receiveShadow = true;
    modelGroup.add(outerRing);

    // Secondary Gimbal Arch
    const gimbalGeo = new THREE.TorusGeometry(1.42, 0.06, 32, 96);
    const gimbalMat = new THREE.MeshStandardMaterial({
      color: 0x8a8d94,
      roughness: 0.3,
      metalness: 0.9,
    });
    const gimbalRing = new THREE.Mesh(gimbalGeo, gimbalMat);
    gimbalRing.rotation.y = Math.PI / 2;
    modelGroup.add(gimbalRing);

    // 2. Central Acoustic Sphere Core
    const coreGeo = new THREE.SphereGeometry(1.15, 64, 64);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: initFinish.id === 'ceramic' ? 0xf0f2f5 : initFinish.threeColor,
      roughness: initFinish.roughness * 0.8,
      metalness: initFinish.metalness * 0.7,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
      reflectivity: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.castShadow = true;
    coreMesh.receiveShadow = true;
    innerGroup.add(coreMesh);

    // 3. Acoustic Speaker Grille & Ribs (Subtle geometric texture)
    const ribCount = 18;
    const ribGroup = new THREE.Group();
    for (let i = 0; i < ribCount; i++) {
      const angle = (i / ribCount) * Math.PI * 2;
      const ribGeo = new THREE.TorusGeometry(1.18, 0.012, 16, 64);
      const ribMat = new THREE.MeshStandardMaterial({
        color: 0x1f2127,
        roughness: 0.4,
        metalness: 0.8,
      });
      const rib = new THREE.Mesh(ribGeo, ribMat);
      rib.rotation.x = Math.PI / 2;
      rib.rotation.y = angle;
      ribGroup.add(rib);
    }
    innerGroup.add(ribGroup);

    // 4. Center Planar Magnetic Driver Lens (Translucent & Glowing Amber/Gold core)
    const lensGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 48);
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x24242c,
      roughness: 0.2,
      metalness: 0.95,
    });
    const frontLens = new THREE.Mesh(lensGeo, lensMat);
    frontLens.rotation.x = Math.PI / 2;
    frontLens.position.z = 1.05;
    innerGroup.add(frontLens);

    // Brass/Champagne Center Diaphragm Accent
    const diaphragmGeo = new THREE.RingGeometry(0.18, 0.46, 48);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.25,
      metalness: 0.95,
    });
    const diaphragm = new THREE.Mesh(diaphragmGeo, brassMat);
    diaphragm.position.z = 1.12;
    innerGroup.add(diaphragm);

    // Back Driver Lens
    const backLens = frontLens.clone();
    backLens.position.z = -1.05;
    innerGroup.add(backLens);

    // 5. Kinetic Floating Acoustic Wave Rings
    const ringGroup = new THREE.Group();
    const ringMat = new THREE.MeshStandardMaterial({
      color: initFinish.id === 'champagne' ? 0xebd2a4 : 0x5a5d68,
      roughness: 0.2,
      metalness: 0.9,
    });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.018, 16, 96), ringMat);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.012, 16, 96), ringMat);
    ring1.rotation.x = 0.4;
    ring2.rotation.y = 0.5;
    ringGroup.add(ring1);
    ringGroup.add(ring2);
    modelGroup.add(ringGroup);

    // 6. Sculptural Pedestal / Decoupling Base
    const baseGeo = new THREE.CylinderGeometry(0.7, 0.9, 0.2, 48);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x111216,
      roughness: 0.35,
      metalness: 0.9,
    });
    const pedestal = new THREE.Mesh(baseGeo, baseMat);
    pedestal.position.y = -1.75;
    pedestal.receiveShadow = true;
    rootGroup.add(pedestal);

    // 7. Ambient Micro Dust Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 2.2 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      particlePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i + 2] = radius * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xd4af37,
      size: 0.025,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particles);

    // Store material references
    materialsRef.current = {
      outerRing: outerRingMat,
      core: coreMat,
      innerRings: ringMat,
      accentBrass: brassMat,
      pedestal: baseMat,
    };

    // ==========================================
    // LIGHTING SETUP
    // ==========================================
    // Studio Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Key Light (Warm Champagne Studio Spotlight)
    const keyLight = new THREE.DirectionalLight(0xfff6ea, 2.8);
    keyLight.position.set(4, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    scene.add(keyLight);

    // Rim Light (Sleek Ice-Cyan Titanium Edge)
    const rimLight = new THREE.DirectionalLight(0x7ea8d8, 2.2);
    rimLight.position.set(-5, 2, -4);
    scene.add(rimLight);

    // Warm Under-Glow (Amber Acoustic Hearth)
    const pointLight = new THREE.PointLight(0xf59e0b, 1.8, 6);
    pointLight.position.set(0, -0.6, 1.5);
    scene.add(pointLight);

    // Subtle Ground Glow Plane
    const shadowGeo = new THREE.PlaneGeometry(6, 6);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.25 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.85;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // ==========================================
    // EVENT LISTENERS & SMOOTH MOUSE CONTROLS
    // ==========================================
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      // Parallax tracker
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseScreenRef.current = { x: normX, y: normY };

      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      targetRotationRef.current.y += deltaX * 0.008;
      targetRotationRef.current.x += deltaY * 0.008;

      // Clamp vertical rotation
      targetRotationRef.current.x = Math.max(-0.6, Math.min(0.6, targetRotationRef.current.x));

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

      targetRotationRef.current.y += deltaX * 0.009;
      targetRotationRef.current.x += deltaY * 0.009;
      targetRotationRef.current.x = Math.max(-0.6, Math.min(0.6, targetRotationRef.current.x));

      previousMousePositionRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const onResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', onResize);

    // ==========================================
    // ANIMATION RENDER LOOP
    // ==========================================
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle auto-rotation when user is not dragging
      if (!isDraggingRef.current) {
        targetRotationRef.current.y += 0.003;
      }

      // Smooth damping interpolation (lerp)
      currentRotationRef.current.x +=
        (targetRotationRef.current.x - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y +=
        (targetRotationRef.current.y - currentRotationRef.current.y) * 0.08;

      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.x = currentRotationRef.current.x;
        modelGroupRef.current.rotation.y = currentRotationRef.current.y;
      }

      // Parallax camera sway
      if (cameraRef.current) {
        cameraRef.current.position.x +=
          (mouseScreenRef.current.x * 0.4 - cameraRef.current.position.x) * 0.04;
        cameraRef.current.position.y +=
          (0.2 + mouseScreenRef.current.y * 0.25 - cameraRef.current.position.y) * 0.04;
        cameraRef.current.lookAt(0, 0, 0);
      }

      // Floating kinetic rings movement
      ring1.rotation.z += 0.005;
      ring2.rotation.z -= 0.004;

      // Particle slow drift
      particles.rotation.y = elapsedTime * 0.02;

      // Subtle breathing pulse on the core light
      pointLight.intensity = 1.6 + Math.sin(elapsedTime * 2) * 0.35;

      // Project 3D Hotspot Coordinates to 2D Screen Space
      if (cameraRef.current && containerRef.current && modelGroupRef.current) {
        const coords: { [key: number]: { x: number; y: number; visible: boolean } } = {};
        const widthHalf = containerRef.current.clientWidth / 2;
        const heightHalf = containerRef.current.clientHeight / 2;

        Object.entries(pinPointsRef.current).forEach(([pinId, vector]) => {
          const worldVec = vector.clone();
          worldVec.applyMatrix4(modelGroupRef.current!.matrixWorld);

          // Project to NDC (-1 to +1)
          worldVec.project(cameraRef.current!);

          const isFacingCamera = worldVec.z < 1.0;
          coords[Number(pinId)] = {
            x: worldVec.x * widthHalf + widthHalf,
            y: -(worldVec.y * heightHalf) + heightHalf,
            visible: isFacingCamera,
          };
        });
        setPinScreenCoords(coords);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', onResize);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
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
  }, []);

  const resetView = () => {
    targetRotationRef.current = { x: 0.1, y: 0.2 };
  };

  return (
    <div className="relative w-full h-[520px] md:h-[660px] flex items-center justify-center select-none overflow-hidden group">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        title="Click and drag to rotate in 3D"
      />

      {/* Floating 3D Interactive Hotspot Pins */}
      {Object.entries(pinScreenCoords).map(([id, coord]) => {
        if (!coord.visible) return null;
        const pinId = Number(id);
        const isActive = activePin === pinId;

        const pinLabels: { [key: number]: { title: string; desc: string } } = {
          1: {
            title: 'Titanium Exoskeleton',
            desc: 'Continuous CNC Grade 5 titanium ring eliminates standing wave resonances.',
          },
          2: {
            title: 'Dual Planar Drivers',
            desc: '70mm ultra-thin opposed transducers deliver lightning transients down to 22Hz.',
          },
          3: {
            title: 'Rotary Haptic Crown',
            desc: 'Jewel-bearing optical dial with 24 discrete micro-tactile resistance steps.',
          },
        };

        return (
          <div
            key={pinId}
            style={{
              position: 'absolute',
              left: `${coord.x}px`,
              top: `${coord.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className="pointer-events-auto z-20"
          >
            <button
              onClick={() => setActivePin(isActive ? null : pinId)}
              className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/40 text-white text-xs font-mono shadow-xl transition-all duration-300 hover:scale-125 hover:bg-amber-500/80 hover:border-amber-300"
              aria-label={`Hotspot ${pinId}`}
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/30 opacity-75" />
              0{pinId}
            </button>

            {isActive && (
              <div className="absolute left-8 top-1/2 -translate-y-1/2 w-64 bg-zinc-900/95 backdrop-blur-xl border border-white/15 p-3.5 rounded-xl shadow-2xl text-left animate-in fade-in zoom-in-95 duration-200 z-30">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-mono">
                    Specification 0{pinId}
                  </span>
                  <button
                    onClick={() => setActivePin(null)}
                    className="text-zinc-400 hover:text-white text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
                <h4 className="text-sm font-medium text-white mb-1">
                  {pinLabels[pinId].title}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-light">
                  {pinLabels[pinId].desc}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Floating 3D Interaction Control HUD */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Audio Pulse Generator Button */}
        <button
          onClick={toggleAmbientAudio}
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-mono backdrop-blur-md border transition-all duration-300 ${
            isPlayingAudio
              ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 shadow-lg shadow-amber-500/10'
              : 'bg-black/30 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle ambient binaural frequency synthesizer"
        >
          {isPlayingAudio ? (
            <>
              <Volume2 className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>Acoustic Pulse (Active)</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>Ambient Audio</span>
            </>
          )}
        </button>

        {/* Reset Camera View */}
        <button
          onClick={resetView}
          className="flex items-center justify-center p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-all"
          title="Reset 3D camera orientation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Wireframe Mesh Mode */}
        <button
          onClick={() => setIsWireframe(!isWireframe)}
          className={`flex items-center justify-center p-2 rounded-full backdrop-blur-md border transition-all ${
            isWireframe
              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
              : 'bg-black/30 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
          title="Toggle wireframe topology inspection"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Drag Hint at Bottom Center */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-[11px] text-zinc-400 font-mono tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
        <span>DRAG TO ROTATE 360° • HOVER FOR PARALLAX</span>
      </div>

      {/* Floating Finish Selector directly on the 3D viewport */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-xl border border-white/15 px-3 py-2 rounded-2xl shadow-xl">
        <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 pr-1 border-r border-white/15">
          Finish
        </span>
        <div className="flex items-center gap-2">
          {finishes.map((f) => (
            <button
              key={f.id}
              onClick={() => onFinishChange(f)}
              className={`group relative flex items-center justify-center w-6 h-6 rounded-full transition-transform ${
                currentFinish.id === f.id
                  ? 'ring-2 ring-amber-400 scale-110 shadow-md'
                  : 'hover:scale-105 opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: f.hex }}
              title={f.name}
            >
              {currentFinish.id === f.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
