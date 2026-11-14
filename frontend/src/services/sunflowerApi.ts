import { Sunflower, CreateSunflowerInput, NurtureAction, NurtureResult } from '../types/sunflower';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_ENDPOINT = `${BASE_URL}/api/sunflowers`;

const INITIAL_STARTER_SUNFLOWERS: Sunflower[] = [
  {
    id: 'starter-sunflower-001',
    name: 'Helianthus Starter',
    growthStage: 35,
    waterLevel: 75,
    sunlightExposure: 80,
    petalColor: '#FFD700',
    height: 45.0,
    lastWateredAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function loadLocalCache(): Sunflower[] {
  try {
    const raw = localStorage.getItem('sunflower_garden_cache');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Unable to load localStorage cache:', e);
  }
  return INITIAL_STARTER_SUNFLOWERS;
}

function saveLocalCache(items: Sunflower[]) {
  try {
    localStorage.setItem('sunflower_garden_cache', JSON.stringify(items));
  } catch (e) {
    console.warn('Unable to save localStorage cache:', e);
  }
}

let localCache: Sunflower[] = loadLocalCache();

function clamp(v: number, min = 0, max = 100): number {
  return Math.min(Math.max(v, min), max);
}

function round(v: number): number {
  return Math.round(v * 10) / 10;
}

export class SunflowerApiService {
  private isLiveConnected = false;

  public getBaseUrl(): string {
    return BASE_URL;
  }

  public isConnected(): boolean {
    return this.isLiveConnected;
  }

  /**
   * Health check to detect whether the Express backend on :5000 is reachable
   */
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(`${BASE_URL}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      this.isLiveConnected = res.ok;
      return res.ok;
    } catch {
      this.isLiveConnected = false;
      return false;
    }
  }

  /**
   * Fetch all sunflowers from live database with automatic fallback to local cache
   */
  async getAll(): Promise<{ data: Sunflower[]; source: 'live' | 'cache' }> {
    try {
      const res = await fetch(API_ENDPOINT);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        this.isLiveConnected = true;
        localCache = json.data;
        saveLocalCache(localCache);
        return { data: json.data, source: 'live' };
      }
    } catch (err: any) {
      this.isLiveConnected = false;
      console.warn(`[Backend Offline] Using local cache. Reason: ${err.message}`);
    }
    return { data: [...localCache], source: 'cache' };
  }

  /**
   * Plant a new sunflower seed via POST /api/sunflowers
   */
  async create(input: CreateSunflowerInput): Promise<{ data: Sunflower; source: 'live' | 'cache' }> {
    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.message || `Failed to plant sunflower (HTTP ${res.status})`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        this.isLiveConnected = true;
        localCache = [json.data, ...localCache.filter((s) => s.id !== json.data.id)];
        saveLocalCache(localCache);
        return { data: json.data, source: 'live' };
      }
    } catch (err: any) {
      console.warn(`[Backend Offline] Planting locally. Reason: ${err.message}`);
      this.isLiveConnected = false;
    }

    // Local fallback creation
    const fallbackFlower: Sunflower = {
      id: `local-seed-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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

    localCache.unshift(fallbackFlower);
    saveLocalCache(localCache);
    return { data: fallbackFlower, source: 'cache' };
  }

  /**
   * Nurture a sunflower via PATCH /api/sunflowers/:id/nurture
   */
  async nurture(id: string, action: NurtureAction): Promise<NurtureResult & { source: 'live' | 'cache' }> {
    try {
      const res = await fetch(`${API_ENDPOINT}/${id}/nurture`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Nurture action failed (HTTP ${res.status})`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        this.isLiveConnected = true;
        // Update local cache
        localCache = localCache.map((s) => (s.id === id ? json.data : s));
        saveLocalCache(localCache);
        return {
          sunflower: json.data,
          actionTaken: json.actionTaken || action,
          message: json.message || `Sunflower nurtured with ${action}.`,
          previousStats: json.previousStats || {
            growthStage: json.data.growthStage,
            waterLevel: json.data.waterLevel,
            sunlightExposure: json.data.sunlightExposure,
            height: json.data.height,
          },
          source: 'live',
        };
      }
    } catch (err: any) {
      console.warn(`[Backend Offline] Nurturing locally. Reason: ${err.message}`);
      this.isLiveConnected = false;
    }

    // Local simulation fallback
    const target = localCache.find((s) => s.id === id);
    if (!target) throw new Error(`Sunflower '${id}' not found`);

    const prevStats = {
      growthStage: target.growthStage,
      waterLevel: target.waterLevel,
      sunlightExposure: target.sunlightExposure,
      height: target.height,
    };

    let newGrowth = target.growthStage;
    let newWater = target.waterLevel;
    let newSun = target.sunlightExposure;
    let newHeight = target.height;
    let message = '';

    switch (action) {
      case 'water':
        newWater = clamp(target.waterLevel + 20);
        newSun = clamp(target.sunlightExposure - 4);
        newGrowth = clamp(target.growthStage + 8);
        newHeight = Math.min(220, round(target.height + 3.5));
        message = `Watered "${target.name}"! Hydration is now at ${newWater}%.`;
        break;
      case 'sunlight':
        newSun = clamp(target.sunlightExposure + 20);
        newWater = clamp(target.waterLevel - 8);
        newGrowth = clamp(target.growthStage + 8);
        newHeight = Math.min(220, round(target.height + 4.0));
        message = `Basking "${target.name}" in sunlight! Sunlight reached ${newSun}%.`;
        break;
      case 'fertilize':
        newGrowth = clamp(target.growthStage + 15);
        newHeight = Math.min(220, round(target.height + 6.5));
        newWater = clamp(target.waterLevel - 10);
        newSun = clamp(target.sunlightExposure - 6);
        message = `Fertilized "${target.name}"! Received an organic nutrient surge (+15% growth).`;
        break;
    }

    const updated: Sunflower = {
      ...target,
      growthStage: newGrowth,
      waterLevel: newWater,
      sunlightExposure: newSun,
      height: newHeight,
      lastWateredAt: action === 'water' ? new Date().toISOString() : target.lastWateredAt,
      updatedAt: new Date().toISOString(),
    };

    localCache = localCache.map((s) => (s.id === id ? updated : s));
    saveLocalCache(localCache);

    return {
      sunflower: updated,
      actionTaken: action,
      message,
      previousStats: prevStats,
      source: 'cache',
    };
  }

  /**
   * Remove a sunflower via DELETE /api/sunflowers/:id
   */
  async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_ENDPOINT}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        this.isLiveConnected = true;
      }
    } catch (err: any) {
      console.warn(`[Backend Offline] Deleting from local cache only. Reason: ${err.message}`);
    }

    localCache = localCache.filter((s) => s.id !== id);
    saveLocalCache(localCache);
    return true;
  }
}

export const sunflowerApi = new SunflowerApiService();
