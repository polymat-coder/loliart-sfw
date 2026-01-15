// proxy.js - версия для GitHub Pages
const API_BASE_URL = 'http://64.188.67.171:3000';

async function proxyRequest(endpoint, options = {}) {
    // Для GitHub Pages используем два уровня прокси
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    const encodedUrl = encodeURIComponent(API_BASE_URL + endpoint);
    const url = corsProxy + encodedUrl;
    
    const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
    
    const response = await fetch(url, {
        headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
}

window.ArtProxy = {
    getArts: async (limit = 10, offset = 0) => {
        return await proxyRequest(`/api/arts?limit=${limit}&offset=${offset}`);
    },
    
    getArtImageUrl: (artId) => {
        const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        const encodedUrl = encodeURIComponent(
            `${API_BASE_URL}/api/arts/${artId}/image?api_key=${apiKey}`
        );
        return corsProxy + encodedUrl;
    }
};
