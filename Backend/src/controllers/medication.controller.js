import Medication from '../models/Medication.js'

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
    const { name, dosage, frequency, times, startDate, endDate, isActive, notes } = req.body

    const medication = await Medication.create({
      user: req.user.id,
      name,
      dosage,
      frequency,
      times,
      startDate,
      endDate,
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

    res.json({ message: 'Medication removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

