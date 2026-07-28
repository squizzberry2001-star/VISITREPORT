const fs = require('fs');
let f = fs.readFileSync('src/dashboard/dashboard_components.js', 'utf8');

f = f.replace(
    /qscTexts: analytics\.data\.qscTexts \|\| \[\],\s*opiTexts: analytics\.data\.opiTexts \|\| \[\],\s*storeFindings: analytics\.data\.storeFindings \|\| \[\],/g,
    'qscTexts: analytics.data.qscTexts || [],\n                            opiTexts: analytics.data.opiTexts || [],\n                            evidenceTexts: analytics.data.evidenceTexts || [],\n                            storeFindings: analytics.data.storeFindings || [],'
);

fs.writeFileSync('src/dashboard/dashboard_components.js', f);
