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

async function testBodyParts() {
    try {
        const response = await apiClient.get('/bodyparts')
        console.log('Is Array:', Array.isArray(response.data))
        console.log('Keys:', Object.keys(response.data))
        if (!Array.isArray(response.data)) {
            console.log('Inner Data Is Array:', Array.isArray(response.data.data))
        }
    } catch (error) {
        console.error(error.message)
    }
}

testBodyParts()
