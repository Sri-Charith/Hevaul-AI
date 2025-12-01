import express from 'express'
import {
  getDietLogs,
  createDietLog,
  updateDietLog,
  deleteDietLog,
  getCalorieStats,
  updateCalorieLimits,
} from '../controllers/diet.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.route('/').get(protect, getDietLogs).post(protect, createDietLog)
router.route('/stats').get(protect, getCalorieStats)
router.route('/limits').put(protect, updateCalorieLimits)
router
  .route('/:id')
  .put(protect, updateDietLog)
  .delete(protect, deleteDietLog)

export default router

