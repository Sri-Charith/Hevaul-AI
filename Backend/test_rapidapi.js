import axios from 'axios';

// Configuration from user
const RAPID_API_KEY = 'e2fbeb3ee2msh81e0877315de308p165325jsnf8cb7744a218';
const RAPID_API_HOST = 'exercisedb-api1.p.rapidapi.com';
const BASE_URL = 'https://exercisedb-api1.p.rapidapi.com/api/v1';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST
    }
});

async function testEndpoints() {
    try {
        console.log('Testing GET /exercises...');
        const exercises = await apiClient.get('/exercises', { params: { limit: 5 } });
        const exercisesData = exercises.data.data; // Simulating the service logic
        console.log(`Exercises: ${Array.isArray(exercisesData) ? exercisesData.length : 'Not Array'}`);

        console.log('Testing GET /bodyparts...');
        const bodyParts = await apiClient.get('/bodyparts');
        const bodyPartsData = bodyParts.data.data;
        console.log(`BodyParts: ${Array.isArray(bodyPartsData) ? bodyPartsData.length : 'Not Array'}`);

        console.log('Testing GET /exercises/search?search=push...');
        const search = await apiClient.get('/exercises/search', { params: { search: 'push' } });
        const searchData = search.data.data;
        console.log(`Search Results: ${Array.isArray(searchData) ? searchData.length : 'Not Array'}`);

    } catch (error) {
        console.error('API Error:', error.message);
    }
}

testEndpoints();
