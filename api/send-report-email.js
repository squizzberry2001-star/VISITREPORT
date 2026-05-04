const { json, ensureAllowedOrigin, readBody, cleanText, buildMimeMessage, getAccessToken } = require('./_gmail-utils');

const GMAIL_SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
const GMAIL_DRAFT_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/drafts';
const MAX_ATTACHMENT_BYTES = Number(process.env.EMAIL_MAX_ATTACHMENT_BYTES || 22 * 1024 * 1024);

module.exports = async function handler(req, res) {
  const origin = ensureAllowedOrigin(req, res);
  if (!origin) return;
  if (req.method === 'OPTIONS') return json(res, 200, { ok: true }, origin);
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method tidak diizinkan.' }, origin);
  try {
    const payload = await readBody(req);
    const lockedSender = cleanText(process.env.GMAIL_LOCKED_SENDER);
    if (!lockedSender) throw new Error('GMAIL_LOCKED_SENDER belum diset di Vercel.');
    const passcode = cleanText(process.env.EMAIL_SEND_PASSCODE);
    if (passcode && cleanText(payload.passcode) !== passcode) throw new Error('Kode kirim email salah.');
    const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];
    const approxBytes = attachments.reduce((sum, item) => sum + Math.ceil(cleanText(item.dataBase64).length * 0.75), 0);
    if (approxBytes > MAX_ATTACHMENT_BYTES) throw new Error('Ukuran attachment terlalu besar. Kurangi foto/PDF atau gunakan link Drive.');
    const raw = buildMimeMessage({
      from: lockedSender,
      to: payload.to,
      cc: payload.cc,
      subject: payload.subject,
      body: payload.body,
      attachments,
    });
    const accessToken = await getAccessToken();
    const mode = payload.mode === 'send' ? 'send' : 'draft';
    const url = mode === 'send' ? GMAIL_SEND_URL : GMAIL_DRAFT_URL;
    const body = mode === 'send' ? { raw } : { message: { raw } };
    const gmailResponse = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const result = await gmailResponse.json().catch(() => ({}));
    if (!gmailResponse.ok) throw new Error(result.error?.message || result.error || 'Gmail API menolak request.');
    return json(res, 200, { ok: true, mode, sender: lockedSender, id: result.id || result.message?.id || null }, origin);
  } catch (error) {
    return json(res, 400, { ok: false, error: error?.message || 'Gagal memproses email.' }, origin);
  }
};
