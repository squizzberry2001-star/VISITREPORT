const fs = require('fs');
const path = require('path');

const VERSION_NAME = 'revamp325-login-icons-v59';

const filesToUpdate = [
    'src/app.js',
    'service-worker.js'
];

for (const file of filesToUpdate) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // app.js
    content = content.replace(/const APP_BUILD_VERSION = '[^']+';/, `const APP_BUILD_VERSION = '${VERSION_NAME}';`);
    
    // service-worker.js
    content = content.replace(/const CACHE_NAME = 'bestie-visit-[^']+';/, `const CACHE_NAME = 'bestie-visit-${VERSION_NAME}';`);
    content = content.replace(/const OFFLINE_VERSION = '[^']+';/, `const OFFLINE_VERSION = '${VERSION_NAME}';`);
    
    fs.writeFileSync(filePath, content, 'utf8');
}

// Update version.json
const versionJsonPath = path.join(__dirname, 'version.json');
if (fs.existsSync(versionJsonPath)) {
    const versionData = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'));
    versionData.version = VERSION_NAME;
    versionData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 4), 'utf8');
}

// Update index.html
const indexHtmlPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
    let content = fs.readFileSync(indexHtmlPath, 'utf8');
    // Replace <span id="app-version">...</span>
    content = content.replace(/<span id="app-version">[^<]+<\/span>/, `<span id="app-version">${VERSION_NAME}</span>`);
    fs.writeFileSync(indexHtmlPath, content, 'utf8');
}

console.log(`Bumped to ${VERSION_NAME}`);
