# 🌻 Sunflower Animation - Full-Stack Application

An interactive botanical animation web application simulating the lifecycle, growth dynamics, and procedural aesthetics of a sunflower (*Helianthus annuus*).

---

## 🗺️ 3-Phase Project Roadmap

| Phase | Title | Status | Description |
|---|---|---|---|
| **Phase 1** | **Backend & Database Layer** | **✅ Completed** | Express + Prisma + SQLite backend, REST API, Zod validations, nurture logic, seed script, automated test suite. |
| **Phase 2** | **Frontend & Canvas Animation** | **✅ Completed** | 60FPS procedural botanical canvas, Fibonacci phyllotaxis seeds, 34-petal bloom, heliotropism cursor tracking, particle systems, glassmorphic HUD, growth scrubber. |
| **Phase 3** | **Full-Stack Integration, Decay & Audio** | **✅ Completed** | Live REST connection to backend (:5000), living garden resource decay over time, Web Audio API sound generator, celebratory bloom burst, concurrent dev runner. |

---

## 🏗️ Phase 1 Architecture & Technology Stack

- **Monorepo Layout**:
  - `/backend`: Node.js Express REST API with TypeScript and Prisma ORM.
  - `/frontend`: Prepared workspace for the Phase 2 Canvas Animation client.
- **Runtime & Language**: Node.js (ES Modules) with TypeScript via `tsx` (zero compile delay, fast live-reload).
- **Web Framework**: Express.js with CORS, JSON body parsing, and centralized error handling.
- **Database Layer**: SQLite powered by Prisma ORM (`@prisma/client` & `prisma`). Zero external dependencies or setup required.
- **Schema Validation**: Zod for type-safe payload inspection and structured error responses.
- **Test Suite**: Built-in automated integration test runner testing all endpoints and edge cases.

---

## 📊 Database Schema (`Sunflower` Model)

The database table `sunflowers` is defined in [`backend/prisma/schema.prisma`](file:///d:/spd/Sunflower_Animation/backend/prisma/schema.prisma):

| Field | Type | Default | Description / Range |
|---|---|---|---|
| `id` | `String` (UUID) | `@default(uuid())` | Unique identifier (e.g. `starter-sunflower-001` or UUID) |
| `name` | `String` | `"Sunny Sprout"` | Display name of the sunflower |
| `growthStage` | `Int` | `0` | Stage percentage (`0` to `100`), clamped |
| `waterLevel` | `Int` | `60` | Hydration level (`0` to `100`), clamped |
| `sunlightExposure` | `Int` | `50` | Sunlight exposure (`0` to `100`), clamped |
| `petalColor` | `String` | `"#FFD700"` | Hexadecimal color code (e.g. sunflower yellow `#FFD700`) |
| `height` | `Float` | `5.0` | Stalk height in centimeters (up to `220.0 cm`) |
| `lastWateredAt` | `DateTime` | `now()` | Timestamp of the most recent watering action |
| `createdAt` | `DateTime` | `now()` | Seed creation timestamp |
| `updatedAt` | `DateTime` | `updatedAt` | Last record modification timestamp |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js**: v18+ (verified on Node v24)
- **npm**: v9+

### 2. Install Dependencies
```bash
# Root & monorepo tools
npm install

# Backend dependencies
cd backend && npm install && cd ..

# Frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Initialize Database & Seed
```bash
npm run db:push
npm run seed:backend
```
*Creates the local SQLite database (`backend/prisma/dev.db`), compiles Prisma Client, and seeds the starter sunflower (`Helianthus Starter`).*

### 4. Start the Full-Stack Application (Unified Dev Runner)
```bash
npm run dev
```
*Powered by `concurrently`: launches both the Express backend (`http://localhost:5000`) and the Vite React frontend (`http://localhost:5173`) simultaneously with color-coded live logs!*

Alternatively, run each service independently:
```bash
npm run dev:backend   # Express API on :5000
npm run dev:frontend  # Vite Canvas UI on :5173
```

### 5. Run Automated Tests & Verify Builds
```bash
# Run backend API test suite (12/12 integration tests pass)
npm run test:backend

# Compile and verify full production builds
npm run build
```

---

## 🌻 Living Garden Mechanics & Audio Features

### ⏳ Time-Based Resource Decay
- The garden stays alive even when you are away!
- On `GET /api/sunflowers` and `GET /api/sunflowers/:id`, elapsed time is calculated:
  - **Hydration**: Decreases by ~2.5% per elapsed hour without water.
  - **Sunlight**: Natural attenuation by ~2.0% per elapsed hour.
  - **Growth & Height**: Protected biological metrics that are **never reduced**.
  - Persistent SQLite records update automatically when elapsed decay occurs.

### 🎵 Procedural Web Audio API Synthesizer
- Built-in zero-dependency sound effects generator (no audio files required!):
  - **💧 Water Splash**: Gentle descending frequency sine drop with ripple resonance.
  - **☀️ Sun Shimmer**: Warm harmonic chord (E5, G#5, B5) with soft vibrato.
  - **🌿 Fertilize**: Ascending pentatonic arpeggio (C5 -> E5 -> G5 -> C6).
  - **🌾 Budding Milestone (50%)**: Subtle two-note bell chime.
  - **🌻 Full Bloom Milestone (100%)**: Grand golden harmonic chime with resonant sparkle overtones.
- **Audio Toggle**: Muted by default to respect browser policies; click the speaker icon in the HUD to unmute!

### 🎆 Celebratory Full Bloom Burst
- When a sunflower reaches `growthStage === 100%`, a grand burst of 100+ golden pollen motes and fluttering ray petals erupts from the flower head.

### 🔍 Visual Preview Growth Scrubber
- Toggle the "Enable Preview Growth Slider" button to scrub from 0% to 100% to inspect every biological stage (seed, sprout, curved stalk, leaves, bud, Fibonacci bloom).
- Clearly flagged as **Visual Preview Mode**—it temporarily overrides the canvas rendering without modifying the live database record!

---

## 📡 REST API Reference

Base URL: `http://localhost:5000`

### 1. Health Check
- **Endpoint**: `GET /health`
- **Response**:
```json
{
  "status": "healthy",
  "service": "sunflower-animation-backend",
  "timestamp": "2026-11-13T13:30:00.000Z",
  "uptime": 12.4
}
```

---

### 2. List All Sunflowers
- **Endpoint**: `GET /api/sunflowers`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "starter-sunflower-001",
      "name": "Helianthus Starter",
      "growthStage": 35,
      "waterLevel": 75,
      "sunlightExposure": 80,
      "petalColor": "#FFD700",
      "height": 45.0,
      "lastWateredAt": "2026-11-13T13:33:31.013Z",
      "createdAt": "2026-11-13T13:33:31.013Z",
      "updatedAt": "2026-11-13T13:33:31.013Z"
    }
  ]
}
```

---

### 3. Fetch Single Sunflower
- **Endpoint**: `GET /api/sunflowers/:id`
- **Response** (`200 OK` or `404 Not Found`):
```json
{
  "success": true,
  "data": {
    "id": "starter-sunflower-001",
    "name": "Helianthus Starter",
    "growthStage": 35,
    "waterLevel": 75,
    "sunlightExposure": 80,
    "petalColor": "#FFD700",
    "height": 45.0,
    "lastWateredAt": "2026-11-13T13:33:31.013Z"
  }
}
```

---

### 4. Plant a New Sunflower
- **Endpoint**: `POST /api/sunflowers`
- **Headers**: `Content-Type: application/json`
- **Request Body (Optional fields - defaults applied if omitted)**:
```json
{
  "name": "Autumn Beauty",
  "petalColor": "#E25822",
  "growthStage": 0,
  "waterLevel": 60,
  "sunlightExposure": 50,
  "height": 5.0
}
```
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Sunflower \"Autumn Beauty\" planted successfully! 🌱",
  "data": {
    "id": "e6a2b890-7d4e-4f76-88aa-8d0f1454c0e1",
    "name": "Autumn Beauty",
    "growthStage": 0,
    "waterLevel": 60,
    "sunlightExposure": 50,
    "petalColor": "#E25822",
    "height": 5.0,
    "lastWateredAt": "2026-11-13T13:35:00.000Z",
    "createdAt": "2026-11-13T13:35:00.000Z",
    "updatedAt": "2026-11-13T13:35:00.000Z"
  }
}
```

---

### 5. Nurture Sunflower
- **Endpoint**: `PATCH /api/sunflowers/:id/nurture`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "action": "water" 
}
```
*(Accepts `'water'`, `'sunlight'`, or `'fertilize'`)*

- **Nurturing Mechanics**:
  - `water`: Increases `waterLevel` by `+20` (max 100), updates `lastWateredAt`, increases `growthStage` by `+8`, increases `height` by `+3.5 cm`.
  - `sunlight`: Increases `sunlightExposure` by `+20` (max 100), evaporates `waterLevel` by `-8`, increases `growthStage` by `+8`, increases `height` by `+4.0 cm`.
  - `fertilize`: Nutrients surge `growthStage` by `+15`, surges `height` by `+6.5 cm`, consumes `waterLevel` by `-10` and `sunlightExposure` by `-6`.

- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Watered \"Helianthus Starter\"! Hydration is now at 95%.",
  "actionTaken": "water",
  "previousStats": {
    "growthStage": 35,
    "waterLevel": 75,
    "sunlightExposure": 80,
    "height": 45.0
  },
  "data": {
    "id": "starter-sunflower-001",
    "name": "Helianthus Starter",
    "growthStage": 43,
    "waterLevel": 95,
    "sunlightExposure": 76,
    "petalColor": "#FFD700",
    "height": 48.2,
    "lastWateredAt": "2026-11-13T13:36:12.441Z",
    "createdAt": "2026-11-13T13:33:31.013Z",
    "updatedAt": "2026-11-13T13:36:12.441Z"
  }
}
```

---

### 6. Remove a Sunflower
- **Endpoint**: `DELETE /api/sunflowers/:id`
- **Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Sunflower \"Autumn Beauty\" removed successfully.",
  "data": {
    "id": "e6a2b890-7d4e-4f76-88aa-8d0f1454c0e1",
    "name": "Autumn Beauty"
  }
}
```

---

## 🧪 Testing with cURL / PowerShell

### Fetch all sunflowers:
```bash
curl http://localhost:5000/api/sunflowers
```

### Plant a new sunflower seed:
```bash
curl -X POST http://localhost:5000/api/sunflowers \
  -H "Content-Type: application/json" \
  -d '{"name": "Velvet Queen", "petalColor": "#B22222"}'
```

### Nurture with water:
```bash
curl -X PATCH http://localhost:5000/api/sunflowers/starter-sunflower-001/nurture \
  -H "Content-Type: application/json" \
  -d '{"action": "water"}'
```

### Nurture with sunlight:
```bash
curl -X PATCH http://localhost:5000/api/sunflowers/starter-sunflower-001/nurture \
  -H "Content-Type: application/json" \
  -d '{"action": "sunlight"}'
```

### Nurture with fertilizer:
```bash
curl -X PATCH http://localhost:5000/api/sunflowers/starter-sunflower-001/nurture \
  -H "Content-Type: application/json" \
  -d '{"action": "fertilize"}'
```

### Delete a sunflower:
```bash
curl -X DELETE http://localhost:5000/api/sunflowers/starter-sunflower-001
```

---

## 🎯 Ready for Phase 2: Frontend & Canvas Animation
With Phase 1 complete, the database model, game mechanics, and REST API endpoints are fully operational, tested, and ready to drive the botanical canvas visualizer in Phase 2.
