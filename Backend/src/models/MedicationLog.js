import mongoose from 'mongoose'

const medicationLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        medication: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Medication',
            required: true,
        },
        status: {
            type: String,
            enum: ['taken', 'missed', 'skipped'],
            required: true,
        },
        scheduledTime: {
            type: Date,
            required: true,
        },
        takenTime: {
            type: Date,
        },
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.model('MedicationLog', medicationLogSchema)
