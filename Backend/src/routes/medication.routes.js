import express from 'express'
import {
  getMedications,
  createMedication,
  updateMedication,
  deleteMedication,
} from '../controllers/medication.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

router.route('/').get(protect, getMedications).post(protect, createMedication)
router
  .route('/:id')
  .put(protect, updateMedication)
  .delete(protect, deleteMedication)

export default router

