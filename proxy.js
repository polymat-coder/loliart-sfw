// proxy.js
const API_BASE_URL = 'http://64.188.67.171:3000';

// JSONP для API запросов
async function jsonpProxy(endpoint) {
    return new Promise((resolve, reject) => {
        const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
        const callbackName = 'jsonp_callback_' + Date.now();
        
        // Создаем endpoint с JSONP callback
        const jsonpEndpoint = `${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${apiKey}&callback=${callbackName}`;
        const fullUrl = API_BASE_URL + jsonpEndpoint;
        
        // Создаем script тег
        const script = document.createElement('script');
        script.src = fullUrl;
        
        // Добавляем callback функцию в window
        window[callbackName] = (data) => {
            delete window[callbackName];
            document.body.removeChild(script);
            resolve(data);
        };
        
        script.onerror = () => {
            delete window[callbackName];
            document.body.removeChild(script);
            reject(new Error('JSONP request failed'));
        };
        
        document.body.appendChild(script);
    });
}

// Для изображений используем простой прокси
function getProxyImageUrl(url) {
    // Используем публичный прокси для изображений
    return `https://images.weserv.nl/?url=${encodeURIComponent(url.replace('http://', ''))}`;
}

window.ArtProxy = {
    getArts: async (limit = 10, offset = 0) => {
        try {
            // Пробуем JSONP если на HTTPS
            if (window.location.protocol === 'https:') {
                return await jsonpProxy(`/api/arts?limit=${limit}&offset=${offset}`);
            } else {
                // Прямой запрос для HTTP
                const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
                const response = await fetch(`${API_BASE_URL}/api/arts?limit=${limit}&offset=${offset}`, {
                    headers: { 'X-API-Key': apiKey }
                });
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to fetch arts:', error);
            throw error;
        }
    },
    
    getArtImageUrl: (artId) => {
        const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
        const imageUrl = `${API_BASE_URL}/api/arts/${artId}/image?api_key=${apiKey}`;
        
        // Для HTTPS страниц используем прокси для изображений
        if (window.location.protocol === 'https:') {
            return getProxyImageUrl(imageUrl);
        }
        
        return imageUrl;
    }
};
