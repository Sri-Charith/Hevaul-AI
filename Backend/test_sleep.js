import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
let token = '';
let logId = '';

const register = async () => {
    try {
        await axios.post(`${API_URL}/auth/signup`, {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('Registration successful');
    } catch (error) {
        // Ignore if user already exists
        if (error.response?.status !== 400) {
            console.error('Registration failed:', error.response?.data || error.message);
        } else {
            console.log('User already exists, proceeding to login');
        }
    }
};

const login = async () => {
    try {
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        token = res.data.token;
        console.log('Login successful');
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        process.exit(1);
    }
};

const createLog = async () => {
    try {
        const res = await axios.post(`${API_URL}/sleep`, {
            startTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
            endTime: new Date().toISOString(),
            quality: 'Good',
            mood: '😊',
            notes: 'Test sleep log'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        logId = res.data._id;
        console.log('Create Log: SUCCESS', res.data);
    } catch (error) {
        console.error('Create Log: FAILED', error.response?.data || error.message);
    }
};

const getLogs = async () => {
    try {
        const res = await axios.get(`${API_URL}/sleep`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Get Logs: SUCCESS', res.data.length, 'logs found');
    } catch (error) {
        console.error('Get Logs: FAILED', error.response?.data || error.message);
    }
};

const getStats = async () => {
    try {
        const res = await axios.get(`${API_URL}/sleep/stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Get Stats: SUCCESS', res.data);
    } catch (error) {
        console.error('Get Stats: FAILED', error.response?.data || error.message);
    }
};

const getInsights = async () => {
    try {
        const res = await axios.get(`${API_URL}/sleep/insights`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Get Insights: SUCCESS', res.data);
    } catch (error) {
        console.error('Get Insights: FAILED', error.response?.data || error.message);
    }
};

const deleteLog = async () => {
    try {
        await axios.delete(`${API_URL}/sleep/${logId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Delete Log: SUCCESS');
    } catch (error) {
        console.error('Delete Log: FAILED', error.response?.data || error.message);
    }
};

const runTests = async () => {
    await register();
    await login();
    await createLog();
    await getLogs();
    await getStats();
    await getInsights();
    await deleteLog();
};

runTests();
