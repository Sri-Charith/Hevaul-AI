import cron from 'node-cron'
import User from '../models/User.js'
import { sendWaterReminder } from '../services/notification.service.js'

// Schedule water intake reminders
// Every 2 hours from 8 AM to 8 PM

export const startWaterJobs = () => {
  // Water reminders every 2 hours from 8 AM to 8 PM
  const hours = [8, 10, 12, 14, 16, 18, 20]
  
  hours.forEach((hour) => {
    cron.schedule(`0 ${hour} * * *`, async () => {
      try {
        const users = await User.find({ 'preferences.notifications.email': true })
        
        for (const user of users) {
          await sendWaterReminder(user)
        }
        
        console.log(`Water reminders sent at ${hour}:00`)
      } catch (error) {
        console.error(`Water reminder job error at ${hour}:00:`, error)
      }
    })
  })

  console.log('Water reminder jobs started')
}

