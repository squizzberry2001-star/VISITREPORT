const fs = require('fs');
let f = fs.readFileSync('src/form-visit/form_components.js', 'utf8');

f = f.replace(
    /async function callGeminiExecutiveSummary\(\{ qscTexts, opiTexts, storeFindings, totalVisits, topQSC, topOPI \}\) \{/,
    'async function callGeminiExecutiveSummary({ qscTexts, opiTexts, evidenceTexts, storeFindings, totalVisits, topQSC, topOPI }) {\n    const evidenceSample = (evidenceTexts || []).slice(0, 150).join(\' | \');'
);

f = f.replace(
    /Contoh temuan OPI dari lapangan:\n\$\{opiSample \|\| 'Tidak ada'\}/,
    'Contoh temuan OPI dari lapangan:\n${opiSample || \'Tidak ada\'}\n\nContoh temuan Evidence/Corrective Action dari lapangan:\n${evidenceSample || \'Tidak ada keterangan foto\'}'
);

fs.writeFileSync('src/form-visit/form_components.js', f);
