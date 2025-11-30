import mongoose from 'mongoose'

const dietLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true,
    },
    foodItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true }, // e.g., 'g', 'ml', 'piece'
        calories: { type: Number },
        protein: { type: Number },
        carbs: { type: Number },
        fat: { type: Number },
      },
    ],
    totalCalories: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      required: true,
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

export default mongoose.model('DietLog', dietLogSchema)

