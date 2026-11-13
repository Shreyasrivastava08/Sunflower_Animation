import { Request, Response, NextFunction } from 'express';
import { sunflowerService } from '../services/sunflowerService.js';
import {
  createSunflowerSchema,
  nurtureSunflowerSchema,
} from '../validators/sunflowerValidator.js';

export class SunflowerController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const sunflowers = await sunflowerService.getAllSunflowers();
      return res.status(200).json({
        success: true,
        count: sunflowers.length,
        data: sunflowers,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const sunflower = await sunflowerService.getSunflowerById(id);

      if (!sunflower) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: `Sunflower with id '${id}' not found`,
        });
      }

      return res.status(200).json({
        success: true,
        data: sunflower,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = createSunflowerSchema.parse(req.body || {});
      const newSunflower = await sunflowerService.createSunflower(validatedInput);

      return res.status(201).json({
        success: true,
        message: `Sunflower "${newSunflower.name}" planted successfully! 🌱`,
        data: newSunflower,
      });
    } catch (error) {
      next(error);
    }
  }

  async nurture(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = nurtureSunflowerSchema.parse(req.body);
      const result = await sunflowerService.nurtureSunflower(id, validated.action);

      return res.status(200).json({
        success: true,
        message: result.message,
        actionTaken: result.actionTaken,
        previousStats: result.previousStats,
        data: result.sunflower,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deletedSunflower = await sunflowerService.deleteSunflower(id);

      return res.status(200).json({
        success: true,
        message: `Sunflower "${deletedSunflower.name}" removed successfully.`,
        data: deletedSunflower,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const sunflowerController = new SunflowerController();
