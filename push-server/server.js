require('dotenv').config();

const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, 'data');
const SUBSCRIPTION_FILE = path.join(DATA_DIR, 'subscriptions.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SUBSCRIPTION_FILE)) fs.writeFileSync(SUBSCRIPTION_FILE, '{}', 'utf8');
}

function readSubscriptions() {
  ensureDataDir();
  try {
    const parsed = JSON.parse(fs.readFileSync(SUBSCRIPTION_FILE, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}

function writeSubscriptions(data) {
  ensureDataDir();
  fs.writeFileSync(SUBSCRIPTION_FILE, JSON.stringify(data || {}, null, 2), 'utf8');
}

function cleanText(value, fallback = '') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function clampProgress(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function buildPayload(input = {}) {
  const storeName = cleanText(input.storeName, 'Nama Store');
  const bestieName = cleanText(input.bestieName, 'Nama Bestie');
  const progress = clampProgress(input.progress);
  return {
    title: cleanText(input.title, `${storeName} • Progress ${progress}%`),
    body: cleanText(input.body, `${bestieName} Laporan visit ${storeName} progres sudah ${progress}% ayo selesaikan dan kirim email.`),
    icon: cleanText(input.icon, '/icons/icon-192.png'),
    badge: cleanText(input.badge, '/icons/icon-192.png'),
    tag: cleanText(input.tag, `visit-progress-${cleanText(input.userId, 'user')}`),
    data: {
      url: cleanText(input.url, '/'),
      visitId: cleanText(input.visitId, ''),
      storeCode: cleanText(input.storeCode, ''),
      type: 'visit-progress-reminder'
    }
  };
}

const frontendOrigin = cleanText(process.env.FRONTEND_ORIGIN);
app.use(cors({
  origin(origin, callback) {
    if (!frontendOrigin || !origin || origin === frontendOrigin) return callback(null, true);
    return callback(null, false);
  },
  credentials: false
}));
app.use(express.json({ limit: '2mb' }));

const vapidPublicKey = cleanText(process.env.VAPID_PUBLIC_KEY);
const vapidPrivateKey = cleanText(process.env.VAPID_PRIVATE_KEY);
const vapidSubject = cleanText(process.env.VAPID_SUBJECT, 'mailto:admin@example.com');

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} else {
  console.warn('[WARN] VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY belum diisi. Jalankan: npm run generate:vapid');
}

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'Regional Bestie Visit Report Push Server',
    endpoints: [
      'GET /api/push/public-key',
      'POST /api/push/subscribe',
      'POST /api/push/send-progress-reminder'
    ]
  });
});

app.get('/api/push/public-key', (req, res) => {
  if (!vapidPublicKey) return res.status(500).json({ ok: false, error: 'VAPID_PUBLIC_KEY belum diset di backend.' });
  res.json({ ok: true, publicKey: vapidPublicKey });
});

app.post('/api/push/subscribe', (req, res) => {
  const userId = cleanText(req.body.userId, 'default-user');
  const subscription = req.body.subscription;

  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ ok: false, error: 'Push subscription tidak valid.' });
  }

  const subscriptions = readSubscriptions();
  subscriptions[userId] = {
    subscription,
    userAgent: cleanText(req.body.userAgent),
    subscribedAt: cleanText(req.body.subscribedAt, new Date().toISOString()),
    updatedAt: new Date().toISOString()
  };
  writeSubscriptions(subscriptions);

  res.json({ ok: true, userId });
});

app.post('/api/push/send-progress-reminder', async (req, res) => {
  if (!vapidPublicKey || !vapidPrivateKey) {
    return res.status(500).json({ ok: false, error: 'VAPID keys belum diset.' });
  }

  const userId = cleanText(req.body.userId, 'default-user');
  const subscriptions = readSubscriptions();
  const record = subscriptions[userId];

  if (!record || !record.subscription) {
    return res.status(404).json({ ok: false, error: `Subscription untuk ${userId} belum tersedia.` });
  }

  const payload = buildPayload({ ...req.body, userId });

  try {
    await webpush.sendNotification(record.subscription, JSON.stringify(payload), {
      TTL: 60 * 60 * 24,
      urgency: 'normal',
      topic: `visit-${userId}`.replace(/[^a-z0-9_-]/gi, '').slice(0, 32) || 'visit-progress'
    });

    res.json({ ok: true, userId, payload });
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 410) {
      delete subscriptions[userId];
      writeSubscriptions(subscriptions);
    }

    res.status(500).json({
      ok: false,
      error: 'Gagal mengirim push notification.',
      statusCode: error.statusCode || 500,
      detail: error.body || error.message
    });
  }
});

app.listen(PORT, () => {
  ensureDataDir();
  console.log(`Push server running on port ${PORT}`);
});
