import cron from 'node-cron'
import Medication from '../models/Medication.js'
import { sendMedicationReminder } from '../services/notification.service.js'

// Schedule medication reminders based on medication times

export const startMedicationJobs = () => {
  // Check for medications every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
      
      // Find active medications that need reminders at this time
      const medications = await Medication.find({
        isActive: true,
        times: currentTime,
      }).populate('user')

      for (const medication of medications) {
        // Check if medication is within start and end date
        const today = new Date()
        if (
          medication.startDate <= today &&
          (!medication.endDate || medication.endDate >= today)
        ) {
          if (medication.user && medication.user.preferences?.notifications?.email) {
            await sendMedicationReminder(medication.user, medication)
            console.log(`Medication reminder sent for ${medication.name} to ${medication.user.email}`)
          }
        }
      }
    } catch (error) {
      console.error('Medication reminder job error:', error)
    }
  })

  console.log('Medication reminder jobs started')
}

