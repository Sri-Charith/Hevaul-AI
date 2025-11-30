import cron from 'node-cron'
import User from '../models/User.js'
import { sendEmailNotification } from '../services/notification.service.js'

// Schedule sleep reminders
// Bedtime reminder: 10:00 PM daily

export const startSleepJobs = () => {
  // Bedtime reminder - 10:00 PM daily
  cron.schedule('0 22 * * *', async () => {
    try {
      const users = await User.find({ 'preferences.notifications.email': true })
      
      for (const user of users) {
        const subject = 'Bedtime Reminder'
        const text = "It's time to wind down and prepare for sleep. Don't forget to log your sleep time!"
        const html = `
          <h2>Bedtime Reminder</h2>
          <p>It's time to wind down and prepare for sleep.</p>
          <p>Don't forget to log your sleep time when you wake up!</p>
        `
        
        await sendEmailNotification(user.email, subject, text, html)
      }
      
      console.log('Bedtime reminders sent')
    } catch (error) {
      console.error('Bedtime reminder job error:', error)
    }
  })

  console.log('Sleep reminder jobs started')
}

