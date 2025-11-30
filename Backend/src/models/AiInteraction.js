import mongoose from 'mongoose'

const aiInteractionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['chat', 'voice', 'recommendation'],
      required: true,
    },
    input: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
    context: {
      type: mongoose.Schema.Types.Mixed, // Store additional context data
    },
    recommendations: [
      {
        type: { type: String }, // e.g., 'diet', 'sleep', 'exercise'
        message: { type: String },
        priority: { type: String, enum: ['low', 'medium', 'high'] },
      },
    ],
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('AiInteraction', aiInteractionSchema)

