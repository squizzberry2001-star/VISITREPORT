window.VISIT_EMAIL_CONFIG = {
  enabled: true,
  provider: 'vercel-gmail-api',

  endpoint: 'https://visitreport.vercel.app/api/send-report-email',
  authStatusEndpoint: 'https://visitreport.vercel.app/api/gmail-auth-status',

  sender: 'regional.bestie@familymartindonesia.com',

  defaultTo: '',
  defaultCc: '',

  defaultSubjectTemplate: 'Visit Report - {store} - {date}',

  defaultBodyTemplate: `Dear Team Store, AM, RM, FMCU,

Berikut saya lampirkan Visit Report untuk store {store}.

Attachment: 
1. PDF Visit Report
2. Excel CA Assignment

Terima kasih.
Best Regards,
`,


  requirePasscode: true,
  passcodeLabel: 'Kode Kirim'
};
