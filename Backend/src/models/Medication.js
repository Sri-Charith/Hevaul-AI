import mongoose from 'mongoose'

const medicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    cause: {
      type: String,
      required: true, // e.g., 'Headache', 'Hypertension'
    },
    dosage: {
      type: String,
      required: true,
    },
    type: {
      type: String, // e.g., 'Tablet', 'Syrup', 'Injection'
    },
    frequency: {
      type: String,
      required: true, // e.g., 'daily', 'twice daily', 'weekly'
    },
    times: [
      {
        type: String, // e.g., '08:00', '20:00'
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    totalQuantity: {
      type: Number, // Initial total quantity for tracking
    },
    refillReminder: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Medication', medicationSchema)

