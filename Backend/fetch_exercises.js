import axios from 'axios'
import fs from 'fs/promises'
import path from 'path'
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

const OUTPUT_PATH = path.join(__dirname, '../Frontend/frontend/src/data/exercises.json')

async function fetchAndSaveExercises() {
    try {
        console.log('Fetching exercises from RapidAPI...')
        const response = await apiClient.get('/exercises', {
            params: { limit: 1300 } // Fetch a large batch
        })

        const exercises = Array.isArray(response.data) ? response.data : response.data.data

        if (!exercises || !Array.isArray(exercises)) {
            throw new Error('Invalid data format received from API')
        }

        console.log(`Fetched ${exercises.length} exercises.`)

        // Ensure directory exists
        const dir = path.dirname(OUTPUT_PATH)
        await fs.mkdir(dir, { recursive: true })

        console.log(`Saving to ${OUTPUT_PATH}...`)
        await fs.writeFile(OUTPUT_PATH, JSON.stringify(exercises, null, 2))

        console.log('Done! Exercises saved successfully.')

    } catch (error) {
        console.error('Error:', error.message)
        if (error.response) {
            console.error('Response data:', error.response.data)
        }
    }
}

fetchAndSaveExercises()
