/**
 * Servidor estático + proxy POST /api/fruitfy/pix-charge (evita CORS no navegador).
 * Uso: node server.mjs
 * Porta padrão 3847 (evita conflito com Vite, que usa 5173).
 * Abra: http://localhost:3847/checkout.html
 *
 * Credenciais: fruitfy.secrets.json (pasta do server.mjs ou cwd), ou ZENCI_SECRETS_PATH, ou env:
 *   FRUITFY_TOKEN | FRUITFY_API_TOKEN | FRUITFY_BEARER_TOKEN, FRUITFY_STORE_ID, FRUITFY_PRODUCT_ID
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Porta inicial; se estiver ocupada, o servidor tenta a próxima (3848, 3849, …). */
let listenPort = Number(process.env.PORT) || 3847;
const LISTEN_PORT_MAX = listenPort + 45;
const ROOT = __dirname;

let secrets = null;
/** Último diagnóstico (para /api/fruitfy/health), sem expor segredos */
let secretsDiag = {
  triedPaths: [],
  lastParseOk: false,
  keysInFile: [],
  hint: '',
  loadError: '',
};

/**
 * Aceita os nomes usados no nosso exemplo e variações comuns de painel/documentação.
 * Headers na API Fruitfy: Authorization: Bearer <token>, Store-Id: <uuid loja>
 */
function normalizeSecrets(raw) {
  if (!raw || typeof raw !== 'object') return null;
  function pick(strs) {
    for (let i = 0; i < strs.length; i++) {
      const k = strs[i];
      if (raw[k] == null) continue;
      const v = String(raw[k]).trim();
      if (v.length > 0) return v;
    }
    return '';
  }
  const token = pick([
    'token',
    'access_token',
    'accessToken',
    'api_token',
    'apiToken',
    'bearer_token',
    'bearerToken',
    'api_key',
    'apiKey',
  ]);
  const storeId = pick([
    'storeId',
    'store_id',
    'storeUuid',
    'store_uuid',
    'storeID',
    'loja_id',
    'lojaId',
    'shop_id',
    'shopId',
  ]);
  const productId = pick([
    'productId',
    'product_id',
    'productUuid',
    'product_uuid',
    'produto_id',
    'produtoId',
    'offer_id',
    'offerId',
  ]);
  if (!token || !storeId || !productId) return null;
  const apiBase = pick(['apiBase', 'api_base', 'baseUrl', 'base_url']) || 'https://api.fruitfy.io';
  const chargePath = pick(['chargePath', 'charge_path', 'pixPath', 'pix_path']) || '/api/pix/charge';
  const statusPath = pick(['statusPath', 'status_path', 'pixStatusPath', 'pix_status_path']) || '/api/pix/status';
  return {
    token,
    storeId,
    productId,
    apiBase: apiBase.replace(/\/$/, ''),
    chargePath: chargePath.startsWith('/') ? chargePath : '/' + chargePath,
    statusPath: statusPath.startsWith('/') ? statusPath : '/' + statusPath,
  };
}

function loadSecrets(opts) {
  const silent = opts && opts.silent;
  secretsDiag = {
    triedPaths: [],
    lastParseOk: false,
    keysInFile: [],
    hint: '',
    loadError: '',
  };

  /**
   * Ordem: 1) arquivo (fonte principal no dev) 2) env.
   * Assim variáveis FRUITFY_* vazias/erradas no Windows não impedem o JSON válido.
   */
  const candidates = [];
  if (process.env.ZENCI_SECRETS_PATH && String(process.env.ZENCI_SECRETS_PATH).trim()) {
    candidates.push(path.resolve(String(process.env.ZENCI_SECRETS_PATH).trim()));
  }
  candidates.push(path.join(ROOT, 'fruitfy.secrets.json'));
  candidates.push(path.join(process.cwd(), 'fruitfy.secrets.json'));

  const seen = new Set();
  for (let i = 0; i < candidates.length; i++) {
    const p = candidates[i];
    const resolved = path.resolve(p);
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    secretsDiag.triedPaths.push(resolved);
    try {
      const text = fs.readFileSync(resolved, 'utf8').replace(/^\uFEFF/, '');
      const parsed = JSON.parse(text);
      secretsDiag.lastParseOk = true;
      secretsDiag.keysInFile = Object.keys(parsed).filter((k) => !k.startsWith('_'));
      const n = normalizeSecrets(parsed);
      if (n) {
        secrets = n;
        secretsDiag.hint = 'ok_from_file';
        if (!silent) console.log('[fruitfy] Credenciais carregadas de', resolved);
        return;
      }
      secretsDiag.hint = 'json_ok_but_missing_fields';
      if (!silent) {
        console.warn(
          '[fruitfy] JSON em',
          resolved,
          'sem token/storeId/productId válidos. Chaves:',
          secretsDiag.keysInFile.join(', ')
        );
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        /* arquivo não existe neste caminho */
      } else {
        secretsDiag.loadError = err.message;
        if (!silent) console.warn('[fruitfy] Erro ao ler', resolved, '-', err.message);
      }
    }
  }

  const envToken = (
    process.env.FRUITFY_TOKEN ||
    process.env.FRUITFY_API_TOKEN ||
    process.env.FRUITFY_BEARER_TOKEN ||
    ''
  ).trim();
  const envStore = (process.env.FRUITFY_STORE_ID || '').trim();
  const envProduct = (process.env.FRUITFY_PRODUCT_ID || '').trim();
  if (envToken && envStore && envProduct) {
    const n = normalizeSecrets({
      token: envToken,
      storeId: envStore,
      productId: envProduct,
      apiBase: process.env.FRUITFY_API_BASE,
      chargePath: process.env.FRUITFY_CHARGE_PATH,
      statusPath: process.env.FRUITFY_STATUS_PATH,
    });
    if (n) {
      secrets = n;
      secretsDiag.hint = 'ok_from_env';
      if (!silent) console.log('[fruitfy] Credenciais carregadas das variáveis de ambiente.');
      return;
    }
  }

  secrets = null;
  secretsDiag.hint = secretsDiag.hint || 'no_valid_source';
  if (!silent) {
    console.warn(
      '[fruitfy] Sem credenciais. serverRoot=' +
        ROOT +
        ' cwd=' +
        process.cwd() +
        '. Use fruitfy.secrets.json ou defina ZENCI_SECRETS_PATH para o caminho absoluto do arquivo.'
    );
  }
}

loadSecrets();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

function json(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
  });
  res.end(body);
}

function safeJoin(root, pathnameRel) {
  const clean = decodeURIComponent(pathnameRel.split('?')[0]).replace(/^[/\\]+/, '');
  if (!clean || clean.includes('..')) return null;
  const full = path.resolve(root, clean);
  const rootR = path.resolve(root);
  if (full !== rootR && !full.startsWith(rootR + path.sep)) return null;
  return full;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function callFruitfy(pathname, payload, method) {
  const apiBase = (secrets.apiBase || 'https://api.fruitfy.io').replace(/\/$/, '');
  const r = await fetch(apiBase + pathname, {
    method: method || 'POST',
    redirect: 'manual',
    headers: {
      Authorization: `Bearer ${secrets.token}`,
      'Store-Id': secrets.storeId,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Language': 'pt_BR',
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (r.status >= 300 && r.status < 400) {
    const loc = r.headers.get('location') || '';
    return {
      redirected: true,
      status: r.status,
      location: loc,
      body: JSON.stringify({
        success: false,
        message:
          'A Fruitfy redirecionou a chamada (' +
          r.status +
          '). Em geral: token inválido/expirado, Store-Id incorreto, ou endpoint inválido.',
      }),
      contentType: 'application/json; charset=utf-8',
    };
  }

  return {
    redirected: false,
    status: r.status,
    body: await r.text(),
    contentType: r.headers.get('content-type') || 'application/json; charset=utf-8',
  };
}

async function handlePixCharge(req, res) {
  if (!secrets || !secrets.token || !secrets.storeId || !secrets.productId) {
    loadSecrets({ silent: true });
  }
  if (!secrets || !secrets.token || !secrets.storeId || !secrets.productId) {
    return json(res, 503, {
      success: false,
      message:
        'Proxy Fruitfy sem credenciais carregadas. Abra GET /api/fruitfy/health e veja triedSecretPaths / keysInLastParsedFile. Garanta fruitfy.secrets.json na pasta do server.mjs ou use ZENCI_SECRETS_PATH=caminho\\absoluto\\fruitfy.secrets.json',
      debug: {
        serverRoot: ROOT,
        processCwd: process.cwd(),
        triedSecretPaths: secretsDiag.triedPaths,
        lastJsonParseOk: secretsDiag.lastParseOk,
        keysInLastParsedFile: secretsDiag.keysInFile,
        hint: secretsDiag.hint,
        parseOrReadError: secretsDiag.loadError || null,
      },
    });
  }

  let raw;
  try {
    raw = await readBody(req);
  } catch (e) {
    return json(res, 400, { success: false, message: 'Corpo da requisição inválido.' });
  }

  let payload;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    return json(res, 400, { success: false, message: 'JSON inválido.' });
  }

  const { name, email, phone, cpf, totalCents, trackingParams, metadata } = payload;
  if (!name || !email || !phone || !cpf || typeof totalCents !== 'number' || totalCents < 100) {
    return json(res, 400, {
      success: false,
      message: 'Obrigatório: name, email, phone, cpf e totalCents (número, centavos, mínimo 100).',
    });
  }

  const rawTracking = trackingParams && typeof trackingParams === 'object' && !Array.isArray(trackingParams)
    ? trackingParams
    : metadata && typeof metadata === 'object' && !Array.isArray(metadata)
      ? metadata
      : null;
  const flatMeta = {};
  if (rawTracking) {
    let count = 0;
    for (const [k, v] of Object.entries(rawTracking)) {
      if (count >= 50) break;
      if (typeof k !== 'string' || k.length > 80 || k.startsWith('__')) continue;
      if (v == null || typeof v === 'object') continue;
      const s = String(v).slice(0, 2000);
      if (s.length) {
        flatMeta[k] = s;
        count++;
      }
    }
  }

  const chargePath = secrets.chargePath || '/api/pix/charge';
  const fruitfyBody = {
    name: String(name).trim(),
    email: String(email).trim(),
    phone: String(phone),
    cpf: String(cpf).replace(/\D/g, ''),
    items: [{ id: secrets.productId, quantity: 1, value: Math.round(totalCents) }],
  };
  if (Object.keys(flatMeta).length) {
    fruitfyBody.metadata = flatMeta;
    for (const k of Object.keys(flatMeta)) {
      if (/^utm_/i.test(k) || k === 'fbclid' || k === 'gclid' || k === 'src' || k === 'ref') {
        fruitfyBody[k] = flatMeta[k];
      }
    }
  }

  try {
    const out = await callFruitfy(chargePath, fruitfyBody, 'POST');
    res.writeHead(out.status, {
      'Content-Type': out.contentType,
      'Access-Control-Allow-Origin': '*',
    });
    res.end(out.body);
  } catch (e) {
    console.error('[fruitfy proxy]', e);
    return json(res, 502, {
      success: false,
      message: 'Falha ao contatar a API Fruitfy: ' + (e.message || 'rede'),
    });
  }
}

async function handlePixStatus(req, res) {
  if (!secrets || !secrets.token || !secrets.storeId || !secrets.productId) {
    loadSecrets({ silent: true });
  }
  if (!secrets || !secrets.token || !secrets.storeId || !secrets.productId) {
    return json(res, 503, { success: false, message: 'Proxy sem credenciais.' });
  }

  let raw;
  try {
    raw = await readBody(req);
  } catch {
    return json(res, 400, { success: false, message: 'Corpo inválido.' });
  }

  let payload;
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    return json(res, 400, { success: false, message: 'JSON inválido.' });
  }

  const statusPath = secrets.statusPath || '/api/pix/status';
  const chargeId = payload.chargeId || payload.id || payload.txid || payload.transactionId || '';
  const statusBody = {
    chargeId: chargeId || undefined,
    id: chargeId || undefined,
    txid: payload.txid || undefined,
    transactionId: payload.transactionId || undefined,
    externalId: payload.externalId || undefined,
    reference: payload.reference || undefined,
  };

  let finalPath = statusPath;
  if (chargeId) {
    if (/\{id\}|:id/.test(finalPath)) {
      finalPath = finalPath.replace('{id}', encodeURIComponent(chargeId)).replace(':id', encodeURIComponent(chargeId));
    } else if (finalPath.indexOf('?') >= 0) {
      finalPath += '&id=' + encodeURIComponent(chargeId);
    } else {
      finalPath += '?id=' + encodeURIComponent(chargeId);
    }
  }

  try {
    const out = await callFruitfy(finalPath, statusBody, 'POST');
    res.writeHead(out.status, {
      'Content-Type': out.contentType,
      'Access-Control-Allow-Origin': '*',
    });
    res.end(out.body);
  } catch (e) {
    return json(res, 502, { success: false, message: 'Falha ao consultar status: ' + (e.message || 'rede') });
  }
}

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || 'localhost';
  const u = new URL(req.url || '/', `http://${host}`);
  const pathname = u.pathname;

  if (req.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Accept-Language',
      'Access-Control-Max-Age': '86400',
    });
    return res.end();
  }

  if (req.method === 'GET' && pathname === '/favicon.ico') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'GET' && pathname === '/api/fruitfy/health') {
    loadSecrets({ silent: true });
    const health = JSON.stringify({
      ok: true,
      service: 'zenci-fruitfy-proxy',
      port: serverPort(),
      pixChargePath: '/api/fruitfy/pix-charge',
      credentialsConfigured: !!(secrets && secrets.token && secrets.storeId && secrets.productId),
      serverRoot: ROOT,
      processCwd: process.cwd(),
      triedSecretPaths: secretsDiag.triedPaths,
      lastJsonParseOk: secretsDiag.lastParseOk,
      keysInLastParsedFile: secretsDiag.keysInFile,
      hint: secretsDiag.hint,
      parseOrReadError: secretsDiag.loadError || null,
    });
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    });
    return res.end(health);
  }

  if (req.method === 'POST' && pathname === '/api/fruitfy/pix-charge') {
    return handlePixCharge(req, res);
  }

  if (req.method === 'POST' && pathname === '/api/fruitfy/pix-status') {
    return handlePixStatus(req, res);
  }

  let filePath =
    pathname === '/' ? path.join(ROOT, 'index.html') : safeJoin(ROOT, pathname.slice(1));

  if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    return fs.createReadStream(filePath).pipe(res);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Não encontrado');
});

function serverPort() {
  const a = server.address();
  return a && typeof a === 'object' ? a.port : listenPort;
}

function printReadyBanner() {
  const p = serverPort();
  console.log('\n');
  console.log('============================================================');
  console.log('  ZENCI — use ESTES links (porta ' + p + '):');
  console.log('  Loja:      http://127.0.0.1:' + p + '/index.html');
  console.log('  Checkout:  http://127.0.0.1:' + p + '/checkout.html');
  console.log('  Teste API: http://127.0.0.1:' + p + '/api/fruitfy/health');
  console.log('============================================================');
  console.log('PIX via POST /api/fruitfy/pix-charge (credenciais em fruitfy.secrets.json)\n');
}

server.on('error', (err) => {
  if (err.code !== 'EADDRINUSE') {
    console.error('[zenci]', err);
    process.exit(1);
  }
  listenPort += 1;
  if (listenPort > LISTEN_PORT_MAX) {
    console.error(
      '[zenci] Nenhuma porta livre até ' +
        LISTEN_PORT_MAX +
        '. Feche outros "node server.mjs" (Ctrl+C) ou defina: set PORT=3900'
    );
    process.exit(1);
  }
  console.warn('[zenci] Porta anterior ocupada — subindo na porta ' + listenPort + ' …');
  server.listen(listenPort, '0.0.0.0', printReadyBanner);
});

server.listen(listenPort, '0.0.0.0', printReadyBanner);
