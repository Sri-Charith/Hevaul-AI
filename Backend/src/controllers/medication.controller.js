import Medication from '../models/Medication.js'
import MedicationLog from '../models/MedicationLog.js'

// @desc    Get all medications for a user
// @route   GET /api/medication
// @access  Private
export const getMedications = async (req, res) => {
  try {
    const medications = await Medication.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
    res.json(medications)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create a new medication
// @route   POST /api/medication
// @access  Private
export const createMedication = async (req, res) => {
  try {
    const {
      name,
      cause,
      dosage,
      type,
      frequency,
      times,
      startDate,
      endDate,
      totalQuantity,
      refillReminder,
      isActive,
      notes,
    } = req.body

    const medication = await Medication.create({
      user: req.user.id,
      name,
      cause,
      dosage,
      type,
      frequency,
      times,
      startDate,
      endDate,
      totalQuantity,
      refillReminder,
      isActive,
      notes,
    })

    res.status(201).json(medication)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update a medication
// @route   PUT /api/medication/:id
// @access  Private
export const updateMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id)

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' })
    }

    if (medication.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const updatedMedication = await Medication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    res.json(updatedMedication)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete a medication
// @route   DELETE /api/medication/:id
// @access  Private
export const deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id)

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' })
    }

    if (medication.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    await medication.deleteOne()

    // Also delete associated logs
    await MedicationLog.deleteMany({ medication: req.params.id })

    res.json({ message: 'Medication removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Log a medication dose (taken/missed)
// @route   POST /api/medication/:id/log
// @access  Private
export const logDose = async (req, res) => {
  try {
    const { status, scheduledTime, takenTime, notes } = req.body
    const medication = await Medication.findById(req.params.id)

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' })
    }

    if (medication.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const log = await MedicationLog.create({
      user: req.user.id,
      medication: req.params.id,
      status,
      scheduledTime,
      takenTime: status === 'taken' ? (takenTime || new Date()) : null,
      notes,
    })

    // Update remaining quantity if applicable
    if (status === 'taken' && medication.totalQuantity > 0) {
      medication.totalQuantity -= 1
      await medication.save()
    }

    res.status(201).json(log)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get medication history/logs
// @route   GET /api/medication/:id/history
// @access  Private
export const getMedicationHistory = async (req, res) => {
  try {
    const logs = await MedicationLog.find({
      medication: req.params.id,
      user: req.user.id,
    }).sort({ scheduledTime: -1 })

    res.json(logs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get overall adherence stats
// @route   GET /api/medication/stats
// @access  Private
export const getAdherenceStats = async (req, res) => {
  try {
    const logs = await MedicationLog.find({ user: req.user.id })

    const total = logs.length
    if (total === 0) {
      return res.json({ adherence: 0, total: 0, taken: 0, missed: 0, skipped: 0 })
    }

    const taken = logs.filter(log => log.status === 'taken').length
    const missed = logs.filter(log => log.status === 'missed').length
    const skipped = logs.filter(log => log.status === 'skipped').length

    const adherence = (taken / total) * 100

    res.json({
      adherence: Math.round(adherence),
      total,
      taken,
      missed,
      skipped
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

