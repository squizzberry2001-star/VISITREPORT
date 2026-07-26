const fs = require('fs');

const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/revamp284-lb-weekday-reset-v59/g, 'revamp285-fit-screen-grid-v60');
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully bumped version to revamp285-fit-screen-grid-v60 in index.html');
