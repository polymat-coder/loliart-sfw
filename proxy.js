// proxy.js - ИСПРАВЛЕННАЯ ВЕРСИЯ ДЛЯ GITHUB PAGES
const API_BASE_URL = 'http://64.188.67.171:3000';

// Список проверенных рабочих прокси
const PROXY_SERVERS = [
    {
        name: 'cors-anywhere',
        url: 'https://cors-anywhere.herokuapp.com/',
        needsActivation: true,
        activationUrl: 'https://cors-anywhere.herokuapp.com/corsdemo'
    },
    {
        name: 'codetabs',
        url: 'https://api.codetabs.com/v1/proxy?quest=',
        needsActivation: false
    },
    {
        name: 'corsproxy',
        url: 'https://corsproxy.org/?',
        needsActivation: false
    }
];

let currentProxyIndex = 0;

async function proxyRequest(endpoint, options = {}) {
    const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
    const proxy = PROXY_SERVERS[currentProxyIndex];
    
    console.log(`Using proxy: ${proxy.name}`);
    
    // Формируем полный URL API
    const targetUrl = API_BASE_URL + endpoint;
    let finalUrl;
    
    if (window.location.protocol === 'https:') {
        // Для HTTPS страниц используем прокси
        if (proxy.url.includes('?')) {
            finalUrl = proxy.url + encodeURIComponent(targetUrl);
        } else {
            finalUrl = proxy.url + targetUrl;
        }
    } else {
        // Для HTTP страниц прямой запрос
        finalUrl = targetUrl;
    }
    
    console.log('Request URL:', finalUrl);
    
    // Подготавливаем заголовки
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Добавляем API ключ в заголовки, но не для всех прокси
    if (!proxy.url.includes('corsproxy.org')) {
        headers['X-API-Key'] = apiKey;
    }
    
    // Особые заголовки для cors-anywhere
    if (proxy.name === 'cors-anywhere') {
        headers['X-Requested-With'] = 'XMLHttpRequest';
    }
    
    try {
        const response = await fetch(finalUrl, {
            method: options.method || 'GET',
            headers: headers,
            mode: 'cors',
            cache: 'no-cache'
        });
        
        // Если прокси требует активации
        if (response.status === 401 && proxy.needsActivation) {
            showProxyActivationNotice(proxy.activationUrl);
            throw new Error(`Proxy requires activation. Please visit: ${proxy.activationUrl}`);
        }
        
        // Если прокси не работает, пробуем следующий
        if (!response.ok) {
            console.warn(`Proxy ${proxy.name} failed with status ${response.status}`);
            
            if (currentProxyIndex < PROXY_SERVERS.length - 1) {
                currentProxyIndex++;
                console.log(`Trying next proxy: ${PROXY_SERVERS[currentProxyIndex].name}`);
                return await proxyRequest(endpoint, options);
            }
            
            throw new Error(`All proxies failed. Last status: ${response.status}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error(`Proxy ${proxy.name} error:`, error.message);
        
        // Пробуем следующий прокси
        if (currentProxyIndex < PROXY_SERVERS.length - 1) {
            currentProxyIndex++;
            console.log(`Switching to proxy: ${PROXY_SERVERS[currentProxyIndex].name}`);
            return await proxyRequest(endpoint, options);
        }
        
        throw error;
    }
}

// Функция для показа уведомления об активации прокси
function showProxyActivationNotice(url) {
    const notice = document.createElement('div');
    notice.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 15px;
        border-radius: 10px;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    `;
    
    notice.innerHTML = `
        <strong>Внимание!</strong>
        <p>Для работы прокси требуется активация.</p>
        <a href="${url}" target="_blank" style="color: white; text-decoration: underline;">
            Нажмите здесь для активации
        </a>
        <p style="font-size: 12px; margin-top: 10px;">
            После активации обновите страницу
        </p>
    `;
    
    document.body.appendChild(notice);
    
    // Автоматическое удаление через 30 секунд
    setTimeout(() => {
        if (notice.parentNode) {
            notice.parentNode.removeChild(notice);
        }
    }, 30000);
}

// Специальная функция для изображений
function getProxiedImageUrl(artId) {
    const apiKey = localStorage.getItem('loli_api_key') || 'bfd863c403dc5af6c02bd0ec3ea243c0';
    const imageUrl = `${API_BASE_URL}/api/arts/${artId}/image?api_key=${apiKey}`;
    
    // Для HTTPS страниц используем прокси для изображений
    if (window.location.protocol === 'https:') {
        // Используем images.weserv.nl - надежный прокси для изображений
        return `https://images.weserv.nl/?url=${encodeURIComponent(
            imageUrl.replace('http://', '')
        )}&w=1200&h=800&fit=cover&output=webp`;
    }
    
    return imageUrl;
}

// Экспортируем функции
window.ArtProxy = {
    getArts: async (limit = 10, offset = 0) => {
        return await proxyRequest(`/api/arts?limit=${limit}&offset=${offset}`);
    },
    
    getRandomArt: async () => {
        return await proxyRequest('/api/arts/random');
    },
    
    getArtImageUrl: getProxiedImageUrl,
    
    getArtById: async (artId) => {
        return await proxyRequest(`/api/arts/${artId}`);
    },
    
    getStats: async () => {
        return await proxyRequest('/api/stats');
    },
    
    // Функция для ручного переключения прокси
    switchProxy: () => {
        currentProxyIndex = (currentProxyIndex + 1) % PROXY_SERVERS.length;
        console.log(`Switched to proxy: ${PROXY_SERVERS[currentProxyIndex].name}`);
        return PROXY_SERVERS[currentProxyIndex].name;
    },
    
    // Получить текущий прокси
    getCurrentProxy: () => {
        return PROXY_SERVERS[currentProxyIndex];
    }
};

console.log('ArtProxy loaded. Current proxy:', PROXY_SERVERS[currentProxyIndex].name);
