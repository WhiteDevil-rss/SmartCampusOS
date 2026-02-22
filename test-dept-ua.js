async function test() {
    try {
        const fetch = globalThis.fetch;
        
        // 1. Login
        const loginRes = await fetch('http://localhost:8000/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin_vnsgu', password: 'password123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        const user = loginData.user;
        
        console.log('Logged in UNI_ADMIN University ID:', user.universityId);

        // 2. Fetch Departments (This works)
        const getRes = await fetch(`http://localhost:8000/v1/universities/${user.universityId}/departments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('GET Departments Status:', getRes.status);

        // 3. Create Department (This fails??)
        const url = `http://localhost:8000/v1/universities/${user.universityId}/departments`;
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

        console.log('POST Department Status:', deptRes.status);
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
