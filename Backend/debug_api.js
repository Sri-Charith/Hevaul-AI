import axios from 'axios'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '.env') })

const BASE_URL = process.env.BASE_URL || 'https://exercisedb-api1.p.rapidapi.com/api/v1'
const API_KEY = process.env.RAPID_API_KEY
const API_HOST = process.env.RAPID_API_HOST || 'exercisedb-api1.p.rapidapi.com'

console.log('Using Config:')
console.log('BASE_URL:', BASE_URL)
console.log('API_HOST:', API_HOST)

async function fetchExercise() {
    try {
        const url = `${BASE_URL}/exercises/exr_41n2hxnFMotsXTj3`
        console.log(`Fetching: ${url}`)

        const response = await axios.get(url, {
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': API_HOST
            }
        })

        console.log('Response Status:', response.status)
        const rootKeys = Object.keys(response.data)
        console.log('Root Keys:', rootKeys)

        let exercise = null
        if (response.data.data) {
            console.log('Found "data" property.')
            exercise = response.data.data
        } else if (response.data.id || response.data.exerciseId) {
            console.log('Response seems to be the exercise object directly.')
            exercise = response.data
        }

        if (exercise) {
            console.log('Exercise Keys:', Object.keys(exercise))
            console.log('gifUrl:', exercise.gifUrl)
            console.log('videoUrl:', exercise.videoUrl)
            console.log('imageUrl:', exercise.imageUrl)
            console.log('videos:', exercise.videos)
        } else {
            console.log('Could not identify exercise object.')
            console.log('Full Response:', JSON.stringify(response.data, null, 2))
        }

    } catch (error) {
        console.error('Error fetching exercise:')
        if (error.response) {
            console.error('Status:', error.response.status)
            console.error('Data:', JSON.stringify(error.response.data, null, 2))
        } else {
            console.error(error.message)
        }
    }
}

fetchExercise()
