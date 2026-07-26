const React = require('react');
const ReactDOMServer = require('react-dom/server');
const fs = require('fs');

global.React = React;

// Mock window and document
global.window = {
    Chart: class { destroy() {} },
    location: { href: '' },
    rbvNavigateScreen: () => {},
    rbvGoSection: () => {},
    atob: () => '',
    btoa: () => '',
    Notification: {},
    RBV_PUSH_CONFIG: {}
};
global.document = {
    getElementById: () => ({}),
    createElement: () => ({}),
};
global.navigator = { userAgent: 'test' };
global.localStorage = { getItem: () => null, setItem: () => {} };
global.sessionStorage = { getItem: () => null, setItem: () => {} };
global.location = { href: '' };

const code = fs.readFileSync('c:/Antigravity Project Visit Web Report/src/app.js', 'utf8');
let modifiedCode = code.replace(/const root = ReactDOM\.createRoot\(document\.getElementById\('root'\)\);/, '');
modifiedCode = modifiedCode.replace(/root\.render\(React\.createElement\(App, null\)\);/, 'module.exports = { App, AnalyticsView, AiInsightsPanel };');

fs.writeFileSync('c:/Antigravity Project Visit Web Report/scratch/test_app.js', modifiedCode);

try {
    const { App, AnalyticsView, AiInsightsPanel } = require('c:/Antigravity Project Visit Web Report/scratch/test_app.js');
    console.log("Modules loaded successfully");

    const mockData = {
        storeFindings: [{storeName: 'Test', qscCount: 1, opiCount: 2, totalFindings: 3}],
        qscTexts: ['a'],
        opiTexts: ['b'],
        topQSC: [{keyword: 'a', count: 1}],
        topOPI: [{keyword: 'b', count: 1}],
        localTotalVisits: 1
    };

    const element = React.createElement(AnalyticsView, { history: [], scheduleConfig: {} });
    const html = ReactDOMServer.renderToString(element);
    console.log("AnalyticsView rendered without crashing (initial state).");
} catch (e) {
    console.error("ERROR CAUGHT:", e);
}
