import mongoose from 'mongoose'

const waterLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number, // in ml
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    time: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('WaterLog', waterLogSchema)

