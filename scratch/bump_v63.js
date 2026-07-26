const fs = require('fs');

const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/revamp287-trakteer-coffee-mobile-precise-v62/g, 'revamp288-trakteer-coffee-no-dot-v63');
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully bumped version to revamp288-trakteer-coffee-no-dot-v63 in index.html');
