import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Notification from '../src/models/Notification.js'
import User from '../src/models/User.js'

dotenv.config()

const verifyNotification = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected to MongoDB')

        // Find a user
        const user = await User.findOne({ 'preferences.notifications.email': true })
        if (!user) {
            console.error('No user found with email notifications enabled')
            process.exit(1)
        }

        console.log(`Found user: ${user.email}`)

        // Create a pending notification
        const notification = await Notification.create({
            user: user._id,
            type: 'calorie_limit_daily',
            title: 'Verification Test Notification',
            message: 'This is a verification test for the new notification system.',
            metadata: { dailyTotal: 2000, dailyLimit: 1500 },
            status: 'pending'
        })

        console.log(`Created pending notification: ${notification._id}`)

        // Wait for worker to pick it up (worker runs every 60s, but also on start. 
        // Since this script is separate from the server, the server's worker should pick it up if the server is running.
        // If the server is NOT running, this test will fail (timeout).
        // We'll wait up to 70 seconds.

        console.log('Waiting for worker to process (up to 70s)...')

        const checkInterval = 2000
        const maxAttempts = 35 // 70s
        let attempts = 0

        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, checkInterval))

            const updatedNotification = await Notification.findById(notification._id)
            if (updatedNotification.status === 'sent') {
                console.log('SUCCESS: Notification processed and marked as sent!')
                console.log(`Sent At: ${updatedNotification.sentAt}`)
                break
            } else if (updatedNotification.status === 'failed') {
                console.error('FAILURE: Notification marked as failed.')
                console.error(`Error: ${updatedNotification.error}`)
                break
            }

            process.stdout.write('.')
            attempts++
        }

        if (attempts >= maxAttempts) {
            console.error('\nTIMEOUT: Notification was not processed in time. Is the server running?')
        }

        await Notification.deleteOne({ _id: notification._id }) // Cleanup
        console.log('\nTest notification cleaned up.')

    } catch (error) {
        console.error('Error:', error)
    } finally {
        await mongoose.disconnect()
        process.exit(0)
    }
}

verifyNotification()
