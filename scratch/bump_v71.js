const fs = require('fs');
const files = [
    'c:/Antigravity Project Visit Web Report/index.html'
];
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/revamp290-ai-legacy-fix-v70/g, 'revamp290-ai-crash-fix-v71');
    fs.writeFileSync(f, content);
});
console.log('Bumped to v71');
