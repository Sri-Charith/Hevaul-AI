import AiInteraction from '../models/AiInteraction.js'
import { generateRecommendations } from '../services/ai.service.js'

// @desc    Get all AI interactions for a user
// @route   GET /api/ai
// @access  Private
export const getAiInteractions = async (req, res) => {
  try {
    const interactions = await AiInteraction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
    res.json(interactions)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create a new AI interaction (chat/voice)
// @route   POST /api/ai/chat
// @access  Private
export const createAiInteraction = async (req, res) => {
  try {
    const { type, input, context } = req.body

    // Generate AI response
    const output = await generateRecommendations(input, context, req.user.id)

    // Save interaction
    const interaction = await AiInteraction.create({
      user: req.user.id,
      type: type || 'chat',
      input,
      output,
      context,
    })

    res.status(201).json(interaction)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get AI recommendations
// @route   POST /api/ai/recommendations
// @access  Private
export const getRecommendations = async (req, res) => {
  try {
    const { context } = req.body

    const recommendations = await generateRecommendations(
      'Generate health recommendations',
      context,
      req.user.id
    )

    res.json({ recommendations })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

