// Netlify connection config for Bestie Visit Report.
// Default dimatikan karena backend utama sudah dimigrasikan ke Cloudflare D1.
//
// MODE 1 - App dan function di site Netlify yang sama:
// Biarkan baseUrl kosong. App akan otomatis memanggil:
//   https://DOMAIN-KAMU.netlify.app/.netlify/functions/rbv-data
//
// MODE 2 - App dibuka dari domain lain / file lokal:
// Isi baseUrl dengan URL Netlify kamu, contoh:
//   baseUrl: 'https://nama-site-kamu.netlify.app'

window.RB_NETLIFY_CONFIG = {
  enabled: false,
  functionPath: '/.netlify/functions/rbv-data',
  baseUrl: '',
  adminToken: '',
  pollMs: 5000,
  monitorLimit: 500,
  presenceLimit: 300
};
