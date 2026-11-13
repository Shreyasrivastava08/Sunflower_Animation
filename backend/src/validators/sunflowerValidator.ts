import { z } from 'zod';

const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const createSunflowerSchema = z.object({
  name: z
    .string({ invalid_type_error: 'Name must be a string' })
    .trim()
    .min(1, 'Name cannot be empty')
    .max(60, 'Name must not exceed 60 characters')
    .optional()
    .default('Sunny Sprout'),
  petalColor: z
    .string({ invalid_type_error: 'Petal color must be a valid hex color string' })
    .trim()
    .regex(hexColorRegex, 'Petal color must be a valid hex code (e.g. #FFD700 or #F50)')
    .optional()
    .default('#FFD700'),
  growthStage: z
    .number({ invalid_type_error: 'Growth stage must be a number' })
    .int('Growth stage must be an integer')
    .min(0, 'Growth stage cannot be less than 0')
    .max(100, 'Growth stage cannot exceed 100')
    .optional()
    .default(0),
  waterLevel: z
    .number({ invalid_type_error: 'Water level must be a number' })
    .int('Water level must be an integer')
    .min(0, 'Water level cannot be less than 0')
    .max(100, 'Water level cannot exceed 100')
    .optional()
    .default(60),
  sunlightExposure: z
    .number({ invalid_type_error: 'Sunlight exposure must be a number' })
    .int('Sunlight exposure must be an integer')
    .min(0, 'Sunlight exposure cannot be less than 0')
    .max(100, 'Sunlight exposure cannot exceed 100')
    .optional()
    .default(50),
  height: z
    .number({ invalid_type_error: 'Height must be a number' })
    .min(0, 'Height cannot be negative')
    .max(500, 'Height must be realistic (max 500 cm)')
    .optional()
    .default(5.0),
});

export const nurtureSunflowerSchema = z.object({
  action: z
    .string({ required_error: "Action is required ('water' | 'sunlight' | 'fertilize')" })
    .trim()
    .toLowerCase()
    .refine((val): val is 'water' | 'sunlight' | 'fertilize' => {
      return ['water', 'sunlight', 'fertilize'].includes(val);
    }, {
      message: "Action must be one of: 'water', 'sunlight', 'fertilize'",
    }),
});

export type CreateSunflowerInput = z.infer<typeof createSunflowerSchema>;
export type NurtureSunflowerInput = z.infer<typeof nurtureSunflowerSchema>;
