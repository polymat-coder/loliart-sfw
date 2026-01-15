// proxy.js
async function proxyRequest(endpoint, options = {}) {
    const baseUrl = 'http://64.188.67.171:3000';
    const url = `${baseUrl}${endpoint}`;
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'X-API-Key': localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0',
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Proxy request failed:', error);
        throw error;
    }
}

// Экспортируем функции для использования
window.ArtProxy = {
    getArts: async (limit = 10, offset = 0) => {
        return await proxyRequest(`/api/arts?limit=${limit}&offset=${offset}`);
    },
    
    getRandomArt: async () => {
        return await proxyRequest('/api/arts/random');
    },
    
    getArtImageUrl: (artId) => {
        const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
        return `https://corsproxy.io/?http://64.188.67.171:3000/api/arts/${artId}/image?api_key=${apiKey}`;
    }
};
