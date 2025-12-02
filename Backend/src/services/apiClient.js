import axios from 'axios'

const apiClient = axios.create({
    baseURL: process.env.BASE_URL || 'https://exercisedb-api1.p.rapidapi.com/api/v1',
    headers: {
        'X-RapidAPI-Key': process.env.RAPID_API_KEY,
        'X-RapidAPI-Host': process.env.RAPID_API_HOST || 'exercisedb-api1.p.rapidapi.com'
    }
})

// Add a request interceptor to ensure headers are always up to date (in case env vars change at runtime, though rare)
apiClient.interceptors.request.use((config) => {
    config.headers['X-RapidAPI-Key'] = process.env.RAPID_API_KEY
    config.headers['X-RapidAPI-Host'] = process.env.RAPID_API_HOST || 'exercisedb-api1.p.rapidapi.com'
    return config
})

export default apiClient
