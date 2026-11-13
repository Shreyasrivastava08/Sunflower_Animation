import { Router } from 'express';
import { sunflowerController } from '../controllers/sunflowerController.js';

const router = Router();

// GET /api/sunflowers — Fetch all sunflowers
router.get('/', (req, res, next) => sunflowerController.getAll(req, res, next));

// GET /api/sunflowers/:id — Fetch a single sunflower by id
router.get('/:id', (req, res, next) => sunflowerController.getById(req, res, next));

// POST /api/sunflowers — Create/plant a new sunflower seed with default or customized stats
router.post('/', (req, res, next) => sunflowerController.create(req, res, next));

// PATCH /api/sunflowers/:id/nurture — Nurture sunflower ('water' | 'sunlight' | 'fertilize')
router.patch('/:id/nurture', (req, res, next) => sunflowerController.nurture(req, res, next));

// DELETE /api/sunflowers/:id — Remove a sunflower
router.delete('/:id', (req, res, next) => sunflowerController.delete(req, res, next));

export default router;
