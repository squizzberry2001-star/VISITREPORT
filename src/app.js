const { useEffect, useMemo, useRef, useState } = React;
// =============================================================
// Data helpers
// =============================================================
const BESTIE_ASSIGNMENTS = Array.isArray(window.BESTIE_STORE_DATA) ? window.BESTIE_STORE_DATA : [];
const MASTER_STORES = Array.isArray(window.DEFAULT_STORE_MASTER_DATA) ? window.DEFAULT_STORE_MASTER_DATA : [];
const JOB_LEVELS = ['', '1A', 'NS3', 'NS1', 'MG3', 'MG1'];
const HISTORY_META_KEY = 'rbv_react_history_meta_v3';
const ACTIVE_VISIT_KEY = 'rbv_react_active_visit_v3';
const MANUAL_STORE_REQUEST_KEY = 'rbv_manual_store_requests_v6';
const MANUAL_STORE_APPROVED_KEY = 'rbv_manual_store_approved_v6';
const REPORT_DB_NAME = 'regional_bestie_visit_react_db';
const REPORT_DB_STORE = 'visits';
const WELCOME_CONFIG_KEY = 'rbv_welcome_config_v1';
const WELCOME_SEEN_KEY = 'rbv_welcome_seen_v1';
const DEFAULT_WELCOME_CONFIG = {
    title: 'Hallo! Bestie',
    subtitle: '“Sudahkah kalian bahagia hari ini?, Semangat ya kerjanya”'
};
const SESSION_ID = `react_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
function cx(...classes) {
    return classes.filter(Boolean).join(' ');
}
function cleanText(value, fallback = '') {
    const raw = value === undefined || value === null ? '' : String(value).trim();
    return raw || fallback;
}
function confirmAction(message) {
    return window.confirm(message || 'Lanjutkan tindakan ini?');
}
function richValue(value) {
    return value === undefined || value === null ? '' : String(value);
}
function normalize(value) {
    return cleanText(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}
function uniqueBy(items, keyFn) {
    const seen = new Set();
    const result = [];
    items.forEach((item) => {
        const key = keyFn(item);
        if (!key || seen.has(key))
            return;
        seen.add(key);
        result.push(item);
    });
    return result;
}
function readJsonArray(key) {
    try {
        const parsed = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    }
    catch (error) {
        return [];
    }
}
function saveJsonArray(key, items) {
    const safeItems = Array.isArray(items) ? items : [];
    localStorage.setItem(key, JSON.stringify(safeItems));
    return safeItems;
}
function readWelcomeConfig() {
    try {
        const parsed = JSON.parse(localStorage.getItem(WELCOME_CONFIG_KEY) || '{}');
        return {
            title: cleanText(parsed.title, DEFAULT_WELCOME_CONFIG.title),
            subtitle: cleanText(parsed.subtitle, DEFAULT_WELCOME_CONFIG.subtitle)
        };
    }
    catch (error) {
        return { ...DEFAULT_WELCOME_CONFIG };
    }
}
function saveWelcomeConfig(config) {
    const next = {
        title: cleanText(config && config.title, DEFAULT_WELCOME_CONFIG.title),
        subtitle: cleanText(config && config.subtitle, DEFAULT_WELCOME_CONFIG.subtitle)
    };
    localStorage.setItem(WELCOME_CONFIG_KEY, JSON.stringify(next));
    return next;
}
function readManualStoreRequests() {
    return readJsonArray(MANUAL_STORE_REQUEST_KEY);
}
function saveManualStoreRequests(items) {
    return saveJsonArray(MANUAL_STORE_REQUEST_KEY, items);
}
function readApprovedManualStores() {
    return readJsonArray(MANUAL_STORE_APPROVED_KEY);
}
function saveApprovedManualStores(items) {
    return saveJsonArray(MANUAL_STORE_APPROVED_KEY, uniqueBy(items, (item) => normalize(item.storeName || item.siteDescr || item.label)));
}
function createManualStoreRequest(payload) {
    const now = Date.now();
    const request = {
        id: `manual_store_${now}_${Math.random().toString(36).slice(2, 8)}`,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        bestieName: cleanText(payload.bestieName),
        storeName: cleanText(payload.storeName),
        storeCode: cleanText(payload.storeCode),
        address: cleanText(payload.address),
        note: cleanText(payload.note)
    };
    saveManualStoreRequests([request, ...readManualStoreRequests()]);
    syncManualRequestToConvex(request);
    return request;
}
function approveManualStoreRequest(id) {
    const now = Date.now();
    const requests = readManualStoreRequests();
    let approved = null;
    const nextRequests = requests.map((item) => {
        if (item.id !== id)
            return item;
        approved = { ...item, status: 'approved', updatedAt: now };
        return approved;
    });
    saveManualStoreRequests(nextRequests);
    if (approved) {
        saveApprovedManualStores([{
                siteDescr: approved.storeName,
                storeName: approved.storeName,
                siteCode: approved.storeCode,
                siteCode4: approved.storeCode,
                address: approved.address,
                city: '',
                source: 'manual-approved',
                approvedAt: now,
                requestedBy: approved.bestieName
            }, ...readApprovedManualStores()]);
        syncManualRequestStatusToConvex(approved);
    }
    return approved;
}
function rejectManualStoreRequest(id) {
    const now = Date.now();
    let rejected = null;
    const nextRequests = readManualStoreRequests().map((item) => {
        if (item.id !== id)
            return item;
        rejected = { ...item, status: 'rejected', updatedAt: now };
        return rejected;
    });
    saveManualStoreRequests(nextRequests);
    if (rejected)
        syncManualRequestStatusToConvex(rejected);
}
function findApprovedManualStore(storeName) {
    const key = normalize(storeName);
    if (!key)
        return null;
    return readApprovedManualStores().find((item) => normalize(item.storeName || item.siteDescr) === key || normalize(item.siteCode || item.siteCode4) === key) || null;
}
const BESTIE_NAMES = uniqueBy(BESTIE_ASSIGNMENTS.map((item) => cleanText(item.bestieName)).filter(Boolean).sort((a, b) => a.localeCompare(b)), (item) => item);
function getStoreLabel(item) {
    return cleanText((item === null || item === void 0 ? void 0 : item.storeName) || (item === null || item === void 0 ? void 0 : item.assignmentStoreName) || (item === null || item === void 0 ? void 0 : item.siteDescr) || (item === null || item === void 0 ? void 0 : item.store));
}
function getStoresForBestie(bestieName) {
    const key = normalize(bestieName);
    const assigned = BESTIE_ASSIGNMENTS
        .filter((item) => !key || normalize(item.bestieName) === key)
        .map((item) => ({
        label: getStoreLabel(item),
        source: 'assignment',
        assignment: item,
        value: getStoreLabel(item)
    }))
        .filter((item) => item.label);
    const approvedManual = readApprovedManualStores().map((item) => ({
        label: cleanText(item.storeName || item.siteDescr),
        source: 'manual-approved',
        master: item,
        value: cleanText(item.storeName || item.siteDescr)
    })).filter((item) => item.label);
    const fallback = MASTER_STORES.map((item) => ({
        label: cleanText(item.siteDescr),
        source: 'master',
        master: item,
        value: cleanText(item.siteDescr)
    })).filter((item) => item.label);
    const base = assigned.length ? assigned : fallback;
    return uniqueBy([...base, ...approvedManual], (item) => normalize(item.label))
        .sort((a, b) => a.label.localeCompare(b.label));
}
function findAssignmentStore(storeName, bestieName) {
    const storeKey = normalize(storeName);
    const bestieKey = normalize(bestieName);
    if (!storeKey)
        return null;
    return BESTIE_ASSIGNMENTS.find((item) => {
        const sameStore = normalize(item.storeName) === storeKey || normalize(item.assignmentStoreName) === storeKey;
        const sameBestie = !bestieKey || normalize(item.bestieName) === bestieKey;
        return sameStore && sameBestie;
    }) || BESTIE_ASSIGNMENTS.find((item) => normalize(item.storeName) === storeKey || normalize(item.assignmentStoreName) === storeKey) || null;
}
function findMasterStore(storeName) {
    const key = normalize(storeName);
    if (!key)
        return null;
    return MASTER_STORES.find((item) => normalize(item.siteDescr) === key || normalize(item.siteCode) === key || normalize(item.siteCode4) === key) || null;
}
function getStoreWebDetail(storeName) {
    const assignment = findAssignmentStore(storeName);
    const approvedManual = findApprovedManualStore(storeName);
    const master = findMasterStore(storeName || (assignment === null || assignment === void 0 ? void 0 : assignment.storeName) || (assignment === null || assignment === void 0 ? void 0 : assignment.assignmentStoreName) || (approvedManual === null || approvedManual === void 0 ? void 0 : approvedManual.siteDescr) || (approvedManual === null || approvedManual === void 0 ? void 0 : approvedManual.storeName));
    const merged = {
        ...(assignment || {}),
        ...(master || {}),
        ...(approvedManual || {})
    };
    if (!merged.siteDescr)
        merged.siteDescr = (approvedManual === null || approvedManual === void 0 ? void 0 : approvedManual.storeName) || (assignment === null || assignment === void 0 ? void 0 : assignment.storeName) || (assignment === null || assignment === void 0 ? void 0 : assignment.assignmentStoreName) || storeName || '';
    if (!merged.address)
        merged.address = (assignment === null || assignment === void 0 ? void 0 : assignment.storeAddress) || '';
    if (!merged.siteCode && (assignment === null || assignment === void 0 ? void 0 : assignment.storeCode))
        merged.siteCode = assignment.storeCode;
    if (!merged.siteCode4 && (assignment === null || assignment === void 0 ? void 0 : assignment.storeCode))
        merged.siteCode4 = assignment.storeCode;
    if (!merged.storeHead && (assignment === null || assignment === void 0 ? void 0 : assignment.storeHead))
        merged.storeHead = assignment.storeHead;
    if (!merged.areaManager && (assignment === null || assignment === void 0 ? void 0 : assignment.areaManager))
        merged.areaManager = assignment.areaManager;
    if (!merged.regionalManager && (assignment === null || assignment === void 0 ? void 0 : assignment.regionalManager))
        merged.regionalManager = assignment.regionalManager;
    if (!merged.city && (assignment === null || assignment === void 0 ? void 0 : assignment.city))
        merged.city = assignment.city;
    return merged;
}
window.getStoreWebDetail = getStoreWebDetail;
function formatDate(value) {
    if (!value)
        return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return value;
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatDateTime(value) {
    if (!value)
        return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return '-';
    return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function formatBytes(bytes) {
    const value = Number(bytes || 0);
    if (value < 1024)
        return `${value} B`;
    if (value < 1024 * 1024)
        return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / 1024 / 1024).toFixed(2)} MB`;
}
function calcLocalStorageBytes() {
    let total = 0;
    try {
        for (let index = 0; index < localStorage.length; index += 1) {
            const key = localStorage.key(index) || '';
            total += key.length + (localStorage.getItem(key) || '').length;
        }
    }
    catch (error) { }
    return total * 2;
}
function blankObservationRow() {
    return { temuan: '', kondisiIdeal: '', dampak: '', penyebab: '', tindakan: '', deadline: '', hasil: '' };
}
function blankPhoto() {
    return { image: '', description: '' };
}
function normalizeQscPhotos(visit) {
    const legacy = (visit === null || visit === void 0 ? void 0 : visit.qscResultPhoto) ? [visit.qscResultPhoto] : [];
    const source = Array.isArray(visit === null || visit === void 0 ? void 0 : visit.qscResultPhotos) && visit.qscResultPhotos.length ? visit.qscResultPhotos : legacy;
    const firstTwo = [0, 1].map((index) => source[index] || blankPhoto());
    return firstTwo;
}
function createVisit(bestieName = '', storeName = '') {
    const detail = getStoreWebDetail(storeName);
    const now = Date.now();
    return {
        id: `visit_${now}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: now,
        updatedAt: now,
        nama: cleanText(bestieName),
        store: cleanText(storeName || detail.siteDescr),
        tanggal: new Date().toISOString().slice(0, 10),
        storeLeader: '',
        storeLeaderLevel: '',
        shiftLeader: '',
        shiftLeaderLevel: '',
        crewList: [{ name: '', level: '' }],
        qscResultPhoto: blankPhoto(),
        qscResultPhotos: [blankPhoto(), blankPhoto()],
        opiData: [blankObservationRow()],
        qscData: [blankObservationRow()],
        findingEvidencePhotos: Array.from({ length: 8 }, () => blankPhoto()),
        correctiveActionPhotos: Array.from({ length: 8 }, () => blankPhoto()),
        storeAssignmentLink: 'https://tinyurl.com/store-caassignment',
        showQSCResult: false,
        showOPITable: false,
        showQSCTable: false,
        showFindingEvidence: false,
        showCorrectiveAction: false
    };
}
function isMeaningfulObservation(row) {
    return ['temuan', 'kondisiIdeal', 'dampak', 'penyebab', 'tindakan', 'deadline', 'hasil'].some((key) => cleanText(row === null || row === void 0 ? void 0 : row[key]));
}
function isEditableTarget(target) {
    const node = target instanceof Element ? target : null;
    if (!node)
        return false;
    return Boolean(node.closest('input, textarea, select, [contenteditable="true"], .rich-editor-input, .form-control'));
}
function visitProgress(visit) {
    if (!visit)
        return 0;
    const checks = [
        cleanText(visit.nama),
        cleanText(visit.store),
        cleanText(visit.tanggal),
        cleanText(visit.storeLeader),
        cleanText(visit.shiftLeader),
        normalizeQscPhotos(visit).every((photo) => photo.image),
        (visit.opiData || []).some(isMeaningfulObservation),
        (visit.qscData || []).some(isMeaningfulObservation),
        (visit.findingEvidencePhotos || []).some((photo) => photo.image || cleanText(photo.description)),
        (visit.correctiveActionPhotos || []).some((photo) => photo.image || cleanText(photo.description))
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
function historyMetaFromVisit(visit) {
    const detail = getStoreWebDetail(visit === null || visit === void 0 ? void 0 : visit.store);
    return {
        id: visit.id,
        bestieName: cleanText(visit.nama, '-'),
        storeName: cleanText(visit.store, '-'),
        storeCode: cleanText(detail.siteCode4 || detail.siteCode || detail.storeCode || visit.storeCode),
        visitDate: cleanText(visit.tanggal, ''),
        updatedAt: visit.updatedAt || Date.now(),
        createdAt: visit.createdAt || Date.now(),
        progress: visitProgress(visit)
    };
}
function readHistoryMeta() {
    try {
        const parsed = JSON.parse(localStorage.getItem(HISTORY_META_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    }
    catch (error) {
        return [];
    }
}
function saveHistoryMeta(items) {
    const next = uniqueBy(items.filter((item) => item && item.id), (item) => item.id)
        .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
        .slice(0, 80);
    localStorage.setItem(HISTORY_META_KEY, JSON.stringify(next));
    return next;
}
let dbPromise = null;
function openDb() {
    if (dbPromise)
        return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            reject(new Error('IndexedDB tidak tersedia di browser ini.'));
            return;
        }
        const request = indexedDB.open(REPORT_DB_NAME, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(REPORT_DB_STORE))
                db.createObjectStore(REPORT_DB_STORE, { keyPath: 'id' });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    return dbPromise;
}
async function putVisitRecord(visit) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(REPORT_DB_STORE, 'readwrite');
        tx.objectStore(REPORT_DB_STORE).put({ id: visit.id, updatedAt: Date.now(), data: visit });
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}
async function getVisitRecord(id) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(REPORT_DB_STORE, 'readonly');
        const request = tx.objectStore(REPORT_DB_STORE).get(id);
        request.onsuccess = () => { var _a; return resolve(((_a = request.result) === null || _a === void 0 ? void 0 : _a.data) || null); };
        request.onerror = () => reject(request.error);
    });
}
async function deleteVisitRecord(id) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(REPORT_DB_STORE, 'readwrite');
        tx.objectStore(REPORT_DB_STORE).delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}
async function clearVisitRecords() {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(REPORT_DB_STORE, 'readwrite');
        tx.objectStore(REPORT_DB_STORE).clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
    });
}
function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}
// =============================================================
// Atomic components
// =============================================================
function Icon({ name, className = 'h-5 w-5', strokeWidth = 2 }) {
    const paths = {
        home: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M3 10.5 12 3l9 7.5" }),
            React.createElement("path", { d: "M5 9.5V21h14V9.5" }),
            React.createElement("path", { d: "M9 21v-6h6v6" })),
        clipboard: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M9 3h6l1 2h3v16H5V5h3l1-2Z" }),
            React.createElement("path", { d: "M9 8h6" }),
            React.createElement("path", { d: "M8 13h8" }),
            React.createElement("path", { d: "M8 17h5" })),
        camera: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M4 8h3l2-3h6l2 3h3v11H4V8Z" }),
            React.createElement("circle", { cx: "12", cy: "13.5", r: "3.5" })),
        gallery: React.createElement(React.Fragment, null,
            React.createElement("rect", { x: "4", y: "5", width: "16", height: "14", rx: "2" }),
            React.createElement("path", { d: "m7 16 3.5-3.5 2.5 2.5 2-2 2 3" }),
            React.createElement("circle", { cx: "9", cy: "9", r: "1.2" })),
        marker: React.createElement(React.Fragment, null,
            React.createElement("circle", { cx: "12", cy: "12", r: "7" }),
            React.createElement("path", { d: "M12 8v8" }),
            React.createElement("path", { d: "M8 12h8" })),
        crop: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M6 3v12h12" }),
            React.createElement("path", { d: "M3 6h12v12" }),
            React.createElement("path", { d: "M18 15v6" }),
            React.createElement("path", { d: "M15 18h6" })),
        trash: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M4 7h16" }),
            React.createElement("path", { d: "M9 7V4h6v3" }),
            React.createElement("path", { d: "M7 7l1 14h8l1-14" }),
            React.createElement("path", { d: "M10 11v6" }),
            React.createElement("path", { d: "M14 11v6" })),
        pdf: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M6 3h8l4 4v14H6V3Z" }),
            React.createElement("path", { d: "M14 3v5h5" }),
            React.createElement("path", { d: "M8 15h8" }),
            React.createElement("path", { d: "M8 18h5" })),
        excel: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M4 5h16v14H4V5Z" }),
            React.createElement("path", { d: "M8 5v14" }),
            React.createElement("path", { d: "M4 10h16" }),
            React.createElement("path", { d: "M4 14h16" }),
            React.createElement("path", { d: "m11 12 4 4" }),
            React.createElement("path", { d: "m15 12-4 4" })),
        plus: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M12 5v14" }),
            React.createElement("path", { d: "M5 12h14" })),
        left: React.createElement("path", { d: "m15 18-6-6 6-6" }),
        right: React.createElement("path", { d: "m9 18 6-6-6-6" }),
        user: React.createElement(React.Fragment, null,
            React.createElement("circle", { cx: "12", cy: "8", r: "4" }),
            React.createElement("path", { d: "M4 21c1.8-4 4.5-6 8-6s6.2 2 8 6" })),
        store: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M4 9h16l-1.5-5h-13L4 9Z" }),
            React.createElement("path", { d: "M5 9v12h14V9" }),
            React.createElement("path", { d: "M9 21v-6h6v6" }),
            React.createElement("path", { d: "M4 9c.8 2 3.2 2 4 0 .8 2 3.2 2 4 0 .8 2 3.2 2 4 0 .8 2 3.2 2 4 0" })),
        calendar: React.createElement(React.Fragment, null,
            React.createElement("rect", { x: "4", y: "5", width: "16", height: "16", rx: "2" }),
            React.createElement("path", { d: "M8 3v4" }),
            React.createElement("path", { d: "M16 3v4" }),
            React.createElement("path", { d: "M4 10h16" })),
        spark: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" }),
            React.createElement("path", { d: "M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" })),
        image: React.createElement(React.Fragment, null,
            React.createElement("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }),
            React.createElement("path", { d: "m4 16 5-5 4 4 2-2 5 5" })),
        shield: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" }),
            React.createElement("path", { d: "m9 12 2 2 4-5" })),
        download: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M12 3v12" }),
            React.createElement("path", { d: "m7 10 5 5 5-5" }),
            React.createElement("path", { d: "M5 21h14" })),
        eye: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" }),
            React.createElement("circle", { cx: "12", cy: "12", r: "3" })),
        eraser: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "m3 17 9-9 6 6-6 6H7l-4-3Z" }),
            React.createElement("path", { d: "m14 6 4-4 4 4-4 4" }),
            React.createElement("path", { d: "M12 20h9" })),
        close: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M6 6l12 12" }),
            React.createElement("path", { d: "M18 6 6 18" })),
        search: React.createElement(React.Fragment, null,
            React.createElement("circle", { cx: "11", cy: "11", r: "7" }),
            React.createElement("path", { d: "m20 20-3.5-3.5" })),
        menu: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M4 6h16" }),
            React.createElement("path", { d: "M4 12h16" }),
            React.createElement("path", { d: "M4 18h16" })),
        check: React.createElement("path", { d: "m5 13 4 4L19 7" })
    };
    return (React.createElement("svg", { className: className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, paths[name] || paths.spark));
}
function Button({ variant = 'primary', className = '', icon, children, ...props }) {
    const styles = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        danger: 'btn-danger',
        icon: 'btn-icon'
    };
    return (React.createElement("button", { className: cx(styles[variant] || styles.primary, className), ...props },
        icon ? React.createElement(Icon, { name: icon, className: "h-5 w-5" }) : null,
        children));
}
function Badge({ children, tone = 'default' }) {
    const tones = {
        default: 'bg-slate-100 text-slate-700 ring-slate-200',
        success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
        warning: 'bg-orange-50 text-orange-800 ring-orange-200',
        dark: 'bg-slate-900 text-white ring-slate-900'
    };
    return React.createElement("span", { className: cx('inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1', tones[tone]) }, children);
}
function Field({ label, helper, children, required }) {
    return (React.createElement("label", { className: "block" },
        React.createElement("span", { className: "mb-2 flex items-center gap-1 text-sm font-bold text-slate-800" },
            label,
            required ? React.createElement("span", { className: "text-rose-600" }, "*") : null),
        children,
        helper ? React.createElement("span", { className: "mt-2 block text-xs leading-5 text-slate-500" }, helper) : null));
}
function TextInput(props) {
    return React.createElement("input", { className: cx('form-control', props.className), ...props });
}
function DateInput({ className = '', ...props }) {
    return React.createElement("input", { type: "date", className: cx('form-control date-control', className), ...props });
}
function TextArea({ value, onChange, className = '', minRows = 3, ...props }) {
    const ref = useRef(null);
    function resize() {
        const el = ref.current;
        if (!el)
            return;
        el.style.height = 'auto';
        el.style.height = Math.max(46, el.scrollHeight) + 'px';
    }
    useEffect(() => { resize(); }, [value]);
    return (React.createElement("textarea", { ref: ref, className: cx('form-control auto-grow-textarea', className), value: value || '', rows: minRows, onChange: (event) => { onChange === null || onChange === void 0 ? void 0 : onChange(event); window.requestAnimationFrame(resize); }, onInput: resize, ...props }));
}
function RichTextInput({ value, onChange, placeholder = 'Tulis catatan...', className = '', minHeight = 112 }) {
    const editorRef = useRef(null);
    const [activeTools, setActiveTools] = useState({});
    function plainContent(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html || '';
        return temp.textContent || temp.innerText || '';
    }
    function isEmpty(html) {
        return !plainContent(html).replace(/[\u200B\s]/g, '');
    }
    function normalizeEmptyMarkup(html) {
        return isEmpty(html) ? '' : html;
    }
    useEffect(() => {
        const editor = editorRef.current;
        if (!editor || document.activeElement === editor)
            return;
        const nextHtml = richValue(value);
        if (editor.innerHTML !== nextHtml)
            editor.innerHTML = nextHtml;
    }, [value]);
    function readToolState() {
        const next = {};
        ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'].forEach((name) => {
            try {
                next[name] = document.queryCommandState(name);
            }
            catch (error) {
                next[name] = false;
            }
        });
        return next;
    }
    useEffect(() => {
        function updateToolbarState() {
            const editor = editorRef.current;
            if (!editor || !editor.contains(document.activeElement))
                return;
            setActiveTools(readToolState());
        }
        document.addEventListener('selectionchange', updateToolbarState);
        return () => document.removeEventListener('selectionchange', updateToolbarState);
    }, []);
    function emit() {
        const html = editorRef.current ? editorRef.current.innerHTML : '';
        onChange(normalizeEmptyMarkup(html));
    }
    function focusLastEditableNode(container) {
        const selection = window.getSelection();
        const range = document.createRange();
        const target = container.querySelector('li') || container;
        range.selectNodeContents(target);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    function seedList(commandName) {
        const editor = editorRef.current;
        if (!editor)
            return;
        editor.innerHTML = commandName === 'insertUnorderedList' ? '<ul><li><br></li></ul>' : '<ol><li><br></li></ol>';
        focusLastEditableNode(editor);
        onChange(editor.innerHTML);
        setActiveTools((current) => ({ ...current, [commandName]: true }));
    }
    function command(name, argument = null) {
        const editor = editorRef.current;
        if (!editor)
            return;
        const listCommand = name === 'insertUnorderedList' || name === 'insertOrderedList';
        editor.focus({ preventScroll: true });
        if (listCommand && isEmpty(editor.innerHTML)) {
            seedList(name);
            return;
        }
        try {
            document.execCommand(name, false, argument);
        }
        catch (error) { }
        emit();
        window.requestAnimationFrame(() => setActiveTools(readToolState()));
    }
    function handleKeyDown(event) {
        if (event.key !== 'Enter')
            return;
        const editor = editorRef.current;
        if (!editor)
            return;
        window.requestAnimationFrame(() => {
            if (isEmpty(editor.innerHTML)) {
                editor.innerHTML = '';
                onChange('');
            }
        });
    }
    const tools = [
        { command: 'bold', label: 'B', title: 'Bold', className: 'rich-tool-bold' },
        { command: 'italic', label: 'I', title: 'Italic', className: 'rich-tool-italic' },
        { command: 'underline', label: 'U', title: 'Underline', className: 'rich-tool-underline' },
        { command: 'insertUnorderedList', label: '•', title: 'Bullet', className: 'rich-tool-bullet' },
        { command: 'insertOrderedList', label: '1.', title: 'Number', className: 'rich-tool-number' }
    ];
    function focusEditor() {
        const editor = editorRef.current;
        if (!editor || document.activeElement === editor)
            return;
        editor.focus({ preventScroll: true });
    }
    return (React.createElement("div", { className: cx('rich-editor rounded-2xl border border-slate-200 bg-white', className) },
        React.createElement("div", { ref: editorRef, className: "rich-editor-input px-3 py-3 text-sm leading-6 text-slate-900 outline-none", style: { minHeight }, contentEditable: true, role: "textbox", "aria-multiline": "true", "data-placeholder": placeholder, tabIndex: 0, onClick: focusEditor, onInput: emit, onBlur: emit, onKeyDown: handleKeyDown, suppressContentEditableWarning: true }),
        React.createElement("div", { className: "rich-toolbar flex flex-wrap gap-1 border-t border-slate-200 p-2", "aria-label": "Rich text toolbar" }, tools.map((tool) => (React.createElement("button", { key: tool.command, type: "button", "data-command": tool.command, className: cx('rich-tool-button', tool.className, activeTools[tool.command] && 'active'), onPointerDown: (event) => { event.preventDefault(); command(tool.command); }, "aria-label": tool.title, title: tool.title }, tool.label))))));
}
function SelectInput({ children, className = '', ...props }) {
    return React.createElement("select", { className: cx('form-control appearance-none', className), ...props }, children);
}
function SelectField({ label, value, options, onChange, placeholder = 'Pilih', required, icon }) {
    const normalizedOptions = (options || []).map((item) => typeof item === 'string' ? { label: item, value: item } : item);
    return (React.createElement(Field, { label: label, required: required },
        React.createElement("div", { className: "select-field-wrap relative" },
            icon ? React.createElement("span", { className: "select-field-icon pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-slate-400" },
                React.createElement(Icon, { name: icon, className: "h-5 w-5" })) : null,
            React.createElement(SelectInput, { value: value || '', onChange: (event) => onChange(event.target.value), className: cx('select-control', icon ? 'has-leading-icon' : ''), required: required },
                React.createElement("option", { value: "" }, placeholder),
                normalizedOptions.map((item) => React.createElement("option", { key: (item.value || '') + '-' + item.label, value: item.value || item.label }, item.label))))));
}
function Toggle({ checked, onChange, label, className = '' }) {
    return (React.createElement("button", { type: "button", role: "switch", "aria-checked": checked, onClick: () => onChange(!checked), className: cx('slide-toggle', checked && 'active', className) },
        label ? React.createElement("span", { className: "slide-toggle-label" }, label) : null,
        React.createElement("span", { className: "slide-toggle-track", "aria-hidden": "true" },
            React.createElement("span", null))));
}
function EmptyState({ icon = 'spark', title, children, action }) {
    return (React.createElement("div", { className: "surface-card flex flex-col items-center justify-center rounded-[28px] px-6 py-10 text-center" },
        React.createElement("div", { className: "mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-audit-primary" },
            React.createElement(Icon, { name: icon, className: "h-6 w-6" })),
        React.createElement("h3", { className: "text-lg font-extrabold text-slate-950" }, title),
        children ? React.createElement("p", { className: "mt-2 max-w-md text-sm leading-6 text-slate-600" }, children) : null,
        action ? React.createElement("div", { className: "mt-5" }, action) : null));
}
function InactiveSection({ title }) {
    return (React.createElement("div", { className: "inactive-section surface-card rounded-[28px] p-6 text-center md:p-8" },
        React.createElement("div", { className: "mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500" },
            React.createElement(Icon, { name: "eye", className: "h-6 w-6" })),
        React.createElement("h3", { className: "text-lg font-extrabold text-slate-950" }, title)));
}
// =============================================================
// Molecules
// =============================================================
function SearchableCombobox({ label, value, options, onChange, onSelect, placeholder, required, helper, icon = 'search' }) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);
    const normalizedOptions = (options || []).map((item) => typeof item === 'string' ? { label: item, value: item } : item);
    const query = normalize(value);
    const visible = normalizedOptions
        .filter((item) => !query || normalize(item.label).includes(query) || normalize(item.value).includes(query) || normalize(item.meta).includes(query))
        .slice(0, 12);
    useEffect(() => {
        function handleOutside(event) {
            if (!wrapRef.current || wrapRef.current.contains(event.target))
                return;
            setOpen(false);
        }
        document.addEventListener('pointerdown', handleOutside);
        return () => document.removeEventListener('pointerdown', handleOutside);
    }, []);
    function choose(item) {
        onSelect ? onSelect(item) : onChange(item.value || item.label);
        setOpen(false);
        window.requestAnimationFrame(() => {
            var _a;
            const input = (_a = wrapRef.current) === null || _a === void 0 ? void 0 : _a.querySelector('input');
            input === null || input === void 0 ? void 0 : input.blur();
        });
    }
    return (React.createElement(Field, { label: label, required: required, helper: helper },
        React.createElement("div", { ref: wrapRef, className: "combo-wrap relative" },
            React.createElement("div", { className: "pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400" },
                React.createElement(Icon, { name: icon, className: "h-5 w-5" })),
            React.createElement(TextInput, { value: value || '', onChange: (event) => { onChange(event.target.value); setOpen(true); }, onFocus: () => setOpen(true), placeholder: placeholder, className: "pl-12 pr-12", "aria-autocomplete": "list", "aria-expanded": open, required: required }),
            React.createElement("button", { type: "button", className: "absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100", onClick: () => setOpen((state) => !state), "aria-label": "Buka pilihan" },
                React.createElement(Icon, { name: "right", className: cx('h-4 w-4 transition', open ? 'rotate-90' : '') })),
            open ? (React.createElement("div", { className: "combo-panel absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-soft" }, visible.length ? visible.map((item) => (React.createElement("button", { type: "button", key: (item.value || '') + '-' + item.label, className: "combo-option flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50 active:bg-emerald-50", onClick: () => choose(item) },
                React.createElement("span", { className: "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-50 text-audit-primary" },
                    React.createElement(Icon, { name: icon === 'store' ? 'store' : 'user', className: "h-4 w-4" })),
                React.createElement("span", null,
                    React.createElement("span", { className: "block text-sm font-bold text-slate-900" }, item.label),
                    item.meta ? React.createElement("span", { className: "mt-0.5 block text-xs text-slate-500" }, item.meta) : null)))) : React.createElement("div", { className: "px-4 py-5 text-sm text-slate-500" }, "Tidak ada hasil. Nilai yang diketik tetap bisa digunakan sebagai data manual."))) : null)));
}
function StoreDetailCard({ detail }) {
    const items = [
        ['Kode', detail.siteCode4 || detail.siteCode || detail.storeCode || '-'],
        ['Tipe', detail.type || '-'],
        ['Kota', detail.city || '-'],
        ['Store Head', detail.storeHead || '-'],
        ['Area Manager', detail.areaManager || '-'],
        ['Regional Manager', detail.regionalManager || '-'],
        ['Email Store', detail.emailStore || '-'],
        ['Alamat', detail.address || detail.storeAddress || '-']
    ];
    return (React.createElement("div", { className: "store-detail-card surface-card rounded-[24px] p-4 md:rounded-[28px] md:p-6" },
        React.createElement("div", { className: "mb-4 flex min-w-0 items-center justify-between gap-3" },
            React.createElement("div", { className: "min-w-0" },
                React.createElement("p", { className: "text-xs font-bold uppercase tracking-[0.2em] text-audit-primary" }, "Detail Store"),
                React.createElement("h3", { className: "mt-1 break-words text-lg font-extrabold leading-tight text-slate-950 md:text-xl" }, detail.siteDescr || detail.storeName || 'Store belum dipilih')),
            React.createElement("div", { className: "hidden h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-white md:grid" },
                React.createElement(Icon, { name: "store", className: "h-6 w-6" }))),
        React.createElement("div", { className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4" }, items.map(([label, value]) => (React.createElement("div", { key: label, className: cx('store-detail-item rounded-2xl border border-slate-200 bg-slate-50 p-3', label === 'Alamat' ? 'sm:col-span-2 xl:col-span-2' : '') },
            React.createElement("p", { className: "text-[11px] font-bold uppercase tracking-wide text-slate-500" }, label),
            React.createElement("p", { className: "mt-1 min-w-0 break-words text-sm font-semibold leading-5 text-slate-800" }, value)))))));
}
function loadImageElement(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
    });
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function distanceBetweenTouches(touches) {
    if (!touches || touches.length < 2)
        return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}
const PHOTO_EDITOR_RATIOS = [
    { key: 'original', label: 'Asli', w: 0, h: 0 },
    { key: '1-1', label: '1:1', w: 1, h: 1 },
    { key: '4-3', label: '4:3', w: 4, h: 3 },
    { key: '3-4', label: '3:4', w: 3, h: 4 },
    { key: '16-9', label: '16:9', w: 16, h: 9 },
    { key: '9-16', label: '9:16', w: 9, h: 16 }
];
const MARKER_SIZE_OPTIONS = [
    { key: 'small', label: 'Kecil', scale: 0.034 },
    { key: 'medium', label: 'Sedang', scale: 0.045 },
    { key: 'large', label: 'Besar', scale: 0.064 }
];
function getEditorCanvasSize(imageElement, ratio = PHOTO_EDITOR_RATIOS[0]) {
    const sourceWidth = Math.max(1, (imageElement === null || imageElement === void 0 ? void 0 : imageElement.naturalWidth) || (imageElement === null || imageElement === void 0 ? void 0 : imageElement.width) || 1080);
    const sourceHeight = Math.max(1, (imageElement === null || imageElement === void 0 ? void 0 : imageElement.naturalHeight) || (imageElement === null || imageElement === void 0 ? void 0 : imageElement.height) || 1080);
    const maxSide = 1400;
    if ((ratio === null || ratio === void 0 ? void 0 : ratio.w) && (ratio === null || ratio === void 0 ? void 0 : ratio.h)) {
        const targetRatio = ratio.w / ratio.h;
        let width = maxSide;
        let height = Math.round(width / targetRatio);
        if (height > maxSide) { height = maxSide; width = Math.round(height * targetRatio); }
        return { width: Math.max(360, width), height: Math.max(360, height) };
    }
    const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
    return { width: Math.max(360, Math.round(sourceWidth * scale)), height: Math.max(360, Math.round(sourceHeight * scale)) };
}
function getMarkerRadius(canvas, markerSize) {
    const selected = MARKER_SIZE_OPTIONS.find((item) => item.key === markerSize) || MARKER_SIZE_OPTIONS[1];
    const minSide = Math.min((canvas === null || canvas === void 0 ? void 0 : canvas.width) || 1080, (canvas === null || canvas === void 0 ? void 0 : canvas.height) || 1080);
    return Math.max(24, Math.round(minSide * selected.scale));
}
function PhotoEditorModal({ open, image, onClose, onSave, title = 'Edit Foto' }) {
    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const dragRef = useRef(null);
    const pinchRef = useRef(null);
    const rafRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [markers, setMarkers] = useState([]);
    const [mode, setMode] = useState('move');
    const [selectedRatio, setSelectedRatio] = useState(PHOTO_EDITOR_RATIOS[0]);
    const [markerSize, setMarkerSize] = useState('medium');
    const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 });
    const [imageReady, setImageReady] = useState(false);
    useEffect(() => {
        if (!open)
            return undefined;
        const body = document.body;
        const html = document.documentElement;
        const previous = {
            bodyOverflow: body.style.overflow,
            bodyOverscroll: body.style.overscrollBehavior,
            htmlOverflow: html.style.overflow,
            htmlOverscroll: html.style.overscrollBehavior
        };
        const stopBackgroundScroll = (event) => {
            var _a, _b;
            const panel = (_b = (_a = event.target) === null || _a === void 0 ? void 0 : _a.closest) === null || _b === void 0 ? void 0 : _b.call(_a, '.photo-editor-v10-panel');
            if ((event.touches && event.touches.length > 1) || !panel)
                event.preventDefault();
        };
        const stopGestureZoom = (event) => {
            event.preventDefault();
            event.stopPropagation();
        };
        body.style.overflow = 'hidden';
        body.style.overscrollBehavior = 'none';
        html.style.overflow = 'hidden';
        html.style.overscrollBehavior = 'none';
        document.addEventListener('touchmove', stopBackgroundScroll, { passive: false });
        document.addEventListener('gesturestart', stopGestureZoom, { passive: false });
        document.addEventListener('gesturechange', stopGestureZoom, { passive: false });
        document.addEventListener('gestureend', stopGestureZoom, { passive: false });
        return () => {
            body.style.overflow = previous.bodyOverflow;
            body.style.overscrollBehavior = previous.bodyOverscroll;
            html.style.overflow = previous.htmlOverflow;
            html.style.overscrollBehavior = previous.htmlOverscroll;
            document.removeEventListener('touchmove', stopBackgroundScroll);
            document.removeEventListener('gesturestart', stopGestureZoom);
            document.removeEventListener('gesturechange', stopGestureZoom);
            document.removeEventListener('gestureend', stopGestureZoom);
        };
    }, [open]);
    useEffect(() => () => { if (rafRef.current)
        window.cancelAnimationFrame(rafRef.current); }, []);
    useEffect(() => {
        if (!open || !image)
            return;
        let cancelled = false;
        setImageReady(false);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setMarkers([]);
        setMode('move');
        setSelectedRatio(PHOTO_EDITOR_RATIOS[0]);
        setMarkerSize('medium');
        pinchRef.current = null;
        dragRef.current = null;
        loadImageElement(image).then((loaded) => {
            if (cancelled)
                return;
            imgRef.current = loaded;
            setCanvasSize(getEditorCanvasSize(loaded, PHOTO_EDITOR_RATIOS[0]));
            setImageReady(true);
            window.requestAnimationFrame(() => drawEditorCanvas(undefined, { showGuide: true }));
        }).catch(() => {
            if (!cancelled)
                setImageReady(false);
        });
        return () => { cancelled = true; };
    }, [open, image]);
    function scheduleDraw(showGuide = true) {
        if (rafRef.current)
            window.cancelAnimationFrame(rafRef.current);
        rafRef.current = window.requestAnimationFrame(() => drawEditorCanvas(undefined, { showGuide }));
    }
    useEffect(() => { if (!open)
        return; scheduleDraw(true); }, [zoom, offset, markers, mode, open, canvasSize, imageReady]);
    function getDrawMetrics(nextZoom = zoom, nextOffset = offset) {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img)
            return null;
        const cw = canvas.width;
        const ch = canvas.height;
        const baseScale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
        const scale = baseScale * nextZoom;
        const iw = img.naturalWidth * scale;
        const ih = img.naturalHeight * scale;
        return {
            cw,
            ch,
            scale,
            iw,
            ih,
            x: (cw - iw) / 2 + nextOffset.x,
            y: (ch - ih) / 2 + nextOffset.y,
            centerX: cw / 2,
            centerY: ch / 2
        };
    }
    function clampOffset(nextOffset, nextZoom = zoom) {
        const metrics = getDrawMetrics(nextZoom, nextOffset);
        if (!metrics)
            return nextOffset;
        const maxX = Math.max(0, (metrics.iw - metrics.cw) / 2);
        const maxY = Math.max(0, (metrics.ih - metrics.ch) / 2);
        return {
            x: clamp(nextOffset.x, -maxX, maxX),
            y: clamp(nextOffset.y, -maxY, maxY)
        };
    }
    function drawEditorCanvas(targetCanvas, options = {}) {
        const { showGuide = true } = options;
        const canvas = targetCanvas || canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img)
            return;
        const ctx = canvas.getContext('2d');
        const metrics = getDrawMetrics();
        if (!metrics)
            return;
        ctx.clearRect(0, 0, metrics.cw, metrics.ch);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, metrics.cw, metrics.ch);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, metrics.x, metrics.y, metrics.iw, metrics.ih);
        ctx.save();
        ctx.lineWidth = Math.max(5, Math.round(Math.min(metrics.cw, metrics.ch) * 0.006));
        ctx.strokeStyle = '#ef4444';
        ctx.shadowColor = 'rgba(0,0,0,0.22)';
        ctx.shadowBlur = 5;
        markers.forEach((marker) => {
            ctx.beginPath();
            ctx.arc(marker.x, marker.y, marker.r || Math.max(34, Math.min(metrics.cw, metrics.ch) * 0.045), 0, Math.PI * 2);
            ctx.stroke();
        });
        ctx.restore();
        if (showGuide) {
            ctx.save();
            ctx.strokeStyle = mode === 'marker' ? 'rgba(239,68,68,0.95)' : 'rgba(15,118,110,0.9)';
            ctx.lineWidth = Math.max(2, Math.round(Math.min(metrics.cw, metrics.ch) * 0.002));
            ctx.setLineDash([Math.max(10, metrics.cw * 0.01), Math.max(8, metrics.cw * 0.008)]);
            ctx.strokeRect(10, 10, metrics.cw - 20, metrics.ch - 20);
            ctx.restore();
        }
    }
    function canvasPointFromClient(clientX, clientY) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: (clientX - rect.left) * (canvas.width / Math.max(1, rect.width)),
            y: (clientY - rect.top) * (canvas.height / Math.max(1, rect.height))
        };
    }
    function canvasPoint(event) { return canvasPointFromClient(event.clientX, event.clientY); }
    function touchCenter(touches) {
        const first = touches[0];
        const second = touches[1];
        return canvasPointFromClient((first.clientX + second.clientX) / 2, (first.clientY + second.clientY) / 2);
    }
    function applyZoomAt(point, nextZoom, baseZoom = zoom, baseOffset = offset) {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ratio = nextZoom / Math.max(0.001, baseZoom);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const nextOffset = {
            x: (1 - ratio) * (point.x - centerX) + ratio * baseOffset.x,
            y: (1 - ratio) * (point.y - centerY) + ratio * baseOffset.y
        };
        setZoom(nextZoom);
        setOffset(clampOffset(nextOffset, nextZoom));
    }
    function handlePointerDown(event) {
        if (!canvasRef.current || !imageReady || pinchRef.current)
            return;
        event.preventDefault();
        if (mode === 'marker') {
            const point = canvasPoint(event);
            const r = getMarkerRadius(canvasRef.current, markerSize);
            setMarkers((current) => [...current, { x: point.x, y: point.y, r }]);
            return;
        }
        const point = canvasPoint(event);
        dragRef.current = { pointerId: event.pointerId, x: point.x, y: point.y, offsetX: offset.x, offsetY: offset.y };
        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        }
        catch (error) { }
    }
    function handlePointerMove(event) {
        if (!dragRef.current || mode !== 'move' || dragRef.current.pointerId !== event.pointerId)
            return;
        event.preventDefault();
        const point = canvasPoint(event);
        const next = {
            x: dragRef.current.offsetX + (point.x - dragRef.current.x),
            y: dragRef.current.offsetY + (point.y - dragRef.current.y)
        };
        setOffset(clampOffset(next, zoom));
    }
    function handlePointerUp(event) {
        var _a;
        if (((_a = dragRef.current) === null || _a === void 0 ? void 0 : _a.pointerId) === (event === null || event === void 0 ? void 0 : event.pointerId))
            dragRef.current = null;
        else
            dragRef.current = null;
    }
    function handleTouchStart(event) {
        if (event.touches.length === 2) {
            event.preventDefault();
            event.stopPropagation();
            dragRef.current = null;
            pinchRef.current = { distance: distanceBetweenTouches(event.touches), zoom, offset, center: touchCenter(event.touches) };
        }
    }
    function handleTouchMove(event) {
        if (event.touches.length === 2 && pinchRef.current) {
            event.preventDefault();
            event.stopPropagation();
            const distance = distanceBetweenTouches(event.touches);
            const nextZoom = clamp(pinchRef.current.zoom * (distance / Math.max(1, pinchRef.current.distance)), 1, 4);
            const currentCenter = touchCenter(event.touches);
            const canvas = canvasRef.current;
            if (!canvas)
                return;
            const ratio = nextZoom / Math.max(0.001, pinchRef.current.zoom);
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const nextOffset = {
                x: currentCenter.x - centerX - ratio * (pinchRef.current.center.x - centerX - pinchRef.current.offset.x),
                y: currentCenter.y - centerY - ratio * (pinchRef.current.center.y - centerY - pinchRef.current.offset.y)
            };
            setZoom(nextZoom);
            setOffset(clampOffset(nextOffset, nextZoom));
        }
    }
    function handleTouchEnd(event) {
        if (!event.touches || event.touches.length < 2)
            pinchRef.current = null;
    }
    function handleWheel(event) {
        if (!imageReady)
            return;
        event.preventDefault();
        const point = canvasPoint(event);
        const nextZoom = clamp(zoom * (event.deltaY < 0 ? 1.08 : 0.92), 1, 4);
        applyZoomAt(point, nextZoom);
    }
    function resetEditor() {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setMarkers([]);
        setMode('move');
    }
    function changeRatio(nextRatio) {
        setSelectedRatio(nextRatio);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
        setMarkers([]);
        if (imgRef.current)
            setCanvasSize(getEditorCanvasSize(imgRef.current, nextRatio));
    }
    function saveEditedImage() {
        const canvas = canvasRef.current;
        if (!canvas || !imageReady)
            return;
        drawEditorCanvas(canvas, { showGuide: false });
        onSave(canvas.toDataURL('image/jpeg', 0.92), { width: canvas.width, height: canvas.height, aspectRatio: canvas.width + ' / ' + canvas.height });
        onClose();
    }
    if (!open)
        return null;
    const hasMarkers = markers.length > 0;
    const modal = (React.createElement("div", { className: "photo-editor-overlay photo-editor-v10", role: "dialog", "aria-modal": "true" },
        React.createElement("div", { className: "photo-editor-panel photo-editor-v10-panel bg-white shadow-2xl", onClick: (event) => event.stopPropagation() },
            React.createElement("div", { className: "photo-editor-header photo-editor-v10-header" },
                React.createElement("div", { className: "min-w-0" },
                    React.createElement("p", { className: "photo-editor-eyebrow" }, "Edit Foto"),
                    React.createElement("h3", null, title)),
                React.createElement("button", { type: "button", className: "photo-editor-close", onClick: onClose, "aria-label": "Tutup editor" },
                    React.createElement(Icon, { name: "close", className: "h-5 w-5" }))),
            React.createElement("div", { className: "photo-editor-v10-toolbar", role: "toolbar", "aria-label": "Toolbar edit foto" },
                React.createElement("button", { type: "button", className: cx('photo-editor-tool', mode === 'move' && 'active'), onClick: () => setMode('move'), "aria-pressed": mode === 'move' },
                    React.createElement(Icon, { name: "crop", className: "h-4 w-4" }),
                    React.createElement("span", null, "Geser")),
                React.createElement("button", { type: "button", className: cx('photo-editor-tool', mode === 'marker' && 'active'), onClick: () => setMode('marker'), "aria-pressed": mode === 'marker' },
                    React.createElement(Icon, { name: "marker", className: "h-4 w-4" }),
                    React.createElement("span", null, "Marker")),
                React.createElement("button", { type: "button", className: "photo-editor-tool", onClick: () => setMarkers((current) => current.slice(0, -1)), disabled: !hasMarkers },
                    React.createElement(Icon, { name: "left", className: "h-4 w-4" }),
                    React.createElement("span", null, "Undo")),
                React.createElement("button", { type: "button", className: "photo-editor-tool", onClick: resetEditor },
                    React.createElement(Icon, { name: "eraser", className: "h-4 w-4" }),
                    React.createElement("span", null, "Reset"))),
            React.createElement("div", { className: "photo-editor-options", "aria-label": "Pengaturan crop dan marker" },
                React.createElement("div", { className: "photo-editor-option-row" },
                    React.createElement("span", null, "Ratio"),
                    React.createElement("div", { className: "photo-editor-chip-group" }, PHOTO_EDITOR_RATIOS.map((ratio) => React.createElement("button", { key: ratio.key, type: "button", className: cx('photo-editor-chip', selectedRatio.key === ratio.key && 'active'), onClick: () => changeRatio(ratio) }, ratio.label)))),
                React.createElement("div", { className: "photo-editor-option-row" },
                    React.createElement("span", null, "Marker"),
                    React.createElement("div", { className: "photo-editor-chip-group" }, MARKER_SIZE_OPTIONS.map((option) => React.createElement("button", { key: option.key, type: "button", className: cx('photo-editor-chip', markerSize === option.key && 'active'), onClick: () => setMarkerSize(option.key) }, option.label))))),
            React.createElement("div", { className: "photo-editor-canvas-shell photo-editor-v10-stage" },
                !imageReady ? React.createElement("div", { className: "photo-editor-loading" }, "Memuat foto...") : null,
                React.createElement("canvas", { ref: canvasRef, width: canvasSize.width, height: canvasSize.height, style: { aspectRatio: canvasSize.width + ' / ' + canvasSize.height, touchAction: 'none' }, className: "photo-editor-canvas", onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onPointerUp: handlePointerUp, onPointerCancel: handlePointerUp, onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd, onWheel: handleWheel })),
            React.createElement("div", { className: "photo-editor-v10-footer" },
                React.createElement("div", { className: "photo-editor-hint" },
                    React.createElement("span", null, mode === 'marker' ? 'Tap area foto untuk marker.' : 'Cubit untuk zoom, geser foto.')),
                React.createElement("button", { type: "button", className: "photo-editor-save", onClick: saveEditedImage, disabled: !imageReady },
                    React.createElement(Icon, { name: "check", className: "h-5 w-5" }),
                    React.createElement("span", null, "Simpan"))))));
    return (ReactDOM === null || ReactDOM === void 0 ? void 0 : ReactDOM.createPortal) ? ReactDOM.createPortal(modal, document.body) : modal;
}
function PhotoInput({ value, onChange, label = 'Foto', compact = false, rich = false, required = false, matchCropFrame = false }) {
    const cameraRef = useRef(null);
    const galleryRef = useRef(null);
    const [editorOpen, setEditorOpen] = useState(false);
    async function handleFiles(event) {
        const file = event.target.files && event.target.files[0];
        if (!file)
            return;
        try {
            const dataUrl = await fileToDataUrl(file);
            onChange({ ...(value || blankPhoto()), image: dataUrl, cropAspect: '' });
            setEditorOpen(true);
        }
        catch (error) {
            alert('Foto gagal dibaca. Coba pilih ulang foto.');
        }
        finally {
            event.target.value = '';
        }
    }
    function clearPhoto() {
        if (!confirmAction('Hapus foto ini?'))
            return;
        onChange({ ...(value || blankPhoto()), image: '' });
    }
    const description = (value === null || value === void 0 ? void 0 : value.description) || '';
    const photoAspect = matchCropFrame && (value === null || value === void 0 ? void 0 : value.cropAspect) ? String(value.cropAspect) : '';
    const cardStyle = photoAspect ? { '--photo-aspect': photoAspect } : undefined;
    return (React.createElement("div", { className: cx('photo-input-card surface-card overflow-hidden rounded-[26px]', matchCropFrame && 'match-crop-frame'), style: cardStyle },
        React.createElement("div", { className: "flex items-center justify-between border-b border-slate-200 px-4 py-3" },
            React.createElement("div", { className: "min-w-0" },
                React.createElement("p", { className: "truncate text-sm font-extrabold text-slate-900" },
                    label,
                    required ? React.createElement("span", { className: "ml-1 text-rose-600" }, "*") : null)),
            React.createElement("div", { className: "flex shrink-0 gap-2" },
                (value === null || value === void 0 ? void 0 : value.image) ? React.createElement(Button, { variant: "icon", onClick: () => setEditorOpen(true), "aria-label": "Edit crop dan marker" },
                    React.createElement(Icon, { name: "crop", className: "h-4 w-4" })) : null,
                (value === null || value === void 0 ? void 0 : value.image) ? React.createElement(Button, { variant: "icon", onClick: clearPhoto, "aria-label": "Hapus foto" },
                    React.createElement(Icon, { name: "trash", className: "h-4 w-4" })) : null)),
        React.createElement("div", { className: cx('photo-frame relative grid place-items-center overflow-hidden', (value === null || value === void 0 ? void 0 : value.image) ? 'has-image' : '', compact ? 'min-h-[150px]' : 'min-h-[210px]') }, (value === null || value === void 0 ? void 0 : value.image) ? React.createElement("img", { src: value.image, alt: label }) : React.createElement("div", { className: "flex flex-col items-center px-5 text-center text-slate-500" },
            React.createElement("div", { className: "mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white text-audit-primary shadow-sm" },
                React.createElement(Icon, { name: "image", className: "h-7 w-7" })),
            React.createElement("p", { className: "text-sm font-bold text-slate-700" }, "Upload foto"))),
        React.createElement("div", { className: "photo-actions flex items-center justify-center gap-2 border-t border-slate-200 p-3" },
            React.createElement("input", { ref: cameraRef, type: "file", accept: "image/*", capture: "environment", className: "hidden", onChange: handleFiles }),
            React.createElement("input", { ref: galleryRef, type: "file", accept: "image/*", className: "hidden", onChange: handleFiles }),
            React.createElement(Button, { variant: "icon", icon: "camera", onClick: () => { var _a; return (_a = cameraRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, "aria-label": "Ambil foto dari kamera" }),
            React.createElement(Button, { variant: "icon", icon: "gallery", onClick: () => { var _a; return (_a = galleryRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, "aria-label": "Pilih foto dari galeri" })),
        React.createElement("div", { className: "border-t border-slate-200 p-3" }, rich ? React.createElement(RichTextInput, { value: description, onChange: (nextDescription) => onChange({ ...(value || blankPhoto()), description: nextDescription }), placeholder: "Deskripsi foto...", minHeight: 92 }) : React.createElement(TextArea, { value: description, onChange: (event) => onChange({ ...(value || blankPhoto()), description: event.target.value }), placeholder: "Deskripsi foto...", minRows: 2 })),
        React.createElement(PhotoEditorModal, { open: editorOpen, image: (value === null || value === void 0 ? void 0 : value.image) || '', title: label, onClose: () => setEditorOpen(false), onSave: (editedImage, meta) => onChange({ ...(value || blankPhoto()), image: editedImage, cropAspect: (meta === null || meta === void 0 ? void 0 : meta.aspectRatio) || (value === null || value === void 0 ? void 0 : value.cropAspect) || '' }) })));
}
function SectionShell({ title, children, actions, preTitle }) {
    return (React.createElement("section", { className: "slide-enter fade-in" },
        React.createElement("div", { className: "section-heading mb-5 flex flex-col gap-3" },
            preTitle ? React.createElement("div", { className: "section-pretitle" }, preTitle) : null,
            React.createElement("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between" },
                React.createElement("h2", { className: "text-2xl font-black tracking-tight text-slate-950 md:text-3xl" }, title),
                actions ? React.createElement("div", { className: "section-actions flex flex-wrap gap-2 md:justify-end" }, actions) : null)),
        children));
}
function CrewEditor({ visit, update }) {
    var _a;
    const crewList = ((_a = visit.crewList) === null || _a === void 0 ? void 0 : _a.length) ? visit.crewList : [{ name: '', level: '' }];
    const updateCrew = (index, patch) => {
        const next = crewList.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item);
        update({ crewList: next });
    };
    const addCrew = () => update({ crewList: [...crewList, { name: '', level: '' }] });
    const removeCrew = (index) => {
        if (!confirmAction('Hapus crew ini?'))
            return;
        const next = crewList.filter((_, itemIndex) => itemIndex !== index);
        update({ crewList: next.length ? next : [{ name: '', level: '' }] });
    };
    return (React.createElement("div", { className: "grid gap-5" },
        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
            React.createElement("div", { className: "surface-card rounded-[28px] p-5" },
                React.createElement("div", { className: "mb-4 flex items-center gap-3" },
                    React.createElement("div", { className: "grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-audit-primary" },
                        React.createElement(Icon, { name: "user" })),
                    React.createElement("div", null,
                        React.createElement("h3", { className: "font-extrabold text-slate-950" }, "Store Leader"))),
                React.createElement("div", { className: "grid gap-3 sm:grid-cols-[1fr_120px]" },
                    React.createElement(Field, { label: "Nama" },
                        React.createElement(TextInput, { value: visit.storeLeader || '', onChange: (e) => update({ storeLeader: e.target.value }), placeholder: "Nama store leader" })),
                    React.createElement(Field, { label: "Level" },
                        React.createElement(SelectInput, { value: visit.storeLeaderLevel || '', onChange: (e) => update({ storeLeaderLevel: e.target.value }) }, JOB_LEVELS.map((level) => React.createElement("option", { key: level, value: level }, level || 'Pilih')))))),
            React.createElement("div", { className: "surface-card rounded-[28px] p-5" },
                React.createElement("div", { className: "mb-4 flex items-center gap-3" },
                    React.createElement("div", { className: "grid h-10 w-10 place-items-center rounded-2xl bg-orange-50 text-audit-accent" },
                        React.createElement(Icon, { name: "user" })),
                    React.createElement("div", null,
                        React.createElement("h3", { className: "font-extrabold text-slate-950" }, "Shift Leader"))),
                React.createElement("div", { className: "grid gap-3 sm:grid-cols-[1fr_120px]" },
                    React.createElement(Field, { label: "Nama" },
                        React.createElement(TextInput, { value: visit.shiftLeader || '', onChange: (e) => update({ shiftLeader: e.target.value }), placeholder: "Nama shift leader" })),
                    React.createElement(Field, { label: "Level" },
                        React.createElement(SelectInput, { value: visit.shiftLeaderLevel || '', onChange: (e) => update({ shiftLeaderLevel: e.target.value }) }, JOB_LEVELS.map((level) => React.createElement("option", { key: level, value: level }, level || 'Pilih'))))))),
        React.createElement("div", { className: "surface-card rounded-[28px] p-5 md:p-6" },
            React.createElement("div", { className: "mb-5" },
                React.createElement("h3", { className: "text-lg font-extrabold text-slate-950" }, "Crew Store")),
            React.createElement("div", { className: "grid gap-3" }, crewList.map((crew, index) => (React.createElement("div", { key: index, className: "grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[44px_1fr_130px_44px] sm:items-end" },
                React.createElement("div", { className: "grid h-11 w-11 place-items-center rounded-2xl bg-white text-sm font-black text-slate-600" }, index + 1),
                React.createElement(Field, { label: "Nama Crew" },
                    React.createElement(TextInput, { value: crew.name || '', onChange: (e) => updateCrew(index, { name: e.target.value }), placeholder: "Nama crew" })),
                React.createElement(Field, { label: "Level" },
                    React.createElement(SelectInput, { value: crew.level || '', onChange: (e) => updateCrew(index, { level: e.target.value }) }, JOB_LEVELS.map((level) => React.createElement("option", { key: level, value: level }, level || 'Pilih')))),
                React.createElement(Button, { variant: "icon", onClick: () => removeCrew(index), "aria-label": "Hapus crew" },
                    React.createElement(Icon, { name: "trash", className: "h-4 w-4" })))))),
            React.createElement("div", { className: "mt-4 flex justify-end" },
                React.createElement(Button, { variant: "secondary", icon: "plus", onClick: addCrew }, "Tambah Crew")))));
}
function ObservationCards({ title, rows, onChange }) {
    const safeRows = (rows === null || rows === void 0 ? void 0 : rows.length) ? rows : [blankObservationRow()];
    const [activeIndex, setActiveIndex] = useState(0);
    const activeRowNumber = Math.min(activeIndex + 1, safeRows.length);
    useEffect(() => {
        setActiveIndex((current) => Math.max(0, Math.min(current, safeRows.length - 1)));
    }, [safeRows.length]);
    const updateRow = (index, patch) => onChange(safeRows.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
    const addRow = () => {
        onChange([...safeRows, blankObservationRow()]);
        setActiveIndex(safeRows.length);
    };
    const removeRow = (index) => {
        if (!confirmAction('Hapus row observation ini?'))
            return;
        const next = safeRows.filter((_, rowIndex) => rowIndex !== index);
        onChange(next.length ? next : [blankObservationRow()]);
        setActiveIndex(Math.max(0, Math.min(index, (next.length ? next.length : 1) - 1)));
    };
    const goPrev = () => setActiveIndex((current) => Math.max(0, current - 1));
    const goNext = () => setActiveIndex((current) => Math.min(safeRows.length - 1, current + 1));
    const richField = (label, key, row, index, placeholder) => (React.createElement(Field, { label: label },
        React.createElement(RichTextInput, { value: row[key] || '', onChange: (value) => updateRow(index, { [key]: value }), placeholder: placeholder })));
    const mobileNav = (React.createElement("div", { className: "observation-mobile-nav", "aria-label": "Navigasi temuan observation" },
        React.createElement("div", { className: "observation-nav-status" },
            "Temuan ",
            activeRowNumber,
            " / ",
            safeRows.length),
        React.createElement("div", { className: "observation-nav-controls" },
            React.createElement("button", { type: "button", className: "observation-nav-button", onClick: goPrev, disabled: activeIndex <= 0, "aria-label": "Temuan sebelumnya" },
                React.createElement(Icon, { name: "left", className: "h-5 w-5" })),
            React.createElement("button", { type: "button", className: "observation-nav-add", onClick: addRow, "aria-label": "Tambah temuan" },
                React.createElement(Icon, { name: "plus", className: "h-5 w-5" })),
            React.createElement("button", { type: "button", className: "observation-nav-button", onClick: goNext, disabled: activeIndex >= safeRows.length - 1, "aria-label": "Temuan berikutnya" },
                React.createElement(Icon, { name: "right", className: "h-5 w-5" })))));
    const mobileNavPortal = (ReactDOM === null || ReactDOM === void 0 ? void 0 : ReactDOM.createPortal) ? ReactDOM.createPortal(mobileNav, document.body) : mobileNav;
    return (React.createElement("div", { className: "observation-card-system grid gap-4" },
        React.createElement("div", { className: "observation-summary-card rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4" },
            React.createElement("h3", { className: "text-lg font-extrabold text-slate-950" }, title),
            React.createElement("p", { className: "mt-1 text-xs font-bold text-emerald-800" },
                "Temuan ",
                activeRowNumber,
                " dari ",
                safeRows.length)),
        safeRows.map((row, index) => (React.createElement("article", { key: index, className: cx('observation-item-card surface-card rounded-[28px] p-4 md:p-5', index === activeIndex && 'mobile-active') },
            React.createElement("div", { className: "mb-4 flex items-center justify-between gap-3" },
                React.createElement(Badge, { tone: isMeaningfulObservation(row) ? 'success' : 'default' },
                    "Temuan ",
                    index + 1),
                React.createElement(Button, { variant: "icon", onClick: () => removeRow(index), "aria-label": "Hapus row" },
                    React.createElement(Icon, { name: "trash", className: "h-4 w-4" }))),
            React.createElement("div", { className: "grid gap-4 lg:grid-cols-2" },
                richField('Temuan', 'temuan', row, index, 'Tuliskan temuan audit...'),
                richField('Kondisi Ideal', 'kondisiIdeal', row, index, 'Kondisi ideal yang diharapkan...'),
                richField('Dampak', 'dampak', row, index, 'Dampak terhadap operasional...'),
                richField('Penyebab', 'penyebab', row, index, 'Penyebab utama...'),
                richField('Tindakan Aksi', 'tindakan', row, index, 'Aksi perbaikan yang disepakati...'),
                React.createElement("div", { className: "observation-deadline-grid grid gap-4 sm:grid-cols-[170px_minmax(0,1fr)]" },
                    React.createElement(Field, { label: "Deadline" },
                        React.createElement(DateInput, { value: row.deadline || '', onChange: (e) => updateRow(index, { deadline: e.target.value }) })),
                    richField('Hasil', 'hasil', row, index, 'Hasil tindakan...')))))),
        React.createElement("div", { className: "observation-desktop-add flex justify-end" },
            React.createElement(Button, { variant: "secondary", icon: "plus", onClick: addRow }, "Tambah Row")),
        mobileNavPortal));
}
function PhotoGrid({ photos, onChange, prefix }) {
    const minSlots = 8;
    const sourcePhotos = Array.isArray(photos) ? photos : [];
    const safePhotos = Array.from({ length: Math.max(minSlots, sourcePhotos.length || minSlots) }, (_, index) => sourcePhotos[index] || blankPhoto());
    const blankSet = () => Array.from({ length: minSlots }, () => blankPhoto());
    const updatePhoto = (index, value) => onChange(safePhotos.map((photo, photoIndex) => photoIndex === index ? value : photo));
    const addFour = () => onChange([...safePhotos, blankPhoto(), blankPhoto(), blankPhoto(), blankPhoto()]);
    const removeEmpty = () => {
        if (!confirmAction('Rapikan dan hapus slot foto kosong?'))
            return;
        const meaningful = safePhotos.filter((photo) => photo.image || cleanText(photo.description));
        const next = meaningful.length ? meaningful : blankSet();
        onChange(Array.from({ length: Math.max(minSlots, next.length) }, (_, index) => next[index] || blankPhoto()));
    };
    return (React.createElement("div", { className: "photo-grid-system grid gap-4" },
        React.createElement("div", { className: "rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4" },
            React.createElement("p", { className: "text-sm font-bold text-slate-900" },
                safePhotos.length,
                " slot foto")),
        React.createElement("div", { className: "evidence-photo-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-4" }, safePhotos.map((photo, index) => (React.createElement(PhotoInput, { key: index, label: prefix + ' ' + (index + 1), value: photo, onChange: (value) => updatePhoto(index, value), compact: true, rich: true })))),
        React.createElement("div", { className: "flex flex-wrap justify-end gap-2" },
            React.createElement(Button, { variant: "secondary", icon: "eraser", onClick: removeEmpty }, "Rapikan Slot Kosong"),
            React.createElement(Button, { variant: "secondary", icon: "plus", onClick: addFour }, "Tambah 4 Slot"))));
}
const SECTION_DEFS = [
    { id: 'setup', label: 'Visit', title: 'Visit Setup', icon: 'store', hint: 'Bestie & store' },
    { id: 'crew', label: 'Crew', title: 'General Information', icon: 'calendar', hint: 'Tanggal & PIC' },
    { id: 'qsc-result', label: 'QSC', title: 'QSC / FAMITRACK Result', icon: 'camera', hint: 'Foto result' },
    { id: 'observation', label: 'Obs', title: 'Observation', icon: 'clipboard', hint: 'OPI & QSC' },
    { id: 'evidence', label: 'Evidence', title: 'Evidence', icon: 'image', hint: 'Foto temuan' },
    { id: 'assignment', label: 'Assign', title: 'Store Assignment', icon: 'excel', hint: 'CA purpose' }
];
function ProgressBar({ value }) {
    const safeValue = Math.max(0, Math.min(100, Number(value || 0)));
    return (React.createElement("div", { className: "progress-mini", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": safeValue },
        React.createElement("span", { style: { width: safeValue + '%' } })));
}
function VisitSetupSection({ visit, update }) {
    const storeOptions = useMemo(() => getStoresForBestie(visit.nama).map((item) => ({ label: item.label, value: item.value || item.label })), [visit.nama]);
    const baseDetail = useMemo(() => getStoreWebDetail(visit.store), [visit.store]);
    const manualDetail = visit.manualStoreDetail || {};
    const detail = useMemo(() => ({ ...baseDetail, ...manualDetail, siteDescr: visit.store || manualDetail.siteDescr || baseDetail.siteDescr }), [baseDetail, manualDetail, visit.store]);
    const progress = visitProgress(visit);
    const detailValue = (key, fallback = '') => { var _a, _b; return (_b = (_a = manualDetail[key]) !== null && _a !== void 0 ? _a : fallback) !== null && _b !== void 0 ? _b : ''; };
    function handleBestieChange(value) {
        var _a;
        const stores = getStoresForBestie(value);
        update({ nama: value, store: ((_a = stores[0]) === null || _a === void 0 ? void 0 : _a.label) || '', manualStoreDetail: {} });
    }
    function handleStoreChange(value) {
        update({ store: value, manualStoreDetail: {} });
    }
    function updateStoreDetail(key, value) {
        update({ manualStoreDetail: { ...(visit.manualStoreDetail || {}), [key]: value } });
    }
    return (React.createElement(SectionShell, { title: "Mulai visit" },
        React.createElement("div", { className: "visit-setup-grid grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:gap-5" },
            React.createElement("div", { className: "visit-setup-card surface-card min-w-0 rounded-[24px] p-4 md:rounded-[28px] md:p-6" },
                React.createElement("div", { className: "grid gap-4 md:gap-5" },
                    React.createElement(SelectField, { label: "Nama Bestie", required: true, value: visit.nama || '', options: BESTIE_NAMES, onChange: handleBestieChange, placeholder: "Pilih nama bestie", icon: "user" }),
                    React.createElement(SelectField, { label: "Store", required: true, value: visit.store || '', options: storeOptions, onChange: handleStoreChange, placeholder: "Pilih store", icon: "store" }),
                    React.createElement("div", { className: "visit-progress-card rounded-2xl bg-emerald-50 p-4 text-emerald-900 ring-1 ring-emerald-100" },
                        React.createElement("div", { className: "mb-2 flex items-center justify-between gap-3" },
                            React.createElement("p", { className: "text-xs font-bold uppercase tracking-wide" }, "Progress"),
                            React.createElement("p", { className: "text-sm font-black" },
                                progress,
                                "%")),
                        React.createElement(ProgressBar, { value: progress })),
                    React.createElement("div", { className: "visit-detail-edit rounded-2xl border border-slate-200 bg-white/80 p-3" },
                        React.createElement("p", { className: "mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-audit-primary" }, "Edit detail visit"),
                        React.createElement("div", { className: "grid gap-3 sm:grid-cols-2" },
                            React.createElement(Field, { label: "Kode Store" },
                                React.createElement(TextInput, { value: detailValue('siteCode4', baseDetail.siteCode4 || baseDetail.siteCode || baseDetail.storeCode || ''), onChange: (event) => updateStoreDetail('siteCode4', event.target.value), placeholder: "Kode store" })),
                            React.createElement(Field, { label: "Store Head" },
                                React.createElement(TextInput, { value: detailValue('storeHead', baseDetail.storeHead || ''), onChange: (event) => updateStoreDetail('storeHead', event.target.value), placeholder: "Store head" })),
                            React.createElement(Field, { label: "Area Manager" },
                                React.createElement(TextInput, { value: detailValue('areaManager', baseDetail.areaManager || ''), onChange: (event) => updateStoreDetail('areaManager', event.target.value), placeholder: "Area manager" })),
                            React.createElement(Field, { label: "Regional Manager" },
                                React.createElement(TextInput, { value: detailValue('regionalManager', baseDetail.regionalManager || ''), onChange: (event) => updateStoreDetail('regionalManager', event.target.value), placeholder: "Regional manager" })),
                            React.createElement(Field, { label: "Email Store" },
                                React.createElement(TextInput, { value: detailValue('emailStore', baseDetail.emailStore || ''), onChange: (event) => updateStoreDetail('emailStore', event.target.value), placeholder: "Email store" })),
                            React.createElement(Field, { label: "Alamat" },
                                React.createElement(TextInput, { value: detailValue('address', baseDetail.address || baseDetail.storeAddress || ''), onChange: (event) => updateStoreDetail('address', event.target.value), placeholder: "Alamat" })))))),
            React.createElement(StoreDetailCard, { detail: detail }))));
}
function GeneralInfoSection({ visit, update }) {
    return (React.createElement(SectionShell, { title: "General Information" },
        React.createElement("div", { className: "grid gap-5" },
            React.createElement("div", { className: "date-card surface-card rounded-[28px] p-5 md:p-6" },
                React.createElement(Field, { label: "Hari, Tanggal", required: true },
                    React.createElement(DateInput, { value: visit.tanggal || '', onChange: (e) => update({ tanggal: e.target.value }) }))),
            React.createElement(CrewEditor, { visit: visit, update: update }))));
}
function QscResultSection({ visit, update }) {
    const enabled = visit.showQSCResult === true;
    const missing = normalizeQscPhotos(visit).filter((photo) => !photo.image).length;
    return (React.createElement(SectionShell, { title: "QSC / FAMITRACK Result", actions: React.createElement(Toggle, { checked: enabled, onChange: (value) => update({ showQSCResult: value }), label: enabled ? 'Hide slide' : 'Unhide slide' }) }, !enabled ? React.createElement(InactiveSection, { title: "Slide QSC/Famitrack disembunyikan" }) : React.createElement(React.Fragment, null,
        missing ? React.createElement("div", { className: "mb-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-900" },
            "Kurang ",
            missing,
            " foto wajib.") : null,
        React.createElement("div", { className: "qsc-result-photo-grid grid gap-4" }, normalizeQscPhotos(visit).map((photo, index) => React.createElement(PhotoInput, { key: index, value: photo, matchCropFrame: true, onChange: (value) => { const qscResultPhotos = normalizeQscPhotos(visit).map((item, itemIndex) => itemIndex === index ? value : item); update({ qscResultPhotos, qscResultPhoto: qscResultPhotos[0] }); }, label: 'Foto QSC / FAMITRACK ' + (index + 1), required: true }))))));
}
function ObservationSection({ visit, update }) {
    const [tab, setTab] = useState('opi');
    const enabled = tab === 'opi' ? visit.showOPITable === true : visit.showQSCTable === true;
    const toggleLabel = tab === 'opi' ? (enabled ? 'Hide OPI' : 'Unhide OPI') : (enabled ? 'Hide QSC' : 'Unhide QSC');
    const setEnabled = (value) => tab === 'opi' ? update({ showOPITable: value }) : update({ showQSCTable: value });
    const preTitle = React.createElement("div", { className: "section-switcher flex flex-col gap-3 md:flex-row md:items-center md:justify-between" },
        React.createElement("div", { className: "flex gap-2 overflow-x-auto pb-1" },
            React.createElement("button", { type: "button", className: cx('subnav-chip prominent', tab === 'opi' && 'active'), onClick: () => setTab('opi') },
                React.createElement(Icon, { name: "clipboard", className: "h-4 w-4" }),
                " OPI Project"),
            React.createElement("button", { type: "button", className: cx('subnav-chip prominent', tab === 'qsc' && 'active'), onClick: () => setTab('qsc') },
                React.createElement(Icon, { name: "clipboard", className: "h-4 w-4" }),
                " QSC Observation")),
        React.createElement(Toggle, { checked: enabled, onChange: setEnabled, label: toggleLabel }));
    return (React.createElement(SectionShell, { title: "Observation & Root Cause Analysis", preTitle: preTitle }, !enabled ? React.createElement(InactiveSection, { title: (tab === 'opi' ? 'OPI Project' : 'QSC Observation') + ' disembunyikan' }) : tab === 'opi' ? React.createElement(ObservationCards, { key: "opi", title: "OPI Project Observation", rows: visit.opiData, onChange: (opiData) => update({ opiData }) }) : React.createElement(ObservationCards, { key: "qsc", title: "QSC Observation", rows: visit.qscData, onChange: (qscData) => update({ qscData }) })));
}
function EvidenceSection({ visit, update }) {
    const [tab, setTab] = useState('finding');
    const enabled = tab === 'finding' ? visit.showFindingEvidence === true : visit.showCorrectiveAction === true;
    const setEnabled = (value) => tab === 'finding' ? update({ showFindingEvidence: value }) : update({ showCorrectiveAction: value });
    const toggleLabel = tab === 'finding' ? (enabled ? 'Hide Finding' : 'Unhide Finding') : (enabled ? 'Hide Corrective' : 'Unhide Corrective');
    const preTitle = React.createElement("div", { className: "section-switcher flex flex-col gap-3 md:flex-row md:items-center md:justify-between" },
        React.createElement("div", { className: "flex gap-2 overflow-x-auto pb-1" },
            React.createElement("button", { type: "button", className: cx('subnav-chip prominent', tab === 'finding' && 'active'), onClick: () => setTab('finding') },
                React.createElement(Icon, { name: "image", className: "h-4 w-4" }),
                " Finding Evidence"),
            React.createElement("button", { type: "button", className: cx('subnav-chip prominent', tab === 'corrective' && 'active'), onClick: () => setTab('corrective') },
                React.createElement(Icon, { name: "image", className: "h-4 w-4" }),
                " Corrective Action")),
        React.createElement(Toggle, { checked: enabled, onChange: setEnabled, label: toggleLabel }));
    return (React.createElement(SectionShell, { title: "Evidence Photos", preTitle: preTitle }, !enabled ? React.createElement(InactiveSection, { title: (tab === 'finding' ? 'Finding Evidence' : 'Corrective Action') + ' disembunyikan' }) : tab === 'finding' ? React.createElement(PhotoGrid, { prefix: "Finding", photos: visit.findingEvidencePhotos, onChange: (findingEvidencePhotos) => update({ findingEvidencePhotos }) }) : React.createElement(PhotoGrid, { prefix: "Corrective", photos: visit.correctiveActionPhotos, onChange: (correctiveActionPhotos) => update({ correctiveActionPhotos }) })));
}
function AssignmentSection({ visit, update, onPreview }) {
    return (React.createElement(SectionShell, { title: "Store Assignment" },
        React.createElement("div", { className: "surface-card rounded-[28px] p-5 md:p-6" },
            React.createElement(Field, { label: "Assignment Link" },
                React.createElement(TextInput, { type: "url", value: visit.storeAssignmentLink || '', onChange: (e) => update({ storeAssignmentLink: e.target.value }), placeholder: "https://..." })),
            React.createElement("div", { className: "mt-5 flex flex-wrap gap-2" },
                React.createElement(Button, { icon: "eye", onClick: onPreview }, "Preview PDF")))));
}
function InstallGuideModal({ open, onClose, deferredPrompt, onPromptUsed }) {
    const ua = navigator.userAgent || '';
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isAndroid = /android/i.test(ua);
    const [guideMode, setGuideMode] = useState(isIos || isAndroid ? 'mobile' : 'desktop');
    useEffect(() => {
        if (open)
            setGuideMode(isIos || isAndroid ? 'mobile' : 'desktop');
    }, [open, isIos, isAndroid]);
    const mobileGuides = [
        { browser: 'Chrome Android', steps: 'Buka menu tiga titik, pilih “Install app” atau “Tambahkan ke layar utama”, lalu konfirmasi install.' },
        { browser: 'Samsung Internet', steps: 'Buka menu ≡, pilih “Add page to”, lalu pilih “Home screen” atau “Apps screen”.' },
        { browser: 'Microsoft Edge Android', steps: 'Buka menu bawah, pilih “Add to phone” atau “Install app”, lalu ikuti konfirmasi.' },
        { browser: 'Firefox Android', steps: 'Buka menu tiga titik, pilih “Install” bila tersedia. Jika tidak ada, pilih “Add to Home screen”.' },
        { browser: 'iPhone / iPad Safari', steps: 'Tekan tombol Share, pilih “Add to Home Screen”, lalu tekan “Add”.' },
        { browser: 'iPhone Chrome / Edge / Firefox', steps: 'Di iPhone tidak ada auto install. Buka menu Share browser, lalu pilih “Add to Home Screen”.' }
    ];
    const desktopGuides = [
        { browser: 'Chrome Desktop', steps: 'Klik icon install di address bar, atau buka menu ⋮ lalu pilih “Install app”.' },
        { browser: 'Microsoft Edge', steps: 'Buka menu ⋯ lalu pilih “Apps” → “Install this site as an app”.' },
        { browser: 'Firefox Desktop', steps: 'Gunakan menu browser lalu pilih “Install” bila tersedia. Jika tidak ada, buat shortcut manual di desktop/bookmarks.' },
        { browser: 'Safari macOS', steps: 'Buka File → Add to Dock atau gunakan Share / Shortcut sesuai versi macOS.' }
    ];
    async function installNow() {
        if (!deferredPrompt)
            return;
        try {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            onPromptUsed === null || onPromptUsed === void 0 ? void 0 : onPromptUsed();
            onClose();
        }
        catch (error) {
            onPromptUsed === null || onPromptUsed === void 0 ? void 0 : onPromptUsed();
        }
    }
    if (!open)
        return null;
    const canAutoInstall = Boolean(deferredPrompt) && !isIos;
    const guideItems = guideMode === 'mobile' ? mobileGuides : desktopGuides;
    return (React.createElement("div", { className: "fixed inset-0 z-[88] grid place-items-end bg-slate-950/65 p-0 backdrop-blur-sm md:place-items-center md:p-6", role: "dialog", "aria-modal": "true" },
        React.createElement("div", { className: "w-full rounded-t-[30px] bg-white p-5 shadow-2xl md:max-w-2xl md:rounded-[30px] md:p-6" },
            React.createElement("div", { className: "mb-4 flex items-start justify-between gap-3" },
                React.createElement("div", { className: "flex items-center gap-3" },
                    React.createElement("span", { className: "grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-audit-primary" },
                        React.createElement(Icon, { name: "spark" })),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.18em] text-audit-primary" }, "Install Apps"),
                        React.createElement("h2", { className: "text-xl font-black text-slate-950" }, "Tambahkan Bestie Visit ke perangkat"))),
                React.createElement(Button, { variant: "icon", onClick: onClose, "aria-label": "Tutup" },
                    React.createElement(Icon, { name: "close", className: "h-4 w-4" }))),
            React.createElement("div", { className: "mb-4 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200" },
                React.createElement("div", { className: "install-guide-tabs" },
                    React.createElement("button", { type: "button", className: cx('install-guide-tab', guideMode === 'mobile' && 'active'), onClick: () => setGuideMode('mobile') }, "Tutorial Mobile"),
                    React.createElement("button", { type: "button", className: cx('install-guide-tab', guideMode === 'desktop' && 'active'), onClick: () => setGuideMode('desktop') }, "Tutorial Desktop")),
                React.createElement("p", { className: "mt-3 text-xs font-semibold leading-5 text-slate-500" }, canAutoInstall ? 'Browser ini mendukung auto install. Gunakan tombol di bawah untuk menambahkan aplikasi dengan cepat.' : isIos ? 'Di iPhone / iPad auto install tidak didukung, jadi gunakan tutorial manual sesuai browser.' : 'Jika browser tidak menampilkan prompt install otomatis, gunakan langkah manual sesuai browser yang Anda pakai.')),
            canAutoInstall ? React.createElement(Button, { className: "mb-4 w-full", icon: "download", onClick: installNow }, "Auto Add to Home / Install App") : null,
            React.createElement("div", { className: "install-guide-grid" }, guideItems.map((item) => (React.createElement("div", { key: item.browser, className: "install-guide-card" },
                React.createElement("strong", null, item.browser),
                React.createElement("p", null, item.steps))))))));
}
function DashboardPage({ history, storageLabel, onNewVisit, onOpenVisit, onDeleteVisit, onClearHistory, onTitleTap }) {
    const averageProgress = history.length ? Math.round(history.reduce((sum, item) => sum + Number(item.progress || 0), 0) / history.length) : 0;
    const [installOpen, setInstallOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    useEffect(() => {
        function handleBeforeInstallPrompt(event) {
            event.preventDefault();
            setDeferredPrompt(event);
        }
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);
    return (React.createElement("main", { className: "dashboard-page mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 pb-28 md:px-8 md:py-8 md:pb-8" },
        React.createElement("section", { className: "dashboard-compact glass-panel overflow-hidden rounded-[26px] p-4 md:rounded-[30px] md:p-7" },
            React.createElement("div", { className: "flex items-start justify-between gap-3" },
                React.createElement("button", { type: "button", onClick: onTitleTap, className: "min-w-0 text-left" },
                    React.createElement("span", { className: "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-audit-primary ring-1 ring-emerald-100" }, "Dashboard"),
                    React.createElement("h1", { className: "mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-5xl" }, "Regional Bestie Visit Report")),
                React.createElement("button", { type: "button", className: "install-info-button", onClick: () => setInstallOpen(true), "aria-label": "Info install apps" },
                    React.createElement("span", { className: "install-info-button__icon" },
                        React.createElement(Icon, { name: "spark", className: "h-5 w-5" })),
                    React.createElement("span", { className: "install-info-button__text" }, "Install Apps"))),
            React.createElement("div", { className: "mt-4 grid grid-cols-2 gap-2" },
                React.createElement(Button, { icon: "plus", onClick: onNewVisit }, "Buat Kunjungan Baru"),
                React.createElement(Button, { variant: "danger", icon: "trash", onClick: onClearHistory }, "Hapus Semua History")),
            React.createElement("div", { className: "mt-4 grid grid-cols-3 gap-2" },
                React.createElement("div", { className: "dashboard-stat dark" },
                    React.createElement("p", null, "History"),
                    React.createElement("strong", null, history.length)),
                React.createElement("div", { className: "dashboard-stat" },
                    React.createElement("p", null, "Progress"),
                    React.createElement("strong", null,
                        averageProgress,
                        "%")),
                React.createElement("div", { className: "dashboard-stat" },
                    React.createElement("p", null, "Storage"),
                    React.createElement("span", null, storageLabel)))),
        React.createElement("section", null,
            React.createElement("div", { className: "mb-3 flex items-center justify-between gap-3" },
                React.createElement("h2", { className: "text-lg font-black tracking-tight text-slate-950 md:text-2xl" }, "History Kunjungan")),
            history.length ? (React.createElement("div", { className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3" }, history.map((item) => (React.createElement("article", { key: item.id, className: "history-card surface-card rounded-[22px] p-4 transition hover:-translate-y-0.5 hover:shadow-soft md:p-5" },
                React.createElement("div", { className: "mb-3 flex items-start justify-between gap-3" },
                    React.createElement("div", { className: "min-w-0" },
                        React.createElement("p", { className: "truncate text-base font-extrabold text-slate-950 md:text-lg" }, item.storeName),
                        React.createElement("p", { className: "mt-1 truncate text-xs text-slate-500" }, item.bestieName)),
                    React.createElement(Badge, { tone: item.progress >= 80 ? 'success' : item.progress >= 40 ? 'warning' : 'default' },
                        item.progress || 0,
                        "%")),
                React.createElement("div", { className: "mb-3 flex items-center gap-2 text-xs font-bold text-slate-500" },
                    React.createElement("span", null, item.storeCode || '-'),
                    React.createElement("span", null, "\u2022"),
                    React.createElement("span", null, formatDate(item.visitDate))),
                React.createElement(ProgressBar, { value: item.progress || 0 }),
                React.createElement("div", { className: "mt-4 flex gap-2" },
                    React.createElement(Button, { className: "flex-1", variant: "secondary", icon: "clipboard", onClick: () => onOpenVisit(item.id) }, "Lanjutkan"),
                    React.createElement(Button, { variant: "icon", onClick: () => onDeleteVisit(item.id), "aria-label": "Hapus history" },
                        React.createElement(Icon, { name: "trash", className: "h-4 w-4" })))))))) : (React.createElement(EmptyState, { icon: "clipboard", title: "Belum ada history", action: React.createElement(Button, { icon: "plus", onClick: onNewVisit }, "Buat Kunjungan Baru") }))),
        React.createElement(InstallGuideModal, { open: installOpen, onClose: () => setInstallOpen(false), deferredPrompt: deferredPrompt, onPromptUsed: () => setDeferredPrompt(null) })));
}
function NewVisitModal({ open, onClose, onCreate }) {
    const [bestieName, setBestieName] = useState('');
    const [storeName, setStoreName] = useState('');
    const [manualOpen, setManualOpen] = useState(false);
    const [manualStoreName, setManualStoreName] = useState('');
    const [manualStoreCode, setManualStoreCode] = useState('');
    const [manualAddress, setManualAddress] = useState('');
    const [manualNote, setManualNote] = useState('');
    const storeOptions = useMemo(() => getStoresForBestie(bestieName).map((item) => ({ label: item.label, value: item.value || item.label })), [bestieName]);
    useEffect(() => {
        var _a;
        if (!open)
            return;
        const initialBestie = BESTIE_NAMES[0] || '';
        const initialStore = ((_a = getStoresForBestie(initialBestie)[0]) === null || _a === void 0 ? void 0 : _a.label) || '';
        setBestieName(initialBestie);
        setStoreName(initialStore);
        setManualOpen(false);
        setManualStoreName('');
        setManualStoreCode('');
        setManualAddress('');
        setManualNote('');
    }, [open]);
    useEffect(() => {
        var _a;
        const options = getStoresForBestie(bestieName);
        if (!storeName || !options.some((item) => normalize(item.label) === normalize(storeName))) {
            setStoreName(((_a = options[0]) === null || _a === void 0 ? void 0 : _a.label) || '');
        }
    }, [bestieName]);
    function submitManualRequest() {
        if (!cleanText(manualStoreName)) {
            alert('Nama toko manual wajib diisi.');
            return;
        }
        createManualStoreRequest({ bestieName, storeName: manualStoreName, storeCode: manualStoreCode, address: manualAddress, note: manualNote });
        setManualOpen(false);
        setManualStoreName('');
        setManualStoreCode('');
        setManualAddress('');
        setManualNote('');
        alert('Request toko manual sudah dikirim ke panel admin.');
    }
    if (!open)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 z-[80] grid place-items-end bg-slate-950/60 p-0 backdrop-blur-sm md:place-items-center md:p-6", role: "dialog", "aria-modal": "true" },
        React.createElement("div", { className: "new-visit-modal w-full rounded-t-[30px] bg-white p-5 shadow-2xl md:max-w-2xl md:rounded-[32px] md:p-7" },
            React.createElement("div", { className: "mb-5 flex items-start justify-between gap-3" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary" }, "Kunjungan Baru"),
                    React.createElement("h2", { className: "mt-2 text-2xl font-black text-slate-950" }, "Pilih Bestie dan Store")),
                React.createElement(Button, { variant: "icon", onClick: onClose, "aria-label": "Tutup" },
                    React.createElement(Icon, { name: "close", className: "h-4 w-4" }))),
            React.createElement("div", { className: "grid gap-4" },
                React.createElement(SelectField, { label: "Nama Bestie", value: bestieName, options: BESTIE_NAMES, onChange: setBestieName, placeholder: "Pilih nama bestie", icon: "user", required: true }),
                React.createElement(SelectField, { label: "Store", value: storeName, options: storeOptions, onChange: setStoreName, placeholder: "Pilih store", icon: "store", required: true }),
                React.createElement("div", { className: "rounded-2xl border border-slate-200 p-3" },
                    React.createElement("button", { type: "button", className: "flex w-full items-center justify-between gap-3 text-left text-sm font-extrabold text-slate-900", onClick: () => setManualOpen((state) => !state) },
                        React.createElement("span", null, "Request toko manual"),
                        React.createElement(Icon, { name: "right", className: cx('h-4 w-4 transition', manualOpen ? 'rotate-90' : '') })),
                    manualOpen ? React.createElement("div", { className: "mt-3 grid gap-3" },
                        React.createElement(Field, { label: "Nama Toko" },
                            React.createElement(TextInput, { value: manualStoreName, onChange: (e) => setManualStoreName(e.target.value), placeholder: "Nama toko" })),
                        React.createElement(Field, { label: "Kode Toko" },
                            React.createElement(TextInput, { value: manualStoreCode, onChange: (e) => setManualStoreCode(e.target.value), placeholder: "Kode toko" })),
                        React.createElement(Field, { label: "Alamat" },
                            React.createElement(TextArea, { value: manualAddress, onChange: (e) => setManualAddress(e.target.value), placeholder: "Alamat toko", minRows: 2 })),
                        React.createElement(Field, { label: "Catatan" },
                            React.createElement(TextArea, { value: manualNote, onChange: (e) => setManualNote(e.target.value), placeholder: "Catatan", minRows: 2 })),
                        React.createElement(Button, { variant: "secondary", icon: "spark", onClick: submitManualRequest }, "Kirim Request Admin")) : null)),
            React.createElement("div", { className: "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end" },
                React.createElement(Button, { variant: "secondary", onClick: onClose }, "Tutup"),
                React.createElement(Button, { icon: "plus", onClick: () => onCreate(bestieName, storeName), disabled: !bestieName || !storeName }, "Mulai Kunjungan")))));
}
function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function PdfCanvasPreview({ blob, pdfUrl, status }) {
    const pagesRef = useRef(null);
    const scrollRef = useRef(null);
    const [fallback, setFallback] = useState(false);
    const [renderStatus, setRenderStatus] = useState('');
    const renderSeqRef = useRef(0);
    const lastWidthRef = useRef(0);
    useEffect(() => {
        let cancelled = false;
        let resizeTimer = null;
        let observer = null;
        async function renderPdf(force = false) {
            const target = pagesRef.current;
            const scroller = scrollRef.current;
            if (!target || !blob)
                return;
            const measuredWidth = Math.max(280, Math.floor(((scroller === null || scroller === void 0 ? void 0 : scroller.clientWidth) || target.clientWidth || 360) - 16));
            if (!force && Math.abs(measuredWidth - lastWidthRef.current) < 18 && target.childElementCount)
                return;
            lastWidthRef.current = measuredWidth;
            const seq = renderSeqRef.current + 1;
            renderSeqRef.current = seq;
            const pdfjsLib = window.pdfjsLib;
            if (!(pdfjsLib === null || pdfjsLib === void 0 ? void 0 : pdfjsLib.getDocument)) {
                setFallback(true);
                return;
            }
            try {
                setFallback(false);
                setRenderStatus('Memuat preview...');
                if (pdfjsLib.GlobalWorkerOptions) {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                }
                const scrollTop = (scroller === null || scroller === void 0 ? void 0 : scroller.scrollTop) || 0;
                const data = await blob.arrayBuffer();
                if (cancelled || renderSeqRef.current !== seq)
                    return;
                const pdf = await pdfjsLib.getDocument({ data }).promise;
                const fragment = document.createDocumentFragment();
                const maxWidth = Math.max(260, Math.min(measuredWidth, 1180));
                for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
                    if (cancelled || renderSeqRef.current !== seq)
                        return;
                    const page = await pdf.getPage(pageNumber);
                    const baseViewport = page.getViewport({ scale: 1 });
                    const scale = maxWidth / baseViewport.width;
                    const viewport = page.getViewport({ scale });
                    const outputScale = Math.min(window.devicePixelRatio || 1, 2);
                    const pageWrap = document.createElement('div');
                    pageWrap.className = 'pdf-preview-page-wrap';
                    const canvas = document.createElement('canvas');
                    canvas.className = 'pdf-preview-page-canvas';
                    canvas.width = Math.max(1, Math.floor(viewport.width * outputScale));
                    canvas.height = Math.max(1, Math.floor(viewport.height * outputScale));
                    canvas.style.width = Math.floor(viewport.width) + 'px';
                    canvas.style.height = Math.floor(viewport.height) + 'px';
                    pageWrap.appendChild(canvas);
                    fragment.appendChild(pageWrap);
                    const context = canvas.getContext('2d', { alpha: false });
                    await page.render({ canvasContext: context, viewport, transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null }).promise;
                }
                if (cancelled || renderSeqRef.current !== seq)
                    return;
                target.replaceChildren(fragment);
                if (scroller)
                    scroller.scrollTop = Math.min(scrollTop, Math.max(0, scroller.scrollHeight - scroller.clientHeight));
                setRenderStatus('');
            }
            catch (error) {
                console.warn('PDF canvas preview gagal:', error);
                if (!cancelled) {
                    setRenderStatus('');
                    setFallback(true);
                }
            }
        }
        renderPdf(true);
        function scheduleRender() {
            if (!blob)
                return;
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => renderPdf(false), 420);
        }
        // Hindari ResizeObserver pada container preview karena perubahan canvas dapat memicu render ulang berulang (blinking/stuck scroll).
        window.addEventListener('resize', scheduleRender, { passive: true });
        window.addEventListener('orientationchange', scheduleRender);
        return () => {
            cancelled = true;
            clearTimeout(resizeTimer);
            if (observer)
                observer.disconnect();
            window.removeEventListener('resize', scheduleRender);
            window.removeEventListener('orientationchange', scheduleRender);
            renderSeqRef.current += 1;
        };
    }, [blob]);
    if (!blob)
        return React.createElement("div", { className: "grid min-h-[52vh] place-items-center p-8 text-center text-slate-600" }, status);
    if (fallback && pdfUrl)
        return React.createElement("iframe", { className: "preview-frame", src: pdfUrl + '#toolbar=0&navpanes=0&scrollbar=1&view=FitH', title: "Preview Regional Bestie PDF" });
    return React.createElement("div", { ref: scrollRef, className: "pdf-canvas-scroll" },
        React.createElement("div", { ref: pagesRef, className: "pdf-canvas-pages" }),
        renderStatus ? React.createElement("div", { className: "pdf-render-status" }, renderStatus) : null);
}
function PreviewPage({ visit, onBack }) {
    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfBlob, setPdfBlob] = useState(null);
    const [status, setStatus] = useState('Menyiapkan preview PDF...');
    const [busy, setBusy] = useState(false);
    useEffect(() => {
        let cancelled = false;
        let objectUrl = '';
        async function render() {
            if (!visit)
                return;
            setStatus('Merender PDF...');
            try {
                const blob = await window.ReportVisitPDF.createBlob(visit);
                if (cancelled)
                    return;
                objectUrl = URL.createObjectURL(blob);
                setPdfBlob(blob);
                setPdfUrl(objectUrl);
                setStatus('Preview siap.');
            }
            catch (error) {
                setPdfBlob(null);
                setStatus((error === null || error === void 0 ? void 0 : error.message) || 'Preview PDF gagal dibuat.');
            }
        }
        render();
        return () => { cancelled = true; if (objectUrl)
            URL.revokeObjectURL(objectUrl); };
    }, [visit]);
    async function handleDownloadPdf() { if (!visit)
        return; setBusy(true); try {
        await window.ReportVisitPDF.save(visit);
    }
    catch (error) {
        alert((error === null || error === void 0 ? void 0 : error.message) || 'Gagal download PDF.');
    }
    finally {
        setBusy(false);
    } }
    async function handleExportExcel() { var _a; if (!visit)
        return; if (!((_a = window.__caAssignmentExport) === null || _a === void 0 ? void 0 : _a.buildWorkbook)) {
        alert('Mesin export Excel belum siap.');
        return;
    } setBusy(true); try {
        const blob = await window.__caAssignmentExport.buildWorkbook(visit);
        const fileName = 'CA_Store_Assignment_' + cleanText(visit.store, 'Store').replace(/\s+/g, '_') + '.xlsx';
        downloadBlob(blob, fileName);
    }
    catch (error) {
        alert((error === null || error === void 0 ? void 0 : error.message) || 'Gagal export Excel CA Assignment.');
    }
    finally {
        setBusy(false);
    } }
    if (!visit)
        return React.createElement("main", { className: "preview-page w-full px-4 py-8 md:px-8" },
            React.createElement(EmptyState, { icon: "pdf", title: "Belum ada visit aktif", action: React.createElement(Button, { variant: "secondary", onClick: onBack }, "Kembali") }));
    return (React.createElement("main", { className: "preview-page w-full px-4 py-4 md:px-8 md:py-8" },
        React.createElement("div", { className: "preview-header mb-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-end" },
            React.createElement("div", null,
                React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary" }, "Preview PDF"),
                React.createElement("h1", { className: "mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-3xl" }, "Review Report")),
            React.createElement("div", { className: "preview-progress-card rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-900 ring-1 ring-emerald-100" },
                React.createElement("div", { className: "mb-2 flex items-center justify-between gap-3" },
                    React.createElement("p", { className: "text-xs font-bold uppercase tracking-wide" }, "Progress"),
                    React.createElement("p", { className: "text-sm font-black" },
                        visitProgress(visit),
                        "%")),
                React.createElement(ProgressBar, { value: visitProgress(visit) }))),
        React.createElement("div", { className: "preview-modal-card surface-card overflow-hidden rounded-[24px] md:rounded-[28px]" },
            React.createElement("div", { className: "preview-toolbar flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between" },
                React.createElement("div", { className: "min-w-0" },
                    React.createElement("p", { className: "truncate text-sm font-extrabold text-slate-950" }, visit.store || 'Store belum dipilih'),
                    React.createElement("p", { className: "truncate text-xs text-slate-500" },
                        visit.nama || 'Bestie belum dipilih',
                        " \u2022 ",
                        formatDate(visit.tanggal))),
                React.createElement("div", { className: "preview-actions flex flex-wrap gap-2" },
                    React.createElement(Button, { variant: "secondary", icon: "left", onClick: onBack }, "Kembali"),
                    React.createElement(Button, { icon: "download", onClick: handleDownloadPdf, disabled: busy }, "Download PDF"),
                    React.createElement(Button, { variant: "secondary", icon: "excel", onClick: handleExportExcel, disabled: busy, className: "excel-export-button" },
                        React.createElement("span", { className: "text-left leading-tight" },
                            React.createElement("span", { className: "block" }, "Export Excel CA Assigment"),
                            React.createElement("span", { className: "block text-[11px] font-semibold text-slate-500" }, "file untuk feedback store"))))),
            React.createElement("div", { className: "preview-frame-wrap" },
                React.createElement(PdfCanvasPreview, { blob: pdfBlob, pdfUrl: pdfUrl, status: status })))));
}
// =============================================================
// Secret monitor helpers
// =============================================================
let RB_CONVEX_BUNDLE_PROMISE = null;
let RB_CONVEX_CLIENT = null;
let RB_CONVEX_CLIENT_URL = '';
function getConvexConfig() {
    return window.RB_CONVEX_CONFIG || {};
}
function getConvexDeploymentUrl() {
    const config = getConvexConfig();
    return cleanText(config.deploymentUrl || config.convexUrl || config.url || config.cloudUrl);
}
function getConvexHttpUrl() {
    const config = getConvexConfig();
    return cleanText(config.httpUrl || config.siteUrl);
}
function buildVisitKey(visit) {
    return [visit === null || visit === void 0 ? void 0 : visit.nama, visit === null || visit === void 0 ? void 0 : visit.store, visit === null || visit === void 0 ? void 0 : visit.tanggal].map((part) => normalize(part).replace(/\s+/g, '-')).filter(Boolean).join('__') || (visit === null || visit === void 0 ? void 0 : visit.id) || SESSION_ID;
}
function convexUrl(path) {
    const config = getConvexConfig();
    const httpUrl = getConvexHttpUrl();
    if (!config.enabled || !httpUrl)
        return '';
    return String(httpUrl).replace(/\/$/, '') + '/' + String(path || '').replace(/^\//, '');
}
function convexEnabled() {
    const config = getConvexConfig();
    return Boolean(config.enabled && (getConvexDeploymentUrl() || getConvexHttpUrl()));
}
function getConvexBundleUrl() {
    const config = getConvexConfig();
    return config.bundleUrl || 'https://unpkg.com/convex@latest/dist/browser.bundle.js';
}
function loadConvexBundle() {
    var _a;
    if ((_a = window.convex) === null || _a === void 0 ? void 0 : _a.ConvexClient)
        return Promise.resolve(window.convex);
    if (RB_CONVEX_BUNDLE_PROMISE)
        return RB_CONVEX_BUNDLE_PROMISE;
    RB_CONVEX_BUNDLE_PROMISE = new Promise((resolve, reject) => {
        const existing = document.getElementById('rbv-convex-client-bundle');
        if (existing) {
            existing.addEventListener('load', () => resolve(window.convex), { once: true });
            existing.addEventListener('error', () => reject(new Error('Convex client gagal dimuat.')), { once: true });
            return;
        }
        const script = document.createElement('script');
        script.id = 'rbv-convex-client-bundle';
        script.src = getConvexBundleUrl();
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => { var _a; return ((_a = window.convex) === null || _a === void 0 ? void 0 : _a.ConvexClient) ? resolve(window.convex) : reject(new Error('Convex client tidak tersedia.')); };
        script.onerror = () => reject(new Error('Convex client gagal dimuat.'));
        document.head.appendChild(script);
    });
    return RB_CONVEX_BUNDLE_PROMISE;
}
async function getConvexRealtimeClient() {
    var _a, _b;
    const config = getConvexConfig();
    const deploymentUrl = getConvexDeploymentUrl();
    if (!config.enabled || !deploymentUrl)
        return null;
    await loadConvexBundle();
    if (!((_a = window.convex) === null || _a === void 0 ? void 0 : _a.ConvexClient))
        return null;
    if (!RB_CONVEX_CLIENT || RB_CONVEX_CLIENT_URL !== deploymentUrl) {
        try {
            (_b = RB_CONVEX_CLIENT === null || RB_CONVEX_CLIENT === void 0 ? void 0 : RB_CONVEX_CLIENT.close) === null || _b === void 0 ? void 0 : _b.call(RB_CONVEX_CLIENT);
        }
        catch (error) { }
        RB_CONVEX_CLIENT = new window.convex.ConvexClient(deploymentUrl);
        RB_CONVEX_CLIENT_URL = deploymentUrl;
    }
    return RB_CONVEX_CLIENT;
}
async function runConvexQuery(functionName, args = {}) {
    const client = await getConvexRealtimeClient();
    if (!client || !functionName)
        return null;
    return client.query(functionName, args);
}
async function runConvexMutation(functionName, args = {}) {
    const client = await getConvexRealtimeClient();
    if (!client || !functionName)
        return null;
    return client.mutation(functionName, args);
}
async function subscribeConvexQuery(functionName, args, onData, onError) {
    const client = await getConvexRealtimeClient();
    if (!client || !functionName || typeof client.onUpdate !== 'function')
        return null;
    const unsubscribe = client.onUpdate(functionName, args || {}, onData, onError);
    return () => {
        if (typeof unsubscribe === 'function')
            unsubscribe();
        else if (typeof (unsubscribe === null || unsubscribe === void 0 ? void 0 : unsubscribe.unsubscribe) === 'function')
            unsubscribe.unsubscribe();
    };
}
function normalizeMonitorRows(rows) {
    const safeRows = Array.isArray(rows) ? rows : (Array.isArray(rows === null || rows === void 0 ? void 0 : rows.rows) ? rows.rows : Array.isArray(rows === null || rows === void 0 ? void 0 : rows.data) ? rows.data : []);
    return safeRows.map((row) => ({
        id: row._id || row.id || row.visit_key || `${row.bestie_name || row.bestieName}-${row.store_name || row.storeName}-${row.visit_date || row.visitDate}`,
        bestie_name: row.bestie_name || row.bestieName || row.nama || '-',
        store_name: row.store_name || row.storeName || row.store || '-',
        store_code: row.store_code || row.storeCode || '',
        visit_date: row.visit_date || row.visitDate || row.tanggal || '',
        total_visits: row.total_visits || row.totalVisits || 1,
        updated_at: row.updated_at || row.updatedAt || row.last_visit_at || row.lastVisitAt || '',
        session_id: row.session_id || row.sessionId || '-'
    }));
}
function normalizeManualRequestRows(rows) {
    const safeRows = Array.isArray(rows) ? rows : (Array.isArray(rows === null || rows === void 0 ? void 0 : rows.rows) ? rows.rows : Array.isArray(rows === null || rows === void 0 ? void 0 : rows.data) ? rows.data : []);
    return safeRows.map((item) => ({
        id: item.request_id || item.requestId || item.id || item._id,
        status: item.status || 'pending',
        createdAt: item.created_at || item.createdAt || Date.now(),
        updatedAt: item.updated_at || item.updatedAt || item.created_at || item.createdAt || Date.now(),
        bestieName: item.bestie_name || item.bestieName || '',
        storeName: item.store_name || item.storeName || item.siteDescr || '',
        storeCode: item.store_code || item.storeCode || item.siteCode || '',
        address: item.address || '',
        note: item.note || ''
    })).filter((item) => item.id && item.storeName);
}
function persistManualRequestsFromRemote(items) {
    const normalized = normalizeManualRequestRows(items);
    if (!normalized.length)
        return normalized;
    saveManualStoreRequests(normalized);
    const approvedStores = normalized
        .filter((item) => item.status === 'approved')
        .map((item) => ({
        siteDescr: item.storeName,
        storeName: item.storeName,
        siteCode: item.storeCode,
        siteCode4: item.storeCode,
        address: item.address,
        city: '',
        source: 'convex-approved',
        approvedAt: item.updatedAt,
        requestedBy: item.bestieName
    }));
    if (approvedStores.length)
        saveApprovedManualStores([...approvedStores, ...readApprovedManualStores()]);
    return normalized;
}
function monitorPayloadFromVisit(visit) {
    const detail = getStoreWebDetail(visit.store);
    return {
        visit_key: buildVisitKey(visit),
        bestie_name: cleanText(visit.nama, '-'),
        store_name: cleanText(visit.store, '-'),
        store_code: cleanText(detail.siteCode4 || detail.siteCode || detail.storeCode, ''),
        visit_date: visit.tanggal || new Date().toISOString().slice(0, 10),
        total_visits: 1,
        last_visit_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        session_id: SESSION_ID,
        event_type: 'autosave',
        page_url: location.href,
        user_agent: navigator.userAgent
    };
}
async function upsertMonitorVisit(visit) {
    const config = getConvexConfig();
    if (!convexEnabled() || !visit || !cleanText(visit.nama) || !cleanText(visit.store))
        return;
    const payload = monitorPayloadFromVisit(visit);
    try {
        const mutationName = config.upsertMutation || 'monitor:upsertVisit';
        const result = await runConvexMutation(mutationName, { payload });
        if (result !== null)
            return;
    }
    catch (error) {
        console.warn('Convex realtime mutation gagal, fallback HTTP:', error);
    }
    const endpoint = convexUrl(config.upsertPath || 'monitor/upsertVisit');
    if (!endpoint)
        return;
    try {
        await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}) },
            body: JSON.stringify(payload)
        });
    }
    catch (error) {
        console.warn('Convex upsert gagal:', error);
    }
}
async function fetchMonitorRowsFromConvex() {
    const config = getConvexConfig();
    if (!convexEnabled())
        return null;
    try {
        const queryName = config.monitorQuery || 'monitor:listVisits';
        const rows = await runConvexQuery(queryName, {});
        if (rows !== null)
            return normalizeMonitorRows(rows);
    }
    catch (error) {
        console.warn('Convex realtime query gagal, fallback HTTP:', error);
    }
    const endpoint = convexUrl(config.listPath || 'monitor/listVisits');
    if (!endpoint)
        return null;
    const response = await fetch(endpoint, {
        method: 'GET',
        headers: { ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}) }
    });
    if (!response.ok)
        throw new Error('Convex monitor gagal dibaca.');
    const payload = await response.json();
    return normalizeMonitorRows(payload);
}
async function fetchManualRequestsFromConvex() {
    const config = getConvexConfig();
    if (!convexEnabled())
        return null;
    try {
        const queryName = config.manualRequestsQuery || 'monitor:listManualStoreRequests';
        const rows = await runConvexQuery(queryName, {});
        if (rows !== null)
            return persistManualRequestsFromRemote(rows);
    }
    catch (error) {
        console.warn('Convex manual request query gagal, fallback HTTP:', error);
    }
    const endpoint = convexUrl(config.listManualRequestsPath || 'monitor/listManualStoreRequests');
    if (!endpoint)
        return null;
    const response = await fetch(endpoint, {
        method: 'GET',
        headers: { ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}) }
    });
    if (!response.ok)
        throw new Error('Convex request toko gagal dibaca.');
    const payload = await response.json();
    return persistManualRequestsFromRemote(payload);
}
async function syncManualRequestToConvex(request) {
    const config = getConvexConfig();
    if (!convexEnabled() || !request)
        return;
    const payload = {
        request_id: request.id,
        status: request.status || 'pending',
        created_at: request.createdAt || Date.now(),
        updated_at: request.updatedAt || Date.now(),
        bestie_name: cleanText(request.bestieName),
        store_name: cleanText(request.storeName),
        store_code: cleanText(request.storeCode),
        address: cleanText(request.address),
        note: cleanText(request.note),
        session_id: SESSION_ID,
        page_url: location.href,
        user_agent: navigator.userAgent
    };
    try {
        const result = await runConvexMutation(config.upsertManualRequestMutation || 'monitor:upsertManualStoreRequest', { payload });
        if (result !== null)
            return;
    }
    catch (error) {
        console.warn('Convex request toko gagal, fallback HTTP:', error);
    }
    const endpoint = convexUrl(config.upsertManualRequestPath || 'monitor/upsertManualStoreRequest');
    if (!endpoint)
        return;
    try {
        await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}) },
            body: JSON.stringify(payload)
        });
    }
    catch (error) {
        console.warn('HTTP request toko gagal:', error);
    }
}
async function syncManualRequestStatusToConvex(request) {
    if (!request)
        return;
    syncManualRequestToConvex(request);
}
function exportJson(data, fileName) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, fileName);
}

function WelcomeOverlay({ config, onDone }) {
    const title = cleanText(config && config.title, DEFAULT_WELCOME_CONFIG.title);
    const subtitle = cleanText(config && config.subtitle, DEFAULT_WELCOME_CONFIG.subtitle);
    useEffect(() => {
        const timer = window.setTimeout(onDone, 5000);
        return () => window.clearTimeout(timer);
    }, [onDone]);
    return (React.createElement("div", { className: "welcome-dream-overlay", role: "dialog", "aria-modal": "true", onClick: onDone },
        React.createElement("div", { className: "welcome-dream-card", onClick: (event) => event.stopPropagation() },
            React.createElement("div", { className: "welcome-orb welcome-orb-a" }),
            React.createElement("div", { className: "welcome-orb welcome-orb-b" }),
            React.createElement("div", { className: "welcome-dream-content" },
                React.createElement("p", { className: "welcome-kicker" }, "Bestie Visit"),
                React.createElement("h1", null, title),
                React.createElement("p", { className: "welcome-subtitle" }, subtitle),
                React.createElement("button", { type: "button", className: "welcome-skip", onClick: onDone }, "Masuk")))));
}
function SecretPinModal({ open, onClose, onUnlock }) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const inputRef = useRef(null);
    useEffect(() => {
        if (!open)
            return;
        setPin('');
        setError('');
        setTimeout(() => { var _a; return (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }, 60);
    }, [open]);
    useEffect(() => {
        if (pin.length < 6)
            return;
        if (pin === '607090') {
            setPin('');
            onUnlock();
        }
        else {
            setError('PIN salah');
            setPin('');
        }
    }, [pin]);
    if (!open)
        return null;
    return (React.createElement("div", { className: "fixed inset-0 z-[90] grid place-items-center bg-slate-950/70 p-5 backdrop-blur-sm", role: "dialog", "aria-modal": "true" },
        React.createElement("div", { className: "w-full max-w-md rounded-[32px] bg-white p-6 shadow-2xl" },
            React.createElement("div", { className: "mb-5 flex items-center justify-between" },
                React.createElement("div", { className: "flex items-center gap-3" },
                    React.createElement("span", { className: "grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white" },
                        React.createElement(Icon, { name: "shield" })),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary" }, "Panel Rahasia"),
                        React.createElement("h2", { className: "text-xl font-black text-slate-950" }, "Masukkan PIN"))),
                React.createElement(Button, { variant: "icon", onClick: onClose, "aria-label": "Tutup" },
                    React.createElement(Icon, { name: "close", className: "h-4 w-4" }))),
            React.createElement("input", { ref: inputRef, value: pin, onChange: (event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6)), type: "password", inputMode: "numeric", maxLength: "6", className: "form-control text-center text-3xl font-black tracking-[0.5em]", placeholder: "------", "aria-label": "PIN panel rahasia" }),
            error ? React.createElement("p", { className: "mt-3 text-center text-sm font-bold text-rose-600" }, error) : null)));
}
function SecretMonitorPanel({ open, onClose, history, welcomeConfig, onWelcomeConfigChange }) {
    const [rows, setRows] = useState([]);
    const [source, setSource] = useState('local');
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [manualRequests, setManualRequests] = useState([]);
    const [connectionState, setConnectionState] = useState('offline');
    const [lastSync, setLastSync] = useState('');
    const [welcomeTitle, setWelcomeTitle] = useState(DEFAULT_WELCOME_CONFIG.title);
    const [welcomeSubtitle, setWelcomeSubtitle] = useState(DEFAULT_WELCOME_CONFIG.subtitle);
    function saveWelcomeSettings() {
        const saved = saveWelcomeConfig({ title: welcomeTitle, subtitle: welcomeSubtitle });
        if (typeof onWelcomeConfigChange === 'function')
            onWelcomeConfigChange(saved);
        alert('Text welcome berhasil disimpan.');
    }
    function localRows() {
        return (history || []).map((item) => ({
            bestie_name: item.bestieName,
            store_name: item.storeName,
            store_code: item.storeCode,
            visit_date: item.visitDate,
            total_visits: 1,
            updated_at: item.updatedAt,
            session_id: '-'
        }));
    }
    function applyRows(nextRows, nextSource) {
        setRows(normalizeMonitorRows(nextRows));
        setSource(nextSource);
        setLastSync(new Date().toISOString());
    }
    function applyManualRequests(nextRequests) {
        const normalized = persistManualRequestsFromRemote(nextRequests);
        setManualRequests(normalized);
        setLastSync(new Date().toISOString());
    }
    async function refresh(options = {}) {
        const quiet = Boolean(options.quiet);
        if (!quiet)
            setLoading(true);
        try {
            const [remoteRowsResult, remoteRequestsResult] = await Promise.allSettled([
                fetchMonitorRowsFromConvex(),
                fetchManualRequestsFromConvex()
            ]);
            const remoteRows = remoteRowsResult.status === 'fulfilled' ? remoteRowsResult.value : null;
            const remoteRequests = remoteRequestsResult.status === 'fulfilled' ? remoteRequestsResult.value : null;
            if (remoteRows !== null) {
                applyRows(remoteRows, source === 'convex realtime' ? 'convex realtime' : 'convex');
            }
            else {
                applyRows(localRows(), 'local');
            }
            if (remoteRequests !== null) {
                setManualRequests(remoteRequests);
            }
            else {
                setManualRequests(readManualStoreRequests());
            }
        }
        catch (error) {
            applyRows(localRows(), 'local');
            setManualRequests(readManualStoreRequests());
        }
        finally {
            if (!quiet)
                setLoading(false);
        }
    }
    function approveRequest(id) {
        if (!confirmAction('Approve request toko manual ini?'))
            return;
        approveManualStoreRequest(id);
        setManualRequests(readManualStoreRequests());
        refresh({ quiet: true });
    }
    function rejectRequest(id) {
        if (!confirmAction('Tolak request toko manual ini?'))
            return;
        rejectManualStoreRequest(id);
        setManualRequests(readManualStoreRequests());
        refresh({ quiet: true });
    }
    useEffect(() => {
        if (!open)
            return undefined;
        const currentWelcome = welcomeConfig || readWelcomeConfig();
        setWelcomeTitle(cleanText(currentWelcome.title, DEFAULT_WELCOME_CONFIG.title));
        setWelcomeSubtitle(cleanText(currentWelcome.subtitle, DEFAULT_WELCOME_CONFIG.subtitle));
        let cancelled = false;
        let unsubscribeRows = null;
        let unsubscribeRequests = null;
        let unsubscribeConnection = null;
        let pollId = null;
        async function startRealtime() {
            setLoading(true);
            setManualRequests(readManualStoreRequests());
            try {
                const client = await getConvexRealtimeClient();
                if (cancelled)
                    return;
                if (client) {
                    setConnectionState('connecting');
                    if (typeof client.subscribeToConnectionState === 'function') {
                        unsubscribeConnection = client.subscribeToConnectionState((state) => {
                            const status = (state === null || state === void 0 ? void 0 : state.hasInflightRequests) ? 'syncing' : (state === null || state === void 0 ? void 0 : state.isWebSocketConnected) ? 'online' : 'connecting';
                            setConnectionState(status);
                        });
                    }
                    unsubscribeRows = await subscribeConvexQuery(getConvexConfig().monitorQuery || 'monitor:listVisits', {}, (nextRows) => {
                        if (cancelled)
                            return;
                        applyRows(nextRows, 'convex realtime');
                        setConnectionState('online');
                        setLoading(false);
                    }, (error) => {
                        console.warn('Realtime monitor rows gagal:', error);
                        if (!cancelled) {
                            setConnectionState('error');
                            refresh({ quiet: true });
                        }
                    });
                    unsubscribeRequests = await subscribeConvexQuery(getConvexConfig().manualRequestsQuery || 'monitor:listManualStoreRequests', {}, (nextRequests) => {
                        if (cancelled)
                            return;
                        applyManualRequests(nextRequests);
                        setConnectionState('online');
                        setLoading(false);
                    }, (error) => {
                        console.warn('Realtime request toko gagal:', error);
                        if (!cancelled) {
                            setConnectionState('error');
                            setManualRequests(readManualStoreRequests());
                        }
                    });
                }
                if (!unsubscribeRows && !unsubscribeRequests) {
                    await refresh();
                    const pollMs = Number(getConvexConfig().pollMs || 5000);
                    pollId = window.setInterval(() => refresh({ quiet: true }), Math.max(2500, pollMs));
                }
                else {
                    await refresh({ quiet: true });
                }
            }
            catch (error) {
                console.warn('Realtime Convex gagal, fallback refresh:', error);
                if (!cancelled) {
                    setConnectionState('fallback');
                    await refresh();
                    const pollMs = Number(getConvexConfig().pollMs || 5000);
                    pollId = window.setInterval(() => refresh({ quiet: true }), Math.max(2500, pollMs));
                }
            }
            finally {
                if (!cancelled)
                    setLoading(false);
            }
        }
        startRealtime();
        return () => {
            cancelled = true;
            if (pollId)
                window.clearInterval(pollId);
            try {
                unsubscribeRows === null || unsubscribeRows === void 0 ? void 0 : unsubscribeRows();
            }
            catch (error) { }
            try {
                unsubscribeRequests === null || unsubscribeRequests === void 0 ? void 0 : unsubscribeRequests();
            }
            catch (error) { }
            try {
                unsubscribeConnection === null || unsubscribeConnection === void 0 ? void 0 : unsubscribeConnection();
            }
            catch (error) { }
        };
    }, [open, history]);
    if (!open)
        return null;
    const filtered = rows.filter((row) => {
        const haystack = normalize([row.bestie_name, row.store_name, row.store_code].join(' '));
        return !query || haystack.includes(normalize(query));
    });
    const uniqueBesties = new Set(rows.map((row) => normalize(row.bestie_name)).filter(Boolean)).size;
    const today = new Date().toISOString().slice(0, 10);
    const todayVisits = rows.filter((row) => String(row.visit_date || '').slice(0, 10) === today).length;
    const isLive = source === 'convex realtime';
    const connectionTone = connectionState === 'online' ? 'success' : connectionState === 'error' || connectionState === 'fallback' ? 'warning' : 'default';
    return (React.createElement("div", { className: "fixed inset-0 z-[85] overflow-auto bg-slate-950/65 p-3 backdrop-blur-sm md:p-6", role: "dialog", "aria-modal": "true" },
        React.createElement("div", { className: "mx-auto max-w-6xl rounded-[32px] bg-white p-5 shadow-2xl md:p-7" },
            React.createElement("div", { className: "mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between" },
                React.createElement("div", null,
                    React.createElement("div", { className: "flex flex-wrap items-center gap-2" },
                        React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary" }, "Monitor Admin"),
                        React.createElement(Badge, { tone: isLive ? 'success' : 'default' }, isLive ? 'Live Convex' : 'Manual refresh'),
                        React.createElement(Badge, { tone: connectionTone }, connectionState)),
                    React.createElement("h2", { className: "mt-2 text-2xl font-black text-slate-950" }, "Pantauan Visit Bestie & Store"),
                    lastSync ? React.createElement("p", { className: "mt-1 text-xs font-semibold text-slate-500" },
                        "Update terakhir: ",
                        formatDateTime(lastSync)) : null),
                React.createElement("div", { className: "flex flex-wrap gap-2" },
                    React.createElement(Button, { variant: "secondary", icon: "download", onClick: () => exportJson(rows, 'regional-bestie-monitor.json') }, "Export JSON"),
                    React.createElement(Button, { variant: "secondary", icon: "spark", onClick: () => refresh(), disabled: loading }, loading ? 'Sync...' : 'Refresh'),
                    React.createElement(Button, { variant: "icon", onClick: onClose, "aria-label": "Tutup" },
                        React.createElement(Icon, { name: "close", className: "h-4 w-4" })))),
            React.createElement("div", { className: "mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" },
                React.createElement("div", { className: "rounded-3xl bg-slate-950 p-5 text-white" },
                    React.createElement("p", { className: "text-xs font-bold uppercase text-slate-300" }, "Source"),
                    React.createElement("p", { className: "mt-2 text-2xl font-black capitalize" }, source)),
                React.createElement("div", { className: "rounded-3xl bg-emerald-50 p-5 text-emerald-900 ring-1 ring-emerald-100" },
                    React.createElement("p", { className: "text-xs font-bold uppercase" }, "Total Visit"),
                    React.createElement("p", { className: "mt-2 text-3xl font-black" }, rows.length)),
                React.createElement("div", { className: "rounded-3xl bg-orange-50 p-5 text-orange-900 ring-1 ring-orange-100" },
                    React.createElement("p", { className: "text-xs font-bold uppercase" }, "Bestie Unik"),
                    React.createElement("p", { className: "mt-2 text-3xl font-black" }, uniqueBesties)),
                React.createElement("div", { className: "rounded-3xl bg-slate-50 p-5 text-slate-900 ring-1 ring-slate-200" },
                    React.createElement("p", { className: "text-xs font-bold uppercase text-slate-500" }, "Visit Hari Ini"),
                    React.createElement("p", { className: "mt-2 text-3xl font-black" }, todayVisits))),
            React.createElement("div", { className: "mb-5 rounded-3xl border border-cyan-100 bg-cyan-50/70 p-4" },
                React.createElement("div", { className: "mb-3 flex items-center justify-between gap-3" },
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.18em] text-audit-primary" }, "Welcome Animation"),
                        React.createElement("h3", { className: "text-lg font-black text-slate-950" }, "Edit Text Welcome")),
                    React.createElement(Button, { variant: "secondary", icon: "check", onClick: saveWelcomeSettings }, "Simpan Welcome")),
                React.createElement("div", { className: "grid gap-3 md:grid-cols-2" },
                    React.createElement(Field, { label: "Head title" },
                        React.createElement(TextInput, { value: welcomeTitle, onChange: (event) => setWelcomeTitle(event.target.value), placeholder: DEFAULT_WELCOME_CONFIG.title })),
                    React.createElement(Field, { label: "Sub title" },
                        React.createElement(TextArea, { value: welcomeSubtitle, onChange: (event) => setWelcomeSubtitle(event.target.value), minRows: 2, placeholder: DEFAULT_WELCOME_CONFIG.subtitle })))),
            React.createElement("div", { className: "mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-4" },
                React.createElement("div", { className: "mb-3 flex items-center justify-between gap-3" },
                    React.createElement("h3", { className: "text-lg font-black text-slate-950" }, "Request Toko Manual"),
                    React.createElement(Badge, { tone: "default" },
                        manualRequests.filter((item) => item.status === 'pending').length,
                        " pending")),
                React.createElement("div", { className: "grid gap-3" }, manualRequests.length ? manualRequests.map((item) => (React.createElement("div", { key: item.id, className: "rounded-2xl bg-white p-3 ring-1 ring-slate-200" },
                    React.createElement("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between" },
                        React.createElement("div", { className: "min-w-0" },
                            React.createElement("p", { className: "font-extrabold text-slate-950" }, item.storeName || '-'),
                            React.createElement("p", { className: "text-xs text-slate-500" },
                                item.bestieName || '-',
                                " \u2022 ",
                                item.storeCode || '-',
                                " \u2022 ",
                                formatDateTime(item.createdAt)),
                            item.address ? React.createElement("p", { className: "mt-1 text-xs text-slate-600" }, item.address) : null),
                        React.createElement("div", { className: "flex flex-wrap items-center gap-2" },
                            React.createElement(Badge, { tone: item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'warning' : 'default' }, item.status),
                            item.status === 'pending' ? React.createElement(React.Fragment, null,
                                React.createElement(Button, { variant: "secondary", icon: "check", onClick: () => approveRequest(item.id) }, "Approve"),
                                React.createElement(Button, { variant: "danger", icon: "close", onClick: () => rejectRequest(item.id) }, "Reject")) : null))))) : React.createElement("div", { className: "rounded-2xl bg-white p-4 text-sm font-bold text-slate-500 ring-1 ring-slate-200" }, "Belum ada request."))),
            React.createElement("div", { className: "mb-4 max-w-md" },
                React.createElement("div", { className: "relative" },
                    React.createElement(Icon, { name: "search", className: "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" }),
                    React.createElement(TextInput, { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Cari bestie, store, kode...", className: "pl-12" }))),
            React.createElement("div", { className: "table-scroll overflow-hidden rounded-3xl border border-slate-200" },
                React.createElement("table", { className: "w-full border-collapse bg-white text-sm" },
                    React.createElement("thead", { className: "bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500" },
                        React.createElement("tr", null,
                            React.createElement("th", { className: "px-4 py-3" }, "No"),
                            React.createElement("th", { className: "px-4 py-3" }, "Bestie"),
                            React.createElement("th", { className: "px-4 py-3" }, "Kode"),
                            React.createElement("th", { className: "px-4 py-3" }, "Store"),
                            React.createElement("th", { className: "px-4 py-3" }, "Visit"),
                            React.createElement("th", { className: "px-4 py-3" }, "Update"))),
                    React.createElement("tbody", null, filtered.length ? filtered.map((row, index) => (React.createElement("tr", { key: `${row.bestie_name}-${row.store_name}-${index}`, className: "border-t border-slate-100" },
                        React.createElement("td", { className: "px-4 py-3 font-bold text-slate-500" }, index + 1),
                        React.createElement("td", { className: "px-4 py-3 font-bold text-slate-900" }, row.bestie_name || '-'),
                        React.createElement("td", { className: "px-4 py-3" }, row.store_code || '-'),
                        React.createElement("td", { className: "px-4 py-3" }, row.store_name || '-'),
                        React.createElement("td", { className: "px-4 py-3" }, formatDate(row.visit_date)),
                        React.createElement("td", { className: "px-4 py-3 text-slate-500" }, formatDateTime(row.updated_at))))) : React.createElement("tr", null,
                        React.createElement("td", { colSpan: "6", className: "px-4 py-10 text-center text-slate-500" }, "Tidak ada data."))))))));
}
function DesktopSidebar({ screen, setScreen, visit, activeSection, goSection, onNewVisit, onClearData, onTitleTap }) {
    return (React.createElement("aside", { className: "desktop-sidebar hidden min-h-screen border-r border-slate-200 bg-white/86 p-4 backdrop-blur-xl md:flex md:flex-col" },
        React.createElement("button", { type: "button", onClick: onTitleTap, className: "mb-6 rounded-[28px] bg-slate-950 p-5 text-left text-white transition hover:-translate-y-0.5" },
            React.createElement("div", { className: "mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/10" },
                React.createElement(Icon, { name: "spark" })),
            React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-200" }, "Bestie Audit"),
            React.createElement("h2", { className: "mt-2 text-xl font-black leading-tight" }, "Visit Report System")),
        React.createElement("nav", { className: "space-y-2", "aria-label": "System menu" },
            React.createElement("button", { type: "button", className: cx('nav-item', screen === 'dashboard' && 'active'), onClick: () => { onTitleTap === null || onTitleTap === void 0 ? void 0 : onTitleTap(); setScreen('dashboard'); } },
                React.createElement("span", { className: "flex items-center gap-3" },
                    React.createElement(Icon, { name: "home" }),
                    React.createElement("span", null,
                        React.createElement("span", { className: "block font-extrabold" }, "Dashboard")))),
            React.createElement("button", { type: "button", className: cx('nav-item', screen === 'audit' && 'active'), onClick: () => visit ? setScreen('audit') : onNewVisit() },
                React.createElement("span", { className: "flex items-center gap-3" },
                    React.createElement(Icon, { name: "clipboard" }),
                    React.createElement("span", null,
                        React.createElement("span", { className: "block font-extrabold" }, "Audit Form")))),
            React.createElement("button", { type: "button", className: cx('nav-item', screen === 'preview' && 'active'), onClick: () => visit ? setScreen('preview') : onNewVisit() },
                React.createElement("span", { className: "flex items-center gap-3" },
                    React.createElement(Icon, { name: "pdf" }),
                    React.createElement("span", null,
                        React.createElement("span", { className: "block font-extrabold" }, "Preview PDF"))))),
        visit ? (React.createElement("div", { className: "mt-6" },
            React.createElement("p", { className: "mb-3 px-2 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500" }, "Sub Menu Section"),
            React.createElement("div", { className: "space-y-1" }, SECTION_DEFS.map((section, index) => (React.createElement("button", { key: section.id, type: "button", className: cx('nav-item !rounded-2xl !px-3 !py-2', screen === 'audit' && activeSection === index && 'active'), onClick: () => { setScreen('audit'); goSection(index); } },
                React.createElement("span", { className: "flex items-center gap-3" },
                    React.createElement(Icon, { name: section.icon, className: "h-4 w-4" }),
                    React.createElement("span", { className: "min-w-0" },
                        React.createElement("span", { className: "block truncate text-sm font-extrabold" }, section.title))))))))) : null,
        React.createElement("div", { className: "mt-auto space-y-2 pt-5" },
            React.createElement(Button, { className: "w-full", variant: "secondary", icon: "plus", onClick: onNewVisit }, "Kunjungan Baru"),
            visit ? React.createElement(Button, { className: "w-full", variant: "danger", icon: "eraser", onClick: onClearData }, "Clear Data") : null)));
}
function MobileTopBar({ screen, visit, activeSection, goSection }) {
    if (screen !== 'audit' || !visit)
        return null;
    const progress = visitProgress(visit);
    return (React.createElement("header", { className: "mobile-quick-section md:hidden" },
        React.createElement("div", { className: "mobile-quick-scroll", "aria-label": "Quick section" }, SECTION_DEFS.map((section, index) => (React.createElement("button", { key: section.id, type: "button", className: cx('mobile-quick-chip', activeSection === index && 'active'), onClick: () => goSection(index) },
            React.createElement(Icon, { name: section.icon, className: "h-4 w-4" }),
            React.createElement("span", null, section.label))))),
        React.createElement("div", { className: "mobile-quick-progress" },
            React.createElement(ProgressBar, { value: progress }))));
}
function MobileBottomNav({ screen, setScreen, visit, onNewVisit, onClearData }) {
    const goAudit = () => visit ? setScreen('audit') : onNewVisit();
    const goPreview = () => visit ? setScreen('preview') : onNewVisit();
    const items = [
        { key: 'dashboard', label: 'Home', icon: 'home', action: () => setScreen('dashboard'), active: screen === 'dashboard' },
        { key: 'audit', label: 'Audit', icon: 'clipboard', action: goAudit, active: screen === 'audit' },
        { key: 'preview', label: 'Preview', icon: 'pdf', action: goPreview, active: screen === 'preview' }
    ];
    return (React.createElement("nav", { className: "mobile-system-nav md:hidden", "aria-label": "Mobile system navigation" },
        React.createElement("div", { className: cx('mobile-system-grid', screen === 'audit' && visit ? 'cols-4' : 'cols-3') },
            items.map((item) => React.createElement("button", { key: item.key, type: "button", className: cx('mobile-system-button', item.active && 'active'), onClick: item.action },
                React.createElement(Icon, { name: item.icon, className: "h-5 w-5" }),
                React.createElement("span", null, item.label))),
            screen === 'audit' && visit ? React.createElement("button", { type: "button", className: "mobile-system-button danger", onClick: onClearData },
                React.createElement(Icon, { name: "eraser", className: "h-5 w-5" }),
                React.createElement("span", null, "Clear")) : null)));
}
function VisitWorkspace({ visit, update, activeSection, goSection, onPreview }) {
    var _a;
    useEffect(() => {
        function handleKey(event) {
            if (isEditableTarget(event.target))
                return;
            if (event.key === 'ArrowRight')
                goSection(activeSection + 1);
            if (event.key === 'ArrowLeft')
                goSection(activeSection - 1);
        }
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [activeSection]);
    if (!visit)
        return React.createElement("main", { className: "workspace-page w-full px-4 py-8 md:px-8" },
            React.createElement(EmptyState, { icon: "clipboard", title: "Belum ada visit aktif" }));
    const screens = [React.createElement(VisitSetupSection, { visit: visit, update: update }), React.createElement(GeneralInfoSection, { visit: visit, update: update }), React.createElement(QscResultSection, { visit: visit, update: update }), React.createElement(ObservationSection, { visit: visit, update: update }), React.createElement(EvidenceSection, { visit: visit, update: update }), React.createElement(AssignmentSection, { visit: visit, update: update, onPreview: onPreview })];
    return (React.createElement("main", { className: "workspace-page w-full px-4 py-5 md:px-8 md:py-8" },
        React.createElement("div", { className: "desktop-section-card mb-5 hidden rounded-[28px] bg-white p-4 ring-1 ring-slate-200 md:block" },
            React.createElement("div", { className: "flex items-center justify-between gap-3" },
                React.createElement("div", { className: "min-w-0" },
                    React.createElement("p", { className: "truncate text-sm font-extrabold text-slate-950" }, visit.store || 'Store belum dipilih'),
                    React.createElement("p", { className: "truncate text-xs text-slate-500" },
                        visit.nama || 'Bestie belum dipilih',
                        " \u2022 ",
                        formatDate(visit.tanggal))),
                React.createElement("div", { className: "hidden gap-2 sm:flex" },
                    React.createElement(Button, { variant: "icon", onClick: () => goSection(activeSection - 1), disabled: activeSection <= 0, "aria-label": "Section sebelumnya" },
                        React.createElement(Icon, { name: "left", className: "h-5 w-5" })),
                    React.createElement(Button, { variant: "icon", onClick: () => goSection(activeSection + 1), disabled: activeSection >= SECTION_DEFS.length - 1, "aria-label": "Section berikutnya" },
                        React.createElement(Icon, { name: "right", className: "h-5 w-5" })))),
            React.createElement("div", { className: "mt-3 flex gap-2 overflow-x-auto pb-1", "aria-label": "Sub menu section" }, SECTION_DEFS.map((section, index) => React.createElement("button", { key: section.id, type: "button", className: cx('subnav-chip', activeSection === index && 'active'), onClick: () => goSection(index) },
                React.createElement(Icon, { name: section.icon, className: "h-4 w-4" }),
                " ",
                section.label)))),
        React.createElement("div", { key: ((_a = SECTION_DEFS[activeSection]) === null || _a === void 0 ? void 0 : _a.id) || activeSection }, screens[activeSection])));
}
function App() {
    const [screen, setScreen] = useState('dashboard');
    const [visit, setVisit] = useState(null);
    const [history, setHistory] = useState(() => readHistoryMeta());
    const [storageLabel, setStorageLabel] = useState('Menghitung storage...');
    const [activeSection, setActiveSection] = useState(0);
    const [newVisitOpen, setNewVisitOpen] = useState(false);
    const [pinOpen, setPinOpen] = useState(false);
    const [secretOpen, setSecretOpen] = useState(false);
    const [welcomeConfig, setWelcomeConfig] = useState(() => readWelcomeConfig());
    const [welcomeOpen, setWelcomeOpen] = useState(() => {
        try { return sessionStorage.getItem(WELCOME_SEEN_KEY) !== '1'; }
        catch (error) { return true; }
    });
    const secretTapRef = useRef({ count: 0, timer: null });
    function closeWelcome() {
        try { sessionStorage.setItem(WELCOME_SEEN_KEY, '1'); }
        catch (error) { }
        setWelcomeOpen(false);
    }
    function applyWelcomeConfig(nextConfig) {
        const saved = saveWelcomeConfig(nextConfig);
        setWelcomeConfig(saved);
    }
    async function updateStorageLabel() {
        var _a;
        const localBytes = calcLocalStorageBytes();
        let label = `LocalStorage ${formatBytes(localBytes)}`;
        if ((_a = navigator.storage) === null || _a === void 0 ? void 0 : _a.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                label += ` • Browser ${formatBytes(estimate.usage || 0)}`;
            }
            catch (error) { }
        }
        setStorageLabel(label);
    }
    function refreshHistory() {
        setHistory(readHistoryMeta());
        updateStorageLabel();
    }
    useEffect(() => {
        refreshHistory();
        if ('serviceWorker' in navigator && location.protocol !== 'file:') {
            navigator.serviceWorker.register('service-worker.js?v=revamp24').catch(() => { });
        }
    }, []);
    useEffect(() => {
        const touchState = { target: null, x: 0, y: 0, moved: false, startedAt: 0 };
        const textTargetSelector = 'input:not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]';
        const findTextTarget = (target) => { var _a, _b; return ((_b = (_a = target === null || target === void 0 ? void 0 : target.closest) === null || _a === void 0 ? void 0 : _a.call(target, textTargetSelector)) !== null && _b !== void 0 ? _b : null); };
        const movementLimit = () => { var _a, _b; return ((_b = (_a = window.matchMedia) === null || _a === void 0 ? void 0 : _a.call(window, '(pointer: coarse)')) === null || _b === void 0 ? void 0 : _b.matches) ? 16 : 11; };
        function canFocusOnTap(target) {
            var _a;
            if (!target || target.disabled || target.readOnly)
                return false;
            const tag = (target.tagName || '').toLowerCase();
            if (tag === 'select')
                return false;
            const type = String(((_a = target.getAttribute) === null || _a === void 0 ? void 0 : _a.call(target, 'type')) || '').toLowerCase();
            return target.isContentEditable || tag === 'textarea' || !type || ['text', 'search', 'email', 'tel', 'url', 'number', 'password', 'date', 'time', 'month'].includes(type);
        }
        function focusTapTarget(target) {
            if (!canFocusOnTap(target) || document.activeElement === target)
                return;
            window.setTimeout(() => {
                try {
                    target.focus({ preventScroll: true });
                }
                catch (error) {
                    try {
                        target.focus();
                    }
                    catch (innerError) { }
                }
            }, 0);
        }
        function handleTouchStart(event) {
            var _a;
            const target = findTextTarget(event.target);
            if (!target || !((_a = event.touches) === null || _a === void 0 ? void 0 : _a[0]))
                return;
            touchState.target = target;
            touchState.x = event.touches[0].clientX;
            touchState.y = event.touches[0].clientY;
            touchState.moved = false;
            touchState.startedAt = Date.now();
        }
        function handleTouchMove(event) {
            var _a;
            if (!touchState.target || !((_a = event.touches) === null || _a === void 0 ? void 0 : _a[0]))
                return;
            const dx = Math.abs(event.touches[0].clientX - touchState.x);
            const dy = Math.abs(event.touches[0].clientY - touchState.y);
            const limit = movementLimit();
            if (dy > limit || dx > limit + 6)
                touchState.moved = true;
        }
        function handleTouchEnd(event) {
            var _a;
            const target = touchState.target;
            const wasScroll = Boolean(target && touchState.moved);
            if (wasScroll) {
                if (event.cancelable)
                    event.preventDefault();
                event.stopPropagation();
                if (document.activeElement === target)
                    (_a = target.blur) === null || _a === void 0 ? void 0 : _a.call(target);
            }
            else if (target) {
                focusTapTarget(target);
            }
            touchState.target = null;
            touchState.moved = false;
            touchState.startedAt = 0;
        }
        function handleTouchCancel() {
            touchState.target = null;
            touchState.moved = false;
            touchState.startedAt = 0;
        }
        document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
        document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: true });
        document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
        document.addEventListener('touchcancel', handleTouchCancel, { capture: true, passive: true });
        return () => {
            document.removeEventListener('touchstart', handleTouchStart, true);
            document.removeEventListener('touchmove', handleTouchMove, true);
            document.removeEventListener('touchend', handleTouchEnd, true);
            document.removeEventListener('touchcancel', handleTouchCancel, true);
        };
    }, []);
    useEffect(() => {
        window.getFormData = () => visit || {};
    }, [visit]);
    useEffect(() => {
        if (!(visit === null || visit === void 0 ? void 0 : visit.id))
            return;
        const timer = setTimeout(async () => {
            const nextVisit = { ...visit, updatedAt: Date.now() };
            try {
                await putVisitRecord(nextVisit);
                localStorage.setItem(ACTIVE_VISIT_KEY, nextVisit.id);
                const nextMeta = saveHistoryMeta([historyMetaFromVisit(nextVisit), ...readHistoryMeta().filter((item) => item.id !== nextVisit.id)]);
                setHistory(nextMeta);
                updateStorageLabel();
                upsertMonitorVisit(nextVisit);
            }
            catch (error) {
                console.warn('Autosave gagal:', error);
            }
        }, 450);
        return () => clearTimeout(timer);
    }, [visit]);
    function updateVisit(patch) {
        setVisit((current) => current ? { ...current, ...patch, updatedAt: Date.now() } : current);
    }
    function goSection(index) {
        setActiveSection(Math.max(0, Math.min(SECTION_DEFS.length - 1, index)));
    }
    function handleTitleTap() {
        const ref = secretTapRef.current;
        ref.count += 1;
        if (ref.timer)
            clearTimeout(ref.timer);
        ref.timer = setTimeout(() => { ref.count = 0; }, 2500);
        if (ref.count >= 10) {
            ref.count = 0;
            setPinOpen(true);
        }
    }
    async function createNewVisit(bestieName, storeName) {
        const next = createVisit(bestieName, storeName);
        setVisit(next);
        setActiveSection(0);
        setScreen('audit');
        setNewVisitOpen(false);
        await putVisitRecord(next);
        const nextMeta = saveHistoryMeta([historyMetaFromVisit(next), ...readHistoryMeta()]);
        setHistory(nextMeta);
        localStorage.setItem(ACTIVE_VISIT_KEY, next.id);
        updateStorageLabel();
        upsertMonitorVisit(next);
    }
    async function openVisit(id) {
        try {
            const data = await getVisitRecord(id);
            if (!data) {
                alert('Data visit tidak ditemukan di storage perangkat ini.');
                return;
            }
            setVisit(data);
            setActiveSection(0);
            setScreen('audit');
            localStorage.setItem(ACTIVE_VISIT_KEY, id);
        }
        catch (error) {
            alert('Gagal membuka history visit.');
        }
    }
    async function deleteVisit(id) {
        const ok = confirm('Hapus history kunjungan ini?');
        if (!ok)
            return;
        await deleteVisitRecord(id);
        const nextMeta = saveHistoryMeta(readHistoryMeta().filter((item) => item.id !== id));
        setHistory(nextMeta);
        if ((visit === null || visit === void 0 ? void 0 : visit.id) === id) {
            setVisit(null);
            setScreen('dashboard');
            localStorage.removeItem(ACTIVE_VISIT_KEY);
        }
        updateStorageLabel();
    }
    async function clearAllHistory() {
        const ok = confirm('Hapus semua history kunjungan di perangkat ini?');
        if (!ok)
            return;
        await clearVisitRecords();
        saveHistoryMeta([]);
        localStorage.removeItem(ACTIVE_VISIT_KEY);
        setHistory([]);
        setVisit(null);
        setScreen('dashboard');
        updateStorageLabel();
    }
    function clearCurrentData() {
        if (!visit)
            return;
        const ok = confirm('Clear data pada kunjungan aktif? Nama bestie dan store tetap dipertahankan.');
        if (!ok)
            return;
        const reset = createVisit(visit.nama, visit.store);
        reset.id = visit.id;
        reset.createdAt = visit.createdAt || Date.now();
        reset.updatedAt = Date.now();
        setVisit(reset);
        setActiveSection(0);
        setScreen('audit');
    }
    let content;
    if (screen === 'dashboard') {
        content = React.createElement(DashboardPage, { history: history, storageLabel: storageLabel, onNewVisit: () => setNewVisitOpen(true), onOpenVisit: openVisit, onDeleteVisit: deleteVisit, onClearHistory: clearAllHistory, onTitleTap: handleTitleTap });
    }
    else if (screen === 'preview') {
        content = React.createElement(PreviewPage, { visit: visit, onBack: () => setScreen('audit') });
    }
    else {
        content = React.createElement(VisitWorkspace, { visit: visit, update: updateVisit, activeSection: activeSection, goSection: goSection, onPreview: () => setScreen('preview') });
    }
    return (React.createElement("div", { className: "audit-shell min-h-screen md:grid md:grid-cols-[300px_minmax(0,1fr)]" },
        React.createElement(DesktopSidebar, { screen: screen, setScreen: setScreen, visit: visit, activeSection: activeSection, goSection: goSection, onNewVisit: () => setNewVisitOpen(true), onClearData: clearCurrentData, onTitleTap: handleTitleTap }),
        React.createElement("div", { className: "flex min-h-screen min-w-0 flex-col" },
            React.createElement(MobileTopBar, { screen: screen, setScreen: setScreen, visit: visit, activeSection: activeSection, goSection: goSection, onNewVisit: () => setNewVisitOpen(true), onTitleTap: handleTitleTap }),
            React.createElement("div", { className: "min-w-0 flex-1" }, content),
            React.createElement(MobileBottomNav, { screen: screen, setScreen: setScreen, visit: visit, onNewVisit: () => setNewVisitOpen(true), onClearData: clearCurrentData })),
        welcomeOpen ? React.createElement(WelcomeOverlay, { config: welcomeConfig, onDone: closeWelcome }) : null,
        React.createElement(NewVisitModal, { open: newVisitOpen, onClose: () => setNewVisitOpen(false), onCreate: createNewVisit }),
        React.createElement(SecretPinModal, { open: pinOpen, onClose: () => setPinOpen(false), onUnlock: () => { setPinOpen(false); setSecretOpen(true); } }),
        React.createElement(SecretMonitorPanel, { open: secretOpen, onClose: () => setSecretOpen(false), history: history, welcomeConfig: welcomeConfig, onWelcomeConfigChange: applyWelcomeConfig })));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App, null));
