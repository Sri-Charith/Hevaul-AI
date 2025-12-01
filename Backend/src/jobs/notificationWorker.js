import Notification from '../models/Notification.js'
import User from '../models/User.js'
import { sendEmailNotification } from '../services/notification.service.js'

const PROCESS_INTERVAL = 60000 // Check every minute (adjust as needed)

export const startNotificationWorker = () => {
    console.log('Starting Notification Worker...')

    // Run immediately on start
    processPendingNotifications()

    // Then run on interval
    setInterval(processPendingNotifications, PROCESS_INTERVAL)
}

const processPendingNotifications = async () => {
    try {
        // Find pending notifications
        // Limit to batch size to avoid overwhelming
        const pendingNotifications = await Notification.find({ status: 'pending' })
            .sort({ createdAt: 1 })
            .limit(10)
            .populate('user', 'email name preferences')

        if (pendingNotifications.length === 0) {
            return
        }

        console.log(`[NotificationWorker] Found ${pendingNotifications.length} pending notifications`)

        for (const notification of pendingNotifications) {
            await processNotification(notification)
        }
    } catch (error) {
        console.error('[NotificationWorker] Error processing notifications:', error)
    }
}

const processNotification = async (notification) => {
    try {
        const { user, type, title, message, metadata } = notification

        if (!user) {
            console.error(`[NotificationWorker] User not found for notification ${notification._id}`)
            notification.status = 'failed'
            notification.error = 'User not found'
            await notification.save()
            return
        }

        // Check user preferences
        // For now, assuming all calorie alerts are email enabled if global email pref is on
        // You might want to add granular checks here based on 'type'
        if (!user.preferences?.notifications?.email) {
            console.log(`[NotificationWorker] Email disabled for user ${user.email}. Skipping.`)
            notification.status = 'sent' // Marked as sent (handled) even if not emailed, or could be 'skipped'
            notification.error = 'User disabled email notifications'
            await notification.save()
            return
        }

        // Construct email content based on type if needed, or use generic message
        // For calorie alerts, the controller was constructing HTML. 
        // Ideally, the worker should construct HTML to keep controller clean, 
        // but for now we can rely on what's passed or reconstruct it.
        // The controller passed 'message' but not the full HTML in the new design yet.
        // Let's assume the controller will now pass enough info in 'metadata' to reconstruct, 
        // OR we can move the HTML generation here.

        // Let's try to generate HTML here for consistency and cleaner controllers.
        let html = ''
        if (type === 'calorie_limit_daily') {
            const { dailyLimit, dailyTotal } = metadata || {}
            html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #ef4444; margin-top: 0;">⚠️ Daily Calorie Limit Exceeded</h2>
            <p style="color: #374151; font-size: 16px;">Hello ${user.name},</p>
            <p style="color: #374151; font-size: 16px;">You've exceeded your daily calorie limit of <strong>${dailyLimit} kcal</strong>.</p>
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b;"><strong>Current Intake:</strong> ${dailyTotal?.toFixed(0)} kcal</p>
              <p style="margin: 5px 0 0 0; color: #991b1b;"><strong>Over Limit:</strong> ${(dailyTotal - dailyLimit)?.toFixed(0)} kcal</p>
            </div>
            <p style="color: #374151; font-size: 16px;">Please be mindful of your calorie consumption and consider adjusting your meals for the rest of the day.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Best regards,<br>Hevaul AI Team</p>
          </div>
        </div>
       `
        } else if (type === 'calorie_limit_monthly') {
            const { monthlyLimit, monthlyTotal } = metadata || {}
            html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #ef4444; margin-top: 0;">⚠️ Monthly Calorie Limit Exceeded</h2>
            <p style="color: #374151; font-size: 16px;">Hello ${user.name},</p>
            <p style="color: #374151; font-size: 16px;">You've exceeded your monthly calorie limit of <strong>${monthlyLimit} kcal</strong>.</p>
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b;"><strong>Current Intake:</strong> ${monthlyTotal?.toFixed(0)} kcal</p>
              <p style="margin: 5px 0 0 0; color: #991b1b;"><strong>Over Limit:</strong> ${(monthlyTotal - monthlyLimit)?.toFixed(0)} kcal</p>
            </div>
            <p style="color: #374151; font-size: 16px;">Please review your monthly diet plan.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Best regards,<br>Hevaul AI Team</p>
          </div>
        </div>
        `
        } else if (type === 'medication_reminder') {
            const { medicationName, dosage, time } = metadata || {}
            html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #3b82f6; margin-top: 0;">💊 Medication Reminder</h2>
            <p style="color: #374151; font-size: 16px;">Hello ${user.name},</p>
            <p style="color: #374151; font-size: 16px;">It's time to take your medication:</p>
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af; font-size: 18px; font-weight: bold;">${medicationName}</p>
              <p style="margin: 5px 0 0 0; color: #1e40af;"><strong>Dosage:</strong> ${dosage}</p>
              <p style="margin: 5px 0 0 0; color: #1e40af;"><strong>Time:</strong> ${time}</p>
            </div>
            <p style="color: #374151; font-size: 16px;">Please log this dose in the Hevaul AI app once taken.</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/medication" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Log Dose</a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">Best regards,<br>Hevaul AI Team</p>
          </div>
        </div>
        `
        } else {
            // Fallback generic HTML
            html = `<p>${message}</p>`
        }

        console.log(`[NotificationWorker] Sending email to ${user.email} for ${type}`)
        await sendEmailNotification(user.email, title, message, html)

        notification.status = 'sent'
        notification.sentAt = new Date()
        await notification.save()
        console.log(`[NotificationWorker] Notification ${notification._id} sent successfully`)

    } catch (error) {
        console.error(`[NotificationWorker] Failed to process notification ${notification._id}:`, error)
        notification.status = 'failed'
        notification.error = error.message
        await notification.save()
    }
}
