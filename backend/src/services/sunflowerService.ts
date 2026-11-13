import prisma from '../prisma.js';
import { CreateSunflowerInput } from '../validators/sunflowerValidator.js';

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(Math.max(value, min), max);
}

function roundToOneDecimal(num: number): number {
  return Math.round(num * 10) / 10;
}

export interface NurtureResult {
  sunflower: any;
  actionTaken: 'water' | 'sunlight' | 'fertilize';
  message: string;
  previousStats: {
    growthStage: number;
    waterLevel: number;
    sunlightExposure: number;
    height: number;
  };
}

export class SunflowerService {
  async getAllSunflowers() {
    return prisma.sunflower.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getSunflowerById(id: string) {
    return prisma.sunflower.findUnique({
      where: { id },
    });
  }

  async createSunflower(input: CreateSunflowerInput) {
    return prisma.sunflower.create({
      data: {
        name: input.name || 'Sunny Sprout',
        petalColor: input.petalColor || '#FFD700',
        growthStage: clamp(input.growthStage ?? 0),
        waterLevel: clamp(input.waterLevel ?? 60),
        sunlightExposure: clamp(input.sunlightExposure ?? 50),
        height: roundToOneDecimal(input.height ?? 5.0),
        lastWateredAt: new Date(),
      },
    });
  }

  async nurtureSunflower(id: string, action: 'water' | 'sunlight' | 'fertilize'): Promise<NurtureResult> {
    const existing = await prisma.sunflower.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error(`Sunflower with id '${id}' not found`);
    }

    const prevGrowth = existing.growthStage;
    const prevWater = existing.waterLevel;
    const prevSunlight = existing.sunlightExposure;
    const prevHeight = existing.height;

    let newGrowth = prevGrowth;
    let newWater = prevWater;
    let newSunlight = prevSunlight;
    let newHeight = prevHeight;
    let newLastWateredAt = existing.lastWateredAt;
    let message = '';

    const MAX_HEIGHT = 220.0;

    switch (action) {
      case 'water': {
        newWater = clamp(prevWater + 20);
        newLastWateredAt = new Date();
        // Watering slightly cools / diffuses direct sunlight
        newSunlight = clamp(prevSunlight - 4);

        // Optimal growth occurs if not over-saturated
        const growthDelta = prevWater > 85 ? 3 : 8;
        newGrowth = clamp(prevGrowth + growthDelta);
        newHeight = Math.min(MAX_HEIGHT, roundToOneDecimal(prevHeight + (growthDelta * 0.4)));

        message = newGrowth >= 100 && prevGrowth < 100
          ? `Watered "${existing.name}"! It has reached full bloom! 🌻`
          : `Watered "${existing.name}"! Hydration is now at ${newWater}%.`;
        break;
      }

      case 'sunlight': {
        newSunlight = clamp(prevSunlight + 20);
        // Sun warmth gradually evaporates water
        newWater = clamp(prevWater - 8);

        const growthDelta = prevSunlight > 85 ? 3 : 8;
        newGrowth = clamp(prevGrowth + growthDelta);
        newHeight = Math.min(MAX_HEIGHT, roundToOneDecimal(prevHeight + (growthDelta * 0.45)));

        message = newGrowth >= 100 && prevGrowth < 100
          ? `Bathed "${existing.name}" in sunlight! It has blossomed into full bloom! 🌻`
          : `Gave "${existing.name}" warm sunlight! Sunlight exposure reached ${newSunlight}%.`;
        break;
      }

      case 'fertilize': {
        // High nutrient boost drives fast growth & vertical height
        const growthDelta = 15;
        newGrowth = clamp(prevGrowth + growthDelta);
        newHeight = Math.min(MAX_HEIGHT, roundToOneDecimal(prevHeight + 6.5));

        // Plant utilizes internal moisture and light reserves for the growth spurt
        newWater = clamp(prevWater - 10);
        newSunlight = clamp(prevSunlight - 6);

        message = newGrowth >= 100 && prevGrowth < 100
          ? `Fertilized "${existing.name}"! An explosion of nutrients pushed it to 100% full bloom! 🌻`
          : `Fertilized "${existing.name}"! Received an organic nutrient boost (+${growthDelta}% growth).`;
        break;
      }
    }

    const updated = await prisma.sunflower.update({
      where: { id },
      data: {
        growthStage: newGrowth,
        waterLevel: newWater,
        sunlightExposure: newSunlight,
        height: newHeight,
        lastWateredAt: newLastWateredAt,
      },
    });

    return {
      sunflower: updated,
      actionTaken: action,
      message,
      previousStats: {
        growthStage: prevGrowth,
        waterLevel: prevWater,
        sunlightExposure: prevSunlight,
        height: prevHeight,
      },
    };
  }

  async deleteSunflower(id: string) {
    const existing = await prisma.sunflower.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error(`Sunflower with id '${id}' not found`);
    }

    return prisma.sunflower.delete({
      where: { id },
    });
  }
}

export const sunflowerService = new SunflowerService();
