import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import connectDB from './config/db.js'

// Import routes
import authRoutes from './routes/auth.routes.js'
import dietRoutes from './routes/diet.routes.js'
import sleepRoutes from './routes/sleep.routes.js'
import waterRoutes from './routes/water.routes.js'
import medicationRoutes from './routes/medication.routes.js'
import aiRoutes from './routes/ai.routes.js'



// Connect to database
connectDB()

// Initialize express app
const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/diet', dietRoutes)
app.use('/api/sleep', sleepRoutes)
app.use('/api/water', waterRoutes)
app.use('/api/medication', medicationRoutes)
app.use('/api/ai', aiRoutes)

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  })
})

export default app

