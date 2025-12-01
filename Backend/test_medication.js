const API_URL = 'http://localhost:3000/api';
let token = '';
let medId = '';

const login = async () => {
    try {
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';

        // Register
        await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test User', email, password })
        });

        // Login
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        token = data.token;
        console.log('Login successful');
    } catch (error) {
        console.error('Login failed:', error.message);
        process.exit(1);
    }
};

const createMedication = async () => {
    try {
        const res = await fetch(`${API_URL}/medication`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Test Med',
                cause: 'Headache',
                dosage: '1 tablet',
                type: 'Tablet',
                frequency: 'daily',
                times: ['08:00'],
                startDate: new Date(),
                totalQuantity: 10
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        medId = data._id;
        console.log('Create Medication successful:', medId);
    } catch (error) {
        console.error('Create Medication failed:', error.message);
    }
};

const logDose = async () => {
    try {
        const res = await fetch(`${API_URL}/medication/${medId}/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                status: 'taken',
                scheduledTime: new Date()
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        console.log('Log Dose successful');
    } catch (error) {
        console.error('Log Dose failed:', error.message);
    }
};

const getStats = async () => {
    try {
        const res = await fetch(`${API_URL}/medication/stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        console.log('Get Stats successful:', data);
    } catch (error) {
        console.error('Get Stats failed:', error.message);
    }
};

const run = async () => {
    await login();
    await createMedication();
    await logDose();
    await getStats();
};

run();
