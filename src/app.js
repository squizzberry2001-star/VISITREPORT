import { jsxDEV as _jsxDEV, Fragment as _Fragment } from "react/jsx-dev-runtime";
const {
  useEffect,
  useMemo,
  useRef,
  useState
} = React;

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
  subtitle: '“Sudahkah kalian bahagia hari ini?, Semangat ya kerjanya”',
  durationSeconds: 5
};
const UPDATE_NOTICE_CONFIG_KEY = 'rbv_update_notice_config_v1';
const APP_CONFIG_KEYS = {
  welcome: 'welcome_animation',
  updateNotice: 'home_update_notice'
};
const DEFAULT_UPDATE_NOTICE_CONFIG = {
  enabled: true,
  title: 'Info Update Website',
  messages: ['Area ini untuk mengumumkan perubahan fitur, maintenance, atau instruksi terbaru.'],
  intervalSeconds: 4
};
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
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}
function normalizePdfPhotoGridPerPage(value, fallback = DEFAULT_PDF_SETTINGS.photoGridPerPage) {
  const allowed = [4, 6, 8];
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
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
  } catch (error) {
    return {
      ...DEFAULT_PDF_SETTINGS
    };
  }
}
function savePdfSettings(settings) {
  const next = normalizePdfSettings(settings);
  localStorage.setItem(PDF_SETTINGS_KEY, JSON.stringify(next));
  return next;
}
const SESSION_ID = `react_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const APP_BUILD_VERSION = 'revamp271-welcome-coffee-vector-tip';
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
  return cleanText(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
function uniqueBy(items, keyFn) {
  const seen = new Set();
  const result = [];
  items.forEach(item => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push(item);
  });
  return result;
}
function readJsonArray(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
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
  if (!Number.isFinite(number)) return fallback;
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
  } catch (error) {
    return {
      ...DEFAULT_WELCOME_CONFIG
    };
  }
}
function saveWelcomeConfig(config) {
  const next = {
    title: cleanText(config && config.title, DEFAULT_WELCOME_CONFIG.title),
    subtitle: cleanText(config && config.subtitle, DEFAULT_WELCOME_CONFIG.subtitle),
    durationSeconds: normalizeWelcomeDurationSeconds(config && config.durationSeconds)
  };
  localStorage.setItem(WELCOME_CONFIG_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('rbv-welcome-config-change', {
    detail: next
  }));
  return next;
}
function normalizeUpdateNoticeIntervalSeconds(value, fallback = DEFAULT_UPDATE_NOTICE_CONFIG.intervalSeconds) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(15, Math.max(2, number));
}
function normalizeUpdateNoticeMessages(value) {
  const source = Array.isArray(value) ? value : String(value || '').split(/\n+/);
  const messages = source.map(item => cleanText(item)).filter(Boolean).slice(0, 12);
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
  } catch (error) {
    return {
      ...DEFAULT_UPDATE_NOTICE_CONFIG,
      messages: DEFAULT_UPDATE_NOTICE_CONFIG.messages.slice()
    };
  }
}
function saveUpdateNoticeConfig(config) {
  const next = normalizeUpdateNoticeConfig(config);
  localStorage.setItem(UPDATE_NOTICE_CONFIG_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('rbv-update-notice-change', {
    detail: next
  }));
  return next;
}
function readAssignmentLinkConfig() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ASSIGNMENT_CONFIG_KEY) || '{}');
    return cleanText(parsed.link, DEFAULT_ASSIGNMENT_LINK);
  } catch (error) {
    return DEFAULT_ASSIGNMENT_LINK;
  }
}
function saveAssignmentLinkConfig(link) {
  const next = cleanText(link, DEFAULT_ASSIGNMENT_LINK);
  localStorage.setItem(ASSIGNMENT_CONFIG_KEY, JSON.stringify({
    link: next,
    updatedAt: Date.now()
  }));
  window.dispatchEvent(new CustomEvent('rbv-assignment-link-change', {
    detail: {
      link: next
    }
  }));
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
  return saveJsonArray(MANUAL_STORE_APPROVED_KEY, uniqueBy(items, item => normalize(item.storeName || item.siteDescr || item.label)));
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
  const nextRequests = requests.map(item => {
    if (item.id !== id) return item;
    approved = {
      ...item,
      status: 'approved',
      updatedAt: now
    };
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
  const nextRequests = readManualStoreRequests().map(item => {
    if (item.id !== id) return item;
    rejected = {
      ...item,
      status: 'rejected',
      updatedAt: now
    };
    return rejected;
  });
  saveManualStoreRequests(nextRequests);
  if (rejected) syncManualRequestStatusToConvex(rejected);
}
function findApprovedManualStore(storeName) {
  const key = normalize(storeName);
  if (!key) return null;
  return readApprovedManualStores().find(item => normalize(item.storeName || item.siteDescr) === key || normalize(item.siteCode || item.siteCode4) === key) || null;
}
const BESTIE_NAMES = uniqueBy(BESTIE_ASSIGNMENTS.map(item => cleanText(item.bestieName)).filter(Boolean).sort((a, b) => a.localeCompare(b)), item => item);
function getStoreLabel(item) {
  return cleanText(item?.storeName || item?.assignmentStoreName || item?.siteDescr || item?.store);
}
function getStoresForBestie(bestieName) {
  const key = normalize(bestieName);
  const assigned = BESTIE_ASSIGNMENTS.filter(item => !key || normalize(item.bestieName) === key).map(item => ({
    label: getStoreLabel(item),
    source: 'assignment',
    assignment: item,
    value: getStoreLabel(item)
  })).filter(item => item.label);
  const approvedManual = readApprovedManualStores().map(item => ({
    label: cleanText(item.storeName || item.siteDescr),
    source: 'manual-approved',
    master: item,
    value: cleanText(item.storeName || item.siteDescr)
  })).filter(item => item.label);
  const fallback = MASTER_STORES.map(item => ({
    label: cleanText(item.siteDescr),
    source: 'master',
    master: item,
    value: cleanText(item.siteDescr)
  })).filter(item => item.label);
  const base = assigned.length ? assigned : fallback;
  return uniqueBy([...base, ...approvedManual], item => normalize(item.label)).sort((a, b) => a.label.localeCompare(b.label));
}
function findAssignmentStore(storeName, bestieName) {
  const storeKey = normalize(storeName);
  const bestieKey = normalize(bestieName);
  if (!storeKey) return null;
  return BESTIE_ASSIGNMENTS.find(item => {
    const sameStore = normalize(item.storeName) === storeKey || normalize(item.assignmentStoreName) === storeKey;
    const sameBestie = !bestieKey || normalize(item.bestieName) === bestieKey;
    return sameStore && sameBestie;
  }) || BESTIE_ASSIGNMENTS.find(item => normalize(item.storeName) === storeKey || normalize(item.assignmentStoreName) === storeKey) || null;
}
function findMasterStore(storeName) {
  const key = normalize(storeName);
  if (!key) return null;
  return MASTER_STORES.find(item => normalize(item.siteDescr) === key || normalize(item.siteCode) === key || normalize(item.siteCode4) === key) || null;
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
  if (!merged.siteDescr) merged.siteDescr = approvedManual?.storeName || assignment?.storeName || assignment?.assignmentStoreName || storeName || '';
  if (!merged.address) merged.address = assignment?.storeAddress || '';
  if (!merged.siteCode && assignment?.storeCode) merged.siteCode = assignment.storeCode;
  if (!merged.siteCode4 && assignment?.storeCode) merged.siteCode4 = assignment.storeCode;
  if (!merged.storeHead && assignment?.storeHead) merged.storeHead = assignment.storeHead;
  if (!merged.areaManager && assignment?.areaManager) merged.areaManager = assignment.areaManager;
  if (!merged.regionalManager && assignment?.regionalManager) merged.regionalManager = assignment.regionalManager;
  if (!merged.city && assignment?.city) merged.city = assignment.city;
  return merged;
}
window.getStoreWebDetail = getStoreWebDetail;
function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}
function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(2)} MB`;
}
function calcLocalStorageBytes() {
  let total = 0;
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index) || '';
      total += key.length + (localStorage.getItem(key) || '').length;
    }
  } catch (error) {}
  return total * 2;
}
function blankObservationRow() {
  return {
    temuan: '',
    kondisiIdeal: '',
    dampak: '',
    penyebab: '',
    tindakan: '',
    deadline: '',
    hasil: ''
  };
}
function blankPhoto() {
  return {
    image: '',
    description: ''
  };
}
function normalizeQscPhotos(visit) {
  const legacy = visit?.qscResultPhoto ? [visit.qscResultPhoto] : [];
  const source = Array.isArray(visit?.qscResultPhotos) && visit.qscResultPhotos.length ? visit.qscResultPhotos : legacy;
  const firstTwo = [0, 1].map(index => source[index] || blankPhoto());
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
    crewList: [{
      name: '',
      level: ''
    }],
    qscResultPhoto: blankPhoto(),
    qscResultPhotos: [blankPhoto(), blankPhoto()],
    opiData: [blankObservationRow()],
    qscData: [blankObservationRow()],
    findingEvidencePhotos: Array.from({
      length: 8
    }, () => blankPhoto()),
    correctiveActionPhotos: Array.from({
      length: 8
    }, () => blankPhoto()),
    storeAssignmentLink: readAssignmentLinkConfig(),
    showQSCResult: false,
    showOPITable: false,
    showQSCTable: false,
    showFindingEvidence: false,
    showCorrectiveAction: false,
    activeObservationTab: 'opi',
    activeEvidenceTab: 'finding'
  };
}
function isMeaningfulObservation(row) {
  return ['temuan', 'kondisiIdeal', 'dampak', 'penyebab', 'tindakan', 'deadline', 'hasil'].some(key => cleanText(row?.[key]));
}
function isEditableTarget(target) {
  const node = target instanceof Element ? target : null;
  if (!node) return false;
  return Boolean(node.closest('input, textarea, select, [contenteditable="true"], .rich-editor-input, .form-control'));
}
function rbvProgressValue(value) {
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.some(Boolean);
  return Boolean(cleanText(value));
}
function rbvProgressFromChecks(checks) {
  const flat = (checks || []).flat().map(rbvProgressValue);
  if (!flat.length) return 0;
  return Math.round(flat.filter(Boolean).length / flat.length * 100);
}
function visitProgressChecks(visit) {
  const qscPhotos = normalizeQscPhotos(visit);
  const findingRows = visit.findingEvidencePhotos || [];
  const correctiveRows = visit.correctiveActionPhotos || [];
  const crewRows = Array.isArray(visit.crewList) ? visit.crewList : [];
  return {
    setup: [{
      label: 'Nama Bestie',
      value: visit.nama
    }, {
      label: 'Store',
      value: visit.store
    }],
    crew: [{
      label: 'Tanggal Visit',
      value: visit.tanggal
    }, {
      label: 'Store Leader',
      value: visit.storeLeader
    }, {
      label: 'Level Store Leader',
      value: visit.storeLeaderLevel
    }, {
      label: 'Shift Leader',
      value: visit.shiftLeader
    }, {
      label: 'Level Shift Leader',
      value: visit.shiftLeaderLevel
    }, {
      label: 'Crew Store',
      value: crewRows.some(crew => cleanText(crew.name) || cleanText(crew.level))
    }],
    'qsc-result': [{
      label: 'Foto FAMITRACK Result',
      value: qscPhotos[0]?.image
    }, {
      label: 'Foto QSC Result',
      value: qscPhotos[1]?.image
    }],
    observation: [{
      label: 'Tabel OPI',
      value: visit.showOPITable !== false ? (visit.opiData || []).some(isMeaningfulObservation) : true
    }, {
      label: 'Tabel QSC',
      value: visit.showQSCTable !== false ? (visit.qscData || []).some(isMeaningfulObservation) : true
    }],
    evidence: [{
      label: 'Finding Evidence',
      value: visit.showFindingEvidence !== false ? findingRows.some(photo => photo.image || cleanText(photo.description)) : true
    }, {
      label: 'Corrective Action',
      value: visit.showCorrectiveAction !== false ? correctiveRows.some(photo => photo.image || cleanText(photo.description)) : true
    }]
  };
}
function visitProgress(visit, activeSection = null) {
  if (!visit) return 0;
  const sectionChecks = visitProgressChecks(visit);
  if (Number.isInteger(activeSection) && typeof SECTION_DEFS !== 'undefined' && SECTION_DEFS && SECTION_DEFS[activeSection]) {
    const sectionId = SECTION_DEFS[activeSection].id;
    return rbvProgressFromChecks((sectionChecks[sectionId] || []).map(item => item.value));
  }
  return rbvProgressFromChecks(Object.values(sectionChecks).map(items => items.map(item => item.value)));
}
function visitProgressMissingItems(visit, activeSection = null) {
  if (!visit) return [];
  const sectionChecks = visitProgressChecks(visit);
  let sectionIds = Object.keys(sectionChecks);
  if (Number.isInteger(activeSection) && typeof SECTION_DEFS !== 'undefined' && SECTION_DEFS && SECTION_DEFS[activeSection]) {
    sectionIds = [SECTION_DEFS[activeSection].id];
  }
  const includeSectionName = sectionIds.length > 1;
  return sectionIds.flatMap(sectionId => {
    const sectionTitle = (typeof SECTION_DEFS !== 'undefined' && SECTION_DEFS || []).find(section => section.id === sectionId)?.title || sectionId;
    return (sectionChecks[sectionId] || []).filter(item => !rbvProgressValue(item.value)).map(item => ({
      sectionId,
      sectionTitle,
      label: item.label,
      text: includeSectionName ? `${sectionTitle}: ${item.label}` : item.label
    }));
  });
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
  } catch (error) {
    return [];
  }
}
function saveHistoryMeta(items) {
  const next = uniqueBy(items.filter(item => item && item.id), item => item.id).sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0)).slice(0, 80);
  localStorage.setItem(HISTORY_META_KEY, JSON.stringify(next));
  return next;
}
let dbPromise = null;
function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB tidak tersedia di browser ini.'));
      return;
    }
    const request = indexedDB.open(REPORT_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(REPORT_DB_STORE)) db.createObjectStore(REPORT_DB_STORE, {
        keyPath: 'id'
      });
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
    tx.objectStore(REPORT_DB_STORE).put({
      id: visit.id,
      updatedAt: Date.now(),
      data: visit
    });
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
      request.onsuccess = () => resolve((request.result || []).map(item => item?.data || item).filter(Boolean));
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Gagal membaca data backup IndexedDB:', error);
    return [];
  }
}
function readBackupFileText(file) {
  if (file && typeof file.text === 'function') return file.text();
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
    if (key.indexOf('rbv_') === 0) localData[key] = localStorage.getItem(key);
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
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8'
  });
  downloadBlob(blob, `bestie-visit-backup-${stamp}.json`);
  return payload;
}
async function restoreVisitReportDataFromFile(file) {
  const raw = await readBackupFileText(file);
  const payload = JSON.parse(raw);
  if (!payload || payload.app !== 'regional-bestie-visit-report') {
    throw new Error('File backup tidak sesuai aplikasi ini.');
  }
  const visits = Array.isArray(payload.visits) ? payload.visits.filter(item => item && item.id) : [];
  const currentVisits = await getAllVisitRecordsForBackup();
  const ok = confirmAction(`Restore data backup ini? Data backup akan digabung dengan history di perangkat ini, bukan mengganti/menghapus data lama.

History perangkat ini: ${currentVisits.length}
Jumlah visit backup: ${visits.length}`);
  if (!ok) return false;
  const mergedVisits = uniqueBy([...visits, ...currentVisits].filter(item => item && item.id), item => item.id).map(visit => ({
    ...visit,
    updatedAt: visit.updatedAt || Date.now()
  }));
  for (const visit of mergedVisits) {
    await putVisitRecord(visit);
  }
  if (payload.localStorage && typeof payload.localStorage === 'object') {
    Object.entries(payload.localStorage).forEach(([key, value]) => {
      if (key.indexOf('rbv_') !== 0) return;
      if ([HISTORY_META_KEY, ACTIVE_VISIT_KEY].includes(key)) return;
      if (key === PRESENCE_LOCAL_KEY) return;
      localStorage.setItem(key, String(value ?? ''));
    });
  }
  const backupMeta = (() => {
    try {
      const parsed = JSON.parse(String(payload.localStorage?.[HISTORY_META_KEY] || '[]'));
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  })();
  const currentMeta = readHistoryMeta();
  const visitMeta = mergedVisits.map(historyMetaFromVisit);
  saveHistoryMeta([...backupMeta, ...currentMeta, ...visitMeta]);
  if (!localStorage.getItem(ACTIVE_VISIT_KEY) && (visits[0]?.id || currentVisits[0]?.id)) localStorage.setItem(ACTIVE_VISIT_KEY, visits[0]?.id || currentVisits[0]?.id);
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
function Icon({
  name,
  className = 'h-5 w-5',
  strokeWidth = 2
}) {
  const paths = {
    home: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M3 10.5 12 3l9 7.5"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M5 9.5V21h14V9.5"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M9 21v-6h6v6"
      }, void 0, false)]
    }, void 0, true),
    clipboard: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M9 3h6l1 2h3v16H5V5h3l1-2Z"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M9 8h6"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M8 13h8"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M8 17h5"
      }, void 0, false)]
    }, void 0, true),
    camera: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M4 8h3l2-3h6l2 3h3v11H4V8Z"
      }, void 0, false), /*#__PURE__*/_jsxDEV("circle", {
        cx: "12",
        cy: "13.5",
        r: "3.5"
      }, void 0, false)]
    }, void 0, true),
    gallery: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("rect", {
        x: "4",
        y: "5",
        width: "16",
        height: "14",
        rx: "2"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "m7 16 3.5-3.5 2.5 2.5 2-2 2 3"
      }, void 0, false), /*#__PURE__*/_jsxDEV("circle", {
        cx: "9",
        cy: "9",
        r: "1.2"
      }, void 0, false)]
    }, void 0, true),
    marker: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("circle", {
        cx: "12",
        cy: "12",
        r: "7"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M12 8v8"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M8 12h8"
      }, void 0, false)]
    }, void 0, true),
    crop: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M6 3v12h12"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M3 6h12v12"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M18 15v6"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M15 18h6"
      }, void 0, false)]
    }, void 0, true),
    trash: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M4 7h16"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M9 7V4h6v3"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M7 7l1 14h8l1-14"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M10 11v6"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M14 11v6"
      }, void 0, false)]
    }, void 0, true),
    pdf: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M6 3h8l4 4v14H6V3Z"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M14 3v5h5"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M8 15h8"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M8 18h5"
      }, void 0, false)]
    }, void 0, true),
    excel: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M4 5h16v14H4V5Z"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M8 5v14"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M4 10h16"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M4 14h16"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "m11 12 4 4"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "m15 12-4 4"
      }, void 0, false)]
    }, void 0, true),
    plus: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M12 5v14"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M5 12h14"
      }, void 0, false)]
    }, void 0, true),
    left: /*#__PURE__*/_jsxDEV("path", {
      d: "m15 18-6-6 6-6"
    }, void 0, false),
    right: /*#__PURE__*/_jsxDEV("path", {
      d: "m9 18 6-6-6-6"
    }, void 0, false),
    user: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("circle", {
        cx: "12",
        cy: "8",
        r: "4"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M4 21c1.8-4 4.5-6 8-6s6.2 2 8 6"
      }, void 0, false)]
    }, void 0, true),
    store: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M4 9h16l-1.5-5h-13L4 9Z"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M5 9v12h14V9"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M9 21v-6h6v6"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M4 9c.8 2 3.2 2 4 0 .8 2 3.2 2 4 0 .8 2 3.2 2 4 0 .8 2 3.2 2 4 0"
      }, void 0, false)]
    }, void 0, true),
    calendar: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("rect", {
        x: "4",
        y: "5",
        width: "16",
        height: "16",
        rx: "2"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M8 3v4"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M16 3v4"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M4 10h16"
      }, void 0, false)]
    }, void 0, true),
    spark: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"
      }, void 0, false)]
    }, void 0, true),
    image: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("rect", {
        x: "3",
        y: "5",
        width: "18",
        height: "14",
        rx: "2"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "m4 16 5-5 4 4 2-2 5 5"
      }, void 0, false)]
    }, void 0, true),
    shield: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "m9 12 2 2 4-5"
      }, void 0, false)]
    }, void 0, true),
    download: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M12 3v12"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "m7 10 5 5 5-5"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M5 21h14"
      }, void 0, false)]
    }, void 0, true),
    history: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M3 12a9 9 0 1 0 3-6.7"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M3 4v5h5"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M12 7v5l3 2"
      }, void 0, false)]
    }, void 0, true),
    upload: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M12 21V9"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "m7 14 5-5 5 5"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M5 3h14"
      }, void 0, false)]
    }, void 0, true),
    eye: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
      }, void 0, false), /*#__PURE__*/_jsxDEV("circle", {
        cx: "12",
        cy: "12",
        r: "3"
      }, void 0, false)]
    }, void 0, true),
    eraser: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "m3 17 9-9 6 6-6 6H7l-4-3Z"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "m14 6 4-4 4 4-4 4"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M12 20h9"
      }, void 0, false)]
    }, void 0, true),
    close: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M6 6l12 12"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M18 6 6 18"
      }, void 0, false)]
    }, void 0, true),
    search: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("circle", {
        cx: "11",
        cy: "11",
        r: "7"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "m20 20-3.5-3.5"
      }, void 0, false)]
    }, void 0, true),
    menu: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M4 6h16"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M4 12h16"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M4 18h16"
      }, void 0, false)]
    }, void 0, true),
    qr: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("rect", {
        x: "4",
        y: "4",
        width: "6",
        height: "6",
        rx: "1"
      }, void 0, false), /*#__PURE__*/_jsxDEV("rect", {
        x: "14",
        y: "4",
        width: "6",
        height: "6",
        rx: "1"
      }, void 0, false), /*#__PURE__*/_jsxDEV("rect", {
        x: "4",
        y: "14",
        width: "6",
        height: "6",
        rx: "1"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M14 14h2v2h-2z"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M18 14h2v6h-6v-2h4z"
      }, void 0, false)]
    }, void 0, true),
    check: /*#__PURE__*/_jsxDEV("path", {
      d: "m5 13 4 4L19 7"
    }, void 0, false),
    settings: /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV("path", {
        d: "M4 7h10"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M18 7h2"
      }, void 0, false), /*#__PURE__*/_jsxDEV("circle", {
        cx: "16",
        cy: "7",
        r: "2"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M4 17h2"
      }, void 0, false), /*#__PURE__*/_jsxDEV("path", {
        d: "M10 17h10"
      }, void 0, false), /*#__PURE__*/_jsxDEV("circle", {
        cx: "8",
        cy: "17",
        r: "2"
      }, void 0, false)]
    }, void 0, true)
  };
  return /*#__PURE__*/_jsxDEV("svg", {
    className: className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    children: paths[name] || paths.spark
  }, void 0, false);
}
function Button({
  variant = 'primary',
  className = '',
  icon,
  children,
  ...props
}) {
  const styles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    icon: 'btn-icon'
  };
  return /*#__PURE__*/_jsxDEV("button", {
    className: cx(styles[variant] || styles.primary, className),
    ...props,
    children: [icon ? /*#__PURE__*/_jsxDEV(Icon, {
      name: icon,
      className: "h-5 w-5"
    }, void 0, false) : null, children]
  }, void 0, true);
}
function Badge({
  children,
  tone = 'default'
}) {
  const tones = {
    default: 'bg-slate-100 text-slate-700 ring-slate-200',
    success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    warning: 'bg-orange-50 text-orange-800 ring-orange-200',
    dark: 'bg-slate-900 text-white ring-slate-900'
  };
  return /*#__PURE__*/_jsxDEV("span", {
    className: cx('inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1', tones[tone]),
    children: children
  }, void 0, false);
}
function Field({
  label,
  helper,
  children,
  required
}) {
  return /*#__PURE__*/_jsxDEV("label", {
    className: "block",
    children: [/*#__PURE__*/_jsxDEV("span", {
      className: "mb-2 flex items-center gap-1 text-sm font-bold text-slate-800",
      children: [label, required ? /*#__PURE__*/_jsxDEV("span", {
        className: "text-rose-600",
        children: "*"
      }, void 0, false) : null]
    }, void 0, true), children, helper ? /*#__PURE__*/_jsxDEV("span", {
      className: "mt-2 block text-xs leading-5 text-slate-500",
      children: helper
    }, void 0, false) : null]
  }, void 0, true);
}
function TextInput(props) {
  return /*#__PURE__*/_jsxDEV("input", {
    className: cx('form-control', props.className),
    ...props
  }, void 0, false);
}
function DateInput({
  className = '',
  ...props
}) {
  return /*#__PURE__*/_jsxDEV("input", {
    type: "date",
    className: cx('form-control date-control', className),
    ...props
  }, void 0, false);
}
function TextArea({
  value,
  onChange,
  className = '',
  minRows = 3,
  ...props
}) {
  const ref = useRef(null);
  function resize() {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.max(46, el.scrollHeight) + 'px';
  }
  useEffect(() => {
    resize();
  }, [value]);
  return /*#__PURE__*/_jsxDEV("textarea", {
    ref: ref,
    className: cx('form-control auto-grow-textarea', className),
    value: value || '',
    rows: minRows,
    onChange: event => {
      onChange?.(event);
      window.requestAnimationFrame(resize);
    },
    onInput: resize,
    ...props
  }, void 0, false);
}
function RichTextInput({
  value,
  onChange,
  placeholder = 'Tulis catatan...',
  className = '',
  minHeight = 112
}) {
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
    if (!editor || document.activeElement === editor) return;
    const nextHtml = richValue(value);
    if (editor.innerHTML !== nextHtml) editor.innerHTML = nextHtml;
  }, [value]);
  function readToolState() {
    const next = {};
    ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'].forEach(name => {
      try {
        next[name] = document.queryCommandState(name);
      } catch (error) {
        next[name] = false;
      }
    });
    return next;
  }
  useEffect(() => {
    function updateToolbarState() {
      const editor = editorRef.current;
      if (!editor || !editor.contains(document.activeElement)) return;
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
    if (!editor) return;
    editor.innerHTML = commandName === 'insertUnorderedList' ? '<ul><li><br></li></ul>' : '<ol><li><br></li></ol>';
    focusLastEditableNode(editor);
    onChange(editor.innerHTML);
    setActiveTools(current => ({
      ...current,
      [commandName]: true
    }));
  }
  function command(name, argument = null) {
    const editor = editorRef.current;
    if (!editor) return;
    const listCommand = name === 'insertUnorderedList' || name === 'insertOrderedList';
    editor.focus({
      preventScroll: true
    });
    if (listCommand && isEmpty(editor.innerHTML)) {
      seedList(name);
      return;
    }
    try {
      document.execCommand(name, false, argument);
    } catch (error) {}
    emit();
    window.requestAnimationFrame(() => setActiveTools(readToolState()));
  }
  function handleKeyDown(event) {
    if (event.key !== 'Enter') return;
    const editor = editorRef.current;
    if (!editor) return;
    window.requestAnimationFrame(() => {
      if (isEmpty(editor.innerHTML)) {
        editor.innerHTML = '';
        onChange('');
      }
    });
  }
  const tools = [{
    command: 'bold',
    label: 'B',
    title: 'Bold',
    className: 'rich-tool-bold'
  }, {
    command: 'italic',
    label: 'I',
    title: 'Italic',
    className: 'rich-tool-italic'
  }, {
    command: 'underline',
    label: 'U',
    title: 'Underline',
    className: 'rich-tool-underline'
  }, {
    command: 'insertUnorderedList',
    label: '•',
    title: 'Bullet',
    className: 'rich-tool-bullet'
  }, {
    command: 'insertOrderedList',
    label: '1.',
    title: 'Number',
    className: 'rich-tool-number'
  }];
  function focusEditor() {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    editor.focus({
      preventScroll: true
    });
  }
  return /*#__PURE__*/_jsxDEV("div", {
    className: cx('rich-editor rounded-2xl border border-slate-200 bg-white', className),
    children: [/*#__PURE__*/_jsxDEV("div", {
      ref: editorRef,
      className: "rich-editor-input px-3 py-3 text-sm leading-6 text-slate-900 outline-none",
      style: {
        minHeight
      },
      contentEditable: true,
      role: "textbox",
      "aria-multiline": "true",
      "data-placeholder": placeholder,
      tabIndex: 0,
      onClick: focusEditor,
      onInput: emit,
      onBlur: emit,
      onKeyDown: handleKeyDown,
      suppressContentEditableWarning: true
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "rich-toolbar flex flex-wrap gap-1 border-t border-slate-200 p-2",
      "aria-label": "Rich text toolbar",
      children: tools.map(tool => /*#__PURE__*/_jsxDEV("button", {
        type: "button",
        "data-command": tool.command,
        className: cx('rich-tool-button', tool.className, activeTools[tool.command] && 'active'),
        onPointerDown: event => {
          event.preventDefault();
          command(tool.command);
        },
        "aria-label": tool.title,
        title: tool.title,
        children: tool.label
      }, tool.command, false))
    }, void 0, false)]
  }, void 0, true);
}
function SelectInput({
  children,
  className = '',
  ...props
}) {
  return /*#__PURE__*/_jsxDEV("select", {
    className: cx('form-control appearance-none', className),
    ...props,
    children: children
  }, void 0, false);
}
function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Pilih',
  required,
  icon
}) {
  const normalizedOptions = (options || []).map(item => typeof item === 'string' ? {
    label: item,
    value: item
  } : item);
  return /*#__PURE__*/_jsxDEV(Field, {
    label: label,
    required: required,
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "select-field-wrap relative",
      children: [icon ? /*#__PURE__*/_jsxDEV("span", {
        className: "select-field-icon pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-slate-400",
        children: /*#__PURE__*/_jsxDEV(Icon, {
          name: icon,
          className: "h-5 w-5"
        }, void 0, false)
      }, void 0, false) : null, /*#__PURE__*/_jsxDEV(SelectInput, {
        value: value || '',
        onChange: event => onChange(event.target.value),
        className: cx('select-control', icon ? 'has-leading-icon' : ''),
        required: required,
        children: [/*#__PURE__*/_jsxDEV("option", {
          value: "",
          children: placeholder
        }, void 0, false), normalizedOptions.map(item => /*#__PURE__*/_jsxDEV("option", {
          value: item.value || item.label,
          children: item.label
        }, (item.value || '') + '-' + item.label, false))]
      }, void 0, true)]
    }, void 0, true)
  }, void 0, false);
}
function Toggle({
  checked,
  onChange,
  label,
  className = ''
}) {
  return /*#__PURE__*/_jsxDEV("button", {
    type: "button",
    role: "switch",
    "aria-checked": checked,
    onClick: () => onChange(!checked),
    className: cx('slide-toggle', checked && 'active', className),
    children: [label ? /*#__PURE__*/_jsxDEV("span", {
      className: "slide-toggle-label",
      children: label
    }, void 0, false) : null, /*#__PURE__*/_jsxDEV("span", {
      className: "slide-toggle-track",
      "aria-hidden": "true",
      children: /*#__PURE__*/_jsxDEV("span", {}, void 0, false)
    }, void 0, false)]
  }, void 0, true);
}
function EmptyState({
  icon = 'spark',
  title,
  children,
  action
}) {
  return /*#__PURE__*/_jsxDEV("div", {
    className: "surface-card flex flex-col items-center justify-center rounded-[28px] px-6 py-10 text-center",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-audit-primary",
      children: /*#__PURE__*/_jsxDEV(Icon, {
        name: icon,
        className: "h-6 w-6"
      }, void 0, false)
    }, void 0, false), /*#__PURE__*/_jsxDEV("h3", {
      className: "text-lg font-extrabold text-slate-950",
      children: title
    }, void 0, false), children ? /*#__PURE__*/_jsxDEV("p", {
      className: "mt-2 max-w-md text-sm leading-6 text-slate-600",
      children: children
    }, void 0, false) : null, action ? /*#__PURE__*/_jsxDEV("div", {
      className: "mt-5",
      children: action
    }, void 0, false) : null]
  }, void 0, true);
}
function InactiveSection({
  title
}) {
  return /*#__PURE__*/_jsxDEV("div", {
    className: "inactive-section surface-card rounded-[28px] p-6 text-center md:p-8",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500",
      children: /*#__PURE__*/_jsxDEV(Icon, {
        name: "eye",
        className: "h-6 w-6"
      }, void 0, false)
    }, void 0, false), /*#__PURE__*/_jsxDEV("h3", {
      className: "text-lg font-extrabold text-slate-950",
      children: title
    }, void 0, false)]
  }, void 0, true);
}

// =============================================================
// Molecules
// =============================================================
function SearchableCombobox({
  label,
  value,
  options,
  onChange,
  onSelect,
  placeholder,
  required,
  helper,
  icon = 'search'
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const normalizedOptions = (options || []).map(item => typeof item === 'string' ? {
    label: item,
    value: item
  } : item);
  const query = normalize(value);
  const visible = normalizedOptions.filter(item => !query || normalize(item.label).includes(query) || normalize(item.value).includes(query) || normalize(item.meta).includes(query)).slice(0, 12);
  useEffect(() => {
    function handleOutside(event) {
      if (!wrapRef.current || wrapRef.current.contains(event.target)) return;
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
  return /*#__PURE__*/_jsxDEV(Field, {
    label: label,
    required: required,
    helper: helper,
    children: /*#__PURE__*/_jsxDEV("div", {
      ref: wrapRef,
      className: "combo-wrap relative",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400",
        children: /*#__PURE__*/_jsxDEV(Icon, {
          name: icon,
          className: "h-5 w-5"
        }, void 0, false)
      }, void 0, false), /*#__PURE__*/_jsxDEV(TextInput, {
        value: value || '',
        onChange: event => {
          onChange(event.target.value);
          setOpen(true);
        },
        onFocus: () => setOpen(true),
        placeholder: placeholder,
        className: "pl-12 pr-12",
        "aria-autocomplete": "list",
        "aria-expanded": open,
        required: required
      }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
        type: "button",
        className: "absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100",
        onClick: () => setOpen(state => !state),
        "aria-label": "Buka pilihan",
        children: /*#__PURE__*/_jsxDEV(Icon, {
          name: "right",
          className: cx('h-4 w-4 transition', open ? 'rotate-90' : '')
        }, void 0, false)
      }, void 0, false), open ? /*#__PURE__*/_jsxDEV("div", {
        className: "combo-panel absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-soft",
        children: visible.length ? visible.map(item => /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "combo-option flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50 active:bg-emerald-50",
          onClick: () => choose(item),
          children: [/*#__PURE__*/_jsxDEV("span", {
            className: "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-50 text-audit-primary",
            children: /*#__PURE__*/_jsxDEV(Icon, {
              name: icon === 'store' ? 'store' : 'user',
              className: "h-4 w-4"
            }, void 0, false)
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            children: [/*#__PURE__*/_jsxDEV("span", {
              className: "block text-sm font-bold text-slate-900",
              children: item.label
            }, void 0, false), item.meta ? /*#__PURE__*/_jsxDEV("span", {
              className: "mt-0.5 block text-xs text-slate-500",
              children: item.meta
            }, void 0, false) : null]
          }, void 0, true)]
        }, (item.value || '') + '-' + item.label, true)) : /*#__PURE__*/_jsxDEV("div", {
          className: "px-4 py-5 text-sm text-slate-500",
          children: "Tidak ada hasil. Nilai yang diketik tetap bisa digunakan sebagai data manual."
        }, void 0, false)
      }, void 0, false) : null]
    }, void 0, true)
  }, void 0, false);
}
function StoreDetailCard({
  detail
}) {
  const items = [['Kode', detail.siteCode4 || detail.siteCode || detail.storeCode || '-'], ['Tipe', detail.type || '-'], ['Kota', detail.city || '-'], ['Store Head', detail.storeHead || '-'], ['Area Manager', detail.areaManager || '-'], ['Regional Manager', detail.regionalManager || '-'], ['Alamat', detail.address || detail.storeAddress || '-']];
  return /*#__PURE__*/_jsxDEV("div", {
    className: "store-detail-card surface-card rounded-[24px] p-4 md:rounded-[28px] md:p-6",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "mb-4 flex min-w-0 items-center justify-between gap-3",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "min-w-0",
        children: [/*#__PURE__*/_jsxDEV("p", {
          className: "text-xs font-bold uppercase tracking-[0.2em] text-audit-primary",
          children: "Detail Store"
        }, void 0, false), /*#__PURE__*/_jsxDEV("h3", {
          className: "mt-1 break-words text-lg font-extrabold leading-tight text-slate-950 md:text-xl",
          children: detail.siteDescr || detail.storeName || 'Store belum dipilih'
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "hidden h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-white md:grid",
        children: /*#__PURE__*/_jsxDEV(Icon, {
          name: "store",
          className: "h-6 w-6"
        }, void 0, false)
      }, void 0, false)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4",
      children: items.map(([label, value]) => /*#__PURE__*/_jsxDEV("div", {
        className: cx('store-detail-item rounded-2xl border border-slate-200 bg-slate-50 p-3', label === 'Alamat' ? 'sm:col-span-2 xl:col-span-2' : ''),
        children: [/*#__PURE__*/_jsxDEV("p", {
          className: "text-[11px] font-bold uppercase tracking-wide text-slate-500",
          children: label
        }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
          className: "mt-1 min-w-0 break-words text-sm font-semibold leading-5 text-slate-800",
          children: value
        }, void 0, false)]
      }, label, true))
    }, void 0, false)]
  }, void 0, true);
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
  if (!touches || touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
const ORIGINAL_PHOTO_CROP_RATIO = {
  key: 'original',
  label: 'Default',
  original: true
};
const PDF_PHOTO_CROP_RATIO = {
  key: 'pdf',
  label: 'PDF Portrait',
  w: 9,
  h: 16
};
const QSC_PHOTO_CROP_RATIO = {
  key: 'qsc',
  label: 'QSC',
  w: 4,
  h: 3
};
const PHOTO_EDITOR_RATIOS = [ORIGINAL_PHOTO_CROP_RATIO, PDF_PHOTO_CROP_RATIO, QSC_PHOTO_CROP_RATIO];
function ratioToAspectString(ratio) {
  if (ratio && ratio.original) return '';
  return ratio && ratio.w && ratio.h ? `${ratio.w} / ${ratio.h}` : '';
}
const MARKER_SIZE_OPTIONS = [{
  key: 'small',
  label: 'Kecil',
  scale: 0.034
}, {
  key: 'medium',
  label: 'Sedang',
  scale: 0.045
}, {
  key: 'large',
  label: 'Besar',
  scale: 0.064
}];
function getEditorCanvasSize(imageElement, ratio = PHOTO_EDITOR_RATIOS[0]) {
  const sourceWidth = Math.max(1, imageElement?.naturalWidth || imageElement?.width || 1080);
  const sourceHeight = Math.max(1, imageElement?.naturalHeight || imageElement?.height || 1080);
  const maxSide = 1400;
  if (ratio?.original) {
    const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
    return {
      width: Math.max(360, Math.round(sourceWidth * scale)),
      height: Math.max(360, Math.round(sourceHeight * scale))
    };
  }
  if (ratio?.w && ratio?.h) {
    const targetRatio = ratio.w / ratio.h;
    let width = maxSide;
    let height = Math.round(width / targetRatio);
    if (height > maxSide) {
      height = maxSide;
      width = Math.round(height * targetRatio);
    }
    return {
      width: Math.max(360, width),
      height: Math.max(360, height)
    };
  }
  const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
  return {
    width: Math.max(360, Math.round(sourceWidth * scale)),
    height: Math.max(360, Math.round(sourceHeight * scale))
  };
}
function getMarkerRadius(canvas, markerSize) {
  const selected = MARKER_SIZE_OPTIONS.find(item => item.key === markerSize) || MARKER_SIZE_OPTIONS[1];
  const minSide = Math.min(canvas?.width || 1080, canvas?.height || 1080);
  return Math.max(24, Math.round(minSide * selected.scale));
}
function PhotoEditorModal({
  open,
  image,
  onClose,
  onSave,
  title = 'Edit Foto',
  cropRatio = PDF_PHOTO_CROP_RATIO
}) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const dragRef = useRef(null);
  const pinchRef = useRef(null);
  const rafRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({
    x: 0,
    y: 0
  });
  const [markers, setMarkers] = useState([]);
  const [mode, setMode] = useState('move');
  const activeCropRatio = ORIGINAL_PHOTO_CROP_RATIO;
  const [selectedRatio, setSelectedRatio] = useState(activeCropRatio);
  const [markerSize, setMarkerSize] = useState('medium');
  const [canvasSize, setCanvasSize] = useState({
    width: 1080,
    height: 1080
  });
  const [imageReady, setImageReady] = useState(false);
  useEffect(() => {
    if (!open) return undefined;
    const body = document.body;
    const html = document.documentElement;
    const previous = {
      bodyOverflow: body.style.overflow,
      bodyOverscroll: body.style.overscrollBehavior,
      htmlOverflow: html.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior
    };
    const stopBackgroundScroll = event => {
      const panel = event.target?.closest?.('.photo-editor-v10-panel');
      if (event.touches && event.touches.length > 1 || !panel) event.preventDefault();
    };
    const stopGestureZoom = event => {
      event.preventDefault();
      event.stopPropagation();
    };
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    document.addEventListener('touchmove', stopBackgroundScroll, {
      passive: false
    });
    document.addEventListener('gesturestart', stopGestureZoom, {
      passive: false
    });
    document.addEventListener('gesturechange', stopGestureZoom, {
      passive: false
    });
    document.addEventListener('gestureend', stopGestureZoom, {
      passive: false
    });
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
  useEffect(() => () => {
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
  }, []);
  useEffect(() => {
    if (!open || !image) return;
    let cancelled = false;
    setImageReady(false);
    setZoom(1);
    setOffset({
      x: 0,
      y: 0
    });
    setMarkers([]);
    setMode('move');
    setSelectedRatio(activeCropRatio);
    setMarkerSize('medium');
    pinchRef.current = null;
    dragRef.current = null;
    loadImageElement(image).then(loaded => {
      if (cancelled) return;
      imgRef.current = loaded;
      setCanvasSize(getEditorCanvasSize(loaded, activeCropRatio));
      setImageReady(true);
      window.requestAnimationFrame(() => drawEditorCanvas(undefined, {
        showGuide: true
      }));
    }).catch(() => {
      if (!cancelled) setImageReady(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, image, activeCropRatio.key]);
  function scheduleDraw(showGuide = true) {
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = window.requestAnimationFrame(() => drawEditorCanvas(undefined, {
      showGuide
    }));
  }
  useEffect(() => {
    if (!open) return;
    scheduleDraw(true);
  }, [zoom, offset, markers, mode, open, canvasSize, imageReady]);
  function getDrawMetrics(nextZoom = zoom, nextOffset = offset) {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return null;
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
    if (!metrics) return nextOffset;
    const maxX = Math.max(0, (metrics.iw - metrics.cw) / 2);
    const maxY = Math.max(0, (metrics.ih - metrics.ch) / 2);
    return {
      x: clamp(nextOffset.x, -maxX, maxX),
      y: clamp(nextOffset.y, -maxY, maxY)
    };
  }
  function drawEditorCanvas(targetCanvas, options = {}) {
    const {
      showGuide = true
    } = options;
    const canvas = targetCanvas || canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    const metrics = getDrawMetrics();
    if (!metrics) return;
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
    markers.forEach(marker => {
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
  function canvasPoint(event) {
    return canvasPointFromClient(event.clientX, event.clientY);
  }
  function touchCenter(touches) {
    const first = touches[0];
    const second = touches[1];
    return canvasPointFromClient((first.clientX + second.clientX) / 2, (first.clientY + second.clientY) / 2);
  }
  function applyZoomAt(point, nextZoom, baseZoom = zoom, baseOffset = offset) {
    const canvas = canvasRef.current;
    if (!canvas) return;
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
    if (!canvasRef.current || !imageReady || pinchRef.current) return;
    event.preventDefault();
    if (mode === 'marker') {
      const point = canvasPoint(event);
      const r = getMarkerRadius(canvasRef.current, markerSize);
      setMarkers(current => [...current, {
        x: point.x,
        y: point.y,
        r
      }]);
      return;
    }
    const point = canvasPoint(event);
    dragRef.current = {
      pointerId: event.pointerId,
      x: point.x,
      y: point.y,
      offsetX: offset.x,
      offsetY: offset.y
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch (error) {}
  }
  function handlePointerMove(event) {
    if (!dragRef.current || mode !== 'move' || dragRef.current.pointerId !== event.pointerId) return;
    event.preventDefault();
    const point = canvasPoint(event);
    const next = {
      x: dragRef.current.offsetX + (point.x - dragRef.current.x),
      y: dragRef.current.offsetY + (point.y - dragRef.current.y)
    };
    setOffset(clampOffset(next, zoom));
  }
  function handlePointerUp(event) {
    if (dragRef.current?.pointerId === event?.pointerId) dragRef.current = null;else dragRef.current = null;
  }
  function handleTouchStart(event) {
    if (event.touches.length === 2) {
      event.preventDefault();
      event.stopPropagation();
      dragRef.current = null;
      pinchRef.current = {
        distance: distanceBetweenTouches(event.touches),
        zoom,
        offset,
        center: touchCenter(event.touches)
      };
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
      if (!canvas) return;
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
    if (!event.touches || event.touches.length < 2) pinchRef.current = null;
  }
  function handleWheel(event) {
    if (!imageReady) return;
    event.preventDefault();
    const point = canvasPoint(event);
    const nextZoom = clamp(zoom * (event.deltaY < 0 ? 1.08 : 0.92), 1, 4);
    applyZoomAt(point, nextZoom);
  }
  function resetEditor() {
    setZoom(1);
    setOffset({
      x: 0,
      y: 0
    });
    setMarkers([]);
    setMode('move');
  }
  function changeRatio(nextRatio) {
    setSelectedRatio(nextRatio);
    setZoom(1);
    setOffset({
      x: 0,
      y: 0
    });
    setMarkers([]);
    if (imgRef.current) setCanvasSize(getEditorCanvasSize(imgRef.current, nextRatio));
  }
  function saveEditedImage() {
    const canvas = canvasRef.current;
    if (!canvas || !imageReady) return;
    drawEditorCanvas(canvas, {
      showGuide: false
    });
    onSave(canvas.toDataURL('image/jpeg', 0.92), {
      width: canvas.width,
      height: canvas.height,
      aspectRatio: canvas.width + ' / ' + canvas.height
    });
    onClose();
  }
  if (!open) return null;
  const hasMarkers = markers.length > 0;
  const modal = /*#__PURE__*/_jsxDEV("div", {
    className: "photo-editor-overlay photo-editor-v10",
    role: "dialog",
    "aria-modal": "true",
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "photo-editor-panel photo-editor-v10-panel bg-white shadow-2xl",
      onClick: event => event.stopPropagation(),
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "photo-editor-header photo-editor-v10-header",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "min-w-0",
          children: [/*#__PURE__*/_jsxDEV("p", {
            className: "photo-editor-eyebrow",
            children: "Edit Foto"
          }, void 0, false), /*#__PURE__*/_jsxDEV("h3", {
            children: title
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "photo-editor-close",
          onClick: onClose,
          "aria-label": "Tutup editor",
          children: /*#__PURE__*/_jsxDEV(Icon, {
            name: "close",
            className: "h-5 w-5"
          }, void 0, false)
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "photo-editor-v10-toolbar",
        role: "toolbar",
        "aria-label": "Toolbar edit foto",
        children: [/*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: cx('photo-editor-tool', mode === 'move' && 'active'),
          onClick: () => setMode('move'),
          "aria-pressed": mode === 'move',
          children: [/*#__PURE__*/_jsxDEV(Icon, {
            name: "crop",
            className: "h-4 w-4"
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            children: "Geser"
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: cx('photo-editor-tool', mode === 'marker' && 'active'),
          onClick: () => setMode('marker'),
          "aria-pressed": mode === 'marker',
          children: [/*#__PURE__*/_jsxDEV(Icon, {
            name: "marker",
            className: "h-4 w-4"
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            children: "Marker"
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "photo-editor-tool",
          onClick: () => setMarkers(current => current.slice(0, -1)),
          disabled: !hasMarkers,
          children: [/*#__PURE__*/_jsxDEV(Icon, {
            name: "left",
            className: "h-4 w-4"
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            children: "Undo"
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "photo-editor-tool",
          onClick: resetEditor,
          children: [/*#__PURE__*/_jsxDEV(Icon, {
            name: "eraser",
            className: "h-4 w-4"
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            children: "Reset"
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "photo-editor-options",
        "aria-label": "Pengaturan marker",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "rounded-2xl bg-emerald-50 px-3 py-2 text-[11px] font-bold leading-4 text-emerald-900 ring-1 ring-emerald-100",
          children: "Crop otomatis mengikuti frame foto PDF."
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "photo-editor-option-row",
          children: [/*#__PURE__*/_jsxDEV("span", {
            children: "Marker"
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "photo-editor-chip-group",
            children: MARKER_SIZE_OPTIONS.map(option => /*#__PURE__*/_jsxDEV("button", {
              type: "button",
              className: cx('photo-editor-chip', markerSize === option.key && 'active'),
              onClick: () => setMarkerSize(option.key),
              children: option.label
            }, option.key, false))
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "photo-editor-canvas-shell photo-editor-v10-stage",
        children: [!imageReady ? /*#__PURE__*/_jsxDEV("div", {
          className: "photo-editor-loading",
          children: "Memuat foto..."
        }, void 0, false) : null, /*#__PURE__*/_jsxDEV("canvas", {
          ref: canvasRef,
          width: canvasSize.width,
          height: canvasSize.height,
          style: {
            aspectRatio: canvasSize.width + ' / ' + canvasSize.height,
            touchAction: 'none'
          },
          className: "photo-editor-canvas",
          onPointerDown: handlePointerDown,
          onPointerMove: handlePointerMove,
          onPointerUp: handlePointerUp,
          onPointerCancel: handlePointerUp,
          onTouchStart: handleTouchStart,
          onTouchMove: handleTouchMove,
          onTouchEnd: handleTouchEnd,
          onWheel: handleWheel
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "photo-editor-v10-footer",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "photo-editor-hint",
          children: /*#__PURE__*/_jsxDEV("span", {
            children: mode === 'marker' ? 'Tap area foto untuk marker.' : 'Cubit untuk zoom, geser foto.'
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "photo-editor-save",
          onClick: saveEditedImage,
          disabled: !imageReady,
          children: [/*#__PURE__*/_jsxDEV(Icon, {
            name: "check",
            className: "h-5 w-5"
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            children: "Simpan"
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true)
  }, void 0, false);
  return ReactDOM?.createPortal ? ReactDOM.createPortal(modal, document.body) : modal;
}
function PhotoInput({
  value,
  onChange,
  onRemove,
  label = 'Foto',
  compact = false,
  rich = false,
  required = false,
  matchCropFrame = false,
  cropRatio = PDF_PHOTO_CROP_RATIO
}) {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorImageOverride, setEditorImageOverride] = useState('');
  async function handleFiles(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange({
        ...(value || blankPhoto()),
        image: dataUrl,
        cropAspect: matchCropFrame ? ratioToAspectString(cropRatio) : ''
      });
      setEditorImageOverride(dataUrl);
      window.setTimeout(() => setEditorOpen(true), 0);
      setEditorOpen(true);
    } catch (error) {
      alert('Foto gagal dibaca. Coba pilih ulang foto.');
    } finally {
      event.target.value = '';
    }
  }
  function clearPhoto() {
    if (!confirmAction(onRemove ? 'Hapus card evidence ini?' : 'Hapus foto ini?')) return;
    if (typeof onRemove === 'function') {
      onRemove();
      return;
    }
    onChange({
      ...(value || blankPhoto()),
      image: ''
    });
  }
  const description = value?.description || '';
  const photoAspect = matchCropFrame ? value?.cropAspect ? String(value.cropAspect) : ratioToAspectString(cropRatio) : '';
  const cardStyle = photoAspect ? {
    '--photo-aspect': photoAspect
  } : undefined;
  return /*#__PURE__*/_jsxDEV("div", {
    className: cx('photo-input-card surface-card overflow-hidden rounded-[26px]', matchCropFrame && 'match-crop-frame'),
    style: cardStyle,
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "flex items-center justify-between border-b border-slate-200 px-4 py-3",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "min-w-0",
        children: /*#__PURE__*/_jsxDEV("p", {
          className: "truncate text-sm font-extrabold text-slate-900",
          children: [label, required ? /*#__PURE__*/_jsxDEV("span", {
            className: "ml-1 text-rose-600",
            children: "*"
          }, void 0, false) : null]
        }, void 0, true)
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        className: "flex shrink-0 gap-2",
        children: [value?.image ? /*#__PURE__*/_jsxDEV(Button, {
          variant: "icon",
          onClick: () => {
            setEditorImageOverride('');
            setEditorOpen(true);
          },
          "aria-label": "Edit crop dan marker",
          children: /*#__PURE__*/_jsxDEV(Icon, {
            name: "crop",
            className: "h-4 w-4"
          }, void 0, false)
        }, void 0, false) : null, value?.image ? /*#__PURE__*/_jsxDEV(Button, {
          variant: "icon",
          onClick: clearPhoto,
          "aria-label": "Hapus foto",
          children: /*#__PURE__*/_jsxDEV(Icon, {
            name: "trash",
            className: "h-4 w-4"
          }, void 0, false)
        }, void 0, false) : null]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: cx('photo-frame relative grid place-items-center overflow-hidden', value?.image ? 'has-image' : '', compact ? 'min-h-[150px]' : 'min-h-[210px]'),
      children: value?.image ? /*#__PURE__*/_jsxDEV("img", {
        src: value.image,
        alt: label
      }, void 0, false) : /*#__PURE__*/_jsxDEV("div", {
        className: "flex flex-col items-center px-5 text-center text-slate-500",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white text-audit-primary shadow-sm",
          children: /*#__PURE__*/_jsxDEV(Icon, {
            name: "image",
            className: "h-7 w-7"
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
          className: "text-sm font-bold text-slate-700",
          children: "Upload foto"
        }, void 0, false)]
      }, void 0, true)
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "photo-actions flex items-center justify-center gap-2 border-t border-slate-200 p-3",
      children: [/*#__PURE__*/_jsxDEV("input", {
        ref: cameraRef,
        type: "file",
        accept: "image/*",
        capture: "environment",
        className: "hidden",
        onChange: handleFiles
      }, void 0, false), /*#__PURE__*/_jsxDEV("input", {
        ref: galleryRef,
        type: "file",
        accept: "image/*",
        className: "hidden",
        onChange: handleFiles
      }, void 0, false), /*#__PURE__*/_jsxDEV(Button, {
        variant: "icon",
        icon: "camera",
        onClick: () => cameraRef.current?.click(),
        "aria-label": "Ambil foto dari kamera"
      }, void 0, false), /*#__PURE__*/_jsxDEV(Button, {
        variant: "icon",
        icon: "gallery",
        onClick: () => galleryRef.current?.click(),
        "aria-label": "Pilih foto dari galeri"
      }, void 0, false)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "border-t border-slate-200 p-3",
      children: rich ? /*#__PURE__*/_jsxDEV(RichTextInput, {
        value: description,
        onChange: nextDescription => onChange({
          ...(value || blankPhoto()),
          description: nextDescription
        }),
        placeholder: "Deskripsi foto...",
        minHeight: 92
      }, void 0, false) : /*#__PURE__*/_jsxDEV(TextArea, {
        value: description,
        onChange: event => onChange({
          ...(value || blankPhoto()),
          description: event.target.value
        }),
        placeholder: "Deskripsi foto...",
        minRows: 2
      }, void 0, false)
    }, void 0, false), /*#__PURE__*/_jsxDEV(PhotoEditorModal, {
      open: editorOpen,
      image: editorImageOverride || value?.image || '',
      title: label,
      cropRatio: cropRatio,
      onClose: () => {
        setEditorOpen(false);
        setEditorImageOverride('');
      },
      onSave: (editedImage, meta) => {
        setEditorImageOverride('');
        onChange({
          ...(value || blankPhoto()),
          image: editedImage,
          cropAspect: meta?.aspectRatio || value?.cropAspect || ratioToAspectString(cropRatio) || ''
        });
      }
    }, void 0, false)]
  }, void 0, true);
}
function SectionShell({
  title,
  children,
  actions,
  preTitle
}) {
  return /*#__PURE__*/_jsxDEV("section", {
    className: "slide-enter fade-in",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "section-heading mb-5 flex flex-col gap-3",
      children: [preTitle ? /*#__PURE__*/_jsxDEV("div", {
        className: "section-pretitle",
        children: preTitle
      }, void 0, false) : null, /*#__PURE__*/_jsxDEV("div", {
        className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        children: [/*#__PURE__*/_jsxDEV("h2", {
          className: "text-2xl font-black tracking-tight text-slate-950 md:text-3xl",
          children: title
        }, void 0, false), actions ? /*#__PURE__*/_jsxDEV("div", {
          className: "section-actions flex flex-wrap gap-2 md:justify-end",
          children: actions
        }, void 0, false) : null]
      }, void 0, true)]
    }, void 0, true), children]
  }, void 0, true);
}
function CrewEditor({
  visit,
  update
}) {
  const crewList = visit.crewList?.length ? visit.crewList : [{
    name: '',
    level: ''
  }];
  const updateCrew = (index, patch) => {
    const next = crewList.map((item, itemIndex) => itemIndex === index ? {
      ...item,
      ...patch
    } : item);
    update({
      crewList: next
    });
  };
  const addCrew = () => update({
    crewList: [...crewList, {
      name: '',
      level: ''
    }]
  });
  const removeCrew = index => {
    if (!confirmAction('Hapus crew ini?')) return;
    const next = crewList.filter((_, itemIndex) => itemIndex !== index);
    update({
      crewList: next.length ? next : [{
        name: '',
        level: ''
      }]
    });
  };
  return /*#__PURE__*/_jsxDEV("div", {
    className: "grid gap-5",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "grid gap-4 md:grid-cols-2",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "surface-card rounded-[28px] p-5",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "mb-4 flex items-center gap-3",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-audit-primary",
            children: /*#__PURE__*/_jsxDEV(Icon, {
              name: "user"
            }, void 0, false)
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            children: /*#__PURE__*/_jsxDEV("h3", {
              className: "font-extrabold text-slate-950",
              children: "Store Leader"
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "grid gap-3 sm:grid-cols-[1fr_120px]",
          children: [/*#__PURE__*/_jsxDEV(Field, {
            label: "Nama",
            children: /*#__PURE__*/_jsxDEV(TextInput, {
              value: visit.storeLeader || '',
              onChange: e => update({
                storeLeader: e.target.value
              }),
              placeholder: "Nama store leader"
            }, void 0, false)
          }, void 0, false), /*#__PURE__*/_jsxDEV(Field, {
            label: "Level",
            children: /*#__PURE__*/_jsxDEV(SelectInput, {
              value: visit.storeLeaderLevel || '',
              onChange: e => update({
                storeLeaderLevel: e.target.value
              }),
              children: JOB_LEVELS.map(level => /*#__PURE__*/_jsxDEV("option", {
                value: level,
                children: level || 'Pilih'
              }, level, false))
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "surface-card rounded-[28px] p-5",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "mb-4 flex items-center gap-3",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "grid h-10 w-10 place-items-center rounded-2xl bg-orange-50 text-audit-accent",
            children: /*#__PURE__*/_jsxDEV(Icon, {
              name: "user"
            }, void 0, false)
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            children: /*#__PURE__*/_jsxDEV("h3", {
              className: "font-extrabold text-slate-950",
              children: "Shift Leader"
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "grid gap-3 sm:grid-cols-[1fr_120px]",
          children: [/*#__PURE__*/_jsxDEV(Field, {
            label: "Nama",
            children: /*#__PURE__*/_jsxDEV(TextInput, {
              value: visit.shiftLeader || '',
              onChange: e => update({
                shiftLeader: e.target.value
              }),
              placeholder: "Nama shift leader"
            }, void 0, false)
          }, void 0, false), /*#__PURE__*/_jsxDEV(Field, {
            label: "Level",
            children: /*#__PURE__*/_jsxDEV(SelectInput, {
              value: visit.shiftLeaderLevel || '',
              onChange: e => update({
                shiftLeaderLevel: e.target.value
              }),
              children: JOB_LEVELS.map(level => /*#__PURE__*/_jsxDEV("option", {
                value: level,
                children: level || 'Pilih'
              }, level, false))
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "surface-card rounded-[28px] p-5 md:p-6",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "mb-5",
        children: /*#__PURE__*/_jsxDEV("h3", {
          className: "text-lg font-extrabold text-slate-950",
          children: "Crew Store"
        }, void 0, false)
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        className: "grid gap-3",
        children: crewList.map((crew, index) => /*#__PURE__*/_jsxDEV("div", {
          className: "grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[44px_1fr_130px_44px] sm:items-end",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "grid h-11 w-11 place-items-center rounded-2xl bg-white text-sm font-black text-slate-600",
            children: index + 1
          }, void 0, false), /*#__PURE__*/_jsxDEV(Field, {
            label: "Nama Crew",
            children: /*#__PURE__*/_jsxDEV(TextInput, {
              value: crew.name || '',
              onChange: e => updateCrew(index, {
                name: e.target.value
              }),
              placeholder: "Nama crew"
            }, void 0, false)
          }, void 0, false), /*#__PURE__*/_jsxDEV(Field, {
            label: "Level",
            children: /*#__PURE__*/_jsxDEV(SelectInput, {
              value: crew.level || '',
              onChange: e => updateCrew(index, {
                level: e.target.value
              }),
              children: JOB_LEVELS.map(level => /*#__PURE__*/_jsxDEV("option", {
                value: level,
                children: level || 'Pilih'
              }, level, false))
            }, void 0, false)
          }, void 0, false), /*#__PURE__*/_jsxDEV(Button, {
            variant: "icon",
            onClick: () => removeCrew(index),
            "aria-label": "Hapus crew",
            children: /*#__PURE__*/_jsxDEV(Icon, {
              name: "trash",
              className: "h-4 w-4"
            }, void 0, false)
          }, void 0, false)]
        }, index, true))
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        className: "mt-4 flex justify-end",
        children: /*#__PURE__*/_jsxDEV(Button, {
          variant: "secondary",
          icon: "plus",
          onClick: addCrew,
          children: "Tambah Crew"
        }, void 0, false)
      }, void 0, false)]
    }, void 0, true)]
  }, void 0, true);
}
function ObservationCards({
  title,
  rows,
  onChange
}) {
  const safeRows = rows?.length ? rows : [blankObservationRow()];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRowNumber = Math.min(activeIndex + 1, safeRows.length);
  useEffect(() => {
    setActiveIndex(current => Math.max(0, Math.min(current, safeRows.length - 1)));
  }, [safeRows.length]);
  const updateRow = (index, patch) => onChange(safeRows.map((row, rowIndex) => rowIndex === index ? {
    ...row,
    ...patch
  } : row));
  const addRow = () => {
    onChange([...safeRows, blankObservationRow()]);
    setActiveIndex(safeRows.length);
  };
  const removeRow = index => {
    if (!confirmAction('Hapus row observation ini?')) return;
    const next = safeRows.filter((_, rowIndex) => rowIndex !== index);
    onChange(next.length ? next : [blankObservationRow()]);
    setActiveIndex(Math.max(0, Math.min(index, (next.length ? next.length : 1) - 1)));
  };
  const goPrev = () => setActiveIndex(current => Math.max(0, current - 1));
  const goNext = () => setActiveIndex(current => Math.min(safeRows.length - 1, current + 1));
  const richField = (label, key, row, index, placeholder) => /*#__PURE__*/_jsxDEV(Field, {
    label: label,
    children: /*#__PURE__*/_jsxDEV(RichTextInput, {
      value: row[key] || '',
      onChange: value => updateRow(index, {
        [key]: value
      }),
      placeholder: placeholder
    }, void 0, false)
  }, void 0, false);
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
  const mobileNavContent = /*#__PURE__*/_jsxDEV("div", {
    className: "observation-inline-nav observation-nav-v68 md:hidden",
    "aria-label": "Navigasi temuan observation",
    style: {
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
    },
    children: [/*#__PURE__*/_jsxDEV("button", {
      type: "button",
      onClick: goPrev,
      disabled: activeIndex <= 0,
      "aria-label": "Temuan sebelumnya",
      style: {
        ...navButtonBase,
        opacity: activeIndex <= 0 ? 0.45 : 1
      },
      children: /*#__PURE__*/_jsxDEV(Icon, {
        name: "left",
        className: "h-4 w-4"
      }, void 0, false)
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "observation-nav-center-v68",
      "aria-live": "polite",
      children: [/*#__PURE__*/_jsxDEV("span", {
        className: "observation-count-badge-v68",
        children: ["Temuan ", activeRowNumber, "/", safeRows.length]
      }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
        type: "button",
        onClick: addRow,
        "aria-label": "Tambah temuan",
        className: "observation-add-center-v68",
        children: /*#__PURE__*/_jsxDEV(Icon, {
          name: "plus",
          className: "h-5 w-5"
        }, void 0, false)
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        className: "observation-count-spacer-v68",
        "aria-hidden": "true"
      }, void 0, false)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
      type: "button",
      onClick: goNext,
      disabled: activeIndex >= safeRows.length - 1,
      "aria-label": "Temuan berikutnya",
      style: {
        ...navButtonBase,
        opacity: activeIndex >= safeRows.length - 1 ? 0.45 : 1
      },
      children: /*#__PURE__*/_jsxDEV(Icon, {
        name: "right",
        className: "h-4 w-4"
      }, void 0, false)
    }, void 0, false)]
  }, void 0, true);
  const mobileNav = typeof document !== 'undefined' && ReactDOM?.createPortal ? ReactDOM.createPortal(mobileNavContent, document.body) : mobileNavContent;
  return /*#__PURE__*/_jsxDEV("div", {
    className: "observation-card-system grid gap-4",
    children: [mobileNav, safeRows.map((row, index) => /*#__PURE__*/_jsxDEV("article", {
      className: cx('observation-item-card surface-card rounded-[28px] p-4 md:p-5', index === activeIndex && 'mobile-active'),
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "mb-4 flex items-center justify-between gap-3",
        children: [/*#__PURE__*/_jsxDEV(Badge, {
          tone: isMeaningfulObservation(row) ? 'success' : 'default',
          children: ["Temuan ", index + 1]
        }, void 0, true), /*#__PURE__*/_jsxDEV(Button, {
          variant: "icon",
          onClick: () => removeRow(index),
          "aria-label": "Hapus row",
          children: /*#__PURE__*/_jsxDEV(Icon, {
            name: "trash",
            className: "h-4 w-4"
          }, void 0, false)
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "grid gap-4 lg:grid-cols-2",
        children: [richField('Temuan', 'temuan', row, index, 'Tuliskan temuan audit...'), richField('Kondisi Ideal', 'kondisiIdeal', row, index, 'Kondisi ideal yang diharapkan...'), richField('Dampak', 'dampak', row, index, 'Dampak terhadap operasional...'), richField('Penyebab', 'penyebab', row, index, 'Penyebab utama...'), richField('Tindakan Aksi', 'tindakan', row, index, 'Aksi perbaikan yang disepakati...'), /*#__PURE__*/_jsxDEV("div", {
          className: "observation-deadline-grid grid gap-4 sm:grid-cols-[170px_minmax(0,1fr)]",
          children: [/*#__PURE__*/_jsxDEV(Field, {
            label: "Deadline",
            children: /*#__PURE__*/_jsxDEV(DateInput, {
              value: row.deadline || '',
              onChange: e => updateRow(index, {
                deadline: e.target.value
              })
            }, void 0, false)
          }, void 0, false), richField('Hasil', 'hasil', row, index, 'Hasil tindakan...')]
        }, void 0, true)]
      }, void 0, true)]
    }, index, true)), /*#__PURE__*/_jsxDEV("div", {
      className: "observation-desktop-add flex justify-end",
      children: /*#__PURE__*/_jsxDEV(Button, {
        variant: "secondary",
        icon: "plus",
        onClick: addRow,
        children: "Tambah Row"
      }, void 0, false)
    }, void 0, false)]
  }, void 0, true);
}
function PhotoGrid({
  photos,
  onChange,
  prefix
}) {
  const minSlots = 8;
  const sourcePhotos = Array.isArray(photos) ? photos : [];
  const safePhotos = Array.from({
    length: Math.max(minSlots, sourcePhotos.length || minSlots)
  }, (_, index) => sourcePhotos[index] || blankPhoto());
  const blankSet = () => Array.from({
    length: minSlots
  }, () => blankPhoto());
  const updatePhoto = (index, value) => onChange(safePhotos.map((photo, photoIndex) => photoIndex === index ? value : photo));
  const removePhotoCard = index => {
    const next = safePhotos.filter((_, photoIndex) => photoIndex !== index);
    onChange(Array.from({
      length: Math.max(minSlots, next.length || minSlots)
    }, (_, photoIndex) => next[photoIndex] || blankPhoto()));
  };
  const addFour = () => onChange([...safePhotos, blankPhoto(), blankPhoto(), blankPhoto(), blankPhoto()]);
  const removeEmpty = () => {
    if (!confirmAction('Rapihkan dan hapus slot foto kosong?')) return;
    const meaningful = safePhotos.filter(photo => photo.image || cleanText(photo.description));
    const next = meaningful.length ? meaningful : blankSet();
    onChange(Array.from({
      length: Math.max(minSlots, next.length)
    }, (_, index) => next[index] || blankPhoto()));
  };
  const renderActions = (position = 'top') => /*#__PURE__*/_jsxDEV("div", {
    className: cx('photo-grid-actions flex flex-wrap gap-2', position === 'top' ? 'items-center justify-end rounded-2xl border border-slate-200 bg-slate-50/80 p-2' : 'justify-end pb-20 md:pb-0'),
    children: [/*#__PURE__*/_jsxDEV(Button, {
      variant: "secondary",
      className: "min-w-[150px] flex-1 justify-center sm:flex-none",
      icon: "eraser",
      onClick: removeEmpty,
      children: "Rapihkan Slot Foto"
    }, void 0, false), /*#__PURE__*/_jsxDEV(Button, {
      variant: "secondary",
      className: "min-w-[150px] flex-1 justify-center sm:flex-none",
      icon: "plus",
      onClick: addFour,
      children: "Tambah Slot Foto"
    }, void 0, false)]
  }, void 0, true);
  return /*#__PURE__*/_jsxDEV("div", {
    className: "photo-grid-system grid gap-4",
    children: [renderActions('top'), /*#__PURE__*/_jsxDEV("div", {
      className: "evidence-photo-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-4",
      children: safePhotos.map((photo, index) => /*#__PURE__*/_jsxDEV(PhotoInput, {
        label: prefix + ' ' + (index + 1),
        value: photo,
        onChange: value => updatePhoto(index, value),
        onRemove: () => removePhotoCard(index),
        compact: true,
        rich: true,
        matchCropFrame: true,
        cropRatio: PDF_PHOTO_CROP_RATIO
      }, index, false))
    }, void 0, false), renderActions('bottom')]
  }, void 0, true);
}
const SECTION_DEFS = [{
  id: 'setup',
  label: 'Visit',
  title: 'Visit Setup',
  icon: 'store',
  hint: 'Bestie & store'
}, {
  id: 'crew',
  label: 'Crew',
  title: 'General Information',
  icon: 'calendar',
  hint: 'Tanggal & PIC'
}, {
  id: 'qsc-result',
  label: 'QSC',
  title: 'QSC / FAMITRACK Result',
  icon: 'camera',
  hint: 'Foto result'
}, {
  id: 'observation',
  label: 'Obs',
  title: 'Observation',
  icon: 'clipboard',
  hint: 'OPI & QSC'
}, {
  id: 'evidence',
  label: 'Evidence',
  title: 'Evidence',
  icon: 'image',
  hint: 'Foto temuan'
}];
function ProgressBar({
  value
}) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)));
  return /*#__PURE__*/_jsxDEV("div", {
    className: "progress-mini",
    role: "progressbar",
    "aria-valuemin": "0",
    "aria-valuemax": "100",
    "aria-valuenow": safeValue,
    children: /*#__PURE__*/_jsxDEV("span", {
      style: {
        width: safeValue + '%'
      }
    }, void 0, false)
  }, void 0, false);
}
function ProgressMissingInfo({
  visit,
  activeSection = null,
  maxItems = 4,
  compact = false
}) {
  const missingItems = visitProgressMissingItems(visit, activeSection);
  if (!visit) return null;
  if (!missingItems.length) {
    return /*#__PURE__*/_jsxDEV("div", {
      className: cx("progress-missing-info-v265 complete", compact && "compact"),
      children: [/*#__PURE__*/_jsxDEV(Icon, {
        name: "check",
        className: "h-3.5 w-3.5"
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        children: "Semua bagian wajib sudah terisi"
      }, void 0, false)]
    }, void 0, true);
  }
  const visible = missingItems.slice(0, maxItems);
  const extra = Math.max(0, missingItems.length - visible.length);
  return /*#__PURE__*/_jsxDEV("div", {
    className: cx("progress-missing-info-v265", compact && "compact"),
    role: "status",
    "aria-live": "polite",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "progress-missing-title-v265",
      children: [/*#__PURE__*/_jsxDEV(Icon, {
        name: "alert",
        className: "h-3.5 w-3.5"
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        children: ["Belum diisi ", /*#__PURE__*/_jsxDEV("strong", {
          children: [missingItems.length, " item"]
        }, void 0, true)]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "progress-missing-list-v265",
      children: [visible.map(item => /*#__PURE__*/_jsxDEV("span", {
        className: "progress-missing-pill-v265",
        children: item.text
      }, `${item.sectionId}-${item.label}`, false)), extra ? /*#__PURE__*/_jsxDEV("span", {
        className: "progress-missing-pill-v265 more",
        children: ["+", extra, " lainnya"]
      }, void 0, true) : null]
    }, void 0, true)]
  }, void 0, true);
}
function VisitSetupSection({
  visit,
  update
}) {
  const storeOptions = useMemo(() => getStoresForBestie(visit.nama).map(item => ({
    label: item.label,
    value: item.value || item.label
  })), [visit.nama]);
  const baseDetail = useMemo(() => getStoreWebDetail(visit.store), [visit.store]);
  const manualDetail = visit.manualStoreDetail || {};
  const detail = useMemo(() => ({
    ...baseDetail,
    ...manualDetail,
    siteDescr: visit.store || manualDetail.siteDescr || baseDetail.siteDescr
  }), [baseDetail, manualDetail, visit.store]);
  const progress = visitProgress(visit);
  const detailValue = (key, fallback = '') => manualDetail[key] ?? fallback ?? '';
  function handleBestieChange(value) {
    const stores = getStoresForBestie(value);
    update({
      nama: value,
      store: stores[0]?.label || '',
      manualStoreDetail: {}
    });
  }
  function handleStoreChange(value) {
    update({
      store: value,
      manualStoreDetail: {}
    });
  }
  function updateStoreDetail(key, value) {
    update({
      manualStoreDetail: {
        ...(visit.manualStoreDetail || {}),
        [key]: value
      }
    });
  }
  return /*#__PURE__*/_jsxDEV(SectionShell, {
    title: "Mulai visit",
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "visit-setup-grid grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:gap-5",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "visit-setup-card surface-card min-w-0 rounded-[24px] p-4 md:rounded-[28px] md:p-6",
        children: /*#__PURE__*/_jsxDEV("div", {
          className: "grid gap-4 md:gap-5",
          children: [/*#__PURE__*/_jsxDEV(SelectField, {
            label: "Nama Bestie",
            required: true,
            value: visit.nama || '',
            options: BESTIE_NAMES,
            onChange: handleBestieChange,
            placeholder: "Pilih nama bestie",
            icon: "user"
          }, void 0, false), /*#__PURE__*/_jsxDEV(SelectField, {
            label: "Store",
            required: true,
            value: visit.store || '',
            options: storeOptions,
            onChange: handleStoreChange,
            placeholder: "Pilih store",
            icon: "store"
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            className: "visit-progress-card rounded-2xl bg-emerald-50 p-4 text-emerald-900 ring-1 ring-emerald-100",
            children: [/*#__PURE__*/_jsxDEV("div", {
              className: "mb-2 flex items-center justify-between gap-3",
              children: [/*#__PURE__*/_jsxDEV("p", {
                className: "text-xs font-bold uppercase tracking-wide",
                children: "Progress"
              }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
                className: "text-sm font-black",
                children: [progress, "%"]
              }, void 0, true)]
            }, void 0, true), /*#__PURE__*/_jsxDEV(ProgressBar, {
              value: progress
            }, void 0, false), /*#__PURE__*/_jsxDEV(ProgressMissingInfo, {
              visit: visit,
              maxItems: 5
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "visit-detail-edit rounded-2xl border border-slate-200 bg-white/80 p-3",
            children: [/*#__PURE__*/_jsxDEV("p", {
              className: "mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-audit-primary",
              children: "Edit detail visit"
            }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
              className: "grid gap-3 sm:grid-cols-2",
              children: [/*#__PURE__*/_jsxDEV(Field, {
                label: "Kode Store",
                children: /*#__PURE__*/_jsxDEV(TextInput, {
                  value: detailValue('siteCode4', baseDetail.siteCode4 || baseDetail.siteCode || baseDetail.storeCode || ''),
                  onChange: event => updateStoreDetail('siteCode4', event.target.value),
                  placeholder: "Kode store"
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV(Field, {
                label: "Store Head",
                children: /*#__PURE__*/_jsxDEV(TextInput, {
                  value: detailValue('storeHead', baseDetail.storeHead || ''),
                  onChange: event => updateStoreDetail('storeHead', event.target.value),
                  placeholder: "Store head"
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV(Field, {
                label: "Area Manager",
                children: /*#__PURE__*/_jsxDEV(TextInput, {
                  value: detailValue('areaManager', baseDetail.areaManager || ''),
                  onChange: event => updateStoreDetail('areaManager', event.target.value),
                  placeholder: "Area manager"
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV(Field, {
                label: "Regional Manager",
                children: /*#__PURE__*/_jsxDEV(TextInput, {
                  value: detailValue('regionalManager', baseDetail.regionalManager || ''),
                  onChange: event => updateStoreDetail('regionalManager', event.target.value),
                  placeholder: "Regional manager"
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV(Field, {
                label: "Email Store",
                children: /*#__PURE__*/_jsxDEV(TextInput, {
                  value: detailValue('emailStore', baseDetail.emailStore || ''),
                  onChange: event => updateStoreDetail('emailStore', event.target.value),
                  placeholder: "Email store"
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV(Field, {
                label: "Alamat",
                children: /*#__PURE__*/_jsxDEV(TextInput, {
                  value: detailValue('address', baseDetail.address || baseDetail.storeAddress || ''),
                  onChange: event => updateStoreDetail('address', event.target.value),
                  placeholder: "Alamat"
                }, void 0, false)
              }, void 0, false)]
            }, void 0, true)]
          }, void 0, true)]
        }, void 0, true)
      }, void 0, false), /*#__PURE__*/_jsxDEV(StoreDetailCard, {
        detail: detail
      }, void 0, false)]
    }, void 0, true)
  }, void 0, false);
}
function GeneralInfoSection({
  visit,
  update
}) {
  return /*#__PURE__*/_jsxDEV(SectionShell, {
    title: "General Information",
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "grid gap-5",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "date-card surface-card rounded-[28px] p-5 md:p-6",
        children: /*#__PURE__*/_jsxDEV(Field, {
          label: "Hari, Tanggal",
          required: true,
          children: /*#__PURE__*/_jsxDEV(DateInput, {
            value: visit.tanggal || '',
            onChange: e => update({
              tanggal: e.target.value
            })
          }, void 0, false)
        }, void 0, false)
      }, void 0, false), /*#__PURE__*/_jsxDEV(CrewEditor, {
        visit: visit,
        update: update
      }, void 0, false)]
    }, void 0, true)
  }, void 0, false);
}
function QscResultSection({
  visit,
  update
}) {
  const enabled = visit.showQSCResult === true;
  const missing = normalizeQscPhotos(visit).filter(photo => !photo.image).length;
  return /*#__PURE__*/_jsxDEV(SectionShell, {
    title: "QSC / FAMITRACK Result",
    actions: /*#__PURE__*/_jsxDEV(Toggle, {
      checked: enabled,
      onChange: value => update({
        showQSCResult: value
      }),
      label: enabled ? 'Hide slide' : 'Unhide slide'
    }, void 0, false),
    children: !enabled ? /*#__PURE__*/_jsxDEV(InactiveSection, {
      title: "Slide QSC/Famitrack disembunyikan"
    }, void 0, false) : /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [missing ? /*#__PURE__*/_jsxDEV("div", {
        className: "mb-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-900",
        children: ["Kurang ", missing, " foto wajib."]
      }, void 0, true) : null, /*#__PURE__*/_jsxDEV("div", {
        className: "qsc-result-photo-grid grid gap-4",
        children: normalizeQscPhotos(visit).map((photo, index) => /*#__PURE__*/_jsxDEV(PhotoInput, {
          value: photo,
          matchCropFrame: true,
          cropRatio: QSC_PHOTO_CROP_RATIO,
          onChange: value => {
            const qscResultPhotos = normalizeQscPhotos(visit).map((item, itemIndex) => itemIndex === index ? value : item);
            update({
              qscResultPhotos,
              qscResultPhoto: qscResultPhotos[0]
            });
          },
          label: 'Foto QSC / FAMITRACK ' + (index + 1),
          required: true
        }, index, false))
      }, void 0, false)]
    }, void 0, true)
  }, void 0, false);
}
function ObservationSection({
  visit,
  update
}) {
  const tab = visit.activeObservationTab === 'qsc' ? 'qsc' : 'opi';
  const setTab = nextTab => update({
    activeObservationTab: nextTab
  });
  const enabled = tab === 'opi' ? visit.showOPITable === true : visit.showQSCTable === true;
  const toggleLabel = tab === 'opi' ? enabled ? 'Hide OPI' : 'Unhide OPI' : enabled ? 'Hide QSC' : 'Unhide QSC';
  const setEnabled = value => tab === 'opi' ? update({
    showOPITable: value
  }) : update({
    showQSCTable: value
  });
  const preTitle = /*#__PURE__*/_jsxDEV("div", {
    className: "section-switcher flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "flex gap-2 overflow-x-auto pb-1",
      children: [/*#__PURE__*/_jsxDEV("button", {
        type: "button",
        className: cx('subnav-chip prominent', tab === 'opi' && 'active'),
        onClick: () => setTab('opi'),
        children: [/*#__PURE__*/_jsxDEV(Icon, {
          name: "clipboard",
          className: "h-4 w-4"
        }, void 0, false), " OPI Project"]
      }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
        type: "button",
        className: cx('subnav-chip prominent', tab === 'qsc' && 'active'),
        onClick: () => setTab('qsc'),
        children: [/*#__PURE__*/_jsxDEV(Icon, {
          name: "clipboard",
          className: "h-4 w-4"
        }, void 0, false), " QSC Observation"]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV(Toggle, {
      checked: enabled,
      onChange: setEnabled,
      label: toggleLabel
    }, void 0, false)]
  }, void 0, true);
  return /*#__PURE__*/_jsxDEV(SectionShell, {
    title: "Observation & Root Cause Analysis",
    preTitle: preTitle,
    children: !enabled ? /*#__PURE__*/_jsxDEV(InactiveSection, {
      title: (tab === 'opi' ? 'OPI Project' : 'QSC Observation') + ' disembunyikan'
    }, void 0, false) : tab === 'opi' ? /*#__PURE__*/_jsxDEV(ObservationCards, {
      title: "OPI Project Observation",
      rows: visit.opiData,
      onChange: opiData => update({
        opiData
      })
    }, "opi", false) : /*#__PURE__*/_jsxDEV(ObservationCards, {
      title: "QSC Observation",
      rows: visit.qscData,
      onChange: qscData => update({
        qscData
      })
    }, "qsc", false)
  }, void 0, false);
}
function EvidenceSection({
  visit,
  update
}) {
  const tab = visit.activeEvidenceTab === 'corrective' ? 'corrective' : 'finding';
  const setTab = nextTab => update({
    activeEvidenceTab: nextTab
  });
  const enabled = tab === 'finding' ? visit.showFindingEvidence === true : visit.showCorrectiveAction === true;
  const setEnabled = value => tab === 'finding' ? update({
    showFindingEvidence: value
  }) : update({
    showCorrectiveAction: value
  });
  const toggleLabel = tab === 'finding' ? enabled ? 'Hide Finding' : 'Unhide Finding' : enabled ? 'Hide Corrective' : 'Unhide Corrective';
  const evidenceTabStyle = {
    minWidth: 0,
    width: '100%',
    justifyContent: 'center',
    paddingLeft: '8px',
    paddingRight: '8px',
    whiteSpace: 'nowrap'
  };
  const preTitle = /*#__PURE__*/_jsxDEV("div", {
    className: "section-switcher flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "grid w-full min-w-0 grid-cols-2 gap-2 md:max-w-[460px]",
      children: [/*#__PURE__*/_jsxDEV("button", {
        type: "button",
        className: cx('subnav-chip prominent', tab === 'finding' && 'active'),
        style: evidenceTabStyle,
        onClick: () => setTab('finding'),
        children: [/*#__PURE__*/_jsxDEV(Icon, {
          name: "image",
          className: "h-4 w-4 shrink-0"
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          className: "min-w-0 truncate",
          children: "Finding Evidence"
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
        type: "button",
        className: cx('subnav-chip prominent', tab === 'corrective' && 'active'),
        style: evidenceTabStyle,
        onClick: () => setTab('corrective'),
        children: [/*#__PURE__*/_jsxDEV(Icon, {
          name: "image",
          className: "h-4 w-4 shrink-0"
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          className: "min-w-0 truncate",
          children: "Corrective Action"
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV(Toggle, {
      checked: enabled,
      onChange: setEnabled,
      label: toggleLabel
    }, void 0, false)]
  }, void 0, true);
  return /*#__PURE__*/_jsxDEV(SectionShell, {
    title: "Evidence Photos",
    preTitle: preTitle,
    children: !enabled ? /*#__PURE__*/_jsxDEV(InactiveSection, {
      title: (tab === 'finding' ? 'Finding Evidence' : 'Corrective Action') + ' disembunyikan'
    }, void 0, false) : tab === 'finding' ? /*#__PURE__*/_jsxDEV(PhotoGrid, {
      prefix: "Finding",
      photos: visit.findingEvidencePhotos,
      onChange: findingEvidencePhotos => update({
        findingEvidencePhotos
      })
    }, void 0, false) : /*#__PURE__*/_jsxDEV(PhotoGrid, {
      prefix: "Corrective",
      photos: visit.correctiveActionPhotos,
      onChange: correctiveActionPhotos => update({
        correctiveActionPhotos
      })
    }, void 0, false)
  }, void 0, false);
}
function AssignmentSection({
  visit,
  update,
  onPreview
}) {
  return /*#__PURE__*/_jsxDEV(SectionShell, {
    title: "Store Assignment",
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "surface-card rounded-[28px] p-5 md:p-6",
      children: [/*#__PURE__*/_jsxDEV(Field, {
        label: "Assignment Link",
        children: /*#__PURE__*/_jsxDEV(TextInput, {
          type: "url",
          value: visit.storeAssignmentLink || '',
          onChange: e => update({
            storeAssignmentLink: e.target.value
          }),
          placeholder: "https://..."
        }, void 0, false)
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        className: "mt-5 flex flex-wrap gap-2",
        children: /*#__PURE__*/_jsxDEV(Button, {
          icon: "eye",
          onClick: onPreview,
          children: "Preview PDF"
        }, void 0, false)
      }, void 0, false)]
    }, void 0, true)
  }, void 0, false);
}
function InstallGuideModal({
  open,
  onClose,
  deferredPrompt,
  onPromptUsed
}) {
  const ua = navigator.userAgent || '';
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const [guideMode, setGuideMode] = useState(isIos || isAndroid ? 'mobile' : 'desktop');
  useEffect(() => {
    if (open) setGuideMode(isIos || isAndroid ? 'mobile' : 'desktop');
  }, [open, isIos, isAndroid]);
  const mobileGuides = [{
    browser: 'Chrome Android',
    steps: 'Buka menu tiga titik, pilih “Install app” atau “Tambahkan ke layar utama”, lalu konfirmasi install.'
  }, {
    browser: 'Samsung Internet',
    steps: 'Buka menu ≡, pilih “Add page to”, lalu pilih “Home screen” atau “Apps screen”.'
  }, {
    browser: 'Microsoft Edge Android',
    steps: 'Buka menu bawah, pilih “Add to phone” atau “Install app”, lalu ikuti konfirmasi.'
  }, {
    browser: 'Firefox Android',
    steps: 'Buka menu tiga titik, pilih “Install” bila tersedia. Jika tidak ada, pilih “Add to Home screen”.'
  }, {
    browser: 'iPhone / iPad Safari',
    steps: 'Tekan tombol Share, pilih “Add to Home Screen”, lalu tekan “Add”.'
  }, {
    browser: 'iPhone Chrome / Edge / Firefox',
    steps: 'Di iPhone tidak ada auto install. Buka menu Share browser, lalu pilih “Add to Home Screen”.'
  }];
  const desktopGuides = [{
    browser: 'Chrome Desktop',
    steps: 'Klik icon install di address bar, atau buka menu ⋮ lalu pilih “Install app”.'
  }, {
    browser: 'Microsoft Edge',
    steps: 'Buka menu ⋯ lalu pilih “Apps” → “Install this site as an app”.'
  }, {
    browser: 'Firefox Desktop',
    steps: 'Gunakan menu browser lalu pilih “Install” bila tersedia. Jika tidak ada, buat shortcut manual di desktop/bookmarks.'
  }, {
    browser: 'Safari macOS',
    steps: 'Buka File → Add to Dock atau gunakan Share / Shortcut sesuai versi macOS.'
  }];
  async function installNow() {
    if (!deferredPrompt) return;
    try {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      onPromptUsed?.();
      onClose();
    } catch (error) {
      onPromptUsed?.();
    }
  }
  if (!open) return null;
  const canAutoInstall = Boolean(deferredPrompt) && !isIos;
  const guideItems = guideMode === 'mobile' ? mobileGuides : desktopGuides;
  return /*#__PURE__*/_jsxDEV("div", {
    className: "fixed inset-0 z-[88] grid place-items-end bg-slate-950/65 p-0 backdrop-blur-sm md:place-items-center md:p-6",
    role: "dialog",
    "aria-modal": "true",
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "w-full rounded-t-[30px] bg-white p-5 shadow-2xl md:max-w-2xl md:rounded-[30px] md:p-6",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "mb-4 flex items-start justify-between gap-3",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "flex items-center gap-3",
          children: [/*#__PURE__*/_jsxDEV("span", {
            className: "grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-audit-primary",
            children: /*#__PURE__*/_jsxDEV(Icon, {
              name: "spark"
            }, void 0, false)
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            children: [/*#__PURE__*/_jsxDEV("p", {
              className: "text-xs font-extrabold uppercase tracking-[0.18em] text-audit-primary",
              children: "Install Apps"
            }, void 0, false), /*#__PURE__*/_jsxDEV("h2", {
              className: "text-xl font-black text-slate-950",
              children: "Tambahkan Bestie Visit ke perangkat"
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV(Button, {
          variant: "icon",
          onClick: onClose,
          "aria-label": "Tutup",
          children: /*#__PURE__*/_jsxDEV(Icon, {
            name: "close",
            className: "h-4 w-4"
          }, void 0, false)
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "mb-4 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "install-guide-tabs",
          children: [/*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: cx('install-guide-tab', guideMode === 'mobile' && 'active'),
            onClick: () => setGuideMode('mobile'),
            children: "Tutorial Mobile"
          }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: cx('install-guide-tab', guideMode === 'desktop' && 'active'),
            onClick: () => setGuideMode('desktop'),
            children: "Tutorial Desktop"
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("p", {
          className: "mt-3 text-xs font-semibold leading-5 text-slate-500",
          children: canAutoInstall ? 'Browser ini mendukung auto install. Gunakan tombol di bawah untuk menambahkan aplikasi dengan cepat.' : isIos ? 'Di iPhone / iPad auto install tidak didukung, jadi gunakan tutorial manual sesuai browser.' : 'Jika browser tidak menampilkan prompt install otomatis, gunakan langkah manual sesuai browser yang Anda pakai.'
        }, void 0, false)]
      }, void 0, true), canAutoInstall ? /*#__PURE__*/_jsxDEV(Button, {
        className: "mb-4 w-full",
        icon: "download",
        onClick: installNow,
        children: "Auto Add to Home / Install App"
      }, void 0, false) : null, /*#__PURE__*/_jsxDEV("div", {
        className: "install-guide-grid",
        children: guideItems.map(item => /*#__PURE__*/_jsxDEV("div", {
          className: "install-guide-card",
          children: [/*#__PURE__*/_jsxDEV("strong", {
            children: item.browser
          }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
            children: item.steps
          }, void 0, false)]
        }, item.browser, true))
      }, void 0, false)]
    }, void 0, true)
  }, void 0, false);
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
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    if (parsed?.app === 'regional-bestie-visit-report' && parsed?.type === 'linked-device' && parsed?.deviceId) return parsed;
  } catch (error) {
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
  } catch (error) {
    // Bukan URL valid.
  }
  return null;
}
function linkedDeviceQrFallbackUrl(payload) {
  return 'https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=' + encodeURIComponent(payload);
}
function LinkedDeviceModal({
  open,
  onClose,
  historyCount = 0
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [scanOpen, setScanOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [qrText, setQrText] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const stopScanner = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
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
      window.QRCode.toDataURL(payload, {
        width: 260,
        margin: 2,
        errorCorrectionLevel: 'M'
      }, (error, url) => {
        if (!error && url) setQrDataUrl(url);
      });
    }
    return () => stopScanner();
  }, [open]);
  function saveLinkedDevice(payload) {
    localStorage.setItem('rbv_linked_desktop_device', JSON.stringify({
      ...payload,
      linkedAt: new Date().toISOString()
    }));
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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        },
        audio: false
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      video.setAttribute('playsInline', 'true');
      await video.play();
      setScanStatus('Arahkan kamera ke QR desktop.');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', {
        willReadFrequently: true
      });
      const scanFrame = () => {
        if (!videoRef.current || !ctx) return;
        const w = video.videoWidth || 0;
        const h = video.videoHeight || 0;
        if (w && h) {
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(video, 0, 0, w, h);
          const imageData = ctx.getImageData(0, 0, w, h);
          const code = window.jsQR(imageData.data, w, h);
          if (code?.data && handleScanResult(code.data)) return;
        }
        rafRef.current = requestAnimationFrame(scanFrame);
      };
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch (error) {
      console.warn('Scan QR gagal:', error);
      setScanStatus('Tidak bisa membuka kamera. Pastikan izin kamera diberikan.');
      stopScanner();
    }
  }
  if (!open) return null;
  return React.createElement('div', {
    className: 'fixed inset-0 z-[90] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm'
  }, React.createElement('div', {
    className: 'max-h-[92vh] w-full max-w-md overflow-y-auto rounded-[28px] bg-white shadow-2xl ring-1 ring-slate-200'
  }, React.createElement('div', {
    className: 'flex items-start justify-between gap-3 border-b border-slate-100 p-5'
  }, React.createElement('div', null, React.createElement('p', {
    className: 'text-[11px] font-extrabold uppercase tracking-[0.2em] text-audit-primary'
  }, 'Linked Device'), React.createElement('h2', {
    className: 'mt-1 text-xl font-black text-slate-950'
  }, 'Scan QR Desktop')), React.createElement('button', {
    type: 'button',
    className: 'grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600',
    onClick: () => {
      stopScanner();
      onClose();
    },
    'aria-label': 'Tutup linked device'
  }, React.createElement(Icon, {
    name: 'close',
    className: 'h-5 w-5'
  }))), React.createElement('div', {
    className: 'space-y-4 p-5'
  }, React.createElement('div', {
    className: 'rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100'
  }, React.createElement('div', {
    className: 'mx-auto grid h-[270px] w-[270px] max-w-full place-items-center rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200'
  }, qrDataUrl ? React.createElement('img', {
    src: qrDataUrl,
    alt: 'QR linked device',
    className: 'h-full w-full object-contain',
    onError: () => setQrDataUrl('')
  }) : React.createElement('div', {
    className: 'text-center text-sm font-bold text-slate-500'
  }, 'QR belum tersedia. Gunakan Salin Kode.')), React.createElement('p', {
    className: 'mt-3 text-center text-xs leading-5 text-slate-500'
  }, 'Buka menu Linked Device di desktop, lalu scan QR dari device yang ingin dihubungkan.')), React.createElement('div', {
    className: 'grid grid-cols-2 gap-2'
  }, React.createElement('button', {
    type: 'button',
    className: 'inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-audit-primary px-4 text-sm font-extrabold text-white shadow-sm',
    onClick: startScanner
  }, React.createElement(Icon, {
    name: 'qr',
    className: 'h-5 w-5'
  }), React.createElement('span', null, 'Scan QR')), React.createElement('button', {
    type: 'button',
    className: 'inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200',
    onClick: () => {
      navigator.clipboard?.writeText(qrText);
      setScanStatus('Kode linked device disalin.');
    }
  }, React.createElement(Icon, {
    name: 'clipboard',
    className: 'h-5 w-5'
  }), React.createElement('span', null, 'Salin Kode'))), scanOpen ? React.createElement('div', {
    className: 'mx-auto max-w-sm overflow-hidden rounded-3xl bg-slate-950 p-2 shadow-inner'
  }, React.createElement('video', {
    ref: videoRef,
    className: 'mx-auto aspect-square w-full rounded-2xl object-cover',
    muted: true,
    playsInline: true
  })) : null, React.createElement('div', {
    className: 'rounded-2xl bg-sky-50 p-3 text-xs font-semibold leading-5 text-sky-800 ring-1 ring-sky-200'
  }, 'Linked device memakai identitas perangkat dan siap disambungkan ke Netlify untuk sync database.'), scanStatus ? React.createElement('p', {
    className: 'rounded-2xl bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-800 ring-1 ring-emerald-200'
  }, scanStatus) : null, React.createElement('p', {
    className: 'text-center text-[11px] font-bold text-slate-400'
  }, 'History lokal saat ini: ', String(historyCount)))));
}
function HomeUpdateNotice({
  config
}) {
  const notice = normalizeUpdateNoticeConfig(config || readUpdateNoticeConfig());
  const messages = notice.messages || [];
  const [index, setIndex] = useState(0);
  const messageSignature = messages.join('|');
  useEffect(() => {
    setIndex(0);
  }, [messageSignature, notice.enabled]);
  useEffect(() => {
    if (!notice.enabled || messages.length <= 1) return undefined;
    const timer = window.setInterval(() => setIndex(current => (current + 1) % messages.length), Math.round(notice.intervalSeconds * 1000));
    return () => window.clearInterval(timer);
  }, [notice.enabled, messages.length, notice.intervalSeconds, messageSignature]);
  if (!notice.enabled || !messages.length) return null;
  const activeMessage = messages[index % messages.length] || messages[0];
  return /*#__PURE__*/_jsxDEV("section", {
    className: "home-update-notice rounded-[24px] bg-white/90 px-4 py-4 shadow-sm",
    style: {
      overflow: 'hidden'
    },
    children: [/*#__PURE__*/_jsxDEV("style", {
      children: `@keyframes rbvNoticeSmoothIn{0%{opacity:0;transform:translate3d(18px,0,0) scale(.985)}100%{opacity:1;transform:translate3d(0,0,0) scale(1)}} @keyframes rbvNoticeDot{0%,100%{transform:scale(.72);opacity:.34}50%{transform:scale(1);opacity:1}} @keyframes rbvInstallPulse{0%,100%{box-shadow:0 0 0 0 rgba(15,118,110,.28);transform:translateY(0)}50%{box-shadow:0 0 0 8px rgba(15,118,110,0);transform:translateY(-1px)}}`
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "mx-auto flex min-h-[112px] max-w-2xl flex-col items-center justify-center text-center",
      children: [/*#__PURE__*/_jsxDEV("p", {
        className: "text-[10px] font-black uppercase tracking-[0.24em] text-audit-primary",
        children: "Informasi Update"
      }, void 0, false), /*#__PURE__*/_jsxDEV("h2", {
        className: "mt-1 max-w-full truncate text-base font-black text-slate-950",
        children: notice.title
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        className: "mt-2 flex min-h-[42px] w-full items-center justify-center overflow-hidden px-2",
        children: /*#__PURE__*/_jsxDEV("p", {
          className: "mx-auto max-w-[34rem] text-center text-sm font-bold leading-5 text-slate-700",
          style: {
            animation: 'rbvNoticeSmoothIn 620ms cubic-bezier(.22,1,.36,1) both',
            willChange: 'opacity, transform'
          },
          children: activeMessage
        }, `${index}-${activeMessage}`, false)
      }, void 0, false), messages.length > 1 ? /*#__PURE__*/_jsxDEV("div", {
        className: "mt-2 flex items-center justify-center gap-1.5",
        "aria-label": `${index + 1} dari ${messages.length} info`,
        children: messages.map((_, dotIndex) => /*#__PURE__*/_jsxDEV("span", {
          className: "h-1.5 w-1.5 rounded-full",
          style: {
            background: dotIndex === index ? '#0f766e' : 'rgba(148,163,184,.5)',
            animation: dotIndex === index ? 'rbvNoticeDot 1.6s ease-in-out infinite' : 'none'
          }
        }, dotIndex, false))
      }, void 0, false) : null]
    }, void 0, true)]
  }, void 0, true);
}
function AnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalStores: 0,
    monthlyBesties: [],
    monthlyVisits: []
  });
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      try {
        const rows = await fetchMonitorRowsFromConvex();
        if (cancelled || !rows) return;
        const storeCodes = new Set();
        const bestiesByMonth = {};
        const visitsByMonth = {};
        rows.forEach(row => {
          if (row.store_code) storeCodes.add(row.store_code.trim());else if (row.store_name) storeCodes.add(row.store_name.trim());
          let dateStr = row.visit_date || row.updated_at || '';
          let monthMatch = dateStr.match(/^(\d{4}-\d{2})/);
          if (!monthMatch) {
            try {
              const d = new Date(dateStr);
              if (!isNaN(d)) {
                monthMatch = [null, `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`];
              }
            } catch (e) {}
          }
          const month = monthMatch ? monthMatch[1] : 'Unknown';
          if (!bestiesByMonth[month]) bestiesByMonth[month] = new Set();
          if (row.bestie_name) bestiesByMonth[month].add(row.bestie_name.trim());
          if (!visitsByMonth[month]) visitsByMonth[month] = 0;
          visitsByMonth[month] += 1;
        });
        const sortedMonths = Object.keys(visitsByMonth).filter(m => m !== 'Unknown').sort();
        const monthlyBestiesData = sortedMonths.map(m => ({
          month: m,
          count: bestiesByMonth[m] ? bestiesByMonth[m].size : 0
        }));
        const monthlyVisitsData = sortedMonths.map(m => ({
          month: m,
          count: visitsByMonth[m] || 0
        }));
        setData({
          totalStores: storeCodes.size,
          monthlyBesties: monthlyBestiesData,
          monthlyVisits: monthlyVisitsData,
          labels: sortedMonths
        });
      } catch (error) {
        console.warn('Gagal fetch data analytics:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (loading || !chartRef.current || !data.labels || data.labels.length === 0) return;
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    if (typeof window.Chart === 'undefined') {
      console.warn('Chart.js tidak dimuat. Pastikan ada tag script Chart.js di index.html');
      return;
    }
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Jumlah Kunjungan (Tren)',
          data: data.monthlyVisits.map(d => d.count),
          backgroundColor: 'rgba(15, 118, 110, 0.7)',
          borderColor: 'rgba(15, 118, 110, 1)',
          borderWidth: 1,
          borderRadius: 4,
          yAxisID: 'y'
        }, {
          label: 'Jumlah Bestie Aktif',
          type: 'line',
          data: data.monthlyBesties.map(d => d.count),
          backgroundColor: 'rgba(234, 179, 8, 1)',
          borderColor: 'rgba(234, 179, 8, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(255, 255, 255, 1)',
          pointBorderColor: 'rgba(234, 179, 8, 1)',
          tension: 0.3,
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Visits'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: 'Besties'
            }
          }
        }
      }
    });
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [loading, data]);
  if (loading) {
    return /*#__PURE__*/_jsxDEV("div", {
      className: "flex items-center justify-center py-20",
      children: [/*#__PURE__*/_jsxDEV("span", {
        className: "loading-spinner",
        "aria-hidden": "true"
      }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
        className: "ml-3 text-slate-500 font-semibold",
        children: "Memuat data analitik..."
      }, void 0, false)]
    }, void 0, true);
  }
  return /*#__PURE__*/_jsxDEV("div", {
    className: "analytics-view space-y-4 mb-8",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "grid grid-cols-1 md:grid-cols-2 gap-4",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "glass-panel p-6 rounded-[24px] flex flex-col justify-center items-center shadow-sm",
        children: [/*#__PURE__*/_jsxDEV("p", {
          className: "text-sm font-semibold text-slate-500 mb-1",
          children: "Total Store Dikunjungi"
        }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
          className: "text-5xl font-black text-slate-900 tracking-tight",
          children: data.totalStores
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "glass-panel p-6 rounded-[24px] flex flex-col justify-center items-center shadow-sm",
        children: [/*#__PURE__*/_jsxDEV("p", {
          className: "text-sm font-semibold text-slate-500 mb-1",
          children: "Total Kunjungan Keseluruhan"
        }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
          className: "text-5xl font-black text-audit-primary tracking-tight",
          children: data.monthlyVisits.reduce((acc, curr) => acc + curr.count, 0)
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "glass-panel p-5 rounded-[24px] shadow-sm",
      children: [/*#__PURE__*/_jsxDEV("h3", {
        className: "text-lg font-bold text-slate-900 mb-4 px-1",
        children: "Tren Kunjungan & Aktivitas Bestie (Bulanan)"
      }, void 0, false), data.labels && data.labels.length > 0 ? /*#__PURE__*/_jsxDEV("div", {
        className: "relative w-full overflow-hidden",
        style: {
          height: '320px'
        },
        children: /*#__PURE__*/_jsxDEV("canvas", {
          ref: chartRef
        }, void 0, false)
      }, void 0, false) : /*#__PURE__*/_jsxDEV("div", {
        className: "flex items-center justify-center py-12 bg-slate-50 rounded-xl border border-slate-100",
        children: /*#__PURE__*/_jsxDEV("p", {
          className: "text-slate-500 font-medium",
          children: "Belum ada data yang cukup untuk menampilkan grafik."
        }, void 0, false)
      }, void 0, false)]
    }, void 0, true)]
  }, void 0, true);
}
function DashboardPage({
  history,
  storageLabel,
  onNewVisit,
  onOpenVisit,
  onDeleteVisit,
  onClearHistory,
  onTitleTap
}) {
  const [activeTab, setActiveTab] = useState('home');
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
    const syncNotice = event => setNoticeConfig(event?.detail ? normalizeUpdateNoticeConfig(event.detail) : readUpdateNoticeConfig());
    window.addEventListener('rbv-update-notice-change', syncNotice);
    window.addEventListener('storage', syncNotice);
    return () => {
      window.removeEventListener('rbv-update-notice-change', syncNotice);
      window.removeEventListener('storage', syncNotice);
    };
  }, []);
  async function handleManualWebsiteSync() {
    if (syncBusy) return;
    setSyncBusy(true);
    setSyncMessage('Membersihkan cache...');
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter(key => key.startsWith('bestie-visit-')).map(key => caches.delete(key)));
      }
      setSyncMessage('Mengambil update terbaru...');
      if (navigator.serviceWorker?.getRegistrations) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        registrations.forEach(registration => {
          registration.update?.().catch(() => {});
          if (registration.waiting) registration.waiting.postMessage({
            type: 'SKIP_WAITING'
          });
        });
      }
    } catch (error) {
      console.warn('Manual sync website gagal:', error);
    }
    const url = new URL(window.location.href);
    url.searchParams.set('v', APP_BUILD_VERSION);
    url.searchParams.set('manualSync', String(Date.now()));
    setSyncMessage('Reload update...');
    window.setTimeout(() => window.location.replace(url.toString()), 180);
  }
  async function handleBackupData() {
    if (backupBusy) return;
    try {
      setBackupBusy(true);
      await backupVisitReportData();
    } catch (error) {
      console.warn('Backup data gagal:', error);
      alert(error?.message || 'Backup data gagal.');
    } finally {
      setBackupBusy(false);
    }
  }
  async function handleRestoreFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || restoreBusy) return;
    try {
      setRestoreBusy(true);
      await restoreVisitReportDataFromFile(file);
    } catch (error) {
      console.warn('Restore data gagal:', error);
      alert(error?.message || 'Restore data gagal. Pastikan file backup benar.');
    } finally {
      setRestoreBusy(false);
    }
  }
  return /*#__PURE__*/_jsxDEV("main", {
    className: "dashboard-page mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 pb-28 md:px-8 md:py-8 md:pb-28",
    children: [/*#__PURE__*/_jsxDEV("style", {
      children: `@keyframes rbvInstallPulse{0%,100%{box-shadow:0 0 0 0 rgba(15,118,110,.28);transform:translateY(0)}50%{box-shadow:0 0 0 8px rgba(15,118,110,0);transform:translateY(-1px)}}`
    }, void 0, false), /*#__PURE__*/_jsxDEV("section", {
      className: "dashboard-compact glass-panel overflow-hidden rounded-[24px] p-4 md:rounded-[28px] md:p-5",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "flex items-start justify-between gap-3",
        children: [/*#__PURE__*/_jsxDEV("button", {
          type: "button",
          onClick: onTitleTap,
          className: "min-w-0 text-left",
          children: [/*#__PURE__*/_jsxDEV("h1", {
            className: "text-xl font-black tracking-tight text-slate-950 md:text-3xl",
            children: "Regional Bestie Visit Report"
          }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
            className: "mt-1 text-xs font-semibold text-slate-500",
            children: "Home"
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "history-sync-wrap flex shrink-0 items-center gap-2",
          children: [/*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: "dashboard-stat dark history-number-card min-w-[84px] px-3 py-2",
            onClick: onTitleTap,
            "aria-label": "History",
            children: [/*#__PURE__*/_jsxDEV(Icon, {
              name: "history",
              className: "h-4 w-4"
            }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
              children: "History"
            }, void 0, false), /*#__PURE__*/_jsxDEV("strong", {
              children: history.length
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: cx('manual-sync-button', syncBusy && 'is-loading'),
            onClick: handleManualWebsiteSync,
            "aria-label": "Manual sync perubahan website",
            title: "Sync update website",
            disabled: syncBusy,
            children: [syncBusy ? /*#__PURE__*/_jsxDEV("span", {
              className: "loading-spinner mini",
              "aria-hidden": "true"
            }, void 0, false) : /*#__PURE__*/_jsxDEV(Icon, {
              name: "download",
              className: "h-4 w-4"
            }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
              children: syncBusy ? 'Sync...' : 'Sync'
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "mt-3",
        "data-build": "revamp82-preview-send-email-gmail-api",
        children: [/*#__PURE__*/_jsxDEV("input", {
          ref: restoreInputRef,
          type: "file",
          accept: "application/json,.json",
          className: "hidden",
          onChange: handleRestoreFile
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
          children: [/*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: cx('flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl bg-white/90 px-2 text-[10px] font-extrabold leading-none text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 active:scale-[0.98]', backupBusy && 'pointer-events-none opacity-60'),
            onClick: handleBackupData,
            "aria-label": "Backup data",
            title: "Backup data",
            children: [/*#__PURE__*/_jsxDEV(Icon, {
              name: "download",
              className: "h-4 w-4 shrink-0 text-audit-primary"
            }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
              className: "block max-w-full truncate",
              children: "Backup"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: cx('flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl bg-white/90 px-2 text-[10px] font-extrabold leading-none text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 active:scale-[0.98]', restoreBusy && 'pointer-events-none opacity-60'),
            onClick: () => restoreInputRef.current?.click(),
            "aria-label": "Restore data",
            title: "Restore data",
            children: [/*#__PURE__*/_jsxDEV(Icon, {
              name: "upload",
              className: "h-4 w-4 shrink-0 text-audit-primary"
            }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
              className: "block max-w-full truncate",
              children: "Restore"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: "flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl bg-emerald-50/90 px-2 text-[10px] font-extrabold leading-none text-audit-primary shadow-sm ring-1 ring-emerald-200 transition hover:-translate-y-0.5 active:scale-[0.98]",
            style: {
              animation: 'rbvInstallPulse 1.8s ease-in-out infinite'
            },
            onClick: () => setInstallOpen(true),
            "aria-label": "Info install apps",
            children: [/*#__PURE__*/_jsxDEV(Icon, {
              name: "spark",
              className: "h-4 w-4 shrink-0"
            }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
              className: "block max-w-full truncate",
              children: "Install"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: "flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[10px] font-extrabold leading-none shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]",
            style: {
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.28)',
              boxShadow: '0 10px 22px rgba(185,28,28,0.24)'
            },
            onClick: onClearHistory,
            "aria-label": "Hapus history kunjungan",
            title: "Hapus History",
            children: [/*#__PURE__*/_jsxDEV(Icon, {
              name: "trash",
              className: "h-4 w-4 shrink-0"
            }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
              className: "block max-w-full truncate",
              style: {
                color: '#ffffff'
              },
              children: "Hapus History"
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), syncBusy ? /*#__PURE__*/_jsxDEV("div", {
          className: "sync-loading-bar mt-3",
          children: [/*#__PURE__*/_jsxDEV("span", {
            className: "loading-spinner mini",
            "aria-hidden": "true"
          }, void 0, false), /*#__PURE__*/_jsxDEV("strong", {
            children: syncMessage || 'Sync update...'
          }, void 0, false)]
        }, void 0, true) : null]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "flex justify-center my-4 w-full px-2",
      children: /*#__PURE__*/_jsxDEV("div", {
        className: "flex bg-slate-200/70 p-1.5 rounded-[18px] w-full max-w-sm shadow-inner gap-1",
        children: [/*#__PURE__*/_jsxDEV("button", {
          type: "button",
          onClick: () => setActiveTab('home'),
          className: cx("flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300", activeTab === 'home' ? "bg-white text-audit-primary shadow" : "text-slate-500 hover:text-slate-700"),
          children: "Beranda"
        }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          onClick: () => setActiveTab('analytics'),
          className: cx("flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300", activeTab === 'analytics' ? "bg-white text-audit-primary shadow" : "text-slate-500 hover:text-slate-700"),
          children: "Analitik"
        }, void 0, false)]
      }, void 0, true)
    }, void 0, false), activeTab === 'home' ? /*#__PURE__*/_jsxDEV(_Fragment, {
      children: [/*#__PURE__*/_jsxDEV(HomeUpdateNotice, {
        config: noticeConfig
      }, void 0, false), /*#__PURE__*/_jsxDEV("section", {
        className: "dashboard-history-section",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "mb-3 flex items-center justify-between gap-3",
          children: /*#__PURE__*/_jsxDEV("h2", {
            className: "text-lg font-black tracking-tight text-slate-950 md:text-2xl",
            children: "History Kunjungan"
          }, void 0, false)
        }, void 0, false), history.length ? /*#__PURE__*/_jsxDEV("div", {
          className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3",
          children: history.map(item => /*#__PURE__*/_jsxDEV("article", {
            className: "history-card surface-card rounded-[22px] p-4 transition hover:-translate-y-0.5 hover:shadow-soft md:p-5",
            children: [/*#__PURE__*/_jsxDEV("div", {
              className: "mb-3 flex items-start justify-between gap-3",
              children: [/*#__PURE__*/_jsxDEV("div", {
                className: "min-w-0",
                children: [/*#__PURE__*/_jsxDEV("p", {
                  className: "truncate text-base font-extrabold text-slate-950 md:text-lg",
                  children: item.storeName
                }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
                  className: "mt-1 truncate text-xs text-slate-500",
                  children: item.bestieName
                }, void 0, false)]
              }, void 0, true), /*#__PURE__*/_jsxDEV(Badge, {
                tone: item.progress >= 80 ? 'success' : item.progress >= 40 ? 'warning' : 'default',
                children: [item.progress || 0, "%"]
              }, void 0, true)]
            }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
              className: "mb-3 flex items-center gap-2 text-xs font-bold text-slate-500",
              children: [/*#__PURE__*/_jsxDEV("span", {
                children: item.storeCode || '-'
              }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
                children: "•"
              }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
                children: formatDate(item.visitDate)
              }, void 0, false)]
            }, void 0, true), /*#__PURE__*/_jsxDEV(ProgressBar, {
              value: item.progress || 0
            }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
              className: "mt-4 flex gap-2",
              children: [/*#__PURE__*/_jsxDEV(Button, {
                className: "flex-1",
                variant: "secondary",
                icon: "clipboard",
                onClick: () => onOpenVisit(item.id),
                children: "Lanjutkan"
              }, void 0, false), /*#__PURE__*/_jsxDEV(Button, {
                variant: "icon",
                onClick: () => onDeleteVisit(item.id),
                "aria-label": "Hapus history",
                children: /*#__PURE__*/_jsxDEV(Icon, {
                  name: "trash",
                  className: "h-4 w-4"
                }, void 0, false)
              }, void 0, false)]
            }, void 0, true)]
          }, item.id, true))
        }, void 0, false) : /*#__PURE__*/_jsxDEV(EmptyState, {
          icon: "clipboard",
          title: "Belum ada history"
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true) : /*#__PURE__*/_jsxDEV(AnalyticsView, {}, void 0, false), activeTab === 'home' && /*#__PURE__*/_jsxDEV("button", {
      type: "button",
      className: "inline-flex items-center justify-center gap-2 rounded-full px-5 text-sm font-black text-white shadow-2xl ring-1 ring-emerald-200 transition active:scale-[0.98]",
      style: {
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
      },
      onClick: onNewVisit,
      "aria-label": "Buat kunjungan baru",
      children: [/*#__PURE__*/_jsxDEV(Icon, {
        name: "plus",
        className: "h-5 w-5"
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        children: "Kunjungan Baru"
      }, void 0, false)]
    }, void 0, true), /*#__PURE__*/_jsxDEV(InstallGuideModal, {
      open: installOpen,
      onClose: () => setInstallOpen(false),
      deferredPrompt: deferredPrompt,
      onPromptUsed: () => setDeferredPrompt(null)
    }, void 0, false)]
  }, void 0, true);
}
function NewVisitModal({
  open,
  onClose,
  onCreate
}) {
  const [bestieName, setBestieName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [manualOpen, setManualOpen] = useState(false);
  const [manualStoreName, setManualStoreName] = useState('');
  const [manualStoreCode, setManualStoreCode] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualNote, setManualNote] = useState('');
  const storeOptions = useMemo(() => getStoresForBestie(bestieName).map(item => ({
    label: item.label,
    value: item.value || item.label
  })), [bestieName]);
  useEffect(() => {
    if (!open) return;
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
    if (!storeName || !options.some(item => normalize(item.label) === normalize(storeName))) {
      setStoreName(options[0]?.label || '');
    }
  }, [bestieName]);
  function submitManualRequest() {
    if (!cleanText(manualStoreName)) {
      alert('Nama toko manual wajib diisi.');
      return;
    }
    createManualStoreRequest({
      bestieName,
      storeName: manualStoreName,
      storeCode: manualStoreCode,
      address: manualAddress,
      note: manualNote
    });
    setManualOpen(false);
    setManualStoreName('');
    setManualStoreCode('');
    setManualAddress('');
    setManualNote('');
    alert('Request toko manual sudah dikirim ke panel admin.');
  }
  if (!open) return null;
  const visitStoreName = manualOpen ? cleanText(manualStoreName) : storeName;
  return /*#__PURE__*/_jsxDEV("div", {
    className: "fixed inset-0 z-[80] grid place-items-end bg-slate-950/60 p-0 backdrop-blur-sm md:place-items-center md:p-6",
    role: "dialog",
    "aria-modal": "true",
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "new-visit-modal w-full rounded-t-[30px] bg-white p-5 shadow-2xl md:max-w-2xl md:rounded-[32px] md:p-7",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "mb-5 flex items-start justify-between gap-3",
        children: [/*#__PURE__*/_jsxDEV("div", {
          children: [/*#__PURE__*/_jsxDEV("p", {
            className: "text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary",
            children: "Kunjungan Baru"
          }, void 0, false), /*#__PURE__*/_jsxDEV("h2", {
            className: "mt-2 text-2xl font-black text-slate-950",
            children: "Pilih Bestie dan Store"
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV(Button, {
          variant: "icon",
          onClick: onClose,
          "aria-label": "Tutup",
          children: /*#__PURE__*/_jsxDEV(Icon, {
            name: "close",
            className: "h-4 w-4"
          }, void 0, false)
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "grid gap-4",
        children: [/*#__PURE__*/_jsxDEV(SelectField, {
          label: "Nama Bestie",
          value: bestieName,
          options: BESTIE_NAMES,
          onChange: setBestieName,
          placeholder: "Pilih nama bestie",
          icon: "user",
          required: true
        }, void 0, false), /*#__PURE__*/_jsxDEV(SelectField, {
          label: "Store",
          value: storeName,
          options: storeOptions,
          onChange: setStoreName,
          placeholder: "Pilih store",
          icon: "store",
          required: !manualOpen,
          disabled: manualOpen
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "rounded-2xl border border-slate-200 p-3",
          children: [/*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: "flex w-full items-center justify-between gap-3 text-left text-sm font-extrabold text-slate-900",
            onClick: () => setManualOpen(state => !state),
            children: [/*#__PURE__*/_jsxDEV("span", {
              children: "Input store manual"
            }, void 0, false), /*#__PURE__*/_jsxDEV(Icon, {
              name: "right",
              className: cx('h-4 w-4 transition', manualOpen ? 'rotate-90' : '')
            }, void 0, false)]
          }, void 0, true), manualOpen ? /*#__PURE__*/_jsxDEV("div", {
            className: "mt-3 grid gap-3",
            children: /*#__PURE__*/_jsxDEV(Field, {
              label: "Nama Store Manual",
              children: /*#__PURE__*/_jsxDEV(TextInput, {
                value: manualStoreName,
                onChange: e => setManualStoreName(e.target.value),
                placeholder: "Ketik nama store"
              }, void 0, false)
            }, void 0, false)
          }, void 0, false) : null]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        children: [/*#__PURE__*/_jsxDEV(Button, {
          variant: "secondary",
          onClick: onClose,
          children: "Tutup"
        }, void 0, false), /*#__PURE__*/_jsxDEV(Button, {
          icon: "plus",
          onClick: () => onCreate(bestieName, visitStoreName),
          disabled: !bestieName || !visitStoreName,
          children: "Mulai Kunjungan"
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true)
  }, void 0, false);
}
function getPickerAccept(fileName) {
  const lower = String(fileName || '').toLowerCase();
  if (lower.endsWith('.pdf')) return [{
    description: 'PDF Document',
    accept: {
      'application/pdf': ['.pdf']
    }
  }];
  if (lower.endsWith('.xlsx')) return [{
    description: 'Excel Workbook',
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  }];
  if (lower.endsWith('.json')) return [{
    description: 'JSON Backup',
    accept: {
      'application/json': ['.json']
    }
  }];
  return undefined;
}
async function saveBlobWithPicker(blob, fileName) {
  if (window.showSaveFilePicker) {
    try {
      const pickerTypes = getPickerAccept(fileName);
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        ...(pickerTypes ? {
          types: pickerTypes
        } : {})
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled';
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
  if ('download' in anchor) anchor.click();else window.open(url, '_blank', 'noopener');
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
async function downloadBlobManaged(blob, fileName) {
  const saved = await saveBlobWithPicker(blob, fileName);
  if (saved === 'cancelled') return false;
  if (!saved) downloadBlob(blob, fileName);
  return true;
}
function getEmailReportConfig() {
  const config = window.VISIT_EMAIL_CONFIG || {};
  return {
    enabled: config.enabled !== false,
    endpoint: cleanText(config.endpoint, '/api/send-report-email'),
    sender: cleanText(config.sender, 'Sender belum diset'),
    defaultTo: cleanText(config.defaultTo),
    defaultCc: cleanText(config.defaultCc),
    defaultSubjectTemplate: cleanText(config.defaultSubjectTemplate, 'Visit Report - {store} - {date}'),
    defaultBodyTemplate: cleanText(config.defaultBodyTemplate, 'Dear Team,\n\nBerikut kami lampirkan Visit Report untuk store {store}.\n\nAttachment:\n1. PDF Visit Report\n2. Excel CA Assignment\n\nTerima kasih.')
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
function getVisitStoreEmail(visit) {
  return cleanText(visit?.emailStore || visit?.storeEmail || visit?.detail?.emailStore || visit?.storeDetail?.emailStore);
}
function buildInitialEmailForm(visit) {
  const config = getEmailReportConfig();
  return {
    from: config.sender,
    to: getVisitStoreEmail(visit) || config.defaultTo,
    cc: config.defaultCc,
    subject: applyEmailTemplate(config.defaultSubjectTemplate, visit),
    body: applyEmailTemplate(config.defaultBodyTemplate, visit),
    passcode: '',
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
function EmailReportModal({
  open,
  form,
  onChange,
  onClose,
  onSubmit,
  busy,
  status,
  visit
}) {
  if (!open) return null;
  const config = getEmailReportConfig();
  return /*#__PURE__*/_jsxDEV("div", {
    className: "fixed inset-0 z-[90] grid place-items-end bg-slate-950/60 p-0 backdrop-blur-sm md:place-items-center md:p-6",
    role: "dialog",
    "aria-modal": "true",
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "w-full rounded-t-[30px] bg-white p-5 shadow-2xl md:max-w-3xl md:rounded-[32px] md:p-7",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "mb-5 flex items-start justify-between gap-3",
        children: [/*#__PURE__*/_jsxDEV("div", {
          children: [/*#__PURE__*/_jsxDEV("p", {
            className: "text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary",
            children: "Send Email"
          }, void 0, false), /*#__PURE__*/_jsxDEV("h2", {
            className: "mt-2 text-2xl font-black text-slate-950",
            children: "Kirim Visit Report"
          }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
            className: "mt-1 text-xs font-semibold text-slate-500",
            children: ["Sender dikunci dari backend: ", config.sender]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV(Button, {
          variant: "icon",
          onClick: onClose,
          disabled: busy,
          "aria-label": "Tutup",
          children: /*#__PURE__*/_jsxDEV(Icon, {
            name: "close",
            className: "h-4 w-4"
          }, void 0, false)
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "grid gap-4 md:grid-cols-2",
        children: [/*#__PURE__*/_jsxDEV(Field, {
          label: "From / Sender Locked",
          children: /*#__PURE__*/_jsxDEV(TextInput, {
            value: form.from || config.sender,
            readOnly: true,
            placeholder: "Sender backend"
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV(Field, {
          label: "To",
          required: true,
          children: /*#__PURE__*/_jsxDEV(TextInput, {
            type: "email",
            value: form.to,
            onChange: e => onChange({
              to: e.target.value
            }),
            placeholder: "email tujuan"
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV(Field, {
          label: "CC",
          children: /*#__PURE__*/_jsxDEV(TextInput, {
            value: form.cc,
            onChange: e => onChange({
              cc: e.target.value
            }),
            placeholder: "cc1@email.com, cc2@email.com"
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV(Field, {
          label: "Kode Kirim",
          helper: "Isi jika EMAIL_SEND_PASSCODE diset di Vercel.",
          children: /*#__PURE__*/_jsxDEV(TextInput, {
            type: "password",
            value: form.passcode,
            onChange: e => onChange({
              passcode: e.target.value
            }),
            placeholder: "Opsional"
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "md:col-span-2",
          children: /*#__PURE__*/_jsxDEV(Field, {
            label: "Subject",
            required: true,
            children: /*#__PURE__*/_jsxDEV(TextInput, {
              value: form.subject,
              onChange: e => onChange({
                subject: e.target.value
              }),
              placeholder: "Subject email"
            }, void 0, false)
          }, void 0, false)
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "md:col-span-2",
          children: /*#__PURE__*/_jsxDEV(Field, {
            label: "Body Email",
            required: true,
            children: /*#__PURE__*/_jsxDEV(TextArea, {
              value: form.body,
              onChange: e => onChange({
                body: e.target.value
              }),
              placeholder: "Tulis isi email...",
              minRows: 7
            }, void 0, false)
          }, void 0, false)
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "mt-4 grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-800 md:grid-cols-2",
        children: [/*#__PURE__*/_jsxDEV("label", {
          className: "flex items-center gap-3",
          children: [/*#__PURE__*/_jsxDEV("input", {
            type: "checkbox",
            checked: !!form.attachPdf,
            onChange: e => onChange({
              attachPdf: e.target.checked
            })
          }, void 0, false), " Attach PDF Report"]
        }, void 0, true), /*#__PURE__*/_jsxDEV("label", {
          className: "flex items-center gap-3",
          children: [/*#__PURE__*/_jsxDEV("input", {
            type: "checkbox",
            checked: !!form.attachExcel,
            onChange: e => onChange({
              attachExcel: e.target.checked
            })
          }, void 0, false), " Attach Excel CA Assignment"]
        }, void 0, true)]
      }, void 0, true), status ? /*#__PURE__*/_jsxDEV("p", {
        className: "mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900 ring-1 ring-emerald-100",
        children: status
      }, void 0, false) : null, /*#__PURE__*/_jsxDEV("div", {
        className: "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        children: [/*#__PURE__*/_jsxDEV(Button, {
          variant: "secondary",
          onClick: onClose,
          disabled: busy,
          children: "Tutup"
        }, void 0, false), /*#__PURE__*/_jsxDEV(Button, {
          variant: "secondary",
          icon: "pdf",
          onClick: () => onSubmit('draft'),
          disabled: busy || !form.to || !form.subject,
          children: busy ? 'Memproses...' : 'Create Draft'
        }, void 0, false), /*#__PURE__*/_jsxDEV(Button, {
          icon: "upload",
          onClick: () => onSubmit('send'),
          disabled: busy || !form.to || !form.subject,
          children: busy ? 'Memproses...' : 'Send Now'
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true)
  }, void 0, false);
}
function PdfCanvasPreview({
  blob,
  pdfUrl,
  status
}) {
  const pagesRef = useRef(null);
  const scrollRef = useRef(null);
  const [fallback, setFallback] = useState(false);
  const [renderStatus, setRenderStatus] = useState('');
  const [zoom, setZoom] = useState(1);
  const [renderZoom, setRenderZoom] = useState(1);
  const zoomRef = useRef(1);
  const pinchRef = useRef({
    active: false,
    startDistance: 0,
    startZoom: 1
  });
  const zoomFrameRef = useRef(0);
  const renderZoomTimerRef = useRef(null);
  const renderSeqRef = useRef(0);
  const lastWidthRef = useRef(0);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);
  function touchDistance(touches) {
    if (!touches || touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function handlePreviewTouchStart(event) {
    if (!event.touches || event.touches.length < 2) return;
    const distance = touchDistance(event.touches);
    if (!distance) return;
    pinchRef.current = {
      active: true,
      startDistance: distance,
      startZoom: zoomRef.current || 1
    };
  }
  function applyLivePreviewZoom(nextZoom) {
    zoomRef.current = nextZoom;
    if (zoomFrameRef.current) return;
    zoomFrameRef.current = window.requestAnimationFrame(() => {
      zoomFrameRef.current = 0;
      setZoom(zoomRef.current || 1);
    });
  }
  function schedulePreviewRenderZoom() {
    window.clearTimeout(renderZoomTimerRef.current);
    renderZoomTimerRef.current = window.setTimeout(() => {
      const nextRenderZoom = zoomRef.current || 1;
      setRenderZoom(current => Math.abs(current - nextRenderZoom) < 0.04 ? current : nextRenderZoom);
    }, 180);
  }
  function handlePreviewTouchMove(event) {
    if (!pinchRef.current.active || !event.touches || event.touches.length < 2) return;
    event.preventDefault();
    event.stopPropagation();
    const distance = touchDistance(event.touches);
    const ratio = distance / Math.max(1, pinchRef.current.startDistance);
    const nextZoom = clampNumber(pinchRef.current.startZoom * ratio, 0.75, 2.6, 1);
    applyLivePreviewZoom(nextZoom);
  }
  function finishPreviewPinch() {
    if (!pinchRef.current.active) return;
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
      if (!target || !blob) return;
      const measuredWidth = Math.max(280, Math.floor((scroller?.clientWidth || target.clientWidth || 360) - 16));
      if (!force && Math.abs(measuredWidth - lastWidthRef.current) < 18 && target.childElementCount) return;
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
        if (cancelled || renderSeqRef.current !== seq) return;
        const pdf = await pdfjsLib.getDocument({
          data,
          disableAutoFetch: true,
          disableStream: true
        }).promise;
        if (cancelled || renderSeqRef.current !== seq) return;
        const maxWidth = Math.max(260, Math.min(measuredWidth * renderZoom, 1680));
        const fragment = document.createDocumentFragment();
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled || renderSeqRef.current !== seq) return;
          setRenderStatus(`Memuat preview halaman ${pageNumber}/${pdf.numPages}...`);
          const page = await pdf.getPage(pageNumber);
          const baseViewport = page.getViewport({
            scale: 1
          });
          const scale = maxWidth / baseViewport.width;
          const viewport = page.getViewport({
            scale
          });
          const outputScale = Math.min(window.devicePixelRatio || 1, 2);
          const pageRatio = `${baseViewport.width} / ${baseViewport.height}`;
          const displayWidth = Math.floor(viewport.width);
          const displayHeight = Math.floor(viewport.height);
          const pageWrap = document.createElement('div');
          pageWrap.className = 'pdf-preview-page-wrap';
          pageWrap.style.width = displayWidth + 'px';
          pageWrap.style.setProperty('--pdf-page-ratio', pageRatio);
          pageWrap.style.setProperty('--pdf-page-css-width', displayWidth + 'px');
          pageWrap.style.setProperty('--pdf-page-css-height', displayHeight + 'px');
          const canvas = document.createElement('canvas');
          canvas.className = 'pdf-preview-page-canvas';
          canvas.width = Math.max(1, Math.floor(viewport.width * outputScale));
          canvas.height = Math.max(1, Math.floor(viewport.height * outputScale));
          canvas.style.width = displayWidth + 'px';
          canvas.style.height = displayHeight + 'px';
          canvas.style.aspectRatio = pageRatio;
          pageWrap.appendChild(canvas);
          fragment.appendChild(pageWrap);
          const context = canvas.getContext('2d', {
            alpha: false
          });
          await page.render({
            canvasContext: context,
            viewport,
            transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null
          }).promise;
        }
        if (cancelled || renderSeqRef.current !== seq) return;
        target.replaceChildren(fragment);
        if (scroller) scroller.scrollTop = Math.min(scrollTop, Math.max(0, scroller.scrollHeight - scroller.clientHeight));
        setRenderStatus('');
      } catch (error) {
        console.warn('PDF canvas preview gagal:', error);
        if (!cancelled) {
          setRenderStatus('');
          setFallback(true);
        }
      }
    }
    renderPdf(true);
    function scheduleRender() {
      if (!blob) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => renderPdf(false), 420);
    }
    // Hindari ResizeObserver pada container preview karena perubahan canvas dapat memicu render ulang berulang (blinking/stuck scroll).
    window.addEventListener('resize', scheduleRender, {
      passive: true
    });
    window.addEventListener('orientationchange', scheduleRender);
    return () => {
      cancelled = true;
      clearTimeout(resizeTimer);
      window.clearTimeout(renderZoomTimerRef.current);
      if (zoomFrameRef.current) window.cancelAnimationFrame(zoomFrameRef.current);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', scheduleRender);
      window.removeEventListener('orientationchange', scheduleRender);
      renderSeqRef.current += 1;
    };
  }, [blob, renderZoom]);
  const liveScale = renderZoom ? zoom / renderZoom : 1;
  const zoomLabel = Math.round((zoom || 1) * 100);
  if (!blob) return /*#__PURE__*/_jsxDEV("div", {
    className: "grid min-h-[52vh] place-items-center p-8 text-center text-slate-600",
    children: status
  }, void 0, false);
  if (fallback && pdfUrl) return /*#__PURE__*/_jsxDEV("iframe", {
    className: "preview-frame",
    src: pdfUrl + '#toolbar=0&navpanes=0&scrollbar=1&view=FitH',
    title: "Preview Regional Bestie PDF"
  }, void 0, false);
  return /*#__PURE__*/_jsxDEV("div", {
    ref: scrollRef,
    className: "pdf-canvas-scroll",
    onTouchStart: handlePreviewTouchStart,
    onTouchMove: handlePreviewTouchMove,
    onTouchEnd: finishPreviewPinch,
    onTouchCancel: finishPreviewPinch,
    style: {
      touchAction: 'pan-x pan-y',
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'contain'
    },
    children: [/*#__PURE__*/_jsxDEV("div", {
      ref: pagesRef,
      className: "pdf-canvas-pages",
      style: {
        transform: `translateZ(0) scale(${liveScale})`,
        transformOrigin: 'top center',
        transition: pinchRef.current.active ? 'none' : 'transform 180ms cubic-bezier(.22,1,.36,1)',
        willChange: 'transform'
      }
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      "aria-hidden": "true",
      style: {
        position: 'sticky',
        bottom: 10,
        left: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none'
      },
      children: /*#__PURE__*/_jsxDEV("span", {
        style: {
          borderRadius: 999,
          background: 'rgba(15,23,42,.72)',
          color: '#fff',
          padding: '5px 10px',
          fontSize: 11,
          fontWeight: 900,
          boxShadow: '0 10px 24px rgba(15,23,42,.18)'
        },
        children: ["Zoom ", zoomLabel, "%"]
      }, void 0, true)
    }, void 0, false), renderStatus ? /*#__PURE__*/_jsxDEV("div", {
      className: "pdf-render-status",
      children: renderStatus
    }, void 0, false) : null]
  }, void 0, true);
}
function PreviewPage({
  visit,
  onBack
}) {
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
      if (!visit) return;
      setStatus('Merender PDF...');
      try {
        if (!window.ReportVisitPDF?.createBlob) throw new Error('Mesin PDF belum siap. Refresh halaman lalu coba lagi.');
        const blob = await window.ReportVisitPDF.createBlob(visit);
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfBlob(blob);
        setPdfUrl(objectUrl);
        setStatus('Preview siap.');
      } catch (error) {
        setPdfBlob(null);
        setStatus(error?.message || 'Preview PDF gagal dibuat.');
      }
    }
    render();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [visit]);
  useEffect(() => {
    if (!emailOpen) setEmailForm(buildInitialEmailForm(visit));
  }, [visit, emailOpen]);
  async function handleDownloadPdf() {
    if (!visit || busy || downloadBusy) return;
    setBusy(true);
    setDownloadBusy(true);
    setDownloadMessage('Menyiapkan PDF...');
    try {
      await new Promise(resolve => window.setTimeout(resolve, 80));
      if (!window.ReportVisitPDF?.createBlob) throw new Error('Mesin PDF belum siap. Refresh halaman lalu coba lagi.');
      const blob = pdfBlob || (await window.ReportVisitPDF.createBlob(visit));
      const fileName = window.ReportVisitPDF.buildFileName ? window.ReportVisitPDF.buildFileName(visit) : 'Regional_Bestie_Visit_Report.pdf';
      setDownloadMessage('Pilih lokasi simpan...');
      const didSave = await downloadBlobManaged(blob, fileName);
      setDownloadMessage(didSave ? 'PDF tersimpan.' : 'Download dibatalkan.');
      await new Promise(resolve => window.setTimeout(resolve, didSave ? 420 : 260));
    } catch (error) {
      alert(error?.message || 'Gagal download PDF.');
    } finally {
      setDownloadBusy(false);
      setDownloadMessage('');
      setBusy(false);
    }
  }
  async function handleExportExcel() {
    if (!visit) return;
    if (!window.__caAssignmentExport?.buildWorkbook) {
      alert('Mesin export Excel belum siap.');
      return;
    }
    setBusy(true);
    try {
      const blob = await window.__caAssignmentExport.buildWorkbook(visit);
      const fileName = 'CA_Store_Assignment_' + cleanText(visit.store, 'Store').replace(/\s+/g, '_') + '.xlsx';
      downloadBlob(blob, fileName);
    } catch (error) {
      alert(error?.message || 'Gagal export Excel CA Assignment.');
    } finally {
      setBusy(false);
    }
  }
  function openEmailReportModal() {
    if (!visit || busy || downloadBusy) return;
    setEmailForm(buildInitialEmailForm(visit));
    setEmailStatus('');
    setEmailOpen(true);
  }
  async function handleSendReportEmail(mode) {
    if (!visit || emailBusy) return;
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
      if (emailForm.attachPdf) {
        if (!window.ReportVisitPDF?.createBlob) throw new Error('Mesin PDF belum siap. Refresh halaman lalu coba lagi.');
        const blob = pdfBlob || (await window.ReportVisitPDF.createBlob(visit));
        const fileName = window.ReportVisitPDF.buildFileName ? window.ReportVisitPDF.buildFileName(visit) : 'Regional_Bestie_Visit_Report.pdf';
        attachments.push({
          filename: fileName,
          mimeType: 'application/pdf',
          dataBase64: await blobToBase64Payload(blob)
        });
      }
      if (emailForm.attachExcel) {
        if (!window.__caAssignmentExport?.buildWorkbook) throw new Error('Mesin export Excel belum siap.');
        const blob = await window.__caAssignmentExport.buildWorkbook(visit);
        const fileName = 'CA_Store_Assignment_' + cleanText(visit.store, 'Store').replace(/\s+/g, '_') + '.xlsx';
        attachments.push({
          filename: fileName,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dataBase64: await blobToBase64Payload(blob)
        });
      }
      setEmailStatus(mode === 'send' ? 'Mengirim email...' : 'Membuat draft email...');
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode,
          to: emailForm.to,
          cc: emailForm.cc,
          subject: emailForm.subject,
          body: emailForm.body,
          passcode: emailForm.passcode,
          attachments,
          visitMeta: {
            store: visit.store,
            bestie: visit.nama,
            tanggal: visit.tanggal
          }
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok === false) throw new Error(result.error || 'Gagal mengirim email.');
      setEmailStatus(mode === 'send' ? 'Email berhasil dikirim.' : 'Draft Gmail berhasil dibuat.');
      window.setTimeout(() => setEmailOpen(false), 800);
    } catch (error) {
      alert(error?.message || 'Gagal memproses email.');
      setEmailStatus('');
    } finally {
      setEmailBusy(false);
      setBusy(false);
    }
  }
  if (!visit) return /*#__PURE__*/_jsxDEV("main", {
    className: "preview-page w-full px-4 py-8 md:px-8",
    children: /*#__PURE__*/_jsxDEV(EmptyState, {
      icon: "pdf",
      title: "Belum ada visit aktif",
      action: /*#__PURE__*/_jsxDEV(Button, {
        variant: "secondary",
        onClick: onBack,
        children: "Kembali"
      }, void 0, false)
    }, void 0, false)
  }, void 0, false);
  return /*#__PURE__*/_jsxDEV("main", {
    className: "preview-page w-full px-4 py-4 md:px-8 md:py-8",
    children: [downloadBusy ? /*#__PURE__*/_jsxDEV("div", {
      className: "download-pdf-overlay",
      role: "status",
      "aria-live": "polite",
      children: /*#__PURE__*/_jsxDEV("div", {
        className: "download-pdf-loader",
        children: [/*#__PURE__*/_jsxDEV("span", {
          className: "download-pdf-spinner",
          "aria-hidden": "true"
        }, void 0, false), /*#__PURE__*/_jsxDEV("strong", {
          children: downloadMessage || 'Menyiapkan PDF...'
        }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
          children: "Jangan tutup halaman sampai file manager muncul."
        }, void 0, false)]
      }, void 0, true)
    }, void 0, false) : null, /*#__PURE__*/_jsxDEV(EmailReportModal, {
      open: emailOpen,
      form: emailForm,
      onChange: patch => setEmailForm(state => ({
        ...state,
        ...patch
      })),
      onClose: () => setEmailOpen(false),
      onSubmit: handleSendReportEmail,
      busy: emailBusy,
      status: emailStatus,
      visit: visit
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "preview-header mb-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-end",
      children: [/*#__PURE__*/_jsxDEV("div", {
        children: [/*#__PURE__*/_jsxDEV("p", {
          className: "text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary",
          children: "Preview PDF"
        }, void 0, false), /*#__PURE__*/_jsxDEV("h1", {
          className: "mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-3xl",
          children: "Review Report"
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "preview-progress-card rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-900 ring-1 ring-emerald-100",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "mb-2 flex items-center justify-between gap-3",
          children: [/*#__PURE__*/_jsxDEV("p", {
            className: "text-xs font-bold uppercase tracking-wide",
            children: "Progress"
          }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
            className: "text-sm font-black",
            children: [visitProgress(visit), "%"]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV(ProgressBar, {
          value: visitProgress(visit)
        }, void 0, false), /*#__PURE__*/_jsxDEV(ProgressMissingInfo, {
          visit: visit,
          maxItems: 4,
          compact: true
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "preview-modal-card surface-card overflow-hidden rounded-[24px] md:rounded-[28px]",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "preview-toolbar flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "min-w-0",
          children: [/*#__PURE__*/_jsxDEV("p", {
            className: "truncate text-sm font-extrabold text-slate-950",
            children: visit.store || 'Store belum dipilih'
          }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
            className: "truncate text-xs text-slate-500",
            children: [visit.nama || 'Bestie belum dipilih', " • ", formatDate(visit.tanggal)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "preview-actions flex flex-wrap gap-2",
          children: [/*#__PURE__*/_jsxDEV(Button, {
            variant: "secondary",
            icon: "left",
            onClick: onBack,
            children: "Kembali"
          }, void 0, false), /*#__PURE__*/_jsxDEV(Button, {
            icon: downloadBusy ? null : "download",
            onClick: handleDownloadPdf,
            disabled: busy || downloadBusy,
            children: downloadBusy ? 'Memproses...' : 'Download PDF'
          }, void 0, false), /*#__PURE__*/_jsxDEV(Button, {
            variant: "secondary",
            icon: "excel",
            onClick: handleExportExcel,
            disabled: busy || downloadBusy,
            className: "excel-export-button",
            children: /*#__PURE__*/_jsxDEV("span", {
              className: "text-left leading-tight",
              children: [/*#__PURE__*/_jsxDEV("span", {
                className: "block",
                children: "Export Excel CA Assigment"
              }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
                className: "block text-[11px] font-semibold text-slate-500",
                children: "file untuk feedback store"
              }, void 0, false)]
            }, void 0, true)
          }, void 0, false), /*#__PURE__*/_jsxDEV(Button, {
            icon: "upload",
            onClick: openEmailReportModal,
            disabled: busy || downloadBusy,
            children: "Send Email"
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "preview-frame-wrap",
        children: /*#__PURE__*/_jsxDEV(PdfCanvasPreview, {
          blob: pdfBlob,
          pdfUrl: pdfUrl,
          status: status
        }, void 0, false)
      }, void 0, false)]
    }, void 0, true)]
  }, void 0, true);
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
  return [visit?.nama, visit?.store, visit?.tanggal].map(part => normalize(part).replace(/\s+/g, '-')).filter(Boolean).join('__') || visit?.id || SESSION_ID;
}
function convexUrl(path) {
  const config = getConvexConfig();
  const httpUrl = getConvexHttpUrl();
  if (!config.enabled || !httpUrl) return '';
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
  if (window.convex?.ConvexClient) return Promise.resolve(window.convex);
  if (RB_CONVEX_BUNDLE_PROMISE) return RB_CONVEX_BUNDLE_PROMISE;
  RB_CONVEX_BUNDLE_PROMISE = new Promise((resolve, reject) => {
    const existing = document.getElementById('rbv-convex-client-bundle');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.convex), {
        once: true
      });
      existing.addEventListener('error', () => reject(new Error('Convex client gagal dimuat.')), {
        once: true
      });
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
  if (!config.enabled || !deploymentUrl) return null;
  await loadConvexBundle();
  if (!window.convex?.ConvexClient) return null;
  if (!RB_CONVEX_CLIENT || RB_CONVEX_CLIENT_URL !== deploymentUrl) {
    try {
      RB_CONVEX_CLIENT?.close?.();
    } catch (error) {}
    RB_CONVEX_CLIENT = new window.convex.ConvexClient(deploymentUrl);
    RB_CONVEX_CLIENT_URL = deploymentUrl;
  }
  return RB_CONVEX_CLIENT;
}
async function runConvexQuery(functionName, args = {}) {
  const client = await getConvexRealtimeClient();
  if (!client || !functionName) return null;
  return client.query(functionName, args);
}
async function runConvexMutation(functionName, args = {}) {
  const client = await getConvexRealtimeClient();
  if (!client || !functionName) return null;
  return client.mutation(functionName, args);
}
async function subscribeConvexQuery(functionName, args, onData, onError) {
  const client = await getConvexRealtimeClient();
  if (!client || !functionName || typeof client.onUpdate !== 'function') return null;
  const unsubscribe = client.onUpdate(functionName, args || {}, onData, onError);
  return () => {
    if (typeof unsubscribe === 'function') unsubscribe();else if (typeof unsubscribe?.unsubscribe === 'function') unsubscribe.unsubscribe();
  };
}
function normalizeMonitorRows(rows) {
  const safeRows = Array.isArray(rows) ? rows : Array.isArray(rows?.rows) ? rows.rows : Array.isArray(rows?.data) ? rows.data : [];
  return safeRows.map(row => ({
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
  const safeRows = Array.isArray(rows) ? rows : Array.isArray(rows?.rows) ? rows.rows : Array.isArray(rows?.data) ? rows.data : [];
  return safeRows.map(item => ({
    id: item.request_id || item.requestId || item.id || item._id,
    status: item.status || 'pending',
    createdAt: item.created_at || item.createdAt || Date.now(),
    updatedAt: item.updated_at || item.updatedAt || item.created_at || item.createdAt || Date.now(),
    bestieName: item.bestie_name || item.bestieName || '',
    storeName: item.store_name || item.storeName || item.siteDescr || '',
    storeCode: item.store_code || item.storeCode || item.siteCode || '',
    address: item.address || '',
    note: item.note || ''
  })).filter(item => item.id && item.storeName);
}
function persistManualRequestsFromRemote(items) {
  const normalized = normalizeManualRequestRows(items);
  if (!normalized.length) return normalized;
  saveManualStoreRequests(normalized);
  const approvedStores = normalized.filter(item => item.status === 'approved').map(item => ({
    siteDescr: item.storeName,
    storeName: item.storeName,
    siteCode: item.storeCode,
    siteCode4: item.storeCode,
    address: item.address,
    city: '',
    source: cloudflareEnabled() ? 'cloudflare-approved' : netlifyEnabled() ? 'netlify-approved' : supabaseEnabled() ? 'supabase-approved' : 'convex-approved',
    approvedAt: item.updatedAt,
    requestedBy: item.bestieName
  }));
  if (approvedStores.length) saveApprovedManualStores([...approvedStores, ...readApprovedManualStores()]);
  return normalized;
}
function getPresenceLastSeen(row) {
  const raw = row?.last_seen_at || row?.lastSeenAt || row?.updated_at || row?.updatedAt || row?.last_visit_at || row?.lastVisitAt || 0;
  if (typeof raw === 'number') return raw;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : Number(raw || 0) || 0;
}
function normalizePresenceRows(rows) {
  const safeRows = Array.isArray(rows) ? rows : Array.isArray(rows?.rows) ? rows.rows : Array.isArray(rows?.data) ? rows.data : [];
  const now = Date.now();
  return safeRows.map(row => {
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
  } catch (error) {
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
  const rows = readLocalPresenceRows().filter(item => item.session_id !== payload.session_id);
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
  const apiPath = cleanText(config.apiPath || '/api/rbv-data');
  if (endpoint) {
    if (/^https?:\/\//i.test(endpoint)) {
      if (!apiPath || endpoint.endsWith(apiPath) || endpoint.includes('?')) return endpoint;
      return endpoint.replace(/\/$/, '') + '/' + apiPath.replace(/^\//, '');
    }
    return endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  }
  return apiPath.startsWith('/') ? apiPath : '/' + apiPath;
}
function normalizeCloudflareError(error, label) {
  if (!error) return '';
  return `${label || 'Cloudflare D1'}: ${error.message || error.details || error.hint || 'gagal diproses'}`;
}
async function cloudflareRequest(action, options = {}) {
  if (!cloudflareEnabled() || !action) return null;
  const method = options.method || 'GET';
  const url = new URL(getCloudflareApiUrl(), window.location.origin);
  url.searchParams.set('action', action);
  if (options.params && typeof options.params === 'object') {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    });
  }
  const config = getCloudflareConfig();
  const headers = {
    Accept: 'application/json'
  };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (cleanText(config.adminToken)) headers['X-Admin-Token'] = cleanText(config.adminToken);
  const response = await fetch(url.toString(), {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: 'no-store'
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {}
  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || `Cloudflare D1 request gagal (${response.status})`);
  }
  return payload;
}
async function upsertMonitorVisitToCloudflare(visit) {
  if (!cloudflareEnabled() || !visit || !cleanText(visit.nama) || !cleanText(visit.store)) return false;
  try {
    await cloudflareRequest('upsertMonitorVisit', {
      method: 'POST',
      body: monitorPayloadFromVisit(visit)
    });
    return true;
  } catch (error) {
    console.warn(normalizeCloudflareError(error, 'Cloudflare monitor upsert'));
    return false;
  }
}
async function fetchMonitorRowsFromCloudflare() {
  if (!cloudflareEnabled()) return null;
  try {
    const payload = await cloudflareRequest('listMonitorVisits', {
      params: {
        limit: getCloudflareConfig().monitorLimit || 500
      }
    });
    return normalizeMonitorRows(payload?.rows || payload?.data || []);
  } catch (error) {
    console.warn(normalizeCloudflareError(error, 'Cloudflare monitor read'));
    return null;
  }
}
async function upsertPresenceToCloudflare(payload) {
  if (!cloudflareEnabled() || !payload) return false;
  try {
    await cloudflareRequest('upsertPresence', {
      method: 'POST',
      body: payload
    });
    return true;
  } catch (error) {
    console.warn(normalizeCloudflareError(error, 'Cloudflare presence upsert'));
    return false;
  }
}
async function fetchPresenceRowsFromCloudflare() {
  if (!cloudflareEnabled()) return null;
  try {
    const payload = await cloudflareRequest('listPresence', {
      params: {
        limit: getCloudflareConfig().presenceLimit || 300
      }
    });
    return normalizePresenceRows(payload?.rows || payload?.data || []);
  } catch (error) {
    console.warn(normalizeCloudflareError(error, 'Cloudflare presence read'));
    return null;
  }
}
async function fetchManualRequestsFromCloudflare() {
  if (!cloudflareEnabled()) return null;
  try {
    const payload = await cloudflareRequest('listManualRequests');
    return persistManualRequestsFromRemote(payload?.rows || payload?.data || []);
  } catch (error) {
    console.warn(normalizeCloudflareError(error, 'Cloudflare request toko read'));
    return null;
  }
}
async function syncManualRequestToCloudflare(request) {
  if (!cloudflareEnabled() || !request) return false;
  try {
    await cloudflareRequest('upsertManualRequest', {
      method: 'POST',
      body: manualRequestPayload(request)
    });
    return true;
  } catch (error) {
    console.warn(normalizeCloudflareError(error, 'Cloudflare request toko sync'));
    return false;
  }
}
async function fetchAppConfigsFromCloudflare() {
  if (!cloudflareEnabled()) return null;
  try {
    const payload = await cloudflareRequest('listAppSettings', {
      params: {
        keys: [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice].join(',')
      }
    });
    return normalizeRemoteAppConfigRows(payload?.rows || payload?.data || []);
  } catch (error) {
    console.warn(normalizeCloudflareError(error, 'Cloudflare app config read'));
    return null;
  }
}
async function syncAppConfigToCloudflare(key, payload) {
  if (!cloudflareEnabled() || !key) return false;
  try {
    await cloudflareRequest('setAppSetting', {
      method: 'POST',
      body: {
        key,
        payload,
        updatedBy: SESSION_ID
      }
    });
    return true;
  } catch (error) {
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
  if (/^https?:\/\//i.test(path)) return path;
  if (baseUrl) return baseUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
  return path.startsWith('/') ? path : '/' + path;
}
function normalizeNetlifyError(error, label) {
  if (!error) return '';
  return `${label || 'Netlify'}: ${error.message || error.details || error.hint || 'gagal diproses'}`;
}
async function netlifyRequest(action, options = {}) {
  if (!netlifyEnabled() || !action) return null;
  const method = options.method || 'GET';
  const url = new URL(getNetlifyFunctionUrl(), window.location.origin);
  url.searchParams.set('action', action);
  if (options.params && typeof options.params === 'object') {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    });
  }
  const config = getNetlifyConfig();
  const headers = {
    Accept: 'application/json'
  };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (cleanText(config.adminToken)) headers['X-Admin-Token'] = cleanText(config.adminToken);
  const response = await fetch(url.toString(), {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: 'no-store'
  });
  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {}
  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || `Netlify request gagal (${response.status})`);
  }
  return payload;
}
async function upsertMonitorVisitToNetlify(visit) {
  if (!netlifyEnabled() || !visit || !cleanText(visit.nama) || !cleanText(visit.store)) return false;
  try {
    await netlifyRequest('upsertMonitorVisit', {
      method: 'POST',
      body: monitorPayloadFromVisit(visit)
    });
    return true;
  } catch (error) {
    console.warn(normalizeNetlifyError(error, 'Netlify monitor upsert'));
    return false;
  }
}
async function fetchMonitorRowsFromNetlify() {
  if (!netlifyEnabled()) return null;
  try {
    const payload = await netlifyRequest('listMonitorVisits', {
      params: {
        limit: getNetlifyConfig().monitorLimit || 500
      }
    });
    return normalizeMonitorRows(payload?.rows || payload?.data || []);
  } catch (error) {
    console.warn(normalizeNetlifyError(error, 'Netlify monitor read'));
    return null;
  }
}
async function upsertPresenceToNetlify(payload) {
  if (!netlifyEnabled() || !payload) return false;
  try {
    await netlifyRequest('upsertPresence', {
      method: 'POST',
      body: payload
    });
    return true;
  } catch (error) {
    console.warn(normalizeNetlifyError(error, 'Netlify presence upsert'));
    return false;
  }
}
async function fetchPresenceRowsFromNetlify() {
  if (!netlifyEnabled()) return null;
  try {
    const payload = await netlifyRequest('listPresence', {
      params: {
        limit: getNetlifyConfig().presenceLimit || 300
      }
    });
    return normalizePresenceRows(payload?.rows || payload?.data || []);
  } catch (error) {
    console.warn(normalizeNetlifyError(error, 'Netlify presence read'));
    return null;
  }
}
async function fetchManualRequestsFromNetlify() {
  if (!netlifyEnabled()) return null;
  try {
    const payload = await netlifyRequest('listManualRequests');
    return persistManualRequestsFromRemote(payload?.rows || payload?.data || []);
  } catch (error) {
    console.warn(normalizeNetlifyError(error, 'Netlify request toko read'));
    return null;
  }
}
async function syncManualRequestToNetlify(request) {
  if (!netlifyEnabled() || !request) return false;
  try {
    await netlifyRequest('upsertManualRequest', {
      method: 'POST',
      body: manualRequestPayload(request)
    });
    return true;
  } catch (error) {
    console.warn(normalizeNetlifyError(error, 'Netlify request toko sync'));
    return false;
  }
}
async function fetchAppConfigsFromNetlify() {
  if (!netlifyEnabled()) return null;
  try {
    const payload = await netlifyRequest('listAppSettings', {
      params: {
        keys: [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice].join(',')
      }
    });
    return normalizeRemoteAppConfigRows(payload?.rows || payload?.data || []);
  } catch (error) {
    console.warn(normalizeNetlifyError(error, 'Netlify app config read'));
    return null;
  }
}
async function syncAppConfigToNetlify(key, payload) {
  if (!netlifyEnabled() || !key) return false;
  try {
    await netlifyRequest('setAppSetting', {
      method: 'POST',
      body: {
        key,
        payload,
        updatedBy: SESSION_ID
      }
    });
    return true;
  } catch (error) {
    console.warn(normalizeNetlifyError(error, 'Netlify app config sync'));
    return false;
  }
}
function remoteSyncProvider() {
  if (netlifyEnabled()) return 'netlify';
  if (supabaseEnabled()) return 'supabase';
  if (convexEnabled()) return 'convex';
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
  if (netlifyEnabled()) return Math.max(3500, Number(getNetlifyConfig().pollMs || 5000));
  if (supabaseEnabled()) return Math.max(3500, Number(getSupabaseConfig().pollMs || 5000));
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
  if (window.supabase?.createClient) return Promise.resolve(window.supabase);
  if (RB_SUPABASE_BUNDLE_PROMISE) return RB_SUPABASE_BUNDLE_PROMISE;
  RB_SUPABASE_BUNDLE_PROMISE = new Promise((resolve, reject) => {
    const existing = document.getElementById('rbv-supabase-client-bundle');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.supabase), {
        once: true
      });
      existing.addEventListener('error', () => reject(new Error('Supabase client gagal dimuat.')), {
        once: true
      });
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
  if (!supabaseEnabled()) return null;
  if (RB_SUPABASE_CLIENT) return RB_SUPABASE_CLIENT;
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
  if (!error) return '';
  return `${label || 'Supabase'}: ${error.message || error.details || error.hint || 'gagal diproses'}`;
}
async function upsertMonitorVisitToSupabase(visit) {
  if (!supabaseEnabled() || !visit || !cleanText(visit.nama) || !cleanText(visit.store)) return false;
  try {
    const client = await getSupabaseClient();
    if (!client) return false;
    const table = getSupabaseTable('monitor', 'monitor_visits');
    const {
      error
    } = await client.from(table).upsert(monitorPayloadFromVisit(visit), {
      onConflict: 'visit_key'
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn(normalizeSupabaseError(error, 'Supabase monitor upsert'));
    return false;
  }
}
async function fetchMonitorRowsFromSupabase() {
  if (!supabaseEnabled()) return null;
  try {
    const client = await getSupabaseClient();
    if (!client) return null;
    const table = getSupabaseTable('monitor', 'monitor_visits');
    const limit = Math.max(50, Number(getSupabaseConfig().monitorLimit || 500));
    const {
      data,
      error
    } = await client.from(table).select('*').order('updated_at', {
      ascending: false
    }).limit(limit);
    if (error) throw error;
    return normalizeMonitorRows(data || []);
  } catch (error) {
    console.warn(normalizeSupabaseError(error, 'Supabase monitor read'));
    return null;
  }
}
async function upsertPresenceToSupabase(payload) {
  if (!supabaseEnabled() || !payload) return false;
  try {
    const client = await getSupabaseClient();
    if (!client) return false;
    const table = getSupabaseTable('presence', 'monitor_presence');
    const {
      error
    } = await client.from(table).upsert(payload, {
      onConflict: 'session_id'
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn(normalizeSupabaseError(error, 'Supabase presence upsert'));
    return false;
  }
}
async function fetchPresenceRowsFromSupabase() {
  if (!supabaseEnabled()) return null;
  try {
    const client = await getSupabaseClient();
    if (!client) return null;
    const table = getSupabaseTable('presence', 'monitor_presence');
    const limit = Math.max(50, Number(getSupabaseConfig().presenceLimit || 300));
    const {
      data,
      error
    } = await client.from(table).select('*').order('updated_at', {
      ascending: false
    }).limit(limit);
    if (error) throw error;
    return normalizePresenceRows(data || []);
  } catch (error) {
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
  if (!supabaseEnabled()) return null;
  try {
    const client = await getSupabaseClient();
    if (!client) return null;
    const table = getSupabaseTable('manualRequests', 'manual_store_requests');
    const {
      data,
      error
    } = await client.from(table).select('*').order('updated_at', {
      ascending: false
    }).limit(500);
    if (error) throw error;
    return persistManualRequestsFromRemote(data || []);
  } catch (error) {
    console.warn(normalizeSupabaseError(error, 'Supabase request toko read'));
    return null;
  }
}
async function syncManualRequestToSupabase(request) {
  if (!supabaseEnabled() || !request) return false;
  try {
    const client = await getSupabaseClient();
    if (!client) return false;
    const table = getSupabaseTable('manualRequests', 'manual_store_requests');
    const {
      error
    } = await client.from(table).upsert(manualRequestPayload(request), {
      onConflict: 'request_id'
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.warn(normalizeSupabaseError(error, 'Supabase request toko sync'));
    return false;
  }
}
async function fetchAppConfigsFromSupabase() {
  if (!supabaseEnabled()) return null;
  try {
    const client = await getSupabaseClient();
    if (!client) return null;
    const table = getSupabaseTable('appSettings', 'app_settings');
    const {
      data,
      error
    } = await client.from(table).select('config_key,payload,updated_at').in('config_key', [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice]);
    if (error) throw error;
    return normalizeRemoteAppConfigRows((data || []).map(item => ({
      key: item.config_key,
      payload: item.payload,
      updatedAt: item.updated_at
    })));
  } catch (error) {
    console.warn(normalizeSupabaseError(error, 'Supabase app config read'));
    return null;
  }
}
async function syncAppConfigToSupabase(key, payload) {
  if (!supabaseEnabled() || !key) return false;
  try {
    const client = await getSupabaseClient();
    if (!client) return false;
    const table = getSupabaseTable('appSettings', 'app_settings');
    const {
      error
    } = await client.from(table).upsert({
      config_key: key,
      payload,
      updated_at: new Date().toISOString(),
      updated_by: SESSION_ID
    }, {
      onConflict: 'config_key'
    });
    if (error) throw error;
    return true;
  } catch (error) {
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
  if (await upsertMonitorVisitToNetlify(visit)) return;
  if (await upsertMonitorVisitToSupabase(visit)) return;
  const config = getConvexConfig();
  if (!convexEnabled() || !visit || !cleanText(visit.nama) || !cleanText(visit.store)) return;
  const payload = monitorPayloadFromVisit(visit);
  try {
    const mutationName = config.upsertMutation || 'monitor:upsertVisit';
    const result = await runConvexMutation(mutationName, {
      payload
    });
    if (result !== null) return;
  } catch (error) {
    console.warn('Convex realtime mutation gagal, fallback HTTP:', error);
  }
  const endpoint = convexUrl(config.upsertPath || 'monitor/upsertVisit');
  if (!endpoint) return;
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.token ? {
          Authorization: `Bearer ${config.token}`
        } : {})
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.warn('Convex upsert gagal:', error);
  }
}
async function upsertPresence(payload) {
  if (!payload) return;
  persistPresenceLocal(payload);
  if (await upsertPresenceToNetlify(payload)) return;
  if (await upsertPresenceToSupabase(payload)) return;
  const config = getConvexConfig();
  if (!convexEnabled()) return;
  try {
    await runConvexMutation(config.presenceUpsertMutation || 'monitor:upsertPresence', {
      payload
    });
  } catch (error) {
    console.warn('Convex presence sync gagal:', error);
  }
}
async function fetchPresenceRowsFromConvex() {
  const netlifyRows = await fetchPresenceRowsFromNetlify();
  if (netlifyRows !== null) return netlifyRows;
  const supabaseRows = await fetchPresenceRowsFromSupabase();
  if (supabaseRows !== null) return supabaseRows;
  const config = getConvexConfig();
  if (!convexEnabled()) return readLocalPresenceRows();
  try {
    const queryName = config.presenceQuery || 'monitor:listPresence';
    const rows = await runConvexQuery(queryName, {});
    if (rows !== null) return normalizePresenceRows(rows);
  } catch (error) {
    console.warn('Convex presence query gagal:', error);
  }
  return readLocalPresenceRows();
}
async function fetchMonitorRowsFromConvex() {
  const netlifyRows = await fetchMonitorRowsFromNetlify();
  if (netlifyRows !== null) return netlifyRows;
  const supabaseRows = await fetchMonitorRowsFromSupabase();
  if (supabaseRows !== null) return supabaseRows;
  const config = getConvexConfig();
  if (!convexEnabled()) return null;
  try {
    const queryName = config.monitorQuery || 'monitor:listVisits';
    const rows = await runConvexQuery(queryName, {});
    if (rows !== null) return normalizeMonitorRows(rows);
  } catch (error) {
    console.warn('Convex realtime query gagal, fallback HTTP:', error);
  }
  const endpoint = convexUrl(config.listPath || 'monitor/listVisits');
  if (!endpoint) return null;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      ...(config.token ? {
        Authorization: `Bearer ${config.token}`
      } : {})
    }
  });
  if (!response.ok) throw new Error('Convex monitor gagal dibaca.');
  const payload = await response.json();
  return normalizeMonitorRows(payload);
}
async function fetchManualRequestsFromConvex() {
  const netlifyRows = await fetchManualRequestsFromNetlify();
  if (netlifyRows !== null) return netlifyRows;
  const supabaseRows = await fetchManualRequestsFromSupabase();
  if (supabaseRows !== null) return supabaseRows;
  const config = getConvexConfig();
  if (!convexEnabled()) return null;
  try {
    const queryName = config.manualRequestsQuery || 'monitor:listManualStoreRequests';
    const rows = await runConvexQuery(queryName, {});
    if (rows !== null) return persistManualRequestsFromRemote(rows);
  } catch (error) {
    console.warn('Convex manual request query gagal, fallback HTTP:', error);
  }
  const endpoint = convexUrl(config.listManualRequestsPath || 'monitor/listManualStoreRequests');
  if (!endpoint) return null;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      ...(config.token ? {
        Authorization: `Bearer ${config.token}`
      } : {})
    }
  });
  if (!response.ok) throw new Error('Convex request toko gagal dibaca.');
  const payload = await response.json();
  return persistManualRequestsFromRemote(payload);
}
async function syncManualRequestToConvex(request) {
  if (await syncManualRequestToNetlify(request)) return;
  if (await syncManualRequestToSupabase(request)) return;
  const config = getConvexConfig();
  if (!convexEnabled() || !request) return;
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
    const result = await runConvexMutation(config.upsertManualRequestMutation || 'monitor:upsertManualStoreRequest', {
      payload
    });
    if (result !== null) return;
  } catch (error) {
    console.warn('Convex request toko gagal, fallback HTTP:', error);
  }
  const endpoint = convexUrl(config.upsertManualRequestPath || 'monitor/upsertManualStoreRequest');
  if (!endpoint) return;
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.token ? {
          Authorization: `Bearer ${config.token}`
        } : {})
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.warn('HTTP request toko gagal:', error);
  }
}
async function syncManualRequestStatusToConvex(request) {
  if (!request) return;
  syncManualRequestToConvex(request);
}
function normalizeRemoteAppConfigRows(rows) {
  const safeRows = Array.isArray(rows) ? rows : Array.isArray(rows?.rows) ? rows.rows : Array.isArray(rows?.data) ? rows.data : [];
  return safeRows.map(row => ({
    key: row.configKey || row.config_key || row.key || '',
    payload: row.payload || row.value || row.config || {},
    updatedAt: row.updatedAt || row.updated_at || 0
  })).filter(row => row.key);
}
function applyRemoteAppConfigRows(rows) {
  const normalized = normalizeRemoteAppConfigRows(rows);
  normalized.forEach(row => {
    if (row.key === APP_CONFIG_KEYS.welcome) saveWelcomeConfig(row.payload);
    if (row.key === APP_CONFIG_KEYS.updateNotice) saveUpdateNoticeConfig(row.payload);
  });
  return normalized;
}
async function fetchAppConfigsFromConvex() {
  const netlifyRows = await fetchAppConfigsFromNetlify();
  if (netlifyRows !== null) return netlifyRows;
  const supabaseRows = await fetchAppConfigsFromSupabase();
  if (supabaseRows !== null) return supabaseRows;
  const config = getConvexConfig();
  if (!convexEnabled()) return null;
  try {
    const queryName = config.appConfigListQuery || 'appSettings:listConfigs';
    const rows = await runConvexQuery(queryName, {
      keys: [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice]
    });
    if (rows !== null) return normalizeRemoteAppConfigRows(rows);
  } catch (error) {
    console.warn('Convex app config query gagal:', error);
  }
  return null;
}
async function syncAppConfigToConvex(key, payload) {
  if (await syncAppConfigToNetlify(key, payload)) return true;
  if (await syncAppConfigToSupabase(key, payload)) return true;
  const config = getConvexConfig();
  if (!convexEnabled() || !key) return false;
  try {
    await runConvexMutation(config.appConfigSetMutation || 'appSettings:setConfig', {
      key,
      payload,
      updatedBy: SESSION_ID
    });
    return true;
  } catch (error) {
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
function normalizeWelcomeConfigPayload(config) {
  return {
    title: cleanText(config && config.title, DEFAULT_WELCOME_CONFIG.title),
    subtitle: cleanText(config && config.subtitle, DEFAULT_WELCOME_CONFIG.subtitle),
    durationSeconds: normalizeWelcomeDurationSeconds(config && config.durationSeconds)
  };
}
function exportJson(data, fileName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  downloadBlob(blob, fileName);
}
function WelcomePinkySwearArt() {
  return /*#__PURE__*/_jsxDEV("div", {
    className: "pinky-swear-art",
    role: "img",
    "aria-label": "Animasi pinky swear dua tangan saling mendekat",
    children: [/*#__PURE__*/_jsxDEV("span", {
      className: "pinky-art-texture texture-a"
    }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
      className: "pinky-art-texture texture-b"
    }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
      className: "pinky-art-spark spark-a"
    }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
      className: "pinky-art-spark spark-b"
    }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
      className: "pinky-art-spark spark-c"
    }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
      className: "pinky-art-heart"
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      className: "pinky-hand pinky-hand-left",
      children: [/*#__PURE__*/_jsxDEV("span", {
        className: "pinky-palm"
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        className: "pinky-finger thumb"
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        className: "pinky-finger index"
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        className: "pinky-finger middle"
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        className: "pinky-finger ring"
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        className: "pinky-finger pinky"
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        className: "pinky-cuff"
      }, void 0, false)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      className: "pinky-hand pinky-hand-right",
      children: [/*#__PURE__*/_jsxDEV("span", {
        className: "pinky-palm"
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        className: "pinky-finger thumb"
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        className: "pinky-finger index"
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        className: "pinky-finger middle"
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        className: "pinky-finger ring"
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        className: "pinky-finger pinky"
      }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
        className: "pinky-cuff"
      }, void 0, false)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("span", {
      className: "pinky-hook-glow"
    }, void 0, false)]
  }, void 0, true);
}
function WelcomeSparkStarArt() {
  return /*#__PURE__*/_jsxDEV("div", {
    className: "welcome-spark-star-art",
    role: "img",
    "aria-label": "Animasi spark star",
    children: [/*#__PURE__*/_jsxDEV("span", {
      className: "spark-star-core"
    }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
      className: "spark-star-small spark-a"
    }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
      className: "spark-star-small spark-b"
    }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
      className: "spark-star-small spark-c"
    }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
      className: "spark-star-ring ring-a"
    }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
      className: "spark-star-ring ring-b"
    }, void 0, false)]
  }, void 0, true);
}
function WelcomeOverlay({
  config,
  onDone
}) {
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
    if (doneRef.current) return;
    doneRef.current = true;
    setClosing(true);
    window.setTimeout(() => {
      if (typeof onDoneRef.current === 'function') onDoneRef.current();
    }, 340);
  }
  function handlePointerMove(event) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty('--tilt-x', `${(-y * 5).toFixed(2)}deg`);
    card.style.setProperty('--tilt-y', `${(x * 6).toFixed(2)}deg`);
    card.style.setProperty('--glow-x', `${(x + 0.5) * 100}%`);
    card.style.setProperty('--glow-y', `${(y + 0.5) * 100}%`);
  }
  function resetPointerTilt() {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    card.style.setProperty('--glow-x', '50%');
    card.style.setProperty('--glow-y', '50%');
  }
  return /*#__PURE__*/_jsxDEV("div", {
    className: cx("welcome-dream-overlay", closing && "is-closing"),
    role: "dialog",
    "aria-modal": "true",
    style: {
      '--welcome-duration': String(durationSeconds) + 's',
      position: 'fixed',
      inset: 0,
      zIndex: 95,
      display: 'grid',
      placeItems: 'center',
      padding: '24px',
      overflow: 'hidden',
      background: 'radial-gradient(circle at 18% 18%, rgba(20,184,166,.34), transparent 32%), radial-gradient(circle at 82% 24%, rgba(34,197,94,.24), transparent 34%), linear-gradient(145deg, rgba(15,23,42,.92), rgba(12,74,110,.86))',
      transform: 'translateZ(0)',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      animation: closing ? 'rbvWelcomeOverlayOut .34s cubic-bezier(.22,1,.36,1) forwards' : 'rbvWelcomeOverlayIn .38s cubic-bezier(.22,1,.36,1) both'
    },
    children: [/*#__PURE__*/_jsxDEV("style", {
      children: `@keyframes rbvWelcomeOverlayIn{from{opacity:0}to{opacity:1}} @keyframes rbvWelcomeOverlayOut{from{opacity:1;backdrop-filter:blur(0)}to{opacity:0;backdrop-filter:blur(10px)}} @keyframes rbvWelcomeAura{0%,100%{transform:translate3d(-10px,0,0) scale(1);opacity:.72}50%{transform:translate3d(10px,-8px,0) scale(1.08);opacity:1}} @keyframes rbvWelcomeFloat{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-8px,0)}} @keyframes rbvWelcomeShine{0%{transform:translateX(-115%) rotate(14deg)}100%{transform:translateX(115%) rotate(14deg)}} @keyframes rbvWelcomeTextIn{0%{opacity:0;transform:translate3d(0,14px,0) scale(.98)}100%{opacity:1;transform:translate3d(0,0,0) scale(1)}} @keyframes rbvWelcomeProgress{from{width:0%}to{width:100%}} @keyframes rbvWelcomeSpark{0%,100%{transform:scale(.78) rotate(0deg);opacity:.42}50%{transform:scale(1) rotate(18deg);opacity:1}} @keyframes rbvPromiseFloat{0%,100%{transform:translate3d(0,0,0) rotate(-1deg)}50%{transform:translate3d(0,-4px,0) rotate(1deg)}} @keyframes rbvPromiseHook{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-1px) scale(1.035)}} @keyframes rbvPromiseDot{0%,100%{transform:scale(.86);opacity:.52}50%{transform:scale(1.1);opacity:.9}}`
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      "aria-hidden": "true",
      style: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: '999px',
        left: '-72px',
        top: '12%',
        background: 'rgba(20,184,166,.22)',
        filter: 'blur(18px)',
        animation: 'rbvWelcomeAura 5.5s ease-in-out infinite'
      }
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      "aria-hidden": "true",
      style: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: '999px',
        right: '-92px',
        bottom: '12%',
        background: 'rgba(34,197,94,.18)',
        filter: 'blur(20px)',
        animation: 'rbvWelcomeAura 6.2s ease-in-out infinite reverse'
      }
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      ref: cardRef,
      className: "welcome-dream-card",
      onPointerMove: handlePointerMove,
      onPointerLeave: resetPointerTilt,
      style: {
        '--tilt-x': '0deg',
        '--tilt-y': '0deg',
        '--glow-x': '50%',
        '--glow-y': '50%',
        position: 'relative',
        width: 'min(92vw, 420px)',
        borderRadius: '34px',
        padding: '1px',
        background: 'linear-gradient(135deg, rgba(255,255,255,.82), rgba(20,184,166,.55), rgba(255,255,255,.22))',
        boxShadow: '0 28px 80px rgba(2,6,23,.35)',
        transform: 'perspective(900px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) translateZ(0)',
        transition: 'transform 220ms cubic-bezier(.22,1,.36,1)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      },
      children: /*#__PURE__*/_jsxDEV("div", {
        style: {
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '33px',
          padding: '28px 24px 24px',
          background: 'linear-gradient(160deg, rgba(255,255,255,.96), rgba(240,253,250,.92))'
        },
        children: [/*#__PURE__*/_jsxDEV("div", {
          "aria-hidden": "true",
          style: {
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at var(--glow-x) var(--glow-y), rgba(20,184,166,.24), transparent 34%)',
            pointerEvents: 'none',
            transition: 'background 160ms ease'
          }
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          "aria-hidden": "true",
          style: {
            position: 'absolute',
            top: '-30%',
            bottom: '-30%',
            left: 0,
            width: '58%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.62), transparent)',
            animation: 'rbvWelcomeShine 2.8s cubic-bezier(.22,1,.36,1) infinite',
            pointerEvents: 'none'
          }
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "welcome-dream-content",
          style: {
            position: 'relative',
            display: 'flex',
            minHeight: 230,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            animation: 'rbvWelcomeFloat 4.8s ease-in-out infinite'
          },
          children: [/*#__PURE__*/_jsxDEV("div", {
            "aria-hidden": "true",
            className: "welcome-promise-logo",
            style: {
              display: 'grid',
              placeItems: 'center',
              width: 132,
              height: 98,
              borderRadius: '28px',
              overflow: 'hidden',
              background: '#fff7ed',
              boxShadow: '0 18px 36px rgba(15,23,42,.16)',
              animation: 'rbvWelcomeSpark 3s ease-in-out infinite'
            },
            children: /*#__PURE__*/_jsxDEV(WelcomeSparkStarArt, {}, void 0, false)
          }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
            className: "welcome-kicker",
            style: {
              marginTop: 18,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: '.24em',
              textTransform: 'uppercase',
              color: '#0f766e',
              animation: 'rbvWelcomeTextIn .62s cubic-bezier(.22,1,.36,1) both'
            },
            children: "Bestie Visit"
          }, void 0, false), /*#__PURE__*/_jsxDEV("h1", {
            style: {
              marginTop: 8,
              maxWidth: '100%',
              fontSize: 'clamp(28px, 8vw, 44px)',
              lineHeight: .95,
              fontWeight: 950,
              letterSpacing: '-.055em',
              color: '#020617',
              animation: 'rbvWelcomeTextIn .72s cubic-bezier(.22,1,.36,1) .08s both'
            },
            children: title
          }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
            className: "welcome-subtitle",
            style: {
              marginTop: 14,
              maxWidth: 330,
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.55,
              color: '#475569',
              animation: 'rbvWelcomeTextIn .72s cubic-bezier(.22,1,.36,1) .16s both'
            },
            children: subtitle
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            "aria-hidden": "true",
            style: {
              marginTop: 24,
              height: 7,
              width: 'min(260px, 78%)',
              overflow: 'hidden',
              borderRadius: '999px',
              background: 'rgba(15,118,110,.12)'
            },
            children: /*#__PURE__*/_jsxDEV("span", {
              onAnimationEnd: event => {
                if (event.animationName === 'rbvWelcomeProgress') finishWelcome();
              },
              style: {
                display: 'block',
                height: '100%',
                borderRadius: '999px',
                background: 'linear-gradient(90deg, #0f766e, #14b8a6, #22c55e)',
                animation: `rbvWelcomeProgress ${durationSeconds}s linear forwards`
              }
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true)
    }, void 0, false)]
  }, void 0, true);
}
function SecretPinModal({
  open,
  onClose,
  onUnlock
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    setPin('');
    setError('');
    setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);
  useEffect(() => {
    if (pin.length < 6) return;
    if (pin === '607090') {
      setPin('');
      onUnlock();
    } else {
      setError('PIN salah');
      setPin('');
    }
  }, [pin]);
  if (!open) return null;
  return /*#__PURE__*/_jsxDEV("div", {
    className: "fixed inset-0 z-[90] grid place-items-center bg-slate-950/70 p-5 backdrop-blur-sm",
    role: "dialog",
    "aria-modal": "true",
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "w-full max-w-md rounded-[32px] bg-white p-6 shadow-2xl",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "mb-5 flex items-center justify-between",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "flex items-center gap-3",
          children: [/*#__PURE__*/_jsxDEV("span", {
            className: "grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white",
            children: /*#__PURE__*/_jsxDEV(Icon, {
              name: "shield"
            }, void 0, false)
          }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
            children: [/*#__PURE__*/_jsxDEV("p", {
              className: "text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary",
              children: "Panel Rahasia"
            }, void 0, false), /*#__PURE__*/_jsxDEV("h2", {
              className: "text-xl font-black text-slate-950",
              children: "Masukkan PIN"
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV(Button, {
          variant: "icon",
          onClick: onClose,
          "aria-label": "Tutup",
          children: /*#__PURE__*/_jsxDEV(Icon, {
            name: "close",
            className: "h-4 w-4"
          }, void 0, false)
        }, void 0, false)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("input", {
        ref: inputRef,
        value: pin,
        onChange: event => setPin(event.target.value.replace(/\D/g, '').slice(0, 6)),
        type: "password",
        inputMode: "numeric",
        maxLength: "6",
        className: "form-control text-center text-3xl font-black tracking-[0.5em]",
        placeholder: "------",
        "aria-label": "PIN panel rahasia"
      }, void 0, false), error ? /*#__PURE__*/_jsxDEV("p", {
        className: "mt-3 text-center text-sm font-bold text-rose-600",
        children: error
      }, void 0, false) : null]
    }, void 0, true)
  }, void 0, false);
}
function SecretMonitorPanel({
  open,
  onClose,
  history,
  welcomeConfig,
  onWelcomeConfigChange
}) {
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
  async function saveWelcomeSettings() {
    const saved = saveWelcomeConfig({
      title: welcomeTitle,
      subtitle: welcomeSubtitle,
      durationSeconds: welcomeDurationSeconds
    });
    if (typeof onWelcomeConfigChange === 'function') onWelcomeConfigChange(saved);
    const synced = await syncWelcomeConfigToConvex(saved);
    alert(synced ? 'Text welcome berhasil disimpan dan disinkronkan ke Netlify.' : 'Text welcome tersimpan lokal, tapi Netlify belum aktif atau gagal sync.');
  }
  function saveAssignmentSettings() {
    const saved = saveAssignmentLinkConfig(assignmentLink);
    setAssignmentLink(saved);
    alert('Assignment link berhasil disimpan.');
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
    alert(synced ? 'Informasi update HOME berhasil disimpan dan disinkronkan ke Netlify.' : 'Informasi update tersimpan lokal, tapi Netlify belum aktif atau gagal sync.');
  }
  function applyPdfSettings(nextSettings, showAlert = false) {
    const saved = savePdfSettings(nextSettings);
    setPdfTableFontSize(saved.tableFontSize);
    setPdfTableTitleFontSize(saved.tableTitleFontSize);
    setPdfEvidenceFontSize(saved.evidenceFontSize);
    setPdfTableExtraRows(saved.tableExtraRows);
    setPdfPhotoGridPerPage(saved.photoGridPerPage);
    window.dispatchEvent(new CustomEvent('rbv-pdf-settings-change', {
      detail: saved
    }));
    if (showAlert) alert('Pengaturan PDF berhasil disimpan.');
    return saved;
  }
  function adjustPdfSetting(key, delta) {
    const current = normalizePdfSettings({
      tableFontSize: pdfTableFontSize,
      tableTitleFontSize: pdfTableTitleFontSize,
      evidenceFontSize: pdfEvidenceFontSize,
      tableExtraRows: pdfTableExtraRows,
      photoGridPerPage: pdfPhotoGridPerPage
    });
    applyPdfSettings({
      ...current,
      [key]: Number(current[key]) + delta
    });
  }
  function setPdfPhotoGrid(value) {
    const current = normalizePdfSettings({
      tableFontSize: pdfTableFontSize,
      tableTitleFontSize: pdfTableTitleFontSize,
      evidenceFontSize: pdfEvidenceFontSize,
      tableExtraRows: pdfTableExtraRows,
      photoGridPerPage: pdfPhotoGridPerPage
    });
    applyPdfSettings({
      ...current,
      photoGridPerPage: value
    });
  }
  function resetPdfSettings() {
    applyPdfSettings(DEFAULT_PDF_SETTINGS, true);
  }
  function localRows() {
    return (history || []).map(item => ({
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
    if (!quiet) setLoading(true);
    try {
      const [remoteRowsResult, remoteRequestsResult, presenceRowsResult] = await Promise.allSettled([fetchMonitorRowsFromConvex(), fetchManualRequestsFromConvex(), fetchPresenceRowsFromConvex()]);
      const remoteRows = remoteRowsResult.status === 'fulfilled' ? remoteRowsResult.value : null;
      const remoteRequests = remoteRequestsResult.status === 'fulfilled' ? remoteRequestsResult.value : null;
      const remotePresence = presenceRowsResult.status === 'fulfilled' ? presenceRowsResult.value : null;
      if (remoteRows !== null) {
        applyRows(remoteRows, cloudflareEnabled() ? 'cloudflare' : netlifyEnabled() ? 'netlify' : supabaseEnabled() ? 'supabase' : source === 'convex realtime' ? 'convex realtime' : 'convex');
      } else {
        applyRows(localRows(), 'local');
      }
      if (remoteRequests !== null) {
        setManualRequests(remoteRequests);
      } else {
        setManualRequests(readManualStoreRequests());
      }
      if (remotePresence !== null) {
        setPresenceRows(normalizePresenceRows(remotePresence));
      } else {
        setPresenceRows(readLocalPresenceRows());
      }
    } catch (error) {
      applyRows(localRows(), 'local');
      setManualRequests(readManualStoreRequests());
      setPresenceRows(readLocalPresenceRows());
    } finally {
      if (!quiet) setLoading(false);
    }
  }
  function approveRequest(id) {
    if (!confirmAction('Approve request toko manual ini?')) return;
    approveManualStoreRequest(id);
    setManualRequests(readManualStoreRequests());
    refresh({
      quiet: true
    });
  }
  function rejectRequest(id) {
    if (!confirmAction('Tolak request toko manual ini?')) return;
    rejectManualStoreRequest(id);
    setManualRequests(readManualStoreRequests());
    refresh({
      quiet: true
    });
  }
  useEffect(() => {
    if (!open) return undefined;
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
          pollId = window.setInterval(() => refresh({
            quiet: true
          }), getRemotePollMs());
          return;
        }
        const client = await getConvexRealtimeClient();
        if (cancelled) return;
        if (client) {
          setConnectionState('connecting');
          if (typeof client.subscribeToConnectionState === 'function') {
            unsubscribeConnection = client.subscribeToConnectionState(state => {
              const status = state?.hasInflightRequests ? 'syncing' : state?.isWebSocketConnected ? 'online' : 'connecting';
              setConnectionState(status);
            });
          }
          unsubscribeRows = await subscribeConvexQuery(getConvexConfig().monitorQuery || 'monitor:listVisits', {}, nextRows => {
            if (cancelled) return;
            applyRows(nextRows, 'convex realtime');
            setConnectionState('online');
            setLoading(false);
          }, error => {
            console.warn('Realtime monitor rows gagal:', error);
            if (!cancelled) {
              setConnectionState('error');
              refresh({
                quiet: true
              });
            }
          });
          unsubscribeRequests = await subscribeConvexQuery(getConvexConfig().manualRequestsQuery || 'monitor:listManualStoreRequests', {}, nextRequests => {
            if (cancelled) return;
            applyManualRequests(nextRequests);
            setConnectionState('online');
            setLoading(false);
          }, error => {
            console.warn('Realtime request toko gagal:', error);
            if (!cancelled) {
              setConnectionState('error');
              setManualRequests(readManualStoreRequests());
            }
          });
          unsubscribePresence = await subscribeConvexQuery(getConvexConfig().presenceQuery || 'monitor:listPresence', {}, nextPresenceRows => {
            if (cancelled) return;
            setPresenceRows(normalizePresenceRows(nextPresenceRows));
            setConnectionState('online');
            setLoading(false);
          }, error => {
            console.warn('Realtime presence gagal:', error);
            if (!cancelled) setPresenceRows(readLocalPresenceRows());
          });
        }
        if (!unsubscribeRows && !unsubscribeRequests && !unsubscribePresence) {
          await refresh();
          pollId = window.setInterval(() => refresh({
            quiet: true
          }), getRemotePollMs());
        } else {
          await refresh({
            quiet: true
          });
        }
      } catch (error) {
        console.warn('Realtime Convex gagal, fallback refresh:', error);
        if (!cancelled) {
          setConnectionState('fallback');
          await refresh();
          pollId = window.setInterval(() => refresh({
            quiet: true
          }), getRemotePollMs());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    startRealtime();
    return () => {
      cancelled = true;
      if (pollId) window.clearInterval(pollId);
      try {
        unsubscribeRows?.();
      } catch (error) {}
      try {
        unsubscribeRequests?.();
      } catch (error) {}
      try {
        unsubscribePresence?.();
      } catch (error) {}
      try {
        unsubscribeConnection?.();
      } catch (error) {}
    };
  }, [open, history]);
  if (!open) return null;
  const filtered = rows.filter(row => {
    const haystack = normalize([row.bestie_name, row.store_name, row.store_code].join(' '));
    return !query || haystack.includes(normalize(query));
  });
  const onlinePresence = normalizePresenceRows(presenceRows).filter(row => row.is_online);
  const uniqueBesties = new Set(rows.map(row => normalize(row.bestie_name)).filter(Boolean)).size;
  const today = new Date().toISOString().slice(0, 10);
  const todayVisits = rows.filter(row => String(row.visit_date || '').slice(0, 10) === today).length;
  const isLive = source === 'cloudflare' || source === 'netlify' || source === 'supabase' || source === 'convex realtime';
  const sourceBadgeLabel = source === 'cloudflare' ? 'Cloudflare D1' : source === 'netlify' ? 'Netlify Sync' : source === 'supabase' ? 'Supabase Sync' : source === 'convex realtime' ? 'Live Convex' : 'Manual refresh';
  const connectionTone = connectionState === 'online' ? 'success' : connectionState === 'error' || connectionState === 'fallback' ? 'warning' : 'default';
  return /*#__PURE__*/_jsxDEV("div", {
    className: "secret-admin-backdrop fixed inset-0 z-[85] overflow-auto bg-slate-950/65 p-3 backdrop-blur-sm md:p-6",
    role: "dialog",
    "aria-modal": "true",
    children: /*#__PURE__*/_jsxDEV("div", {
      className: "secret-admin-panel mx-auto max-w-6xl rounded-[32px] bg-white p-5 shadow-2xl md:p-7",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between",
        children: [/*#__PURE__*/_jsxDEV("div", {
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "flex flex-wrap items-center gap-2",
            children: [/*#__PURE__*/_jsxDEV("p", {
              className: "text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary",
              children: "Panel Rahasia Admin"
            }, void 0, false), secretTab === 'monitoring' ? /*#__PURE__*/_jsxDEV(Badge, {
              tone: isLive ? 'success' : 'default',
              children: sourceBadgeLabel
            }, void 0, false) : /*#__PURE__*/_jsxDEV(Badge, {
              tone: "default",
              children: "Setting Web"
            }, void 0, false), secretTab === 'monitoring' ? /*#__PURE__*/_jsxDEV(Badge, {
              tone: connectionTone,
              children: connectionState
            }, void 0, false) : null]
          }, void 0, true), /*#__PURE__*/_jsxDEV("h2", {
            className: "mt-2 text-2xl font-black text-slate-950",
            children: secretTab === 'monitoring' ? 'Monitoring Bestie Realtime' : 'Setting Web & PDF'
          }, void 0, false), secretTab === 'monitoring' && lastSync ? /*#__PURE__*/_jsxDEV("p", {
            className: "mt-1 text-xs font-semibold text-slate-500",
            children: ["Update terakhir: ", formatDateTime(lastSync)]
          }, void 0, true) : null]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "flex flex-wrap gap-2",
          children: [secretTab === 'monitoring' ? /*#__PURE__*/_jsxDEV(Button, {
            variant: "secondary",
            icon: "download",
            onClick: () => exportJson(rows, 'regional-bestie-monitor.json'),
            children: "Export JSON"
          }, void 0, false) : null, secretTab === 'monitoring' ? /*#__PURE__*/_jsxDEV(Button, {
            variant: "secondary",
            icon: "spark",
            onClick: () => refresh(),
            disabled: loading,
            children: loading ? 'Sync...' : 'Refresh'
          }, void 0, false) : null, /*#__PURE__*/_jsxDEV(Button, {
            variant: "icon",
            onClick: onClose,
            "aria-label": "Tutup",
            children: /*#__PURE__*/_jsxDEV(Icon, {
              name: "close",
              className: "h-4 w-4"
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "secret-panel-tabs mb-5 grid grid-cols-2 gap-2 rounded-3xl bg-slate-100 p-1",
        children: [/*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: cx('secret-panel-tab', secretTab === 'settings' && 'active'),
          onClick: () => setSecretTab('settings'),
          children: [/*#__PURE__*/_jsxDEV(Icon, {
            name: "settings",
            className: "h-4 w-4"
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            children: "Setting Web"
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: cx('secret-panel-tab', secretTab === 'monitoring' && 'active'),
          onClick: () => setSecretTab('monitoring'),
          children: [/*#__PURE__*/_jsxDEV(Icon, {
            name: "history",
            className: "h-4 w-4"
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            children: "Monitoring"
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true), secretTab === 'settings' ? /*#__PURE__*/_jsxDEV(_Fragment, {
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "mb-5 rounded-3xl border border-cyan-100 bg-cyan-50/70 p-4",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "mb-3 flex items-center justify-between gap-3",
            children: [/*#__PURE__*/_jsxDEV("div", {
              children: [/*#__PURE__*/_jsxDEV("p", {
                className: "text-xs font-extrabold uppercase tracking-[0.18em] text-audit-primary",
                children: "Welcome Animation"
              }, void 0, false), /*#__PURE__*/_jsxDEV("h3", {
                className: "text-lg font-black text-slate-950",
                children: "Edit Welcome"
              }, void 0, false)]
            }, void 0, true), /*#__PURE__*/_jsxDEV(Button, {
              variant: "secondary",
              icon: "check",
              onClick: saveWelcomeSettings,
              children: "Simpan Welcome"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "grid gap-3 md:grid-cols-3",
            children: [/*#__PURE__*/_jsxDEV(Field, {
              label: "Head title",
              children: /*#__PURE__*/_jsxDEV(TextInput, {
                value: welcomeTitle,
                onChange: event => setWelcomeTitle(event.target.value),
                placeholder: DEFAULT_WELCOME_CONFIG.title
              }, void 0, false)
            }, void 0, false), /*#__PURE__*/_jsxDEV(Field, {
              label: "Sub title",
              children: /*#__PURE__*/_jsxDEV(TextArea, {
                value: welcomeSubtitle,
                onChange: event => setWelcomeSubtitle(event.target.value),
                minRows: 2,
                placeholder: DEFAULT_WELCOME_CONFIG.subtitle
              }, void 0, false)
            }, void 0, false), /*#__PURE__*/_jsxDEV(Field, {
              label: "Durasi (detik)",
              helper: "Bisa diisi 1 sampai 15 detik.",
              children: /*#__PURE__*/_jsxDEV(TextInput, {
                type: "number",
                min: "1",
                max: "15",
                step: "0.5",
                value: welcomeDurationSeconds,
                onChange: event => setWelcomeDurationSeconds(event.target.value),
                onBlur: () => setWelcomeDurationSeconds(normalizeWelcomeDurationSeconds(welcomeDurationSeconds))
              }, void 0, false)
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-4",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "mb-3 flex items-center justify-between gap-3",
            children: [/*#__PURE__*/_jsxDEV("div", {
              children: [/*#__PURE__*/_jsxDEV("p", {
                className: "text-xs font-extrabold uppercase tracking-[0.18em] text-audit-primary",
                children: "Hidden Control"
              }, void 0, false), /*#__PURE__*/_jsxDEV("h3", {
                className: "text-lg font-black text-slate-950",
                children: "Assignment Link"
              }, void 0, false)]
            }, void 0, true), /*#__PURE__*/_jsxDEV(Button, {
              variant: "secondary",
              icon: "check",
              onClick: saveAssignmentSettings,
              children: "Simpan Link"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV(Field, {
            label: "Link corrective action assignment",
            helper: "Button assignment di form audit sudah dihapus. Link ini dipakai otomatis di PDF.",
            children: /*#__PURE__*/_jsxDEV(TextInput, {
              type: "url",
              value: assignmentLink,
              onChange: event => setAssignmentLink(event.target.value),
              placeholder: DEFAULT_ASSIGNMENT_LINK
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "mb-5 rounded-3xl border border-teal-100 bg-teal-50/70 p-4",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "mb-3 flex items-center justify-between gap-3",
            children: [/*#__PURE__*/_jsxDEV("div", {
              children: [/*#__PURE__*/_jsxDEV("p", {
                className: "text-xs font-extrabold uppercase tracking-[0.18em] text-audit-primary",
                children: "Home Notification"
              }, void 0, false), /*#__PURE__*/_jsxDEV("h3", {
                className: "text-lg font-black text-slate-950",
                children: "Info Update Website"
              }, void 0, false)]
            }, void 0, true), /*#__PURE__*/_jsxDEV(Button, {
              variant: "secondary",
              icon: "check",
              onClick: saveNoticeSettings,
              children: "Simpan Info"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "grid gap-3 md:grid-cols-[0.8fr_1.4fr_0.6fr]",
            children: [/*#__PURE__*/_jsxDEV(Field, {
              label: "Judul",
              children: /*#__PURE__*/_jsxDEV(TextInput, {
                value: noticeTitle,
                onChange: event => setNoticeTitle(event.target.value),
                placeholder: DEFAULT_UPDATE_NOTICE_CONFIG.title
              }, void 0, false)
            }, void 0, false), /*#__PURE__*/_jsxDEV(Field, {
              label: "Isi slide text",
              helper: "Pisahkan setiap informasi dengan baris baru.",
              children: /*#__PURE__*/_jsxDEV(TextArea, {
                value: noticeMessagesText,
                onChange: event => setNoticeMessagesText(event.target.value),
                minRows: 3,
                placeholder: DEFAULT_UPDATE_NOTICE_CONFIG.messages.join('\n')
              }, void 0, false)
            }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
              className: "grid gap-3",
              children: [/*#__PURE__*/_jsxDEV(Field, {
                label: "Interval",
                helper: "2 sampai 15 detik",
                children: /*#__PURE__*/_jsxDEV(TextInput, {
                  type: "number",
                  min: "2",
                  max: "15",
                  step: "0.5",
                  value: noticeIntervalSeconds,
                  onChange: event => setNoticeIntervalSeconds(event.target.value),
                  onBlur: () => setNoticeIntervalSeconds(normalizeUpdateNoticeIntervalSeconds(noticeIntervalSeconds))
                }, void 0, false)
              }, void 0, false), /*#__PURE__*/_jsxDEV(Toggle, {
                checked: noticeEnabled,
                onChange: setNoticeEnabled,
                label: noticeEnabled ? 'Tampil di HOME' : 'Sembunyikan'
              }, void 0, false)]
            }, void 0, true)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "mb-5 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
            children: [/*#__PURE__*/_jsxDEV("div", {
              children: [/*#__PURE__*/_jsxDEV("h3", {
                className: "text-lg font-black text-slate-950",
                children: "Pengaturan PDF"
              }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
                className: "text-xs font-semibold text-slate-500",
                children: "Atur ukuran isi table, title field seperti Temuan/Kondisi Ideal, jarak title ke isi konten, deskripsi foto, dan grid foto per halaman PDF."
              }, void 0, false)]
            }, void 0, true), /*#__PURE__*/_jsxDEV(Badge, {
              tone: "success",
              children: "Auto Save"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "grid gap-3 md:grid-cols-5",
            children: [/*#__PURE__*/_jsxDEV("div", {
              className: "rounded-2xl bg-white p-3 ring-1 ring-emerald-100",
              children: [/*#__PURE__*/_jsxDEV("p", {
                className: "text-xs font-extrabold uppercase tracking-wide text-slate-500",
                children: "Font Isi Table PDF"
              }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
                className: "mt-3 flex items-center justify-between gap-2",
                children: [/*#__PURE__*/_jsxDEV(Button, {
                  variant: "secondary",
                  onClick: () => adjustPdfSetting('tableFontSize', -0.5),
                  children: "-"
                }, void 0, false), /*#__PURE__*/_jsxDEV("strong", {
                  className: "text-lg text-slate-950",
                  children: Number(pdfTableFontSize).toFixed(1)
                }, void 0, false), /*#__PURE__*/_jsxDEV(Button, {
                  variant: "secondary",
                  onClick: () => adjustPdfSetting('tableFontSize', 0.5),
                  children: "+"
                }, void 0, false)]
              }, void 0, true)]
            }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
              className: "rounded-2xl bg-white p-3 ring-1 ring-emerald-100",
              children: [/*#__PURE__*/_jsxDEV("p", {
                className: "text-xs font-extrabold uppercase tracking-wide text-slate-500",
                children: "Font Title Field PDF"
              }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
                className: "mt-3 flex items-center justify-between gap-2",
                children: [/*#__PURE__*/_jsxDEV(Button, {
                  variant: "secondary",
                  onClick: () => adjustPdfSetting('tableTitleFontSize', -0.5),
                  children: "-"
                }, void 0, false), /*#__PURE__*/_jsxDEV("strong", {
                  className: "text-lg text-slate-950",
                  children: Number(pdfTableTitleFontSize).toFixed(1)
                }, void 0, false), /*#__PURE__*/_jsxDEV(Button, {
                  variant: "secondary",
                  onClick: () => adjustPdfSetting('tableTitleFontSize', 0.5),
                  children: "+"
                }, void 0, false)]
              }, void 0, true), /*#__PURE__*/_jsxDEV("p", {
                className: "mt-2 text-[10px] font-bold leading-4 text-emerald-700",
                children: "Untuk label Temuan, Kondisi Ideal, Dampak, dll. Spacing ke isi ikut menyesuaikan."
              }, void 0, false)]
            }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
              className: "rounded-2xl bg-white p-3 ring-1 ring-emerald-100",
              children: [/*#__PURE__*/_jsxDEV("p", {
                className: "text-xs font-extrabold uppercase tracking-wide text-slate-500",
                children: "Font Deskripsi Foto"
              }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
                className: "mt-3 flex items-center justify-between gap-2",
                children: [/*#__PURE__*/_jsxDEV(Button, {
                  variant: "secondary",
                  onClick: () => adjustPdfSetting('evidenceFontSize', -0.5),
                  children: "-"
                }, void 0, false), /*#__PURE__*/_jsxDEV("strong", {
                  className: "text-lg text-slate-950",
                  children: Number(pdfEvidenceFontSize).toFixed(1)
                }, void 0, false), /*#__PURE__*/_jsxDEV(Button, {
                  variant: "secondary",
                  onClick: () => adjustPdfSetting('evidenceFontSize', 0.5),
                  children: "+"
                }, void 0, false)]
              }, void 0, true)]
            }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
              className: "rounded-2xl bg-white p-3 ring-1 ring-emerald-100",
              children: [/*#__PURE__*/_jsxDEV("p", {
                className: "text-xs font-extrabold uppercase tracking-wide text-slate-500",
                children: "Add Row Table PDF"
              }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
                className: "mt-3 flex items-center justify-between gap-2",
                children: [/*#__PURE__*/_jsxDEV(Button, {
                  variant: "secondary",
                  onClick: () => adjustPdfSetting('tableExtraRows', -1),
                  children: "-"
                }, void 0, false), /*#__PURE__*/_jsxDEV("strong", {
                  className: "text-lg text-slate-950",
                  children: ["+", pdfTableExtraRows]
                }, void 0, true), /*#__PURE__*/_jsxDEV(Button, {
                  variant: "secondary",
                  onClick: () => adjustPdfSetting('tableExtraRows', 1),
                  children: "+"
                }, void 0, false)]
              }, void 0, true)]
            }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
              className: "rounded-2xl bg-white p-3 ring-1 ring-emerald-100",
              children: [/*#__PURE__*/_jsxDEV("p", {
                className: "text-xs font-extrabold uppercase tracking-wide text-slate-500",
                children: "Grid Foto PDF"
              }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
                className: "mt-3 grid grid-cols-3 gap-1",
                children: [4, 6, 8].map(option => /*#__PURE__*/_jsxDEV("button", {
                  type: "button",
                  className: cx('rounded-xl px-2 py-2 text-xs font-black ring-1 transition', pdfPhotoGridPerPage === option ? 'bg-audit-primary text-white ring-audit-primary' : 'bg-slate-50 text-slate-700 ring-slate-200'),
                  onClick: () => setPdfPhotoGrid(option),
                  children: option
                }, option, false))
              }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
                className: "mt-2 text-[10px] font-bold leading-4 text-emerald-700",
                children: "Rekomendasi: 6 foto/halaman."
              }, void 0, false)]
            }, void 0, true)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "mt-3 flex flex-wrap gap-2",
            children: [/*#__PURE__*/_jsxDEV(Button, {
              variant: "secondary",
              icon: "check",
              onClick: () => applyPdfSettings({
                tableFontSize: pdfTableFontSize,
                tableTitleFontSize: pdfTableTitleFontSize,
                evidenceFontSize: pdfEvidenceFontSize,
                tableExtraRows: pdfTableExtraRows,
                photoGridPerPage: pdfPhotoGridPerPage
              }, true),
              children: "Simpan PDF Setting"
            }, void 0, false), /*#__PURE__*/_jsxDEV(Button, {
              variant: "secondary",
              icon: "eraser",
              onClick: resetPdfSettings,
              children: "Reset Default"
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-4",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "mb-3 flex items-center justify-between gap-3",
            children: [/*#__PURE__*/_jsxDEV("h3", {
              className: "text-lg font-black text-slate-950",
              children: "Request Toko Manual"
            }, void 0, false), /*#__PURE__*/_jsxDEV(Badge, {
              tone: "default",
              children: [manualRequests.filter(item => item.status === 'pending').length, " pending"]
            }, void 0, true)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "grid gap-3",
            children: manualRequests.length ? manualRequests.map(item => /*#__PURE__*/_jsxDEV("div", {
              className: "rounded-2xl bg-white p-3 ring-1 ring-slate-200",
              children: /*#__PURE__*/_jsxDEV("div", {
                className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
                children: [/*#__PURE__*/_jsxDEV("div", {
                  className: "min-w-0",
                  children: [/*#__PURE__*/_jsxDEV("p", {
                    className: "font-extrabold text-slate-950",
                    children: item.storeName || '-'
                  }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
                    className: "text-xs text-slate-500",
                    children: [item.bestieName || '-', " • ", item.storeCode || '-', " • ", formatDateTime(item.createdAt)]
                  }, void 0, true), item.address ? /*#__PURE__*/_jsxDEV("p", {
                    className: "mt-1 text-xs text-slate-600",
                    children: item.address
                  }, void 0, false) : null]
                }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
                  className: "flex flex-wrap items-center gap-2",
                  children: [/*#__PURE__*/_jsxDEV(Badge, {
                    tone: item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'warning' : 'default',
                    children: item.status
                  }, void 0, false), item.status === 'pending' ? /*#__PURE__*/_jsxDEV(_Fragment, {
                    children: [/*#__PURE__*/_jsxDEV(Button, {
                      variant: "secondary",
                      icon: "check",
                      onClick: () => approveRequest(item.id),
                      children: "Approve"
                    }, void 0, false), /*#__PURE__*/_jsxDEV(Button, {
                      variant: "danger",
                      icon: "close",
                      onClick: () => rejectRequest(item.id),
                      children: "Reject"
                    }, void 0, false)]
                  }, void 0, true) : null]
                }, void 0, true)]
              }, void 0, true)
            }, item.id, false)) : /*#__PURE__*/_jsxDEV("div", {
              className: "rounded-2xl bg-white p-4 text-sm font-bold text-slate-500 ring-1 ring-slate-200",
              children: "Belum ada request."
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true) : /*#__PURE__*/_jsxDEV(_Fragment, {
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "rounded-3xl bg-slate-950 p-5 text-white",
            children: [/*#__PURE__*/_jsxDEV("p", {
              className: "text-xs font-bold uppercase text-slate-300",
              children: "Source"
            }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
              className: "mt-2 text-2xl font-black capitalize",
              children: source
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "rounded-3xl bg-emerald-50 p-5 text-emerald-900 ring-1 ring-emerald-100",
            children: [/*#__PURE__*/_jsxDEV("p", {
              className: "text-xs font-bold uppercase",
              children: "Online"
            }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
              className: "mt-2 text-3xl font-black",
              children: onlinePresence.length
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "rounded-3xl bg-cyan-50 p-5 text-cyan-900 ring-1 ring-cyan-100",
            children: [/*#__PURE__*/_jsxDEV("p", {
              className: "text-xs font-bold uppercase",
              children: "Total Visit"
            }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
              className: "mt-2 text-3xl font-black",
              children: rows.length
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "rounded-3xl bg-orange-50 p-5 text-orange-900 ring-1 ring-orange-100",
            children: [/*#__PURE__*/_jsxDEV("p", {
              className: "text-xs font-bold uppercase",
              children: "Bestie Unik"
            }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
              className: "mt-2 text-3xl font-black",
              children: uniqueBesties
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "rounded-3xl bg-slate-50 p-5 text-slate-900 ring-1 ring-slate-200",
            children: [/*#__PURE__*/_jsxDEV("p", {
              className: "text-xs font-bold uppercase text-slate-500",
              children: "Visit Hari Ini"
            }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
              className: "mt-2 text-3xl font-black",
              children: todayVisits
            }, void 0, false)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "mb-5 rounded-3xl border border-emerald-100 bg-emerald-50/80 p-4",
          children: [/*#__PURE__*/_jsxDEV("div", {
            className: "mb-3 flex items-center justify-between gap-3",
            children: [/*#__PURE__*/_jsxDEV("div", {
              children: [/*#__PURE__*/_jsxDEV("p", {
                className: "text-xs font-extrabold uppercase tracking-[0.18em] text-audit-primary",
                children: "Live Presence"
              }, void 0, false), /*#__PURE__*/_jsxDEV("h3", {
                className: "text-lg font-black text-slate-950",
                children: "Bestie Yang Sedang Online"
              }, void 0, false)]
            }, void 0, true), /*#__PURE__*/_jsxDEV(Badge, {
              tone: "success",
              children: "Realtime"
            }, void 0, false)]
          }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
            className: "grid gap-3 md:grid-cols-2",
            children: onlinePresence.length ? onlinePresence.map(row => /*#__PURE__*/_jsxDEV("div", {
              className: "rounded-2xl bg-white p-3 ring-1 ring-emerald-100",
              children: [/*#__PURE__*/_jsxDEV("div", {
                className: "flex items-start justify-between gap-3",
                children: [/*#__PURE__*/_jsxDEV("div", {
                  className: "min-w-0",
                  children: [/*#__PURE__*/_jsxDEV("div", {
                    className: "flex items-center gap-2",
                    children: [/*#__PURE__*/_jsxDEV("span", {
                      className: "h-2.5 w-2.5 rounded-full bg-emerald-500",
                      style: {
                        boxShadow: '0 0 0 5px rgba(16,185,129,.14)'
                      }
                    }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
                      className: "truncate font-black text-slate-950",
                      children: row.bestie_name || '-'
                    }, void 0, false)]
                  }, void 0, true), /*#__PURE__*/_jsxDEV("p", {
                    className: "mt-1 truncate text-xs font-bold text-slate-600",
                    children: ["Store: ", row.store_name || '-']
                  }, void 0, true), /*#__PURE__*/_jsxDEV("p", {
                    className: "mt-1 truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400",
                    children: [row.active_screen || 'home', " • ", row.store_code || '-']
                  }, void 0, true)]
                }, void 0, true), /*#__PURE__*/_jsxDEV(Badge, {
                  tone: "success",
                  children: "Online"
                }, void 0, false)]
              }, void 0, true), /*#__PURE__*/_jsxDEV("p", {
                className: "mt-2 text-[11px] font-semibold text-slate-400",
                children: ["Last seen: ", formatDateTime(row.last_seen_at || row.updated_at)]
              }, void 0, true)]
            }, row.session_id, true)) : /*#__PURE__*/_jsxDEV("div", {
              className: "rounded-2xl bg-white p-4 text-sm font-bold text-slate-500 ring-1 ring-emerald-100",
              children: "Belum ada bestie online yang terdeteksi."
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "mb-4 max-w-md",
          children: /*#__PURE__*/_jsxDEV("div", {
            className: "relative",
            children: [/*#__PURE__*/_jsxDEV(Icon, {
              name: "search",
              className: "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            }, void 0, false), /*#__PURE__*/_jsxDEV(TextInput, {
              value: query,
              onChange: e => setQuery(e.target.value),
              placeholder: "Cari bestie, store, kode...",
              className: "pl-12"
            }, void 0, false)]
          }, void 0, true)
        }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
          className: "table-scroll overflow-hidden rounded-3xl border border-slate-200",
          children: /*#__PURE__*/_jsxDEV("table", {
            className: "w-full border-collapse bg-white text-sm",
            children: [/*#__PURE__*/_jsxDEV("thead", {
              className: "bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500",
              children: /*#__PURE__*/_jsxDEV("tr", {
                children: [/*#__PURE__*/_jsxDEV("th", {
                  className: "px-4 py-3",
                  children: "No"
                }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                  className: "px-4 py-3",
                  children: "Bestie"
                }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                  className: "px-4 py-3",
                  children: "Kode"
                }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                  className: "px-4 py-3",
                  children: "Store"
                }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                  className: "px-4 py-3",
                  children: "Visit"
                }, void 0, false), /*#__PURE__*/_jsxDEV("th", {
                  className: "px-4 py-3",
                  children: "Update"
                }, void 0, false)]
              }, void 0, true)
            }, void 0, false), /*#__PURE__*/_jsxDEV("tbody", {
              children: filtered.length ? filtered.map((row, index) => /*#__PURE__*/_jsxDEV("tr", {
                className: "border-t border-slate-100",
                children: [/*#__PURE__*/_jsxDEV("td", {
                  className: "px-4 py-3 font-bold text-slate-500",
                  children: index + 1
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  className: "px-4 py-3 font-bold text-slate-900",
                  children: row.bestie_name || '-'
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  className: "px-4 py-3",
                  children: row.store_code || '-'
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  className: "px-4 py-3",
                  children: row.store_name || '-'
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  className: "px-4 py-3",
                  children: formatDate(row.visit_date)
                }, void 0, false), /*#__PURE__*/_jsxDEV("td", {
                  className: "px-4 py-3 text-slate-500",
                  children: formatDateTime(row.updated_at)
                }, void 0, false)]
              }, `${row.bestie_name}-${row.store_name}-${index}`, true)) : /*#__PURE__*/_jsxDEV("tr", {
                children: /*#__PURE__*/_jsxDEV("td", {
                  colSpan: "6",
                  className: "px-4 py-10 text-center text-slate-500",
                  children: "Tidak ada data."
                }, void 0, false)
              }, void 0, false)
            }, void 0, false)]
          }, void 0, true)
        }, void 0, false)]
      }, void 0, true)]
    }, void 0, true)
  }, void 0, false);
}
function DesktopSidebar({
  screen,
  setScreen,
  visit,
  activeSection,
  goSection,
  onNewVisit,
  onClearData,
  onTitleTap
}) {
  return /*#__PURE__*/_jsxDEV("aside", {
    className: "desktop-sidebar hidden min-h-screen border-r border-slate-200 bg-white/86 p-4 backdrop-blur-xl md:flex md:flex-col",
    children: [/*#__PURE__*/_jsxDEV("button", {
      type: "button",
      onClick: onTitleTap,
      className: "mb-6 rounded-[28px] bg-slate-950 p-5 text-left text-white transition hover:-translate-y-0.5",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/10",
        children: /*#__PURE__*/_jsxDEV(Icon, {
          name: "spark"
        }, void 0, false)
      }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
        className: "text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-200",
        children: "Bestie Audit"
      }, void 0, false), /*#__PURE__*/_jsxDEV("h2", {
        className: "mt-2 text-xl font-black leading-tight",
        children: "Visit Report System"
      }, void 0, false)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("nav", {
      className: "space-y-2",
      "aria-label": "System menu",
      children: [/*#__PURE__*/_jsxDEV("button", {
        type: "button",
        className: cx('nav-item', screen === 'dashboard' && 'active'),
        onClick: () => {
          onTitleTap?.();
          setScreen('dashboard');
        },
        children: /*#__PURE__*/_jsxDEV("span", {
          className: "flex items-center gap-3",
          children: [/*#__PURE__*/_jsxDEV(Icon, {
            name: "home"
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            children: /*#__PURE__*/_jsxDEV("span", {
              className: "block font-extrabold",
              children: "Dashboard"
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)
      }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
        type: "button",
        className: cx('nav-item', screen === 'audit' && 'active'),
        onClick: () => visit ? setScreen('audit') : onNewVisit(),
        children: /*#__PURE__*/_jsxDEV("span", {
          className: "flex items-center gap-3",
          children: [/*#__PURE__*/_jsxDEV(Icon, {
            name: "clipboard"
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            children: /*#__PURE__*/_jsxDEV("span", {
              className: "block font-extrabold",
              children: "Audit Form"
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)
      }, void 0, false), /*#__PURE__*/_jsxDEV("button", {
        type: "button",
        className: cx('nav-item', screen === 'preview' && 'active'),
        onClick: () => visit ? setScreen('preview') : onNewVisit(),
        children: /*#__PURE__*/_jsxDEV("span", {
          className: "flex items-center gap-3",
          children: [/*#__PURE__*/_jsxDEV(Icon, {
            name: "pdf"
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            children: /*#__PURE__*/_jsxDEV("span", {
              className: "block font-extrabold",
              children: "Preview PDF"
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)
      }, void 0, false)]
    }, void 0, true), visit ? /*#__PURE__*/_jsxDEV("div", {
      className: "mt-6",
      children: [/*#__PURE__*/_jsxDEV("p", {
        className: "mb-3 px-2 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500",
        children: "Sub Menu Section"
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        className: "space-y-1",
        children: SECTION_DEFS.map((section, index) => /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: cx('nav-item !rounded-2xl !px-3 !py-2', screen === 'audit' && activeSection === index && 'active'),
          onClick: () => {
            setScreen('audit');
            goSection(index);
          },
          children: /*#__PURE__*/_jsxDEV("span", {
            className: "flex items-center gap-3",
            children: [/*#__PURE__*/_jsxDEV(Icon, {
              name: section.icon,
              className: "h-4 w-4"
            }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
              className: "min-w-0",
              children: /*#__PURE__*/_jsxDEV("span", {
                className: "block truncate text-sm font-extrabold",
                children: section.title
              }, void 0, false)
            }, void 0, false)]
          }, void 0, true)
        }, section.id, false))
      }, void 0, false)]
    }, void 0, true) : null, /*#__PURE__*/_jsxDEV("div", {
      className: "mt-auto space-y-2 pt-5",
      children: [/*#__PURE__*/_jsxDEV(Button, {
        className: "w-full",
        variant: "secondary",
        icon: "plus",
        onClick: onNewVisit,
        children: "Kunjungan Baru"
      }, void 0, false), visit ? /*#__PURE__*/_jsxDEV(Button, {
        className: "w-full",
        variant: "danger",
        icon: "eraser",
        onClick: onClearData,
        children: "Clear Data"
      }, void 0, false) : null]
    }, void 0, true)]
  }, void 0, true);
}
function MobileTopBar({
  screen,
  visit,
  activeSection,
  goSection
}) {
  const scrollerRef = useRef(null);
  useEffect(() => {
    if (screen !== 'audit' || !visit) return;
    const activeChip = scrollerRef.current?.querySelector('[data-active="true"]');
    activeChip?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    });
  }, [screen, Boolean(visit), activeSection]);
  if (screen !== 'audit' || !visit) return null;
  const progress = visitProgress(visit);
  const safeProgress = Math.max(0, Math.min(100, progress || 0));
  return /*#__PURE__*/_jsxDEV("div", {
    className: "visit-quick-dock-v54 md:hidden",
    role: "navigation",
    "aria-label": mobileMissingText,
    title: mobileMissingText,
    style: {
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
    },
    children: [/*#__PURE__*/_jsxDEV("div", {
      ref: scrollerRef,
      className: "visit-quick-dock-scroll-v54",
      style: {
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
      },
      children: SECTION_DEFS.map((section, index) => {
        const active = activeSection === index;
        const minWidth = section.id === 'evidence' ? 108 : section.id === 'qsc' ? 88 : section.id === 'observation' ? 92 : 96;
        return /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: "visit-quick-dock-chip-v54",
          onClick: () => goSection(index),
          "aria-current": active ? 'page' : undefined,
          "aria-label": `Buka section ${section.title}`,
          "data-active": active ? 'true' : undefined,
          style: {
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
          },
          children: [/*#__PURE__*/_jsxDEV("span", {
            className: "visit-quick-dock-icon-v54",
            style: {
              display: 'inline-grid',
              placeItems: 'center',
              width: 22,
              height: 22,
              borderRadius: '999px',
              background: active ? 'rgba(255,255,255,0.16)' : 'rgba(15,118,110,0.10)',
              color: active ? '#ffffff' : '#0f766e',
              flex: '0 0 auto'
            },
            children: /*#__PURE__*/_jsxDEV(Icon, {
              name: section.icon,
              className: "h-4 w-4"
            }, void 0, false)
          }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
            style: {
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            },
            children: section.label
          }, void 0, false)]
        }, section.id, true);
      })
    }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
      "aria-hidden": "true",
      style: {
        position: 'absolute',
        left: '16px',
        right: '16px',
        bottom: '6px',
        height: '2px',
        overflow: 'hidden',
        borderRadius: '999px',
        background: 'rgba(203,213,225,0.58)'
      },
      children: /*#__PURE__*/_jsxDEV("div", {
        style: {
          width: safeProgress + '%',
          height: '100%',
          borderRadius: '999px',
          background: 'linear-gradient(90deg, #0f766e, #14b8a6)'
        }
      }, void 0, false)
    }, void 0, false)]
  }, void 0, true);
}
function MobileBottomNav({
  screen,
  setScreen,
  visit,
  onNewVisit,
  onClearData
}) {
  const goAudit = () => visit ? setScreen('audit') : onNewVisit();
  const goPreview = () => visit ? setScreen('preview') : onNewVisit();
  const items = [{
    key: 'dashboard',
    label: 'Home',
    icon: 'home',
    action: () => setScreen('dashboard'),
    active: screen === 'dashboard'
  }, {
    key: 'audit',
    label: 'Audit',
    icon: 'clipboard',
    action: goAudit,
    active: screen === 'audit'
  }, {
    key: 'preview',
    label: 'Preview',
    icon: 'pdf',
    action: goPreview,
    active: screen === 'preview'
  }];
  return /*#__PURE__*/_jsxDEV("nav", {
    className: "mobile-system-nav md:hidden",
    "aria-label": "Mobile system navigation",
    children: /*#__PURE__*/_jsxDEV("div", {
      className: cx('mobile-system-grid', screen === 'audit' && visit ? 'cols-4' : 'cols-3'),
      children: [items.map(item => /*#__PURE__*/_jsxDEV("button", {
        type: "button",
        className: cx('mobile-system-button', item.active && 'active'),
        onClick: item.action,
        children: [/*#__PURE__*/_jsxDEV(Icon, {
          name: item.icon,
          className: "h-5 w-5"
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          children: item.label
        }, void 0, false)]
      }, item.key, true)), screen === 'audit' && visit ? /*#__PURE__*/_jsxDEV("button", {
        type: "button",
        className: "mobile-system-button danger",
        onClick: onClearData,
        children: [/*#__PURE__*/_jsxDEV(Icon, {
          name: "eraser",
          className: "h-5 w-5"
        }, void 0, false), /*#__PURE__*/_jsxDEV("span", {
          children: "Clear"
        }, void 0, false)]
      }, void 0, true) : null]
    }, void 0, true)
  }, void 0, false);
}
function VisitWorkspace({
  visit,
  update,
  activeSection,
  goSection,
  onPreview
}) {
  useEffect(() => {
    function handleKey(event) {
      if (isEditableTarget(event.target)) return;
      if (event.key === 'ArrowRight') goSection(activeSection + 1);
      if (event.key === 'ArrowLeft') goSection(activeSection - 1);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [activeSection]);
  if (!visit) return /*#__PURE__*/_jsxDEV("main", {
    className: "workspace-page w-full px-4 py-8 pb-44 md:px-8 md:pb-8",
    children: /*#__PURE__*/_jsxDEV(EmptyState, {
      icon: "clipboard",
      title: "Belum ada visit aktif"
    }, void 0, false)
  }, void 0, false);
  const screens = [/*#__PURE__*/_jsxDEV(VisitSetupSection, {
    visit: visit,
    update: update
  }, void 0, false), /*#__PURE__*/_jsxDEV(GeneralInfoSection, {
    visit: visit,
    update: update
  }, void 0, false), /*#__PURE__*/_jsxDEV(QscResultSection, {
    visit: visit,
    update: update
  }, void 0, false), /*#__PURE__*/_jsxDEV(ObservationSection, {
    visit: visit,
    update: update
  }, void 0, false), /*#__PURE__*/_jsxDEV(EvidenceSection, {
    visit: visit,
    update: update
  }, void 0, false)];
  return /*#__PURE__*/_jsxDEV("main", {
    className: "workspace-page w-full px-4 py-5 pb-44 md:px-8 md:py-8 md:pb-8",
    children: [/*#__PURE__*/_jsxDEV("div", {
      className: "desktop-section-card mb-5 hidden rounded-[28px] bg-white p-4 ring-1 ring-slate-200 md:block",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: "flex items-center justify-between gap-3",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "min-w-0",
          children: [/*#__PURE__*/_jsxDEV("p", {
            className: "truncate text-sm font-extrabold text-slate-950",
            children: visit.store || 'Store belum dipilih'
          }, void 0, false), /*#__PURE__*/_jsxDEV("p", {
            className: "truncate text-xs text-slate-500",
            children: [visit.nama || 'Bestie belum dipilih', " • ", formatDate(visit.tanggal)]
          }, void 0, true)]
        }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
          className: "hidden gap-2 sm:flex",
          children: [/*#__PURE__*/_jsxDEV(Button, {
            variant: "icon",
            onClick: () => goSection(activeSection - 1),
            disabled: activeSection <= 0,
            "aria-label": "Section sebelumnya",
            children: /*#__PURE__*/_jsxDEV(Icon, {
              name: "left",
              className: "h-5 w-5"
            }, void 0, false)
          }, void 0, false), /*#__PURE__*/_jsxDEV(Button, {
            variant: "icon",
            onClick: () => goSection(activeSection + 1),
            disabled: activeSection >= SECTION_DEFS.length - 1,
            "aria-label": "Section berikutnya",
            children: /*#__PURE__*/_jsxDEV(Icon, {
              name: "right",
              className: "h-5 w-5"
            }, void 0, false)
          }, void 0, false)]
        }, void 0, true)]
      }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
        className: "mt-3 flex gap-2 overflow-x-auto pb-1",
        "aria-label": "Sub menu section",
        children: SECTION_DEFS.map((section, index) => /*#__PURE__*/_jsxDEV("button", {
          type: "button",
          className: cx('subnav-chip', activeSection === index && 'active'),
          onClick: () => goSection(index),
          children: [/*#__PURE__*/_jsxDEV(Icon, {
            name: section.icon,
            className: "h-4 w-4"
          }, void 0, false), " ", section.label]
        }, section.id, true))
      }, void 0, false)]
    }, void 0, true), /*#__PURE__*/_jsxDEV("div", {
      children: screens[activeSection]
    }, SECTION_DEFS[activeSection]?.id || activeSection, false), /*#__PURE__*/_jsxDEV("div", {
      className: "md:hidden",
      "aria-hidden": "true",
      style: {
        height: '96px',
        flexShrink: 0
      }
    }, void 0, false)]
  }, void 0, true);
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
    } catch (error) {
      return true;
    }
  });
  const secretTapRef = useRef({
    count: 0,
    timer: null
  });
  useEffect(() => {
    let cancelled = false;
    let unsubscribe = null;
    let pollId = null;
    function applyConfigRows(rows) {
      const applied = applyRemoteAppConfigRows(rows);
      if (applied.some(row => row.key === APP_CONFIG_KEYS.welcome)) setWelcomeConfig(readWelcomeConfig());
    }
    async function refreshRemoteConfigs() {
      const rows = await fetchAppConfigsFromConvex();
      if (!cancelled && rows) applyConfigRows(rows);
    }
    async function startRemoteConfigSync() {
      try {
        await refreshRemoteConfigs();
        if (!cloudflareEnabled() && !netlifyEnabled() && !supabaseEnabled()) {
          unsubscribe = await subscribeConvexQuery(getConvexConfig().appConfigListQuery || 'appSettings:listConfigs', {
            keys: [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice]
          }, rows => {
            if (!cancelled) applyConfigRows(rows);
          }, error => {
            console.warn('Realtime app config gagal:', error);
          });
        }
      } catch (error) {
        console.warn('Sync app config gagal:', error);
      }
      if (!cancelled && !unsubscribe) {
        pollId = window.setInterval(refreshRemoteConfigs, getRemotePollMs());
      }
    }
    startRemoteConfigSync();
    const syncWelcome = event => setWelcomeConfig(event?.detail ? normalizeWelcomeConfigPayload(event.detail) : readWelcomeConfig());
    window.addEventListener('rbv-welcome-config-change', syncWelcome);
    window.addEventListener('storage', syncWelcome);
    return () => {
      cancelled = true;
      if (pollId) window.clearInterval(pollId);
      try {
        unsubscribe?.();
      } catch (error) {}
      window.removeEventListener('rbv-welcome-config-change', syncWelcome);
      window.removeEventListener('storage', syncWelcome);
    };
  }, []);
  function closeWelcome() {
    try {
      sessionStorage.setItem(WELCOME_SEEN_KEY, '1');
    } catch (error) {}
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
      } catch (error) {}
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
      if (cancelled || !version) return;
      const now = Date.now();
      const lastReload = Number(sessionStorage.getItem(APP_RELOAD_LOCK_KEY) || 0);
      if (now - lastReload < 12000) return;
      try {
        sessionStorage.setItem(APP_RELOAD_LOCK_KEY, String(now));
        localStorage.setItem(APP_VERSION_KEY, version);
      } catch (error) {}
      const url = new URL(window.location.href);
      url.searchParams.set('v', version);
      url.searchParams.set('sync', String(now));
      window.location.replace(url.toString());
    }
    async function clearAppCaches() {
      if (!('caches' in window)) return;
      try {
        const keys = await caches.keys();
        await Promise.all(keys.filter(key => key.startsWith('bestie-visit-')).map(key => caches.delete(key)));
      } catch (error) {}
    }
    async function checkLatestVersion() {
      try {
        const response = await fetch(`${VERSION_ENDPOINT}?t=${Date.now()}`, {
          cache: 'no-store'
        });
        if (!response.ok) return;
        const info = await response.json();
        const latest = String(info.version || info.build || '').trim();
        if (!latest) return;
        const saved = localStorage.getItem(APP_VERSION_KEY);
        if (!saved) localStorage.setItem(APP_VERSION_KEY, APP_BUILD_VERSION);
        if (latest !== APP_BUILD_VERSION) {
          await clearAppCaches();
          reloadWithVersion(latest);
          return;
        }
        localStorage.setItem(APP_VERSION_KEY, latest);
      } catch (error) {}
    }
    async function registerServiceWorker() {
      if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
      try {
        const registration = await navigator.serviceWorker.register(`service-worker.js?v=${APP_BUILD_VERSION}`);
        registration.update().catch(() => {});
        if (registration.waiting) registration.waiting.postMessage({
          type: 'SKIP_WAITING'
        });
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) reloadWithVersion(APP_BUILD_VERSION);
          });
        });
      } catch (error) {}
    }
    registerServiceWorker();
    checkLatestVersion();
    versionTimer = window.setInterval(checkLatestVersion, 180000);
    return () => {
      cancelled = true;
      if (versionTimer) window.clearInterval(versionTimer);
    };
  }, []);
  useEffect(() => {
    const touchState = {
      target: null,
      x: 0,
      y: 0,
      moved: false,
      startedAt: 0
    };
    const textTargetSelector = 'input:not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]), textarea, [contenteditable="true"]';
    const findTextTarget = target => target?.closest?.(textTargetSelector) || null;
    const movementLimit = () => window.matchMedia?.('(pointer: coarse)')?.matches ? 16 : 11;
    function canFocusOnTap(target) {
      if (!target || target.disabled || target.readOnly) return false;
      const tag = (target.tagName || '').toLowerCase();
      if (tag === 'select') return false;
      const type = String(target.getAttribute?.('type') || '').toLowerCase();
      return target.isContentEditable || tag === 'textarea' || !type || ['text', 'search', 'email', 'tel', 'url', 'number', 'password', 'date', 'time', 'month'].includes(type);
    }
    function focusTapTarget(target) {
      if (!canFocusOnTap(target) || document.activeElement === target) return;
      window.setTimeout(() => {
        try {
          target.focus({
            preventScroll: true
          });
        } catch (error) {
          try {
            target.focus();
          } catch (innerError) {}
        }
      }, 0);
    }
    function handleTouchStart(event) {
      const target = findTextTarget(event.target);
      if (!target || !event.touches?.[0]) return;
      touchState.target = target;
      touchState.x = event.touches[0].clientX;
      touchState.y = event.touches[0].clientY;
      touchState.moved = false;
      touchState.startedAt = Date.now();
    }
    function handleTouchMove(event) {
      if (!touchState.target || !event.touches?.[0]) return;
      const dx = Math.abs(event.touches[0].clientX - touchState.x);
      const dy = Math.abs(event.touches[0].clientY - touchState.y);
      const limit = movementLimit();
      if (dy > limit || dx > limit + 6) touchState.moved = true;
    }
    function handleTouchEnd(event) {
      const target = touchState.target;
      const wasScroll = Boolean(target && touchState.moved);
      if (wasScroll) {
        if (event.cancelable) event.preventDefault();
        event.stopPropagation();
        if (document.activeElement === target) target.blur?.();
      } else if (target) {
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
    document.addEventListener('touchstart', handleTouchStart, {
      capture: true,
      passive: true
    });
    document.addEventListener('touchmove', handleTouchMove, {
      capture: true,
      passive: true
    });
    document.addEventListener('touchend', handleTouchEnd, {
      capture: true,
      passive: false
    });
    document.addEventListener('touchcancel', handleTouchCancel, {
      capture: true,
      passive: true
    });
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
      if (cancelled) return;
      const payload = presencePayloadFromState(visit, screen);
      await upsertPresence(payload);
    }
    pulse();
    const interval = window.setInterval(pulse, 15000);
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') pulse();
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
    if (!visit?.id) return;
    const timer = setTimeout(async () => {
      const nextVisit = {
        ...visit,
        updatedAt: Date.now()
      };
      try {
        await putVisitRecord(nextVisit);
        localStorage.setItem(ACTIVE_VISIT_KEY, nextVisit.id);
        const nextMeta = saveHistoryMeta([historyMetaFromVisit(nextVisit), ...readHistoryMeta().filter(item => item.id !== nextVisit.id)]);
        setHistory(nextMeta);
        updateStorageLabel();
        upsertMonitorVisit(nextVisit);
      } catch (error) {
        console.warn('Autosave gagal:', error);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [visit]);
  function updateVisit(patch) {
    setVisit(current => current ? {
      ...current,
      ...patch,
      updatedAt: Date.now()
    } : current);
  }
  function goSection(index) {
    setActiveSection(Math.max(0, Math.min(SECTION_DEFS.length - 1, index)));
  }
  function handleTitleTap() {
    const ref = secretTapRef.current;
    ref.count += 1;
    if (ref.timer) clearTimeout(ref.timer);
    ref.timer = setTimeout(() => {
      ref.count = 0;
    }, 2500);
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
    } catch (error) {
      alert('Gagal membuka history visit.');
    }
  }
  async function deleteVisit(id) {
    const ok = confirm('Hapus history kunjungan ini?');
    if (!ok) return;
    await deleteVisitRecord(id);
    const nextMeta = saveHistoryMeta(readHistoryMeta().filter(item => item.id !== id));
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
    if (!ok) return;
    await clearVisitRecords();
    saveHistoryMeta([]);
    localStorage.removeItem(ACTIVE_VISIT_KEY);
    setHistory([]);
    setVisit(null);
    setScreen('dashboard');
    updateStorageLabel();
  }
  function clearCurrentData() {
    if (!visit) return;
    const ok = confirm('Clear data pada kunjungan aktif? Nama bestie dan store tetap dipertahankan.');
    if (!ok) return;
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
    content = /*#__PURE__*/_jsxDEV(DashboardPage, {
      history: history,
      storageLabel: storageLabel,
      onNewVisit: () => setNewVisitOpen(true),
      onOpenVisit: openVisit,
      onDeleteVisit: deleteVisit,
      onClearHistory: clearAllHistory,
      onTitleTap: handleTitleTap
    }, void 0, false);
  } else if (screen === 'preview') {
    content = /*#__PURE__*/_jsxDEV(PreviewPage, {
      visit: visit,
      onBack: () => setScreen('audit')
    }, void 0, false);
  } else {
    content = /*#__PURE__*/_jsxDEV(VisitWorkspace, {
      visit: visit,
      update: updateVisit,
      activeSection: activeSection,
      goSection: goSection,
      onPreview: () => setScreen('preview')
    }, void 0, false);
  }
  return /*#__PURE__*/_jsxDEV("div", {
    className: cx("audit-shell min-h-screen", screen !== 'dashboard' && "md:grid md:grid-cols-[300px_minmax(0,1fr)]"),
    children: [screen !== 'dashboard' ? /*#__PURE__*/_jsxDEV(DesktopSidebar, {
      screen: screen,
      setScreen: setScreen,
      visit: visit,
      activeSection: activeSection,
      goSection: goSection,
      onNewVisit: () => setNewVisitOpen(true),
      onClearData: clearCurrentData,
      onTitleTap: handleTitleTap
    }, void 0, false) : null, /*#__PURE__*/_jsxDEV("div", {
      className: "flex min-h-screen min-w-0 flex-col",
      children: [/*#__PURE__*/_jsxDEV(MobileTopBar, {
        screen: screen,
        setScreen: setScreen,
        visit: visit,
        activeSection: activeSection,
        goSection: goSection,
        onNewVisit: () => setNewVisitOpen(true),
        onTitleTap: handleTitleTap
      }, void 0, false), /*#__PURE__*/_jsxDEV("div", {
        className: "min-w-0 flex-1",
        children: content
      }, void 0, false), screen !== 'dashboard' ? /*#__PURE__*/_jsxDEV(MobileBottomNav, {
        screen: screen,
        setScreen: setScreen,
        visit: visit,
        onNewVisit: () => setNewVisitOpen(true),
        onClearData: clearCurrentData
      }, void 0, false) : null]
    }, void 0, true), welcomeOpen ? /*#__PURE__*/_jsxDEV(WelcomeOverlay, {
      config: welcomeConfig,
      onDone: closeWelcome
    }, void 0, false) : null, /*#__PURE__*/_jsxDEV(NewVisitModal, {
      open: newVisitOpen,
      onClose: () => setNewVisitOpen(false),
      onCreate: createNewVisit
    }, void 0, false), /*#__PURE__*/_jsxDEV(SecretPinModal, {
      open: pinOpen,
      onClose: () => setPinOpen(false),
      onUnlock: () => {
        setPinOpen(false);
        setSecretOpen(true);
      }
    }, void 0, false), /*#__PURE__*/_jsxDEV(SecretMonitorPanel, {
      open: secretOpen,
      onClose: () => setSecretOpen(false),
      history: history,
      welcomeConfig: welcomeConfig,
      onWelcomeConfigChange: applyWelcomeConfig
    }, void 0, false)]
  }, void 0, true);
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/_jsxDEV(App, {}, void 0, false));
