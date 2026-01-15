const API_URL = "http://64.188.67.171:3000";

exports.handler = async (event, context) => {
  // Получаем путь из запроса
  let path = event.path;

  // Убираем префикс функции
  if (path.startsWith('/.netlify/functions/proxy')) {
    path = path.replace('/.netlify/functions/proxy', '');
  }

  // Собираем URL для API
  const targetUrl = new URL(path, API_URL);

  // Добавляем query параметры
  if (event.queryStringParameters) {
    Object.keys(event.queryStringParameters).forEach(key => {
      targetUrl.searchParams.append(key, event.queryStringParameters[key]);
    });
  }

  try {
    // Делаем запрос к вашему API
    const response = await fetch(targetUrl.toString(), {
      method: event.httpMethod,
      headers: {
        'X-API-Key': event.headers['x-api-key'] || '',
        'Content-Type': 'application/json'
      }
    });

    // Проверяем тип контента
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('image/')) {
      // Для изображений возвращаем бинарные данные
      const imageBuffer = await response.arrayBuffer();
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        },
        body: Buffer.from(imageBuffer).toString('base64'),
        isBase64Encoded: true
      };
    } else {
      // Для JSON возвращаем как есть
      const data = await response.text();
      return {
        statusCode: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: data
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
