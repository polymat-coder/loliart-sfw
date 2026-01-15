// proxy.js
const API_BASE_URL = 'http://64.188.67.171:3000';

async function proxyRequest(endpoint, options = {}) {
    try {
        const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
        
        // Пробуем разные CORS-прокси
        const corsProxies = [
            `https://api.allorigins.win/raw?url=${encodeURIComponent(API_BASE_URL + endpoint)}`,
            `https://cors-anywhere.herokuapp.com/${API_BASE_URL + endpoint}`,
            `https://thingproxy.freeboard.io/fetch/${API_BASE_URL + endpoint}`,
            `https://proxy.cors.sh/${API_BASE_URL + endpoint}`
        ];
        
        let response;
        let lastError;
        
        // Пробуем каждый прокси по очереди
        for (const proxyUrl of corsProxies) {
            try {
                console.log('Trying proxy:', proxyUrl);
                
                response = await fetch(proxyUrl, {
                    ...options,
                    headers: {
                        'X-API-Key': apiKey,
                        'Content-Type': 'application/json',
                        ...options.headers
                    },
                    mode: 'cors'
                });
                
                if (response.ok) {
                    return await response.json();
                } else {
                    console.warn(`Proxy failed with status ${response.status}`);
                    lastError = new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                console.warn('Proxy request failed:', error);
                lastError = error;
                continue; // Пробуем следующий прокси
            }
        }
        
        // Если все прокси не сработали, пробуем напрямую через No-CORS
        console.log('All proxies failed, trying direct with no-cors...');
        try {
            response = await fetch(API_BASE_URL + endpoint, {
                ...options,
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                mode: 'no-cors' // Пробуем режим no-cors
            });
            
            // В режиме no-cors мы не можем прочитать ответ
            // Но если сервер поддерживает CORS, это может сработать
            console.log('No-cors request sent (response cannot be read)');
            throw new Error('Server may not support CORS. Try running from localhost.');
        } catch (finalError) {
            throw lastError || finalError;
        }
        
    } catch (error) {
        console.error('All proxy attempts failed:', error);
        throw error;
    }
}

// Обновляем функцию getArtImageUrl
window.ArtProxy = {
    getArts: async (limit = 10, offset = 0) => {
        return await proxyRequest(`/api/arts?limit=${limit}&offset=${offset}`);
    },
    
    getRandomArt: async () => {
        return await proxyRequest('/api/arts/random');
    },
    
    getArtImageUrl: (artId) => {
        const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
        
        // Используем другой подход для изображений
        // Пробуем разные прокси для изображений
        const imageUrl = `${API_BASE_URL}/api/arts/${artId}/image?api_key=${apiKey}`;
        
        // Возвращаем URL через рабочий прокси
        return `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}&w=1200&h=800&fit=cover`;
    },
    
    getArtById: async (artId) => {
        return await proxyRequest(`/api/arts/${artId}`);
    },
    
    getStats: async () => {
        return await proxyRequest('/api/stats');
    }
};
