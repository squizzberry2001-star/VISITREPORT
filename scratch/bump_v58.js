const fs = require('fs');

const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/revamp282-mobile-ready-v57/g, 'revamp283-min1-target-v58');
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully bumped version to revamp283-min1-target-v58 in index.html');
