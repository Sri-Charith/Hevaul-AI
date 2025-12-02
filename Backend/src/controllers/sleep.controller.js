import SleepLog from '../models/SleepLog.js'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Calculate Sleep Score (0-100)
const calculateSleepScore = (duration, quality, mood) => {
  let score = 0

  // Duration Score (Max 50)
  // Ideal: 7-9 hours. 
  if (duration >= 7 && duration <= 9) score += 50
  else if (duration >= 6 && duration < 7) score += 40
  else if (duration > 9) score += 40
  else if (duration >= 5) score += 30
  else score += 10

  // Quality Score (Max 30)
  const qualityMap = { 'Excellent': 30, 'Good': 25, 'Average': 15, 'Poor': 5 }
  score += qualityMap[quality] || 15

  // Mood Score (Max 20)
  // Simple mapping for now, can be expanded
  const moodMap = { '😊': 20, '😐': 10, '😫': 5 } // Happy, Neutral, Tired
  // Fallback if mood isn't in map (or use string matching)
  if (mood === '😊' || mood === 'Happy') score += 20
  else if (mood === '😐' || mood === 'Neutral') score += 10
  else score += 5

  return Math.min(100, Math.max(0, score))
}

export const createLog = async (req, res) => {
  try {
    const { startTime, endTime, quality, mood, notes } = req.body

    // Calculate duration in hours
    const start = new Date(startTime)
    const end = new Date(endTime)
    let duration = (end - start) / (1000 * 60 * 60)

    // Handle crossing midnight if needed (though Date objects usually handle this if full timestamps are sent)
    if (duration < 0) duration += 24

    const sleepScore = calculateSleepScore(duration, quality, mood)

    const log = new SleepLog({
      user: req.user._id,
      startTime,
      endTime,
      duration: parseFloat(duration.toFixed(2)),
      quality,
      mood,
      notes,
      sleepScore,
      date: new Date(endTime) // Log date is usually the wake-up day
    })

    const savedLog = await log.save()
    res.status(201).json(savedLog)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const getLogs = async (req, res) => {
  try {
    const logs = await SleepLog.find({ user: req.user._id }).sort({ date: -1 })
    res.json(logs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateLog = async (req, res) => {
  try {
    const { startTime, endTime, quality, mood } = req.body

    // Recalculate metrics if time/quality/mood changed
    let updateData = { ...req.body }

    if (startTime && endTime) {
      const start = new Date(startTime)
      const end = new Date(endTime)
      let duration = (end - start) / (1000 * 60 * 60)
      if (duration < 0) duration += 24
      updateData.duration = parseFloat(duration.toFixed(2))
    }

    if (updateData.duration || quality || mood) {
      // We need existing data if not all fields are provided
      // For simplicity, assume frontend sends full object or we fetch it. 
      // Let's just recalculate score based on what we have + defaults/existing if we fetched.
      // Better: Fetch existing log first.
      const existingLog = await SleepLog.findById(req.params.id)
      if (!existingLog) return res.status(404).json({ message: 'Log not found' })

      const d = updateData.duration || existingLog.duration
      const q = quality || existingLog.quality
      const m = mood || existingLog.mood
      updateData.sleepScore = calculateSleepScore(d, q, m)
    }

    const log = await SleepLog.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true }
    )

    if (!log) return res.status(404).json({ message: 'Log not found' })
    res.json(log)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const deleteLog = async (req, res) => {
  try {
    const log = await SleepLog.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!log) return res.status(404).json({ message: 'Log not found' })
    res.json({ message: 'Log deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getStats = async (req, res) => {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const logs = await SleepLog.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 })

    // Calculate Weekly Stats
    const totalDuration = logs.reduce((acc, log) => acc + log.duration, 0)
    const avgDuration = logs.length ? totalDuration / logs.length : 0
    const avgScore = logs.length ? logs.reduce((acc, log) => acc + log.sleepScore, 0) / logs.length : 0

    // Sleep Debt (Ideal 8h/day * 7 = 56h)
    // Calculate debt based on *actual* days logged or just a weekly target?
    // Usually debt is accumulated over time. Let's look at the last 7 days total.
    const idealWeeklySleep = 56
    const sleepDebt = Math.max(0, idealWeeklySleep - totalDuration)

    res.json({
      logs, // Last 7 days logs for charts
      avgDuration: parseFloat(avgDuration.toFixed(1)),
      avgScore: Math.round(avgScore),
      sleepDebt: parseFloat(sleepDebt.toFixed(1)),
      totalLogs: logs.length
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAIInsights = async (req, res) => {
  try {
    // Fetch last 14 days to give AI some context
    const logs = await SleepLog.find({ user: req.user._id }).sort({ date: -1 }).limit(14)

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured')
    }

    const prompt = `
      Analyze the following sleep data for a user and provide 3 short, actionable insights or observations.
      Focus on patterns, sleep debt, quality trends, and consistency.
      Data: ${JSON.stringify(logs.map(l => ({ date: l.date, duration: l.duration, quality: l.quality, score: l.sleepScore })))}
      
      Format: JSON array of strings. Example: ["Insight 1", "Insight 2", "Insight 3"]
    `

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-preview-03-25" })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean up markdown if present
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const insights = JSON.parse(jsonStr)

    res.json({ insights })
  } catch (error) {
    console.error('AI Error:', error.message)

    // Fallback insights if AI fails (e.g. quota exceeded)
    const fallbackInsights = [
      "Sleep consistency is key. Try to go to bed at the same time every night.",
      "Your sleep duration varies. Aim for 7-9 hours for optimal rest.",
      "Monitor your caffeine intake in the afternoon to improve sleep quality."
    ]

    res.json({
      insights: fallbackInsights,
      warning: "AI service temporarily unavailable (Quota Exceeded). Showing general tips."
    })
  }
}
