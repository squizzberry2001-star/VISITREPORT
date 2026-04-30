// Convex realtime monitor configuration for the secret admin panel.
// 1) Deploy the example functions in convex-monitor-example.js to Convex.
// 2) Set enabled: true.
// 3) Fill deploymentUrl with your Convex cloud URL, usually https://xxxxx.convex.cloud.
// Optional: fill httpUrl only if you still want HTTP fallback actions.
window.RB_CONVEX_CONFIG = {
  enabled: false,

  // Realtime WebSocket client URL. Required for realtime panel updates.
  deploymentUrl: '', // Example: 'https://your-deployment.convex.cloud'

  // Optional legacy HTTP fallback URL for Convex HTTP actions.
  httpUrl: '', // Example: 'https://your-deployment.convex.site'

  // Browser bundle used when this static app loads Convex without a build step.
  bundleUrl: 'https://unpkg.com/convex@latest/dist/browser.bundle.js',

  // Convex function references. These match convex/monitor.ts in the example file.
  monitorQuery: 'monitor:listVisits',
  manualRequestsQuery: 'monitor:listManualStoreRequests',
  upsertMutation: 'monitor:upsertVisit',
  upsertManualRequestMutation: 'monitor:upsertManualStoreRequest',

  // Legacy HTTP action paths, only used as fallback if deploymentUrl is empty/unavailable.
  upsertPath: 'monitor/upsertVisit',
  listPath: 'monitor/listVisits',
  upsertManualRequestPath: 'monitor/upsertManualStoreRequest',
  listManualRequestsPath: 'monitor/listManualStoreRequests',

  // Fallback polling interval when realtime WebSocket cannot connect.
  pollMs: 5000,

  // Optional bearer token if you protect HTTP action endpoints.
  token: ''
};
