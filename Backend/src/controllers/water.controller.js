import WaterLog from '../models/WaterLog.js'

// @desc    Get all water logs for a user
// @route   GET /api/water
// @access  Private
export const getWaterLogs = async (req, res) => {
  try {
    const logs = await WaterLog.find({ user: req.user.id })
      .sort({ date: -1 })
      .populate('user', 'name email')
    res.json(logs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create a new water log
// @route   POST /api/water
// @access  Private
export const createWaterLog = async (req, res) => {
  try {
    const { amount, date, time, notes } = req.body

    const waterLog = await WaterLog.create({
      user: req.user.id,
      amount,
      date,
      time,
      notes,
    })

    res.status(201).json(waterLog)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update a water log
// @route   PUT /api/water/:id
// @access  Private
export const updateWaterLog = async (req, res) => {
  try {
    const waterLog = await WaterLog.findById(req.params.id)

    if (!waterLog) {
      return res.status(404).json({ message: 'Water log not found' })
    }

    if (waterLog.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const updatedLog = await WaterLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    res.json(updatedLog)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete a water log
// @route   DELETE /api/water/:id
// @access  Private
export const deleteWaterLog = async (req, res) => {
  try {
    const waterLog = await WaterLog.findById(req.params.id)

    if (!waterLog) {
      return res.status(404).json({ message: 'Water log not found' })
    }

    if (waterLog.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    await waterLog.deleteOne()

    res.json({ message: 'Water log removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

