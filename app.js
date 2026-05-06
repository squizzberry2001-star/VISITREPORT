const { useEffect, useMemo, useRef, useState } = React;
// =============================================================
// Data helpers
// =============================================================
const BESTIE_ASSIGNMENTS = Array.isArray(window.BESTIE_STORE_DATA) ? window.BESTIE_STORE_DATA : [];
const MASTER_STORES = Array.isArray(window.DEFAULT_STORE_MASTER_DATA) ? window.DEFAULT_STORE_MASTER_DATA : [];
const JOB_LEVELS = ['', '1A', 'NS3', 'NS1', 'MG3', 'MG1'];
const HISTORY_META_KEY = 'rbv_react_history_meta_v3';
const ACTIVE_VISIT_KEY = 'rbv_react_active_visit_v3';
const SESSION_SCREEN_KEY = 'rbv_session_screen_v99';
const MANUAL_STORE_REQUEST_KEY = 'rbv_manual_store_requests_v6';
const MANUAL_STORE_APPROVED_KEY = 'rbv_manual_store_approved_v6';
const REPORT_DB_NAME = 'regional_bestie_visit_react_db';
const REPORT_DB_STORE = 'visits';
const WELCOME_CONFIG_KEY = 'rbv_welcome_config_v1';
const WELCOME_SEEN_KEY = 'rbv_welcome_seen_v1';
const DEFAULT_WELCOME_CONFIG = {
    title: 'Hallo! Bestie',
    subtitle: '“Sudahkah kalian bahagia hari ini?, Semangat ya kerjanya”',
    durationSeconds: 5
};
const UPDATE_NOTICE_CONFIG_KEY = 'rbv_update_notice_config_v1';
const APP_CONFIG_KEYS = {
    welcome: 'welcome_animation',
    updateNotice: 'home_update_notice',
    emailTemplate: 'email_report_template'
};
const DEFAULT_UPDATE_NOTICE_CONFIG = {
    enabled: true,
    title: 'Info Update Website',
    messages: [
        'Konten informasi update dapat diatur dari panel rahasia.',
        'Gunakan area ini untuk mengumumkan perubahan fitur, maintenance, atau instruksi terbaru.'
    ],
    intervalSeconds: 4
};
const EMAIL_TEMPLATE_ADMIN_KEY = 'rbv_email_template_admin_v99';
const DEFAULT_EMAIL_SUBJECT_TEMPLATE = 'Visit Report - {store} - {date}';
const DEFAULT_EMAIL_BODY_TEMPLATE = 'Dear Team,\n\nBerikut kami lampirkan Visit Report untuk store {store} pada tanggal kunjungan {date}.\n\nAttachment:\n1. PDF Visit Report\n2. Excel CA Assignment\n\nTerima kasih.\n\nBest Regards,\n{bestie}';
const ASSIGNMENT_CONFIG_KEY = 'rbv_assignment_link_config_v1';
const DEFAULT_ASSIGNMENT_LINK = 'https://tinyurl.com/store-caassignment';
const PDF_SETTINGS_KEY = 'rbv_pdf_settings_v2';
const PRESENCE_LOCAL_KEY = 'rbv_presence_rows_v1';
const PRESENCE_STALE_MS = 70000;
const DEFAULT_PDF_SETTINGS = {
    tableFontSize: 9.4,
    tableTitleFontSize: 9.8,
    evidenceFontSize: 8.9,
    tableExtraRows: 0,
    photoGridPerPage: 6
};
function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number))
        return fallback;
    return Math.min(max, Math.max(min, number));
}
function normalizePdfPhotoGridPerPage(value, fallback = DEFAULT_PDF_SETTINGS.photoGridPerPage) {
    const allowed = [4, 6, 8];
    const number = Number(value);
    if (!Number.isFinite(number))
        return fallback;
    return allowed.reduce((closest, item) => Math.abs(item - number) < Math.abs(closest - number) ? item : closest, allowed.includes(fallback) ? fallback : 6);
}
function normalizePdfSettings(value) {
    const raw = value && typeof value === 'object' ? value : {};
    return {
        tableFontSize: clampNumber(raw.tableFontSize, 8, 13, DEFAULT_PDF_SETTINGS.tableFontSize),
        tableTitleFontSize: clampNumber(raw.tableTitleFontSize, 8, 14, DEFAULT_PDF_SETTINGS.tableTitleFontSize),
        evidenceFontSize: clampNumber(raw.evidenceFontSize, 8, 12, DEFAULT_PDF_SETTINGS.evidenceFontSize),
        tableExtraRows: Math.round(clampNumber(raw.tableExtraRows, 0, 4, DEFAULT_PDF_SETTINGS.tableExtraRows)),
        photoGridPerPage: normalizePdfPhotoGridPerPage(raw.photoGridPerPage)
    };
}
function readPdfSettings() {
    try {
        return normalizePdfSettings(JSON.parse(localStorage.getItem(PDF_SETTINGS_KEY) || '{}'));
    }
    catch (error) {
        return { ...DEFAULT_PDF_SETTINGS };
    }
}
function savePdfSettings(settings) {
    const next = normalizePdfSettings(settings);
    localStorage.setItem(PDF_SETTINGS_KEY, JSON.stringify(next));
    return next;
}
const SESSION_ID = `react_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const APP_BUILD_VERSION = 'revamp102-cloudflare-frontend-status-fix';
const APP_VERSION_KEY = 'rbv_app_version_v1';
const APP_RELOAD_LOCK_KEY = 'rbv_auto_reload_lock_v1';
const VERSION_ENDPOINT = 'version.json';
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
function normalizeWelcomeDurationSeconds(value, fallback = DEFAULT_WELCOME_CONFIG.durationSeconds) {
    const number = Number(value);
    if (!Number.isFinite(number))
        return fallback;
    return Math.min(15, Math.max(1, number));
}
function readWelcomeConfig() {
    try {
        const parsed = JSON.parse(localStorage.getItem(WELCOME_CONFIG_KEY) || '{}');
        return {
            title: cleanText(parsed.title, DEFAULT_WELCOME_CONFIG.title),
            subtitle: cleanText(parsed.subtitle, DEFAULT_WELCOME_CONFIG.subtitle),
            durationSeconds: normalizeWelcomeDurationSeconds(parsed.durationSeconds)
        };
    }
    catch (error) {
        return { ...DEFAULT_WELCOME_CONFIG };
    }
}
function saveWelcomeConfig(config) {
    const next = {
        title: cleanText(config && config.title, DEFAULT_WELCOME_CONFIG.title),
        subtitle: cleanText(config && config.subtitle, DEFAULT_WELCOME_CONFIG.subtitle),
        durationSeconds: normalizeWelcomeDurationSeconds(config && config.durationSeconds)
    };
    localStorage.setItem(WELCOME_CONFIG_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('rbv-welcome-config-change', { detail: next }));
    return next;
}
function normalizeUpdateNoticeIntervalSeconds(value, fallback = DEFAULT_UPDATE_NOTICE_CONFIG.intervalSeconds) {
    const number = Number(value);
    if (!Number.isFinite(number))
        return fallback;
    return Math.min(15, Math.max(2, number));
}
function normalizeUpdateNoticeMessages(value) {
    const source = Array.isArray(value) ? value : String(value || '').split(/\n+/);
    const messages = source.map((item) => cleanText(item)).filter(Boolean).slice(0, 12);
    return messages.length ? messages : DEFAULT_UPDATE_NOTICE_CONFIG.messages.slice();
}
function normalizeUpdateNoticeConfig(value) {
    const raw = value && typeof value === 'object' ? value : {};
    return {
        enabled: raw.enabled !== false,
        title: cleanText(raw.title, DEFAULT_UPDATE_NOTICE_CONFIG.title),
        messages: normalizeUpdateNoticeMessages(raw.messages),
        intervalSeconds: normalizeUpdateNoticeIntervalSeconds(raw.intervalSeconds)
    };
}
function readUpdateNoticeConfig() {
    try {
        return normalizeUpdateNoticeConfig(JSON.parse(localStorage.getItem(UPDATE_NOTICE_CONFIG_KEY) || '{}'));
    }
    catch (error) {
        return { ...DEFAULT_UPDATE_NOTICE_CONFIG, messages: DEFAULT_UPDATE_NOTICE_CONFIG.messages.slice() };
    }
}
function saveUpdateNoticeConfig(config) {
    const next = normalizeUpdateNoticeConfig(config);
    localStorage.setItem(UPDATE_NOTICE_CONFIG_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('rbv-update-notice-change', { detail: next }));
    return next;
}

function normalizeEmailTemplateConfig(value) {
    const raw = value && typeof value === 'object' ? value : {};
    return {
        subjectTemplate: cleanText(raw.subjectTemplate || raw.defaultSubjectTemplate, DEFAULT_EMAIL_SUBJECT_TEMPLATE),
        bodyTemplate: cleanText(raw.bodyTemplate || raw.defaultBodyTemplate, DEFAULT_EMAIL_BODY_TEMPLATE)
    };
}
function readEmailTemplateConfig() {
    try {
        return normalizeEmailTemplateConfig(JSON.parse(localStorage.getItem(EMAIL_TEMPLATE_ADMIN_KEY) || '{}'));
    }
    catch (error) {
        return normalizeEmailTemplateConfig({});
    }
}
function saveEmailTemplateConfig(config) {
    const next = normalizeEmailTemplateConfig(config);
    localStorage.setItem(EMAIL_TEMPLATE_ADMIN_KEY, JSON.stringify({ ...next, updatedAt: Date.now() }));
    window.dispatchEvent(new CustomEvent('rbv-email-template-change', { detail: next }));
    return next;
}
function readAssignmentLinkConfig() {
    try {
        const parsed = JSON.parse(localStorage.getItem(ASSIGNMENT_CONFIG_KEY) || '{}');
        return cleanText(parsed.link, DEFAULT_ASSIGNMENT_LINK);
    }
    catch (error) {
        return DEFAULT_ASSIGNMENT_LINK;
    }
}
function saveAssignmentLinkConfig(link) {
    const next = cleanText(link, DEFAULT_ASSIGNMENT_LINK);
    localStorage.setItem(ASSIGNMENT_CONFIG_KEY, JSON.stringify({ link: next, updatedAt: Date.now() }));
    window.dispatchEvent(new CustomEvent('rbv-assignment-link-change', { detail: { link: next } }));
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
    return cleanText(item?.storeName || item?.assignmentStoreName || item?.siteDescr || item?.store);
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
    const master = findMasterStore(storeName || assignment?.storeName || assignment?.assignmentStoreName || approvedManual?.siteDescr || approvedManual?.storeName);
    const merged = {
        ...(assignment || {}),
        ...(master || {}),
        ...(approvedManual || {})
    };
    if (!merged.siteDescr)
        merged.siteDescr = approvedManual?.storeName || assignment?.storeName || assignment?.assignmentStoreName || storeName || '';
    if (!merged.address)
        merged.address = assignment?.storeAddress || '';
    if (!merged.siteCode && assignment?.storeCode)
        merged.siteCode = assignment.storeCode;
    if (!merged.siteCode4 && assignment?.storeCode)
        merged.siteCode4 = assignment.storeCode;
    if (!merged.storeHead && assignment?.storeHead)
        merged.storeHead = assignment.storeHead;
    if (!merged.areaManager && assignment?.areaManager)
        merged.areaManager = assignment.areaManager;
    if (!merged.regionalManager && assignment?.regionalManager)
        merged.regionalManager = assignment.regionalManager;
    if (!merged.city && assignment?.city)
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
    const legacy = visit?.qscResultPhoto ? [visit.qscResultPhoto] : [];
    const source = Array.isArray(visit?.qscResultPhotos) && visit.qscResultPhotos.length ? visit.qscResultPhotos : legacy;
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
        storeAssignmentLink: readAssignmentLinkConfig(),
        showQSCResult: true,
        showOPITable: false,
        showQSCTable: false,
        showFindingEvidence: false,
        showCorrectiveAction: false,
        activeObservationTab: 'opi',
        activeEvidenceTab: 'finding'
    };
}
function isMeaningfulObservation(row) {
    return ['temuan', 'kondisiIdeal', 'dampak', 'penyebab', 'tindakan', 'deadline', 'hasil'].some((key) => cleanText(row?.[key]));
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
    const detail = getStoreWebDetail(visit?.store);
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
        request.onsuccess = () => resolve(request.result?.data || null);
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
async function getAllVisitRecordsForBackup() {
    try {
        const db = await openDb();
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(REPORT_DB_STORE, 'readonly');
            const request = tx.objectStore(REPORT_DB_STORE).getAll();
            request.onsuccess = () => resolve((request.result || []).map((item) => item?.data || item).filter(Boolean));
            request.onerror = () => reject(request.error);
        });
    }
    catch (error) {
        console.warn('Gagal membaca data backup IndexedDB:', error);
        return [];
    }
}
function readBackupFileText(file) {
    if (file && typeof file.text === 'function')
        return file.text();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}
async function backupVisitReportData() {
    const localData = {};
    for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index) || '';
        if (key.indexOf('rbv_') === 0)
            localData[key] = localStorage.getItem(key);
    }
    const visits = await getAllVisitRecordsForBackup();
    const payload = {
        app: 'regional-bestie-visit-report',
        type: 'device-transfer-backup',
        version: 1,
        exportedAt: new Date().toISOString(),
        localStorage: localData,
        visits
    };
    const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    downloadBlob(blob, `bestie-visit-backup-${stamp}.json`);
    return payload;
}
async function restoreVisitReportDataFromFile(file) {
    const raw = await readBackupFileText(file);
    const payload = JSON.parse(raw);
    if (!payload || payload.app !== 'regional-bestie-visit-report') {
        throw new Error('File backup tidak sesuai aplikasi ini.');
    }
    const visits = Array.isArray(payload.visits) ? payload.visits.filter((item) => item && item.id) : [];
    const currentVisits = await getAllVisitRecordsForBackup();
    const ok = confirmAction(`Restore data backup ini? Data backup akan digabung dengan history di perangkat ini, bukan mengganti/menghapus data lama.

History perangkat ini: ${currentVisits.length}
Jumlah visit backup: ${visits.length}`);
    if (!ok)
        return false;
    const mergedVisits = uniqueBy([...visits, ...currentVisits].filter((item) => item && item.id), (item) => item.id)
        .map((visit) => ({ ...visit, updatedAt: visit.updatedAt || Date.now() }));
    for (const visit of mergedVisits) {
        await putVisitRecord(visit);
    }
    if (payload.localStorage && typeof payload.localStorage === 'object') {
        Object.entries(payload.localStorage).forEach(([key, value]) => {
            if (key.indexOf('rbv_') !== 0)
                return;
            if ([HISTORY_META_KEY, ACTIVE_VISIT_KEY].includes(key))
                return;
            if (key === PRESENCE_LOCAL_KEY)
                return;
            localStorage.setItem(key, String(value ?? ''));
        });
    }
    const backupMeta = (() => {
        try {
            const parsed = JSON.parse(String(payload.localStorage?.[HISTORY_META_KEY] || '[]'));
            return Array.isArray(parsed) ? parsed : [];
        }
        catch (error) {
            return [];
        }
    })();
    const currentMeta = readHistoryMeta();
    const visitMeta = mergedVisits.map(historyMetaFromVisit);
    saveHistoryMeta([...backupMeta, ...currentMeta, ...visitMeta]);
    if (!localStorage.getItem(ACTIVE_VISIT_KEY) && (visits[0]?.id || currentVisits[0]?.id))
        localStorage.setItem(ACTIVE_VISIT_KEY, visits[0]?.id || currentVisits[0]?.id);
    alert('Restore data selesai dan history lama tetap aman. Aplikasi akan dimuat ulang.');
    window.location.reload();
    return true;
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
        history: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M3 12a9 9 0 1 0 3-6.7" }),
            React.createElement("path", { d: "M3 4v5h5" }),
            React.createElement("path", { d: "M12 7v5l3 2" })),
        upload: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M12 21V9" }),
            React.createElement("path", { d: "m7 14 5-5 5 5" }),
            React.createElement("path", { d: "M5 3h14" })),
        send: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M22 2 11 13" }),
            React.createElement("path", { d: "m22 2-7 20-4-9-9-4 20-7Z" })),
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
        qr: React.createElement(React.Fragment, null,
            React.createElement("rect", { x: "4", y: "4", width: "6", height: "6", rx: "1" }),
            React.createElement("rect", { x: "14", y: "4", width: "6", height: "6", rx: "1" }),
            React.createElement("rect", { x: "4", y: "14", width: "6", height: "6", rx: "1" }),
            React.createElement("path", { d: "M14 14h2v2h-2z" }),
            React.createElement("path", { d: "M18 14h2v6h-6v-2h4z" })),
        check: React.createElement("path", { d: "m5 13 4 4L19 7" }),
        settings: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M4 7h10" }),
            React.createElement("path", { d: "M18 7h2" }),
            React.createElement("circle", { cx: "16", cy: "7", r: "2" }),
            React.createElement("path", { d: "M4 17h2" }),
            React.createElement("path", { d: "M10 17h10" }),
            React.createElement("circle", { cx: "8", cy: "17", r: "2" }))
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
    return (React.createElement("button", { type: "button", className: cx(styles[variant] || styles.primary, className), ...props },
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
    return (React.createElement("textarea", { ref: ref, className: cx('form-control auto-grow-textarea', className), value: value || '', rows: minRows, onChange: (event) => { onChange?.(event); window.requestAnimationFrame(resize); }, onInput: resize, ...props }));
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
            const input = wrapRef.current?.querySelector('input');
            input?.blur();
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
const PDF_PHOTO_CROP_RATIO = { key: 'pdf', label: 'PDF', w: 16, h: 9 };
const QSC_PHOTO_CROP_RATIO = { key: 'qsc', label: 'QSC', w: 4, h: 3 };
const PHOTO_EDITOR_RATIOS = [PDF_PHOTO_CROP_RATIO, QSC_PHOTO_CROP_RATIO];
function ratioToAspectString(ratio) {
    return ratio && ratio.w && ratio.h ? `${ratio.w} / ${ratio.h}` : '';
}
const MARKER_SIZE_OPTIONS = [
    { key: 'small', label: 'Kecil', scale: 0.034 },
    { key: 'medium', label: 'Sedang', scale: 0.045 },
    { key: 'large', label: 'Besar', scale: 0.064 }
];
function getEditorCanvasSize(imageElement, ratio = PHOTO_EDITOR_RATIOS[0]) {
    const sourceWidth = Math.max(1, imageElement?.naturalWidth || imageElement?.width || 1080);
    const sourceHeight = Math.max(1, imageElement?.naturalHeight || imageElement?.height || 1080);
    const maxSide = 1400;
    if (ratio?.w && ratio?.h) {
        const targetRatio = ratio.w / ratio.h;
        let width = maxSide;
        let height = Math.round(width / targetRatio);
        if (height > maxSide) {
            height = maxSide;
            width = Math.round(height * targetRatio);
        }
        return { width: Math.max(360, width), height: Math.max(360, height) };
    }
    const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
    return {
        width: Math.max(360, Math.round(sourceWidth * scale)),
        height: Math.max(360, Math.round(sourceHeight * scale))
    };
}
function getMarkerRadius(canvas, markerSize) {
    const selected = MARKER_SIZE_OPTIONS.find((item) => item.key === markerSize) || MARKER_SIZE_OPTIONS[1];
    const minSide = Math.min(canvas?.width || 1080, canvas?.height || 1080);
    return Math.max(24, Math.round(minSide * selected.scale));
}
function PhotoEditorModal({ open, image, onClose, onSave, title = 'Edit Foto', cropRatio = PDF_PHOTO_CROP_RATIO }) {
    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const dragRef = useRef(null);
    const pinchRef = useRef(null);
    const rafRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [markers, setMarkers] = useState([]);
    const [mode, setMode] = useState('move');
    const activeCropRatio = cropRatio && cropRatio.w && cropRatio.h ? cropRatio : PDF_PHOTO_CROP_RATIO;
    const [selectedRatio, setSelectedRatio] = useState(activeCropRatio);
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
            const panel = event.target?.closest?.('.photo-editor-v10-panel');
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
        setSelectedRatio(activeCropRatio);
        setMarkerSize('medium');
        pinchRef.current = null;
        dragRef.current = null;
        loadImageElement(image).then((loaded) => {
            if (cancelled)
                return;
            imgRef.current = loaded;
            setCanvasSize(getEditorCanvasSize(loaded, activeCropRatio));
            setImageReady(true);
            window.requestAnimationFrame(() => drawEditorCanvas(undefined, { showGuide: true }));
        }).catch(() => {
            if (!cancelled)
                setImageReady(false);
        });
        return () => { cancelled = true; };
    }, [open, image, activeCropRatio.key]);
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
        if (dragRef.current?.pointerId === event?.pointerId)
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
            React.createElement("div", { className: "photo-editor-options", "aria-label": "Pengaturan marker" },
                React.createElement("div", { className: "rounded-2xl bg-emerald-50 px-3 py-2 text-[11px] font-bold leading-4 text-emerald-900 ring-1 ring-emerald-100" }, "Crop otomatis mengikuti frame foto PDF."),
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
    return ReactDOM?.createPortal ? ReactDOM.createPortal(modal, document.body) : modal;
}
function PhotoInput({ value, onChange, label = 'Foto', compact = false, rich = false, required = false, matchCropFrame = false, cropRatio = PDF_PHOTO_CROP_RATIO, hideDescription = false }) {
    const cameraRef = useRef(null);
    const galleryRef = useRef(null);
    const [editorOpen, setEditorOpen] = useState(false);
    async function handleFiles(event) {
        const file = event.target.files && event.target.files[0];
        if (!file)
            return;
        try {
            const dataUrl = await fileToDataUrl(file);
            onChange({ ...(value || blankPhoto()), image: dataUrl, cropAspect: matchCropFrame ? ratioToAspectString(cropRatio) : '' });
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
    const description = value?.description || '';
    const photoAspect = matchCropFrame ? (value?.cropAspect ? String(value.cropAspect) : ratioToAspectString(cropRatio)) : '';
    const cardStyle = photoAspect ? { '--photo-aspect': photoAspect } : undefined;
    return (React.createElement("div", { className: cx('photo-input-card surface-card overflow-hidden rounded-[26px]', matchCropFrame && 'match-crop-frame'), style: cardStyle },
        React.createElement("div", { className: "flex items-center justify-between border-b border-slate-200 px-4 py-3" },
            React.createElement("div", { className: "min-w-0" },
                React.createElement("p", { className: "truncate text-sm font-extrabold text-slate-900" },
                    label,
                    required ? React.createElement("span", { className: "ml-1 text-rose-600" }, "*") : null)),
            React.createElement("div", { className: "flex shrink-0 gap-2" },
                value?.image ? React.createElement(Button, { variant: "icon", onClick: () => setEditorOpen(true), "aria-label": "Edit crop dan marker" },
                    React.createElement(Icon, { name: "crop", className: "h-4 w-4" })) : null,
                value?.image ? React.createElement(Button, { variant: "icon", onClick: clearPhoto, "aria-label": "Hapus foto" },
                    React.createElement(Icon, { name: "trash", className: "h-4 w-4" })) : null)),
        React.createElement("div", { className: cx('photo-frame relative grid place-items-center overflow-hidden', value?.image ? 'has-image' : '', compact ? 'min-h-[150px]' : 'min-h-[210px]') }, value?.image ? React.createElement("img", { src: value.image, alt: label }) : React.createElement("div", { className: "flex flex-col items-center px-5 text-center text-slate-500" },
            React.createElement("div", { className: "mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white text-audit-primary shadow-sm" },
                React.createElement(Icon, { name: "image", className: "h-7 w-7" })),
            React.createElement("p", { className: "text-sm font-bold text-slate-700" }, "Upload foto"))),
        React.createElement("div", { className: "photo-actions flex items-center justify-center gap-2 border-t border-slate-200 p-3" },
            React.createElement("input", { ref: cameraRef, type: "file", accept: "image/*", capture: "environment", className: "hidden", onChange: handleFiles }),
            React.createElement("input", { ref: galleryRef, type: "file", accept: "image/*", className: "hidden", onChange: handleFiles }),
            React.createElement(Button, { variant: "icon", icon: "camera", onClick: () => cameraRef.current?.click(), "aria-label": "Ambil foto dari kamera" }),
            React.createElement(Button, { variant: "icon", icon: "gallery", onClick: () => galleryRef.current?.click(), "aria-label": "Pilih foto dari galeri" })),
        !hideDescription ? React.createElement("div", { className: "border-t border-slate-200 p-3" }, rich ? React.createElement(RichTextInput, { value: description, onChange: (nextDescription) => onChange({ ...(value || blankPhoto()), description: nextDescription }), placeholder: "Deskripsi foto...", minHeight: 92 }) : React.createElement(TextArea, { value: description, onChange: (event) => onChange({ ...(value || blankPhoto()), description: event.target.value }), placeholder: "Deskripsi foto...", minRows: 2 })) : null,
        React.createElement(PhotoEditorModal, { open: editorOpen, image: value?.image || '', title: label, cropRatio: cropRatio, onClose: () => setEditorOpen(false), onSave: (editedImage, meta) => onChange({ ...(value || blankPhoto()), image: editedImage, cropAspect: meta?.aspectRatio || value?.cropAspect || ratioToAspectString(cropRatio) || '' }) })));
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
    const crewList = visit.crewList?.length ? visit.crewList : [{ name: '', level: '' }];
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
    const safeRows = rows?.length ? rows : [blankObservationRow()];
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
    const navButtonBase = {
        width: '34px',
        height: '34px',
        borderRadius: '999px',
        display: 'inline-grid',
        placeItems: 'center',
        border: '1px solid rgba(226, 232, 240, 0.95)',
        background: '#ffffff',
        color: '#0f172a',
        boxShadow: '0 6px 14px rgba(15, 23, 42, 0.08)'
    };
    const mobileNavContent = (React.createElement("div", { className: "observation-inline-nav observation-nav-v68 md:hidden", "aria-label": "Navigasi temuan observation", style: {
            position: 'fixed',
            left: '0',
            right: '0',
            bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
            zIndex: 86,
            marginTop: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            borderRadius: '18px 18px 0 0',
            padding: '7px 14px',
            background: 'rgba(255,255,255,0.78)',
            border: '1px solid rgba(226, 232, 240, 0.92)',
            boxShadow: '0 10px 24px rgba(15, 23, 42, 0.10)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
        } },
        React.createElement("button", { type: "button", onClick: goPrev, disabled: activeIndex <= 0, "aria-label": "Temuan sebelumnya", style: { ...navButtonBase, opacity: activeIndex <= 0 ? 0.45 : 1 } },
            React.createElement(Icon, { name: "left", className: "h-4 w-4" })),
        React.createElement("div", { className: "observation-nav-center-v68", "aria-live": "polite" },
            React.createElement("span", { className: "observation-count-badge-v68" },
                "Temuan ",
                activeRowNumber,
                "/",
                safeRows.length),
            React.createElement("button", { type: "button", onClick: addRow, "aria-label": "Tambah temuan", className: "observation-add-center-v68" },
                React.createElement(Icon, { name: "plus", className: "h-5 w-5" })),
            React.createElement("span", { className: "observation-count-spacer-v68", "aria-hidden": "true" })),
        React.createElement("button", { type: "button", onClick: goNext, disabled: activeIndex >= safeRows.length - 1, "aria-label": "Temuan berikutnya", style: { ...navButtonBase, opacity: activeIndex >= safeRows.length - 1 ? 0.45 : 1 } },
            React.createElement(Icon, { name: "right", className: "h-4 w-4" }))));
    const mobileNav = (typeof document !== 'undefined' && ReactDOM?.createPortal)
        ? ReactDOM.createPortal(mobileNavContent, document.body)
        : mobileNavContent;
    return (React.createElement("div", { className: "observation-card-system grid gap-4" },
        mobileNav,
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
            React.createElement(Button, { variant: "secondary", icon: "plus", onClick: addRow }, "Tambah Row"))));
}
function PhotoGrid({ photos, onChange, prefix }) {
    const minSlots = 8;
    const sourcePhotos = Array.isArray(photos) ? photos : [];
    const safePhotos = Array.from({ length: Math.max(minSlots, sourcePhotos.length || minSlots) }, (_, index) => sourcePhotos[index] || blankPhoto());
    const blankSet = () => Array.from({ length: minSlots }, () => blankPhoto());
    const updatePhoto = (index, value) => onChange(safePhotos.map((photo, photoIndex) => photoIndex === index ? value : photo));
    const addFour = () => onChange([...safePhotos, blankPhoto(), blankPhoto(), blankPhoto(), blankPhoto()]);
    const removeEmpty = () => {
        if (!confirmAction('Rapihkan dan hapus slot foto kosong?'))
            return;
        const meaningful = safePhotos.filter((photo) => photo.image || cleanText(photo.description));
        const next = meaningful.length ? meaningful : blankSet();
        onChange(Array.from({ length: Math.max(minSlots, next.length) }, (_, index) => next[index] || blankPhoto()));
    };
    const renderActions = (position = 'top') => (React.createElement("div", { className: cx('photo-grid-actions flex flex-wrap gap-2', position === 'top'
            ? 'items-center justify-end rounded-2xl border border-slate-200 bg-slate-50/80 p-2'
            : 'justify-end pb-20 md:pb-0') },
        React.createElement(Button, { variant: "secondary", className: "min-w-[150px] flex-1 justify-center sm:flex-none", icon: "eraser", onClick: removeEmpty }, "Rapihkan Slot Foto"),
        React.createElement(Button, { variant: "secondary", className: "min-w-[150px] flex-1 justify-center sm:flex-none", icon: "plus", onClick: addFour }, "Tambah Slot Foto")));
    return (React.createElement("div", { className: "photo-grid-system grid gap-4" },
        renderActions('top'),
        React.createElement("div", { className: "evidence-photo-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-4" }, safePhotos.map((photo, index) => (React.createElement(PhotoInput, { key: index, label: prefix + ' ' + (index + 1), value: photo, onChange: (value) => updatePhoto(index, value), compact: true, rich: true, matchCropFrame: true, cropRatio: PDF_PHOTO_CROP_RATIO })))),
        renderActions('bottom')));
}
const SECTION_DEFS = [
    { id: 'setup', label: 'Visit', title: 'Visit Setup', icon: 'store', hint: 'Bestie & store' },
    { id: 'crew', label: 'Crew', title: 'General Information', icon: 'calendar', hint: 'Tanggal & PIC' },
    { id: 'qsc-result', label: 'QSC', title: 'QSC / FAMITRACK Result', icon: 'camera', hint: 'Foto result' },
    { id: 'observation', label: 'Obs', title: 'Observation', icon: 'clipboard', hint: 'OPI & QSC' },
    { id: 'evidence', label: 'Evidence', title: 'Evidence', icon: 'image', hint: 'Foto temuan' }
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
    const detailValue = (key, fallback = '') => manualDetail[key] ?? fallback ?? '';
    function handleBestieChange(value) {
        const stores = getStoresForBestie(value);
        update({ nama: value, store: stores[0]?.label || '', manualStoreDetail: {} });
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
    useEffect(() => {
        if (visit && visit.showQSCResult !== true)
            update({ showQSCResult: true });
    }, [visit?.id, visit?.showQSCResult]);
    const missing = normalizeQscPhotos(visit).filter((photo) => !photo.image).length;
    return (React.createElement(SectionShell, { title: "QSC / FAMITRACK Result" },
        missing ? React.createElement("div", { className: "mb-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-900" },
            "Kurang ",
            missing,
            " foto wajib.") : null,
        React.createElement("div", { className: "qsc-result-photo-grid grid gap-4" }, normalizeQscPhotos(visit).map((photo, index) => React.createElement(PhotoInput, { key: index, value: photo, matchCropFrame: true, cropRatio: QSC_PHOTO_CROP_RATIO, hideDescription: true, onChange: (value) => { const qscResultPhotos = normalizeQscPhotos(visit).map((item, itemIndex) => itemIndex === index ? value : item); update({ qscResultPhotos, qscResultPhoto: qscResultPhotos[0], showQSCResult: true }); }, label: 'Foto QSC / FAMITRACK ' + (index + 1), required: true })))));
}
function ObservationSection({ visit, update }) {
    const tab = visit.activeObservationTab === 'qsc' ? 'qsc' : 'opi';
    const setTab = (nextTab) => update({ activeObservationTab: nextTab });
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
    const tab = visit.activeEvidenceTab === 'corrective' ? 'corrective' : 'finding';
    const setTab = (nextTab) => update({ activeEvidenceTab: nextTab });
    const enabled = tab === 'finding' ? visit.showFindingEvidence === true : visit.showCorrectiveAction === true;
    const setEnabled = (value) => tab === 'finding' ? update({ showFindingEvidence: value }) : update({ showCorrectiveAction: value });
    const toggleLabel = tab === 'finding' ? (enabled ? 'Hide Finding' : 'Unhide Finding') : (enabled ? 'Hide Corrective' : 'Unhide Corrective');
    const evidenceTabStyle = { minWidth: 0, width: '100%', justifyContent: 'center', paddingLeft: '8px', paddingRight: '8px', whiteSpace: 'nowrap' };
    const preTitle = React.createElement("div", { className: "section-switcher flex flex-col gap-3 md:flex-row md:items-center md:justify-between" },
        React.createElement("div", { className: "grid w-full min-w-0 grid-cols-2 gap-2 md:max-w-[460px]" },
            React.createElement("button", { type: "button", className: cx('subnav-chip prominent', tab === 'finding' && 'active'), style: evidenceTabStyle, onClick: () => setTab('finding') },
                React.createElement(Icon, { name: "image", className: "h-4 w-4 shrink-0" }),
                React.createElement("span", { className: "min-w-0 truncate" }, "Finding Evidence")),
            React.createElement("button", { type: "button", className: cx('subnav-chip prominent', tab === 'corrective' && 'active'), style: evidenceTabStyle, onClick: () => setTab('corrective') },
                React.createElement(Icon, { name: "image", className: "h-4 w-4 shrink-0" }),
                React.createElement("span", { className: "min-w-0 truncate" }, "Corrective Action"))),
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
            onPromptUsed?.();
            onClose();
        }
        catch (error) {
            onPromptUsed?.();
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
function getLinkedDeviceId() {
    const key = 'rbv_linked_device_id';
    let id = localStorage.getItem(key);
    if (!id) {
        id = 'device-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(key, id);
    }
    return id;
}
function buildLinkedDevicePayload() {
    const deviceId = getLinkedDeviceId();
    const url = new URL(window.location.href);
    url.searchParams.set('linkedDevice', '1');
    url.hash = 'bestie-linked-device=' + encodeURIComponent(deviceId);
    return JSON.stringify({
        app: 'regional-bestie-visit-report',
        type: 'linked-device',
        deviceId,
        url: url.toString(),
        createdAt: new Date().toISOString()
    });
}
function parseLinkedDevicePayload(raw) {
    const text = String(raw || '').trim();
    if (!text)
        return null;
    try {
        const parsed = JSON.parse(text);
        if (parsed?.app === 'regional-bestie-visit-report' && parsed?.type === 'linked-device' && parsed?.deviceId)
            return parsed;
    }
    catch (error) {
        // QR dari kamera bisa berupa URL, bukan JSON.
    }
    try {
        const url = new URL(text);
        const hash = decodeURIComponent(url.hash || '');
        const match = hash.match(/bestie-linked-device=([^&]+)/);
        if (match?.[1]) {
            return {
                app: 'regional-bestie-visit-report',
                type: 'linked-device',
                deviceId: match[1],
                url: url.toString(),
                createdAt: new Date().toISOString()
            };
        }
    }
    catch (error) {
        // Bukan URL valid.
    }
    return null;
}
function linkedDeviceQrFallbackUrl(payload) {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=' + encodeURIComponent(payload);
}
function LinkedDeviceModal({ open, onClose, historyCount = 0 }) {
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [scanOpen, setScanOpen] = useState(false);
    const [scanStatus, setScanStatus] = useState('');
    const [qrText, setQrText] = useState('');
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const rafRef = useRef(0);
    const stopScanner = () => {
        if (rafRef.current)
            cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current)
            videoRef.current.srcObject = null;
    };
    useEffect(() => {
        if (!open) {
            stopScanner();
            return undefined;
        }
        const payload = buildLinkedDevicePayload();
        setQrText(payload);
        setQrDataUrl(linkedDeviceQrFallbackUrl(payload));
        if (window.QRCode?.toDataURL) {
            window.QRCode.toDataURL(payload, { width: 260, margin: 2, errorCorrectionLevel: 'M' }, (error, url) => {
                if (!error && url)
                    setQrDataUrl(url);
            });
        }
        return () => stopScanner();
    }, [open]);
    function saveLinkedDevice(payload) {
        localStorage.setItem('rbv_linked_desktop_device', JSON.stringify({ ...payload, linkedAt: new Date().toISOString() }));
        setScanStatus('Berhasil linked device. Data perangkat desktop sudah tersimpan di device ini.');
        stopScanner();
        setScanOpen(false);
    }
    function handleScanResult(raw) {
        const payload = parseLinkedDevicePayload(raw);
        if (!payload) {
            setScanStatus('QR tidak sesuai aplikasi Bestie Visit.');
            return false;
        }
        saveLinkedDevice(payload);
        return true;
    }
    async function startScanner() {
        try {
            setScanStatus('Membuka kamera...');
            setScanOpen(true);
            stopScanner();
            if (!navigator.mediaDevices?.getUserMedia) {
                setScanStatus('Kamera tidak tersedia di browser ini.');
                return;
            }
            if (!window.jsQR) {
                setScanStatus('Scanner QR belum siap. Coba refresh setelah deploy selesai.');
                return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
            streamRef.current = stream;
            const video = videoRef.current;
            if (!video)
                return;
            video.srcObject = stream;
            video.setAttribute('playsInline', 'true');
            await video.play();
            setScanStatus('Arahkan kamera ke QR desktop.');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const scanFrame = () => {
                if (!videoRef.current || !ctx)
                    return;
                const w = video.videoWidth || 0;
                const h = video.videoHeight || 0;
                if (w && h) {
                    canvas.width = w;
                    canvas.height = h;
                    ctx.drawImage(video, 0, 0, w, h);
                    const imageData = ctx.getImageData(0, 0, w, h);
                    const code = window.jsQR(imageData.data, w, h);
                    if (code?.data && handleScanResult(code.data))
                        return;
                }
                rafRef.current = requestAnimationFrame(scanFrame);
            };
            rafRef.current = requestAnimationFrame(scanFrame);
        }
        catch (error) {
            console.warn('Scan QR gagal:', error);
            setScanStatus('Tidak bisa membuka kamera. Pastikan izin kamera diberikan.');
            stopScanner();
        }
    }
    if (!open)
        return null;
    return React.createElement('div', { className: 'fixed inset-0 z-[90] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm' }, React.createElement('div', { className: 'max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[28px] bg-white shadow-2xl ring-1 ring-slate-200' }, React.createElement('div', { className: 'flex items-start justify-between gap-3 border-b border-slate-100 p-5' }, React.createElement('div', null, React.createElement('p', { className: 'text-[11px] font-extrabold uppercase tracking-[0.2em] text-audit-primary' }, 'Linked Device'), React.createElement('h2', { className: 'mt-1 text-xl font-black text-slate-950' }, 'Scan QR Desktop')), React.createElement('button', { type: 'button', className: 'grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600', onClick: () => { stopScanner(); onClose(); }, 'aria-label': 'Tutup linked device' }, React.createElement(Icon, { name: 'close', className: 'h-5 w-5' }))), React.createElement('div', { className: 'space-y-4 p-5' }, React.createElement('div', { className: 'rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100' }, React.createElement('div', { className: 'mx-auto grid h-[270px] w-[270px] max-w-full place-items-center rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200' }, qrDataUrl
        ? React.createElement('img', { src: qrDataUrl, alt: 'QR linked device', className: 'h-full w-full object-contain', onError: () => setQrDataUrl('') })
        : React.createElement('div', { className: 'text-center text-sm font-bold text-slate-500' }, 'QR belum tersedia. Gunakan Salin Kode.')), React.createElement('p', { className: 'mt-3 text-center text-xs leading-5 text-slate-500' }, 'Buka menu Linked Device di desktop, lalu scan QR dari device yang ingin dihubungkan.')), React.createElement('div', { className: 'grid grid-cols-2 gap-2' }, React.createElement('button', { type: 'button', className: 'inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-audit-primary px-4 text-sm font-extrabold text-white shadow-sm', onClick: startScanner }, React.createElement(Icon, { name: 'qr', className: 'h-5 w-5' }), React.createElement('span', null, 'Scan QR')), React.createElement('button', { type: 'button', className: 'inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200', onClick: () => { navigator.clipboard?.writeText(qrText); setScanStatus('Kode linked device disalin.'); } }, React.createElement(Icon, { name: 'clipboard', className: 'h-5 w-5' }), React.createElement('span', null, 'Salin Kode'))), scanOpen ? React.createElement('div', { className: 'mx-auto max-w-sm overflow-hidden rounded-3xl bg-slate-950 p-2 shadow-inner' }, React.createElement('video', { ref: videoRef, className: 'mx-auto aspect-square w-full rounded-2xl object-cover', muted: true, playsInline: true })) : null, React.createElement('div', { className: 'rounded-2xl bg-sky-50 p-3 text-xs font-semibold leading-5 text-sky-800 ring-1 ring-sky-200' }, 'Linked device memakai identitas perangkat dan siap disambungkan ke Cloudflare D1 untuk sync database.'), scanStatus ? React.createElement('p', { className: 'rounded-2xl bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-800 ring-1 ring-emerald-200' }, scanStatus) : null, React.createElement('p', { className: 'text-center text-[11px] font-bold text-slate-400' }, 'History lokal saat ini: ', String(historyCount)))));
}
function HomeUpdateNotice({ config }) {
    const notice = normalizeUpdateNoticeConfig(config || readUpdateNoticeConfig());
    const messages = notice.messages || [];
    const [index, setIndex] = useState(0);
    const messageSignature = messages.join('|');
    useEffect(() => { setIndex(0); }, [messageSignature, notice.enabled]);
    useEffect(() => {
        if (!notice.enabled || messages.length <= 1)
            return undefined;
        const timer = window.setInterval(() => setIndex((current) => (current + 1) % messages.length), Math.round(notice.intervalSeconds * 1000));
        return () => window.clearInterval(timer);
    }, [notice.enabled, messages.length, notice.intervalSeconds, messageSignature]);
    if (!notice.enabled || !messages.length)
        return null;
    const activeMessage = messages[index % messages.length] || messages[0];
    return (React.createElement("section", { className: "home-update-notice rounded-[24px] bg-white/90 px-4 py-4 shadow-sm", style: { overflow: 'hidden' } },
        React.createElement("style", null, `@keyframes rbvNoticeSmoothIn{0%{opacity:0;transform:translate3d(18px,0,0) scale(.985)}100%{opacity:1;transform:translate3d(0,0,0) scale(1)}} @keyframes rbvNoticeDot{0%,100%{transform:scale(.72);opacity:.34}50%{transform:scale(1);opacity:1}} @keyframes rbvInstallPulse{0%,100%{box-shadow:0 0 0 0 rgba(15,118,110,.28);transform:translateY(0)}50%{box-shadow:0 0 0 8px rgba(15,118,110,0);transform:translateY(-1px)}}`),
        React.createElement("div", { className: "mx-auto flex min-h-[112px] max-w-2xl flex-col items-center justify-center text-center" },
            React.createElement("p", { className: "text-[10px] font-black uppercase tracking-[0.24em] text-audit-primary" }, "Informasi Update"),
            React.createElement("h2", { className: "mt-1 max-w-full truncate text-base font-black text-slate-950" }, notice.title),
            React.createElement("div", { className: "mt-2 flex min-h-[42px] w-full items-center justify-center overflow-hidden px-2" },
                React.createElement("p", { key: `${index}-${activeMessage}`, className: "mx-auto max-w-[34rem] text-center text-sm font-bold leading-5 text-slate-700", style: { animation: 'rbvNoticeSmoothIn 620ms cubic-bezier(.22,1,.36,1) both', willChange: 'opacity, transform' } }, activeMessage)),
            messages.length > 1 ? React.createElement("div", { className: "mt-2 flex items-center justify-center gap-1.5", "aria-label": `${index + 1} dari ${messages.length} info` }, messages.map((_, dotIndex) => React.createElement("span", { key: dotIndex, className: "h-1.5 w-1.5 rounded-full", style: { background: dotIndex === index ? '#0f766e' : 'rgba(148,163,184,.5)', animation: dotIndex === index ? 'rbvNoticeDot 1.6s ease-in-out infinite' : 'none' } }))) : null)));
}
function DashboardPage({ history, storageLabel, onNewVisit, onOpenVisit, onDeleteVisit, onClearHistory, onTitleTap }) {
    const [installOpen, setInstallOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [backupBusy, setBackupBusy] = useState(false);
    const [restoreBusy, setRestoreBusy] = useState(false);
    const [syncBusy, setSyncBusy] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');
    const [noticeConfig, setNoticeConfig] = useState(() => readUpdateNoticeConfig());
    const restoreInputRef = useRef(null);
    useEffect(() => {
        function handleBeforeInstallPrompt(event) {
            event.preventDefault();
            setDeferredPrompt(event);
        }
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);
    useEffect(() => {
        const syncNotice = (event) => setNoticeConfig(event?.detail ? normalizeUpdateNoticeConfig(event.detail) : readUpdateNoticeConfig());
        window.addEventListener('rbv-update-notice-change', syncNotice);
        window.addEventListener('storage', syncNotice);
        return () => {
            window.removeEventListener('rbv-update-notice-change', syncNotice);
            window.removeEventListener('storage', syncNotice);
        };
    }, []);
    async function handleManualWebsiteSync() {
        if (syncBusy)
            return;
        setSyncBusy(true);
        setSyncMessage('Membersihkan cache...');
        try {
            if ('caches' in window) {
                const keys = await caches.keys();
                await Promise.all(keys.filter((key) => key.startsWith('bestie-visit-')).map((key) => caches.delete(key)));
            }
            setSyncMessage('Mengambil update terbaru...');
            if (navigator.serviceWorker?.getRegistrations) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                registrations.forEach((registration) => {
                    registration.update?.().catch(() => { });
                    if (registration.waiting)
                        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                });
            }
        }
        catch (error) {
            console.warn('Manual sync website gagal:', error);
        }
        const url = new URL(window.location.href);
        url.searchParams.set('v', APP_BUILD_VERSION);
        url.searchParams.set('manualSync', String(Date.now()));
        setSyncMessage('Reload update...');
        window.setTimeout(() => window.location.replace(url.toString()), 180);
    }
    async function handleBackupData() {
        if (backupBusy)
            return;
        try {
            setBackupBusy(true);
            await backupVisitReportData();
        }
        catch (error) {
            console.warn('Backup data gagal:', error);
            alert(error?.message || 'Backup data gagal.');
        }
        finally {
            setBackupBusy(false);
        }
    }
    async function handleRestoreFile(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file || restoreBusy)
            return;
        try {
            setRestoreBusy(true);
            await restoreVisitReportDataFromFile(file);
        }
        catch (error) {
            console.warn('Restore data gagal:', error);
            alert(error?.message || 'Restore data gagal. Pastikan file backup benar.');
        }
        finally {
            setRestoreBusy(false);
        }
    }
    return (React.createElement("main", { className: "dashboard-page mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 pb-28 md:px-8 md:py-8 md:pb-28" },
        React.createElement("style", null, `@keyframes rbvInstallPulse{0%,100%{box-shadow:0 0 0 0 rgba(15,118,110,.28);transform:translateY(0)}50%{box-shadow:0 0 0 8px rgba(15,118,110,0);transform:translateY(-1px)}}`),
        React.createElement("section", { className: "dashboard-compact glass-panel overflow-hidden rounded-[24px] p-4 md:rounded-[28px] md:p-5" },
            React.createElement("div", { className: "flex items-start justify-between gap-3" },
                React.createElement("button", { type: "button", onClick: onTitleTap, className: "min-w-0 text-left" },
                    React.createElement("h1", { className: "text-xl font-black tracking-tight text-slate-950 md:text-3xl" }, "Regional Bestie Visit Report"),
                    React.createElement("p", { className: "mt-1 text-xs font-semibold text-slate-500" }, "Home")),
                React.createElement("div", { className: "history-sync-wrap flex shrink-0 items-center gap-2" },
                    React.createElement("button", { type: "button", className: "dashboard-stat dark history-number-card min-w-[84px] px-3 py-2", onClick: onTitleTap, "aria-label": "History" },
                        React.createElement(Icon, { name: "history", className: "h-4 w-4" }),
                        React.createElement("p", null, "History"),
                        React.createElement("strong", null, history.length)),
                    React.createElement("button", { type: "button", className: cx('manual-sync-button', syncBusy && 'is-loading'), onClick: handleManualWebsiteSync, "aria-label": "Manual sync perubahan website", title: "Sync update website", disabled: syncBusy },
                        syncBusy ? React.createElement("span", { className: "loading-spinner mini", "aria-hidden": "true" }) : React.createElement(Icon, { name: "download", className: "h-4 w-4" }),
                        React.createElement("span", null, syncBusy ? 'Sync...' : 'Sync')))),
            React.createElement("div", { className: "mt-3", "data-build": "revamp92-hide-clear-topnav-redownload" },
                React.createElement("input", { ref: restoreInputRef, type: "file", accept: "application/json,.json", className: "hidden", onChange: handleRestoreFile }),
                React.createElement("div", { className: "grid grid-cols-2 gap-2 sm:grid-cols-4" },
                    React.createElement("button", { type: "button", className: cx('flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl bg-white/90 px-2 text-[10px] font-extrabold leading-none text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 active:scale-[0.98]', backupBusy && 'pointer-events-none opacity-60'), onClick: handleBackupData, "aria-label": "Backup data", title: "Backup data" },
                        React.createElement(Icon, { name: "download", className: "h-4 w-4 shrink-0 text-audit-primary" }),
                        React.createElement("span", { className: "block max-w-full truncate" }, "Backup")),
                    React.createElement("button", { type: "button", className: cx('flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl bg-white/90 px-2 text-[10px] font-extrabold leading-none text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 active:scale-[0.98]', restoreBusy && 'pointer-events-none opacity-60'), onClick: () => restoreInputRef.current?.click(), "aria-label": "Restore data", title: "Restore data" },
                        React.createElement(Icon, { name: "upload", className: "h-4 w-4 shrink-0 text-audit-primary" }),
                        React.createElement("span", { className: "block max-w-full truncate" }, "Restore")),
                    React.createElement("button", { type: "button", className: "flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl bg-emerald-50/90 px-2 text-[10px] font-extrabold leading-none text-audit-primary shadow-sm ring-1 ring-emerald-200 transition hover:-translate-y-0.5 active:scale-[0.98]", style: { animation: 'rbvInstallPulse 1.8s ease-in-out infinite' }, onClick: () => setInstallOpen(true), "aria-label": "Info install apps" },
                        React.createElement(Icon, { name: "spark", className: "h-4 w-4 shrink-0" }),
                        React.createElement("span", { className: "block max-w-full truncate" }, "Install")),
                    React.createElement("button", { type: "button", className: "flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[10px] font-extrabold leading-none shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]", style: {
                            background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                            color: '#ffffff',
                            border: '1px solid rgba(255,255,255,0.28)',
                            boxShadow: '0 10px 22px rgba(185,28,28,0.24)'
                        }, onClick: onClearHistory, "aria-label": "Hapus history kunjungan", title: "Hapus History" },
                        React.createElement(Icon, { name: "trash", className: "h-4 w-4 shrink-0" }),
                        React.createElement("span", { className: "block max-w-full truncate", style: { color: '#ffffff' } }, "Hapus History"))),
                syncBusy ? React.createElement("div", { className: "sync-loading-bar mt-3" },
                    React.createElement("span", { className: "loading-spinner mini", "aria-hidden": "true" }),
                    React.createElement("strong", null, syncMessage || 'Sync update...')) : null)),
        React.createElement(HomeUpdateNotice, { config: noticeConfig }),
        React.createElement("section", { className: "dashboard-history-section" },
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
                        React.createElement(Icon, { name: "trash", className: "h-4 w-4" })))))))) : (React.createElement(EmptyState, { icon: "clipboard", title: "Belum ada history" }))),
        React.createElement("button", { type: "button", className: "inline-flex items-center justify-center gap-2 rounded-full px-5 text-sm font-black text-white shadow-2xl ring-1 ring-emerald-200 transition active:scale-[0.98]", style: {
                position: 'fixed',
                left: '50%',
                bottom: 'calc(18px + env(safe-area-inset-bottom, 0px))',
                transform: 'translateX(-50%)',
                zIndex: 80,
                width: 'min(360px, calc(100vw - 32px))',
                height: '56px',
                background: '#0f766e',
                opacity: 1,
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none'
            }, onClick: onNewVisit, "aria-label": "Buat kunjungan baru" },
            React.createElement(Icon, { name: "plus", className: "h-5 w-5" }),
            React.createElement("span", null, "Kunjungan Baru")),
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
        if (!open)
            return;
        const initialBestie = BESTIE_NAMES[0] || '';
        const initialStore = getStoresForBestie(initialBestie)[0]?.label || '';
        setBestieName(initialBestie);
        setStoreName(initialStore);
        setManualOpen(false);
        setManualStoreName('');
        setManualStoreCode('');
        setManualAddress('');
        setManualNote('');
    }, [open]);
    useEffect(() => {
        const options = getStoresForBestie(bestieName);
        if (!storeName || !options.some((item) => normalize(item.label) === normalize(storeName))) {
            setStoreName(options[0]?.label || '');
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
function getPickerAccept(fileName) {
    const lower = String(fileName || '').toLowerCase();
    if (lower.endsWith('.pdf'))
        return [{ description: 'PDF Document', accept: { 'application/pdf': ['.pdf'] } }];
    if (lower.endsWith('.xlsx'))
        return [{ description: 'Excel Workbook', accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] } }];
    if (lower.endsWith('.json'))
        return [{ description: 'JSON Backup', accept: { 'application/json': ['.json'] } }];
    return undefined;
}
async function saveBlobWithPicker(blob, fileName) {
    if (window.showSaveFilePicker) {
        try {
            const pickerTypes = getPickerAccept(fileName);
            const handle = await window.showSaveFilePicker({ suggestedName: fileName, ...(pickerTypes ? { types: pickerTypes } : {}) });
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return true;
        }
        catch (error) {
            if (error?.name === 'AbortError')
                return 'cancelled';
            console.warn('File picker gagal, fallback download:', error);
        }
    }
    return false;
}
function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    if ('download' in anchor)
        anchor.click();
    else
        window.open(url, '_blank', 'noopener');
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
async function downloadBlobManaged(blob, fileName) {
    const saved = await saveBlobWithPicker(blob, fileName);
    if (saved === 'cancelled')
        return false;
    if (!saved)
        downloadBlob(blob, fileName);
    return true;
}

function getEmailReportConfig() {
    const config = window.VISIT_EMAIL_CONFIG || {};
    const adminTemplate = readEmailTemplateConfig();
    return {
        enabled: config.enabled !== false,
        endpoint: cleanText(config.endpoint, '/api/send-report-email'),
        sender: cleanText(config.sender, 'Sender belum diset'),
        defaultTo: cleanText(config.defaultTo),
        defaultCc: cleanText(config.defaultCc),
        lockedPasscode: cleanText(config.lockedPasscode, '607090'),
        defaultSubjectTemplate: cleanText(adminTemplate.subjectTemplate || config.defaultSubjectTemplate, DEFAULT_EMAIL_SUBJECT_TEMPLATE),
        defaultBodyTemplate: cleanText(adminTemplate.bodyTemplate || config.defaultBodyTemplate, DEFAULT_EMAIL_BODY_TEMPLATE)
    };
}
function applyEmailTemplate(template, visit) {
    const map = {
        '{store}': cleanText(visit?.store, '-'),
        '{bestie}': cleanText(visit?.nama, '-'),
        '{date}': formatDate(visit?.tanggal),
        '{storeHead}': cleanText(visit?.storeHead || visit?.detail?.storeHead || visit?.storeDetail?.storeHead, '-'),
        '{siteCode}': cleanText(visit?.siteCode || visit?.storeCode || visit?.detail?.siteCode, '-')
    };
    return Object.keys(map).reduce((text, key) => text.split(key).join(map[key]), String(template || ''));
}

function finalizeEmailBodyTemplate(body, visit) {
    let text = String(body || '').trim();
    const dateText = cleanText(formatDate(visit?.tanggal));
    if (dateText && !text.includes(dateText))
        text += `

Tanggal kunjungan: ${dateText}`;
    if (!/best\s*regards/i.test(text)) {
        const bestieName = cleanText(visit?.nama, 'Regional Bestie');
        text += `

Best Regards,
${bestieName}`;
    }
    return text;
}
function getVisitStoreEmail(visit) {
    return cleanText(visit?.emailStore || visit?.storeEmail || visit?.detail?.emailStore || visit?.storeDetail?.emailStore || visit?.manualStoreDetail?.emailStore);
}

const CUSTOM_EMAIL_DIRECTORY_KEY = 'visitreport_custom_email_directory_v1';
const SCHEDULED_REPORT_EMAIL_QUEUE_KEY = 'visitreport_scheduled_email_queue_v1';
const LOCKED_CC_EMAILS = [
    'muhammad.aufar@familymartindonesia.com',
    'mekarsari.pramawati@familymartindonesia.com',
    'nugraha.amijaya@familymartindonesia.com'
];
const MASTER_EMAIL_CONTACTS = [
    {
        kind: 'regional-bestie',
        email: 'regional.bestie@familymartindonesia.com',
        helper: 'Regional Bestie • Master Email',
        store: 'Regional Bestie',
        role: 'Master Email'
    }
];
const EMAIL_SAFE_REQUEST_BYTES = 3.25 * 1024 * 1024;
const EMAIL_PDF_SAFE_BYTES = 2.65 * 1024 * 1024;
const EMAIL_EXCEL_SAFE_BYTES = 850 * 1024;
function isEmailSyntax(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText(value).toLowerCase());
}
function readCustomEmailDirectory() {
    try {
        const parsed = JSON.parse(localStorage.getItem(CUSTOM_EMAIL_DIRECTORY_KEY) || '[]');
        if (!Array.isArray(parsed))
            return [];
        return parsed.map((item) => ({
            id: cleanText(item.id) || String(Date.now() + Math.random()),
            name: cleanText(item.name),
            email: cleanText(item.email).toLowerCase(),
            role: cleanText(item.role),
            store: cleanText(item.store)
        })).filter((item) => isEmailSyntax(item.email));
    }
    catch (_) {
        return [];
    }
}
function saveCustomEmailDirectory(items) {
    const normalized = uniqueBy((items || []).map((item) => ({
        id: cleanText(item.id) || String(Date.now() + Math.random()),
        name: cleanText(item.name),
        email: cleanText(item.email).toLowerCase(),
        role: cleanText(item.role),
        store: cleanText(item.store)
    })).filter((item) => isEmailSyntax(item.email)), (item) => normalize(item.email));
    localStorage.setItem(CUSTOM_EMAIL_DIRECTORY_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent('rbv-email-directory-change', { detail: normalized }));
    return normalized;
}
function readScheduledReportEmailQueue() {
    try {
        const parsed = JSON.parse(localStorage.getItem(SCHEDULED_REPORT_EMAIL_QUEUE_KEY) || '[]');
        return Array.isArray(parsed) ? parsed : [];
    }
    catch (_) {
        return [];
    }
}
function saveScheduledReportEmailQueue(items) {
    try {
        localStorage.setItem(SCHEDULED_REPORT_EMAIL_QUEUE_KEY, JSON.stringify(Array.isArray(items) ? items : []));
    }
    catch (_) {
        // Attachment bisa besar; timer aktif tetap menjalankan schedule selama app tidak ditutup.
    }
}
async function postReportEmailPayload(endpoint, payload) {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok === false)
        throw new Error(result.error || result.message || 'Gagal mengirim email.');
    return result;
}
async function processScheduledReportEmailQueue(endpoint) {
    const queue = readScheduledReportEmailQueue();
    if (!queue.length)
        return;
    const now = Date.now();
    const remaining = [];
    for (const job of queue) {
        if (!job || Number(job.sendAt || 0) > now) {
            remaining.push(job);
            continue;
        }
        try {
            await postReportEmailPayload(job.endpoint || endpoint, { ...(job.payload || {}), mode: 'send' });
        }
        catch (error) {
            remaining.push({ ...job, lastError: error?.message || 'Gagal mengirim schedule email.', retryAfter: Date.now() + 5 * 60 * 1000 });
        }
    }
    saveScheduledReportEmailQueue(remaining);
}
function scheduleReportEmailJob(endpoint, payload, delayMs) {
    const job = {
        id: String(Date.now()) + '-' + Math.random().toString(16).slice(2),
        sendAt: Date.now() + delayMs,
        endpoint,
        payload: { ...payload, mode: 'send' },
        createdAt: new Date().toISOString()
    };
    saveScheduledReportEmailQueue([...readScheduledReportEmailQueue(), job]);
    window.dispatchEvent(new CustomEvent('rbv-email-schedule-change', { detail: readScheduledReportEmailQueue() }));
    window.setTimeout(() => {
        const stillScheduled = readScheduledReportEmailQueue().some((item) => item.id === job.id);
        if (!stillScheduled)
            return;
        postReportEmailPayload(endpoint, job.payload).then(() => {
            const next = readScheduledReportEmailQueue().filter((item) => item.id !== job.id);
            saveScheduledReportEmailQueue(next);
            window.dispatchEvent(new CustomEvent('rbv-email-schedule-change', { detail: next }));
        }).catch((error) => {
            const next = readScheduledReportEmailQueue().map((item) => item.id === job.id ? { ...item, lastError: error?.message || 'Gagal mengirim schedule email.' } : item);
            saveScheduledReportEmailQueue(next);
            window.dispatchEvent(new CustomEvent('rbv-email-schedule-change', { detail: next }));
        });
    }, delayMs);
    return job;
}
function cancelScheduledReportEmailJob(jobId) {
    const next = readScheduledReportEmailQueue().filter((item) => item.id !== jobId);
    saveScheduledReportEmailQueue(next);
    window.dispatchEvent(new CustomEvent('rbv-email-schedule-change', { detail: next }));
    return next;
}
function cancelAllScheduledReportEmailJobs() {
    saveScheduledReportEmailQueue([]);
    window.dispatchEvent(new CustomEvent('rbv-email-schedule-change', { detail: [] }));
    return [];
}


function buildEmailContact(kind, email, helper, extra = {}) {
    const cleanEmail = cleanText(email).toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
        return null;
    return {
        kind,
        email: cleanEmail,
        label: cleanEmail,
        helper: cleanText(helper),
        ...extra
    };
}
function getVisitStoreDetailForEmail(visit) {
    return {
        ...(findMasterStore(visit?.storeCode || visit?.siteCode || visit?.detail?.siteCode4 || visit?.detail?.siteCode || visit?.store) || {}),
        ...(visit?.detail || {}),
        ...(visit?.storeDetail || {}),
        ...(visit?.manualStoreDetail || {})
    };
}
function getVisitToEmailContactOptions(visit) {
    const detail = getVisitStoreDetailForEmail(visit);
    const storeName = cleanText(visit?.store || detail.siteDescr || detail.storeName, 'Store');
    const storeEmail = detail.emailStore || getVisitStoreEmail(visit);
    const storeContact = buildEmailContact('store', storeEmail, `${storeName} • Email Store`, { store: storeName, role: 'Email Store' });
    return storeContact ? [storeContact] : [];
}
function getAllMasterEmailContactOptions(visit) {
    const contacts = [];
    function push(kind, email, helper, extra = {}) {
        const item = buildEmailContact(kind, email, helper, extra);
        if (item)
            contacts.push(item);
    }
    const visitDetail = getVisitStoreDetailForEmail(visit);
    const visitStore = cleanText(visit?.store || visitDetail.siteDescr || visitDetail.storeName, 'Store Aktif');
    push('store', visitDetail.emailStore || getVisitStoreEmail(visit), `${visitStore} • Email Store`, { store: visitStore, role: 'Email Store' });
    push('area', visitDetail.areaManagerEmail, `${visitStore} • Area Manager`, { store: visitStore, role: 'Area Manager' });
    push('regional', visitDetail.regionalManagerEmail, `${visitStore} • Regional Manager`, { store: visitStore, role: 'Regional Manager' });
    (MASTER_STORES || []).forEach((store) => {
        const storeName = cleanText(store.siteDescr || store.storeName || store.siteCode || 'Master Store');
        push('store', store.emailStore, `${storeName} • Email Store`, { store: storeName, role: 'Email Store' });
        push('area', store.areaManagerEmail, `${storeName} • Area Manager`, { store: storeName, role: 'Area Manager' });
        push('regional', store.regionalManagerEmail, `${storeName} • Regional Manager`, { store: storeName, role: 'Regional Manager' });
    });
    (MASTER_EMAIL_CONTACTS || []).forEach((item) => {
        push(cleanText(item.kind, 'master-email').toLowerCase(), item.email, cleanText(item.helper, 'Master Email'), {
            store: item.store,
            role: item.role
        });
    });
    readCustomEmailDirectory().forEach((item) => {
        push(cleanText(item.role, 'custom').toLowerCase(), item.email, cleanText([item.store, item.role].filter(Boolean).join(' • '), 'Email Directory'), {
            store: item.store,
            role: item.role
        });
    });
    return uniqueBy(contacts, (item) => normalize(item.email));
}
function getVisitEmailContactOptions(visit) {
    return getAllMasterEmailContactOptions(visit);
}
function parseEmailList(value) {
    return uniqueBy(String(value || '').split(',').map((item) => cleanText(item).toLowerCase()).filter(Boolean), (item) => normalize(item));
}
function joinEmailList(items) {
    return uniqueBy((items || []).map((item) => cleanText(item).toLowerCase()).filter(Boolean), (item) => normalize(item)).join(', ');
}
function ensureLockedEmailList(value, lockedEmails = LOCKED_CC_EMAILS) {
    return joinEmailList([...(lockedEmails || []), ...parseEmailList(value)]);
}
function getLockedCcContacts() {
    return LOCKED_CC_EMAILS.map((email) => buildEmailContact('locked-cc', email, 'Auto locked CC', { role: 'Locked CC' })).filter(Boolean);
}
function buildInitialEmailForm(visit) {
    const config = getEmailReportConfig();
    const toOptions = getVisitToEmailContactOptions(visit);
    const defaultTo = getVisitStoreEmail(visit) || toOptions[0]?.email || config.defaultTo || '';
    return {
        from: config.sender,
        to: defaultTo,
        cc: ensureLockedEmailList(config.defaultCc),
        subject: applyEmailTemplate(config.defaultSubjectTemplate, visit),
        body: finalizeEmailBodyTemplate(applyEmailTemplate(config.defaultBodyTemplate, visit), visit),
        passcode: config.lockedPasscode,
        attachPdf: true,
        attachExcel: true
    };
}
function blobToBase64Payload(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const text = String(reader.result || '');
            resolve(text.includes(',') ? text.split(',').pop() : text);
        };
        reader.onerror = () => reject(reader.error || new Error('Gagal membaca file attachment.'));
        reader.readAsDataURL(blob);
    });
}
function formatFileSize(bytes) {
    const size = Number(bytes || 0);
    if (size >= 1024 * 1024)
        return `${(size / 1024 / 1024).toFixed(1)} MB`;
    if (size >= 1024)
        return `${Math.max(1, Math.round(size / 1024))} KB`;
    return `${Math.max(0, Math.round(size))} B`;
}
function approxBase64Bytes(base64) {
    return Math.ceil(cleanText(base64).length * 0.75);
}
function estimateEmailPayloadBytes(payload) {
    try {
        return new Blob([JSON.stringify(payload || {})]).size;
    }
    catch (_) {
        return JSON.stringify(payload || {}).length;
    }
}
function getEmailSafeRequestBytes() {
    const raw = Number(window.VISIT_EMAIL_CONFIG?.clientMaxRequestBytes || EMAIL_SAFE_REQUEST_BYTES);
    return Number.isFinite(raw) && raw > 0 ? raw : EMAIL_SAFE_REQUEST_BYTES;
}
function stripPhotoImages(value) {
    if (Array.isArray(value))
        return value.map((item) => stripPhotoImages(item));
    if (!value || typeof value !== 'object')
        return value;
    const next = { ...value };
    if ('image' in next && typeof next.image === 'string')
        next.image = '';
    if ('dataUrl' in next && typeof next.dataUrl === 'string')
        next.dataUrl = '';
    if ('src' in next && typeof next.src === 'string' && next.src.startsWith('data:image/'))
        next.src = '';
    Object.keys(next).forEach((key) => {
        if (key.toLowerCase().includes('photo') || key.toLowerCase().includes('image'))
            next[key] = stripPhotoImages(next[key]);
    });
    return next;
}
function buildEmailOptimizedVisit(visit) {
    const optimized = stripPhotoImages(visit || {});
    return {
        ...optimized,
        qscResultPhoto: optimized.qscResultPhoto ? { ...optimized.qscResultPhoto, image: '' } : optimized.qscResultPhoto,
        qscResultPhotos: (optimized.qscResultPhotos || []).map((item) => ({ ...(item || {}), image: '' })),
        findingEvidencePhotos: (optimized.findingEvidencePhotos || []).map((item) => ({ ...(item || {}), image: '' })),
        correctiveActionPhotos: (optimized.correctiveActionPhotos || []).map((item) => ({ ...(item || {}), image: '' }))
    };
}
async function buildPdfAttachmentForEmail(visit, currentPdfBlob) {
    if (!window.ReportVisitPDF?.createBlob)
        throw new Error('Mesin PDF belum siap. Refresh halaman lalu coba lagi.');
    const fileName = window.ReportVisitPDF.buildFileName ? window.ReportVisitPDF.buildFileName(visit) : 'Regional_Bestie_Visit_Report.pdf';
    let blob = currentPdfBlob || await window.ReportVisitPDF.createBlob(visit);
    let optimized = false;
    if (blob.size > EMAIL_PDF_SAFE_BYTES) {
        blob = await window.ReportVisitPDF.createBlob(buildEmailOptimizedVisit(visit));
        optimized = true;
    }
    return { blob, fileName, optimized };
}
function addEmailNote(body, notes) {
    return cleanText(body);
}
function fitEmailPayloadToClientLimit(payload, notes) {
    const limit = getEmailSafeRequestBytes();
    const draft = { ...(payload || {}), attachments: [...(payload.attachments || [])] };
    const skipped = [];
    while (draft.attachments.length && estimateEmailPayloadBytes(draft) > limit) {
        let largestIndex = 0;
        draft.attachments.forEach((item, index) => {
            if (cleanText(item.dataBase64).length > cleanText(draft.attachments[largestIndex].dataBase64).length)
                largestIndex = index;
        });
        const [removed] = draft.attachments.splice(largestIndex, 1);
        skipped.push(`${removed.filename || 'Attachment'} dilepas otomatis karena ukuran request email melebihi batas Vercel.`);
        draft.body = addEmailNote(payload.body, [...(notes || []), ...skipped]);
    }
    return { payload: draft, notes: [...(notes || []), ...skipped], skipped };
}
function AutoResizeTextarea({ value, onChange, className = '', minRows = 1, ...props }) {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current)
            return;
        ref.current.style.height = 'auto';
        const minHeight = Math.max(28, Number(minRows || 1) * 24);
        ref.current.style.height = `${Math.max(ref.current.scrollHeight, minHeight)}px`;
    }, [value, minRows]);
    return React.createElement("textarea", { ref: ref, value: value, onChange: onChange, rows: minRows, className: className, ...props });
}
function EmailRecipientPicker({ label, value, onChange, options, placeholder, multiple = false, required = false, lockedEmails = [] }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);
    const selectedEmails = useMemo(() => parseEmailList(value), [value]);
    const lockedEmailSet = useMemo(() => new Set((lockedEmails || []).map((item) => normalize(item)).filter(Boolean)), [lockedEmails]);
    const isLockedEmail = (email) => lockedEmailSet.has(normalize(email));
    const optionMap = useMemo(() => {
        const map = new Map();
        (options || []).forEach((item) => map.set(normalize(item.email), item));
        return map;
    }, [options]);
    useEffect(() => {
        function handlePointer(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target))
                setOpen(false);
        }
        document.addEventListener('mousedown', handlePointer);
        document.addEventListener('touchstart', handlePointer);
        return () => {
            document.removeEventListener('mousedown', handlePointer);
            document.removeEventListener('touchstart', handlePointer);
        };
    }, []);
    const selectedItems = selectedEmails.map((email) => optionMap.get(normalize(email)) || { email, label: email, helper: isLockedEmail(email) ? 'Auto locked CC' : 'Manual' });
    const recipientChipStyle = {
        width: '100%',
        maxWidth: '100%',
        minHeight: '34px',
        gap: '8px',
        padding: '7px 10px',
        fontSize: '11px',
        lineHeight: '14px',
        fontWeight: 800,
        letterSpacing: '-0.01em',
        justifyContent: 'space-between'
    };
    const recipientChipEmailStyle = {
        display: 'block',
        minWidth: 0,
        maxWidth: 'calc(100% - 48px)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    };
    const recipientRemoveButtonStyle = {
        width: '18px',
        height: '18px',
        fontSize: '10px'
    };
    const recipientInputStyle = {
        fontSize: '16px',
        lineHeight: '20px',
        minHeight: '28px',
        textAlign: 'left'
    };
    const availableOptions = (options || []).filter((item) => {
        if (selectedEmails.some((email) => normalize(email) === normalize(item.email)))
            return false;
        const search = normalize(query);
        if (!search)
            return true;
        return normalize(item.email).includes(search) || normalize(item.helper).includes(search) || normalize(item.store).includes(search) || normalize(item.role).includes(search);
    }).slice(0, 80);
    const customQuery = cleanText(query).toLowerCase();
    const customAllowed = customQuery && isEmailSyntax(customQuery) && !selectedEmails.some((email) => normalize(email) === normalize(customQuery));
    function commitEmail(email) {
        const cleanEmail = cleanText(email).toLowerCase();
        if (!cleanEmail)
            return;
        const nextEmails = multiple ? [...selectedEmails, cleanEmail] : [cleanEmail];
        onChange(joinEmailList(nextEmails));
        setQuery('');
        if (!multiple)
            setOpen(false);
    }
    function removeEmail(email) {
        if (isLockedEmail(email))
            return;
        onChange(joinEmailList(selectedEmails.filter((item) => normalize(item) !== normalize(email))));
    }
    function handleKeyDown(event) {
        if ((event.key === 'Enter' || event.key === ',' || event.key === 'Tab') && query.trim()) {
            if (event.key !== 'Tab' || customAllowed || availableOptions.length) {
                event.preventDefault();
                if (customAllowed)
                    commitEmail(customQuery);
                else if (availableOptions.length)
                    commitEmail(availableOptions[0].email);
            }
        }
        if (event.key === 'Backspace' && !query && selectedEmails.length) {
            const removableEmail = [...selectedEmails].reverse().find((email) => !isLockedEmail(email));
            if (removableEmail) {
                event.preventDefault();
                removeEmail(removableEmail);
            }
        }
    }
    const chipEls = selectedItems.map((item) => {
        const locked = isLockedEmail(item.email);
        return React.createElement("span", { key: item.email, className: cx("rbv-email-recipient-chip-v99 inline-flex max-w-full items-center rounded-2xl ring-1", locked ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-slate-100 text-slate-700 ring-slate-200"), style: recipientChipStyle },
            React.createElement("span", { className: "truncate", style: recipientChipEmailStyle }, item.email),
            locked ? React.createElement("span", { className: "rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-emerald-700" }, "Lock") : React.createElement("button", { type: "button", className: "grid shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-rose-50 hover:text-rose-600", style: recipientRemoveButtonStyle, onClick: () => removeEmail(item.email), "aria-label": `Hapus ${item.email}` }, React.createElement(Icon, { name: "trash", className: "h-3 w-3" })));
    });
    const customButton = customAllowed ? React.createElement("button", { type: "button", className: "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-slate-50", onMouseDown: (event) => {
            event.preventDefault();
            commitEmail(customQuery);
        } },
        React.createElement("span", { className: "min-w-0 truncate text-xs font-bold text-slate-800" }, customQuery),
        React.createElement("span", { className: "rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500" }, "Add")) : null;
    const optionEls = availableOptions.map((item) => React.createElement("button", { type: "button", key: item.email, className: "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-50", onMouseDown: (event) => {
            event.preventDefault();
            commitEmail(item.email);
        } },
        React.createElement("span", { className: "min-w-0" },
            React.createElement("span", { className: "block truncate text-[11px] font-bold text-slate-900 sm:text-xs" }, item.email),
            item.helper ? React.createElement("span", { className: "mt-0.5 block truncate text-[9.5px] font-semibold text-slate-400 sm:text-[10px]" }, item.helper) : null),
        React.createElement("span", { className: "rounded-full bg-slate-100 px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500" }, multiple ? 'CC' : 'TO')));
    const dropdown = open && (customButton || optionEls.length) ? React.createElement("div", { className: "mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-xl" },
        React.createElement("div", { className: "max-h-60 overflow-y-auto p-2" },
            customButton,
            optionEls)) : null;
    return React.createElement("div", { className: "rbv-email-recipient-row-v99 border-b border-slate-100 px-4 py-3 text-left" },
        React.createElement("div", { className: "mb-2 text-left text-[11px] font-black uppercase tracking-[0.22em] text-slate-500" },
            label,
            required ? React.createElement("span", { className: "ml-1 text-rose-500" }, "*") : null),
        React.createElement("div", { className: "min-w-0", ref: wrapperRef },
            React.createElement("div", { className: "rbv-email-recipient-box-v99 mx-auto flex min-h-[46px] w-full flex-wrap items-center justify-start gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100" },
                chipEls,
                React.createElement("input", { value: query, onChange: (event) => {
                        setQuery(event.target.value);
                        setOpen(true);
                    }, onFocus: () => setOpen(true), onKeyDown: handleKeyDown, className: "min-w-[120px] flex-1 border-0 bg-transparent px-1 py-1 text-left font-semibold text-slate-900 outline-none placeholder:text-slate-400", style: recipientInputStyle, placeholder: selectedItems.length ? "Tambah" : placeholder || (multiple ? "Tambah email" : "Pilih email") })),
            dropdown));
}

function EmailReportModal({ open, form, onChange, onClose, onSubmit, busy, status, visit }) {
    const [scheduledJobs, setScheduledJobs] = useState(() => readScheduledReportEmailQueue());
    const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
    const [feedbackPopup, setFeedbackPopup] = useState(null);
    useEffect(() => {
        if (!open)
            return undefined;
        const refresh = () => setScheduledJobs(readScheduledReportEmailQueue());
        refresh();
        window.addEventListener('rbv-email-schedule-change', refresh);
        window.addEventListener('storage', refresh);
        const timer = window.setInterval(refresh, 10000);
        return () => {
            window.removeEventListener('rbv-email-schedule-change', refresh);
            window.removeEventListener('storage', refresh);
            window.clearInterval(timer);
        };
    }, [open]);
    useEffect(() => {
        if (!open)
            return undefined;
        function showFeedback(event) {
            setFeedbackPopup(event?.detail || { title: 'Info', message: 'Proses selesai.' });
        }
        window.addEventListener('rbv-email-feedback-popup', showFeedback);
        return () => window.removeEventListener('rbv-email-feedback-popup', showFeedback);
    }, [open]);
    useEffect(() => {
        if (!open) {
            setSendConfirmOpen(false);
            setFeedbackPopup(null);
        }
    }, [open]);
    useEffect(() => {
        if (!open)
            return;
        const lockedCcValue = ensureLockedEmailList(form.cc);
        if (normalize(lockedCcValue) !== normalize(form.cc))
            onChange({ cc: lockedCcValue });
    }, [open, form.cc]);
    if (!open)
        return null;
    const config = getEmailReportConfig();
    const toOptions = getVisitToEmailContactOptions(visit);
    const lockedCcEmails = LOCKED_CC_EMAILS;
    const ccOptions = uniqueBy([...getLockedCcContacts(), ...getAllMasterEmailContactOptions(visit)], (item) => normalize(item.email));
    const ccCount = parseEmailList(form.cc).length;
    const statusText = cleanText(status);
    const statusKind = /gagal/i.test(statusText) ? 'error' : /dijadwalkan|jadwal/i.test(statusText) ? 'schedule' : /draft/i.test(statusText) ? 'draft' : /berhasil dikirim|terkirim/i.test(statusText) ? 'sent' : statusText ? 'progress' : '';
    const statusTheme = statusKind === 'error' ? { box: '#fef2f2', border: '#fecaca', text: '#991b1b', badge: '#fee2e2', icon: 'close', label: 'Perlu dicek' } : statusKind === 'schedule' ? { box: '#fffbeb', border: '#fde68a', text: '#92400e', badge: '#fef3c7', icon: 'history', label: 'Terjadwal' } : statusKind === 'draft' ? { box: '#eef2ff', border: '#c7d2fe', text: '#3730a3', badge: '#e0e7ff', icon: 'pdf', label: 'Masuk draft' } : { box: '#ecfdf5', border: '#a7f3d0', text: '#047857', badge: '#d1fae5', icon: statusKind === 'sent' ? 'send' : 'spark', label: statusKind === 'sent' ? 'Terkirim' : 'Memproses' };
    const statusDisplay = statusText ? React.createElement("div", { className: `rbv-email-status rbv-email-status-${statusKind} mt-3 rounded-2xl border px-4 py-3 text-left shadow-sm`, style: { backgroundColor: statusTheme.box, borderColor: statusTheme.border, color: statusTheme.text } },
        React.createElement("div", { className: "flex items-center gap-3" },
            React.createElement("span", { className: "rbv-email-status-icon grid h-10 w-10 shrink-0 place-items-center rounded-full", style: { backgroundColor: statusTheme.badge } }, React.createElement(Icon, { name: statusTheme.icon, className: "h-5 w-5" })),
            React.createElement("span", { className: "min-w-0" },
                React.createElement("span", { className: "block text-[10px] font-black uppercase tracking-[0.16em]" }, statusTheme.label),
                React.createElement("span", { className: "mt-0.5 block text-sm font-bold leading-5" }, statusText)))) : null;
    function handleCancelSchedule(jobId) {
        setScheduledJobs(cancelScheduledReportEmailJob(jobId));
    }
    function handleCancelAllSchedules() {
        setScheduledJobs(cancelAllScheduledReportEmailJobs());
    }
    function openSendConfirmation() {
        if (busy || !form.to || !form.subject)
            return;
        setSendConfirmOpen(true);
    }
    function cancelSendConfirmation() {
        setSendConfirmOpen(false);
    }
    function confirmSendNow() {
        setSendConfirmOpen(false);
        onSubmit('send');
    }
    const scheduleEls = scheduledJobs.length ? React.createElement("div", { className: "mt-3 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-left" },
        React.createElement("div", { className: "mb-2 flex items-center justify-between gap-2" },
            React.createElement("p", { className: "text-[10px] font-black uppercase tracking-[0.18em] text-amber-700" }, "Jadwal aktif"),
            React.createElement("button", { type: "button", onClick: handleCancelAllSchedules, className: "inline-flex shrink-0 items-center justify-center gap-1 rounded-full bg-rose-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-200" },
                React.createElement(Icon, { name: "trash", className: "h-3.5 w-3.5" }),
                React.createElement("span", null, "Batal Semua"))),
        scheduledJobs.slice(0, 4).map((job) => React.createElement("div", { key: job.id, className: "mb-2 flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-amber-100 last:mb-0" },
            React.createElement("span", { className: "min-w-0 truncate" }, `${job.payload?.subject || 'Visit Report'} • ${new Date(Number(job.sendAt || Date.now())).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`),
            React.createElement("button", { type: "button", onClick: () => handleCancelSchedule(job.id), className: "inline-flex shrink-0 items-center justify-center gap-1 rounded-full bg-rose-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100" },
                React.createElement(Icon, { name: "trash", className: "h-3.5 w-3.5" }),
                React.createElement("span", null, "Batal"))))) : null;
    const composeCard = React.createElement("div", { className: "mx-auto w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-200 bg-white text-center shadow-sm" },
        React.createElement("div", { className: "border-b border-slate-100 px-4 py-4 text-center" },
            React.createElement("p", { className: "mb-2 text-center text-[11px] font-black uppercase tracking-[0.22em] text-slate-500" }, "From"),
            React.createElement("div", { className: "mx-auto flex max-w-full flex-col items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-center ring-1 ring-slate-200" },
                React.createElement("span", { className: "break-all text-center font-extrabold text-slate-900", style: { fontSize: '12px', lineHeight: '16px', letterSpacing: '-0.01em' } }, config.sender),
                React.createElement("span", { className: "rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700 ring-1 ring-emerald-100" }, "Locked"))),
        React.createElement(EmailRecipientPicker, { label: "To", required: true, value: form.to, onChange: (value) => onChange({ to: value }), options: toOptions, placeholder: "Auto email store" }),
        React.createElement(EmailRecipientPicker, { label: "Cc", value: form.cc, onChange: (value) => onChange({ cc: ensureLockedEmailList(value) }), options: ccOptions, multiple: true, lockedEmails: lockedCcEmails, placeholder: "Cari semua email master data" }),
        React.createElement("div", { className: "border-b border-slate-100 px-4 py-3 text-center" },
            React.createElement("label", { className: "mb-2 block text-center text-[11px] font-black uppercase tracking-[0.22em] text-slate-500" }, "Subject"),
            React.createElement(AutoResizeTextarea, { value: form.subject, onChange: (e) => onChange({ subject: e.target.value }), minRows: 1, className: "mx-auto w-full overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center font-semibold leading-6 text-slate-900 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100", style: { fontSize: '16px' }, placeholder: "Subject email" })),
        React.createElement("div", { className: "px-4 py-4 text-left" },
            React.createElement("label", { className: "mb-2 block text-left text-[11px] font-black uppercase tracking-[0.22em] text-slate-500" }, "Body"),
            React.createElement(AutoResizeTextarea, { value: form.body, onChange: (e) => onChange({ body: e.target.value }), minRows: 7, className: "mx-auto w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-left leading-7 text-slate-800 outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100", style: { fontSize: '16px', textAlign: 'left' }, placeholder: "Tulis isi email..." })),
        React.createElement("div", { className: "border-t border-slate-100 bg-slate-50 px-4 py-4 text-center" },
            React.createElement("div", { className: "grid grid-cols-2 gap-2" },
                React.createElement("label", { className: cx('flex cursor-pointer items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-bold text-slate-800 shadow-sm', form.attachPdf ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white') },
                    React.createElement("input", { type: "checkbox", checked: !!form.attachPdf, onChange: (e) => onChange({ attachPdf: e.target.checked }) }),
                    React.createElement(Icon, { name: "pdf", className: "h-4 w-4" }),
                    React.createElement("span", null, "PDF")),
                React.createElement("label", { className: cx('flex cursor-pointer items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-bold text-slate-800 shadow-sm', form.attachExcel ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white') },
                    React.createElement("input", { type: "checkbox", checked: !!form.attachExcel, onChange: (e) => onChange({ attachExcel: e.target.checked }) }),
                    React.createElement(Icon, { name: "excel", className: "h-4 w-4" }),
                    React.createElement("span", null, "Excel"))),
            React.createElement("div", { className: "mt-3 flex flex-wrap items-center justify-center gap-2" },
                React.createElement("span", { className: "rounded-2xl bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500" }, `CC ${ccCount}`),
                React.createElement("span", { className: "rounded-2xl bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700 ring-1 ring-emerald-100" }, "TO auto store")),
            statusDisplay));
    const footerButtonClass = "rbv-email-action-btn-v98 rbv-email-draft-btn-v98";
    const primaryFooterClass = "rbv-email-action-btn-v98 rbv-email-send-btn-v98";
    const scheduleFooterButtonClass = "rbv-email-schedule-chip-v98";
    const footerCancelSchedule = React.createElement("button", { type: "button", onClick: handleCancelAllSchedules, disabled: busy || !scheduledJobs.length, className: "rbv-email-cancel-schedule-v98", style: { backgroundColor: scheduledJobs.length ? '#fee2e2' : '#fff1f2', color: scheduledJobs.length ? '#be123c' : '#fb7185', borderColor: scheduledJobs.length ? '#fecaca' : '#ffe4e6' } },
        React.createElement(Icon, { name: "trash", className: "rbv-email-footer-icon-v98" }),
        React.createElement("span", null, scheduledJobs.length ? `Cancel Schedule (${scheduledJobs.length})` : 'Cancel Schedule'));
    const footer = React.createElement("div", { className: "rbv-email-footer-v98", style: { backgroundColor: '#ecfdf5', borderTop: '1px solid #a7f3d0', boxShadow: '0 -8px 24px rgba(16,185,129,0.12)', paddingBottom: 'calc(10px + env(safe-area-inset-bottom))' } },
        React.createElement("div", { className: "rbv-email-footer-inner-v98" },
            React.createElement("div", { className: "rbv-email-action-row-v98" },
                React.createElement("button", { type: "button", className: footerButtonClass, onClick: () => onSubmit('draft'), disabled: busy || !form.to || !form.subject }, busy ? 'Proses...' : 'Draft'),
                React.createElement("button", { type: "button", className: primaryFooterClass, onClick: openSendConfirmation, disabled: busy || !form.to || !form.subject, style: { backgroundColor: '#059669', color: '#ffffff', borderColor: '#047857' } },
                    React.createElement(Icon, { name: "send", className: "rbv-email-footer-icon-v98 rbv-email-send-icon-v98" }),
                    React.createElement("span", null, busy ? 'Proses...' : 'Send'))),
            React.createElement("div", { className: "rbv-email-cancel-wrap-v98" }, footerCancelSchedule),
            scheduledJobs.length ? React.createElement("div", { className: "rbv-email-scheduled-row-v98" }, scheduledJobs.slice(0, 3).map((job) => React.createElement("button", { key: job.id, type: "button", onClick: () => handleCancelSchedule(job.id), disabled: busy, className: "rbv-email-scheduled-chip-v98" },
                React.createElement(Icon, { name: "trash", className: "rbv-email-footer-icon-v98" }),
                React.createElement("span", null, new Date(Number(job.sendAt || Date.now())).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))))) : null,
            React.createElement("div", { className: "rbv-email-timer-grid-v98" },
                React.createElement("button", { type: "button", className: scheduleFooterButtonClass, onClick: () => onSubmit('schedule:10'), disabled: busy || !form.to || !form.subject }, "10M"),
                React.createElement("button", { type: "button", className: scheduleFooterButtonClass, onClick: () => onSubmit('schedule:20'), disabled: busy || !form.to || !form.subject }, "20M"),
                React.createElement("button", { type: "button", className: scheduleFooterButtonClass, onClick: () => onSubmit('schedule:30'), disabled: busy || !form.to || !form.subject }, "30M"),
                React.createElement("button", { type: "button", className: scheduleFooterButtonClass, onClick: () => onSubmit('schedule:60'), disabled: busy || !form.to || !form.subject },
                    React.createElement(Icon, { name: "history", className: "rbv-email-footer-icon-v98" }),
                    React.createElement("span", null, "1J")))));
    const sendConfirmDialog = sendConfirmOpen ? React.createElement("div", { className: "fixed inset-0 grid place-items-center bg-slate-950/55 px-5 backdrop-blur-sm", style: { zIndex: 2147483647, backgroundColor: 'rgba(15, 23, 42, 0.55)' } },
        React.createElement("div", { className: "w-full max-w-sm rounded-[28px] border border-emerald-100 bg-white p-5 text-center shadow-2xl", style: { backgroundColor: '#ffffff', borderColor: '#d1fae5' } },
            React.createElement("p", { className: "text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700", style: { color: '#047857' } }, "Konfirmasi Send Email"),
            React.createElement("div", { className: "mx-auto mt-4 grid h-20 w-20 place-items-center rounded-full border-4 border-emerald-200 bg-emerald-50 text-emerald-700", style: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857' } }, React.createElement(Icon, { name: "send", className: "h-9 w-9" })),
            React.createElement("h3", { className: "mt-4 text-lg font-black leading-6 text-slate-950" }, "Pastikan data email sudah sesuai, email yang sudah dikirim tidak dapat dibatalkan"),
            React.createElement("div", { className: "mt-5 grid gap-2" },
                React.createElement("button", { type: "button", onClick: confirmSendNow, disabled: busy, className: "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-emerald-800 bg-emerald-600 px-4 py-3 text-[12px] font-black uppercase tracking-[0.08em] text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-50", style: { backgroundColor: '#059669', color: '#ffffff', borderColor: '#047857' } },
                    React.createElement(Icon, { name: "send", className: "h-4 w-4 text-white" }),
                    React.createElement("span", null, "SAYA YAKIN KIRIM EMAIL")),
                React.createElement("button", { type: "button", onClick: cancelSendConfirmation, disabled: busy, className: "inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-600 transition hover:bg-slate-50 disabled:opacity-50" }, "Batal")))) : null;
    const feedbackDialog = feedbackPopup ? React.createElement("div", { className: "fixed inset-0 grid place-items-center bg-slate-950/40 px-5 backdrop-blur-sm", style: { zIndex: 2147483647, backgroundColor: 'rgba(15, 23, 42, 0.40)' } },
        React.createElement("div", { className: "w-full max-w-sm rounded-[28px] border border-indigo-100 bg-white p-5 text-center shadow-2xl" },
            React.createElement("div", { className: "mx-auto grid h-16 w-16 place-items-center rounded-full bg-indigo-50 text-indigo-700" }, React.createElement(Icon, { name: feedbackPopup.icon || "check", className: "h-8 w-8" })),
            React.createElement("h3", { className: "mt-4 text-lg font-black text-slate-950" }, feedbackPopup.title || 'Info'),
            React.createElement("p", { className: "mt-2 text-sm font-semibold leading-6 text-slate-600" }, feedbackPopup.message || ''),
            React.createElement("button", { type: "button", onClick: () => setFeedbackPopup(null), className: "mt-5 inline-flex min-h-[44px] w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white" }, "OK"))) : null;
    const overlay = React.createElement("div", { className: "rbv-email-compose-portal fixed inset-0 bg-[#f6f8fc]", role: "dialog", "aria-modal": "true", style: { position: 'fixed', inset: '0px', width: '100vw', height: '100dvh', minHeight: '100vh', zIndex: 2147483647, isolation: 'isolate', overflow: 'hidden', background: '#f6f8fc' } },
        React.createElement("div", { className: "flex h-[100dvh] w-full flex-col overflow-hidden bg-[#f6f8fc]", style: { height: '100dvh', maxHeight: '100dvh', width: '100vw', overflow: 'hidden' } },
            React.createElement("div", { className: "flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4" },
                React.createElement("div", { className: "min-w-0" },
                    React.createElement("p", { className: "text-[11px] font-black uppercase tracking-[0.26em] text-audit-primary" }, "Email Report"),
                    React.createElement("h2", { className: "truncate text-2xl font-black text-slate-950" }, "New Message")),
                React.createElement(Button, { variant: "icon", onClick: onClose, disabled: busy, "aria-label": "Tutup" }, React.createElement(Icon, { name: "close", className: "h-4 w-4" }))),
            React.createElement("div", { className: "flex-1 overflow-y-auto p-4 md:p-5", style: { minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' } }, composeCard),
            footer),
        sendConfirmDialog,
        feedbackDialog);
    return (typeof document !== 'undefined' && ReactDOM?.createPortal) ? ReactDOM.createPortal(overlay, document.body) : overlay;
}

function PdfCanvasPreview({ blob, pdfUrl, status }) {


    const pagesRef = useRef(null);
    const scrollRef = useRef(null);
    const [fallback, setFallback] = useState(false);
    const [renderStatus, setRenderStatus] = useState('');
    const [zoom, setZoom] = useState(1);
    const [renderZoom, setRenderZoom] = useState(1);
    const zoomRef = useRef(1);
    const pinchRef = useRef({ active: false, startDistance: 0, startZoom: 1 });
    const zoomFrameRef = useRef(0);
    const renderZoomTimerRef = useRef(null);
    const renderSeqRef = useRef(0);
    const lastWidthRef = useRef(0);
    useEffect(() => { zoomRef.current = zoom; }, [zoom]);
    function touchDistance(touches) {
        if (!touches || touches.length < 2)
            return 0;
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    function handlePreviewTouchStart(event) {
        if (!event.touches || event.touches.length < 2)
            return;
        const distance = touchDistance(event.touches);
        if (!distance)
            return;
        pinchRef.current = { active: true, startDistance: distance, startZoom: zoomRef.current || 1 };
    }
    function applyLivePreviewZoom(nextZoom) {
        zoomRef.current = nextZoom;
        if (zoomFrameRef.current)
            return;
        zoomFrameRef.current = window.requestAnimationFrame(() => {
            zoomFrameRef.current = 0;
            setZoom(zoomRef.current || 1);
        });
    }
    function schedulePreviewRenderZoom() {
        window.clearTimeout(renderZoomTimerRef.current);
        renderZoomTimerRef.current = window.setTimeout(() => {
            const nextRenderZoom = zoomRef.current || 1;
            setRenderZoom((current) => Math.abs(current - nextRenderZoom) < 0.04 ? current : nextRenderZoom);
        }, 180);
    }
    function handlePreviewTouchMove(event) {
        if (!pinchRef.current.active || !event.touches || event.touches.length < 2)
            return;
        event.preventDefault();
        event.stopPropagation();
        const distance = touchDistance(event.touches);
        const ratio = distance / Math.max(1, pinchRef.current.startDistance);
        const nextZoom = clampNumber(pinchRef.current.startZoom * ratio, 0.75, 2.6, 1);
        applyLivePreviewZoom(nextZoom);
    }
    function finishPreviewPinch() {
        if (!pinchRef.current.active)
            return;
        pinchRef.current.active = false;
        schedulePreviewRenderZoom();
    }
    useEffect(() => {
        let cancelled = false;
        let resizeTimer = null;
        let observer = null;
        async function renderPdf(force = false) {
            const target = pagesRef.current;
            const scroller = scrollRef.current;
            if (!target || !blob)
                return;
            const measuredWidth = Math.max(280, Math.floor((scroller?.clientWidth || target.clientWidth || 360) - 16));
            if (!force && Math.abs(measuredWidth - lastWidthRef.current) < 18 && target.childElementCount)
                return;
            lastWidthRef.current = measuredWidth;
            const seq = renderSeqRef.current + 1;
            renderSeqRef.current = seq;
            const pdfjsLib = window.pdfjsLib;
            if (!pdfjsLib?.getDocument) {
                setFallback(true);
                return;
            }
            try {
                setFallback(false);
                setRenderStatus('Memuat preview...');
                if (pdfjsLib.GlobalWorkerOptions) {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                }
                const scrollTop = scroller?.scrollTop || 0;
                const data = await blob.arrayBuffer();
                if (cancelled || renderSeqRef.current !== seq)
                    return;
                const pdf = await pdfjsLib.getDocument({ data, disableAutoFetch: true, disableStream: true }).promise;
                if (cancelled || renderSeqRef.current !== seq)
                    return;
                const maxWidth = Math.max(260, Math.min(measuredWidth * renderZoom, 1680));
                const fragment = document.createDocumentFragment();
                for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
                    if (cancelled || renderSeqRef.current !== seq)
                        return;
                    setRenderStatus(`Memuat preview halaman ${pageNumber}/${pdf.numPages}...`);
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
            window.clearTimeout(renderZoomTimerRef.current);
            if (zoomFrameRef.current)
                window.cancelAnimationFrame(zoomFrameRef.current);
            if (observer)
                observer.disconnect();
            window.removeEventListener('resize', scheduleRender);
            window.removeEventListener('orientationchange', scheduleRender);
            renderSeqRef.current += 1;
        };
    }, [blob, renderZoom]);
    const liveScale = renderZoom ? zoom / renderZoom : 1;
    const zoomLabel = Math.round((zoom || 1) * 100);
    if (!blob)
        return React.createElement("div", { className: "grid min-h-[52vh] place-items-center p-8 text-center text-slate-600" }, status);
    if (fallback && pdfUrl)
        return React.createElement("iframe", { className: "preview-frame", src: pdfUrl + '#toolbar=0&navpanes=0&scrollbar=1&view=FitH', title: "Preview Regional Bestie PDF" });
    return (React.createElement("div", { ref: scrollRef, className: "pdf-canvas-scroll", onTouchStart: handlePreviewTouchStart, onTouchMove: handlePreviewTouchMove, onTouchEnd: finishPreviewPinch, onTouchCancel: finishPreviewPinch, style: { touchAction: 'pan-x pan-y', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' } },
        React.createElement("div", { ref: pagesRef, className: "pdf-canvas-pages", style: { transform: `translateZ(0) scale(${liveScale})`, transformOrigin: 'top center', transition: pinchRef.current.active ? 'none' : 'transform 180ms cubic-bezier(.22,1,.36,1)', willChange: 'transform' } }),
        React.createElement("div", { "aria-hidden": "true", style: { position: 'sticky', bottom: 10, left: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none' } },
            React.createElement("span", { style: { borderRadius: 999, background: 'rgba(15,23,42,.72)', color: '#fff', padding: '5px 10px', fontSize: 11, fontWeight: 900, boxShadow: '0 10px 24px rgba(15,23,42,.18)' } },
                "Zoom ",
                zoomLabel,
                "%")),
        renderStatus ? React.createElement("div", { className: "pdf-render-status" }, renderStatus) : null));
}
function PreviewPage({ visit, onBack }) {
    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfBlob, setPdfBlob] = useState(null);
    const [status, setStatus] = useState('Menyiapkan preview PDF...');
    const [busy, setBusy] = useState(false);
    const [downloadBusy, setDownloadBusy] = useState(false);
    const [downloadMessage, setDownloadMessage] = useState('');
    const [emailOpen, setEmailOpen] = useState(false);
    const [emailBusy, setEmailBusy] = useState(false);
    const [emailStatus, setEmailStatus] = useState('');
    const [emailForm, setEmailForm] = useState(() => buildInitialEmailForm(visit));
    useEffect(() => {
        let cancelled = false;
        let objectUrl = '';
        async function render() {
            if (!visit)
                return;
            setStatus('Merender PDF...');
            try {
                if (!window.ReportVisitPDF?.createBlob)
                    throw new Error('Mesin PDF belum siap. Refresh halaman lalu coba lagi.');
                const blob = await window.ReportVisitPDF.createBlob({ ...visit, showQSCResult: true });
                if (cancelled)
                    return;
                objectUrl = URL.createObjectURL(blob);
                setPdfBlob(blob);
                setPdfUrl(objectUrl);
                setStatus('Preview siap.');
            }
            catch (error) {
                setPdfBlob(null);
                setStatus(error?.message || 'Preview PDF gagal dibuat.');
            }
        }
        render();
        return () => { cancelled = true; if (objectUrl)
            URL.revokeObjectURL(objectUrl); };
    }, [visit]);
    useEffect(() => {
        if (!emailOpen)
            setEmailForm(buildInitialEmailForm(visit));
    }, [visit, emailOpen]);
    useEffect(() => {
        const config = getEmailReportConfig();
        const timer = window.setInterval(() => processScheduledReportEmailQueue(config.endpoint), 60000);
        processScheduledReportEmailQueue(config.endpoint);
        return () => window.clearInterval(timer);
    }, []);
    async function handleDownloadPdf() {
        if (!visit || busy || downloadBusy)
            return;
        setBusy(true);
        setDownloadBusy(true);
        setDownloadMessage('Menyiapkan PDF...');
        try {
            await new Promise((resolve) => window.setTimeout(resolve, 80));
            if (!window.ReportVisitPDF?.createBlob)
                throw new Error('Mesin PDF belum siap. Refresh halaman lalu coba lagi.');
            const blob = pdfBlob || await window.ReportVisitPDF.createBlob({ ...visit, showQSCResult: true });
            const fileName = window.ReportVisitPDF.buildFileName ? window.ReportVisitPDF.buildFileName(visit) : 'Regional_Bestie_Visit_Report.pdf';
            setDownloadMessage('Pilih lokasi simpan...');
            const didSave = await downloadBlobManaged(blob, fileName);
            setDownloadMessage(didSave ? 'PDF tersimpan.' : 'Download dibatalkan.');
            await new Promise((resolve) => window.setTimeout(resolve, didSave ? 420 : 260));
        }
        catch (error) {
            alert(error?.message || 'Gagal download PDF.');
        }
        finally {
            setDownloadBusy(false);
            setDownloadMessage('');
            setBusy(false);
        }
    }
    async function handleExportExcel() { if (!visit)
        return; if (!window.__caAssignmentExport?.buildWorkbook) {
        alert('Mesin export Excel belum siap.');
        return;
    } setBusy(true); try {
        const blob = await window.__caAssignmentExport.buildWorkbook(visit);
        const fileName = 'CA_Store_Assignment_' + cleanText(visit.store, 'Store').replace(/\s+/g, '_') + '.xlsx';
        downloadBlob(blob, fileName);
    }
    catch (error) {
        alert(error?.message || 'Gagal export Excel CA Assignment.');
    }
    finally {
        setBusy(false);
    } }
    function openEmailReportModal() {
        if (!visit || busy || downloadBusy)
            return;
        setEmailForm(buildInitialEmailForm(visit));
        setEmailStatus('');
        setEmailOpen(true);
    }
    async function handleSendReportEmail(mode) {
        if (!visit || emailBusy)
            return;
        const config = getEmailReportConfig();
        if (!config.enabled) {
            alert('Fitur email belum aktif di email-config.js.');
            return;
        }
        if (!cleanText(emailForm.to) || !cleanText(emailForm.subject)) {
            alert('To dan Subject wajib diisi.');
            return;
        }
        setEmailBusy(true);
        setBusy(true);
        setEmailStatus('Menyiapkan attachment...');
        try {
            const attachments = [];
            const attachmentNotes = [];
            if (emailForm.attachPdf) {
                setEmailStatus('Menyiapkan PDF email...');
                const { blob, fileName, optimized } = await buildPdfAttachmentForEmail(visit, pdfBlob);
                if (optimized)
                    attachmentNotes.push('PDF dibuat versi ringan tanpa foto agar bisa masuk batas request Vercel/Gmail. Gunakan tombol Download PDF untuk file lengkap dengan foto.');
                if (blob.size <= EMAIL_PDF_SAFE_BYTES) {
                    attachments.push({ filename: fileName, mimeType: 'application/pdf', dataBase64: await blobToBase64Payload(blob) });
                }
                else {
                    attachmentNotes.push(`PDF Report tidak dilampirkan karena masih terlalu besar (${formatFileSize(blob.size)}). Download PDF manual lalu attach dari Gmail jika perlu.`);
                }
            }
            if (emailForm.attachExcel) {
                setEmailStatus('Menyiapkan Excel CA Assignment...');
                if (!window.__caAssignmentExport?.buildWorkbook)
                    throw new Error('Mesin export Excel belum siap.');
                const blob = await window.__caAssignmentExport.buildWorkbook(visit);
                const fileName = 'CA_Store_Assignment_' + cleanText(visit.store, 'Store').replace(/\s+/g, '_') + '.xlsx';
                if (blob.size <= EMAIL_EXCEL_SAFE_BYTES) {
                    attachments.push({ filename: fileName, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', dataBase64: await blobToBase64Payload(blob) });
                }
                else {
                    attachmentNotes.push(`Excel CA Assignment tidak dilampirkan karena terlalu besar (${formatFileSize(blob.size)}).`);
                }
            }
            const scheduleMatch = /^schedule:(10|20|30|60)$/.exec(String(mode || ''));
            const scheduleMinutes = scheduleMatch ? Number(scheduleMatch[1]) : 0;
            const payloadMode = scheduleMinutes || mode === 'send' ? 'send' : 'draft';
            const basePayload = { mode: payloadMode, to: emailForm.to, cc: emailForm.cc, subject: emailForm.subject, body: addEmailNote(emailForm.body, attachmentNotes), passcode: emailForm.passcode, attachments, visitMeta: { store: visit.store, bestie: visit.nama, tanggal: visit.tanggal } };
            const fitted = fitEmailPayloadToClientLimit(basePayload, attachmentNotes);
            const payload = fitted.payload;
            if (scheduleMinutes) {
                setEmailStatus(`Email dijadwalkan ${scheduleMinutes} menit ke depan...`);
                scheduleReportEmailJob(config.endpoint, payload, scheduleMinutes * 60 * 1000);
                setEmailStatus(fitted.skipped.length ? `Email dijadwalkan ${scheduleMinutes} menit. Beberapa attachment dilepas karena ukuran terlalu besar.` : `Email berhasil dijadwalkan ${scheduleMinutes} menit ke depan.`);
                window.dispatchEvent(new CustomEvent('rbv-email-feedback-popup', { detail: { icon: 'history', title: 'Email dijadwalkan', message: `Email akan dikirim sesuai waktu yang dipilih (${scheduleMinutes} menit).` } }));
                return;
            }
            setEmailStatus(mode === 'send' ? 'Mengirim email...' : 'Membuat draft email...');
            await postReportEmailPayload(config.endpoint, payload);
            const successMessage = mode === 'send' ? (fitted.skipped.length ? 'Email berhasil dikirim. Beberapa attachment dilepas karena ukuran terlalu besar.' : 'Email berhasil dikirim.') : (fitted.skipped.length ? 'Draft sudah disimpan diemail, Buka menu draft pada Gmail untuk mengeceknya. Beberapa attachment dilepas karena ukuran terlalu besar.' : 'Draft sudah disimpan diemail, Buka menu draft pada Gmail untuk mengeceknya.');
            setEmailStatus(successMessage);
            if (mode === 'draft')
                window.dispatchEvent(new CustomEvent('rbv-email-feedback-popup', { detail: { icon: 'pdf', title: 'Draft tersimpan', message: 'Draft sudah disimpan diemail, Buka menu draft pada Gmail untuk mengeceknya.' } }));
            if (mode === 'send')
                window.dispatchEvent(new CustomEvent('rbv-email-feedback-popup', { detail: { icon: 'send', title: 'Email terkirim', message: 'Email berhasil dikirim.' } }));
            window.setTimeout(() => setEmailOpen(false), mode === 'send' ? 1700 : 2600);
        }
        catch (error) {
            setEmailStatus(`Gagal: ${error?.message || 'Gagal memproses email.'}`);
        }
        finally {
            setEmailBusy(false);
            setBusy(false);
        }
    }
    if (!visit)
        return React.createElement("main", { className: "preview-page w-full px-4 py-8 md:px-8" },
            React.createElement(EmptyState, { icon: "pdf", title: "Belum ada visit aktif" }));
    return (React.createElement("main", { className: "preview-page w-full px-4 py-4 md:px-8 md:py-8" },
        downloadBusy ? React.createElement("div", { className: "download-pdf-overlay", role: "status", "aria-live": "polite" },
            React.createElement("div", { className: "download-pdf-loader" },
                React.createElement("span", { className: "download-pdf-spinner", "aria-hidden": "true" }),
                React.createElement("strong", null, downloadMessage || 'Menyiapkan PDF...'),
                React.createElement("p", null, "Jangan tutup halaman sampai file manager muncul."))) : null,
        React.createElement(EmailReportModal, { open: emailOpen, form: emailForm, onChange: (patch) => setEmailForm((state) => ({ ...state, ...patch })), onClose: () => setEmailOpen(false), onSubmit: handleSendReportEmail, busy: emailBusy, status: emailStatus, visit: visit }),
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
                React.createElement("div", { className: "preview-actions-v99" },
                    React.createElement("div", { className: "preview-actions-left-v99" },
                        React.createElement(Button, { icon: downloadBusy ? null : "download", onClick: handleDownloadPdf, disabled: busy || downloadBusy, className: "preview-secondary-action-v99" }, downloadBusy ? 'Memproses...' : 'Download PDF'),
                        React.createElement(Button, { variant: "secondary", icon: "excel", onClick: handleExportExcel, disabled: busy || downloadBusy, className: "excel-export-button preview-secondary-action-v99" },
                            React.createElement("span", { className: "text-left leading-tight" },
                                React.createElement("span", { className: "block" }, "Export Excel CA"),
                                React.createElement("span", { className: "block text-[11px] font-semibold text-slate-500" }, "file untuk feedback store")))),
                    React.createElement(Button, { icon: "upload", onClick: openEmailReportModal, disabled: busy || downloadBusy, className: "preview-send-action-v99" }, "Send Email"))),
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
    return [visit?.nama, visit?.store, visit?.tanggal].map((part) => normalize(part).replace(/\s+/g, '-')).filter(Boolean).join('__') || visit?.id || SESSION_ID;
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
    if (window.convex?.ConvexClient)
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
        script.onload = () => window.convex?.ConvexClient ? resolve(window.convex) : reject(new Error('Convex client tidak tersedia.'));
        script.onerror = () => reject(new Error('Convex client gagal dimuat.'));
        document.head.appendChild(script);
    });
    return RB_CONVEX_BUNDLE_PROMISE;
}
async function getConvexRealtimeClient() {
    const config = getConvexConfig();
    const deploymentUrl = getConvexDeploymentUrl();
    if (!config.enabled || !deploymentUrl)
        return null;
    await loadConvexBundle();
    if (!window.convex?.ConvexClient)
        return null;
    if (!RB_CONVEX_CLIENT || RB_CONVEX_CLIENT_URL !== deploymentUrl) {
        try {
            RB_CONVEX_CLIENT?.close?.();
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
        else if (typeof unsubscribe?.unsubscribe === 'function')
            unsubscribe.unsubscribe();
    };
}
function normalizeMonitorRows(rows) {
    const safeRows = Array.isArray(rows) ? rows : (Array.isArray(rows?.rows) ? rows.rows : Array.isArray(rows?.data) ? rows.data : []);
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
    const safeRows = Array.isArray(rows) ? rows : (Array.isArray(rows?.rows) ? rows.rows : Array.isArray(rows?.data) ? rows.data : []);
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
        source: cloudflareEnabled() ? 'cloudflare-approved' : (netlifyEnabled() ? 'netlify-approved' : (supabaseEnabled() ? 'supabase-approved' : 'convex-approved')),
        approvedAt: item.updatedAt,
        requestedBy: item.bestieName
    }));
    if (approvedStores.length)
        saveApprovedManualStores([...approvedStores, ...readApprovedManualStores()]);
    return normalized;
}
function getPresenceLastSeen(row) {
    const raw = row?.last_seen_at || row?.lastSeenAt || row?.updated_at || row?.updatedAt || row?.last_visit_at || row?.lastVisitAt || 0;
    if (typeof raw === 'number')
        return raw;
    const parsed = Date.parse(raw);
    return Number.isFinite(parsed) ? parsed : Number(raw || 0) || 0;
}
function normalizePresenceRows(rows) {
    const safeRows = Array.isArray(rows) ? rows : (Array.isArray(rows?.rows) ? rows.rows : Array.isArray(rows?.data) ? rows.data : []);
    const now = Date.now();
    return safeRows.map((row) => {
        const lastSeenMs = getPresenceLastSeen(row);
        const sessionId = row.session_id || row.sessionId || row.id || '-';
        return {
            id: sessionId,
            session_id: sessionId,
            bestie_name: row.bestie_name || row.bestieName || row.nama || 'Belum pilih bestie',
            store_name: row.store_name || row.storeName || row.store || 'Belum pilih store',
            store_code: row.store_code || row.storeCode || '',
            active_screen: row.active_screen || row.activeScreen || row.screen || 'home',
            visit_id: row.visit_id || row.visitId || '',
            page_url: row.page_url || row.pageUrl || '',
            user_agent: row.user_agent || row.userAgent || '',
            updated_at: row.updated_at || row.updatedAt || row.last_seen_at || row.lastSeenAt || '',
            last_seen_at: row.last_seen_at || row.lastSeenAt || row.updated_at || row.updatedAt || '',
            is_online: row.is_online === false ? false : Boolean(lastSeenMs && now - lastSeenMs <= PRESENCE_STALE_MS),
            last_seen_ms: lastSeenMs
        };
    }).sort((a, b) => Number(b.last_seen_ms || 0) - Number(a.last_seen_ms || 0));
}
function readLocalPresenceRows() {
    try {
        return normalizePresenceRows(JSON.parse(localStorage.getItem(PRESENCE_LOCAL_KEY) || '[]'));
    }
    catch (error) {
        return [];
    }
}
function saveLocalPresenceRows(rows) {
    const normalized = normalizePresenceRows(rows).slice(0, 80);
    localStorage.setItem(PRESENCE_LOCAL_KEY, JSON.stringify(normalized));
    return normalized;
}
function presencePayloadFromState(visit, screen) {
    const detail = visit?.store ? getStoreWebDetail(visit.store) : {};
    const now = new Date().toISOString();
    return {
        session_id: SESSION_ID,
        bestie_name: cleanText(visit?.nama, 'Belum pilih bestie'),
        store_name: cleanText(visit?.store, screen === 'dashboard' ? 'Home' : 'Belum pilih store'),
        store_code: cleanText(detail.siteCode4 || detail.siteCode || detail.storeCode || visit?.storeCode, ''),
        visit_id: visit?.id || '',
        active_screen: screen || 'dashboard',
        is_online: true,
        last_seen_at: now,
        updated_at: now,
        page_url: location.href,
        user_agent: navigator.userAgent
    };
}
function persistPresenceLocal(payload) {
    const rows = readLocalPresenceRows().filter((item) => item.session_id !== payload.session_id);
    return saveLocalPresenceRows([payload, ...rows]);
}

// =============================================================
// Cloudflare D1 backend helpers
// =============================================================
function getCloudflareConfig() {
    const config = window.RB_CLOUDFLARE_CONFIG && typeof window.RB_CLOUDFLARE_CONFIG === 'object' ? window.RB_CLOUDFLARE_CONFIG : {};
    return config;
}
function cloudflareEnabled() {
    const config = getCloudflareConfig();
    return config.enabled !== false && Boolean(cleanText(config.endpoint || config.workerUrl || config.apiPath || '/api/rbv-data'));
}
function getCloudflareApiUrl() {
    const config = getCloudflareConfig();
    const endpoint = cleanText(config.endpoint || config.workerUrl || '');
    const rawApiPath = config.apiPath === undefined ? '/api/rbv-data' : config.apiPath;
    const apiPath = cleanText(rawApiPath);
    if (endpoint) {
        if (/^https?:\/\//i.test(endpoint)) {
            // Standalone Cloudflare Worker endpoint already points to the API root.
            // Do not append /api/rbv-data to an absolute workers.dev URL, because that
            // can make the frontend test a different URL than the one verified manually.
            if (/workers\.dev\/?$/i.test(endpoint) || endpoint.includes('?') || !apiPath)
                return endpoint.replace(/\/$/, '');
            if (endpoint.endsWith(apiPath))
                return endpoint;
            return endpoint.replace(/\/$/, '') + '/' + apiPath.replace(/^\//, '');
        }
        return endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    }
    return apiPath.startsWith('/') ? apiPath : '/' + apiPath;
}
function normalizeCloudflareError(error, label) {
    if (!error)
        return '';
    return `${label || 'Cloudflare D1'}: ${error.message || error.details || error.hint || 'gagal diproses'}`;
}
async function cloudflareRequest(action, options = {}) {
    if (!cloudflareEnabled() || !action)
        return null;
    const method = options.method || 'GET';
    const url = new URL(getCloudflareApiUrl(), window.location.origin);
    url.searchParams.set('action', action);
    url.searchParams.set('_rbv', String(Date.now()));
    if (options.params && typeof options.params === 'object') {
        Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '')
                url.searchParams.set(key, String(value));
        });
    }
    const config = getCloudflareConfig();
    const headers = { Accept: 'application/json' };
    if (options.body !== undefined)
        headers['Content-Type'] = 'application/json';
    if (cleanText(config.adminToken))
        headers['X-Admin-Token'] = cleanText(config.adminToken);
    let response;
    try {
        response = await fetch(url.toString(), {
            method,
            mode: 'cors',
            credentials: 'omit',
            headers,
            body: options.body === undefined ? undefined : JSON.stringify(options.body),
            cache: 'no-store'
        });
    }
    catch (error) {
        throw new Error(`Fetch Cloudflare gagal: ${error?.message || 'request diblokir/cache lama'}`);
    }
    let payload = null;
    const rawText = await response.text().catch(() => '');
    if (rawText) {
        try {
            payload = JSON.parse(rawText);
        }
        catch (error) {
            throw new Error(`Cloudflare tidak mengirim JSON valid: ${rawText.slice(0, 120)}`);
        }
    }
    if (!response.ok || payload?.ok === false) {
        throw new Error(payload?.error || payload?.message || `Cloudflare D1 request gagal (${response.status})`);
    }
    return payload || { ok: true };
}
async function upsertMonitorVisitToCloudflare(visit) {
    if (!cloudflareEnabled() || !visit || !cleanText(visit.nama) || !cleanText(visit.store))
        return false;
    try {
        await cloudflareRequest('upsertMonitorVisit', { method: 'POST', body: monitorPayloadFromVisit(visit) });
        return true;
    }
    catch (error) {
        console.warn(normalizeCloudflareError(error, 'Cloudflare monitor upsert'));
        return false;
    }
}
async function fetchMonitorRowsFromCloudflare() {
    if (!cloudflareEnabled())
        return null;
    try {
        const payload = await cloudflareRequest('listMonitorVisits', { params: { limit: getCloudflareConfig().monitorLimit || 500 } });
        return normalizeMonitorRows(payload?.rows || payload?.data || []);
    }
    catch (error) {
        console.warn(normalizeCloudflareError(error, 'Cloudflare monitor read'));
        return null;
    }
}
async function upsertPresenceToCloudflare(payload) {
    if (!cloudflareEnabled() || !payload)
        return false;
    try {
        await cloudflareRequest('upsertPresence', { method: 'POST', body: payload });
        return true;
    }
    catch (error) {
        console.warn(normalizeCloudflareError(error, 'Cloudflare presence upsert'));
        return false;
    }
}
async function fetchPresenceRowsFromCloudflare() {
    if (!cloudflareEnabled())
        return null;
    try {
        const payload = await cloudflareRequest('listPresence', { params: { limit: getCloudflareConfig().presenceLimit || 300 } });
        return normalizePresenceRows(payload?.rows || payload?.data || []);
    }
    catch (error) {
        console.warn(normalizeCloudflareError(error, 'Cloudflare presence read'));
        return null;
    }
}
async function fetchManualRequestsFromCloudflare() {
    if (!cloudflareEnabled())
        return null;
    try {
        const payload = await cloudflareRequest('listManualRequests');
        return persistManualRequestsFromRemote(payload?.rows || payload?.data || []);
    }
    catch (error) {
        console.warn(normalizeCloudflareError(error, 'Cloudflare request toko read'));
        return null;
    }
}
async function syncManualRequestToCloudflare(request) {
    if (!cloudflareEnabled() || !request)
        return false;
    try {
        await cloudflareRequest('upsertManualRequest', { method: 'POST', body: manualRequestPayload(request) });
        return true;
    }
    catch (error) {
        console.warn(normalizeCloudflareError(error, 'Cloudflare request toko sync'));
        return false;
    }
}
async function fetchAppConfigsFromCloudflare() {
    if (!cloudflareEnabled())
        return null;
    try {
        const payload = await cloudflareRequest('listAppSettings', { params: { keys: [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice, APP_CONFIG_KEYS.emailTemplate].join(',') } });
        return normalizeRemoteAppConfigRows(payload?.rows || payload?.data || []);
    }
    catch (error) {
        console.warn(normalizeCloudflareError(error, 'Cloudflare app config read'));
        return null;
    }
}
let LAST_REMOTE_SYNC_ERROR = '';
function rememberRemoteSyncError(error, label) {
    LAST_REMOTE_SYNC_ERROR = error?.message || error?.error || `${label || 'Remote sync'} gagal diproses.`;
    return LAST_REMOTE_SYNC_ERROR;
}
function clearRemoteSyncError() {
    LAST_REMOTE_SYNC_ERROR = '';
}
function remoteSyncLabel() {
    if (cloudflareEnabled())
        return 'Cloudflare D1';
    if (netlifyEnabled())
        return 'Netlify';
    if (supabaseEnabled())
        return 'Supabase';
    if (convexEnabled())
        return 'Convex';
    return 'remote database';
}
function remoteSaveSuccessText(label) {
    return `${label} berhasil disimpan dan disinkronkan ke ${remoteSyncLabel()}.`;
}
function remoteSaveFailText(label) {
    const detail = LAST_REMOTE_SYNC_ERROR ? ` Detail: ${LAST_REMOTE_SYNC_ERROR}` : '';
    return `${label} tersimpan lokal, tapi belum berhasil sync ke ${remoteSyncLabel()}.${detail} Jika Test D1 sudah aktif, tutup web lalu buka ulang dengan ?v=103.`;
}
async function syncAppConfigToCloudflare(key, payload) {
    if (!cloudflareEnabled() || !key)
        return false;
    try {
        clearRemoteSyncError();
        await cloudflareRequest('setAppSetting', {
            method: 'POST',
            body: { key, payload, updatedBy: SESSION_ID }
        });
        return true;
    }
    catch (error) {
        rememberRemoteSyncError(error, 'Cloudflare app config sync');
        console.warn(normalizeCloudflareError(error, 'Cloudflare app config sync'));
        return false;
    }
}

// =============================================================
// Netlify backend helpers
// =============================================================
function getNetlifyConfig() {
    const config = window.RB_NETLIFY_CONFIG && typeof window.RB_NETLIFY_CONFIG === 'object' ? window.RB_NETLIFY_CONFIG : {};
    return config;
}
function netlifyEnabled() {
    const config = getNetlifyConfig();
    const path = cleanText(config.functionPath || '/.netlify/functions/rbv-data');
    return config.enabled !== false && Boolean(path);
}
function getNetlifyFunctionUrl() {
    const config = getNetlifyConfig();
    const path = cleanText(config.functionPath || '/.netlify/functions/rbv-data');
    const baseUrl = cleanText(config.baseUrl || '');
    if (/^https?:\/\//i.test(path))
        return path;
    if (baseUrl)
        return baseUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
    return path.startsWith('/') ? path : '/' + path;
}
function normalizeNetlifyError(error, label) {
    if (!error)
        return '';
    return `${label || 'Netlify'}: ${error.message || error.details || error.hint || 'gagal diproses'}`;
}
async function netlifyRequest(action, options = {}) {
    if (!netlifyEnabled() || !action)
        return null;
    const method = options.method || 'GET';
    const url = new URL(getNetlifyFunctionUrl(), window.location.origin);
    url.searchParams.set('action', action);
    if (options.params && typeof options.params === 'object') {
        Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '')
                url.searchParams.set(key, String(value));
        });
    }
    const config = getNetlifyConfig();
    const headers = { Accept: 'application/json' };
    if (options.body !== undefined)
        headers['Content-Type'] = 'application/json';
    if (cleanText(config.adminToken))
        headers['X-Admin-Token'] = cleanText(config.adminToken);
    const response = await fetch(url.toString(), {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        cache: 'no-store'
    });
    let payload = null;
    try {
        payload = await response.json();
    }
    catch (error) { }
    if (!response.ok) {
        throw new Error(payload?.error || payload?.message || `Netlify request gagal (${response.status})`);
    }
    return payload;
}
async function upsertMonitorVisitToNetlify(visit) {
    if (!netlifyEnabled() || !visit || !cleanText(visit.nama) || !cleanText(visit.store))
        return false;
    try {
        await netlifyRequest('upsertMonitorVisit', { method: 'POST', body: monitorPayloadFromVisit(visit) });
        return true;
    }
    catch (error) {
        console.warn(normalizeNetlifyError(error, 'Netlify monitor upsert'));
        return false;
    }
}
async function fetchMonitorRowsFromNetlify() {
    if (!netlifyEnabled())
        return null;
    try {
        const payload = await netlifyRequest('listMonitorVisits', { params: { limit: getNetlifyConfig().monitorLimit || 500 } });
        return normalizeMonitorRows(payload?.rows || payload?.data || []);
    }
    catch (error) {
        console.warn(normalizeNetlifyError(error, 'Netlify monitor read'));
        return null;
    }
}
async function upsertPresenceToNetlify(payload) {
    if (!netlifyEnabled() || !payload)
        return false;
    try {
        await netlifyRequest('upsertPresence', { method: 'POST', body: payload });
        return true;
    }
    catch (error) {
        console.warn(normalizeNetlifyError(error, 'Netlify presence upsert'));
        return false;
    }
}
async function fetchPresenceRowsFromNetlify() {
    if (!netlifyEnabled())
        return null;
    try {
        const payload = await netlifyRequest('listPresence', { params: { limit: getNetlifyConfig().presenceLimit || 300 } });
        return normalizePresenceRows(payload?.rows || payload?.data || []);
    }
    catch (error) {
        console.warn(normalizeNetlifyError(error, 'Netlify presence read'));
        return null;
    }
}
async function fetchManualRequestsFromNetlify() {
    if (!netlifyEnabled())
        return null;
    try {
        const payload = await netlifyRequest('listManualRequests');
        return persistManualRequestsFromRemote(payload?.rows || payload?.data || []);
    }
    catch (error) {
        console.warn(normalizeNetlifyError(error, 'Netlify request toko read'));
        return null;
    }
}
async function syncManualRequestToNetlify(request) {
    if (!netlifyEnabled() || !request)
        return false;
    try {
        await netlifyRequest('upsertManualRequest', { method: 'POST', body: manualRequestPayload(request) });
        return true;
    }
    catch (error) {
        console.warn(normalizeNetlifyError(error, 'Netlify request toko sync'));
        return false;
    }
}
async function fetchAppConfigsFromNetlify() {
    if (!netlifyEnabled())
        return null;
    try {
        const payload = await netlifyRequest('listAppSettings', { params: { keys: [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice, APP_CONFIG_KEYS.emailTemplate].join(',') } });
        return normalizeRemoteAppConfigRows(payload?.rows || payload?.data || []);
    }
    catch (error) {
        console.warn(normalizeNetlifyError(error, 'Netlify app config read'));
        return null;
    }
}
async function syncAppConfigToNetlify(key, payload) {
    if (!netlifyEnabled() || !key)
        return false;
    try {
        await netlifyRequest('setAppSetting', {
            method: 'POST',
            body: { key, payload, updatedBy: SESSION_ID }
        });
        return true;
    }
    catch (error) {
        console.warn(normalizeNetlifyError(error, 'Netlify app config sync'));
        return false;
    }
}
function remoteSyncProvider() {
    if (cloudflareEnabled())
        return 'cloudflare';
    if (netlifyEnabled())
        return 'netlify';
    if (supabaseEnabled())
        return 'supabase';
    if (convexEnabled())
        return 'convex';
    return 'local';
}
// =============================================================
// Supabase backend helpers
// =============================================================
let RB_SUPABASE_CLIENT = null;
let RB_SUPABASE_BUNDLE_PROMISE = null;
function getSupabaseConfig() {
    const config = window.RB_SUPABASE_CONFIG && typeof window.RB_SUPABASE_CONFIG === 'object' ? window.RB_SUPABASE_CONFIG : {};
    return config;
}
function getSupabaseKey() {
    const config = getSupabaseConfig();
    return cleanText(config.publishableKey || config.anonKey || config.key || '');
}
function supabaseEnabled() {
    const config = getSupabaseConfig();
    return Boolean(config.enabled && cleanText(config.url) && getSupabaseKey());
}
function getRemotePollMs() {
    if (cloudflareEnabled())
        return Math.max(3500, Number(getCloudflareConfig().pollMs || 5000));
    if (netlifyEnabled())
        return Math.max(3500, Number(getNetlifyConfig().pollMs || 5000));
    if (supabaseEnabled())
        return Math.max(3500, Number(getSupabaseConfig().pollMs || 5000));
    return Math.max(3500, Number(getConvexConfig().pollMs || 5000));
}
function getSupabaseTable(name, fallback) {
    const config = getSupabaseConfig();
    const tables = config.tables && typeof config.tables === 'object' ? config.tables : {};
    return cleanText(tables[name] || config[name + 'Table'] || fallback);
}
function getSupabaseBundleUrl() {
    const config = getSupabaseConfig();
    return config.bundleUrl || 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
}
function loadSupabaseBundle() {
    if (window.supabase?.createClient)
        return Promise.resolve(window.supabase);
    if (RB_SUPABASE_BUNDLE_PROMISE)
        return RB_SUPABASE_BUNDLE_PROMISE;
    RB_SUPABASE_BUNDLE_PROMISE = new Promise((resolve, reject) => {
        const existing = document.getElementById('rbv-supabase-client-bundle');
        if (existing) {
            existing.addEventListener('load', () => resolve(window.supabase), { once: true });
            existing.addEventListener('error', () => reject(new Error('Supabase client gagal dimuat.')), { once: true });
            return;
        }
        const script = document.createElement('script');
        script.id = 'rbv-supabase-client-bundle';
        script.src = getSupabaseBundleUrl();
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onload = () => window.supabase?.createClient ? resolve(window.supabase) : reject(new Error('Supabase client tidak tersedia.'));
        script.onerror = () => reject(new Error('Supabase client gagal dimuat.'));
        document.head.appendChild(script);
    });
    return RB_SUPABASE_BUNDLE_PROMISE;
}
async function getSupabaseClient() {
    if (!supabaseEnabled())
        return null;
    if (RB_SUPABASE_CLIENT)
        return RB_SUPABASE_CLIENT;
    const supabaseLib = await loadSupabaseBundle();
    const config = getSupabaseConfig();
    RB_SUPABASE_CLIENT = supabaseLib.createClient(cleanText(config.url), getSupabaseKey(), {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });
    return RB_SUPABASE_CLIENT;
}
function normalizeSupabaseError(error, label) {
    if (!error)
        return '';
    return `${label || 'Supabase'}: ${error.message || error.details || error.hint || 'gagal diproses'}`;
}
async function upsertMonitorVisitToSupabase(visit) {
    if (!supabaseEnabled() || !visit || !cleanText(visit.nama) || !cleanText(visit.store))
        return false;
    try {
        const client = await getSupabaseClient();
        if (!client)
            return false;
        const table = getSupabaseTable('monitor', 'monitor_visits');
        const { error } = await client.from(table).upsert(monitorPayloadFromVisit(visit), { onConflict: 'visit_key' });
        if (error)
            throw error;
        return true;
    }
    catch (error) {
        console.warn(normalizeSupabaseError(error, 'Supabase monitor upsert'));
        return false;
    }
}
async function fetchMonitorRowsFromSupabase() {
    if (!supabaseEnabled())
        return null;
    try {
        const client = await getSupabaseClient();
        if (!client)
            return null;
        const table = getSupabaseTable('monitor', 'monitor_visits');
        const limit = Math.max(50, Number(getSupabaseConfig().monitorLimit || 500));
        const { data, error } = await client.from(table).select('*').order('updated_at', { ascending: false }).limit(limit);
        if (error)
            throw error;
        return normalizeMonitorRows(data || []);
    }
    catch (error) {
        console.warn(normalizeSupabaseError(error, 'Supabase monitor read'));
        return null;
    }
}
async function upsertPresenceToSupabase(payload) {
    if (!supabaseEnabled() || !payload)
        return false;
    try {
        const client = await getSupabaseClient();
        if (!client)
            return false;
        const table = getSupabaseTable('presence', 'monitor_presence');
        const { error } = await client.from(table).upsert(payload, { onConflict: 'session_id' });
        if (error)
            throw error;
        return true;
    }
    catch (error) {
        console.warn(normalizeSupabaseError(error, 'Supabase presence upsert'));
        return false;
    }
}
async function fetchPresenceRowsFromSupabase() {
    if (!supabaseEnabled())
        return null;
    try {
        const client = await getSupabaseClient();
        if (!client)
            return null;
        const table = getSupabaseTable('presence', 'monitor_presence');
        const limit = Math.max(50, Number(getSupabaseConfig().presenceLimit || 300));
        const { data, error } = await client.from(table).select('*').order('updated_at', { ascending: false }).limit(limit);
        if (error)
            throw error;
        return normalizePresenceRows(data || []);
    }
    catch (error) {
        console.warn(normalizeSupabaseError(error, 'Supabase presence read'));
        return null;
    }
}
function manualRequestPayload(request) {
    return {
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
}
async function fetchManualRequestsFromSupabase() {
    if (!supabaseEnabled())
        return null;
    try {
        const client = await getSupabaseClient();
        if (!client)
            return null;
        const table = getSupabaseTable('manualRequests', 'manual_store_requests');
        const { data, error } = await client.from(table).select('*').order('updated_at', { ascending: false }).limit(500);
        if (error)
            throw error;
        return persistManualRequestsFromRemote(data || []);
    }
    catch (error) {
        console.warn(normalizeSupabaseError(error, 'Supabase request toko read'));
        return null;
    }
}
async function syncManualRequestToSupabase(request) {
    if (!supabaseEnabled() || !request)
        return false;
    try {
        const client = await getSupabaseClient();
        if (!client)
            return false;
        const table = getSupabaseTable('manualRequests', 'manual_store_requests');
        const { error } = await client.from(table).upsert(manualRequestPayload(request), { onConflict: 'request_id' });
        if (error)
            throw error;
        return true;
    }
    catch (error) {
        console.warn(normalizeSupabaseError(error, 'Supabase request toko sync'));
        return false;
    }
}
async function fetchAppConfigsFromSupabase() {
    if (!supabaseEnabled())
        return null;
    try {
        const client = await getSupabaseClient();
        if (!client)
            return null;
        const table = getSupabaseTable('appSettings', 'app_settings');
        const { data, error } = await client
            .from(table)
            .select('config_key,payload,updated_at')
            .in('config_key', [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice, APP_CONFIG_KEYS.emailTemplate]);
        if (error)
            throw error;
        return normalizeRemoteAppConfigRows((data || []).map((item) => ({
            key: item.config_key,
            payload: item.payload,
            updatedAt: item.updated_at
        })));
    }
    catch (error) {
        console.warn(normalizeSupabaseError(error, 'Supabase app config read'));
        return null;
    }
}
async function syncAppConfigToSupabase(key, payload) {
    if (!supabaseEnabled() || !key)
        return false;
    try {
        const client = await getSupabaseClient();
        if (!client)
            return false;
        const table = getSupabaseTable('appSettings', 'app_settings');
        const { error } = await client.from(table).upsert({
            config_key: key,
            payload,
            updated_at: new Date().toISOString(),
            updated_by: SESSION_ID
        }, { onConflict: 'config_key' });
        if (error)
            throw error;
        return true;
    }
    catch (error) {
        console.warn(normalizeSupabaseError(error, 'Supabase app config sync'));
        return false;
    }
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
    if (await upsertMonitorVisitToCloudflare(visit))
        return;
    if (await upsertMonitorVisitToNetlify(visit))
        return;
    if (await upsertMonitorVisitToSupabase(visit))
        return;
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
async function upsertPresence(payload) {
    if (!payload)
        return;
    persistPresenceLocal(payload);
    if (await upsertPresenceToCloudflare(payload))
        return;
    if (await upsertPresenceToNetlify(payload))
        return;
    if (await upsertPresenceToSupabase(payload))
        return;
    const config = getConvexConfig();
    if (!convexEnabled())
        return;
    try {
        await runConvexMutation(config.presenceUpsertMutation || 'monitor:upsertPresence', { payload });
    }
    catch (error) {
        console.warn('Convex presence sync gagal:', error);
    }
}
async function fetchPresenceRowsFromConvex() {
    const cloudflareRows = await fetchPresenceRowsFromCloudflare();
    if (cloudflareRows !== null)
        return cloudflareRows;
    const netlifyRows = await fetchPresenceRowsFromNetlify();
    if (netlifyRows !== null)
        return netlifyRows;
    const supabaseRows = await fetchPresenceRowsFromSupabase();
    if (supabaseRows !== null)
        return supabaseRows;
    const config = getConvexConfig();
    if (!convexEnabled())
        return readLocalPresenceRows();
    try {
        const queryName = config.presenceQuery || 'monitor:listPresence';
        const rows = await runConvexQuery(queryName, {});
        if (rows !== null)
            return normalizePresenceRows(rows);
    }
    catch (error) {
        console.warn('Convex presence query gagal:', error);
    }
    return readLocalPresenceRows();
}
async function fetchMonitorRowsFromConvex() {
    const cloudflareRows = await fetchMonitorRowsFromCloudflare();
    if (cloudflareRows !== null)
        return cloudflareRows;
    const netlifyRows = await fetchMonitorRowsFromNetlify();
    if (netlifyRows !== null)
        return netlifyRows;
    const supabaseRows = await fetchMonitorRowsFromSupabase();
    if (supabaseRows !== null)
        return supabaseRows;
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
    const cloudflareRows = await fetchManualRequestsFromCloudflare();
    if (cloudflareRows !== null)
        return cloudflareRows;
    const netlifyRows = await fetchManualRequestsFromNetlify();
    if (netlifyRows !== null)
        return netlifyRows;
    const supabaseRows = await fetchManualRequestsFromSupabase();
    if (supabaseRows !== null)
        return supabaseRows;
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
    if (await syncManualRequestToCloudflare(request))
        return;
    if (await syncManualRequestToNetlify(request))
        return;
    if (await syncManualRequestToSupabase(request))
        return;
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
function normalizeRemoteAppConfigRows(rows) {
    const safeRows = Array.isArray(rows) ? rows : (Array.isArray(rows?.rows) ? rows.rows : Array.isArray(rows?.data) ? rows.data : []);
    return safeRows.map((row) => ({
        key: row.configKey || row.config_key || row.key || '',
        payload: row.payload || row.value || row.config || {},
        updatedAt: row.updatedAt || row.updated_at || 0
    })).filter((row) => row.key);
}
function applyRemoteAppConfigRows(rows) {
    const normalized = normalizeRemoteAppConfigRows(rows);
    normalized.forEach((row) => {
        if (row.key === APP_CONFIG_KEYS.welcome)
            saveWelcomeConfig(row.payload);
        if (row.key === APP_CONFIG_KEYS.updateNotice)
            saveUpdateNoticeConfig(row.payload);
        if (row.key === APP_CONFIG_KEYS.emailTemplate)
            saveEmailTemplateConfig(row.payload);
    });
    return normalized;
}
async function fetchAppConfigsFromConvex() {
    const cloudflareRows = await fetchAppConfigsFromCloudflare();
    if (cloudflareRows !== null)
        return cloudflareRows;
    const netlifyRows = await fetchAppConfigsFromNetlify();
    if (netlifyRows !== null)
        return netlifyRows;
    const supabaseRows = await fetchAppConfigsFromSupabase();
    if (supabaseRows !== null)
        return supabaseRows;
    const config = getConvexConfig();
    if (!convexEnabled())
        return null;
    try {
        const queryName = config.appConfigListQuery || 'appSettings:listConfigs';
        const rows = await runConvexQuery(queryName, { keys: [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice, APP_CONFIG_KEYS.emailTemplate] });
        if (rows !== null)
            return normalizeRemoteAppConfigRows(rows);
    }
    catch (error) {
        console.warn('Convex app config query gagal:', error);
    }
    return null;
}
async function syncAppConfigToConvex(key, payload) {
    clearRemoteSyncError();
    if (cloudflareEnabled())
        return await syncAppConfigToCloudflare(key, payload);
    if (await syncAppConfigToNetlify(key, payload))
        return true;
    if (await syncAppConfigToSupabase(key, payload))
        return true;
    const config = getConvexConfig();
    if (!convexEnabled() || !key)
        return false;
    try {
        await runConvexMutation(config.appConfigSetMutation || 'appSettings:setConfig', {
            key,
            payload,
            updatedBy: SESSION_ID
        });
        return true;
    }
    catch (error) {
        console.warn('Convex app config sync gagal:', error);
        return false;
    }
}
function syncWelcomeConfigToConvex(config) {
    return syncAppConfigToConvex(APP_CONFIG_KEYS.welcome, normalizeWelcomeConfigPayload(config));
}
function syncUpdateNoticeConfigToConvex(config) {
    return syncAppConfigToConvex(APP_CONFIG_KEYS.updateNotice, normalizeUpdateNoticeConfig(config));
}
function syncEmailTemplateConfigToConvex(config) {
    return syncAppConfigToConvex(APP_CONFIG_KEYS.emailTemplate, normalizeEmailTemplateConfig(config));
}
function normalizeWelcomeConfigPayload(config) {
    return {
        title: cleanText(config && config.title, DEFAULT_WELCOME_CONFIG.title),
        subtitle: cleanText(config && config.subtitle, DEFAULT_WELCOME_CONFIG.subtitle),
        durationSeconds: normalizeWelcomeDurationSeconds(config && config.durationSeconds)
    };
}
function exportJson(data, fileName) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, fileName);
}
function WelcomePinkySwearArt() {
    return (React.createElement("div", { className: "pinky-swear-art", role: "img", "aria-label": "Animasi pinky swear dua tangan saling mendekat" },
        React.createElement("span", { className: "pinky-art-texture texture-a" }),
        React.createElement("span", { className: "pinky-art-texture texture-b" }),
        React.createElement("span", { className: "pinky-art-spark spark-a" }),
        React.createElement("span", { className: "pinky-art-spark spark-b" }),
        React.createElement("span", { className: "pinky-art-spark spark-c" }),
        React.createElement("span", { className: "pinky-art-heart" }),
        React.createElement("div", { className: "pinky-hand pinky-hand-left" },
            React.createElement("span", { className: "pinky-palm" }),
            React.createElement("span", { className: "pinky-finger thumb" }),
            React.createElement("span", { className: "pinky-finger index" }),
            React.createElement("span", { className: "pinky-finger middle" }),
            React.createElement("span", { className: "pinky-finger ring" }),
            React.createElement("span", { className: "pinky-finger pinky" }),
            React.createElement("span", { className: "pinky-cuff" })),
        React.createElement("div", { className: "pinky-hand pinky-hand-right" },
            React.createElement("span", { className: "pinky-palm" }),
            React.createElement("span", { className: "pinky-finger thumb" }),
            React.createElement("span", { className: "pinky-finger index" }),
            React.createElement("span", { className: "pinky-finger middle" }),
            React.createElement("span", { className: "pinky-finger ring" }),
            React.createElement("span", { className: "pinky-finger pinky" }),
            React.createElement("span", { className: "pinky-cuff" })),
        React.createElement("span", { className: "pinky-hook-glow" })));
}
function WelcomeSparkStarArt() {
    return (React.createElement("div", { className: "welcome-spark-star-art", role: "img", "aria-label": "Animasi spark star" },
        React.createElement("span", { className: "spark-star-core" }),
        React.createElement("span", { className: "spark-star-small spark-a" }),
        React.createElement("span", { className: "spark-star-small spark-b" }),
        React.createElement("span", { className: "spark-star-small spark-c" }),
        React.createElement("span", { className: "spark-star-ring ring-a" }),
        React.createElement("span", { className: "spark-star-ring ring-b" })));
}
function WelcomeOverlay({ config, onDone }) {
    const title = cleanText(config && config.title, DEFAULT_WELCOME_CONFIG.title);
    const subtitle = cleanText(config && config.subtitle, DEFAULT_WELCOME_CONFIG.subtitle);
    const durationSeconds = normalizeWelcomeDurationSeconds(config && config.durationSeconds);
    const durationMs = Math.round(durationSeconds * 1000);
    const cardRef = useRef(null);
    const onDoneRef = useRef(onDone);
    const doneRef = useRef(false);
    const [closing, setClosing] = useState(false);
    useEffect(() => {
        onDoneRef.current = onDone;
    }, [onDone]);
    useEffect(() => {
        doneRef.current = false;
        setClosing(false);
        const timer = window.setTimeout(finishWelcome, durationMs + 120);
        return () => window.clearTimeout(timer);
    }, [durationMs]);
    function finishWelcome() {
        if (doneRef.current)
            return;
        doneRef.current = true;
        setClosing(true);
        window.setTimeout(() => {
            if (typeof onDoneRef.current === 'function')
                onDoneRef.current();
        }, 340);
    }
    function handlePointerMove(event) {
        const card = cardRef.current;
        if (!card)
            return;
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) - 0.5;
        const y = ((event.clientY - rect.top) / rect.height) - 0.5;
        card.style.setProperty('--tilt-x', `${(-y * 5).toFixed(2)}deg`);
        card.style.setProperty('--tilt-y', `${(x * 6).toFixed(2)}deg`);
        card.style.setProperty('--glow-x', `${(x + 0.5) * 100}%`);
        card.style.setProperty('--glow-y', `${(y + 0.5) * 100}%`);
    }
    function resetPointerTilt() {
        const card = cardRef.current;
        if (!card)
            return;
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
        card.style.setProperty('--glow-x', '50%');
        card.style.setProperty('--glow-y', '50%');
    }
    return (React.createElement("div", { className: cx("welcome-dream-overlay", closing && "is-closing"), role: "dialog", "aria-modal": "true", style: {
            '--welcome-duration': String(durationSeconds) + 's',
            position: 'fixed',
            inset: 0,
            zIndex: 95,
            display: 'grid',
            placeItems: 'center',
            padding: '24px',
            overflow: 'hidden',
            background: '#ededed',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            animation: closing ? 'rbvWelcomeOverlayOut .34s cubic-bezier(.22,1,.36,1) forwards' : 'rbvWelcomeOverlayIn .38s cubic-bezier(.22,1,.36,1) both'
        } },
        React.createElement("style", null, `@keyframes rbvWelcomeOverlayIn{from{opacity:0}to{opacity:1}} @keyframes rbvWelcomeOverlayOut{from{opacity:1;backdrop-filter:blur(0)}to{opacity:0;backdrop-filter:blur(6px)}} @keyframes rbvWelcomeAura{0%,100%{transform:translate3d(-10px,0,0) scale(1);opacity:.38}50%{transform:translate3d(10px,-8px,0) scale(1.05);opacity:.62}} @keyframes rbvWelcomeFloat{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-8px,0)}} @keyframes rbvWelcomeShine{0%{transform:translateX(-115%) rotate(14deg)}100%{transform:translateX(115%) rotate(14deg)}} @keyframes rbvWelcomeTextIn{0%{opacity:0;transform:translate3d(0,14px,0) scale(.98)}100%{opacity:1;transform:translate3d(0,0,0) scale(1)}} @keyframes rbvWelcomeProgress{from{width:0%}to{width:100%}} @keyframes rbvWelcomeSpark{0%,100%{transform:scale(.92) rotate(0deg)}50%{transform:scale(1) rotate(10deg)}} @keyframes rbvPromiseFloat{0%,100%{transform:translate3d(0,0,0) rotate(-1deg)}50%{transform:translate3d(0,-4px,0) rotate(1deg)}} @keyframes rbvPromiseHook{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-1px) scale(1.035)}} @keyframes rbvPromiseDot{0%,100%{transform:scale(.86);opacity:.52}50%{transform:scale(1.1);opacity:.9}}`),
        React.createElement("div", { "aria-hidden": "true", style: { position: 'absolute', inset: 0, background: 'radial-gradient(circle at 18% 18%, rgba(15,118,110,.08), transparent 34%), radial-gradient(circle at 80% 20%, rgba(20,184,166,.10), transparent 30%), radial-gradient(circle at 50% 78%, rgba(148,163,184,.16), transparent 26%)', pointerEvents: 'none' } }),
        React.createElement("div", { "aria-hidden": "true", style: { position: 'absolute', width: 220, height: 220, borderRadius: '999px', left: '-72px', top: '12%', background: 'rgba(15,118,110,.10)', filter: 'blur(24px)', animation: 'rbvWelcomeAura 5.5s ease-in-out infinite' } }),
        React.createElement("div", { "aria-hidden": "true", style: { position: 'absolute', width: 260, height: 260, borderRadius: '999px', right: '-92px', bottom: '12%', background: 'rgba(20,184,166,.10)', filter: 'blur(28px)', animation: 'rbvWelcomeAura 6.2s ease-in-out infinite reverse' } }),
        React.createElement("div", { ref: cardRef, className: "welcome-dream-card", onPointerMove: handlePointerMove, onPointerLeave: resetPointerTilt, style: {
                '--tilt-x': '0deg',
                '--tilt-y': '0deg',
                '--glow-x': '50%',
                '--glow-y': '50%',
                position: 'relative',
                width: 'min(92vw, 430px)',
                borderRadius: '36px',
                padding: '1px',
                background: 'linear-gradient(135deg, rgba(255,255,255,.92), rgba(203,213,225,.66), rgba(255,255,255,.72))',
                boxShadow: '0 24px 60px rgba(15,23,42,.16)',
                transform: 'perspective(900px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) translateZ(0)',
                transition: 'transform 220ms cubic-bezier(.22,1,.36,1)',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
            } },
            React.createElement("div", { style: { position: 'relative', overflow: 'hidden', borderRadius: '35px', padding: '28px 24px 24px', background: '#ededed' } },
                React.createElement("div", { "aria-hidden": "true", style: { position: 'absolute', inset: 0, backgroundColor: '#ededed', backgroundImage: 'url("icons/welcome-handshake-bg.jpg")', backgroundPosition: 'center center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', opacity: 0.28, mixBlendMode: 'multiply', pointerEvents: 'none' } }),
                React.createElement("div", { "aria-hidden": "true", style: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(237,237,237,.72), rgba(237,237,237,.88) 32%, rgba(237,237,237,.94) 100%), radial-gradient(circle at var(--glow-x) var(--glow-y), rgba(255,255,255,.55), transparent 34%)', pointerEvents: 'none', transition: 'background 160ms ease' } }),
                React.createElement("div", { "aria-hidden": "true", style: { position: 'absolute', top: '-30%', bottom: '-30%', left: 0, width: '58%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.42), transparent)', animation: 'rbvWelcomeShine 3.4s cubic-bezier(.22,1,.36,1) infinite', pointerEvents: 'none' } }),
                React.createElement("div", { className: "welcome-dream-content", style: { position: 'relative', display: 'flex', minHeight: 250, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', animation: 'rbvWelcomeFloat 4.8s ease-in-out infinite' } },
                    React.createElement("div", { "aria-hidden": "true", className: "welcome-app-logo-motion-v99", style: { display: 'grid', placeItems: 'center', width: 120, height: 120, borderRadius: '34px', overflow: 'visible', background: 'rgba(255,255,255,.74)', border: '1px solid rgba(255,255,255,.85)', boxShadow: '0 16px 34px rgba(15,23,42,.10)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', animation: 'rbvWelcomeSpark 3s ease-in-out infinite' } },
                        React.createElement("span", { className: "welcome-logo-ring-v99 ring-a" }),
                        React.createElement("span", { className: "welcome-logo-ring-v99 ring-b" }),
                        React.createElement("img", { src: "icons/icon-192.png", alt: "", className: "welcome-app-icon-v99" })),
                    React.createElement("p", { className: "welcome-kicker", style: { marginTop: 18, fontSize: 11, fontWeight: 900, letterSpacing: '.24em', textTransform: 'uppercase', color: '#0f766e', animation: 'rbvWelcomeTextIn .62s cubic-bezier(.22,1,.36,1) both' } }, "Bestie Visit"),
                    React.createElement("h1", { style: { marginTop: 8, maxWidth: '100%', fontSize: 'clamp(28px, 8vw, 44px)', lineHeight: .95, fontWeight: 950, letterSpacing: '-.055em', color: '#020617', textShadow: '0 1px 0 rgba(255,255,255,.45)', animation: 'rbvWelcomeTextIn .72s cubic-bezier(.22,1,.36,1) .08s both' } }, title),
                    React.createElement("p", { className: "welcome-subtitle", style: { marginTop: 14, maxWidth: 330, fontSize: 14, fontWeight: 700, lineHeight: 1.55, color: '#334155', animation: 'rbvWelcomeTextIn .72s cubic-bezier(.22,1,.36,1) .16s both' } }, subtitle),
                    React.createElement("div", { "aria-hidden": "true", style: { marginTop: 24, height: 7, width: 'min(260px, 78%)', overflow: 'hidden', borderRadius: '999px', background: 'rgba(15,118,110,.12)' } },
                        React.createElement("span", { onAnimationEnd: (event) => { if (event.animationName === 'rbvWelcomeProgress')
                                finishWelcome(); }, style: { display: 'block', height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #0f766e, #14b8a6, #22c55e)', animation: `rbvWelcomeProgress ${durationSeconds}s linear forwards` } })))))));
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
        setTimeout(() => inputRef.current?.focus(), 60);
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
    const [presenceRows, setPresenceRows] = useState([]);
    const [connectionState, setConnectionState] = useState('offline');
    const [lastSync, setLastSync] = useState('');
    const [welcomeTitle, setWelcomeTitle] = useState(DEFAULT_WELCOME_CONFIG.title);
    const [welcomeSubtitle, setWelcomeSubtitle] = useState(DEFAULT_WELCOME_CONFIG.subtitle);
    const [welcomeDurationSeconds, setWelcomeDurationSeconds] = useState(DEFAULT_WELCOME_CONFIG.durationSeconds);
    const [pdfTableFontSize, setPdfTableFontSize] = useState(DEFAULT_PDF_SETTINGS.tableFontSize);
    const [pdfTableTitleFontSize, setPdfTableTitleFontSize] = useState(DEFAULT_PDF_SETTINGS.tableTitleFontSize);
    const [pdfEvidenceFontSize, setPdfEvidenceFontSize] = useState(DEFAULT_PDF_SETTINGS.evidenceFontSize);
    const [pdfTableExtraRows, setPdfTableExtraRows] = useState(DEFAULT_PDF_SETTINGS.tableExtraRows);
    const [pdfPhotoGridPerPage, setPdfPhotoGridPerPage] = useState(DEFAULT_PDF_SETTINGS.photoGridPerPage);
    const [assignmentLink, setAssignmentLink] = useState(DEFAULT_ASSIGNMENT_LINK);
    const [noticeEnabled, setNoticeEnabled] = useState(DEFAULT_UPDATE_NOTICE_CONFIG.enabled);
    const [noticeTitle, setNoticeTitle] = useState(DEFAULT_UPDATE_NOTICE_CONFIG.title);
    const [noticeMessagesText, setNoticeMessagesText] = useState(DEFAULT_UPDATE_NOTICE_CONFIG.messages.join('\n'));
    const [noticeIntervalSeconds, setNoticeIntervalSeconds] = useState(DEFAULT_UPDATE_NOTICE_CONFIG.intervalSeconds);
    const [secretTab, setSecretTab] = useState('settings');
    const [emailDirectory, setEmailDirectory] = useState(() => readCustomEmailDirectory());
    const [emailDirectoryDraft, setEmailDirectoryDraft] = useState({ name: '', email: '', role: '', store: '' });
    const [emailSubjectTemplate, setEmailSubjectTemplate] = useState(() => readEmailTemplateConfig().subjectTemplate);
    const [emailBodyTemplate, setEmailBodyTemplate] = useState(() => readEmailTemplateConfig().bodyTemplate);
    const [cloudflareDbStatus, setCloudflareDbStatus] = useState('');
    const [cloudflareDbBusy, setCloudflareDbBusy] = useState(false);
    async function saveWelcomeSettings() {
        const saved = saveWelcomeConfig({ title: welcomeTitle, subtitle: welcomeSubtitle, durationSeconds: welcomeDurationSeconds });
        if (typeof onWelcomeConfigChange === 'function')
            onWelcomeConfigChange(saved);
        const synced = await syncWelcomeConfigToConvex(saved);
        alert(synced ? remoteSaveSuccessText('Text welcome') : remoteSaveFailText('Text welcome'));
    }
    function saveAssignmentSettings() {
        const saved = saveAssignmentLinkConfig(assignmentLink);
        setAssignmentLink(saved);
        alert('Assignment link berhasil disimpan.');
    }
    function saveEmailDirectoryItem() {
        const item = {
            id: String(Date.now()) + '-' + Math.random().toString(16).slice(2),
            name: cleanText(emailDirectoryDraft.name),
            email: cleanText(emailDirectoryDraft.email).toLowerCase(),
            role: cleanText(emailDirectoryDraft.role),
            store: cleanText(emailDirectoryDraft.store)
        };
        if (!isEmailSyntax(item.email)) {
            alert('Format email belum valid.');
            return;
        }
        const saved = saveCustomEmailDirectory([item, ...emailDirectory]);
        setEmailDirectory(saved);
        setEmailDirectoryDraft({ name: '', email: '', role: '', store: '' });
        alert('Email directory berhasil ditambahkan.');
    }
    function deleteEmailDirectoryItem(id) {
        const saved = saveCustomEmailDirectory(emailDirectory.filter((item) => item.id !== id));
        setEmailDirectory(saved);
    }

    async function saveEmailTemplateSettings() {
        const saved = saveEmailTemplateConfig({ subjectTemplate: emailSubjectTemplate, bodyTemplate: emailBodyTemplate });
        setEmailSubjectTemplate(saved.subjectTemplate);
        setEmailBodyTemplate(saved.bodyTemplate);
        const synced = await syncEmailTemplateConfigToConvex(saved);
        alert(synced ? remoteSaveSuccessText('Template email') : remoteSaveFailText('Template email'));
    }
    function resetEmailTemplateSettings() {
        const saved = saveEmailTemplateConfig({ subjectTemplate: DEFAULT_EMAIL_SUBJECT_TEMPLATE, bodyTemplate: DEFAULT_EMAIL_BODY_TEMPLATE });
        setEmailSubjectTemplate(saved.subjectTemplate);
        setEmailBodyTemplate(saved.bodyTemplate);
        alert('Template email dikembalikan ke default.');
    }
    async function testCloudflareD1Panel() {
        if (cloudflareDbBusy)
            return;
        setCloudflareDbBusy(true);
        setCloudflareDbStatus('Mengecek koneksi Cloudflare D1 langsung ke endpoint aktif...');
        try {
            const payload = await cloudflareRequest('listAppSettings', { params: { keys: [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice, APP_CONFIG_KEYS.emailTemplate].join(',') } });
            const rows = payload?.rows || payload?.data || [];
            const count = Array.isArray(rows) ? rows.length : 0;
            setCloudflareDbStatus(`Cloudflare D1 AKTIF & TERKONEKSI. App settings terbaca: ${count} item. Endpoint sudah valid.`);
        }
        catch (error) {
            setCloudflareDbStatus(`Cloudflare D1 belum terbaca di frontend: ${error?.message || 'request gagal.'}. Jika endpoint manual sudah OK, tutup web lalu buka ulang dengan ?v=102.`);
        }
        finally {
            setCloudflareDbBusy(false);
        }
    }
    async function syncHistoryToCloudflarePanel() {
        if (cloudflareDbBusy)
            return;
        setCloudflareDbBusy(true);
        setCloudflareDbStatus('Mengirim history lokal ke Cloudflare D1...');
        try {
            const visits = await getAllVisitRecordsForBackup();
            let success = 0;
            for (const item of visits) {
                if (await upsertMonitorVisitToCloudflare(item))
                    success += 1;
            }
            setCloudflareDbStatus(`Sync Cloudflare selesai. ${success}/${visits.length} history terkirim.`);
            refresh({ quiet: true });
        }
        catch (error) {
            setCloudflareDbStatus(`Sync Cloudflare gagal: ${error?.message || 'unknown error.'}`);
        }
        finally {
            setCloudflareDbBusy(false);
        }
    }
    async function saveNoticeSettings() {
        const saved = saveUpdateNoticeConfig({
            enabled: noticeEnabled,
            title: noticeTitle,
            messages: normalizeUpdateNoticeMessages(noticeMessagesText),
            intervalSeconds: noticeIntervalSeconds
        });
        setNoticeEnabled(saved.enabled);
        setNoticeTitle(saved.title);
        setNoticeMessagesText(saved.messages.join('\n'));
        setNoticeIntervalSeconds(saved.intervalSeconds);
        const synced = await syncUpdateNoticeConfigToConvex(saved);
        alert(synced ? remoteSaveSuccessText('Informasi update HOME') : remoteSaveFailText('Informasi update HOME'));
    }
    function applyPdfSettings(nextSettings, showAlert = false) {
        const saved = savePdfSettings(nextSettings);
        setPdfTableFontSize(saved.tableFontSize);
        setPdfTableTitleFontSize(saved.tableTitleFontSize);
        setPdfEvidenceFontSize(saved.evidenceFontSize);
        setPdfTableExtraRows(saved.tableExtraRows);
        setPdfPhotoGridPerPage(saved.photoGridPerPage);
        window.dispatchEvent(new CustomEvent('rbv-pdf-settings-change', { detail: saved }));
        if (showAlert)
            alert('Pengaturan PDF berhasil disimpan.');
        return saved;
    }
    function adjustPdfSetting(key, delta) {
        const current = normalizePdfSettings({ tableFontSize: pdfTableFontSize, tableTitleFontSize: pdfTableTitleFontSize, evidenceFontSize: pdfEvidenceFontSize, tableExtraRows: pdfTableExtraRows, photoGridPerPage: pdfPhotoGridPerPage });
        applyPdfSettings({ ...current, [key]: Number(current[key]) + delta });
    }
    function setPdfPhotoGrid(value) {
        const current = normalizePdfSettings({ tableFontSize: pdfTableFontSize, tableTitleFontSize: pdfTableTitleFontSize, evidenceFontSize: pdfEvidenceFontSize, tableExtraRows: pdfTableExtraRows, photoGridPerPage: pdfPhotoGridPerPage });
        applyPdfSettings({ ...current, photoGridPerPage: value });
    }
    function resetPdfSettings() {
        applyPdfSettings(DEFAULT_PDF_SETTINGS, true);
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
            const [remoteRowsResult, remoteRequestsResult, presenceRowsResult] = await Promise.allSettled([
                fetchMonitorRowsFromConvex(),
                fetchManualRequestsFromConvex(),
                fetchPresenceRowsFromConvex()
            ]);
            const remoteRows = remoteRowsResult.status === 'fulfilled' ? remoteRowsResult.value : null;
            const remoteRequests = remoteRequestsResult.status === 'fulfilled' ? remoteRequestsResult.value : null;
            const remotePresence = presenceRowsResult.status === 'fulfilled' ? presenceRowsResult.value : null;
            if (remoteRows !== null) {
                applyRows(remoteRows, cloudflareEnabled() ? 'cloudflare' : (netlifyEnabled() ? 'netlify' : (supabaseEnabled() ? 'supabase' : (source === 'convex realtime' ? 'convex realtime' : 'convex'))));
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
            if (remotePresence !== null) {
                setPresenceRows(normalizePresenceRows(remotePresence));
            }
            else {
                setPresenceRows(readLocalPresenceRows());
            }
        }
        catch (error) {
            applyRows(localRows(), 'local');
            setManualRequests(readManualStoreRequests());
            setPresenceRows(readLocalPresenceRows());
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
        setWelcomeDurationSeconds(normalizeWelcomeDurationSeconds(currentWelcome.durationSeconds));
        const currentPdfSettings = readPdfSettings();
        setPdfTableFontSize(currentPdfSettings.tableFontSize);
        setPdfTableTitleFontSize(currentPdfSettings.tableTitleFontSize);
        setPdfEvidenceFontSize(currentPdfSettings.evidenceFontSize);
        setPdfTableExtraRows(currentPdfSettings.tableExtraRows);
        setPdfPhotoGridPerPage(currentPdfSettings.photoGridPerPage);
        setAssignmentLink(readAssignmentLinkConfig());
        const currentNotice = readUpdateNoticeConfig();
        setNoticeEnabled(currentNotice.enabled);
        setNoticeTitle(currentNotice.title);
        setNoticeMessagesText(currentNotice.messages.join('\n'));
        setNoticeIntervalSeconds(currentNotice.intervalSeconds);
        setSecretTab('settings');
        let cancelled = false;
        let unsubscribeRows = null;
        let unsubscribeRequests = null;
        let unsubscribePresence = null;
        let unsubscribeConnection = null;
        let pollId = null;
        async function startRealtime() {
            setLoading(true);
            setManualRequests(readManualStoreRequests());
            setPresenceRows(readLocalPresenceRows());
            try {
                if (cloudflareEnabled() || netlifyEnabled() || supabaseEnabled()) {
                    setConnectionState('online');
                    await refresh();
                    pollId = window.setInterval(() => refresh({ quiet: true }), getRemotePollMs());
                    return;
                }
                const client = await getConvexRealtimeClient();
                if (cancelled)
                    return;
                if (client) {
                    setConnectionState('connecting');
                    if (typeof client.subscribeToConnectionState === 'function') {
                        unsubscribeConnection = client.subscribeToConnectionState((state) => {
                            const status = state?.hasInflightRequests ? 'syncing' : state?.isWebSocketConnected ? 'online' : 'connecting';
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
                    unsubscribePresence = await subscribeConvexQuery(getConvexConfig().presenceQuery || 'monitor:listPresence', {}, (nextPresenceRows) => {
                        if (cancelled)
                            return;
                        setPresenceRows(normalizePresenceRows(nextPresenceRows));
                        setConnectionState('online');
                        setLoading(false);
                    }, (error) => {
                        console.warn('Realtime presence gagal:', error);
                        if (!cancelled)
                            setPresenceRows(readLocalPresenceRows());
                    });
                }
                if (!unsubscribeRows && !unsubscribeRequests && !unsubscribePresence) {
                    await refresh();
                    pollId = window.setInterval(() => refresh({ quiet: true }), getRemotePollMs());
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
                    pollId = window.setInterval(() => refresh({ quiet: true }), getRemotePollMs());
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
                unsubscribeRows?.();
            }
            catch (error) { }
            try {
                unsubscribeRequests?.();
            }
            catch (error) { }
            try {
                unsubscribePresence?.();
            }
            catch (error) { }
            try {
                unsubscribeConnection?.();
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
    const onlinePresence = normalizePresenceRows(presenceRows).filter((row) => row.is_online);
    const uniqueBesties = new Set(rows.map((row) => normalize(row.bestie_name)).filter(Boolean)).size;
    const today = new Date().toISOString().slice(0, 10);
    const todayVisits = rows.filter((row) => String(row.visit_date || '').slice(0, 10) === today).length;
    const isLive = source === 'cloudflare' || source === 'netlify' || source === 'supabase' || source === 'convex realtime';
    const sourceBadgeLabel = source === 'cloudflare' ? 'Cloudflare D1' : source === 'netlify' ? 'Netlify Sync' : source === 'supabase' ? 'Supabase Sync' : source === 'convex realtime' ? 'Live Convex' : 'Manual refresh';
    const connectionTone = connectionState === 'online' ? 'success' : connectionState === 'error' || connectionState === 'fallback' ? 'warning' : 'default';
    return (React.createElement("div", { className: "secret-admin-backdrop fixed inset-0 z-[85] overflow-auto bg-slate-950/65 p-3 backdrop-blur-sm md:p-6", role: "dialog", "aria-modal": "true" },
        React.createElement("div", { className: "secret-admin-panel mx-auto max-w-6xl rounded-[32px] bg-white p-5 shadow-2xl md:p-7" },
            React.createElement("div", { className: "mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between" },
                React.createElement("div", null,
                    React.createElement("div", { className: "flex flex-wrap items-center gap-2" },
                        React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary" }, "Panel Rahasia Admin"),
                        secretTab === 'monitoring' ? React.createElement(Badge, { tone: isLive ? 'success' : 'default' }, sourceBadgeLabel) : React.createElement(Badge, { tone: "default" }, "Setting Web"),
                        secretTab === 'monitoring' ? React.createElement(Badge, { tone: connectionTone }, connectionState) : null),
                    React.createElement("h2", { className: "mt-2 text-2xl font-black text-slate-950" }, secretTab === 'monitoring' ? 'Monitoring Bestie Realtime' : 'Setting Web & PDF'),
                    secretTab === 'monitoring' && lastSync ? React.createElement("p", { className: "mt-1 text-xs font-semibold text-slate-500" },
                        "Update terakhir: ",
                        formatDateTime(lastSync)) : null),
                React.createElement("div", { className: "flex flex-wrap gap-2" },
                    secretTab === 'monitoring' ? React.createElement(Button, { variant: "secondary", icon: "download", onClick: () => exportJson(rows, 'regional-bestie-monitor.json') }, "Export JSON") : null,
                    secretTab === 'monitoring' ? React.createElement(Button, { variant: "secondary", icon: "spark", onClick: () => refresh(), disabled: loading }, loading ? 'Sync...' : 'Refresh') : null,
                    React.createElement(Button, { variant: "icon", onClick: onClose, "aria-label": "Tutup" },
                        React.createElement(Icon, { name: "close", className: "h-4 w-4" })))),
            React.createElement("div", { className: "secret-panel-tabs mb-5 grid grid-cols-2 gap-2 rounded-3xl bg-slate-100 p-1" },
                React.createElement("button", { type: "button", className: cx('secret-panel-tab', secretTab === 'settings' && 'active'), onClick: () => setSecretTab('settings') },
                    React.createElement(Icon, { name: "settings", className: "h-4 w-4" }),
                    React.createElement("span", null, "Setting Web")),
                React.createElement("button", { type: "button", className: cx('secret-panel-tab', secretTab === 'monitoring' && 'active'), onClick: () => setSecretTab('monitoring') },
                    React.createElement(Icon, { name: "history", className: "h-4 w-4" }),
                    React.createElement("span", null, "Monitoring"))),
            secretTab === 'settings' ? (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "mb-5 rounded-3xl border border-cyan-100 bg-cyan-50/70 p-4" },
                    React.createElement("div", { className: "mb-3 flex items-center justify-between gap-3" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.18em] text-audit-primary" }, "Welcome Animation"),
                            React.createElement("h3", { className: "text-lg font-black text-slate-950" }, "Edit Welcome")),
                        React.createElement(Button, { variant: "secondary", icon: "check", onClick: saveWelcomeSettings }, "Simpan Welcome")),
                    React.createElement("div", { className: "grid gap-3 md:grid-cols-3" },
                        React.createElement(Field, { label: "Head title" },
                            React.createElement(TextInput, { value: welcomeTitle, onChange: (event) => setWelcomeTitle(event.target.value), placeholder: DEFAULT_WELCOME_CONFIG.title })),
                        React.createElement(Field, { label: "Sub title" },
                            React.createElement(TextArea, { value: welcomeSubtitle, onChange: (event) => setWelcomeSubtitle(event.target.value), minRows: 2, placeholder: DEFAULT_WELCOME_CONFIG.subtitle })),
                        React.createElement(Field, { label: "Durasi (detik)", helper: "Bisa diisi 1 sampai 15 detik." },
                            React.createElement(TextInput, { type: "number", min: "1", max: "15", step: "0.5", value: welcomeDurationSeconds, onChange: (event) => setWelcomeDurationSeconds(event.target.value), onBlur: () => setWelcomeDurationSeconds(normalizeWelcomeDurationSeconds(welcomeDurationSeconds)) })))),
                React.createElement("div", { className: "mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-4" },
                    React.createElement("div", { className: "mb-3 flex items-center justify-between gap-3" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.18em] text-audit-primary" }, "Hidden Control"),
                            React.createElement("h3", { className: "text-lg font-black text-slate-950" }, "Assignment Link")),
                        React.createElement(Button, { variant: "secondary", icon: "check", onClick: saveAssignmentSettings }, "Simpan Link")),
                    React.createElement(Field, { label: "Link corrective action assignment", helper: "Button assignment di form audit sudah dihapus. Link ini dipakai otomatis di PDF." },
                        React.createElement(TextInput, { type: "url", value: assignmentLink, onChange: (event) => setAssignmentLink(event.target.value), placeholder: DEFAULT_ASSIGNMENT_LINK }))),
                React.createElement("div", { className: "mb-5 rounded-3xl border border-indigo-100 bg-indigo-50/70 p-4" },
                    React.createElement("div", { className: "mb-3 flex items-center justify-between gap-3" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.18em] text-audit-primary" }, "Email Directory"),
                            React.createElement("h3", { className: "text-lg font-black text-slate-950" }, "Tambah Nama Email")),
                        React.createElement(Button, { variant: "secondary", icon: "plus", onClick: saveEmailDirectoryItem }, "Add Email")),
                    React.createElement("div", { className: "grid gap-3 md:grid-cols-4" },
                        React.createElement(Field, { label: "Nama" },
                            React.createElement(TextInput, { value: emailDirectoryDraft.name, onChange: (event) => setEmailDirectoryDraft((state) => ({ ...state, name: event.target.value })), placeholder: "Nama opsional" })),
                        React.createElement(Field, { label: "Email" },
                            React.createElement(TextInput, { type: "email", value: emailDirectoryDraft.email, onChange: (event) => setEmailDirectoryDraft((state) => ({ ...state, email: event.target.value })), placeholder: "email@domain.com" })),
                        React.createElement(Field, { label: "Role" },
                            React.createElement(TextInput, { value: emailDirectoryDraft.role, onChange: (event) => setEmailDirectoryDraft((state) => ({ ...state, role: event.target.value })), placeholder: "Store / AM / RM" })),
                        React.createElement(Field, { label: "Store" },
                            React.createElement(TextInput, { value: emailDirectoryDraft.store, onChange: (event) => setEmailDirectoryDraft((state) => ({ ...state, store: event.target.value })), placeholder: "Nama store" }))),
                    React.createElement("div", { className: "mt-3 grid gap-2 md:grid-cols-2" },
                        emailDirectory.length ? emailDirectory.map((item) => React.createElement("div", { key: item.id, className: "flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2 ring-1 ring-indigo-100" },
                            React.createElement("div", { className: "min-w-0" },
                                React.createElement("p", { className: "truncate text-xs font-black text-slate-900" }, item.email),
                                React.createElement("p", { className: "truncate text-[11px] font-semibold text-slate-500" }, cleanText([item.store, item.role].filter(Boolean).join(' • '), 'Email Directory'))),
                            React.createElement("button", { type: "button", className: "grid h-8 w-8 place-items-center rounded-full text-rose-500 transition hover:bg-rose-50", onClick: () => deleteEmailDirectoryItem(item.id), "aria-label": "Hapus email" },
                                React.createElement(Icon, { name: "trash", className: "h-4 w-4" })))) : React.createElement("p", { className: "rounded-2xl bg-white px-3 py-3 text-xs font-bold text-slate-500 ring-1 ring-indigo-100" }, "Belum ada email tambahan."))),

                React.createElement("div", { className: "mb-5 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4" },
                    React.createElement("div", { className: "mb-3 flex items-center justify-between gap-3" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.18em] text-audit-primary" }, "Email Report Template"),
                            React.createElement("h3", { className: "text-lg font-black text-slate-950" }, "Template Email Admin")),
                        React.createElement("div", { className: "flex flex-wrap gap-2" },
                            React.createElement(Button, { variant: "secondary", icon: "eraser", onClick: resetEmailTemplateSettings }, "Reset"),
                            React.createElement(Button, { variant: "secondary", icon: "check", onClick: saveEmailTemplateSettings }, "Simpan Template"))),
                    React.createElement("div", { className: "grid gap-3 md:grid-cols-[0.9fr_1.6fr]" },
                        React.createElement(Field, { label: "Subject Template", helper: "Placeholder: {store}, {date}, {bestie}, {storeHead}, {siteCode}" },
                            React.createElement(TextInput, { value: emailSubjectTemplate, onChange: (event) => setEmailSubjectTemplate(event.target.value), placeholder: DEFAULT_EMAIL_SUBJECT_TEMPLATE })),
                        React.createElement(Field, { label: "Body Template", helper: "Tanggal kunjungan dan Best Regards + nama bestie otomatis dipastikan saat email dibuat." },
                            React.createElement(TextArea, { value: emailBodyTemplate, onChange: (event) => setEmailBodyTemplate(event.target.value), minRows: 7, placeholder: DEFAULT_EMAIL_BODY_TEMPLATE })))),
                React.createElement("div", { className: "mb-5 rounded-3xl border border-sky-100 bg-sky-50/70 p-4" },
                    React.createElement("div", { className: "mb-3 flex items-center justify-between gap-3" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.18em] text-sky-700" }, "Cloudflare D1 Database"),
                            React.createElement("h3", { className: "text-lg font-black text-slate-950" }, "Panel Database Rahasia")),
                        React.createElement("div", { className: "flex flex-wrap gap-2" },
                            React.createElement(Button, { variant: "secondary", icon: "spark", onClick: testCloudflareD1Panel, disabled: cloudflareDbBusy }, cloudflareDbBusy ? 'Cek...' : 'Test D1'),
                            React.createElement(Button, { variant: "secondary", icon: "upload", onClick: syncHistoryToCloudflarePanel, disabled: cloudflareDbBusy }, "Sync History"))),
                    React.createElement("div", { className: "rounded-2xl bg-white px-4 py-3 text-xs font-bold leading-5 text-slate-600 ring-1 ring-sky-100" },
                        React.createElement("p", null, "Endpoint: ", cleanText(getCloudflareApiUrl() || getCloudflareConfig().endpoint || getCloudflareConfig().workerUrl || getCloudflareConfig().apiPath || '/api/rbv-data')),
                        React.createElement("p", { className: "mt-1 text-sky-700" }, cloudflareDbStatus || 'Endpoint manual sudah aktif. Tekan Test D1 untuk refresh status dari Cloudflare, bukan dari cache lama.'))),
                React.createElement("div", { className: "mb-5 rounded-3xl border border-teal-100 bg-teal-50/70 p-4" },
                    React.createElement("div", { className: "mb-3 flex items-center justify-between gap-3" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.18em] text-audit-primary" }, "Home Notification"),
                            React.createElement("h3", { className: "text-lg font-black text-slate-950" }, "Info Update Website")),
                        React.createElement(Button, { variant: "secondary", icon: "check", onClick: saveNoticeSettings }, "Simpan Info")),
                    React.createElement("div", { className: "grid gap-3 md:grid-cols-[0.8fr_1.4fr_0.6fr]" },
                        React.createElement(Field, { label: "Judul" },
                            React.createElement(TextInput, { value: noticeTitle, onChange: (event) => setNoticeTitle(event.target.value), placeholder: DEFAULT_UPDATE_NOTICE_CONFIG.title })),
                        React.createElement(Field, { label: "Isi slide text", helper: "Pisahkan setiap informasi dengan baris baru." },
                            React.createElement(TextArea, { value: noticeMessagesText, onChange: (event) => setNoticeMessagesText(event.target.value), minRows: 3, placeholder: DEFAULT_UPDATE_NOTICE_CONFIG.messages.join('\n') })),
                        React.createElement("div", { className: "grid gap-3" },
                            React.createElement(Field, { label: "Interval", helper: "2 sampai 15 detik" },
                                React.createElement(TextInput, { type: "number", min: "2", max: "15", step: "0.5", value: noticeIntervalSeconds, onChange: (event) => setNoticeIntervalSeconds(event.target.value), onBlur: () => setNoticeIntervalSeconds(normalizeUpdateNoticeIntervalSeconds(noticeIntervalSeconds)) })),
                            React.createElement(Toggle, { checked: noticeEnabled, onChange: setNoticeEnabled, label: noticeEnabled ? 'Tampil di HOME' : 'Sembunyikan' })))),
                React.createElement("div", { className: "mb-5 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4" },
                    React.createElement("div", { className: "mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between" },
                        React.createElement("div", null,
                            React.createElement("h3", { className: "text-lg font-black text-slate-950" }, "Pengaturan PDF"),
                            React.createElement("p", { className: "text-xs font-semibold text-slate-500" }, "Atur ukuran isi table, title field seperti Temuan/Kondisi Ideal, jarak title ke isi konten, deskripsi foto, dan grid foto per halaman PDF.")),
                        React.createElement(Badge, { tone: "success" }, "Auto Save")),
                    React.createElement("div", { className: "grid gap-3 md:grid-cols-5" },
                        React.createElement("div", { className: "rounded-2xl bg-white p-3 ring-1 ring-emerald-100" },
                            React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-wide text-slate-500" }, "Font Isi Table PDF"),
                            React.createElement("div", { className: "mt-3 flex items-center justify-between gap-2" },
                                React.createElement(Button, { variant: "secondary", onClick: () => adjustPdfSetting('tableFontSize', -0.5) }, "-"),
                                React.createElement("strong", { className: "text-lg text-slate-950" }, Number(pdfTableFontSize).toFixed(1)),
                                React.createElement(Button, { variant: "secondary", onClick: () => adjustPdfSetting('tableFontSize', 0.5) }, "+"))),
                        React.createElement("div", { className: "rounded-2xl bg-white p-3 ring-1 ring-emerald-100" },
                            React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-wide text-slate-500" }, "Font Title Field PDF"),
                            React.createElement("div", { className: "mt-3 flex items-center justify-between gap-2" },
                                React.createElement(Button, { variant: "secondary", onClick: () => adjustPdfSetting('tableTitleFontSize', -0.5) }, "-"),
                                React.createElement("strong", { className: "text-lg text-slate-950" }, Number(pdfTableTitleFontSize).toFixed(1)),
                                React.createElement(Button, { variant: "secondary", onClick: () => adjustPdfSetting('tableTitleFontSize', 0.5) }, "+")),
                            React.createElement("p", { className: "mt-2 text-[10px] font-bold leading-4 text-emerald-700" }, "Untuk label Temuan, Kondisi Ideal, Dampak, dll. Spacing ke isi ikut menyesuaikan.")),
                        React.createElement("div", { className: "rounded-2xl bg-white p-3 ring-1 ring-emerald-100" },
                            React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-wide text-slate-500" }, "Font Deskripsi Foto"),
                            React.createElement("div", { className: "mt-3 flex items-center justify-between gap-2" },
                                React.createElement(Button, { variant: "secondary", onClick: () => adjustPdfSetting('evidenceFontSize', -0.5) }, "-"),
                                React.createElement("strong", { className: "text-lg text-slate-950" }, Number(pdfEvidenceFontSize).toFixed(1)),
                                React.createElement(Button, { variant: "secondary", onClick: () => adjustPdfSetting('evidenceFontSize', 0.5) }, "+"))),
                        React.createElement("div", { className: "rounded-2xl bg-white p-3 ring-1 ring-emerald-100" },
                            React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-wide text-slate-500" }, "Add Row Table PDF"),
                            React.createElement("div", { className: "mt-3 flex items-center justify-between gap-2" },
                                React.createElement(Button, { variant: "secondary", onClick: () => adjustPdfSetting('tableExtraRows', -1) }, "-"),
                                React.createElement("strong", { className: "text-lg text-slate-950" },
                                    "+",
                                    pdfTableExtraRows),
                                React.createElement(Button, { variant: "secondary", onClick: () => adjustPdfSetting('tableExtraRows', 1) }, "+"))),
                        React.createElement("div", { className: "rounded-2xl bg-white p-3 ring-1 ring-emerald-100" },
                            React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-wide text-slate-500" }, "Grid Foto PDF"),
                            React.createElement("div", { className: "mt-3 grid grid-cols-3 gap-1" }, [4, 6, 8].map((option) => React.createElement("button", { key: option, type: "button", className: cx('rounded-xl px-2 py-2 text-xs font-black ring-1 transition', pdfPhotoGridPerPage === option ? 'bg-audit-primary text-white ring-audit-primary' : 'bg-slate-50 text-slate-700 ring-slate-200'), onClick: () => setPdfPhotoGrid(option) }, option))),
                            React.createElement("p", { className: "mt-2 text-[10px] font-bold leading-4 text-emerald-700" }, "Rekomendasi: 6 foto/halaman."))),
                    React.createElement("div", { className: "mt-3 flex flex-wrap gap-2" },
                        React.createElement(Button, { variant: "secondary", icon: "check", onClick: () => applyPdfSettings({ tableFontSize: pdfTableFontSize, tableTitleFontSize: pdfTableTitleFontSize, evidenceFontSize: pdfEvidenceFontSize, tableExtraRows: pdfTableExtraRows, photoGridPerPage: pdfPhotoGridPerPage }, true) }, "Simpan PDF Setting"),
                        React.createElement(Button, { variant: "secondary", icon: "eraser", onClick: resetPdfSettings }, "Reset Default"))),
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
                                    React.createElement(Button, { variant: "danger", icon: "close", onClick: () => rejectRequest(item.id) }, "Reject")) : null))))) : React.createElement("div", { className: "rounded-2xl bg-white p-4 text-sm font-bold text-slate-500 ring-1 ring-slate-200" }, "Belum ada request."))))) : (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" },
                    React.createElement("div", { className: "rounded-3xl bg-slate-950 p-5 text-white" },
                        React.createElement("p", { className: "text-xs font-bold uppercase text-slate-300" }, "Source"),
                        React.createElement("p", { className: "mt-2 text-2xl font-black capitalize" }, source)),
                    React.createElement("div", { className: "rounded-3xl bg-emerald-50 p-5 text-emerald-900 ring-1 ring-emerald-100" },
                        React.createElement("p", { className: "text-xs font-bold uppercase" }, "Online"),
                        React.createElement("p", { className: "mt-2 text-3xl font-black" }, onlinePresence.length)),
                    React.createElement("div", { className: "rounded-3xl bg-cyan-50 p-5 text-cyan-900 ring-1 ring-cyan-100" },
                        React.createElement("p", { className: "text-xs font-bold uppercase" }, "Total Visit"),
                        React.createElement("p", { className: "mt-2 text-3xl font-black" }, rows.length)),
                    React.createElement("div", { className: "rounded-3xl bg-orange-50 p-5 text-orange-900 ring-1 ring-orange-100" },
                        React.createElement("p", { className: "text-xs font-bold uppercase" }, "Bestie Unik"),
                        React.createElement("p", { className: "mt-2 text-3xl font-black" }, uniqueBesties)),
                    React.createElement("div", { className: "rounded-3xl bg-slate-50 p-5 text-slate-900 ring-1 ring-slate-200" },
                        React.createElement("p", { className: "text-xs font-bold uppercase text-slate-500" }, "Visit Hari Ini"),
                        React.createElement("p", { className: "mt-2 text-3xl font-black" }, todayVisits))),
                React.createElement("div", { className: "mb-5 rounded-3xl border border-emerald-100 bg-emerald-50/80 p-4" },
                    React.createElement("div", { className: "mb-3 flex items-center justify-between gap-3" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.18em] text-audit-primary" }, "Live Presence"),
                            React.createElement("h3", { className: "text-lg font-black text-slate-950" }, "Bestie Yang Sedang Online")),
                        React.createElement(Badge, { tone: "success" }, "Realtime")),
                    React.createElement("div", { className: "grid gap-3 md:grid-cols-2" }, onlinePresence.length ? onlinePresence.map((row) => (React.createElement("div", { key: row.session_id, className: "rounded-2xl bg-white p-3 ring-1 ring-emerald-100" },
                        React.createElement("div", { className: "flex items-start justify-between gap-3" },
                            React.createElement("div", { className: "min-w-0" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("span", { className: "h-2.5 w-2.5 rounded-full bg-emerald-500", style: { boxShadow: '0 0 0 5px rgba(16,185,129,.14)' } }),
                                    React.createElement("p", { className: "truncate font-black text-slate-950" }, row.bestie_name || '-')),
                                React.createElement("p", { className: "mt-1 truncate text-xs font-bold text-slate-600" },
                                    "Store: ",
                                    row.store_name || '-'),
                                React.createElement("p", { className: "mt-1 truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400" },
                                    row.active_screen || 'home',
                                    " \u2022 ",
                                    row.store_code || '-')),
                            React.createElement(Badge, { tone: "success" }, "Online")),
                        React.createElement("p", { className: "mt-2 text-[11px] font-semibold text-slate-400" },
                            "Last seen: ",
                            formatDateTime(row.last_seen_at || row.updated_at))))) : React.createElement("div", { className: "rounded-2xl bg-white p-4 text-sm font-bold text-slate-500 ring-1 ring-emerald-100" }, "Belum ada bestie online yang terdeteksi."))),
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
                            React.createElement("td", { colSpan: "6", className: "px-4 py-10 text-center text-slate-500" }, "Tidak ada data."))))))))));
}
function DesktopSidebar({ screen, setScreen, visit, activeSection, goSection, onNewVisit, onClearData, onTitleTap }) {
    return (React.createElement("aside", { className: "desktop-sidebar hidden min-h-screen border-r border-slate-200 bg-white/86 p-4 backdrop-blur-xl md:flex md:flex-col" },
        React.createElement("button", { type: "button", onClick: onTitleTap, className: "mb-6 rounded-[28px] bg-slate-950 p-5 text-left text-white transition hover:-translate-y-0.5" },
            React.createElement("div", { className: "mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/10" },
                React.createElement(Icon, { name: "spark" })),
            React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-200" }, "Bestie Audit"),
            React.createElement("h2", { className: "mt-2 text-xl font-black leading-tight" }, "Visit Report System")),
        React.createElement("nav", { className: "space-y-2", "aria-label": "System menu" },
            React.createElement("button", { type: "button", className: cx('nav-item', screen === 'dashboard' && 'active'), onClick: () => { onTitleTap?.(); setScreen('dashboard'); } },
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
    const scrollerRef = useRef(null);
    useEffect(() => {
        if (screen !== 'audit' || !visit)
            return;
        const activeChip = scrollerRef.current?.querySelector('[data-active="true"]');
        activeChip?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }, [screen, Boolean(visit), activeSection]);
    if (screen !== 'audit' || !visit)
        return null;
    const progress = visitProgress(visit);
    const safeProgress = Math.max(0, Math.min(100, progress || 0));
    return (React.createElement("div", { className: "visit-quick-dock-v54 md:hidden", role: "navigation", "aria-label": "Quick section", style: {
            position: 'fixed',
            left: '0',
            top: 'auto',
            right: '0',
            bottom: '0',
            transform: 'none',
            zIndex: 82,
            width: '100%',
            height: 'calc(72px + env(safe-area-inset-bottom, 0px))',
            minHeight: '0',
            maxHeight: 'none',
            overflow: 'hidden',
            borderRadius: '18px 18px 0 0',
            padding: '9px 12px calc(9px + env(safe-area-inset-bottom, 0px))',
            background: 'rgba(255,255,255,0.97)',
            border: '0',
            borderTop: '1px solid rgba(226,232,240,0.96)',
            boxShadow: '0 -12px 30px rgba(15,23,42,0.12)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            pointerEvents: 'auto'
        } },
        React.createElement("div", { ref: scrollerRef, className: "visit-quick-dock-scroll-v54", style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '54px',
                overflowX: 'auto',
                overflowY: 'hidden',
                WebkitOverflowScrolling: 'touch',
                overscrollBehaviorX: 'contain',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                padding: '0 2px',
                touchAction: 'pan-x'
            } }, SECTION_DEFS.map((section, index) => {
            const active = activeSection === index;
            const minWidth = section.id === 'evidence' ? 108 : section.id === 'qsc' ? 88 : section.id === 'observation' ? 92 : 96;
            return (React.createElement("button", { key: section.id, type: "button", className: "visit-quick-dock-chip-v54", onClick: () => goSection(index), "aria-current": active ? 'page' : undefined, "aria-label": `Buka section ${section.title}`, "data-active": active ? 'true' : undefined, style: {
                    flex: '0 0 auto',
                    width: 'auto',
                    minWidth: `${minWidth}px`,
                    height: '50px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                    borderRadius: '17px',
                    padding: '0 14px',
                    fontSize: '12px',
                    fontWeight: 900,
                    letterSpacing: '-0.01em',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    color: active ? '#ffffff' : '#334155',
                    background: active ? '#172554' : 'rgba(248,250,252,0.78)',
                    border: active ? '1px solid #172554' : '1px solid rgba(226,232,240,0.98)',
                    boxShadow: active ? '0 6px 14px rgba(23,37,84,0.14)' : 'inset 0 1px 0 rgba(255,255,255,0.78)',
                    transition: 'transform 160ms ease, background 160ms ease, border-color 160ms ease, box-shadow 160ms ease',
                    touchAction: 'pan-x'
                } },
                React.createElement("span", { className: "visit-quick-dock-icon-v54", style: { display: 'inline-grid', placeItems: 'center', width: 22, height: 22, borderRadius: '999px', background: active ? 'rgba(255,255,255,0.16)' : 'rgba(15,118,110,0.10)', color: active ? '#ffffff' : '#0f766e', flex: '0 0 auto' } },
                    React.createElement(Icon, { name: section.icon, className: "h-4 w-4" })),
                React.createElement("span", { style: { overflow: 'hidden', textOverflow: 'ellipsis' } }, section.label)));
        })),
        React.createElement("div", { "aria-hidden": "true", style: { position: 'absolute', left: '16px', right: '16px', bottom: '6px', height: '2px', overflow: 'hidden', borderRadius: '999px', background: 'rgba(203,213,225,0.58)' } },
            React.createElement("div", { style: { width: safeProgress + '%', height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #0f766e, #14b8a6)' } }))));
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
        React.createElement("div", { className: "mobile-system-grid cols-3" },
            items.map((item) => React.createElement("button", { key: item.key, type: "button", className: cx('mobile-system-button', item.active && 'active'), onClick: item.action },
                React.createElement(Icon, { name: item.icon, className: "h-5 w-5" }),
                React.createElement("span", null, item.label))))));
}
function VisitWorkspace({ visit, update, activeSection, goSection, onPreview }) {
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
        return React.createElement("main", { className: "workspace-page w-full px-4 py-8 pb-44 md:px-8 md:pb-8" },
            React.createElement(EmptyState, { icon: "clipboard", title: "Belum ada visit aktif" }));
    const screens = [React.createElement(VisitSetupSection, { visit: visit, update: update }), React.createElement(GeneralInfoSection, { visit: visit, update: update }), React.createElement(QscResultSection, { visit: visit, update: update }), React.createElement(ObservationSection, { visit: visit, update: update }), React.createElement(EvidenceSection, { visit: visit, update: update })];
    return (React.createElement("main", { className: "workspace-page w-full px-4 py-5 pb-44 md:px-8 md:py-8 md:pb-8" },
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
        React.createElement("div", { key: SECTION_DEFS[activeSection]?.id || activeSection }, screens[activeSection]),
        React.createElement("div", { className: "md:hidden", "aria-hidden": "true", style: { height: '96px', flexShrink: 0 } })));
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
        try {
            return sessionStorage.getItem(WELCOME_SEEN_KEY) !== '1';
        }
        catch (error) {
            return true;
        }
    });
    const secretTapRef = useRef({ count: 0, timer: null });
    useEffect(() => {
        let cancelled = false;
        async function restoreActiveVisit() {
            try {
                const activeId = localStorage.getItem(ACTIVE_VISIT_KEY);
                if (!activeId)
                    return;
                const data = await getVisitRecord(activeId);
                if (cancelled || !data)
                    return;
                setVisit(data);
                const savedScreen = sessionStorage.getItem(SESSION_SCREEN_KEY);
                if (savedScreen === 'preview' || savedScreen === 'audit')
                    setScreen(savedScreen);
                else
                    setScreen('audit');
            }
            catch (error) {
                console.warn('Restore active visit gagal:', error);
            }
        }
        restoreActiveVisit();
        return () => { cancelled = true; };
    }, []);
    useEffect(() => {
        try { sessionStorage.setItem(SESSION_SCREEN_KEY, screen); }
        catch (error) { }
    }, [screen]);
    useEffect(() => {
        let cancelled = false;
        let unsubscribe = null;
        let pollId = null;
        function applyConfigRows(rows) {
            const applied = applyRemoteAppConfigRows(rows);
            if (applied.some((row) => row.key === APP_CONFIG_KEYS.welcome))
                setWelcomeConfig(readWelcomeConfig());
        }
        async function refreshRemoteConfigs() {
            const rows = await fetchAppConfigsFromConvex();
            if (!cancelled && rows)
                applyConfigRows(rows);
        }
        async function startRemoteConfigSync() {
            try {
                await refreshRemoteConfigs();
                if (!cloudflareEnabled() && !netlifyEnabled() && !supabaseEnabled()) {
                    unsubscribe = await subscribeConvexQuery(getConvexConfig().appConfigListQuery || 'appSettings:listConfigs', { keys: [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice, APP_CONFIG_KEYS.emailTemplate] }, (rows) => { if (!cancelled)
                        applyConfigRows(rows); }, (error) => { console.warn('Realtime app config gagal:', error); });
                }
            }
            catch (error) {
                console.warn('Sync app config gagal:', error);
            }
            if (!cancelled && !unsubscribe) {
                pollId = window.setInterval(refreshRemoteConfigs, getRemotePollMs());
            }
        }
        startRemoteConfigSync();
        const syncWelcome = (event) => setWelcomeConfig(event?.detail ? normalizeWelcomeConfigPayload(event.detail) : readWelcomeConfig());
        window.addEventListener('rbv-welcome-config-change', syncWelcome);
        window.addEventListener('storage', syncWelcome);
        return () => {
            cancelled = true;
            if (pollId)
                window.clearInterval(pollId);
            try {
                unsubscribe?.();
            }
            catch (error) { }
            window.removeEventListener('rbv-welcome-config-change', syncWelcome);
            window.removeEventListener('storage', syncWelcome);
        };
    }, []);
    function closeWelcome() {
        try {
            sessionStorage.setItem(WELCOME_SEEN_KEY, '1');
        }
        catch (error) { }
        setWelcomeOpen(false);
    }
    function applyWelcomeConfig(nextConfig) {
        const saved = saveWelcomeConfig(nextConfig);
        setWelcomeConfig(saved);
    }
    async function updateStorageLabel() {
        const localBytes = calcLocalStorageBytes();
        let label = `LocalStorage ${formatBytes(localBytes)}`;
        if (navigator.storage?.estimate) {
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
        let cancelled = false;
        let versionTimer = null;
        function reloadWithVersion(version) {
            if (cancelled || !version)
                return;
            const now = Date.now();
            const lastReload = Number(sessionStorage.getItem(APP_RELOAD_LOCK_KEY) || 0);
            if (now - lastReload < 12000)
                return;
            try {
                sessionStorage.setItem(APP_RELOAD_LOCK_KEY, String(now));
                localStorage.setItem(APP_VERSION_KEY, version);
            }
            catch (error) { }
            const url = new URL(window.location.href);
            url.searchParams.set('v', version);
            url.searchParams.set('sync', String(now));
            window.location.replace(url.toString());
        }
        async function clearAppCaches() {
            if (!('caches' in window))
                return;
            try {
                const keys = await caches.keys();
                await Promise.all(keys.filter((key) => key.startsWith('bestie-visit-')).map((key) => caches.delete(key)));
            }
            catch (error) { }
        }
        async function checkLatestVersion() {
            try {
                const response = await fetch(`${VERSION_ENDPOINT}?t=${Date.now()}`, { cache: 'no-store' });
                if (!response.ok)
                    return;
                const info = await response.json();
                const latest = String(info.version || info.build || '').trim();
                if (!latest)
                    return;
                const saved = localStorage.getItem(APP_VERSION_KEY);
                if (!saved)
                    localStorage.setItem(APP_VERSION_KEY, APP_BUILD_VERSION);
                if (latest !== APP_BUILD_VERSION) {
                    await clearAppCaches();
                    reloadWithVersion(latest);
                    return;
                }
                localStorage.setItem(APP_VERSION_KEY, latest);
            }
            catch (error) { }
        }
        async function registerServiceWorker() {
            if (!('serviceWorker' in navigator) || location.protocol === 'file:')
                return;
            try {
                const registration = await navigator.serviceWorker.register(`service-worker.js?v=${APP_BUILD_VERSION}`);
                registration.update().catch(() => { });
                if (registration.waiting)
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                registration.addEventListener('updatefound', () => {
                    const worker = registration.installing;
                    if (!worker)
                        return;
                    worker.addEventListener('statechange', () => {
                        if (worker.state === 'installed' && navigator.serviceWorker.controller)
                            reloadWithVersion(APP_BUILD_VERSION);
                    });
                });
            }
            catch (error) { }
        }
        registerServiceWorker();
        checkLatestVersion();
        versionTimer = window.setInterval(checkLatestVersion, 180000);
        return () => {
            cancelled = true;
            if (versionTimer)
                window.clearInterval(versionTimer);
        };
    }, []);
    useEffect(() => {
        const touchState = { target: null, x: 0, y: 0, moved: false, startedAt: 0 };
        const textTargetSelector = 'input:not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]';
        const findTextTarget = (target) => target?.closest?.(textTargetSelector) || null;
        const movementLimit = () => (window.matchMedia?.('(pointer: coarse)')?.matches ? 16 : 11);
        function canFocusOnTap(target) {
            if (!target || target.disabled || target.readOnly)
                return false;
            const tag = (target.tagName || '').toLowerCase();
            if (tag === 'select')
                return false;
            const type = String(target.getAttribute?.('type') || '').toLowerCase();
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
            const target = findTextTarget(event.target);
            if (!target || !event.touches?.[0])
                return;
            touchState.target = target;
            touchState.x = event.touches[0].clientX;
            touchState.y = event.touches[0].clientY;
            touchState.moved = false;
            touchState.startedAt = Date.now();
        }
        function handleTouchMove(event) {
            if (!touchState.target || !event.touches?.[0])
                return;
            const dx = Math.abs(event.touches[0].clientX - touchState.x);
            const dy = Math.abs(event.touches[0].clientY - touchState.y);
            const limit = movementLimit();
            if (dy > limit || dx > limit + 6)
                touchState.moved = true;
        }
        function handleTouchEnd(event) {
            const target = touchState.target;
            const wasScroll = Boolean(target && touchState.moved);
            if (wasScroll) {
                if (event.cancelable)
                    event.preventDefault();
                event.stopPropagation();
                if (document.activeElement === target)
                    target.blur?.();
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
        let cancelled = false;
        async function pulse() {
            if (cancelled)
                return;
            const payload = presencePayloadFromState(visit, screen);
            await upsertPresence(payload);
        }
        pulse();
        const interval = window.setInterval(pulse, 15000);
        function handleVisibilityChange() {
            if (document.visibilityState === 'visible')
                pulse();
        }
        window.addEventListener('focus', pulse);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            cancelled = true;
            window.clearInterval(interval);
            window.removeEventListener('focus', pulse);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [visit?.id, visit?.nama, visit?.store, screen]);
    useEffect(() => {
        if (!visit?.id)
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
        if (visit?.id === id) {
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
    return (React.createElement("div", { className: cx("audit-shell min-h-screen", screen !== 'dashboard' && "md:grid md:grid-cols-[300px_minmax(0,1fr)]") },
        screen !== 'dashboard' ? React.createElement(DesktopSidebar, { screen: screen, setScreen: setScreen, visit: visit, activeSection: activeSection, goSection: goSection, onNewVisit: () => setNewVisitOpen(true), onClearData: clearCurrentData, onTitleTap: handleTitleTap }) : null,
        React.createElement("div", { className: "flex min-h-screen min-w-0 flex-col" },
            !welcomeOpen ? React.createElement(MobileTopBar, { screen: screen, setScreen: setScreen, visit: visit, activeSection: activeSection, goSection: goSection, onNewVisit: () => setNewVisitOpen(true), onTitleTap: handleTitleTap }) : null,
            React.createElement("div", { className: "min-w-0 flex-1" }, content),
            screen !== 'dashboard' && !welcomeOpen ? React.createElement(MobileBottomNav, { screen: screen, setScreen: setScreen, visit: visit, onNewVisit: () => setNewVisitOpen(true), onClearData: clearCurrentData }) : null),
        welcomeOpen ? React.createElement(WelcomeOverlay, { config: welcomeConfig, onDone: closeWelcome }) : null,
        React.createElement(NewVisitModal, { open: newVisitOpen, onClose: () => setNewVisitOpen(false), onCreate: createNewVisit }),
        React.createElement(SecretPinModal, { open: pinOpen, onClose: () => setPinOpen(false), onUnlock: () => { setPinOpen(false); setSecretOpen(true); } }),
        React.createElement(SecretMonitorPanel, { open: secretOpen, onClose: () => setSecretOpen(false), history: history, welcomeConfig: welcomeConfig, onWelcomeConfigChange: applyWelcomeConfig })));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App, null));
