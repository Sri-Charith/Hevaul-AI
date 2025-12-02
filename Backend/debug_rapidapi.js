import axios from 'axios'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '.env') })

const apiClient = axios.create({
    baseURL: process.env.BASE_URL,
    headers: {
        'X-RapidAPI-Key': process.env.RAPID_API_KEY,
        'X-RapidAPI-Host': process.env.RAPID_API_HOST
    }
})

async function testEndpoints() {
    try {
        console.log('Testing /bodyparts...')
        const bodyParts = await apiClient.get('/bodyparts')
        console.log('BodyParts Type:', Array.isArray(bodyParts.data) ? 'Array' : typeof bodyParts.data)
        console.log('BodyParts Data (slice):', Array.isArray(bodyParts.data) ? bodyParts.data.slice(0, 3) : bodyParts.data)

        console.log('\nTesting /equipments...')
        const equipments = await apiClient.get('/equipments')
        console.log('Equipments Type:', Array.isArray(equipments.data) ? 'Array' : typeof equipments.data)

        console.log('\nTesting /exercises (limit=1)...')
        const exercises = await apiClient.get('/exercises?limit=1')
        console.log('Exercises Data Keys:', Object.keys(exercises.data))

    } catch (error) {
        console.error('Error:', error.message)
        if (error.response) {
            console.error('Response data:', error.response.data)
        }
    }
}

testEndpoints()
