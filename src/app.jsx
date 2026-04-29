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
  return request;
}

function approveManualStoreRequest(id) {
  const now = Date.now();
  const requests = readManualStoreRequests();
  let approved = null;
  const nextRequests = requests.map((item) => {
    if (item.id !== id) return item;
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
  }
  return approved;
}

function rejectManualStoreRequest(id) {
  const now = Date.now();
  saveManualStoreRequests(readManualStoreRequests().map((item) => item.id === id ? { ...item, status: 'rejected', updatedAt: now } : item));
}

function findApprovedManualStore(storeName) {
  const key = normalize(storeName);
  if (!key) return null;
  return readApprovedManualStores().find((item) => normalize(item.storeName || item.siteDescr) === key || normalize(item.siteCode || item.siteCode4) === key) || null;
}

const BESTIE_NAMES = uniqueBy(
  BESTIE_ASSIGNMENTS.map((item) => cleanText(item.bestieName)).filter(Boolean).sort((a, b) => a.localeCompare(b)),
  (item) => item
);

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
  if (!storeKey) return null;
  return BESTIE_ASSIGNMENTS.find((item) => {
    const sameStore = normalize(item.storeName) === storeKey || normalize(item.assignmentStoreName) === storeKey;
    const sameBestie = !bestieKey || normalize(item.bestieName) === bestieKey;
    return sameStore && sameBestie;
  }) || BESTIE_ASSIGNMENTS.find((item) => normalize(item.storeName) === storeKey || normalize(item.assignmentStoreName) === storeKey) || null;
}

function findMasterStore(storeName) {
  const key = normalize(storeName);
  if (!key) return null;
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
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
    findingEvidencePhotos: [blankPhoto(), blankPhoto(), blankPhoto(), blankPhoto()],
    correctiveActionPhotos: [blankPhoto(), blankPhoto(), blankPhoto(), blankPhoto()],
    storeAssignmentLink: 'https://tinyurl.com/store-caassignment',
    showQSCResult: false,
    showOPITable: false,
    showQSCTable: false,
    showFindingEvidence: false,
    showCorrectiveAction: false
  };
}

function isMeaningfulObservation(row) {
  return ['temuan', 'kondisiIdeal', 'dampak', 'penyebab', 'tindakan', 'deadline', 'hasil'].some((key) => cleanText(row?.[key]));
}

function visitProgress(visit) {
  if (!visit) return 0;
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
  } catch (error) {
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
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB tidak tersedia di browser ini.'));
      return;
    }
    const request = indexedDB.open(REPORT_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(REPORT_DB_STORE)) db.createObjectStore(REPORT_DB_STORE, { keyPath: 'id' });
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
    home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></>,
    clipboard: <><path d="M9 3h6l1 2h3v16H5V5h3l1-2Z"/><path d="M9 8h6"/><path d="M8 13h8"/><path d="M8 17h5"/></>,
    camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4V8Z"/><circle cx="12" cy="13.5" r="3.5"/></>,
    gallery: <><rect x="4" y="5" width="16" height="14" rx="2"/><path d="m7 16 3.5-3.5 2.5 2.5 2-2 2 3"/><circle cx="9" cy="9" r="1.2"/></>,
    marker: <><circle cx="12" cy="12" r="7"/><path d="M12 8v8"/><path d="M8 12h8"/></>,
    crop: <><path d="M6 3v12h12"/><path d="M3 6h12v12"/><path d="M18 15v6"/><path d="M15 18h6"/></>,
    trash: <><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M7 7l1 14h8l1-14"/><path d="M10 11v6"/><path d="M14 11v6"/></>,
    pdf: <><path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h5"/><path d="M8 15h8"/><path d="M8 18h5"/></>,
    excel: <><path d="M4 5h16v14H4V5Z"/><path d="M8 5v14"/><path d="M4 10h16"/><path d="M4 14h16"/><path d="m11 12 4 4"/><path d="m15 12-4 4"/></>,
    plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    left: <path d="m15 18-6-6 6-6"/>,
    right: <path d="m9 18 6-6-6-6"/>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c1.8-4 4.5-6 8-6s6.2 2 8 6"/></>,
    store: <><path d="M4 9h16l-1.5-5h-13L4 9Z"/><path d="M5 9v12h14V9"/><path d="M9 21v-6h6v6"/><path d="M4 9c.8 2 3.2 2 4 0 .8 2 3.2 2 4 0 .8 2 3.2 2 4 0 .8 2 3.2 2 4 0"/></>,
    calendar: <><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M4 10h16"/></>,
    spark: <><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></>,
    image: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 16 5-5 4 4 2-2 5 5"/></>,
    shield: <><path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"/><path d="m9 12 2 2 4-5"/></>,
    download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></>,
    eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="3"/></>,
    eraser: <><path d="m3 17 9-9 6 6-6 6H7l-4-3Z"/><path d="m14 6 4-4 4 4-4 4"/><path d="M12 20h9"/></>,
    close: <><path d="M6 6l12 12"/><path d="M18 6 6 18"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    menu: <><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>,
    check: <path d="m5 13 4 4L19 7"/>
  };
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.spark}
    </svg>
  );
}

function Button({ variant = 'primary', className = '', icon, children, ...props }) {
  const styles = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    icon: 'btn-icon'
  };
  return (
    <button className={cx(styles[variant] || styles.primary, className)} {...props}>
      {icon ? <Icon name={icon} className="h-5 w-5" /> : null}
      {children}
    </button>
  );
}

function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'bg-slate-100 text-slate-700 ring-slate-200',
    success: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    warning: 'bg-orange-50 text-orange-800 ring-orange-200',
    dark: 'bg-slate-900 text-white ring-slate-900'
  };
  return <span className={cx('inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1', tones[tone])}>{children}</span>;
}

function Field({ label, helper, children, required }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1 text-sm font-bold text-slate-800">
        {label}{required ? <span className="text-rose-600">*</span> : null}
      </span>
      {children}
      {helper ? <span className="mt-2 block text-xs leading-5 text-slate-500">{helper}</span> : null}
    </label>
  );
}

function TextInput(props) {
  return <input className={cx('form-control', props.className)} {...props} />;
}

function DateInput({ className = '', ...props }) {
  return <input type="date" className={cx('form-control date-control', className)} {...props} />;
}

function TextArea({ value, onChange, className = '', minRows = 3, ...props }) {
  const ref = useRef(null);

  function resize() {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.max(46, el.scrollHeight) + 'px';
  }

  useEffect(() => { resize(); }, [value]);

  return (
    <textarea
      ref={ref}
      className={cx('form-control auto-grow-textarea', className)}
      value={value || ''}
      rows={minRows}
      onChange={(event) => { onChange?.(event); window.requestAnimationFrame(resize); }}
      onInput={resize}
      {...props}
    />
  );
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
    if (!editor || document.activeElement === editor) return;
    const nextHtml = richValue(value);
    if (editor.innerHTML !== nextHtml) editor.innerHTML = nextHtml;
  }, [value]);

  function readToolState() {
    const next = {};
    ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'].forEach((name) => {
      try { next[name] = document.queryCommandState(name); } catch (error) { next[name] = false; }
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
    setActiveTools((current) => ({ ...current, [commandName]: true }));
  }

  function command(name, argument = null) {
    const editor = editorRef.current;
    if (!editor) return;
    const listCommand = name === 'insertUnorderedList' || name === 'insertOrderedList';
    editor.focus({ preventScroll: true });
    if (listCommand && isEmpty(editor.innerHTML)) {
      seedList(name);
      return;
    }
    try { document.execCommand(name, false, argument); } catch (error) {}
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

  const tools = [
    { command: 'bold', label: 'B', title: 'Bold', className: 'rich-tool-bold' },
    { command: 'italic', label: 'I', title: 'Italic', className: 'rich-tool-italic' },
    { command: 'underline', label: 'U', title: 'Underline', className: 'rich-tool-underline' },
    { command: 'insertUnorderedList', label: '•', title: 'Bullet', className: 'rich-tool-bullet' },
    { command: 'insertOrderedList', label: '1.', title: 'Number', className: 'rich-tool-number' }
  ];

  return (
    <div className={cx('rich-editor rounded-2xl border border-slate-200 bg-white', className)}>
      <div
        ref={editorRef}
        className="rich-editor-input px-3 py-3 text-sm leading-6 text-slate-900 outline-none"
        style={{ minHeight }}
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning
      />
      <div className="rich-toolbar flex flex-wrap gap-1 border-t border-slate-200 p-2" aria-label="Rich text toolbar">
        {tools.map((tool) => (
          <button
            key={tool.command}
            type="button"
            data-command={tool.command}
            className={cx('rich-tool-button', tool.className, activeTools[tool.command] && 'active')}
            onPointerDown={(event) => { event.preventDefault(); command(tool.command); }}
            aria-label={tool.title}
            title={tool.title}
          >
            {tool.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectInput({ children, className = '', ...props }) {
  return <select className={cx('form-control appearance-none', className)} {...props}>{children}</select>;
}

function SelectField({ label, value, options, onChange, placeholder = 'Pilih', required, icon }) {
  const normalizedOptions = (options || []).map((item) => typeof item === 'string' ? { label: item, value: item } : item);
  return (
    <Field label={label} required={required}>
      <div className="select-field-wrap relative">
        {icon ? <span className="select-field-icon pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-slate-400"><Icon name={icon} className="h-5 w-5" /></span> : null}
        <SelectInput value={value || ''} onChange={(event) => onChange(event.target.value)} className={cx('select-control', icon ? 'has-leading-icon' : '')} required={required}>
          <option value="">{placeholder}</option>
          {normalizedOptions.map((item) => <option key={(item.value || '') + '-' + item.label} value={item.value || item.label}>{item.label}</option>)}
        </SelectInput>
      </div>
    </Field>
  );
}

function Toggle({ checked, onChange, label, className = '' }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx('slide-toggle', checked && 'active', className)}
    >
      {label ? <span className="slide-toggle-label">{label}</span> : null}
      <span className="slide-toggle-track" aria-hidden="true"><span /></span>
    </button>
  );
}

function EmptyState({ icon = 'spark', title, children, action }) {
  return (
    <div className="surface-card flex flex-col items-center justify-center rounded-[28px] px-6 py-10 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-audit-primary">
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-extrabold text-slate-950">{title}</h3>
      {children ? <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{children}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

function InactiveSection({ title }) {
  return (
    <div className="inactive-section surface-card rounded-[28px] p-6 text-center md:p-8">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        <Icon name="eye" className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-extrabold text-slate-950">{title}</h3>
    </div>
  );
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

  return (
    <Field label={label} required={required} helper={helper}>
      <div ref={wrapRef} className="combo-wrap relative">
        <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400">
          <Icon name={icon} className="h-5 w-5" />
        </div>
        <TextInput value={value || ''} onChange={(event) => { onChange(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder={placeholder} className="pl-12 pr-12" aria-autocomplete="list" aria-expanded={open} required={required} />
        <button type="button" className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100" onClick={() => setOpen((state) => !state)} aria-label="Buka pilihan">
          <Icon name="right" className={cx('h-4 w-4 transition', open ? 'rotate-90' : '')} />
        </button>
        {open ? (
          <div className="combo-panel absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-soft">
            {visible.length ? visible.map((item) => (
              <button type="button" key={(item.value || '') + '-' + item.label} className="combo-option flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50 active:bg-emerald-50" onClick={() => choose(item)}>
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-50 text-audit-primary"><Icon name={icon === 'store' ? 'store' : 'user'} className="h-4 w-4" /></span>
                <span><span className="block text-sm font-bold text-slate-900">{item.label}</span>{item.meta ? <span className="mt-0.5 block text-xs text-slate-500">{item.meta}</span> : null}</span>
              </button>
            )) : <div className="px-4 py-5 text-sm text-slate-500">Tidak ada hasil. Nilai yang diketik tetap bisa digunakan sebagai data manual.</div>}
          </div>
        ) : null}
      </div>
    </Field>
  );
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
  return (
    <div className="store-detail-card surface-card rounded-[24px] p-4 md:rounded-[28px] md:p-6">
      <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-audit-primary">Detail Store</p>
          <h3 className="mt-1 break-words text-lg font-extrabold leading-tight text-slate-950 md:text-xl">{detail.siteDescr || detail.storeName || 'Store belum dipilih'}</h3>
        </div>
        <div className="hidden h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-white md:grid">
          <Icon name="store" className="h-6 w-6" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(([label, value]) => (
          <div key={label} className={cx('store-detail-item rounded-2xl border border-slate-200 bg-slate-50 p-3', label === 'Alamat' ? 'sm:col-span-2 xl:col-span-2' : '')}>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 min-w-0 break-words text-sm font-semibold leading-5 text-slate-800">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
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

function getEditorCanvasSize(imageElement) {
  const width = Math.max(1, imageElement?.naturalWidth || imageElement?.width || 1080);
  const height = Math.max(1, imageElement?.naturalHeight || imageElement?.height || 1080);
  const maxSide = 1400;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return {
    width: Math.max(360, Math.round(width * scale)),
    height: Math.max(360, Math.round(height * scale))
  };
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
  const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 });

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    const previousPosition = document.body.style.position;
    const previousWidth = document.body.style.width;
    const previousTop = document.body.style.top;
    const lockedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${lockedScrollY}px`;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      document.body.style.position = previousPosition;
      document.body.style.width = previousWidth;
      document.body.style.top = previousTop;
      window.requestAnimationFrame(() => window.scrollTo(0, lockedScrollY));
    };
  }, [open]);

  useEffect(() => {
    if (!open || !image) return;
    let cancelled = false;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setMarkers([]);
    setMode('move');
    loadImageElement(image).then((loaded) => {
      if (cancelled) return;
      imgRef.current = loaded;
      setCanvasSize(getEditorCanvasSize(loaded));
      window.requestAnimationFrame(() => drawEditorCanvas());
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [open, image]);

  function scheduleDraw() { if (rafRef.current) window.cancelAnimationFrame(rafRef.current); rafRef.current = window.requestAnimationFrame(() => drawEditorCanvas()); }
  useEffect(() => { if (!open) return; scheduleDraw(); }, [zoom, offset, markers, mode, open, canvasSize]);

  function drawEditorCanvas(targetCanvas) {
    const canvas = targetCanvas || canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cw, ch);
    const baseScale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const scale = baseScale * zoom;
    const iw = img.naturalWidth * scale;
    const ih = img.naturalHeight * scale;
    const x = (cw - iw) / 2 + offset.x;
    const y = (ch - ih) / 2 + offset.y;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, x, y, iw, ih);
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#ef4444';
    ctx.shadowColor = 'rgba(0,0,0,0.22)';
    ctx.shadowBlur = 5;
    markers.forEach((marker) => { ctx.beginPath(); ctx.arc(marker.x, marker.y, marker.r || 54, 0, Math.PI * 2); ctx.stroke(); });
    ctx.shadowBlur = 0;
    ctx.strokeStyle = mode === 'marker' ? 'rgba(239,68,68,0.95)' : 'rgba(15,118,110,0.85)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.strokeRect(8, 8, cw - 16, ch - 16);
    ctx.setLineDash([]);
  }

  function canvasPointFromClient(clientX, clientY) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return { x: (clientX - rect.left) * (canvas.width / rect.width), y: (clientY - rect.top) * (canvas.height / rect.height) };
  }
  function canvasPoint(event) { return canvasPointFromClient(event.clientX, event.clientY); }
  function touchCenter(touches) { const first = touches[0]; const second = touches[1]; return canvasPointFromClient((first.clientX + second.clientX) / 2, (first.clientY + second.clientY) / 2); }

  function handlePointerDown(event) {
    event.preventDefault();
    if (!canvasRef.current) return;
    if (mode === 'marker') { const point = canvasPoint(event); setMarkers((current) => [...current, { x: point.x, y: point.y, r: 54 }]); return; }
    const point = canvasPoint(event);
    dragRef.current = { x: point.x, y: point.y, offsetX: offset.x, offsetY: offset.y };
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch (error) {}
  }
  function handlePointerMove(event) { if (!dragRef.current || mode !== 'move') return; event.preventDefault(); const point = canvasPoint(event); setOffset({ x: dragRef.current.offsetX + (point.x - dragRef.current.x), y: dragRef.current.offsetY + (point.y - dragRef.current.y) }); }
  function handlePointerUp() { dragRef.current = null; }
  function handleTouchStart(event) { if (event.touches.length === 2) { event.preventDefault(); pinchRef.current = { distance: distanceBetweenTouches(event.touches), zoom, offset, center: touchCenter(event.touches) }; } }
  function handleTouchMove(event) { if (event.touches.length === 2 && pinchRef.current) { event.preventDefault(); const distance = distanceBetweenTouches(event.touches); const nextZoom = clamp(pinchRef.current.zoom * (distance / Math.max(1, pinchRef.current.distance)), 1, 4); const center = touchCenter(event.touches); const ratio = nextZoom / Math.max(0.001, pinchRef.current.zoom); setZoom(nextZoom); setOffset({ x: center.x - (pinchRef.current.center.x - pinchRef.current.offset.x) * ratio, y: center.y - (pinchRef.current.center.y - pinchRef.current.offset.y) * ratio }); } }
  function handleWheel(event) { event.preventDefault(); const point = canvasPoint(event); const nextZoom = clamp(zoom * (event.deltaY < 0 ? 1.08 : 0.92), 1, 4); const ratio = nextZoom / Math.max(0.001, zoom); setZoom(nextZoom); setOffset({ x: point.x - (point.x - offset.x) * ratio, y: point.y - (point.y - offset.y) * ratio }); }
  function saveEditedImage() { const canvas = canvasRef.current; if (!canvas) return; drawEditorCanvas(canvas); onSave(canvas.toDataURL('image/jpeg', 0.9)); onClose(); }

  if (!open) return null;
  return (
    <div className="photo-editor-overlay fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-[2px]" role="dialog" aria-modal="true">
      <div className="photo-editor-panel w-full rounded-[24px] bg-white p-3 shadow-2xl md:p-4">
        <div className="photo-editor-header flex shrink-0 items-center justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-audit-primary">Crop & Marker</p><h3 className="truncate text-base font-black text-slate-950">{title}</h3></div><Button variant="icon" onClick={onClose} aria-label="Tutup editor"><Icon name="close" className="h-4 w-4" /></Button></div>
        <div className="photo-editor-canvas-shell mt-3 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-2"><canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} style={{ aspectRatio: `${canvasSize.width} / ${canvasSize.height}` }} className="block max-h-full max-w-full touch-none rounded-xl bg-white" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onWheel={handleWheel} /></div>
        <div className="photo-editor-actions mt-3 flex shrink-0 flex-wrap items-center justify-end gap-2"><Button variant={mode === 'move' ? 'primary' : 'secondary'} icon="crop" onClick={() => setMode('move')} aria-label="Mode geser dan crop" /><Button variant={mode === 'marker' ? 'primary' : 'secondary'} icon="marker" onClick={() => setMode('marker')} aria-label="Mode marker" /><Button variant="secondary" icon="left" onClick={() => setMarkers((current) => current.slice(0, -1))} aria-label="Undo marker" /><Button variant="secondary" icon="eraser" onClick={() => confirmAction('Hapus semua marker pada foto ini?') && setMarkers([])} aria-label="Clear marker" /><Button icon="check" onClick={saveEditedImage}>Simpan</Button></div>
      </div>
    </div>
  );
}

function PhotoInput({ value, onChange, label = 'Foto', compact = false, rich = false, required = false }) {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const [editorOpen, setEditorOpen] = useState(false);

  async function handleFiles(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange({ ...(value || blankPhoto()), image: dataUrl });
      setEditorOpen(true);
    } catch (error) {
      alert('Foto gagal dibaca. Coba pilih ulang foto.');
    } finally {
      event.target.value = '';
    }
  }

  function clearPhoto() {
    if (!confirmAction('Hapus foto ini?')) return;
    onChange({ ...(value || blankPhoto()), image: '' });
  }

  const description = value?.description || '';

  return (
    <div className="surface-card overflow-hidden rounded-[26px]">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="min-w-0"><p className="truncate text-sm font-extrabold text-slate-900">{label}{required ? <span className="ml-1 text-rose-600">*</span> : null}</p></div>
        <div className="flex shrink-0 gap-2">{value?.image ? <Button variant="icon" onClick={() => setEditorOpen(true)} aria-label="Edit crop dan marker"><Icon name="crop" className="h-4 w-4" /></Button> : null}{value?.image ? <Button variant="icon" onClick={clearPhoto} aria-label="Hapus foto"><Icon name="trash" className="h-4 w-4" /></Button> : null}</div>
      </div>
      <div className={cx('photo-frame relative grid place-items-center overflow-hidden', value?.image ? 'has-image' : '', compact ? 'min-h-[150px]' : 'min-h-[210px]')}>
        {value?.image ? <img src={value.image} alt={label} /> : <div className="flex flex-col items-center px-5 text-center text-slate-500"><div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white text-audit-primary shadow-sm"><Icon name="image" className="h-7 w-7" /></div><p className="text-sm font-bold text-slate-700">Upload foto</p></div>}
      </div>
      <div className="photo-actions flex items-center justify-center gap-2 border-t border-slate-200 p-3"><input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFiles} /><input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleFiles} /><Button variant="icon" icon="camera" onClick={() => cameraRef.current?.click()} aria-label="Ambil foto dari kamera" /><Button variant="icon" icon="gallery" onClick={() => galleryRef.current?.click()} aria-label="Pilih foto dari galeri" /></div>
      <div className="border-t border-slate-200 p-3">
        {rich ? <RichTextInput value={description} onChange={(nextDescription) => onChange({ ...(value || blankPhoto()), description: nextDescription })} placeholder="Deskripsi foto..." minHeight={92} /> : <TextArea value={description} onChange={(event) => onChange({ ...(value || blankPhoto()), description: event.target.value })} placeholder="Deskripsi foto..." minRows={2} />}
      </div>
      <PhotoEditorModal open={editorOpen} image={value?.image || ''} title={label} onClose={() => setEditorOpen(false)} onSave={(editedImage) => onChange({ ...(value || blankPhoto()), image: editedImage })} />
    </div>
  );
}

function SectionShell({ title, children, actions, preTitle }) {
  return (
    <section className="slide-enter fade-in">
      <div className="section-heading mb-5 flex flex-col gap-3">
        {preTitle ? <div className="section-pretitle">{preTitle}</div> : null}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">{title}</h2>
          {actions ? <div className="section-actions flex flex-wrap gap-2 md:justify-end">{actions}</div> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function CrewEditor({ visit, update }) {
  const crewList = visit.crewList?.length ? visit.crewList : [{ name: '', level: '' }];
  const updateCrew = (index, patch) => {
    const next = crewList.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item);
    update({ crewList: next });
  };
  const addCrew = () => update({ crewList: [...crewList, { name: '', level: '' }] });
  const removeCrew = (index) => {
    if (!confirmAction('Hapus crew ini?')) return;
    const next = crewList.filter((_, itemIndex) => itemIndex !== index);
    update({ crewList: next.length ? next : [{ name: '', level: '' }] });
  };

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="surface-card rounded-[28px] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-audit-primary"><Icon name="user" /></div>
            <div>
              <h3 className="font-extrabold text-slate-950">Store Leader</h3>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <Field label="Nama"><TextInput value={visit.storeLeader || ''} onChange={(e) => update({ storeLeader: e.target.value })} placeholder="Nama store leader" /></Field>
            <Field label="Level"><SelectInput value={visit.storeLeaderLevel || ''} onChange={(e) => update({ storeLeaderLevel: e.target.value })}>{JOB_LEVELS.map((level) => <option key={level} value={level}>{level || 'Pilih'}</option>)}</SelectInput></Field>
          </div>
        </div>
        <div className="surface-card rounded-[28px] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-50 text-audit-accent"><Icon name="user" /></div>
            <div>
              <h3 className="font-extrabold text-slate-950">Shift Leader</h3>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <Field label="Nama"><TextInput value={visit.shiftLeader || ''} onChange={(e) => update({ shiftLeader: e.target.value })} placeholder="Nama shift leader" /></Field>
            <Field label="Level"><SelectInput value={visit.shiftLeaderLevel || ''} onChange={(e) => update({ shiftLeaderLevel: e.target.value })}>{JOB_LEVELS.map((level) => <option key={level} value={level}>{level || 'Pilih'}</option>)}</SelectInput></Field>
          </div>
        </div>
      </div>

      <div className="surface-card rounded-[28px] p-5 md:p-6">
        <div className="mb-5">
          <h3 className="text-lg font-extrabold text-slate-950">Crew Store</h3>
        </div>
        <div className="grid gap-3">
          {crewList.map((crew, index) => (
            <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[44px_1fr_130px_44px] sm:items-end">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-sm font-black text-slate-600">{index + 1}</div>
              <Field label="Nama Crew"><TextInput value={crew.name || ''} onChange={(e) => updateCrew(index, { name: e.target.value })} placeholder="Nama crew" /></Field>
              <Field label="Level"><SelectInput value={crew.level || ''} onChange={(e) => updateCrew(index, { level: e.target.value })}>{JOB_LEVELS.map((level) => <option key={level} value={level}>{level || 'Pilih'}</option>)}</SelectInput></Field>
              <Button variant="icon" onClick={() => removeCrew(index)} aria-label="Hapus crew"><Icon name="trash" className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" icon="plus" onClick={addCrew}>Tambah Crew</Button>
        </div>
      </div>
    </div>
  );
}

function ObservationCards({ title, rows, onChange }) {
  const safeRows = rows?.length ? rows : [blankObservationRow()];
  const updateRow = (index, patch) => onChange(safeRows.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  const addRow = () => onChange([...safeRows, blankObservationRow()]);
  const removeRow = (index) => {
    if (!confirmAction('Hapus row observation ini?')) return;
    const next = safeRows.filter((_, rowIndex) => rowIndex !== index);
    onChange(next.length ? next : [blankObservationRow()]);
  };
  const richField = (label, key, row, index, placeholder) => (
    <Field label={label}>
      <RichTextInput value={row[key] || ''} onChange={(value) => updateRow(index, { [key]: value })} placeholder={placeholder} />
    </Field>
  );

  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4">
        <h3 className="text-lg font-extrabold text-slate-950">{title}</h3>
      </div>
      {safeRows.map((row, index) => (
        <article key={index} className="surface-card rounded-[28px] p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Badge tone={isMeaningfulObservation(row) ? 'success' : 'default'}>Row {index + 1}</Badge>
            <Button variant="icon" onClick={() => removeRow(index)} aria-label="Hapus row"><Icon name="trash" className="h-4 w-4" /></Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {richField('Temuan', 'temuan', row, index, 'Tuliskan temuan audit...')}
            {richField('Kondisi Ideal', 'kondisiIdeal', row, index, 'Kondisi ideal yang diharapkan...')}
            {richField('Dampak', 'dampak', row, index, 'Dampak terhadap operasional...')}
            {richField('Penyebab', 'penyebab', row, index, 'Penyebab utama...')}
            {richField('Tindakan Aksi', 'tindakan', row, index, 'Aksi perbaikan yang disepakati...')}
            <div className="observation-deadline-grid grid gap-4 sm:grid-cols-[170px_minmax(0,1fr)]">
              <Field label="Deadline"><DateInput value={row.deadline || ''} onChange={(e) => updateRow(index, { deadline: e.target.value })} /></Field>
              {richField('Hasil', 'hasil', row, index, 'Hasil tindakan...')}
            </div>
          </div>
        </article>
      ))}
      <div className="flex justify-end">
        <Button variant="secondary" icon="plus" onClick={addRow}>Tambah Row</Button>
      </div>
    </div>
  );
}

function PhotoGrid({ photos, onChange, prefix }) {
  const safePhotos = photos?.length ? photos : [blankPhoto(), blankPhoto(), blankPhoto(), blankPhoto()];
  const updatePhoto = (index, value) => onChange(safePhotos.map((photo, photoIndex) => photoIndex === index ? value : photo));
  const addFour = () => onChange([...safePhotos, blankPhoto(), blankPhoto(), blankPhoto(), blankPhoto()]);
  const removeEmpty = () => {
    if (!confirmAction('Rapikan dan hapus slot foto kosong?')) return;
    const meaningful = safePhotos.filter((photo) => photo.image || cleanText(photo.description));
    onChange(meaningful.length ? meaningful : [blankPhoto(), blankPhoto(), blankPhoto(), blankPhoto()]);
  };
  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-4">
        <p className="text-sm font-bold text-slate-900">{safePhotos.length} slot foto</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {safePhotos.map((photo, index) => (
          <PhotoInput key={index} label={`${prefix} ${index + 1}`} value={photo} onChange={(value) => updatePhoto(index, value)} compact rich />
        ))}
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" icon="eraser" onClick={removeEmpty}>Rapikan Slot Kosong</Button>
        <Button variant="secondary" icon="plus" onClick={addFour}>Tambah 4 Slot</Button>
      </div>
    </div>
  );
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
  return (
    <div className="progress-mini" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={safeValue}>
      <span style={{ width: safeValue + '%' }} />
    </div>
  );
}

function VisitSetupSection({ visit, update }) {
  const storeOptions = useMemo(() => getStoresForBestie(visit.nama).map((item) => ({ label: item.label, value: item.value || item.label })), [visit.nama]);
  const detail = useMemo(() => getStoreWebDetail(visit.store), [visit.store]);
  const progress = visitProgress(visit);
  function handleBestieChange(value) {
    const stores = getStoresForBestie(value);
    update({ nama: value, store: stores[0]?.label || '' });
  }
  function handleStoreChange(value) {
    update({ store: value });
  }
  return (
    <SectionShell title="Mulai visit">
      <div className="visit-setup-grid grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:gap-5">
        <div className="visit-setup-card surface-card min-w-0 rounded-[24px] p-4 md:rounded-[28px] md:p-6">
          <div className="grid gap-4 md:gap-5">
            <SelectField label="Nama Bestie" required value={visit.nama || ''} options={BESTIE_NAMES} onChange={handleBestieChange} placeholder="Pilih nama bestie" icon="user" />
            <SelectField label="Store" required value={visit.store || ''} options={storeOptions} onChange={handleStoreChange} placeholder="Pilih store" icon="store" />
            <div className="visit-progress-card rounded-2xl bg-emerald-50 p-4 text-emerald-900 ring-1 ring-emerald-100">
              <div className="mb-2 flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-wide">Progress</p><p className="text-sm font-black">{progress}%</p></div>
              <ProgressBar value={progress} />
            </div>
          </div>
        </div>
        <StoreDetailCard detail={detail} />
      </div>
    </SectionShell>
  );
}

function GeneralInfoSection({ visit, update }) {
  return (
    <SectionShell title="General Information">
      <div className="grid gap-5">
        <div className="date-card surface-card rounded-[28px] p-5 md:p-6">
          <Field label="Hari, Tanggal" required>
            <DateInput value={visit.tanggal || ''} onChange={(e) => update({ tanggal: e.target.value })} />
          </Field>
        </div>
        <CrewEditor visit={visit} update={update} />
      </div>
    </SectionShell>
  );
}

function QscResultSection({ visit, update }) {
  const enabled = visit.showQSCResult === true;
  const missing = normalizeQscPhotos(visit).filter((photo) => !photo.image).length;
  return (
    <SectionShell title="QSC / FAMITRACK Result" actions={<Toggle checked={enabled} onChange={(value) => update({ showQSCResult: value })} label={enabled ? 'Hide slide' : 'Unhide slide'} />}>
      {!enabled ? <InactiveSection title="Slide QSC/Famitrack disembunyikan" /> : <>{missing ? <div className="mb-4 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-900">Kurang {missing} foto wajib.</div> : null}<div className="grid gap-5 lg:grid-cols-2">{normalizeQscPhotos(visit).map((photo, index) => <PhotoInput key={index} value={photo} onChange={(value) => { const qscResultPhotos = normalizeQscPhotos(visit).map((item, itemIndex) => itemIndex === index ? value : item); update({ qscResultPhotos, qscResultPhoto: qscResultPhotos[0] }); }} label={'Foto QSC / FAMITRACK ' + (index + 1)} required />)}</div></>}
    </SectionShell>
  );
}

function ObservationSection({ visit, update }) {
  const [tab, setTab] = useState('opi');
  const enabled = tab === 'opi' ? visit.showOPITable === true : visit.showQSCTable === true;
  const toggleLabel = tab === 'opi' ? (enabled ? 'Hide OPI' : 'Unhide OPI') : (enabled ? 'Hide QSC' : 'Unhide QSC');
  const setEnabled = (value) => tab === 'opi' ? update({ showOPITable: value }) : update({ showQSCTable: value });
  const preTitle = <div className="section-switcher flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="flex gap-2 overflow-x-auto pb-1"><button type="button" className={cx('subnav-chip prominent', tab === 'opi' && 'active')} onClick={() => setTab('opi')}><Icon name="clipboard" className="h-4 w-4" /> OPI Project</button><button type="button" className={cx('subnav-chip prominent', tab === 'qsc' && 'active')} onClick={() => setTab('qsc')}><Icon name="clipboard" className="h-4 w-4" /> QSC Observation</button></div><Toggle checked={enabled} onChange={setEnabled} label={toggleLabel} /></div>;
  return (
    <SectionShell title="Observation & Root Cause Analysis" preTitle={preTitle}>
      {!enabled ? <InactiveSection title={(tab === 'opi' ? 'OPI Project' : 'QSC Observation') + ' disembunyikan'} /> : tab === 'opi' ? <ObservationCards title="OPI Project Observation" rows={visit.opiData} onChange={(opiData) => update({ opiData })} /> : <ObservationCards title="QSC Observation" rows={visit.qscData} onChange={(qscData) => update({ qscData })} />}
    </SectionShell>
  );
}

function EvidenceSection({ visit, update }) {
  const [tab, setTab] = useState('finding');
  const enabled = tab === 'finding' ? visit.showFindingEvidence === true : visit.showCorrectiveAction === true;
  const setEnabled = (value) => tab === 'finding' ? update({ showFindingEvidence: value }) : update({ showCorrectiveAction: value });
  const toggleLabel = tab === 'finding' ? (enabled ? 'Hide Finding' : 'Unhide Finding') : (enabled ? 'Hide Corrective' : 'Unhide Corrective');
  const preTitle = <div className="section-switcher flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="flex gap-2 overflow-x-auto pb-1"><button type="button" className={cx('subnav-chip prominent', tab === 'finding' && 'active')} onClick={() => setTab('finding')}><Icon name="image" className="h-4 w-4" /> Finding Evidence</button><button type="button" className={cx('subnav-chip prominent', tab === 'corrective' && 'active')} onClick={() => setTab('corrective')}><Icon name="image" className="h-4 w-4" /> Corrective Action</button></div><Toggle checked={enabled} onChange={setEnabled} label={toggleLabel} /></div>;
  return (
    <SectionShell title="Evidence Photos" preTitle={preTitle}>
      {!enabled ? <InactiveSection title={(tab === 'finding' ? 'Finding Evidence' : 'Corrective Action') + ' disembunyikan'} /> : tab === 'finding' ? <PhotoGrid prefix="Finding" photos={visit.findingEvidencePhotos} onChange={(findingEvidencePhotos) => update({ findingEvidencePhotos })} /> : <PhotoGrid prefix="Corrective" photos={visit.correctiveActionPhotos} onChange={(correctiveActionPhotos) => update({ correctiveActionPhotos })} />}
    </SectionShell>
  );
}

function AssignmentSection({ visit, update, onPreview }) {
  return (
    <SectionShell title="Store Assignment">
      <div className="surface-card rounded-[28px] p-5 md:p-6">
        <Field label="Assignment Link">
          <TextInput type="url" value={visit.storeAssignmentLink || ''} onChange={(e) => update({ storeAssignmentLink: e.target.value })} placeholder="https://..." />
        </Field>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button icon="eye" onClick={onPreview}>Preview PDF</Button>
        </div>
      </div>
    </SectionShell>
  );
}

function InstallGuideModal({ open, onClose, deferredPrompt, onPromptUsed }) {
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent || '');
  const isAndroid = /android/i.test(navigator.userAgent || '');
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
  return (
    <div className="fixed inset-0 z-[88] grid place-items-end bg-slate-950/65 p-0 backdrop-blur-sm md:place-items-center md:p-6" role="dialog" aria-modal="true">
      <div className="w-full rounded-t-[30px] bg-white p-5 shadow-2xl md:max-w-lg md:rounded-[30px] md:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-audit-primary"><Icon name="spark" /></span>
            <div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-audit-primary">Install App</p><h2 className="text-xl font-black text-slate-950">Tambahkan ke layar depan</h2></div>
          </div>
          <Button variant="icon" onClick={onClose} aria-label="Tutup"><Icon name="close" className="h-4 w-4" /></Button>
        </div>
        {deferredPrompt && isAndroid ? <Button className="mb-4 w-full" icon="download" onClick={installNow}>Tambahkan Sekarang</Button> : null}
        <div className="grid gap-3 text-sm leading-6 text-slate-700">
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><strong>Android Chrome:</strong> buka menu tiga titik, pilih <strong>Tambahkan ke layar utama</strong>, lalu tekan <strong>Install</strong>.</div>
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200"><strong>iPhone Safari:</strong> tekan tombol <strong>Share</strong>, pilih <strong>Add to Home Screen</strong>, lalu tekan <strong>Add</strong>.</div>
          {!isIos && !isAndroid ? <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">Desktop: gunakan menu browser, lalu pilih install atau create shortcut.</div> : null}
        </div>
      </div>
    </div>
  );
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
  return (
    <main className="dashboard-page mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 pb-28 md:px-8 md:py-8 md:pb-8">
      <section className="dashboard-compact glass-panel overflow-hidden rounded-[26px] p-4 md:rounded-[30px] md:p-7">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={onTitleTap} className="min-w-0 text-left">
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-audit-primary ring-1 ring-emerald-100">Dashboard</span>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 md:text-5xl">Regional Bestie Visit Report</h1>
          </button>
          <button type="button" className="install-info-button" onClick={() => setInstallOpen(true)} aria-label="Info tambah ke layar depan"><Icon name="spark" className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button icon="plus" onClick={onNewVisit}>Buat Kunjungan Baru</Button>
          <Button variant="danger" icon="trash" onClick={onClearHistory}>Hapus Semua History</Button>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="dashboard-stat dark"><p>History</p><strong>{history.length}</strong></div>
          <div className="dashboard-stat"><p>Progress</p><strong>{averageProgress}%</strong></div>
          <div className="dashboard-stat"><p>Storage</p><span>{storageLabel}</span></div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-black tracking-tight text-slate-950 md:text-2xl">History Kunjungan</h2>
        </div>
        {history.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {history.map((item) => (
              <article key={item.id} className="history-card surface-card rounded-[22px] p-4 transition hover:-translate-y-0.5 hover:shadow-soft md:p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-extrabold text-slate-950 md:text-lg">{item.storeName}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">{item.bestieName}</p>
                  </div>
                  <Badge tone={item.progress >= 80 ? 'success' : item.progress >= 40 ? 'warning' : 'default'}>{item.progress || 0}%</Badge>
                </div>
                <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-500"><span>{item.storeCode || '-'}</span><span>•</span><span>{formatDate(item.visitDate)}</span></div>
                <ProgressBar value={item.progress || 0} />
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1" variant="secondary" icon="clipboard" onClick={() => onOpenVisit(item.id)}>Lanjutkan</Button>
                  <Button variant="icon" onClick={() => onDeleteVisit(item.id)} aria-label="Hapus history"><Icon name="trash" className="h-4 w-4" /></Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon="clipboard" title="Belum ada history" action={<Button icon="plus" onClick={onNewVisit}>Buat Kunjungan Baru</Button>} />
        )}
      </section>
      <InstallGuideModal open={installOpen} onClose={() => setInstallOpen(false)} deferredPrompt={deferredPrompt} onPromptUsed={() => setDeferredPrompt(null)} />
    </main>
  );
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

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-end bg-slate-950/60 p-0 backdrop-blur-sm md:place-items-center md:p-6" role="dialog" aria-modal="true">
      <div className="new-visit-modal w-full rounded-t-[30px] bg-white p-5 shadow-2xl md:max-w-2xl md:rounded-[32px] md:p-7">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary">Kunjungan Baru</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Pilih Bestie dan Store</h2>
          </div>
          <Button variant="icon" onClick={onClose} aria-label="Tutup"><Icon name="close" className="h-4 w-4" /></Button>
        </div>
        <div className="grid gap-4">
          <SelectField label="Nama Bestie" value={bestieName} options={BESTIE_NAMES} onChange={setBestieName} placeholder="Pilih nama bestie" icon="user" required />
          <SelectField label="Store" value={storeName} options={storeOptions} onChange={setStoreName} placeholder="Pilih store" icon="store" required />
          <div className="rounded-2xl border border-slate-200 p-3">
            <button type="button" className="flex w-full items-center justify-between gap-3 text-left text-sm font-extrabold text-slate-900" onClick={() => setManualOpen((state) => !state)}>
              <span>Request toko manual</span><Icon name="right" className={cx('h-4 w-4 transition', manualOpen ? 'rotate-90' : '')} />
            </button>
            {manualOpen ? <div className="mt-3 grid gap-3">
              <Field label="Nama Toko"><TextInput value={manualStoreName} onChange={(e) => setManualStoreName(e.target.value)} placeholder="Nama toko" /></Field>
              <Field label="Kode Toko"><TextInput value={manualStoreCode} onChange={(e) => setManualStoreCode(e.target.value)} placeholder="Kode toko" /></Field>
              <Field label="Alamat"><TextArea value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} placeholder="Alamat toko" minRows={2} /></Field>
              <Field label="Catatan"><TextArea value={manualNote} onChange={(e) => setManualNote(e.target.value)} placeholder="Catatan" minRows={2} /></Field>
              <Button variant="secondary" icon="spark" onClick={submitManualRequest}>Kirim Request Admin</Button>
            </div> : null}
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
          <Button icon="plus" onClick={() => onCreate(bestieName, storeName)} disabled={!bestieName || !storeName}>Mulai Kunjungan</Button>
        </div>
      </div>
    </div>
  );
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
  const [fallback, setFallback] = useState(false);
  const [renderStatus, setRenderStatus] = useState('');
  const renderSeqRef = useRef(0);
  const lastWidthRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let resizeTimer = null;

    async function renderPdf(force = false) {
      const target = pagesRef.current;
      if (!target || !blob) return;
      const measuredWidth = Math.max(280, Math.floor(target.clientWidth || target.getBoundingClientRect().width || 360));
      if (!force && Math.abs(measuredWidth - lastWidthRef.current) < 24 && target.childElementCount) return;
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
        if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
        const data = await blob.arrayBuffer();
        if (cancelled || renderSeqRef.current !== seq) return;
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        const fragment = document.createDocumentFragment();
        const maxWidth = Math.max(260, Math.min(measuredWidth - 12, 1120));
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled || renderSeqRef.current !== seq) return;
          const page = await pdf.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = maxWidth / baseViewport.width;
          const viewport = page.getViewport({ scale });
          const outputScale = Math.min(window.devicePixelRatio || 1, 2);
          const pageWrap = document.createElement('div');
          pageWrap.className = 'pdf-preview-page-wrap';
          const canvas = document.createElement('canvas');
          canvas.className = 'pdf-preview-page-canvas';
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = Math.floor(viewport.width) + 'px';
          canvas.style.height = Math.floor(viewport.height) + 'px';
          pageWrap.appendChild(canvas);
          fragment.appendChild(pageWrap);
          const context = canvas.getContext('2d', { alpha: false });
          await page.render({ canvasContext: context, viewport, transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null }).promise;
        }
        if (cancelled || renderSeqRef.current !== seq) return;
        target.replaceChildren(fragment);
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
      resizeTimer = setTimeout(() => renderPdf(false), 360);
    }
    window.addEventListener('resize', scheduleRender, { passive: true });
    window.addEventListener('orientationchange', scheduleRender);
    return () => {
      cancelled = true;
      clearTimeout(resizeTimer);
      renderSeqRef.current += 1;
      window.removeEventListener('resize', scheduleRender);
      window.removeEventListener('orientationchange', scheduleRender);
    };
  }, [blob]);

  if (!blob) return <div className="grid min-h-[52vh] place-items-center p-8 text-center text-slate-600">{status}</div>;
  if (fallback && pdfUrl) return <iframe className="preview-frame" src={pdfUrl + '#toolbar=0&navpanes=0&scrollbar=0&view=Fit'} title="Preview Regional Bestie PDF" />;
  return <div className="pdf-canvas-scroll"><div ref={pagesRef} className="pdf-canvas-pages" />{renderStatus ? <div className="pdf-render-status">{renderStatus}</div> : null}</div>;
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
      if (!visit) return;
      setStatus('Merender PDF...');
      try {
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
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [visit]);

  async function handleDownloadPdf() { if (!visit) return; setBusy(true); try { await window.ReportVisitPDF.save(visit); } catch (error) { alert(error?.message || 'Gagal download PDF.'); } finally { setBusy(false); } }
  async function handleExportExcel() { if (!visit) return; if (!window.__caAssignmentExport?.buildWorkbook) { alert('Mesin export Excel belum siap.'); return; } setBusy(true); try { const blob = await window.__caAssignmentExport.buildWorkbook(visit); const fileName = 'CA_Store_Assignment_' + cleanText(visit.store, 'Store').replace(/\s+/g, '_') + '.xlsx'; downloadBlob(blob, fileName); } catch (error) { alert(error?.message || 'Gagal export Excel CA Assignment.'); } finally { setBusy(false); } }

  if (!visit) return <main className="preview-page mx-auto w-full max-w-6xl px-4 py-8 md:px-8"><EmptyState icon="pdf" title="Belum ada visit aktif" action={<Button variant="secondary" onClick={onBack}>Kembali</Button>} /></main>;

  return (
    <main className="preview-page mx-auto w-full max-w-7xl px-4 py-4 md:px-8 md:py-8">
      <div className="preview-header mb-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-end"><div><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary">Preview PDF</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">Review Report</h1></div><div className="preview-progress-card rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-900 ring-1 ring-emerald-100"><div className="mb-2 flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-wide">Progress</p><p className="text-sm font-black">{visitProgress(visit)}%</p></div><ProgressBar value={visitProgress(visit)} /></div></div>
      <div className="preview-modal-card surface-card overflow-hidden rounded-[24px] md:rounded-[28px]"><div className="preview-toolbar flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-sm font-extrabold text-slate-950">{visit.store || 'Store belum dipilih'}</p><p className="truncate text-xs text-slate-500">{visit.nama || 'Bestie belum dipilih'} • {formatDate(visit.tanggal)}</p></div><div className="preview-actions flex flex-wrap gap-2"><Button variant="secondary" icon="left" onClick={onBack}>Kembali</Button><Button icon="download" onClick={handleDownloadPdf} disabled={busy}>Download PDF</Button><Button variant="secondary" icon="excel" onClick={handleExportExcel} disabled={busy} className="excel-export-button"><span className="text-left leading-tight"><span className="block">Export Excel CA Assigment</span><span className="block text-[11px] font-semibold text-slate-500">file untuk feedback store</span></span></Button></div></div><div className="preview-frame-wrap"><PdfCanvasPreview blob={pdfBlob} pdfUrl={pdfUrl} status={status} /></div></div>
    </main>
  );
}

// =============================================================
// Secret monitor helpers
// =============================================================
function getConvexConfig() {
  return window.RB_CONVEX_CONFIG || {};
}

function buildVisitKey(visit) {
  return [visit?.nama, visit?.store, visit?.tanggal].map((part) => normalize(part).replace(/\s+/g, '-')).filter(Boolean).join('__') || visit?.id || SESSION_ID;
}

function convexUrl(path) {
  const config = getConvexConfig();
  if (!config.enabled || !config.httpUrl) return '';
  return String(config.httpUrl).replace(/\/$/, '') + '/' + String(path || '').replace(/^\//, '');
}

async function upsertMonitorVisit(visit) {
  const config = getConvexConfig();
  const endpoint = convexUrl(config.upsertPath || 'monitor/upsertVisit');
  if (!endpoint || !visit || !cleanText(visit.nama) || !cleanText(visit.store)) return;
  const detail = getStoreWebDetail(visit.store);
  const payload = {
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
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}) },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.warn('Convex upsert gagal:', error);
  }
}

async function fetchMonitorRowsFromConvex() {
  const config = getConvexConfig();
  const endpoint = convexUrl(config.listPath || 'monitor/listVisits');
  if (!endpoint) return null;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}) }
  });
  if (!response.ok) throw new Error('Convex monitor gagal dibaca.');
  const payload = await response.json();
  return Array.isArray(payload) ? payload : (payload.rows || payload.data || []);
}

function exportJson(data, fileName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, fileName);
}

function SecretPinModal({ open, onClose, onUnlock }) {
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
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/70 p-5 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white"><Icon name="shield" /></span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary">Panel Rahasia</p>
              <h2 className="text-xl font-black text-slate-950">Masukkan PIN</h2>
            </div>
          </div>
          <Button variant="icon" onClick={onClose} aria-label="Tutup"><Icon name="close" className="h-4 w-4" /></Button>
        </div>
        <input
          ref={inputRef}
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6))}
          type="password"
          inputMode="numeric"
          maxLength="6"
          className="form-control text-center text-3xl font-black tracking-[0.5em]"
          placeholder="------"
          aria-label="PIN panel rahasia"
        />
        {error ? <p className="mt-3 text-center text-sm font-bold text-rose-600">{error}</p> : null}
      </div>
    </div>
  );
}

function SecretMonitorPanel({ open, onClose, history }) {
  const [rows, setRows] = useState([]);
  const [source, setSource] = useState('local');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualRequests, setManualRequests] = useState([]);

  async function refresh() {
    setLoading(true);
    try {
      const remoteRows = await fetchMonitorRowsFromConvex();
      if (remoteRows) {
        setSource('convex');
        setRows(remoteRows.map((row) => ({
          bestie_name: row.bestie_name,
          store_name: row.store_name,
          store_code: row.store_code,
          visit_date: row.visit_date,
          total_visits: row.total_visits,
          updated_at: row.updated_at || row.last_visit_at,
          session_id: row.session_id
        })));
      } else {
        setSource('local');
        setRows((history || []).map((item) => ({
          bestie_name: item.bestieName,
          store_name: item.storeName,
          store_code: item.storeCode,
          visit_date: item.visitDate,
          total_visits: 1,
          updated_at: item.updatedAt,
          session_id: '-'
        })));
      }
    } catch (error) {
      setSource('local');
      setRows((history || []).map((item) => ({
        bestie_name: item.bestieName,
        store_name: item.storeName,
        store_code: item.storeCode,
        visit_date: item.visitDate,
        total_visits: 1,
        updated_at: item.updatedAt,
        session_id: '-'
      })));
    } finally {
      setManualRequests(readManualStoreRequests());
      setLoading(false);
    }
  }

  function approveRequest(id) {
    if (!confirmAction('Approve request toko manual ini?')) return;
    approveManualStoreRequest(id);
    setManualRequests(readManualStoreRequests());
  }

  function rejectRequest(id) {
    if (!confirmAction('Tolak request toko manual ini?')) return;
    rejectManualStoreRequest(id);
    setManualRequests(readManualStoreRequests());
  }

  useEffect(() => {
    if (open) refresh();
  }, [open, history]);

  if (!open) return null;
  const filtered = rows.filter((row) => {
    const haystack = normalize([row.bestie_name, row.store_name, row.store_code].join(' '));
    return !query || haystack.includes(normalize(query));
  });
  const uniqueBesties = new Set(rows.map((row) => normalize(row.bestie_name)).filter(Boolean)).size;
  const today = new Date().toISOString().slice(0, 10);
  const todayVisits = rows.filter((row) => String(row.visit_date || '').slice(0, 10) === today).length;

  return (
    <div className="fixed inset-0 z-[85] overflow-auto bg-slate-950/65 p-3 backdrop-blur-sm md:p-6" role="dialog" aria-modal="true">
      <div className="mx-auto max-w-6xl rounded-[32px] bg-white p-5 shadow-2xl md:p-7">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary">Monitor Admin</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Pantauan Visit Bestie & Store</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon="download" onClick={() => exportJson(rows, 'regional-bestie-monitor.json')}>Export JSON</Button>
            <Button variant="secondary" icon="spark" onClick={refresh} disabled={loading}>Refresh</Button>
            <Button variant="icon" onClick={onClose} aria-label="Tutup"><Icon name="close" className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-slate-950 p-5 text-white"><p className="text-xs font-bold uppercase text-slate-300">Source</p><p className="mt-2 text-2xl font-black capitalize">{source}</p></div>
          <div className="rounded-3xl bg-emerald-50 p-5 text-emerald-900 ring-1 ring-emerald-100"><p className="text-xs font-bold uppercase">Total Visit</p><p className="mt-2 text-3xl font-black">{rows.length}</p></div>
          <div className="rounded-3xl bg-orange-50 p-5 text-orange-900 ring-1 ring-orange-100"><p className="text-xs font-bold uppercase">Bestie Unik</p><p className="mt-2 text-3xl font-black">{uniqueBesties}</p></div>
          <div className="rounded-3xl bg-slate-50 p-5 text-slate-900 ring-1 ring-slate-200"><p className="text-xs font-bold uppercase text-slate-500">Visit Hari Ini</p><p className="mt-2 text-3xl font-black">{todayVisits}</p></div>
        </div>

        <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-lg font-black text-slate-950">Request Toko Manual</h3><Badge tone="default">{manualRequests.filter((item) => item.status === 'pending').length} pending</Badge></div>
          <div className="grid gap-3">
            {manualRequests.length ? manualRequests.map((item) => (
              <div key={item.id} className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0"><p className="font-extrabold text-slate-950">{item.storeName || '-'}</p><p className="text-xs text-slate-500">{item.bestieName || '-'} • {item.storeCode || '-'} • {formatDateTime(item.createdAt)}</p>{item.address ? <p className="mt-1 text-xs text-slate-600">{item.address}</p> : null}</div>
                  <div className="flex flex-wrap items-center gap-2"><Badge tone={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'warning' : 'default'}>{item.status}</Badge>{item.status === 'pending' ? <><Button variant="secondary" icon="check" onClick={() => approveRequest(item.id)}>Approve</Button><Button variant="danger" icon="close" onClick={() => rejectRequest(item.id)}>Reject</Button></> : null}</div>
                </div>
              </div>
            )) : <div className="rounded-2xl bg-white p-4 text-sm font-bold text-slate-500 ring-1 ring-slate-200">Belum ada request.</div>}
          </div>
        </div>

        <div className="mb-4 max-w-md">
          <div className="relative">
            <Icon name="search" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari bestie, store, kode..." className="pl-12" />
          </div>
        </div>

        <div className="table-scroll overflow-hidden rounded-3xl border border-slate-200">
          <table className="w-full border-collapse bg-white text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">No</th><th className="px-4 py-3">Bestie</th><th className="px-4 py-3">Kode</th><th className="px-4 py-3">Store</th><th className="px-4 py-3">Visit</th><th className="px-4 py-3">Update</th></tr>
            </thead>
            <tbody>
              {filtered.length ? filtered.map((row, index) => (
                <tr key={`${row.bestie_name}-${row.store_name}-${index}`} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-bold text-slate-500">{index + 1}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">{row.bestie_name || '-'}</td>
                  <td className="px-4 py-3">{row.store_code || '-'}</td>
                  <td className="px-4 py-3">{row.store_name || '-'}</td>
                  <td className="px-4 py-3">{formatDate(row.visit_date)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(row.updated_at)}</td>
                </tr>
              )) : <tr><td colSpan="6" className="px-4 py-10 text-center text-slate-500">Tidak ada data.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DesktopSidebar({ screen, setScreen, visit, activeSection, goSection, onNewVisit, onClearData, onTitleTap }) {
  return (
    <aside className="hidden min-h-screen border-r border-slate-200 bg-white/86 p-4 backdrop-blur-xl md:flex md:flex-col">
      <button type="button" onClick={onTitleTap} className="mb-6 rounded-[28px] bg-slate-950 p-5 text-left text-white transition hover:-translate-y-0.5">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><Icon name="spark" /></div>
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-200">Bestie Audit</p>
        <h2 className="mt-2 text-xl font-black leading-tight">Visit Report System</h2>
      </button>

      <nav className="space-y-2" aria-label="System menu">
        <button type="button" className={cx('nav-item', screen === 'dashboard' && 'active')} onClick={() => { onTitleTap?.(); setScreen('dashboard'); }}>
          <span className="flex items-center gap-3"><Icon name="home" /><span><span className="block font-extrabold">Dashboard</span></span></span>
        </button>
        <button type="button" className={cx('nav-item', screen === 'audit' && 'active')} onClick={() => visit ? setScreen('audit') : onNewVisit()}>
          <span className="flex items-center gap-3"><Icon name="clipboard" /><span><span className="block font-extrabold">Audit Form</span></span></span>
        </button>
        <button type="button" className={cx('nav-item', screen === 'preview' && 'active')} onClick={() => visit ? setScreen('preview') : onNewVisit()}>
          <span className="flex items-center gap-3"><Icon name="pdf" /><span><span className="block font-extrabold">Preview PDF</span></span></span>
        </button>
      </nav>

      {visit ? (
        <div className="mt-6">
          <p className="mb-3 px-2 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Sub Menu Section</p>
          <div className="space-y-1">
            {SECTION_DEFS.map((section, index) => (
              <button key={section.id} type="button" className={cx('nav-item !rounded-2xl !px-3 !py-2', screen === 'audit' && activeSection === index && 'active')} onClick={() => { setScreen('audit'); goSection(index); }}>
                <span className="flex items-center gap-3">
                  <Icon name={section.icon} className="h-4 w-4" />
                  <span className="min-w-0"><span className="block truncate text-sm font-extrabold">{section.title}</span></span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-auto space-y-2 pt-5">
        <Button className="w-full" variant="secondary" icon="plus" onClick={onNewVisit}>Kunjungan Baru</Button>
        {visit ? <Button className="w-full" variant="danger" icon="eraser" onClick={onClearData}>Clear Data</Button> : null}
      </div>
    </aside>
  );
}

function MobileTopBar({ screen, visit, activeSection, goSection }) {
  if (screen !== 'audit' || !visit) return null;
  const progress = visitProgress(visit);
  return (
    <header className="mobile-quick-section md:hidden">
      <div className="mobile-quick-scroll" aria-label="Quick section">
        {SECTION_DEFS.map((section, index) => (
          <button key={section.id} type="button" className={cx('mobile-quick-chip', activeSection === index && 'active')} onClick={() => goSection(index)}>
            <Icon name={section.icon} className="h-4 w-4" />
            <span>{section.label}</span>
          </button>
        ))}
      </div>
      <div className="mobile-quick-progress"><ProgressBar value={progress} /></div>
    </header>
  );
}

function MobileBottomNav({ screen, setScreen, visit, onNewVisit, onClearData }) {
  const goAudit = () => visit ? setScreen('audit') : onNewVisit();
  const goPreview = () => visit ? setScreen('preview') : onNewVisit();
  const items = [
    { key: 'dashboard', label: 'Home', icon: 'home', action: () => setScreen('dashboard'), active: screen === 'dashboard' },
    { key: 'audit', label: 'Audit', icon: 'clipboard', action: goAudit, active: screen === 'audit' },
    { key: 'preview', label: 'Preview', icon: 'pdf', action: goPreview, active: screen === 'preview' }
  ];
  return (
    <nav className="mobile-system-nav md:hidden" aria-label="Mobile system navigation"><div className={cx('mobile-system-grid', screen === 'audit' && visit ? 'cols-4' : 'cols-3')}>{items.map((item) => <button key={item.key} type="button" className={cx('mobile-system-button', item.active && 'active')} onClick={item.action}><Icon name={item.icon} className="h-5 w-5" /><span>{item.label}</span></button>)}{screen === 'audit' && visit ? <button type="button" className="mobile-system-button danger" onClick={onClearData}><Icon name="eraser" className="h-5 w-5" /><span>Clear</span></button> : null}</div></nav>
  );
}

function VisitWorkspace({ visit, update, activeSection, goSection, onPreview }) {
  useEffect(() => {
    function handleKey(event) { if (event.key === 'ArrowRight') goSection(activeSection + 1); if (event.key === 'ArrowLeft') goSection(activeSection - 1); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [activeSection]);

  if (!visit) return <main className="workspace-page mx-auto w-full max-w-6xl px-4 py-8 md:px-8"><EmptyState icon="clipboard" title="Belum ada visit aktif" /></main>;

  const screens = [<VisitSetupSection visit={visit} update={update} />, <GeneralInfoSection visit={visit} update={update} />, <QscResultSection visit={visit} update={update} />, <ObservationSection visit={visit} update={update} />, <EvidenceSection visit={visit} update={update} />, <AssignmentSection visit={visit} update={update} onPreview={onPreview} />];

  return (
    <main className="workspace-page mx-auto w-full max-w-7xl px-4 py-5 md:px-8 md:py-8">
      <div className="mb-5 hidden rounded-[28px] bg-white p-4 ring-1 ring-slate-200 md:block"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-extrabold text-slate-950">{visit.store || 'Store belum dipilih'}</p><p className="truncate text-xs text-slate-500">{visit.nama || 'Bestie belum dipilih'} • {formatDate(visit.tanggal)}</p></div><div className="hidden gap-2 sm:flex"><Button variant="icon" onClick={() => goSection(activeSection - 1)} disabled={activeSection <= 0} aria-label="Section sebelumnya"><Icon name="left" className="h-5 w-5" /></Button><Button variant="icon" onClick={() => goSection(activeSection + 1)} disabled={activeSection >= SECTION_DEFS.length - 1} aria-label="Section berikutnya"><Icon name="right" className="h-5 w-5" /></Button></div></div><div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Sub menu section">{SECTION_DEFS.map((section, index) => <button key={section.id} type="button" className={cx('subnav-chip', activeSection === index && 'active')} onClick={() => goSection(index)}><Icon name={section.icon} className="h-4 w-4" /> {section.label}</button>)}</div></div>
      <div key={SECTION_DEFS[activeSection]?.id || activeSection}>{screens[activeSection]}</div>
    </main>
  );
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
  const secretTapRef = useRef({ count: 0, timer: null });

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
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    window.getFormData = () => visit || {};
  }, [visit]);

  useEffect(() => {
    if (!visit?.id) return;
    const timer = setTimeout(async () => {
      const nextVisit = { ...visit, updatedAt: Date.now() };
      try {
        await putVisitRecord(nextVisit);
        localStorage.setItem(ACTIVE_VISIT_KEY, nextVisit.id);
        const nextMeta = saveHistoryMeta([historyMetaFromVisit(nextVisit), ...readHistoryMeta().filter((item) => item.id !== nextVisit.id)]);
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
    setVisit((current) => current ? { ...current, ...patch, updatedAt: Date.now() } : current);
  }

  function goSection(index) {
    setActiveSection(Math.max(0, Math.min(SECTION_DEFS.length - 1, index)));
  }

  function handleTitleTap() {
    const ref = secretTapRef.current;
    ref.count += 1;
    if (ref.timer) clearTimeout(ref.timer);
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
    } catch (error) {
      alert('Gagal membuka history visit.');
    }
  }

  async function deleteVisit(id) {
    const ok = confirm('Hapus history kunjungan ini?');
    if (!ok) return;
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
    content = <DashboardPage history={history} storageLabel={storageLabel} onNewVisit={() => setNewVisitOpen(true)} onOpenVisit={openVisit} onDeleteVisit={deleteVisit} onClearHistory={clearAllHistory} onTitleTap={handleTitleTap} />;
  } else if (screen === 'preview') {
    content = <PreviewPage visit={visit} onBack={() => setScreen('audit')} />;
  } else {
    content = <VisitWorkspace visit={visit} update={updateVisit} activeSection={activeSection} goSection={goSection} onPreview={() => setScreen('preview')} />;
  }

  return (
    <div className="audit-shell min-h-screen md:grid md:grid-cols-[300px_minmax(0,1fr)]">
      <DesktopSidebar screen={screen} setScreen={setScreen} visit={visit} activeSection={activeSection} goSection={goSection} onNewVisit={() => setNewVisitOpen(true)} onClearData={clearCurrentData} onTitleTap={handleTitleTap} />
      <div className="flex min-h-screen min-w-0 flex-col">
        <MobileTopBar screen={screen} setScreen={setScreen} visit={visit} activeSection={activeSection} goSection={goSection} onNewVisit={() => setNewVisitOpen(true)} onTitleTap={handleTitleTap} />
        <div className="min-w-0 flex-1">{content}</div>
        <MobileBottomNav screen={screen} setScreen={setScreen} visit={visit} onNewVisit={() => setNewVisitOpen(true)} onClearData={clearCurrentData} />
      </div>
      <NewVisitModal open={newVisitOpen} onClose={() => setNewVisitOpen(false)} onCreate={createNewVisit} />
      <SecretPinModal open={pinOpen} onClose={() => setPinOpen(false)} onUnlock={() => { setPinOpen(false); setSecretOpen(true); }} />
      <SecretMonitorPanel open={secretOpen} onClose={() => setSecretOpen(false)} history={history} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
