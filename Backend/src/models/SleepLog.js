import mongoose from 'mongoose'

const sleepLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sleepTime: {
      type: Date,
      required: true,
    },
    wakeTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    quality: {
      type: Number,
      min: 1,
      max: 10,
    },
    notes: {
      type: String,
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

