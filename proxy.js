// proxy.js
const API_BASE_URL = 'http://64.188.67.171:3000';

async function proxyRequest(endpoint, options = {}) {
    try {
        // Получаем API ключ из localStorage
        const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
        
        // Для GitHub Pages используем CORS прокси для HTTP запросов
        let url;
        if (window.location.protocol === 'https:') {
            // Используем CORS прокси для HTTPS страниц
            url = `https://corsproxy.io/?${encodeURIComponent(API_BASE_URL + endpoint)}`;
        } else {
            // Для HTTP страниц используем прямой запрос
            url = API_BASE_URL + endpoint;
        }
        
        console.log('Proxy request to:', url);
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json',
                ...options.headers
            },
            mode: 'cors'
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

// Экспортируем функции для использования
window.ArtProxy = {
    // Получить арты с пагинацией
    getArts: async (limit = 10, offset = 0) => {
        return await proxyRequest(`/api/arts?limit=${limit}&offset=${offset}`);
    },
    
    // Получить случайный арт
    getRandomArt: async () => {
        return await proxyRequest('/api/arts/random');
    },
    
    // Получить URL изображения арта
    getArtImageUrl: (artId) => {
        const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
        
        // Для изображений тоже используем CORS прокси если нужно
        if (window.location.protocol === 'https:') {
            return `https://corsproxy.io/?${encodeURIComponent(`${API_BASE_URL}/api/arts/${artId}/image?api_key=${apiKey}`)}`;
        } else {
            return `${API_BASE_URL}/api/arts/${artId}/image?api_key=${apiKey}`;
        }
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

console.log('ArtProxy loaded successfully');
