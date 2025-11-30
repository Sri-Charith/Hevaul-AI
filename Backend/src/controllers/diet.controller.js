import DietLog from '../models/DietLog.js'

// @desc    Get all diet logs for a user
// @route   GET /api/diet
// @access  Private
export const getDietLogs = async (req, res) => {
  try {
    const logs = await DietLog.find({ user: req.user.id })
      .sort({ date: -1 })
      .populate('user', 'name email')
    res.json(logs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create a new diet log
// @route   POST /api/diet
// @access  Private
export const createDietLog = async (req, res) => {
  try {
    const { mealType, foodItems, totalCalories, date, notes } = req.body

    const dietLog = await DietLog.create({
      user: req.user.id,
      mealType,
      foodItems,
      totalCalories,
      date,
      notes,
    })

    res.status(201).json(dietLog)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update a diet log
// @route   PUT /api/diet/:id
// @access  Private
export const updateDietLog = async (req, res) => {
  try {
    const dietLog = await DietLog.findById(req.params.id)

    if (!dietLog) {
      return res.status(404).json({ message: 'Diet log not found' })
    }

    // Make sure user owns the log
    if (dietLog.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const updatedLog = await DietLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    res.json(updatedLog)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete a diet log
// @route   DELETE /api/diet/:id
// @access  Private
export const deleteDietLog = async (req, res) => {
  try {
    const dietLog = await DietLog.findById(req.params.id)

    if (!dietLog) {
      return res.status(404).json({ message: 'Diet log not found' })
    }

    // Make sure user owns the log
    if (dietLog.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    await dietLog.deleteOne()

    res.json({ message: 'Diet log removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

