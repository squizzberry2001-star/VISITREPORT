// Cloudflare D1 connection config for Bestie Visit Report.
//
// MODE 1 - Cloudflare Worker standalone:
// Isi endpoint dengan URL Worker kamu, contoh:
//   endpoint: 'https://visitreport-rbv-api.NAMA-AKUN.workers.dev'
//
// MODE 2 - Cloudflare Pages Functions di domain yang sama:
// Biarkan endpoint kosong dan pakai apiPath '/api/rbv-data'.

window.RB_CLOUDFLARE_CONFIG = {
  enabled: true,
  endpoint: '',
  apiPath: '/api/rbv-data',
  adminToken: '',
  pollMs: 5000,
  monitorLimit: 500,
  presenceLimit: 300
};
