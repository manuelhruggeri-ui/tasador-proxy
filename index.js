const http = require('http');
const https = require('https');
const zlib = require('zlib');

const PORT = process.env.PORT || 3000;
const CLIENT_ID = '4526629467812510';
const CLIENT_SECRET = 'aKu4PRG4IWVgFjYbnowXZj1FkHYocB6f';
const REDIRECT_URI = 'https://vermillion-daifuku-30fc6c.netlify.app';
const AUTH_CODE = 'TG-6a1c879e9b51740001d11cea-221242431';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

let cachedToken = null;
let tokenExpiry = 0;

function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname, path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
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
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };
    const opts = { hostname: u.hostname, path: u.pathname + u.search, headers };
    https.get(opts, res => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        const enc = res.headers['content-encoding'];
        if (enc === 'gzip') {
          zlib.gunzip(buf, (e, d) => e ? reject(e) : resolve({ status: res.statusCode, body: d.toString() }));
        } else if (enc === 'br') {
          zlib.brotliDecompress(buf, (e, d) => e ? reject(e) : resolve({ status: res.statusCode, body: d.toString() }));
        } else {
          resolve({ status: res.statusCode, body: buf.toString() });
        }
      });
    }).on('error', reject);
  });
}

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const body = `grant_type=authorization_code&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${AUTH_CODE}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  const r = await httpsPost('https://api.mercadolibre.com/oauth/token', body);
  const data = JSON.parse(r.body);
  if (!data.access_token) throw new Error('Token error: ' + r.body);
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
  return cachedToken;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); res.end(); return; }
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/token-test') {
try {
      const body = `grant_type=authorization_code&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${AUTH_CODE}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
      const r = await httpsPost('https://api.mercadolibre.com/oauth/token', body);
      res.writeHead(200, CORS); res.end(r.body);
    } catch (err) {
      res.writeHead(500, CORS); res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }
  }

  if (url.pathname === '/ml') {
    try {
      const token = await getToken();
      const q = url.searchParams.get('q') || '';
      const limit = url.searchParams.get('limit') || '40';
      const mlUrl = `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(q)}&limit=${limit}&condition=used`;
      const r = await httpsGet(mlUrl, token);
      res.writeHead(r.status, CORS); res.end(r.body);
    } catch (err) {
      res.writeHead(500, CORS); res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (url.pathname === '/dolar') {
    try {
      const r = await httpsGet('https://dolarapi.com/v1/dolares/blue', '');
      res.writeHead(r.status, CORS); res.end(r.body);
    } catch (err) {
      res.writeHead(500, CORS); res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.writeHead(404, CORS); res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => console.log(`Puerto ${PORT}`));
