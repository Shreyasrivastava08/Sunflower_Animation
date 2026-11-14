import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { NurtureAction } from '../types/sunflower';

export interface SunflowerCanvasProps {
  growthStage: number; // 0 to 100
  height: number; // cm
  waterLevel: number; // 0 to 100
  sunlightExposure: number; // 0 to 100
  petalColor: string; // Hex color code
  flowerName?: string;
  onCanvasClick?: () => void;
}

export interface SunflowerCanvasHandle {
  triggerBurst: (action: NurtureAction | 'celebrate') => void;
}

interface Particle {
  id: number;
  type: 'water' | 'sunlight' | 'fertilize' | 'celebrate' | 'pollen';
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color?: string;
  rotation?: number;
  rotationSpeed?: number;
}

// Utility: Golden angle in radians (Fibonacci phyllotaxis)
const GOLDEN_ANGLE = 137.50776 * (Math.PI / 180);

// Utility: Hex to RGB & brightness adjuster
function hexToRgb(hex: string) {
  let cleaned = hex.replace('#', '');
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function adjustColorBrightness(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  const clampR = Math.min(255, Math.max(0, Math.round(r * factor)));
  const clampG = Math.min(255, Math.max(0, Math.round(g * factor)));
  const clampB = Math.min(255, Math.max(0, Math.round(b * factor)));
  return `rgb(${clampR}, ${clampG}, ${clampB})`;
}

export const SunflowerCanvas = forwardRef<SunflowerCanvasHandle, SunflowerCanvasProps>(
  (
    {
      growthStage,
      height,
      waterLevel,
      sunlightExposure,
      petalColor,
      flowerName = 'Sunflower',
      onCanvasClick,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Mouse tracking for Heliotropism
    const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const isMouseOverRef = useRef<boolean>(false);

    // Particle pool
    const particlesRef = useRef<Particle[]>([]);
    const nextParticleIdRef = useRef<number>(1);

    // Animated / Lerped values for biological smoothness
    const animRef = useRef({
      growth: growthStage,
      height: height,
      water: waterLevel,
      sunlight: sunlightExposure,
      headTilt: 0,
      time: 0,
    });

    // Track previous growth to detect first-time full bloom crossing
    const prevGrowthRef = useRef<number>(growthStage);

    // Expose particle trigger to parent
    useImperativeHandle(ref, () => ({
      triggerBurst(action: NurtureAction | 'celebrate') {
        spawnBurst(action);
      },
    }));

    const spawnBurst = useCallback((action: NurtureAction | 'celebrate') => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const flowerHeadX = width / 2;
      const flowerHeadY = height * 0.4;

      if (action === 'celebrate') {
        // Celebratory Grand Bloom Burst: 100 golden pollen motes & fluttering petals
        for (let i = 0; i < 110; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2.5 + Math.random() * 6.5;
          const isPetal = i % 3 === 0;

          particlesRef.current.push({
            id: nextParticleIdRef.current++,
            type: 'celebrate',
            x: flowerHeadX,
            y: flowerHeadY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.5,
            size: isPetal ? 4 + Math.random() * 5 : 2 + Math.random() * 3,
            alpha: 1,
            life: 0,
            maxLife: 120 + Math.random() * 60,
            color: isPetal
              ? petalColor
              : Math.random() > 0.5
              ? '#FFD700'
              : '#FDE047',
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.15,
          });
        }
      } else if (action === 'water') {
        // Spawn 45 gentle falling blue water droplets
        for (let i = 0; i < 45; i++) {
          particlesRef.current.push({
            id: nextParticleIdRef.current++,
            type: 'water',
            x: flowerHeadX + (Math.random() - 0.5) * 360,
            y: Math.random() * -120,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 4.5 + Math.random() * 4.5,
            size: 2.5 + Math.random() * 2.5,
            alpha: 0.85,
            life: 0,
            maxLife: 90 + Math.random() * 30,
            color: '#38bdf8',
          });
        }
      } else if (action === 'sunlight') {
        // Spawn 50 glowing radiant photon sparkles around the flower
        for (let i = 0; i < 50; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 30 + Math.random() * 160;
          particlesRef.current.push({
            id: nextParticleIdRef.current++,
            type: 'sunlight',
            x: flowerHeadX + Math.cos(angle) * dist,
            y: flowerHeadY + Math.sin(angle) * dist,
            vx: (Math.random() - 0.5) * 1.8,
            vy: -0.8 - Math.random() * 1.8,
            size: 3 + Math.random() * 4,
            alpha: 1,
            life: 0,
            maxLife: 70 + Math.random() * 40,
            color: '#fbbf24',
            rotation: Math.random() * Math.PI,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
          });
        }
      } else if (action === 'fertilize') {
        // Spawn 45 emerald-gold spiraling nutrient motes from soil up
        const groundY = height * 0.85;
        for (let i = 0; i < 45; i++) {
          particlesRef.current.push({
            id: nextParticleIdRef.current++,
            type: 'fertilize',
            x: flowerHeadX + (Math.random() - 0.5) * 160,
            y: groundY + (Math.random() - 0.5) * 30,
            vx: (Math.random() - 0.5) * 2,
            vy: -2.5 - Math.random() * 3.5,
            size: 3 + Math.random() * 3,
            alpha: 0.95,
            life: 0,
            maxLife: 100 + Math.random() * 40,
            color: Math.random() > 0.4 ? '#34d399' : '#facc15',
            rotation: Math.random() * Math.PI,
            rotationSpeed: (Math.random() - 0.5) * 0.08,
          });
        }
      }
    }, [petalColor]);

    // Automatically trigger celebratory golden pollen/petal burst when full bloom is achieved
    useEffect(() => {
      if (growthStage >= 100 && prevGrowthRef.current < 100) {
        spawnBurst('celebrate');
      }
      prevGrowthRef.current = growthStage;
    }, [growthStage, spawnBurst]);

    // Animation & Canvas Render Loop
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animationFrameId: number;

      // HiDPI Canvas Resizing
      const handleResize = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      // Main Render Loop (60fps)
      const render = () => {
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.width / dpr;
        const heightCanvas = canvas.height / dpr;

        // Smooth Lerp transitions toward props
        const LERP_FACTOR = 0.06;
        const anim = animRef.current;
        anim.growth += (growthStage - anim.growth) * LERP_FACTOR;
        anim.height += (height - anim.height) * LERP_FACTOR;
        anim.water += (waterLevel - anim.water) * LERP_FACTOR;
        anim.sunlight += (sunlightExposure - anim.sunlight) * LERP_FACTOR;
        anim.time += 1;

        ctx.clearRect(0, 0, width, heightCanvas);

        // Ground coordinates
        const groundY = heightCanvas * 0.84;
        const plantBaseX = width / 2;

        // ----------------------------------------------------
        // 1. DYNAMIC ATMOSPHERE & SKY LIGHTING
        // ----------------------------------------------------
        const sunFactor = anim.sunlight / 100;
        const skyGradient = ctx.createLinearGradient(0, 0, 0, heightCanvas);
        // Shifts from deep indigo/teal at night to warm golden azure in bright sun
        skyGradient.addColorStop(0, `rgba(${Math.round(15 + sunFactor * 40)}, ${Math.round(23 + sunFactor * 60)}, ${Math.round(42 + sunFactor * 90)}, 1)`);
        skyGradient.addColorStop(0.5, `rgba(${Math.round(8 + sunFactor * 30)}, ${Math.round(16 + sunFactor * 45)}, ${Math.round(30 + sunFactor * 55)}, 1)`);
        skyGradient.addColorStop(1, `rgba(${Math.round(2 + sunFactor * 15)}, ${Math.round(6 + sunFactor * 20)}, ${Math.round(15 + sunFactor * 25)}, 1)`);

        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, width, heightCanvas);

        // Sun Aura & Golden Flare (top right)
        if (anim.sunlight > 10) {
          const sunX = width * 0.78;
          const sunY = heightCanvas * 0.16;
          const sunRadius = 60 + sunFactor * 120;
          const sunGradient = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, sunRadius);
          sunGradient.addColorStop(0, `rgba(254, 240, 138, ${0.4 + sunFactor * 0.5})`);
          sunGradient.addColorStop(0.3, `rgba(251, 191, 36, ${0.2 + sunFactor * 0.3})`);
          sunGradient.addColorStop(1, 'rgba(251, 191, 36, 0)');

          ctx.save();
          ctx.fillStyle = sunGradient;
          ctx.beginPath();
          ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
          ctx.fill();

          // Soft sunbeams
          ctx.strokeStyle = `rgba(253, 224, 71, ${0.08 + sunFactor * 0.12})`;
          ctx.lineWidth = 1.5;
          for (let beam = 0; beam < 8; beam++) {
            const beamAngle = (beam * Math.PI) / 4 + Math.sin(anim.time * 0.005 + beam) * 0.05;
            ctx.beginPath();
            ctx.moveTo(sunX, sunY);
            ctx.lineTo(sunX + Math.cos(beamAngle) * (sunRadius * 1.5), sunY + Math.sin(beamAngle) * (sunRadius * 1.5));
            ctx.stroke();
          }
          ctx.restore();
        }

        // ----------------------------------------------------
        // 2. SOIL MOUND & MOISTURE DYNAMICS
        // ----------------------------------------------------
        const waterFactor = anim.water / 100;
        const soilGradient = ctx.createLinearGradient(0, groundY - 20, 0, heightCanvas);
        // Rich moist dark chocolate brown when watered; paler dry earth when thirsty
        if (waterFactor > 0.4) {
          soilGradient.addColorStop(0, `rgba(${Math.round(62 * waterFactor)}, ${Math.round(39 * waterFactor)}, ${Math.round(35 * waterFactor)}, 1)`);
          soilGradient.addColorStop(0.5, '#27160c');
          soilGradient.addColorStop(1, '#140b06');
        } else {
          // Dry desert earth
          soilGradient.addColorStop(0, '#6d4c41');
          soilGradient.addColorStop(0.5, '#4e342e');
          soilGradient.addColorStop(1, '#2c1e1a');
        }

        ctx.save();
        ctx.fillStyle = soilGradient;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        // Organic curved mound
        ctx.quadraticCurveTo(plantBaseX * 0.5, groundY - 14, plantBaseX, groundY - 20);
        ctx.quadraticCurveTo(plantBaseX * 1.5, groundY - 14, width, groundY);
        ctx.lineTo(width, heightCanvas);
        ctx.lineTo(0, heightCanvas);
        ctx.closePath();
        ctx.fill();

        // Subtle pebbles / soil texture
        ctx.fillStyle = waterFactor > 0.4 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(215, 204, 200, 0.08)';
        for (let p = 0; p < 18; p++) {
          const px = ((p * 73 + 47) % width);
          const py = groundY - 12 + ((p * 37) % 35);
          ctx.beginPath();
          ctx.arc(px, py, 1.5 + (p % 3), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // ----------------------------------------------------
        // 3. CONTINUOUS SINE BREEZE & HELIOTROPISM (MOUSE TRACK)
        // ----------------------------------------------------
        const sway = Math.sin(anim.time * 0.02) * 4 + Math.sin(anim.time * 0.008) * 8;
        const droopFactor = anim.water < 25 ? (25 - anim.water) / 25 : 0; // plant wilts when water < 25

        // Max stem pixel height scaled by both growth and height prop
        const minStemPx = 25;
        const maxStemPx = heightCanvas * 0.56;
        const stemHeight = minStemPx + (maxStemPx - minStemPx) * (Math.max(0, anim.growth - 10) / 90) * (Math.min(220, anim.height) / 220);

        // Flower head endpoint
        const stemTopX = plantBaseX + sway * 0.6 + (droopFactor * 35);
        const stemTopY = (groundY - 20) - stemHeight + (droopFactor * 25);

        // Heliotropism calculation: head angles towards mouse
        let targetTilt = 0;
        if (isMouseOverRef.current) {
          const dx = mousePosRef.current.x - stemTopX;
          const dy = mousePosRef.current.y - stemTopY;
          // Subtly track mouse (clamped between -0.45 and +0.45 rad)
          targetTilt = Math.max(-0.45, Math.min(0.45, Math.atan2(dx, -dy) * 0.6));
        }
        anim.headTilt += (targetTilt - anim.headTilt) * 0.08;

        // ----------------------------------------------------
        // 4. BOTANICAL PROCEDURAL RENDERING BY GROWTH STAGE
        // ----------------------------------------------------

        // === STAGE 0-15%: SEED GERMINATION & TINY SPROUT ===
        if (anim.growth <= 15) {
          const sproutProgress = anim.growth / 15;
          ctx.save();
          ctx.translate(plantBaseX, groundY - 20);

          if (anim.growth <= 5) {
            // Dormant / Cracking Seed Coat
            ctx.fillStyle = '#1c1917';
            ctx.strokeStyle = '#78716c';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(0, 0, 7, 13, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Distinctive sunflower seed stripes
            ctx.strokeStyle = '#a8a29e';
            ctx.beginPath();
            ctx.moveTo(-2, -8);
            ctx.lineTo(3, 8);
            ctx.stroke();

            // Emergent radicle root
            if (anim.growth > 2) {
              ctx.strokeStyle = '#fef08a';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(3, 8);
              ctx.quadraticCurveTo(6, 14, 4, 18);
              ctx.stroke();
            }
          } else {
            // Emerging Green Hypocotyl & Cotyledon Leaves
            const sproutHeight = 12 + sproutProgress * 30;
            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth = 3.5;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(sway * 0.2, -sproutHeight * 0.5, sway * 0.3, -sproutHeight);
            ctx.stroke();

            // Two baby cotyledon leaves unfolding
            const leafSpread = 8 + sproutProgress * 14;
            ctx.fillStyle = '#22c55e';
            // Left cotyledon
            ctx.beginPath();
            ctx.ellipse(sway * 0.3 - leafSpread * 0.7, -sproutHeight - 2, leafSpread, 5, -Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();
            // Right cotyledon
            ctx.beginPath();
            ctx.ellipse(sway * 0.3 + leafSpread * 0.7, -sproutHeight - 2, leafSpread, 5, Math.PI / 6, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // === STAGE 16-100%: MATURING STEM & ALTERNATING LEAVES ===
        if (anim.growth > 15) {
          ctx.save();

          // Draw Thick Curved Organic Stem
          const stemThickness = 7 + (anim.growth / 100) * 7;
          ctx.lineWidth = stemThickness;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Stem color: lush green, browned slightly if severely dehydrated
          const stemColor = anim.water < 20 ? '#65a30d' : '#15803d';
          const stemShine = anim.water < 20 ? '#a3e635' : '#22c55e';

          const stemGrad = ctx.createLinearGradient(plantBaseX - 10, groundY, stemTopX, stemTopY);
          stemGrad.addColorStop(0, '#166534');
          stemGrad.addColorStop(0.5, stemColor);
          stemGrad.addColorStop(1, stemShine);
          ctx.strokeStyle = stemGrad;

          const controlX = plantBaseX + sway * 0.3 + (droopFactor * 25);
          const controlY = groundY - stemHeight * 0.5;

          ctx.beginPath();
          ctx.moveTo(plantBaseX, groundY - 20);
          ctx.quadraticCurveTo(controlX, controlY, stemTopX, stemTopY);
          ctx.stroke();

          // Draw Alternating Leaves along the stem
          const totalLeafPairs = Math.min(5, Math.floor(1 + (anim.growth - 15) / 16));
          for (let leafIdx = 0; leafIdx < totalLeafPairs; leafIdx++) {
            const t = 0.25 + (leafIdx / totalLeafPairs) * 0.55; // position along stem
            // Quadratic bezier point calculation: B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
            const lx = Math.pow(1 - t, 2) * plantBaseX + 2 * (1 - t) * t * controlX + Math.pow(t, 2) * stemTopX;
            const ly = Math.pow(1 - t, 2) * (groundY - 20) + 2 * (1 - t) * t * controlY + Math.pow(t, 2) * stemTopY;

            const isLeft = leafIdx % 2 === 0;
            const sideMultiplier = isLeft ? -1 : 1;
            const leafSize = (22 + (anim.growth / 100) * 32) * (0.7 + t * 0.4);

            // Droop leaf angle if water is low
            const leafAngle = (sideMultiplier * 0.55) + (droopFactor * 0.5) + Math.sin(anim.time * 0.03 + leafIdx) * 0.06;

            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate(leafAngle);

            // Leaf Body (Heart-shaped / pointed sunflower leaf)
            ctx.fillStyle = anim.water < 20 ? '#4d7c0f' : '#16a34a';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(
              sideMultiplier * leafSize * 0.4, -leafSize * 0.4,
              sideMultiplier * leafSize * 0.8, -leafSize * 0.1,
              sideMultiplier * leafSize, 0
            );
            ctx.bezierCurveTo(
              sideMultiplier * leafSize * 0.8, leafSize * 0.4,
              sideMultiplier * leafSize * 0.4, leafSize * 0.2,
              0, 0
            );
            ctx.fill();

            // Central leaf midrib vein
            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(sideMultiplier * leafSize * 0.85, 0);
            ctx.stroke();

            ctx.restore();
          }

          ctx.restore();
        }

        // === STAGE 46-75%: CLOSED SWELLING BUD ===
        if (anim.growth > 45 && anim.growth < 76) {
          const budProgress = (anim.growth - 45) / 30; // 0 to 1
          const budRadius = 14 + budProgress * 22;

          ctx.save();
          ctx.translate(stemTopX, stemTopY);
          ctx.rotate(anim.headTilt + sway * 0.02);

          // Green calyx sepals enclosing the bud
          const sepalCount = 14;
          for (let s = 0; s < sepalCount; s++) {
            const angle = (s / sepalCount) * Math.PI * 2;
            const sepalSpread = (1 - budProgress * 0.4) * (budRadius * 1.2);
            ctx.save();
            ctx.rotate(angle);
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-4, -sepalSpread);
            ctx.lineTo(0, -sepalSpread - 8);
            ctx.lineTo(4, -sepalSpread);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }

          // In bud center: hints of petalColor peeking out as it swells
          if (budProgress > 0.4) {
            ctx.fillStyle = petalColor;
            ctx.beginPath();
            ctx.arc(0, 0, budRadius * 0.55 * budProgress, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }

        // === STAGE 76-100%: RADIANT FULL BLOOM ===
        if (anim.growth >= 76) {
          const bloomProgress = (anim.growth - 76) / 24; // 0 (opening) to 1 (full bloom)
          const diskRadius = 26 + bloomProgress * 22;
          const petalLength = (28 + bloomProgress * 42) * (0.8 + (anim.height / 220) * 0.4);
          const petalWidth = 9 + bloomProgress * 7;

          ctx.save();
          ctx.translate(stemTopX, stemTopY);
          // Head tilts with heliotropism toward user's cursor + subtle wind sway
          ctx.rotate(anim.headTilt + sway * 0.015);

          // Sepals under the flower head
          ctx.fillStyle = '#166534';
          const underSepals = 21;
          for (let us = 0; us < underSepals; us++) {
            ctx.save();
            ctx.rotate((us / underSepals) * Math.PI * 2);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-6, -diskRadius * 1.15);
            ctx.lineTo(0, -diskRadius * 1.35);
            ctx.lineTo(6, -diskRadius * 1.15);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }

          // TWO LAYERED RINGS OF RAY PETALS (Fibonacci 34 petals)
          const petalCount = 34;

          // Back Ring (Slightly darker shade for rich depth, offset by half a petal angle)
          const backColor = adjustColorBrightness(petalColor, 0.82);
          ctx.fillStyle = backColor;
          const backOffset = Math.PI / petalCount;
          for (let p = 0; p < petalCount; p++) {
            ctx.save();
            const angle = (p / petalCount) * Math.PI * 2 + backOffset;
            ctx.rotate(angle);
            // Petal pointed lancet curve
            ctx.beginPath();
            ctx.moveTo(0, diskRadius * 0.7);
            ctx.quadraticCurveTo(-petalWidth * 0.5, diskRadius + petalLength * 0.5, -petalWidth * 0.2, diskRadius + petalLength);
            ctx.lineTo(0, diskRadius + petalLength + 4);
            ctx.lineTo(petalWidth * 0.2, diskRadius + petalLength);
            ctx.quadraticCurveTo(petalWidth * 0.5, diskRadius + petalLength * 0.5, 0, diskRadius * 0.7);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }

          // Front Ring (Vibrant petalColor with central crease/highlight)
          ctx.fillStyle = petalColor;
          for (let p = 0; p < petalCount; p++) {
            ctx.save();
            const angle = (p / petalCount) * Math.PI * 2;
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, diskRadius * 0.85);
            ctx.quadraticCurveTo(-petalWidth * 0.55, diskRadius + petalLength * 0.45, -petalWidth * 0.15, diskRadius + petalLength * 0.95);
            ctx.lineTo(0, diskRadius + petalLength);
            ctx.lineTo(petalWidth * 0.15, diskRadius + petalLength * 0.95);
            ctx.quadraticCurveTo(petalWidth * 0.55, diskRadius + petalLength * 0.45, 0, diskRadius * 0.85);
            ctx.closePath();
            ctx.fill();

            // Subtle delicate central spine highlight on each petal
            ctx.strokeStyle = adjustColorBrightness(petalColor, 1.25);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, diskRadius * 0.9);
            ctx.lineTo(0, diskRadius + petalLength * 0.8);
            ctx.stroke();

            ctx.restore();
          }

          // SEED DISK: FIBONACCI GOLDEN-RATIO SPIRAL (Phyllotaxis)
          // Draw rich background disk
          const diskGradient = ctx.createRadialGradient(0, 0, 5, 0, 0, diskRadius);
          diskGradient.addColorStop(0, '#78350f'); // warm center florets
          diskGradient.addColorStop(0.7, '#451a03'); // rich espresso brown
          diskGradient.addColorStop(1, '#1c1917'); // dark outer rim
          ctx.fillStyle = diskGradient;
          ctx.beginPath();
          ctx.arc(0, 0, diskRadius, 0, Math.PI * 2);
          ctx.fill();

          // Render ~160 spiral seeds using r = c * sqrt(n), theta = n * GOLDEN_ANGLE
          const totalSeeds = Math.min(180, Math.floor(60 + bloomProgress * 120));
          const c = (diskRadius * 0.92) / Math.sqrt(totalSeeds);

          for (let n = 0; n < totalSeeds; n++) {
            const theta = n * GOLDEN_ANGLE;
            const r = c * Math.sqrt(n);
            const sx = r * Math.cos(theta);
            const sy = r * Math.sin(theta);

            // Color gradient from center golden pollen to dark mature outer seeds
            const normDist = r / diskRadius;
            ctx.fillStyle = normDist < 0.35 ? '#f59e0b' : normDist < 0.7 ? '#92400e' : '#292524';

            ctx.beginPath();
            ctx.arc(sx, sy, 1.4 + (1 - normDist) * 0.8, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }

        // ----------------------------------------------------
        // 5. PARTICLE SYSTEM ANIMATION & RENDERING
        // ----------------------------------------------------
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life++;
          p.x += p.vx;
          p.y += p.vy;

          if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
            p.rotation += p.rotationSpeed;
          }

          const progress = p.life / p.maxLife;
          const currentAlpha = p.alpha * (1 - progress);

          if (p.type === 'water') {
            // Teardrop rain droplet
            ctx.save();
            ctx.fillStyle = `rgba(56, 189, 248, ${currentAlpha})`;
            ctx.beginPath();
            ctx.ellipse(p.x, p.y, p.size * 0.7, p.size * 1.8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Splash rings when hitting soil
            if (p.y >= groundY - 10) {
              ctx.save();
              ctx.strokeStyle = `rgba(186, 230, 253, ${currentAlpha * 0.8})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.ellipse(p.x, groundY - 10, p.size * 2 * progress, p.size * 0.8 * progress, 0, 0, Math.PI * 2);
              ctx.stroke();
              ctx.restore();
              particles.splice(i, 1);
              continue;
            }
          } else if (p.type === 'sunlight') {
            // Twinkling radiant sunbeam diamond / sparkle
            ctx.save();
            ctx.translate(p.x, p.y);
            if (p.rotation !== undefined) ctx.rotate(p.rotation);
            ctx.fillStyle = `rgba(253, 224, 71, ${currentAlpha})`;

            // 4-point diamond star
            const s = p.size;
            ctx.beginPath();
            ctx.moveTo(0, -s);
            ctx.lineTo(s * 0.3, 0);
            ctx.lineTo(0, s);
            ctx.lineTo(-s * 0.3, 0);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          } else if (p.type === 'fertilize') {
            // Spiraling glowing nutrient orb
            ctx.save();
            p.x += Math.sin(anim.time * 0.1 + p.id) * 0.8; // spiral wave
            ctx.fillStyle = p.color || '#34d399';
            ctx.globalAlpha = currentAlpha;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color || '#34d399';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (p.type === 'celebrate') {
            // Celebratory golden pollen & fluttering petals
            ctx.save();
            ctx.translate(p.x, p.y);
            if (p.rotation !== undefined) ctx.rotate(p.rotation);
            p.vy += 0.04; // gentle gravity
            p.vx *= 0.985; // air resistance
            ctx.globalAlpha = currentAlpha;

            if (p.size > 3.5) {
              // Fluttering petal shape
              ctx.fillStyle = p.color || '#FFD700';
              ctx.beginPath();
              ctx.ellipse(0, 0, p.size * 1.4, p.size * 0.55, 0, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Glowing golden pollen spark
              ctx.fillStyle = p.color || '#FDE047';
              ctx.shadowBlur = 10;
              ctx.shadowColor = '#FBBF24';
              ctx.beginPath();
              ctx.arc(0, 0, p.size, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }

          if (p.life >= p.maxLife) {
            particles.splice(i, 1);
          }
        }

        animationFrameId = requestAnimationFrame(render);
      };

      animationFrameId = requestAnimationFrame(render);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
      };
    }, [growthStage, height, waterLevel, sunlightExposure, petalColor]);

    // Handle mouse movement for heliotropism
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      isMouseOverRef.current = true;
    };

    const handleMouseLeave = () => {
      isMouseOverRef.current = false;
    };

    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={onCanvasClick}
          className="w-full h-full block cursor-crosshair touch-none select-none"
        />
        {/* Subtle heliotropism hint badge */}
        <div className="absolute top-4 left-4 pointer-events-none px-3 py-1.5 rounded-full glass-panel-subtle text-xs text-slate-300 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>Heliotropism Active: Flower follows your cursor</span>
        </div>
      </div>
    );
  }
);

SunflowerCanvas.displayName = 'SunflowerCanvas';
