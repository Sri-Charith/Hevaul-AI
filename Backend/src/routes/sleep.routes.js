import express from 'express'
import {
  getSleepLogs,
  createSleepLog,
  updateSleepLog,
  deleteSleepLog,
} from '../controllers/sleep.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.route('/').get(protect, getSleepLogs).post(protect, createSleepLog)
router
  .route('/:id')
  .put(protect, updateSleepLog)
  .delete(protect, deleteSleepLog)

export default router

