# 🌻 Sunflower Animation — Frontend & Procedural Canvas

Interactive botanical simulation and procedural animation engine built with Vite, React, TypeScript, Tailwind CSS, and HTML5 Canvas.

---

## 🎨 Features & Visual Engine

### 1. Procedural 60FPS Botanical Engine (`SunflowerCanvas.tsx`)
- **Organic Life Stages (0–100%)**:
  - **0–15% (Germinating Seedling)**: Textured soil mound, dark striped sunflower seed coat cracking open, tiny tender radicle root, followed by an emergent hypocotyl stem unfolding two rounded cotyledon baby leaves.
  - **16–45% (Vegetative Stalk & Alternating Leaves)**: Curved organic stalk scaling with both `growthStage` and `height`, flanked by alternating heart-shaped sunflower leaves with central midrib veins and delicate sway. Thirst mechanics cause the leaves and stem to visibly droop when `waterLevel < 25`.
  - **46–75% (Swelling Involucral Bud)**: Dense green phyllary sepals forming a swollen bud that gradually parts open to reveal the emerging spiral of petals inside.
  - **76–100% (Radiant Fibonacci Full Bloom)**:
    - **Ray Petals**: 34 lanceolate petals in 2 layered concentric rings (back layer in a deeper bronze shade, front layer in vibrant `petalColor` with central highlight ridges). Smoothly unfurls as growth approaches 100%.
    - **Center Seed Disk**: True Fibonacci phyllotaxis spiral ($r = c \sqrt{n}$, $\theta = n \times 137.50776^\circ$) rendering up to 180 individual golden-ratio seeds with center-to-edge color gradients.

### 2. Environmental Physics & Heliotropism
- **Breeze / Wind Sway**: Continuous composite sine waves creating gentle life-like movement.
- **Heliotropism (Interactive Cursor Tracking)**: The flower head smoothly angles toward the user's mouse position as they explore the canvas.
- **Dynamic Sky & Soil**: Sky lighting shifts from deep twilight to radiant warm golden azure with sunbeams; soil transitions from dark moist chocolate loam to paler cracked earth.
- **Biological Lerp**: Smooth interpolation between growth milestones to prevent jarring instant jumps.

### 3. Particle Systems
- 💧 **Watering**: Falling translucent blue droplets that spawn concentric ripple splash rings on the soil mound.
- ☀️ **Sunlight**: Twinkling radiant 4-point golden sunbeam diamond sparkles floating around the flower head.
- 🌿 **Fertilizer**: Upward spiraling emerald-gold nutrient motes rising through the stalk into the flower head.

### 4. Interactive HUD & Controls
- **Glassmorphic Telemetry HUD**: Live metrics for growth stage, height (cm), hydration level, and sunlight exposure.
- **Nurture Action Buttons**: Instant interactive buttons triggering both botanical changes and particle bursts.
- **Developer Growth Scrubber**: Toggleable 0–100% slider to smoothly scrub and admire all procedural stages from seed to full bloom.
- **Garden Switcher & Plant Modal**: Multi-sunflower support with color presets (Classic Gold, Sunset Orange, Crimson Velvet, Pale Lemon, and custom hex picker).
- **Service Layer**: Cleanly isolated API service (`src/services/sunflowerApi.ts`) with live mock simulation and one-click toggle to connect to `http://localhost:5000/api/sunflowers`.

---

## 🚀 Running the Frontend

From the repository root:
```bash
npm run dev:frontend
```

Or from the `/frontend` directory:
```bash
cd frontend
npm run dev
```

The application will be available at: **`http://localhost:5173`**.

---

## 🏗️ Production Build

```bash
npm run build:frontend
```
Generates an optimized bundle in `frontend/dist/`.
