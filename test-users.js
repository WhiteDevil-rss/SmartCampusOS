const axios = require('axios');
async function test() {
    try {
        const loginRes = await axios.post('http://localhost:8000/v1/auth/login', {
            username: 'superadmin',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Got token:', token ? 'Yes' : 'No');

        const usersRes = await axios.get('http://localhost:8000/v1/users', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Users array length:', usersRes.data.length);
        console.log('Sample user:', usersRes.data[0]);
    } catch(err) {
        console.error('Error:', err.message);
        if (err.response) console.error(err.response.data);
    }
}
test();
