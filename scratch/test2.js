const keys = [
    { provider: 'gemini', key: atob('QVEuQWI4Uk42SUh4MlhZek9lZnA1UGltU3YydWtoRzBsV3RzWk5nNFBYZmtaMklrbC03c1E='), model: 'gemini-3.6-flash' }
];
async function testGemini() {
    const conf = keys[0];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${conf.model}:generateContent?key=${conf.key}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello' }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 2500 }
        })
    });
    const txt = await response.text();
    console.log('Response:', response.status, txt.slice(0, 100));
}
testGemini();
