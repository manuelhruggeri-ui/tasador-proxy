const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;
const CLIENT_ID = '4526629467812510';
const CLIENT_SECRET = 'aKu4PRG4IWVgFjYbnowXZj1FkHYocB6f';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname, path: u.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(opts, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

function httpsGet(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname, path: u.pathname + u.search,
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
    };
    https.get(opts, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    }).on('error', reject);
  });
}

function httpsGetSimple(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    }).on('error', reject);
  });
}

async function getToken() {
  const body = `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
  const r = await httpsPost('https://api.mercadolibre.com/oauth/token', body);
  const data = JSON.parse(r.body);
  return data.access_token;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); res.end(); return; }
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/') {
    res.writeHead(200, CORS); res.end(JSON.stringify({ status: 'ok' })); return;
  }

  if (url.pathname === '/ml') {
    try {
      const token = await getToken();
      const q = url.searchParams.get('q') || '';
      const limit = url.searchParams.get('limit') || '40';
      const mlUrl = `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(q)}&limit=${limit}`;
      const r = await httpsGet(mlUrl, token);
      res.writeHead(r.status, CORS); res.end(r.body);
    } catch (err) {
      res.writeHead(500, CORS); res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (url.pathname === '/dolar') {
    try {
      const r = await httpsGetSimple('https://dolarapi.com/v1/dolares/blue');
      res.writeHead(r.status, CORS); res.end(r.body);
    } catch (err) {
      res.writeHead(500, CORS); res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.writeHead(404, CORS); res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => console.log(`Puerto ${PORT}`));
