// proxy.js
const API_BASE_URL = 'http://64.188.67.171:3000';

async function proxyRequest(endpoint, options = {}) {
    try {
        const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
        
        let url;
        const targetUrl = API_BASE_URL + endpoint;
        
        if (window.location.protocol === 'https:') {
            // Вариант 1: Прокси с поддержкой Host header
            // Используйте любой из этих
            const proxies = [
                'https://cors-proxy.htmldriven.com/?url=',
                'https://proxy.cors.sh/',
                'https://corsproxy.org/?',
                'https://api.allorigins.win/raw?url='
            ];
            
            const proxy = proxies[0]; // Первый обычно работает
            url = proxy + encodeURIComponent(targetUrl);
            
            // Для proxy.cors.sh нужен специальный формат
            // url = 'https://proxy.cors.sh/' + targetUrl;
            
        } else {
            url = targetUrl;
        }
        
        console.log('Proxy request to:', url);
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json',
                // Добавляем Host header если прокси его пропускает
                'Host': '64.188.67.171:3000',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Proxy error:', response.status, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Proxy request failed:', error);
        throw error;
    }
}
