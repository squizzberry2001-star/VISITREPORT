const { cleanText, getRedirectUri } = require('./_gmail-utils');

module.exports = async function handler(req, res) {
  try {
    const code = cleanText(req.query && req.query.code);
    if (!code) throw new Error('Code OAuth tidak ditemukan.');
    const clientId = cleanText(process.env.GOOGLE_CLIENT_ID);
    const clientSecret = cleanText(process.env.GOOGLE_CLIENT_SECRET);
    if (!clientId || !clientSecret) throw new Error('GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET belum diset.');
    const redirectUri = getRedirectUri(req);
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const data = await tokenResponse.json().catch(() => ({}));
    if (!tokenResponse.ok) throw new Error(data.error_description || data.error || 'Gagal exchange token.');
    const refreshToken = cleanText(data.refresh_token);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!doctype html><html><body style="font-family:system-ui;padding:32px;line-height:1.5"><h1>Gmail OAuth selesai</h1>${refreshToken ? `<p>Copy nilai ini ke Vercel Environment Variable <b>GMAIL_REFRESH_TOKEN</b>:</p><textarea style="width:100%;height:120px">${refreshToken}</textarea>` : `<p><b>Refresh token tidak muncul.</b> Hapus akses aplikasi di Google Account Security, lalu buka /api/gmail-auth-url lagi dengan prompt consent.</p>`}<p>Setelah env var tersimpan, redeploy Vercel.</p></body></html>`);
  } catch (error) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(error?.message || 'OAuth gagal.');
  }
};
