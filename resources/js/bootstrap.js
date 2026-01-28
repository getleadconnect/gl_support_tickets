import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Use /api as base URL for all API calls
window.axios.defaults.baseURL = '/api';

// Log for debugging
console.log('API Base URL:', window.axios.defaults.baseURL);
