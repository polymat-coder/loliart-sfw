// proxy.js - обновленная версия
const API_BASE_URL = 'http://64.188.67.171:3000';

async function proxyRequest(endpoint, options = {}) {
    try {
        const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
        
        // Пробуем несколько CORS прокси
        const corsProxies = [
            'https://api.allorigins.win/raw?url=',
            'https://cors-anywhere.herokuapp.com/',
            'https://thingproxy.freeboard.io/fetch/',
            'https://yacdn.org/proxy/'
        ];
        
        let url;
        let response;
        
        // Пытаемся использовать разные прокси
        for (const proxy of corsProxies) {
            try {
                url = proxy + encodeURIComponent(API_BASE_URL + endpoint);
                console.log('Trying proxy:', proxy);
                
                response = await fetch(url, {
                    ...options,
                    headers: {
                        'X-API-Key': apiKey,
                        'Content-Type': 'application/json',
                        ...options.headers
                    },
                    mode: 'cors'
                });
                
                if (response.ok) {
                    break;
                }
            } catch (proxyError) {
                console.log(`Proxy ${proxy} failed:`, proxyError.message);
                continue;
            }
        }
        
        if (!response || !response.ok) {
            // Если все прокси не сработали, пробуем прямой запрос
            console.log('All proxies failed, trying direct request');
            response = await fetch(API_BASE_URL + endpoint, {
                ...options,
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
        }
        
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

// Обновляем функцию getArtImageUrl
window.ArtProxy = {
    getArts: async (limit = 10, offset = 0) => {
        return await proxyRequest(`/api/arts?limit=${limit}&offset=${offset}`);
    },
    
    getArtImageUrl: (artId) => {
        const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
        
        // Используем один из CORS прокси для изображений
        const proxy = 'https://api.allorigins.win/raw?url=';
        return proxy + encodeURIComponent(`${API_BASE_URL}/api/arts/${artId}/image?api_key=${apiKey}`);
    },
    
    // Получить случайный арт
    getRandomArt: async () => {
        return await proxyRequest('/api/arts/random');
    },
    
    // Получить информацию об арте по ID
    getArtById: async (artId) => {
        return await proxyRequest(`/api/arts/${artId}`);
    },
    
    // Получить статистику API
    getStats: async () => {
        return await proxyRequest('/api/stats');
    }
};

console.log('ArtProxy loaded successfully')
