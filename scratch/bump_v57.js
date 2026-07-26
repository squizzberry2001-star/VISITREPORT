const fs = require('fs');

const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/revamp281-css-compiled-v56/g, 'revamp282-mobile-ready-v57');
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully bumped version to revamp282-mobile-ready-v57 in index.html');
