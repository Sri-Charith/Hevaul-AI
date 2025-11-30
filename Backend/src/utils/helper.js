// Utility helper functions

// @desc    Calculate total calories for a day
export const calculateDailyCalories = (dietLogs) => {
  return dietLogs.reduce((total, log) => total + (log.totalCalories || 0), 0)
}

// @desc    Calculate average sleep duration
export const calculateAverageSleep = (sleepLogs) => {
  if (sleepLogs.length === 0) return 0
  const total = sleepLogs.reduce((sum, log) => sum + log.duration, 0)
  return total / sleepLogs.length
}

// @desc    Calculate total water intake for a day
export const calculateDailyWater = (waterLogs, date) => {
  const dayLogs = waterLogs.filter(
    (log) => new Date(log.date).toDateString() === new Date(date).toDateString()
  )
  return dayLogs.reduce((total, log) => total + log.amount, 0)
}

// @desc    Format date to YYYY-MM-DD
export const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0]
}

// @desc    Get start and end of day
export const getDayRange = (date) => {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

