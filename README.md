# 🌻 Sunflower Animation - Full-Stack Application

An interactive botanical animation web application simulating the lifecycle, growth dynamics, and procedural aesthetics of a sunflower (*Helianthus annuus*).

---

## 🗺️ 3-Phase Project Roadmap

| Phase | Title | Status | Description |
|---|---|---|---|
| **Phase 1** | **Backend & Database Layer** | **✅ Completed** | Express + Prisma + SQLite backend, REST API, Zod validations, nurture logic, seed script, automated test suite. |
| **Phase 2** | **Frontend & Canvas Animation** | ⏳ *Next Up* | Interactive HTML5 Canvas / WebGL rendering, Fibonacci phyllotaxis, growth stages, nurture controls, reactive UI. |
| **Phase 3** | **Integration, Polish & Audio** | ⏳ *Planned* | State synchronization, botanical sound effects, responsive styling, and production packaging. |

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

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Initialize Database & Generate Prisma Client
```bash
npm run db:push
```
*Creates the local SQLite database (`backend/prisma/dev.db`) and compiles Prisma Client.*

### 4. Seed the Database
```bash
npm run seed
```
*Creates the starter sunflower (`Helianthus Starter`, id: `starter-sunflower-001`).*

### 5. Start the Development Server
```bash
npm run dev
```
The server will start on **`http://localhost:5000`**.

### 6. Run the Automated Test Suite
In another terminal:
```bash
npm run test:api
```

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
