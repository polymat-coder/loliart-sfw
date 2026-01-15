// proxy.js
const API_BASE_URL = 'http://64.188.67.171:3000';

async function proxyRequest(endpoint, options = {}) {
    try {
        const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
        
        let url;
        const targetUrl = API_BASE_URL + endpoint;
        
        if (window.location.protocol === 'https:') {
            // Вариант A: CORS Anywhere (нужна временная активация)
            url = `https://cors-anywhere.herokuapp.com/${targetUrl}`;
            
            // ИЛИ Вариант B: Другой прокси
            // url = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
            
        } else {
            url = targetUrl;
        }
        
        console.log('Proxy request to:', url);
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest', // Некоторые прокси требуют это
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        // Если используем api.allorigins.win, нужно распарсить ответ
        if (url.includes('api.allorigins.win')) {
            const data = await response.json();
            return JSON.parse(data.contents);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Proxy request failed:', error);
        throw error;
    }
}
