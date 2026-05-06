// Convex realtime/backend configuration for Bestie Visit revamp200.
// Setelah menjalankan `npx convex dev`, ganti deploymentUrl dengan URL Convex kamu.
window.RB_CONVEX_CONFIG = {
  enabled: true,
  deploymentUrl: 'https://third-monitor-660.convex.cloud',
  httpUrl: '',
  bundleUrl: 'https://unpkg.com/convex@latest/dist/browser.bundle.js',

  // Monitoring realtime.
  monitorQuery: 'monitor:listVisits',
  manualRequestsQuery: 'monitor:listManualStoreRequests',
  presenceQuery: 'monitor:listPresence',
  upsertMutation: 'monitor:upsertVisit',
  upsertManualRequestMutation: 'monitor:upsertManualStoreRequest',
  presenceUpsertMutation: 'monitor:upsertPresence',

  // App settings.
  appConfigListQuery: 'appSettings:listConfigs',
  appConfigSetMutation: 'appSettings:setConfig',

  // Master Data Detail Toko.
  masterStoreListQuery: 'masterStores:listStores',
  masterStoreUpsertManyMutation: 'masterStores:upsertMany',
  masterStoreReplaceMutation: 'masterStores:replaceStores',

  pollMs: 5000,
  token: ''
};
