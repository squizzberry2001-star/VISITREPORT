const { cleanText, getRedirectUri } = require('./_gmail-utils');

module.exports = async function handler(req, res) {
  const clientId = cleanText(process.env.GOOGLE_CLIENT_ID);
  if (!clientId) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('GOOGLE_CLIENT_ID belum diset di Vercel.');
    return;
  }
  const redirectUri = getRedirectUri(req);
  const scope = [
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send',
  ].join(' ');
  const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
  }).toString();
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!doctype html><html><body style="font-family:system-ui;padding:32px"><h1>Gmail OAuth</h1><p>Login memakai akun sender yang ingin dikunci.</p><p><a href="${url}" style="font-weight:700">Authorize Gmail Sender</a></p><p>Redirect URI: <code>${redirectUri}</code></p></body></html>`);
};
