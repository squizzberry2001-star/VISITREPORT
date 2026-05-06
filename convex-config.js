window.RB_CONVEX_CONFIG = {
  enabled: true,
  deploymentUrl: 'https://fabulous-alligator-318.convex.cloud',
  httpUrl: 'https://fabulous-alligator-318.convex.site',
  siteUrl: 'https://fabulous-alligator-318.convex.site',
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
