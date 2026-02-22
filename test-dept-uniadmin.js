async function test() {
    try {
        const fetch = require('node-fetch');
        
        // 1. Login as the UNI_ADMIN (e.g. admin_vnsgu) created earlier
        const loginRes = await fetch('http://localhost:8000/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin_vnsgu', password: 'password123' })
        });
        
        if (!loginRes.ok) {
            console.log('Login failed:', await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        const user = loginData.user;
        
        console.log('Logged in as UNI_ADMIN. University ID:', user.universityId);

        // 2. Try to create a department using the UNI_ADMIN token
        const url = `http://localhost:8000/v1/universities/${user.universityId}/departments`;
        console.log('Hitting POST', url);
        
        const deptRes = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'UNI_ADMIN Test Dept ' + Date.now(),
                shortName: 'UATD' + Date.now().toString().slice(-4),
                hod: 'Test HOD (UNI_ADMIN)',
                email: 'ua_test@td.com',
                adminUsername: 'admin_uatd_' + Date.now(), 
                adminPassword: 'password123'
            })
        });

        console.log('Status:', deptRes.status);
        if(!deptRes.ok) {
           const body = await deptRes.json();
           console.log('Error Body:', body);
        } else {
           const body = await deptRes.json();
           console.log('Success Payload:', body);
        }
    } catch(err) {
        console.error('Network Error:', err.message);
    }
}
test();
