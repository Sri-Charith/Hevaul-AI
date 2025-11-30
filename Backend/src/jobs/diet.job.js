import cron from 'node-cron'
import User from '../models/User.js'
import { sendMealReminder } from '../services/notification.service.js'

// Schedule meal reminders
// Breakfast: 8:00 AM
// Lunch: 12:00 PM
// Dinner: 7:00 PM

export const startDietJobs = () => {
  // Breakfast reminder - 8:00 AM daily
  cron.schedule('0 8 * * *', async () => {
    try {
      const users = await User.find({ 'preferences.notifications.email': true })
      
      for (const user of users) {
        await sendMealReminder(user, 'breakfast')
      }
      
      console.log('Breakfast reminders sent')
    } catch (error) {
      console.error('Breakfast reminder job error:', error)
    }
  })

  // Lunch reminder - 12:00 PM daily
  cron.schedule('0 12 * * *', async () => {
    try {
      const users = await User.find({ 'preferences.notifications.email': true })
      
      for (const user of users) {
        await sendMealReminder(user, 'lunch')
      }
      
      console.log('Lunch reminders sent')
    } catch (error) {
      console.error('Lunch reminder job error:', error)
    }
  })

  // Dinner reminder - 7:00 PM daily
  cron.schedule('0 19 * * *', async () => {
    try {
      const users = await User.find({ 'preferences.notifications.email': true })
      
      for (const user of users) {
        await sendMealReminder(user, 'dinner')
      }
      
      console.log('Dinner reminders sent')
    } catch (error) {
      console.error('Dinner reminder job error:', error)
    }
  })

  console.log('Diet reminder jobs started')
}

