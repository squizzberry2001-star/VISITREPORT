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
);

CREATE INDEX IF NOT EXISTS idx_monitor_visits_updated_at ON monitor_visits(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitor_visits_store_name ON monitor_visits(store_name);
CREATE INDEX IF NOT EXISTS idx_monitor_visits_bestie_name ON monitor_visits(bestie_name);

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
);

CREATE INDEX IF NOT EXISTS idx_monitor_presence_updated_at ON monitor_presence(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitor_presence_last_seen ON monitor_presence(last_seen_at DESC);

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
);

CREATE INDEX IF NOT EXISTS idx_manual_store_requests_updated_at ON manual_store_requests(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_manual_store_requests_status ON manual_store_requests(status);

CREATE TABLE IF NOT EXISTS app_settings (
  config_key TEXT PRIMARY KEY,
  payload TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT '',
  updated_by TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_app_settings_updated_at ON app_settings(updated_at DESC);
