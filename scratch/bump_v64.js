const fs = require('fs');

const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/revamp288-trakteer-coffee-no-dot-v63/g, 'revamp289-welcome-subtitle-pre-line-v64');
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully bumped version to revamp289-welcome-subtitle-pre-line-v64 in index.html');
