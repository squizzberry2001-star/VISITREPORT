window.VISIT_EMAIL_CONFIG = {
  enabled: true,
  provider: 'vercel-gmail-api',
  endpoint: '/api/send-report-email',
  authStatusEndpoint: '/api/gmail-auth-status',
  sender: 'ISI_EMAIL_SENDER_LOCKED_DI_SINI',
  defaultTo: '',
  defaultCc: '',
  lockedPasscode: '607090',
  defaultSubjectTemplate: 'Visit Report - {store} - {date}',
  defaultBodyTemplate: 'Dear Team,\n\nBerikut kami lampirkan Visit Report untuk store {store}.\n\nAttachment:\n1. PDF Visit Report\n2. Excel CA Assignment\n\nTerima kasih.'
};
