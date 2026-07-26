const fs = require('fs');

const file = 'index.html';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/revamp289-welcome-subtitle-pre-line-v64/g, 'revamp290-welcome-global-pre-line-v65');
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully bumped version to revamp290-welcome-global-pre-line-v65 in index.html');
