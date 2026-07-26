const fs = require('fs');
let code = fs.readFileSync('c:/Antigravity Project Visit Web Report/src/app.js', 'utf8');
let m = code.match(/DEFAULT_GEMINI_API_KEY\s*=\s*['"]([^'"]+)['"]/);
(async () => {
  if(m) {
    console.log("Found key length: " + m[1].length);
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + m[1];
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'test' }] }] })
    });
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log("No key found");
  }
})();
