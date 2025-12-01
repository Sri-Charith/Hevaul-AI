import DietLog from '../models/DietLog.js'
import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { sendEmailNotification } from '../services/notification.service.js'

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
      date: date || new Date(),
      notes,
    })

    // Check calorie limits and send notifications
    const user = await User.findById(req.user.id)
    const logDate = new Date(date || new Date())
    const startOfDay = new Date(logDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(logDate)
    endOfDay.setHours(23, 59, 59, 999)
    const startOfMonth = new Date(logDate.getFullYear(), logDate.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0)
    const endOfMonth = new Date(logDate.getFullYear(), logDate.getMonth() + 1, 0)
    endOfMonth.setHours(23, 59, 59, 999)

    // Calculate daily total
    const dailyLogs = await DietLog.find({
      user: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
    })
    const dailyTotal = dailyLogs.reduce((sum, log) => sum + (log.totalCalories || 0), 0)

    // Calculate monthly total
    const monthlyLogs = await DietLog.find({
      user: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    })
    const monthlyTotal = monthlyLogs.reduce((sum, log) => sum + (log.totalCalories || 0), 0)

    const dailyLimit = user.calorieLimits?.daily || 2000
    const monthlyLimit = user.calorieLimits?.monthly || 60000

    // Check daily limit
    console.log(`[Debug] Checking Daily Limit: Total=${dailyTotal}, Limit=${dailyLimit}`)

    if (dailyTotal > dailyLimit) {
      console.log('[Debug] Daily limit exceeded. Creating notification...')
      console.log('[Debug] Daily limit exceeded. Creating notification...')
      await Notification.create({
        user: req.user.id,
        type: 'calorie_limit_daily',
        title: 'Daily Calorie Limit Exceeded',
        message: `You've exceeded your daily calorie limit of ${dailyLimit} kcal. Current intake: ${dailyTotal.toFixed(0)} kcal.`,
        metadata: { dailyTotal, dailyLimit },
        status: 'pending' // Worker will pick this up
      })

      console.log(`[Debug] User email pref: ${user.preferences?.notifications?.email}`)

      if (user.preferences?.notifications?.email) {
        console.log(`[Debug] Creating daily limit notification for user ${user.email}`)
        // Notification is already created above, just ensure status is pending to be picked up by worker
        // The previous code created a notification but didn't use the worker fields fully or relied on direct send.
        // We need to update the notification creation to include status 'pending' explicitly if not default,
        // and REMOVE the direct sendEmailNotification call.

        // Actually, looking at the code, 'notification' variable is created on line 70 but not used for the email logic really.
        // We should update that creation to be the source of truth for the worker.
      }
    } else {
      console.log('[Debug] Daily limit NOT exceeded.')
    }

    // Check monthly limit
    if (monthlyTotal > monthlyLimit) {
      console.log('[Debug] Monthly limit exceeded. Creating notification...')
      await Notification.create({
        user: req.user.id,
        type: 'calorie_limit_monthly',
        title: 'Monthly Calorie Limit Exceeded',
        message: `You've exceeded your monthly calorie limit of ${monthlyLimit} kcal. Current intake: ${monthlyTotal.toFixed(0)} kcal.`,
        metadata: { monthlyTotal, monthlyLimit },
        status: 'pending' // Worker will pick this up
      })
    }

    res.status(201).json(dietLog)
  } catch (error) {
    console.error(`CRITICAL ERROR in createDietLog: ${error.message}`)
    console.error(error.stack)
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

// @desc    Get calorie statistics
// @route   GET /api/diet/stats
// @access  Private
export const getCalorieStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const dailyLimit = user.calorieLimits?.daily || 2000
    const monthlyLimit = user.calorieLimits?.monthly || 60000

    const today = new Date()
    const startOfDay = new Date(today.setHours(0, 0, 0, 0))
    const endOfDay = new Date(today.setHours(23, 59, 59, 999))
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)

    // Get daily logs
    const dailyLogs = await DietLog.find({
      user: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
    })
    const dailyTotal = dailyLogs.reduce((sum, log) => sum + (log.totalCalories || 0), 0)

    // Get monthly logs
    const monthlyLogs = await DietLog.find({
      user: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    })
    const monthlyTotal = monthlyLogs.reduce((sum, log) => sum + (log.totalCalories || 0), 0)

    // Calculate macros
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    monthlyLogs.forEach((log) => {
      log.foodItems.forEach((item) => {
        totalProtein += item.protein || 0
        totalCarbs += item.carbs || 0
        totalFat += item.fat || 0
      })
    })

    // Get daily breakdown for last 30 days
    const dailyBreakdown = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))

      const dayLogs = await DietLog.find({
        user: req.user.id,
        date: { $gte: dayStart, $lte: dayEnd },
      })
      const dayTotal = dayLogs.reduce((sum, log) => sum + (log.totalCalories || 0), 0)
      dailyBreakdown.push({
        date: dayStart.toISOString().split('T')[0],
        calories: dayTotal,
      })
    }

    res.json({
      daily: {
        total: dailyTotal,
        limit: dailyLimit,
        remaining: Math.max(0, dailyLimit - dailyTotal),
      },
      monthly: {
        total: monthlyTotal,
        limit: monthlyLimit,
        remaining: Math.max(0, monthlyLimit - monthlyTotal),
      },
      macros: {
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
      },
      dailyBreakdown,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update calorie limits
// @route   PUT /api/diet/limits
// @access  Private
export const updateCalorieLimits = async (req, res) => {
  try {
    const { daily, monthly } = req.body

    const user = await User.findById(req.user.id)
    if (daily !== undefined) {
      user.calorieLimits = user.calorieLimits || {}
      user.calorieLimits.daily = daily
    }
    if (monthly !== undefined) {
      user.calorieLimits = user.calorieLimits || {}
      user.calorieLimits.monthly = monthly
    }

    await user.save()

    res.json({
      calorieLimits: user.calorieLimits,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Send monthly diet report
// @route   POST /api/diet/report/monthly
// @access  Private
export const sendMonthlyReport = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999)
    const monthName = startOfMonth.toLocaleString('default', { month: 'long' })

    // Get monthly logs
    const monthlyLogs = await DietLog.find({
      user: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    })

    const monthlyTotal = monthlyLogs.reduce((sum, log) => sum + (log.totalCalories || 0), 0)
    const monthlyLimit = user.calorieLimits?.monthly || 60000
    const averageCalories = monthlyLogs.length > 0 ? (monthlyTotal / new Date().getDate()).toFixed(0) : 0

    // Calculate macros
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    monthlyLogs.forEach((log) => {
      log.foodItems.forEach((item) => {
        totalProtein += item.protein || 0
        totalCarbs += item.carbs || 0
        totalFat += item.fat || 0
      })
    })

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: #ffffff; border-radius: 16px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #111827; margin: 0; font-size: 24px;">Monthly Diet Report</h1>
            <p style="color: #6b7280; margin-top: 5px;">${monthName} ${today.getFullYear()}</p>
          </div>

          <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-size: 14px;">Total Calories</span>
                  <div style="color: #111827; font-size: 18px; font-weight: bold;">${monthlyTotal.toFixed(0)} kcal</div>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  <span style="color: #6b7280; font-size: 14px;">Monthly Goal</span>
                  <div style="color: #111827; font-size: 18px; font-weight: bold;">${monthlyLimit} kcal</div>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; padding-top: 15px;">
                  <span style="color: #6b7280; font-size: 14px;">Daily Average</span>
                  <div style="color: #3b82f6; font-size: 18px; font-weight: bold;">${averageCalories} kcal</div>
                </td>
                <td style="padding: 10px; padding-top: 15px; text-align: right;">
                  <span style="color: #6b7280; font-size: 14px;">Status</span>
                  <div style="color: ${monthlyTotal > monthlyLimit ? '#ef4444' : '#10b981'}; font-size: 18px; font-weight: bold;">
                    ${monthlyTotal > monthlyLimit ? 'Over Limit' : 'On Track'}
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <h3 style="color: #374151; font-size: 16px; margin-bottom: 15px;">Macro Breakdown</h3>
          <div style="display: flex; justify-content: space-between; gap: 10px; margin-bottom: 30px;">
            <div style="flex: 1; background-color: #eff6ff; padding: 15px; border-radius: 10px; text-align: center;">
              <div style="color: #3b82f6; font-weight: bold; font-size: 18px;">${totalProtein.toFixed(0)}g</div>
              <div style="color: #60a5fa; font-size: 12px; text-transform: uppercase; margin-top: 4px;">Protein</div>
            </div>
            <div style="flex: 1; background-color: #ecfdf5; padding: 15px; border-radius: 10px; text-align: center;">
              <div style="color: #10b981; font-weight: bold; font-size: 18px;">${totalCarbs.toFixed(0)}g</div>
              <div style="color: #34d399; font-size: 12px; text-transform: uppercase; margin-top: 4px;">Carbs</div>
            </div>
            <div style="flex: 1; background-color: #fff7ed; padding: 15px; border-radius: 10px; text-align: center;">
              <div style="color: #f97316; font-weight: bold; font-size: 18px;">${totalFat.toFixed(0)}g</div>
              <div style="color: #fb923c; font-size: 12px; text-transform: uppercase; margin-top: 4px;">Fat</div>
            </div>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
            Keep up the great work! <br>
            <span style="color: #9ca3af; font-size: 12px;">Sent by Hevaul AI</span>
          </p>
        </div>
      </div>
    `

    await sendEmailNotification(
      user.email,
      `Your Monthly Diet Report - ${monthName}`,
      `Here is your diet summary for ${monthName}. Total Calories: ${monthlyTotal.toFixed(0)}.`,
      html
    )

    res.json({ message: 'Monthly report sent successfully' })
  } catch (error) {
    console.error('Error sending report:', error)
    res.status(500).json({ message: 'Failed to send report' })
  }
}



// @desc    Test alert email
// @route   POST /api/diet/test-alert
// @access  Private
export const testAlertEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    console.log(`[Test] Creating test notification for ${user.email}`)

    const notification = await Notification.create({
      user: req.user.id,
      type: 'calorie_limit_daily',
      title: 'Test Daily Calorie Limit Exceeded',
      message: `This is a test alert. You've exceeded your daily calorie limit.`,
      metadata: { dailyTotal: 2500, dailyLimit: 2000 },
      status: 'pending'
    })

    res.json({
      message: 'Test notification created',
      notificationId: notification._id,
      status: notification.status
    })
  } catch (error) {
    console.error('Test alert error:', error)
    res.status(500).json({ message: error.message })
  }
}
