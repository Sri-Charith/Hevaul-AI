import cron from 'node-cron'
import Medication from '../models/Medication.js'
import { sendMedicationReminder } from '../services/notification.service.js'

// Schedule medication reminders based on medication times

export const startMedicationJobs = () => {
  // Check for medications every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date()
      let hours = now.getHours()
      const minutes = now.getMinutes().toString().padStart(2, '0')
      const ampm = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12
      hours = hours ? hours : 12 // the hour '0' should be '12'
      const currentTime = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`

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

