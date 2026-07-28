const fs = require('fs');
let f = fs.readFileSync('src/form-visit/form_components.js', 'utf8');

f = f.replace(
    /{ provider: 'gemini', key: DEFAULT_GEMINI_API_KEY, model: 'gemini-3.5-flash' },/,
    `{ provider: 'gemini', key: DEFAULT_GEMINI_API_KEY, model: 'gemini-3.5-flash' },\n        { provider: 'gemini', key: atob('QVEuQWI4Uk42Sm9uY1NoQTlzNnYtREJNRWJ5dU03U2IySTRheS03cEVWaDRTQmhKck5ReVE='), model: 'gemini-3.5-flash' },`
);

fs.writeFileSync('src/form-visit/form_components.js', f);
