import axios from 'axios'

const API_URL = 'http://localhost:3000/api/exercises'

async function testLocalBackend() {
    try {
        console.log('Testing /bodyparts...')
        const bodyParts = await axios.get(`${API_URL}/bodyparts`)
        console.log('Status:', bodyParts.status)
        console.log('Is Array:', Array.isArray(bodyParts.data))
        console.log('Data (slice):', Array.isArray(bodyParts.data) ? bodyParts.data.slice(0, 3) : bodyParts.data)

    } catch (error) {
        console.error('Full Error:', error.message)
        if (error.response) {
            console.error('Response Status:', error.response.status)
            console.error('Response Data:', error.response.data)
        }
    }
}

testLocalBackend()
