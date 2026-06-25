<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tasador de Vehículos AR</title>
    <meta name="theme-color" content="#0f1115">
    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" href="icons/icon-192.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0f1115;
            --card: #1a1d23;
            --border: #2a2d35;
            --text: #e4e6eb;
            --text-muted: #8b8e94;
            --green: #00e5a0;
            --amber: #f5a623;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: 'DM Sans', sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        h1 { font-size: 24px; margin-bottom: 20px; color: var(--green); }
        h2 { font-size: 18px; margin: 30px 0 15px; color: var(--text); border-bottom: 1px solid var(--border); padding-bottom: 10px; }
        .mono { font-family: 'DM Mono', monospace; }
        
        .card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin-bottom: 20px; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .form-group { display: flex; flex-direction: column; }
        .form-group.full { grid-column: span 2; }
        label { font-size: 12px; margin-bottom: 5px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        input, select {
            background: var(--bg); border: 1px solid var(--border); color: var(--text);
            padding: 12px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 16px;
        }
        input:focus, select:focus { outline: none; border-color: var(--green); }
        
        button {
            background: var(--green); color: #000; border: none; padding: 16px;
            border-radius: 8px; font-size: 16px; font-weight: 700; width: 100%;
            cursor: pointer; margin-top: 20px; transition: background 0.2s;
        }
        button:hover { background: #00ffb3; }
        button:disabled { background: var(--border); color: var(--text-muted); cursor: not-allowed; }

        .dolar-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 14px; color: var(--text-muted); }
        .dolar-price { color: var(--amber); font-weight: 700; }

        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .stat-box { background: var(--bg); padding: 15px; border-radius: 8px; border: 1px solid var(--border); }
        .stat-title { font-size: 12px; color: var(--text-muted); margin-bottom: 5px; text-transform: uppercase; }
        .stat-value { font-size: 18px; font-weight: 700; }
        .permuta { color: var(--amber); }

        .dist-bar-container { margin-bottom: 8px; }
        .dist-bar-label { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
        .dist-bar-bg { background: var(--bg); height: 8px; border-radius: 4px; overflow: hidden; }
        .dist-bar-fill { background: var(--green); height: 100%; border-radius: 4px; }

        .listing { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .listing:last-child { border-bottom: none; }
        .listing-info h3 { font-size: 14px; font-weight: 500; }
        .listing-info p { font-size: 12px; color: var(--text-muted); }
        .listing-price { font-family: 'DM Mono', monospace; color: var(--green); font-weight: 700; text-align: right; }
        .listing-link { font-size: 10px; color: var(--text-muted); text-decoration: none; margin-top: 4px; display: inline-block; }
        .listing-link:hover { color: var(--green); }

        .loader { text-align: center; padding: 40px; color: var(--text-muted); }
        .spinner { border: 3px solid var(--border); border-top: 3px solid var(--green); border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 15px; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .hidden { display: none; }

        @media (max-width: 500px) {
            .form-grid { grid-template-columns: 1fr; }
            .form-group.full { grid-column: span 1; }
        }
    </style>
</head>
<body>

    <h1>Tasador de Vehículos AR</h1>
    
    <div class="card">
        <div class="dolar-info">
            <span>Dólar Blue (Referencia)</span>
            <span class="dolar-price mono" id="dolarRef">$ --</span>
        </div>
        
        <form id="searchForm">
            <div class="form-grid">
                <div class="form-group">
                    <label>Marca</label>
                    <input type="text" id="marca" placeholder="Ej: Toyota" required>
                </div>
                <div class="form-group">
                    <label>Modelo</label>
                    <input type="text" id="modelo" placeholder="Ej: Corolla" required>
                </div>
                <div class="form-group">
                    <label>Año</label>
                    <input type="number" id="anio" placeholder="Ej: 2020" required>
                </div>
                <div class="form-group">
                    <label>Transmisión</label>
                    <select id="transmision">
                        <option value="">Indistinto</option>
                        <option value="manual">Manual</option>
                        <option value="automatica">Automática</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Km Desde</label>
                    <input type="number" id="kmDesde" placeholder="0">
                </div>
                <div class="form-group">
                    <label>Km Hasta</label>
                    <input type="number" id="kmHasta" placeholder="200000">
                </div>
            </div>
            <button type="submit" id="btnSearch">Tasar Vehículo</button>
        </form>
    </div>

    <div id="loader" class="loader hidden">
        <div class="spinner"></div>
        <p class="mono" id="loaderText">Conectando con MercadoLibre...</p>
    </div>

    <div id="results" class="hidden">
        <div class="card">
            <h2>Resultados del Análisis</h2>
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-title">Precio Promedio</div>
                    <div class="stat-value mono" id="promArs">$ --</div>
                    <div class="stat-value mono" style="font-size: 14px; color: var(--text-muted);" id="promUsd">U$S --</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title permuta">Valor Permuta (-20%)</div>
                    <div class="stat-value mono permuta" id="permArs">$ --</div>
                    <div class="stat-value mono permuta" style="font-size: 14px;" id="permUsd">U$S --</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Mediana</div>
                    <div class="stat-value mono" id="medianaArs">$ --</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Moda</div>
                    <div class="stat-value mono" id="modaArs">$ --</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>Distribución de Precios</h2>
            <div id="distribution"></div>
        </div>

        <div class="card">
            <h2>Publicaciones Encontradas (<span id="countListings">0</span>)</h2>
            <div id="listings"></div>
        </div>
    </div>

    <script>
        let dolarBlue = 0;

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(err => console.log('SW error:', err));
        }

        async function fetchDolar() {
            try {
                const res = await fetch('https://dolarapi.com/v1/dolares/blue');
                const data = await res.json();
                dolarBlue = (data.compra + data.venta) / 2; 
                document.getElementById('dolarRef').textContent = `$ ${dolarBlue.toFixed(0)}`;
            } catch (err) {
                console.error('Error fetching dolar:', err);
                document.getElementById('dolarRef').textContent = 'Error';
            }
        }
        fetchDolar();

        document.getElementById('searchForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            document.getElementById('loader').classList.remove('hidden');
            document.getElementById('results').classList.add('hidden');
            
            const marca = document.getElementById('marca').value.trim().toLowerCase().replace(/\s/g, '-');
            const modelo = document.getElementById('modelo').value.trim().toLowerCase().replace(/\s/g, '-');
            const anio = document.getElementById('anio').value.trim();
            
            let urlML = `https://autos.mercadolibre.com.ar/autos-camionetas/${marca}-${modelo}/_YearRange_${anio}-${anio}_NoIndex_True`;
            
            try {
                const listings = await scrapeMercadoLibre(urlML);
                if (listings.length > 0) {
                    renderResults(listings);
                } else {
                    alert('No se encontraron publicaciones válidas. Probá con otro año o modelo.');
                }
            } catch (error) {
                console.error(error);
                alert('Error al scrapear MercadoLibre. Intenta nuevamente.');
            } finally {
                document.getElementById('loader').classList.add('hidden');
            }
        });

        async function fetchWithFallbacks(targetUrl) {
            const proxies = [
                `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
                `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(targetUrl)}`,
                `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`
            ];
            
            for (let i = 0; i < proxies.length; i++) {
                try {
                    document.getElementById('loaderText').textContent = `Intentando conexión (Proxy ${i+1})...`;
                    const res = await fetch(proxies[i]);
                    if (res.ok) {
                        const text = await res.text();
                        // Verificamos que el HTML tenga contenido real y no un bloqueo 403 vacío
                        if (text && text.length > 5000 && !text.includes("403 Forbidden")) {
                            return text;
                        }
                    }
                } catch (e) {
                    console.warn(`Proxy ${i+1} falló`);
                }
            }
            throw new Error("Todos los proxies fallaron o fueron bloqueados.");
        }

        async function scrapeMercadoLibre(url) {
            const html = await fetchWithFallbacks(url);
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const items = doc.querySelectorAll('.ui-search-layout__item, .poly-card');
            const listings = [];

            items.forEach(item => {
                try {
                    const titleEl = item.querySelector('h2, [class*="title"] a, .poly-component__title');
                    const title = titleEl ? titleEl.textContent.trim() : '';
                    if (!title) return;

                    const priceEl = item.querySelector('.andes-money, [class*="price"] span, .poly-price__current');
                    let priceText = priceEl ? priceEl.textContent.trim() : '';
                    
                    let currency = 'ARS';
                    if (priceText.includes('US$') || priceText.includes('USD')) currency = 'USD';
                    
                    const priceNum = parseInt(priceText.replace(/[^0-9]/g, ''));
                    if (!priceNum || priceNum < 1500000) return; 

                    let yearMatch = title.match(/(19\d{2}|20\d{2})/);
                    let year = yearMatch ? yearMatch[0] : document.getElementById('anio').value;
                    
                    const attrEls = item.querySelectorAll('.ui-search-card-attributes__attribute, .poly-attributes-list__item, .poly-attributes_list .poly-attributes-list__item');
                    let km = 0;
                    attrEls.forEach(attr => {
                        const text = attr.textContent.toLowerCase();
                        if (text.includes('km')) {
                            const kmMatch = text.match(/[\d.]+/);
                            if (kmMatch) km = parseInt(kmMatch[0].replace(/\./g, ''));
                        }
                    });

                    const linkEl = item.querySelector('a');
                    const link = linkEl ? linkEl.href : '#';

                    listings.push({ title, price: priceNum, currency, year, km, link });
                } catch (e) {
                    console.warn('Error parseando item', e);
                }
            });

            return listings;
        }

        function renderResults(listings) {
            const kmDesde = parseInt(document.getElementById('kmDesde').value) || 0;
            const kmHasta = parseInt(document.getElementById('kmHasta').value) || 999999;
            
            const filtered = listings.filter(l => l.km >= kmDesde && l.km <= kmHasta);
            
            if (filtered.length === 0) {
                alert('Se encontraron resultados, pero ninguno coincide con los KM ingresados.');
                return;
            }

            const pricesArs = filtered.map(l => l.currency === 'USD' ? l.price * dolarBlue : l.price);
            
            const sum = pricesArs.reduce((a, b) => a + b, 0);
            const prom = sum / pricesArs.length;
            const perm = prom * 0.8;
            
            const sorted = [...pricesArs].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            const mediana = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

            const freq = {};
            let maxFreq = 0;
            let moda = sorted[0];
            pricesArs.forEach(p => {
                const bucket = Math.round(p / 100000) * 100000; 
                freq[bucket] = (freq[bucket] || 0) + 1;
                if (freq[bucket] > maxFreq) {
                    maxFreq = freq[bucket];
                    moda = bucket;
                }
            });

            document.getElementById('promArs').textContent = `$ ${prom.toLocaleString('es-AR', {maximumFractionDigits: 0})}`;
            document.getElementById('promUsd').textContent = `U$S ${(prom / dolarBlue).toLocaleString('es-AR', {maximumFractionDigits: 0})}`;
            document.getElementById('permArs').textContent = `$ ${perm.toLocaleString('es-AR', {maximumFractionDigits: 0})}`;
            document.getElementById('permUsd').textContent = `U$S ${(perm / dolarBlue).toLocaleString('es-AR', {maximumFractionDigits: 0})}`;
            document.getElementById('medianaArs').textContent = `$ ${mediana.toLocaleString('es-AR', {maximumFractionDigits: 0})}`;
            document.getElementById('modaArs').textContent = `$ ${moda.toLocaleString('es-AR', {maximumFractionDigits: 0})}`;

            const minP = sorted[0];
            const maxP = sorted[sorted.length - 1];
            const range = maxP - minP;
            const step = range / 5;
            const distBuckets = Array(5).fill(0);
            const distLabels = [];
            
            for (let i = 0; i < 5; i++) {
                distLabels.push(`${(minP + i*step).toLocaleString('es-AR', {maximumFractionDigits: 0})}`);
            }

            pricesArs.forEach(p => {
                let idx = Math.floor((p - minP) / step);
                if (idx === 5) idx = 4; 
                distBuckets[idx]++;
            });

            const maxBucket = Math.max(...distBuckets);
            const distHtml = distBuckets.map((count, i) => {
                const width = (count / maxBucket) * 100;
                return `
                    <div class="dist-bar-container">
                        <div class="dist-bar-label">
                            <span class="mono" style="color:var(--text-muted)">$${distLabels[i]}</span>
                            <span class="mono">${count} autos</span>
                        </div>
                        <div class="dist-bar-bg">
                            <div class="dist-bar-fill" style="width: ${width}%"></div>
                        </div>
                    </div>
                `;
            }).join('');
            document.getElementById('distribution').innerHTML = distHtml;

            document.getElementById('countListings').textContent = filtered.length;
            const listHtml = filtered.map(l => {
                const priceArs = l.currency === 'USD' ? l.price * dolarBlue : l.price;
                const priceUsd = l.currency === 'USD' ? l.price : l.price / dolarBlue;
                return `
                    <div class="listing">
                        <div class="listing-info">
                            <h3>${l.title}</h3>
                            <p class="mono">${l.year} · ${l.km.toLocaleString('es-AR')} km</p>
                            <a href="${l.link}" target="_blank" class="listing-link">Ver publicación →</a>
                        </div>
                        <div class="listing-price">
                            $ ${priceArs.toLocaleString('es-AR', {maximumFractionDigits: 0})}<br>
                            <span style="color: var(--text-muted); font-size: 12px;">U$S ${priceUsd.toLocaleString('es-AR', {maximumFractionDigits: 0})}</span>
                        </div>
                    </div>
                `;
            }).join('');
            document.getElementById('listings').innerHTML = listHtml;

            document.getElementById('results').classList.remove('hidden');
        }
    </script>
</body>
</html>
