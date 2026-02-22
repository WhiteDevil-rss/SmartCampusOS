const axios = require('axios');

async function testApi() {
    try {
        console.log("Simulating Timetable Generate Request...");
        
        // Login as Dept Admin
        const loginRes = await axios.post('http://localhost:8000/v1/auth/login', {
            username: 'admin_dcs_vnsgu',
            password: 'password123'
        });
        
        const token = loginRes.data.token;
        const user = loginRes.data.user;
        
        console.log("Logged in as:", user.username, "| Dept ID:", user.entityId);
        
        const payload = {
            departmentId: user.entityId,
            config: {
                startTime: "10:30",
                endTime: "16:00",
                lectureDuration: 120,
                breakDuration: 30,
                breakAfterLecture: 1,
                daysPerWeek: 6,
                lecturesPerDay: 3
            }
        };

        const generateRes = await axios.post(
            `http://localhost:8000/v1/departments/${user.entityId}/timetables/generate`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log("Success:", generateRes.data);

    } catch (e) {
        if (e.response) {
            console.error("API Error Response:", e.response.status);
            console.error(JSON.stringify(e.response.data, null, 2));
        } else {
            console.error("Network Error:", e.message);
        }
    }
}

testApi();
