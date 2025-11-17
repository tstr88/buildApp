/**
 * Templates Routes
 */

import express from 'express';
import { optionalAuth } from '../middleware/auth';
import { getTemplates, getTemplateBySlug, getTemplateStats } from '../controllers/templatesController';

const router = express.Router();

// GET /api/templates - Get all templates (public, but optionalAuth for personalization)
router.get('/', optionalAuth, getTemplates);

// GET /api/templates/:slug - Get template by slug (public)
router.get('/:slug', optionalAuth, getTemplateBySlug);

// GET /api/templates/:id/usage-stats - Get template usage statistics
router.get('/:id/usage-stats', getTemplateStats);

export default router;
