import express from 'express'
import {
  getAiInteractions,
  createAiInteraction,
  getRecommendations,
} from '../controllers/ai.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.get('/', protect, getAiInteractions)
router.post('/chat', protect, createAiInteraction)
router.post('/recommendations', protect, getRecommendations)

export default router

