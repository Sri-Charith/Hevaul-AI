import nodemailer from 'nodemailer'

// Create transporter for email notifications
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// @desc    Send email notification
export const sendEmailNotification = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent: ', info.messageId)
    return info
  } catch (error) {
    console.error('Email notification error:', error)
    throw error
  }
}

// @desc    Send medication reminder
export const sendMedicationReminder = async (user, medication) => {
  const subject = `Medication Reminder: ${medication.name}`
  const text = `It's time to take your medication: ${medication.name} (${medication.dosage})`
  const html = `
    <h2>Medication Reminder</h2>
    <p>It's time to take your medication:</p>
    <ul>
      <li><strong>Name:</strong> ${medication.name}</li>
      <li><strong>Dosage:</strong> ${medication.dosage}</li>
    </ul>
  `

  return await sendEmailNotification(user.email, subject, text, html)
}

// @desc    Send water intake reminder
export const sendWaterReminder = async (user) => {
  const subject = 'Water Intake Reminder'
  const text = "Don't forget to drink water! Stay hydrated."
  const html = `
    <h2>Water Intake Reminder</h2>
    <p>Don't forget to drink water! Stay hydrated throughout the day.</p>
  `

  return await sendEmailNotification(user.email, subject, text, html)
}

// @desc    Send meal reminder
export const sendMealReminder = async (user, mealType) => {
  const subject = `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Reminder`
  const text = `Time for ${mealType}! Don't forget to log your meal.`
  const html = `
    <h2>${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Reminder</h2>
    <p>Time for ${mealType}! Don't forget to log your meal.</p>
  `

  return await sendEmailNotification(user.email, subject, text, html)
}

