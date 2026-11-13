import { Sunflower, CreateSunflowerInput, NurtureAction, NurtureResult } from '../types/sunflower';

const API_BASE = '/api/sunflowers';

// Initial local garden data matching backend starter seed
const INITIAL_MOCK_SUNFLOWERS: Sunflower[] = [
  {
    id: 'starter-sunflower-001',
    name: 'Helianthus Starter',
    growthStage: 35,
    waterLevel: 75,
    sunlightExposure: 80,
    petalColor: '#FFD700', // Classic Golden Yellow
    height: 45.0,
    lastWateredAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-sunflower-bloom',
    name: 'Solaris Radiance',
    growthStage: 95,
    waterLevel: 85,
    sunlightExposure: 90,
    petalColor: '#FF7F50', // Sunset Coral
    height: 165.0,
    lastWateredAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-sunflower-seedling',
    name: 'Ruby Sprout',
    growthStage: 10,
    waterLevel: 60,
    sunlightExposure: 65,
    petalColor: '#DC143C', // Crimson Velvet
    height: 8.5,
    lastWateredAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Persistent local storage cache for mock mode
function loadLocalSunflowers(): Sunflower[] {
  try {
    const raw = localStorage.getItem('sunflower_garden_state');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read from localStorage:', e);
  }
  return INITIAL_MOCK_SUNFLOWERS;
}

function saveLocalSunflowers(items: Sunflower[]) {
  try {
    localStorage.setItem('sunflower_garden_state', JSON.stringify(items));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}

let mockSunflowers: Sunflower[] = loadLocalSunflowers();

function clamp(v: number, min = 0, max = 100): number {
  return Math.min(Math.max(v, min), max);
}

function round(v: number): number {
  return Math.round(v * 10) / 10;
}

export class SunflowerApiService {
  private useLiveApi = false;

  setLiveMode(enabled: boolean) {
    this.useLiveApi = enabled;
  }

  isLiveMode(): boolean {
    return this.useLiveApi;
  }

  async getAll(): Promise<Sunflower[]> {
    if (this.useLiveApi) {
      try {
        const res = await fetch(API_BASE);
        if (res.ok) {
          const json = await res.json();
          return json.data;
        }
      } catch (err) {
        console.warn('Live API request failed, falling back to local state:', err);
      }
    }
    return [...mockSunflowers];
  }

  async create(input: CreateSunflowerInput): Promise<Sunflower> {
    if (this.useLiveApi) {
      try {
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        if (res.ok) {
          const json = await res.json();
          return json.data;
        }
      } catch (err) {
        console.warn('Live API create failed, using local mock:', err);
      }
    }

    const newSunflower: Sunflower = {
      id: `sunflower-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: input.name?.trim() || 'Sunny Sprout',
      petalColor: input.petalColor || '#FFD700',
      growthStage: clamp(input.growthStage ?? 0),
      waterLevel: clamp(input.waterLevel ?? 60),
      sunlightExposure: clamp(input.sunlightExposure ?? 50),
      height: round(input.height ?? 5.0),
      lastWateredAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockSunflowers.unshift(newSunflower);
    saveLocalSunflowers(mockSunflowers);
    return newSunflower;
  }

  async nurture(id: string, action: NurtureAction): Promise<NurtureResult> {
    if (this.useLiveApi) {
      try {
        const res = await fetch(`${API_BASE}/${id}/nurture`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Live API nurture failed, falling back to local simulation:', err);
      }
    }

    const index = mockSunflowers.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error(`Sunflower ${id} not found`);
    }

    const current = mockSunflowers[index];
    const prevStats = {
      growthStage: current.growthStage,
      waterLevel: current.waterLevel,
      sunlightExposure: current.sunlightExposure,
      height: current.height,
    };

    let newGrowth = current.growthStage;
    let newWater = current.waterLevel;
    let newSunlight = current.sunlightExposure;
    let newHeight = current.height;
    let newLastWateredAt = current.lastWateredAt;
    let message = '';

    const MAX_HEIGHT = 220.0;

    switch (action) {
      case 'water': {
        newWater = clamp(current.waterLevel + 20);
        newLastWateredAt = new Date().toISOString();
        newSunlight = clamp(current.sunlightExposure - 4);
        const delta = current.waterLevel > 85 ? 3 : 8;
        newGrowth = clamp(current.growthStage + delta);
        newHeight = Math.min(MAX_HEIGHT, round(current.height + delta * 0.4));
        message = newGrowth >= 100 && current.growthStage < 100
          ? `Watered "${current.name}"! It has blossomed into full bloom! 🌻`
          : `Watered "${current.name}"! Hydration is now at ${newWater}%.`;
        break;
      }
      case 'sunlight': {
        newSunlight = clamp(current.sunlightExposure + 20);
        newWater = clamp(current.waterLevel - 8);
        const delta = current.sunlightExposure > 85 ? 3 : 8;
        newGrowth = clamp(current.growthStage + delta);
        newHeight = Math.min(MAX_HEIGHT, round(current.height + delta * 0.45));
        message = newGrowth >= 100 && current.growthStage < 100
          ? `Bathed "${current.name}" in sunlight! Radiant full bloom! 🌻`
          : `Basking in the warm sunshine! Sunlight exposure reached ${newSunlight}%.`;
        break;
      }
      case 'fertilize': {
        const delta = 15;
        newGrowth = clamp(current.growthStage + delta);
        newHeight = Math.min(MAX_HEIGHT, round(current.height + 6.5));
        newWater = clamp(current.waterLevel - 10);
        newSunlight = clamp(current.sunlightExposure - 6);
        message = newGrowth >= 100 && current.growthStage < 100
          ? `Fertilized "${current.name}"! Surged straight into full bloom! 🌻`
          : `Enriched "${current.name}"! Received an organic nutrient boost (+${delta}% growth).`;
        break;
      }
    }

    const updated: Sunflower = {
      ...current,
      growthStage: newGrowth,
      waterLevel: newWater,
      sunlightExposure: newSunlight,
      height: newHeight,
      lastWateredAt: newLastWateredAt,
      updatedAt: new Date().toISOString(),
    };

    mockSunflowers[index] = updated;
    saveLocalSunflowers(mockSunflowers);

    return {
      sunflower: updated,
      actionTaken: action,
      message,
      previousStats: prevStats,
    };
  }

  async delete(id: string): Promise<boolean> {
    if (this.useLiveApi) {
      try {
        const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        if (res.ok) return true;
      } catch (err) {
        console.warn('Live API delete failed:', err);
      }
    }

    mockSunflowers = mockSunflowers.filter((s) => s.id !== id);
    saveLocalSunflowers(mockSunflowers);
    return true;
  }

  resetToDefaults() {
    mockSunflowers = [...INITIAL_MOCK_SUNFLOWERS];
    saveLocalSunflowers(mockSunflowers);
    return mockSunflowers;
  }
}

export const sunflowerApi = new SunflowerApiService();
