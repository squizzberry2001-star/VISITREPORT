// Supabase configuration for Bestie Visit.
// Isi url dan publishableKey dari Supabase Dashboard > Project Settings > API Keys.
// Jangan pernah memasukkan secret key/service_role key di file frontend ini.
window.RB_SUPABASE_CONFIG = {
  enabled: false,
  url: 'https://cqeutfujywwphtflhqgc.supabase.co',
  publishableKey: 'sb_publishable_2zOzjfTizjHdloW8Lv05Lg_o1r5QCDB',

  // Browser bundle; app ini tidak memakai build step/npm.
  bundleUrl: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',

  tables: {
    appSettings: 'app_settings',
    monitor: 'monitor_visits',
    manualRequests: 'manual_store_requests'
  },

  // HOME info/welcome + monitor admin akan refresh berkala.
  pollMs: 5000,
  monitorLimit: 500
};
