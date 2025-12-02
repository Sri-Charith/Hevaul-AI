import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import {
  createLog,
  getLogs,
  updateLog,
  deleteLog,
  getStats,
  getAIInsights
} from '../controllers/sleep.controller.js'

const router = express.Router()

router.use(protect) // Protect all routes

router.route('/')
  .get(getLogs)
  .post(createLog)

router.route('/stats')
  .get(getStats)

router.route('/insights')
  .get(getAIInsights)

router.route('/:id')
  .put(updateLog)
  .delete(deleteLog)

export default router
