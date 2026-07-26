const React = require('react');
const ReactDOMServer = require('react-dom/server');
const fs = require('fs');

global.React = React;
const { useState, useEffect, useCallback, useMemo, useRef } = React;
global.useState = useState;
global.useEffect = useEffect;
global.useCallback = useCallback;
global.useMemo = useMemo;
global.useRef = useRef;

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
global.document = { getElementById: () => ({}), createElement: () => ({}) };
global.navigator = { userAgent: 'test' };
global.localStorage = { getItem: () => null, setItem: () => {} };
global.sessionStorage = { getItem: () => null, setItem: () => {} };
global.location = { href: '' };

const code = fs.readFileSync('c:/Antigravity Project Visit Web Report/src/app.js', 'utf8');
let modifiedCode = code.replace(/const root = ReactDOM\.createRoot\(document\.getElementById\('root'\)\);/, '');
modifiedCode = modifiedCode.replace(/root\.render\(React\.createElement\(App, null\)\);/, 'module.exports = { App, AnalyticsView, AiInsightsPanel, SimpleChart, Icon };');
// mock readFeaturesConfig
modifiedCode = modifiedCode.replace(/function readFeaturesConfig\(\) \{[\s\S]*?return \{[\s\S]*?\};[\s\S]*?\}/, 'function readFeaturesConfig() { return { ai_exec_summary: true, leaderboard: true }; }');

fs.writeFileSync('c:/Antigravity Project Visit Web Report/scratch/test_app.js', modifiedCode);

try {
    const { AnalyticsView } = require('c:/Antigravity Project Visit Web Report/scratch/test_app.js');
    
    // We need to override useState to return our mockData immediately for loading=false and data=mockData
    global.useState = (initial) => {
        if (initial === true) return [false, () => {}]; // loading state
        if (initial === null) return [{
            storeFindings: [{storeName: 'Test', qscCount: 1, opiCount: 2, totalFindings: 3}],
            qscTexts: ['a'],
            opiTexts: ['b'],
            topQSC: [{keyword: 'a', count: 1}],
            topOPI: [{keyword: 'b', count: 1}],
            localTotalVisits: 1
        }, () => {}]; // data state
        return [initial, () => {}];
    };
    
    const element = React.createElement(AnalyticsView, { history: [], scheduleConfig: {} });
    ReactDOMServer.renderToString(element);
    console.log("AnalyticsView FULL RENDER without crashing!");

} catch (e) {
    console.error("ERROR CAUGHT:", e);
}
