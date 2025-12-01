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
    if (dailyTotal > dailyLimit) {
      const notification = await Notification.create({
        user: req.user.id,
        type: 'calorie_limit_daily',
        title: 'Daily Calorie Limit Exceeded',
        message: `You've exceeded your daily calorie limit of ${dailyLimit} kcal. Current intake: ${dailyTotal.toFixed(0)} kcal.`,
        metadata: { dailyTotal, dailyLimit },
      })

      if (user.preferences?.notifications?.email) {
        try {
          await sendEmailNotification(
            user.email,
            'Daily Calorie Limit Exceeded - Hevaul AI',
            `You've exceeded your daily calorie limit of ${dailyLimit} kcal. Current intake: ${dailyTotal.toFixed(0)} kcal. Please be mindful of your calorie consumption.`,
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
              <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #ef4444; margin-top: 0;">⚠️ Daily Calorie Limit Exceeded</h2>
                <p style="color: #374151; font-size: 16px;">Hello ${user.name},</p>
                <p style="color: #374151; font-size: 16px;">You've exceeded your daily calorie limit of <strong>${dailyLimit} kcal</strong>.</p>
                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #991b1b;"><strong>Current Intake:</strong> ${dailyTotal.toFixed(0)} kcal</p>
                  <p style="margin: 5px 0 0 0; color: #991b1b;"><strong>Over Limit:</strong> ${(dailyTotal - dailyLimit).toFixed(0)} kcal</p>
                </div>
                <p style="color: #374151; font-size: 16px;">Please be mindful of your calorie consumption and consider adjusting your meals for the rest of the day.</p>
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Best regards,<br>Hevaul AI Team</p>
              </div>
            </div>
            `
          )
        } catch (emailError) {
          console.error('Failed to send daily limit email:', emailError)
          // Don't fail the request if email fails
        }
      }
    }

    // Check monthly limit
    if (monthlyTotal > monthlyLimit) {
      const notification = await Notification.create({
        user: req.user.id,
        type: 'calorie_limit_monthly',
        title: 'Monthly Calorie Limit Exceeded',
        message: `You've exceeded your monthly calorie limit of ${monthlyLimit} kcal. Current intake: ${monthlyTotal.toFixed(0)} kcal.`,
        metadata: { monthlyTotal, monthlyLimit },
      })

      if (user.preferences?.notifications?.email) {
        try {
          await sendEmailNotification(
            user.email,
            'Monthly Calorie Limit Exceeded - Hevaul AI',
            `You've exceeded your monthly calorie limit of ${monthlyLimit} kcal. Current intake: ${monthlyTotal.toFixed(0)} kcal. Please review your monthly diet plan.`,
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
              <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #ef4444; margin-top: 0;">⚠️ Monthly Calorie Limit Exceeded</h2>
                <p style="color: #374151; font-size: 16px;">Hello ${user.name},</p>
                <p style="color: #374151; font-size: 16px;">You've exceeded your monthly calorie limit of <strong>${monthlyLimit} kcal</strong>.</p>
                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #991b1b;"><strong>Current Intake:</strong> ${monthlyTotal.toFixed(0)} kcal</p>
                  <p style="margin: 5px 0 0 0; color: #991b1b;"><strong>Over Limit:</strong> ${(monthlyTotal - monthlyLimit).toFixed(0)} kcal</p>
                </div>
                <p style="color: #374151; font-size: 16px;">Please review your monthly diet plan and consider adjusting your calorie intake for the remaining days of the month.</p>
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Best regards,<br>Hevaul AI Team</p>
              </div>
            </div>
            `
          )
        } catch (emailError) {
          console.error('Failed to send monthly limit email:', emailError)
          // Don't fail the request if email fails
        }
      }
    }

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

