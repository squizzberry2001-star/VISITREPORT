const keys = [
    { provider: 'gemini', key: 'dummy', model: 'gemini-1.5-flash' },
    { provider: 'gemini', key: atob('QVEuQWI4Uk42Sm9uY1NoQTlzNnYtREJNRWJ5dU03U2IySTRheS03cEVWaDRTQmhKck5ReVE='), model: 'gemini-1.5-flash' },
    { provider: 'gemini', key: atob('QVEuQWI4Uk42SUh4MlhZek9lZnA1UGltU3YydWtoRzBsV3RzWk5nNFBYZmtaMklrbC03c1E='), model: 'gemini-1.5-flash' }
];

async function testGemini() {
    for (let conf of keys.slice(1)) {
        console.log('Testing', conf.key.slice(0,10));
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
}
testGemini();
