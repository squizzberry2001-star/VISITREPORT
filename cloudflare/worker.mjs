const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Admin-Token',
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  'Content-Type': 'application/json; charset=utf-8'
};

const DEFAULT_MONITOR_LIMIT = 500;
const DEFAULT_MANUAL_LIMIT = 500;
const DEFAULT_PRESENCE_LIMIT = 300;

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: CORS });
}

function error(message, status = 500) {
  return json({ ok: false, error: message || 'Cloudflare D1 error' }, status);
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

async function requireDb(env) {
  if (!env.DB) {
    const err = new Error('Binding D1 DB belum aktif. Pastikan wrangler.toml punya [[d1_databases]] binding = "DB".');
    err.status = 500;
    throw err;
  }
  return env.DB;
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

async function listAppSettings(db, url) {
  const keys = cleanText(url.searchParams.get('keys')).split(',').map((item) => item.trim()).filter(Boolean);
  let result;
  if (keys.length) {
    const placeholders = keys.map((_, index) => `?${index + 1}`).join(',');
    result = await db.prepare(`SELECT config_key, payload, updated_at, updated_by FROM app_settings WHERE config_key IN (${placeholders})`).bind(...keys).all();
  } else {
    result = await db.prepare('SELECT config_key, payload, updated_at, updated_by FROM app_settings ORDER BY updated_at DESC').all();
  }
  const rows = (result.results || []).map((row) => ({
    key: row.config_key,
    config_key: row.config_key,
    payload: parsePayload(row.payload),
    updated_at: row.updated_at,
    updatedAt: row.updated_at,
    updated_by: row.updated_by,
    updatedBy: row.updated_by
  }));
  return json({ ok: true, rows });
}

async function setAppSetting(db, request, env) {
  assertWriteAllowed(request, env);
  const body = asObject(await request.json());
  const key = cleanText(body.key || body.config_key);
  if (!key) return error('key wajib diisi.', 400);
  const updatedAt = nowIso();
  await db.prepare(`
    INSERT INTO app_settings (config_key, payload, updated_at, updated_by)
    VALUES (?1, ?2, ?3, ?4)
    ON CONFLICT(config_key) DO UPDATE SET
      payload = excluded.payload,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by
  `).bind(key, JSON.stringify(body.payload || {}), updatedAt, cleanText(body.updatedBy || body.updated_by || 'web')).run();
  return json({ ok: true, row: { key, config_key: key, payload: body.payload || {}, updatedAt, updated_at: updatedAt } });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response('', { status: 204, headers: CORS });
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || '';
    try {
      const db = await requireDb(env);
      if (request.method === 'GET' && action === 'listMonitorVisits') return listMonitorVisits(db, url);
      if (request.method === 'POST' && action === 'upsertMonitorVisit') return upsertMonitorVisit(db, request, env);
      if (request.method === 'GET' && action === 'listPresence') return listPresence(db, url);
      if (request.method === 'POST' && action === 'upsertPresence') return upsertPresence(db, request, env);
      if (request.method === 'GET' && action === 'listManualRequests') return listManualRequests(db);
      if (request.method === 'POST' && action === 'upsertManualRequest') return upsertManualRequest(db, request, env);
      if (request.method === 'GET' && action === 'listAppSettings') return listAppSettings(db, url);
      if (request.method === 'POST' && action === 'setAppSetting') return setAppSetting(db, request, env);
      if (request.method === 'GET' && !action) return json({ ok: true, provider: 'cloudflare-d1', message: 'RBV Cloudflare D1 API aktif.' });
      return error('Action tidak dikenal.', 404);
    } catch (err) {
      console.error('RBV Cloudflare D1 error:', err);
      return error(err?.message || 'Cloudflare D1 gagal.', err?.status || 500);
    }
  }
};
