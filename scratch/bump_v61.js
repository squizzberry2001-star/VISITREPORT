const fs = require('fs');

const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/revamp285-fit-screen-grid-v60/g, 'revamp286-trakteer-coffee-btn-v61');
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully bumped version to revamp286-trakteer-coffee-btn-v61 in index.html');
