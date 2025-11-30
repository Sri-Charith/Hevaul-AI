import express from 'express'
import {
  getWaterLogs,
  createWaterLog,
  updateWaterLog,
  deleteWaterLog,
} from '../controllers/water.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.route('/').get(protect, getWaterLogs).post(protect, createWaterLog)
router
  .route('/:id')
  .put(protect, updateWaterLog)
  .delete(protect, deleteWaterLog)

export default router

