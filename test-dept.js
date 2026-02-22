const axios = require('http'); // no axios, use fetch

async function test() {
    try {
        const loginRes = await fetch('http://localhost:8000/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'superadmin', password: 'password123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        const unisRes = await fetch('http://localhost:8000/v1/universities', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const unis = await unisRes.json();
        const vnsgu = unis.find(u => u.shortName === 'vnsgu');

        const deptRes = await fetch(`http://localhost:8000/v1/universities/${vnsgu.id}/departments`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Test Dept ' + Date.now(),
                shortName: 'TD' + Date.now().toString().slice(-4),
                hod: 'Test HOD',
                email: 'test@td.com',
                adminUsername: 'admin_td_' + Date.now(),
                adminPassword: 'password123'
            })
        });

        console.log('Status:', deptRes.status);
        if(!deptRes.ok) {
           const body = await deptRes.text();
           console.log('Error Body:', body);
        } else {
           const payload = await deptRes.json();
           console.log('Success Payload:', payload);
        }
    } catch(err) {
        console.error('Network Error:', err.message);
    }
}
test();
