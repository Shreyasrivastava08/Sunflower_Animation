export type NurtureAction = 'water' | 'sunlight' | 'fertilize';

export interface Sunflower {
  id: string;
  name: string;
  growthStage: number; // 0 to 100
  waterLevel: number; // 0 to 100
  sunlightExposure: number; // 0 to 100
  petalColor: string; // Hex color code e.g. #FFD700
  height: number; // Stalk height in cm
  lastWateredAt: string | Date;
  createdAt?: string;
  updatedAt?: string;
}

export interface NurtureResult {
  sunflower: Sunflower;
  actionTaken: NurtureAction;
  message: string;
  previousStats: {
    growthStage: number;
    waterLevel: number;
    sunlightExposure: number;
    height: number;
  };
}

export interface CreateSunflowerInput {
  name?: string;
  petalColor?: string;
  growthStage?: number;
  waterLevel?: number;
  sunlightExposure?: number;
  height?: number;
}
