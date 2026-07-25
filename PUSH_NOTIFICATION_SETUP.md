# Backend Push Notification - Regional Bestie Visit Report

Folder ini adalah backend Web Push untuk PWA.

## Setup lokal

```bash
cd push-server
npm install
npm run generate:vapid
```

Copy hasil `publicKey` dan `privateKey` ke `.env`:

```env
PORT=3000
VAPID_PUBLIC_KEY=ISI_PUBLIC_KEY
VAPID_PRIVATE_KEY=ISI_PRIVATE_KEY
VAPID_SUBJECT=mailto:squizzberry2001@gmail.com
FRONTEND_ORIGIN=https://domain-frontend-kamu
```

Jalankan:

```bash
npm start
```

## Deploy

Deploy folder `push-server` ke Render/Railway/Fly.io/Vercel Node runtime.

Set environment variables:
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `FRONTEND_ORIGIN`

Setelah backend online, buka file `push-config.js` di frontend dan isi:

```js
window.RBV_PUSH_CONFIG = {
  apiBase: 'https://domain-backend-kamu'
};
```

## Template notifikasi

Title:
`Nama Store • Progress xx%`

Body:
`(nama bestie) Laporan visit (nama toko) progres sudah (persenan)% ayo selesaikan dan kirim email.`
