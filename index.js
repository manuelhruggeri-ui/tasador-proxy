const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Health check
  if (url.pathname === '/') {
    res.writeHead(200, CORS_HEADERS);
    res.end(JSON.stringify({ status: 'ok', service: 'tasador-proxy' }));
    return;
  }

  // Proxy MercadoLibre
  if (url.pathname === '/ml') {
    const q = url.searchParams.get('q') || '';
    const limit = url.searchParams.get('limit') || '40';
    const mlUrl = `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(q)}&limit=${limit}&condition=used`;
    try {
      const result = await fetchUrl(mlUrl);
      res.writeHead(result.status, CORS_HEADERS);
      res.end(result.body);
    } catch (err) {
      res.writeHead(500, CORS_HEADERS);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Proxy Dolar
  if (url.pathname === '/dolar') {
    try {
      const result = await fetchUrl('https://dolarapi.com/v1/dolares/blue');
      res.writeHead(result.status, CORS_HEADERS);
      res.end(result.body);
    } catch (err) {
      res.writeHead(500, CORS_HEADERS);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.writeHead(404, CORS_HEADERS);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Proxy corriendo en puerto ${PORT}`);
});
