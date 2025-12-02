import mongoose from 'mongoose'

const sleepLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in hours
      required: true,
    },
    quality: {
      type: String,
      enum: ['Poor', 'Average', 'Good', 'Excellent'],
      required: true,
    },
    mood: {
      type: String, // e.g., '😊', '😐', '😫'
      required: true,
    },
    notes: {
      type: String,
    },
    sleepScore: {
      type: Number, // 0-100
      default: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('SleepLog', sleepLogSchema)

