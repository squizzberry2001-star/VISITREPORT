const fs = require('fs');

const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/revamp286-trakteer-coffee-btn-v61/g, 'revamp287-trakteer-coffee-mobile-precise-v62');
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully bumped version to revamp287-trakteer-coffee-mobile-precise-v62 in index.html');
