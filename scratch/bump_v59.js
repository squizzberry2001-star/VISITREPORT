const fs = require('fs');

const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/revamp283-min1-target-v58/g, 'revamp284-lb-weekday-reset-v59');
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully bumped version to revamp284-lb-weekday-reset-v59 in index.html');
