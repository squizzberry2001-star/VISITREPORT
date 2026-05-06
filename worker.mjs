const WORKER_BUILD = 'revamp109-worker-compat-settings-sync-history';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Accept, Content-Type, Authorization, X-Admin-Token, X-Requested-With, Cache-Control, Pragma',
  'Access-Control-Max-Age': '86400',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Content-Type': 'application/json; charset=utf-8'
};

const DEFAULT_MONITOR_LIMIT = 500;
const DEFAULT_MANUAL_LIMIT = 500;
const DEFAULT_PRESENCE_LIMIT = 300;
const DEFAULT_HISTORY_LIMIT = 100;

function json(payload, status = 200) {
  return new Response(JSON.stringify({ build: WORKER_BUILD, ...payload }), { status, headers: CORS });
}

function error(message, status = 500, extra = {}) {
  return json({ ok: false, error: message || 'Cloudflare D1 error', ...extra }, status);
}

function cleanText(value, fallback = '') {
  const text = value == null ? '' : String(value).trim();
  return text || fallback;
}

function parseLimit(value, fallback) {
  const n = Number(value || fallback);
  return Number.isFinite(n) ? Math.max(1, Math.min(1000, Math.round(n))) : fallback;
}

function requestToken(request) {
  const direct = request.headers.get('x-admin-token') || '';
  const auth = request.headers.get('authorization') || '';
  return cleanText(direct || auth.replace(/^Bearer\s+/i, ''));
}

function assertWriteAllowed(request, env) {
  const expected = cleanText(env.RBV_ADMIN_TOKEN || env.CLOUDFLARE_ADMIN_TOKEN || '');
  if (!expected) return;
  if (requestToken(request) !== expected) {
    const err = new Error('Token admin Cloudflare salah atau belum dikirim.');
    err.status = 401;
    throw err;
  }
}

function asObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value;
}

function parsePayload(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try { return JSON.parse(String(value)); } catch (_) { return {}; }
}

function withPayload(row) {
  if (!row || typeof row !== 'object') return row;
  const payload = parsePayload(row.payload_json || row.payload);
  const next = { ...payload, ...row };
  if (typeof next.payload === 'string') next.payload = parsePayload(next.payload);
  delete next.payload_json;
  return next;
}

function nowIso() {
  return new Date().toISOString();
}

async function readJsonSafe(request) {
  try {
    return asObject(await request.json());
  } catch (_) {
    return {};
  }
}

async function requireDb(env) {
  if (!env.DB) {
    const err = new Error('Binding D1 DB belum aktif. Pastikan Worker punya D1 binding bernama DB.');
    err.status = 500;
    throw err;
  }
  return env.DB;
}

async function ensureSchema(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS monitor_visits (
      visit_key TEXT PRIMARY KEY,
      bestie_name TEXT NOT NULL DEFAULT '',
      store_name TEXT NOT NULL DEFAULT '',
      store_code TEXT NOT NULL DEFAULT '',
      visit_date TEXT NOT NULL DEFAULT '',
      total_visits INTEGER NOT NULL DEFAULT 1,
      last_visit_at TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT '',
      session_id TEXT NOT NULL DEFAULT '',
      event_type TEXT NOT NULL DEFAULT '',
      page_url TEXT NOT NULL DEFAULT '',
      user_agent TEXT NOT NULL DEFAULT '',
      payload_json TEXT NOT NULL DEFAULT '{}'
    )
  `).run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_monitor_visits_updated_at ON monitor_visits(updated_at DESC)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_monitor_visits_store_name ON monitor_visits(store_name)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_monitor_visits_bestie_name ON monitor_visits(bestie_name)').run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS monitor_presence (
      session_id TEXT PRIMARY KEY,
      bestie_name TEXT NOT NULL DEFAULT '',
      store_name TEXT NOT NULL DEFAULT '',
      store_code TEXT NOT NULL DEFAULT '',
      screen_name TEXT NOT NULL DEFAULT '',
      last_seen_at TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT '',
      page_url TEXT NOT NULL DEFAULT '',
      user_agent TEXT NOT NULL DEFAULT '',
      payload_json TEXT NOT NULL DEFAULT '{}'
    )
  `).run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_monitor_presence_updated_at ON monitor_presence(updated_at DESC)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_monitor_presence_last_seen ON monitor_presence(last_seen_at DESC)').run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS manual_store_requests (
      request_id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT '',
      bestie_name TEXT NOT NULL DEFAULT '',
      store_name TEXT NOT NULL DEFAULT '',
      store_code TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      session_id TEXT NOT NULL DEFAULT '',
      page_url TEXT NOT NULL DEFAULT '',
      user_agent TEXT NOT NULL DEFAULT '',
      payload_json TEXT NOT NULL DEFAULT '{}'
    )
  `).run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_manual_store_requests_updated_at ON manual_store_requests(updated_at DESC)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_manual_store_requests_status ON manual_store_requests(status)').run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS app_settings (
      config_key TEXT PRIMARY KEY,
      payload TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL DEFAULT '',
      updated_by TEXT NOT NULL DEFAULT ''
    )
  `).run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_app_settings_updated_at ON app_settings(updated_at DESC)').run();

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS rbv_sync_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL DEFAULT '',
      key TEXT NOT NULL DEFAULT '',
      ok INTEGER NOT NULL DEFAULT 1,
      message TEXT NOT NULL DEFAULT '',
      payload_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT ''
    )
  `).run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_rbv_sync_history_created_at ON rbv_sync_history(created_at DESC)').run();
}

async function testD1(db) {
  const result = await db.prepare('SELECT 1 AS ok').first();
  return json({
    ok: true,
    provider: 'cloudflare-d1',
    d1: result,
    message: 'Cloudflare D1 aktif dan tabel sudah siap.'
  });
}

async function listMonitorVisits(db, url) {
  const limit = parseLimit(url.searchParams.get('limit'), DEFAULT_MONITOR_LIMIT);
  const result = await db.prepare(`
    SELECT * FROM monitor_visits
    ORDER BY COALESCE(updated_at, last_visit_at, visit_date) DESC
    LIMIT ?1
  `).bind(limit).all();
  return json({ ok: true, rows: (result.results || []).map(withPayload) });
}

async function upsertMonitorVisit(db, request, env) {
  assertWriteAllowed(request, env);
  const payload = asObject(await request.json());
  const visitKey = cleanText(payload.visit_key);
  if (!visitKey) return error('visit_key wajib diisi.', 400);
  const updatedAt = cleanText(payload.updated_at || nowIso());
  await db.prepare(`
    INSERT INTO monitor_visits (
      visit_key, bestie_name, store_name, store_code, visit_date, total_visits,
      last_visit_at, updated_at, session_id, event_type, page_url, user_agent, payload_json
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
    ON CONFLICT(visit_key) DO UPDATE SET
      bestie_name = excluded.bestie_name,
      store_name = excluded.store_name,
      store_code = excluded.store_code,
      visit_date = excluded.visit_date,
      total_visits = excluded.total_visits,
      last_visit_at = excluded.last_visit_at,
      updated_at = excluded.updated_at,
      session_id = excluded.session_id,
      event_type = excluded.event_type,
      page_url = excluded.page_url,
      user_agent = excluded.user_agent,
      payload_json = excluded.payload_json
  `).bind(
    visitKey,
    cleanText(payload.bestie_name),
    cleanText(payload.store_name),
    cleanText(payload.store_code),
    cleanText(payload.visit_date || nowIso().slice(0, 10)),
    Number(payload.total_visits || 1),
    cleanText(payload.last_visit_at || updatedAt),
    updatedAt,
    cleanText(payload.session_id),
    cleanText(payload.event_type),
    cleanText(payload.page_url),
    cleanText(payload.user_agent),
    JSON.stringify(payload)
  ).run();
  return json({ ok: true, row: { ...payload, visit_key: visitKey, updated_at: updatedAt } });
}

async function listPresence(db, url) {
  const limit = parseLimit(url.searchParams.get('limit'), DEFAULT_PRESENCE_LIMIT);
  const result = await db.prepare(`
    SELECT * FROM monitor_presence
    ORDER BY COALESCE(updated_at, last_seen_at) DESC
    LIMIT ?1
  `).bind(limit).all();
  return json({ ok: true, rows: (result.results || []).map(withPayload) });
}

async function upsertPresence(db, request, env) {
  assertWriteAllowed(request, env);
  const payload = asObject(await request.json());
  const sessionId = cleanText(payload.session_id);
  if (!sessionId) return error('session_id wajib diisi.', 400);
  const updatedAt = cleanText(payload.updated_at || nowIso());
  const lastSeen = cleanText(payload.last_seen_at || updatedAt);
  await db.prepare(`
    INSERT INTO monitor_presence (
      session_id, bestie_name, store_name, store_code, screen_name, last_seen_at,
      updated_at, page_url, user_agent, payload_json
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
    ON CONFLICT(session_id) DO UPDATE SET
      bestie_name = excluded.bestie_name,
      store_name = excluded.store_name,
      store_code = excluded.store_code,
      screen_name = excluded.screen_name,
      last_seen_at = excluded.last_seen_at,
      updated_at = excluded.updated_at,
      page_url = excluded.page_url,
      user_agent = excluded.user_agent,
      payload_json = excluded.payload_json
  `).bind(
    sessionId,
    cleanText(payload.bestie_name || payload.bestieName),
    cleanText(payload.store_name || payload.storeName),
    cleanText(payload.store_code || payload.storeCode),
    cleanText(payload.screen_name || payload.screenName || payload.screen),
    lastSeen,
    updatedAt,
    cleanText(payload.page_url),
    cleanText(payload.user_agent),
    JSON.stringify({ ...payload, session_id: sessionId, last_seen_at: lastSeen, updated_at: updatedAt })
  ).run();
  return json({ ok: true, row: { ...payload, session_id: sessionId, last_seen_at: lastSeen, updated_at: updatedAt } });
}

async function listManualRequests(db) {
  const result = await db.prepare(`
    SELECT * FROM manual_store_requests
    ORDER BY COALESCE(updated_at, created_at) DESC
    LIMIT ?1
  `).bind(DEFAULT_MANUAL_LIMIT).all();
  return json({ ok: true, rows: (result.results || []).map(withPayload) });
}

async function upsertManualRequest(db, request, env) {
  assertWriteAllowed(request, env);
  const payload = asObject(await request.json());
  const requestId = cleanText(payload.request_id);
  if (!requestId) return error('request_id wajib diisi.', 400);
  const updatedAt = cleanText(payload.updated_at || nowIso());
  await db.prepare(`
    INSERT INTO manual_store_requests (
      request_id, status, created_at, updated_at, bestie_name, store_name,
      store_code, address, note, session_id, page_url, user_agent, payload_json
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
    ON CONFLICT(request_id) DO UPDATE SET
      status = excluded.status,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at,
      bestie_name = excluded.bestie_name,
      store_name = excluded.store_name,
      store_code = excluded.store_code,
      address = excluded.address,
      note = excluded.note,
      session_id = excluded.session_id,
      page_url = excluded.page_url,
      user_agent = excluded.user_agent,
      payload_json = excluded.payload_json
  `).bind(
    requestId,
    cleanText(payload.status || 'pending'),
    cleanText(payload.created_at || updatedAt),
    updatedAt,
    cleanText(payload.bestie_name),
    cleanText(payload.store_name),
    cleanText(payload.store_code),
    cleanText(payload.address),
    cleanText(payload.note),
    cleanText(payload.session_id),
    cleanText(payload.page_url),
    cleanText(payload.user_agent),
    JSON.stringify(payload)
  ).run();
  return json({ ok: true, row: { ...payload, request_id: requestId, updated_at: updatedAt } });
}

function settingsResponseFromRows(rows) {
  const settings = {};
  const meta = {};
  const normalizedRows = (rows || []).map((row) => {
    const payload = parsePayload(row.payload);
    settings[row.config_key] = payload;
    meta[row.config_key] = {
      updated_at: row.updated_at,
      updatedAt: row.updated_at,
      updated_by: row.updated_by,
      updatedBy: row.updated_by
    };
    return {
      key: row.config_key,
      config_key: row.config_key,
      payload,
      value: payload,
      updated_at: row.updated_at,
      updatedAt: row.updated_at,
      updated_by: row.updated_by,
      updatedBy: row.updated_by
    };
  });

  return {
    ok: true,
    provider: 'cloudflare-d1',
    rows: normalizedRows,
    settings,
    meta
  };
}

async function listAppSettings(db, url) {
  const keys = cleanText(url.searchParams.get('keys')).split(',').map((item) => item.trim()).filter(Boolean);
  let result;
  if (keys.length) {
    const placeholders = keys.map((_, index) => `?${index + 1}`).join(',');
    result = await db.prepare(`SELECT config_key, payload, updated_at, updated_by FROM app_settings WHERE config_key IN (${placeholders})`).bind(...keys).all();
  } else {
    result = await db.prepare('SELECT config_key, payload, updated_at, updated_by FROM app_settings ORDER BY updated_at DESC').all();
  }
  return json(settingsResponseFromRows(result.results || []));
}

async function getAppSetting(db, url) {
  const key = cleanText(url.searchParams.get('key') || url.searchParams.get('config_key'));
  if (!key) return error('Parameter key wajib diisi.', 400);

  const row = await db.prepare(
    'SELECT config_key, payload, updated_at, updated_by FROM app_settings WHERE config_key = ?1'
  ).bind(key).first();

  if (!row) {
    return json({
      ok: true,
      provider: 'cloudflare-d1',
      exists: false,
      key,
      config_key: key,
      payload: null,
      value: null
    });
  }

  const payload = parsePayload(row.payload);
  return json({
    ok: true,
    provider: 'cloudflare-d1',
    exists: true,
    key: row.config_key,
    config_key: row.config_key,
    payload,
    value: payload,
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
    updated_by: row.updated_by,
    updatedBy: row.updated_by
  });
}

async function setAppSetting(db, request, env) {
  assertWriteAllowed(request, env);
  const body = await readJsonSafe(request);
  const key = cleanText(body.key || body.config_key);
  if (!key) return error('key wajib diisi.', 400);

  const payload = body.payload !== undefined
    ? body.payload
    : body.value !== undefined
      ? body.value
      : {};

  const updatedAt = nowIso();
  const updatedBy = cleanText(body.updatedBy || body.updated_by || 'web');

  await db.prepare(`
    INSERT INTO app_settings (config_key, payload, updated_at, updated_by)
    VALUES (?1, ?2, ?3, ?4)
    ON CONFLICT(config_key) DO UPDATE SET
      payload = excluded.payload,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by
  `).bind(key, JSON.stringify(payload), updatedAt, updatedBy).run();

  return json({
    ok: true,
    provider: 'cloudflare-d1',
    row: { key, config_key: key, payload, value: payload, updatedAt, updated_at: updatedAt, updatedBy, updated_by: updatedBy }
  });
}

async function setManyAppSettings(db, request, env) {
  assertWriteAllowed(request, env);
  const body = await readJsonSafe(request);
  const settings = asObject(body.settings || body.payload || body);
  const updatedAt = nowIso();
  const updatedBy = cleanText(body.updatedBy || body.updated_by || 'web');
  const savedKeys = [];

  for (const [key, value] of Object.entries(settings)) {
    if (!cleanText(key)) continue;
    await db.prepare(`
      INSERT INTO app_settings (config_key, payload, updated_at, updated_by)
      VALUES (?1, ?2, ?3, ?4)
      ON CONFLICT(config_key) DO UPDATE SET
        payload = excluded.payload,
        updated_at = excluded.updated_at,
        updated_by = excluded.updated_by
    `).bind(key, JSON.stringify(value ?? null), updatedAt, updatedBy).run();
    savedKeys.push(key);
  }

  return json({
    ok: true,
    provider: 'cloudflare-d1',
    saved_keys: savedKeys,
    updated_at: updatedAt,
    updatedAt: updatedAt
  });
}

async function listSyncHistory(db, url) {
  const limit = parseLimit(url.searchParams.get('limit'), DEFAULT_HISTORY_LIMIT);
  const result = await db.prepare(`
    SELECT id, action, key, ok, message, payload_json, created_at
    FROM rbv_sync_history
    ORDER BY created_at DESC, id DESC
    LIMIT ?1
  `).bind(limit).all();

  const history = (result.results || []).map((row) => ({
    id: row.id,
    action: row.action,
    key: row.key,
    ok: Boolean(row.ok),
    message: row.message,
    payload: parsePayload(row.payload_json),
    created_at: row.created_at,
    createdAt: row.created_at
  }));

  return json({ ok: true, provider: 'cloudflare-d1', history, rows: history });
}

async function saveSyncHistory(db, request, env) {
  assertWriteAllowed(request, env);
  const body = await readJsonSafe(request);
  const items = Array.isArray(body.history)
    ? body.history
    : Array.isArray(body.rows)
      ? body.rows
      : [body];

  let saved = 0;
  const createdAt = nowIso();

  for (const raw of items) {
    const item = asObject(raw);
    await db.prepare(`
      INSERT INTO rbv_sync_history (action, key, ok, message, payload_json, created_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6)
    `).bind(
      cleanText(item.action || item.type || 'sync'),
      cleanText(item.key || item.config_key || ''),
      item.ok === false ? 0 : 1,
      cleanText(item.message || ''),
      JSON.stringify(item),
      cleanText(item.created_at || item.createdAt || createdAt)
    ).run();
    saved += 1;
  }

  return json({
    ok: true,
    provider: 'cloudflare-d1',
    saved,
    message: `Sync history tersimpan: ${saved}.`
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action') || '';
    const path = url.pathname.replace(/\/+$/, '') || '/';

    // Health check endpoint. This is intentionally available without DB.
    if (request.method === 'GET' && !action && (path === '/' || path === '/api' || path === '/health')) {
      return json({
        ok: true,
        provider: 'cloudflare-d1',
        message: 'RBV Cloudflare D1 API aktif.'
      });
    }

    try {
      const db = await requireDb(env);
      await ensureSchema(db);

      // New direct routes for revamp108/revamp109 frontend.
      if (request.method === 'GET' && (action === 'testD1' || path === '/api/test-d1' || path === '/test-d1')) return testD1(db);

      if (request.method === 'GET' && (path === '/api/settings' || path === '/settings' || path === '/api/panel' || action === 'listAppSettings')) return listAppSettings(db, url);
      if ((request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') && (path === '/api/settings' || path === '/settings' || path === '/api/panel')) return setManyAppSettings(db, request, env);

      if (request.method === 'GET' && (path === '/api/setting' || path === '/setting')) return getAppSetting(db, url);
      if ((request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') && (path === '/api/setting' || path === '/setting' || action === 'setAppSetting')) return setAppSetting(db, request, env);

      if (request.method === 'GET' && (path === '/api/sync-history' || path === '/sync-history')) return listSyncHistory(db, url);
      if ((request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') && (path === '/api/sync-history' || path === '/sync-history')) return saveSyncHistory(db, request, env);

      // Backward-compatible action routes.
      if (request.method === 'GET' && action === 'listMonitorVisits') return listMonitorVisits(db, url);
      if (request.method === 'POST' && action === 'upsertMonitorVisit') return upsertMonitorVisit(db, request, env);
      if (request.method === 'GET' && action === 'listPresence') return listPresence(db, url);
      if (request.method === 'POST' && action === 'upsertPresence') return upsertPresence(db, request, env);
      if (request.method === 'GET' && action === 'listManualRequests') return listManualRequests(db);
      if (request.method === 'POST' && action === 'upsertManualRequest') return upsertManualRequest(db, request, env);

      if (request.method === 'GET' && !action) {
        return json({
          ok: true,
          provider: 'cloudflare-d1',
          message: 'RBV Cloudflare D1 API aktif.',
          path
        });
      }

      return error('Action atau route tidak dikenal.', 404, { path, action, method: request.method });
    } catch (err) {
      console.error('RBV Cloudflare D1 error:', err);
      return error(err?.message || 'Cloudflare D1 gagal.', err?.status || 500, { path, action, method: request.method });
    }
  }
};
