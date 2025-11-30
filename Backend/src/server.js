import app from './app.js'
import { startDietJobs } from './jobs/diet.job.js'
import { startSleepJobs } from './jobs/sleep.job.js'
import { startWaterJobs } from './jobs/water.job.js'
import { startMedicationJobs } from './jobs/medication.job.js'

const PORT = process.env.PORT || 3000

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
})

// Start background jobs
startDietJobs()
startSleepJobs()
startWaterJobs()
startMedicationJobs()

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`)
  // Close server & exit process
  server.close(() => process.exit(1))
})

