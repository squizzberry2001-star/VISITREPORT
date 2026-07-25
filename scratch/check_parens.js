const fs = require('fs');
const content = fs.readFileSync('src/app.js', 'utf8');

const lines = content.split('\n');

for (let i = 4558; i <= 4610; i++) {
    console.log(`${i+1}: ${lines[i]}`);
}
