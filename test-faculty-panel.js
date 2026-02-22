async function test() {
    try {
        const fetch = globalThis.fetch;
        
        // 1. Get a faculty account. In test seed we have faculty_dcs
        const loginRes = await fetch('http://localhost:8000/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'faculty_dcs', password: 'password123' })
        });
        
        if (!loginRes.ok) {
            console.log('Login failed:', await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        const user = loginData.user;
        
        console.log('Logged in FACULTY Entity ID:', user.entityId);

        // 2. Fetch the assigned faculty data by ID (simulating the page.tsx fetch)
        const url = `http://localhost:8000/v1/faculty/${user.entityId}`;
        const facultyRes = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('GET Faculty By ID Status:', facultyRes.status);
        if(!facultyRes.ok) {
           const body = await facultyRes.json();
           console.log('Error Body:', body);
        } else {
           const body = await facultyRes.json();
           console.log('Success Payload:', body);
        }
    } catch(err) {
        console.error('Network Error:', err.message);
    }
}
test();
