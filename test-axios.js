const axios = require('axios');
const api = axios.create({ baseURL: 'http://localhost:8000/v1' });
console.log(api.getUri({ url: '/v2/notifications' }));
