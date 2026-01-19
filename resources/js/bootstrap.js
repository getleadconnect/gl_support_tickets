import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Get the app URL from meta tag (which reads from .env APP_URL)
const metaTag = document.querySelector('meta[name="app-url"]');
const appUrl = metaTag ? metaTag.getAttribute('content') : 'http://127.0.0.1:8000';

// Set base URL for API calls
window.axios.defaults.baseURL = `${appUrl}/api`;

// Log for debugging
console.log('API Base URL:', window.axios.defaults.baseURL);
