import express from 'express'
import {
  getMedications,
  createMedication,
  updateMedication,
  deleteMedication,
  logDose,
  getMedicationHistory,
  getAdherenceStats,
} from '../controllers/medication.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.route('/').get(protect, getMedications).post(protect, createMedication)
router.get('/stats', protect, getAdherenceStats)
router
  .route('/:id')
  .put(protect, updateMedication)
  .delete(protect, deleteMedication)

router.post('/:id/log', protect, logDose)
router.get('/:id/history', protect, getMedicationHistory)

export default router

