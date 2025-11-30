import SleepLog from '../models/SleepLog.js'

// @desc    Get all sleep logs for a user
// @route   GET /api/sleep
// @access  Private
export const getSleepLogs = async (req, res) => {
  try {
    const logs = await SleepLog.find({ user: req.user.id })
      .sort({ date: -1 })
      .populate('user', 'name email')
    res.json(logs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create a new sleep log
// @route   POST /api/sleep
// @access  Private
export const createSleepLog = async (req, res) => {
  try {
    const { sleepTime, wakeTime, duration, quality, notes, date } = req.body

    const sleepLog = await SleepLog.create({
      user: req.user.id,
      sleepTime,
      wakeTime,
      duration,
      quality,
      notes,
      date,
    })

    res.status(201).json(sleepLog)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update a sleep log
// @route   PUT /api/sleep/:id
// @access  Private
export const updateSleepLog = async (req, res) => {
  try {
    const sleepLog = await SleepLog.findById(req.params.id)

    if (!sleepLog) {
      return res.status(404).json({ message: 'Sleep log not found' })
    }

    if (sleepLog.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const updatedLog = await SleepLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    res.json(updatedLog)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete a sleep log
// @route   DELETE /api/sleep/:id
// @access  Private
export const deleteSleepLog = async (req, res) => {
  try {
    const sleepLog = await SleepLog.findById(req.params.id)

    if (!sleepLog) {
      return res.status(404).json({ message: 'Sleep log not found' })
    }

    if (sleepLog.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    await sleepLog.deleteOne()

    res.json({ message: 'Sleep log removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

