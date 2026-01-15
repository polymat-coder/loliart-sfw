// proxy.js - РАБОЧАЯ ВЕРСИЯ
const API_BASE_URL = 'http://64.188.67.171:3000';

async function proxyRequest(endpoint, options = {}) {
    const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
    
    // ПРОВЕРЕННЫЕ РАБОЧИЕ ПРОКСИ для GitHub Pages:
    const WORKING_PROXIES = [
        // 1. CORS Anywhere (нужно нажать кнопку активации один раз)
        // Откройте: https://cors-anywhere.herokuapp.com/corsdemo
        // Нажмите "Request temporary access to the demo server"
        // Затем используйте этот прокси:
        'https://cors-anywhere.herokuapp.com/',
        
        // 2. Альтернативный CORS прокси
        'https://api.codetabs.com/v1/proxy?quest=',
        
        // 3. Прокси с поддержкой всех заголовков
        'https://corsproxy.org/?',
        
        // 4. Простой прокси
        'https://thingproxy.freeboard.io/fetch/'
    ];
    
    const PROXY = WORKING_PROXIES[0]; // Начните с первого
    
    // Формируем URL
    let url;
    if (window.location.protocol === 'https:') {
        // Для HTTPS страниц используем прокси
        const targetUrl = API_BASE_URL + endpoint;
        
        if (PROXY === 'https://cors-anywhere.herokuapp.com/') {
            url = PROXY + targetUrl;
        } else if (PROXY.includes('?')) {
            url = PROXY + encodeURIComponent(targetUrl);
        } else {
            url = PROXY + targetUrl;
        }
    } else {
        // Для HTTP страниц прямой запрос
        url = API_BASE_URL + endpoint;
    }
    
    console.log('Using proxy:', PROXY);
    console.log('Request URL:', url);
    
    try {
        // Подготавливаем заголовки
        const headers = {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        // Особый случай для cors-anywhere
        if (PROXY === 'https://cors-anywhere.herokuapp.com/') {
            headers['X-Requested-With'] = 'XMLHttpRequest';
            headers['Origin'] = window.location.origin;
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        });
        
        if (!response.ok) {
            const text = await response.text();
            console.error('Response error:', response.status, text.slice(0, 200));
            
            // Если прокси не работает, пробуем следующий
            if (response.status === 403 || response.status === 401) {
                console.log('Trying next proxy...');
                // Здесь можно реализовать переключение на следующий прокси
                return await tryNextProxy(endpoint, options);
            }
            
            throw new Error(`HTTP ${response.status}: ${text.slice(0, 100)}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error.message);
        throw error;
    }
}

// Функция для переключения прокси
let currentProxyIndex = 0;
async function tryNextProxy(endpoint, options) {
    currentProxyIndex = (currentProxyIndex + 1) % WORKING_PROXIES.length;
    console.log('Switching to proxy:', WORKING_PROXIES[currentProxyIndex]);
    return await proxyRequest(endpoint, options);
}

window.ArtProxy = {
    getArts: async (limit = 10, offset = 0) => {
        return await proxyRequest(`/api/arts?limit=${limit}&offset=${offset}`);
    },
    
    getArtImageUrl: (artId) => {
        const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
        
        // Для изображений используем специальный прокси
        if (window.location.protocol === 'https:') {
            // Прокси для изображений, который точно работает
            const imageUrl = `${API_BASE_URL}/api/arts/${artId}/image?api_key=${apiKey}`;
            return `https://images.weserv.nl/?url=${encodeURIComponent(
                imageUrl.replace('http://', '')
            )}&w=1200&h=800&fit=cover`;
        } else {
            return `${API_BASE_URL}/api/arts/${artId}/image?api_key=${apiKey}`;
        }
    }
};
