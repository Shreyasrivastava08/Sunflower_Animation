import { createApp } from '../src/app.js';
import prisma from '../src/prisma.js';
import http from 'http';

const TEST_PORT = 5055;
const BASE_URL = `http://localhost:${TEST_PORT}`;

let server: http.Server;

async function runTests() {
  console.log('🧪 Starting Sunflower Backend API Tests...\n');
  const app = createApp();

  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, () => {
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  async function assert(desc: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${desc}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${desc}`);
      console.error(`     Error: ${err.message || err}`);
      failed++;
    }
  }

  try {
    // Test 1: Health Check
    await assert('GET /health returns 200 OK and status healthy', async () => {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const json = await res.json();
      if (json.status !== 'healthy') throw new Error(`Expected healthy status, got ${json.status}`);
    });

    // Test 2: GET /api/sunflowers returns array including starter
    let starterId = '';
    await assert('GET /api/sunflowers returns sunflowers list', async () => {
      const res = await fetch(`${BASE_URL}/api/sunflowers`);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const json = await res.json();
      if (!json.success || !Array.isArray(json.data)) throw new Error('Invalid response structure');
      if (json.data.length === 0) throw new Error('Expected at least 1 sunflower in the database');
      starterId = json.data[0].id;
    });

    // Test 3: POST /api/sunflowers creates a seed with defaults
    let createdSunflowerId = '';
    await assert('POST /api/sunflowers creates new sunflower with default values', async () => {
      const res = await fetch(`${BASE_URL}/api/sunflowers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      const json = await res.json();
      if (!json.success || !json.data?.id) throw new Error('Sunflower not returned with id');
      if (json.data.name !== 'Sunny Sprout') throw new Error(`Expected default name 'Sunny Sprout', got ${json.data.name}`);
      if (json.data.petalColor !== '#FFD700') throw new Error(`Expected default color #FFD700, got ${json.data.petalColor}`);
      if (json.data.growthStage !== 0) throw new Error(`Expected initial growthStage 0, got ${json.data.growthStage}`);
      createdSunflowerId = json.data.id;
    });

    // Test 4: POST /api/sunflowers with custom valid fields
    let customSunflowerId = '';
    await assert('POST /api/sunflowers creates custom named and colored sunflower', async () => {
      const res = await fetch(`${BASE_URL}/api/sunflowers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Golden Solar',
          petalColor: '#FFA500',
          growthStage: 15,
          waterLevel: 80,
          sunlightExposure: 90,
          height: 22.5,
        }),
      });
      if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
      const json = await res.json();
      if (json.data.name !== 'Golden Solar') throw new Error('Custom name mismatch');
      if (json.data.petalColor !== '#FFA500') throw new Error('Custom petalColor mismatch');
      customSunflowerId = json.data.id;
    });

    // Test 5: POST /api/sunflowers validates invalid inputs
    await assert('POST /api/sunflowers rejects invalid hex color', async () => {
      const res = await fetch(`${BASE_URL}/api/sunflowers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petalColor: 'not-a-color',
        }),
      });
      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
      const json = await res.json();
      if (json.error !== 'Validation Error') throw new Error('Expected Validation Error');
    });

    // Test 6: PATCH /api/sunflowers/:id/nurture with 'water'
    await assert("PATCH /api/sunflowers/:id/nurture performs 'water' action", async () => {
      const res = await fetch(`${BASE_URL}/api/sunflowers/${createdSunflowerId}/nurture`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'water' }),
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const json = await res.json();
      if (json.actionTaken !== 'water') throw new Error(`Expected action 'water', got ${json.actionTaken}`);
      if (json.data.waterLevel <= json.previousStats.waterLevel) {
        throw new Error('Water level did not increase after watering');
      }
      if (json.data.growthStage <= json.previousStats.growthStage) {
        throw new Error('Growth stage did not increase after watering');
      }
    });

    // Test 7: PATCH /api/sunflowers/:id/nurture with 'sunlight'
    await assert("PATCH /api/sunflowers/:id/nurture performs 'sunlight' action", async () => {
      const res = await fetch(`${BASE_URL}/api/sunflowers/${createdSunflowerId}/nurture`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sunlight' }),
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const json = await res.json();
      if (json.actionTaken !== 'sunlight') throw new Error(`Expected action 'sunlight', got ${json.actionTaken}`);
      if (json.data.sunlightExposure <= json.previousStats.sunlightExposure) {
        throw new Error('Sunlight exposure did not increase');
      }
    });

    // Test 8: PATCH /api/sunflowers/:id/nurture with 'fertilize'
    await assert("PATCH /api/sunflowers/:id/nurture performs 'fertilize' action", async () => {
      const res = await fetch(`${BASE_URL}/api/sunflowers/${createdSunflowerId}/nurture`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fertilize' }),
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const json = await res.json();
      if (json.actionTaken !== 'fertilize') throw new Error(`Expected action 'fertilize', got ${json.actionTaken}`);
      if (json.data.growthStage <= json.previousStats.growthStage) {
        throw new Error('Growth stage did not increase after fertilizer');
      }
    });

    // Test 9: PATCH rejects invalid nurture actions
    await assert('PATCH /api/sunflowers/:id/nurture rejects invalid action', async () => {
      const res = await fetch(`${BASE_URL}/api/sunflowers/${createdSunflowerId}/nurture`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sing_to_it' }),
      });
      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
      const json = await res.json();
      if (json.error !== 'Validation Error') throw new Error('Expected Validation Error');
    });

    // Test 10: PATCH on non-existent id returns 404
    await assert('PATCH /api/sunflowers/:id/nurture returns 404 for unknown sunflower', async () => {
      const res = await fetch(`${BASE_URL}/api/sunflowers/unknown-id-12345/nurture`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'water' }),
      });
      if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    });

    // Test 11: DELETE /api/sunflowers/:id removes sunflower
    await assert('DELETE /api/sunflowers/:id successfully deletes sunflower', async () => {
      const res = await fetch(`${BASE_URL}/api/sunflowers/${customSunflowerId}`, {
        method: 'DELETE',
      });
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error('Expected success true on deletion');

      // Verify it no longer exists
      const verifyRes = await fetch(`${BASE_URL}/api/sunflowers/${customSunflowerId}`);
      if (verifyRes.status !== 404) throw new Error(`Expected 404 on deleted sunflower, got ${verifyRes.status}`);
    });

    // Clean up created test sunflower
    await fetch(`${BASE_URL}/api/sunflowers/${createdSunflowerId}`, { method: 'DELETE' });

    console.log(`\n======================================================`);
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
    console.log(`======================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
