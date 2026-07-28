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
function getVisitStoreLookupKeys(visit) {
    return uniqueBy([
        visit?.storeCode,
        visit?.siteCode,
        visit?.siteCode4,
        visit?.detail?.siteCode4,
        visit?.detail?.siteCode,
        visit?.storeDetail?.siteCode4,
        visit?.storeDetail?.siteCode,
        visit?.manualStoreDetail?.siteCode4,
        visit?.manualStoreDetail?.siteCode,
        visit?.store,
        visit?.storeName,
        visit?.detail?.siteDescr,
        visit?.detail?.storeName,
        visit?.storeDetail?.siteDescr,
        visit?.storeDetail?.storeName,
        visit?.manualStoreDetail?.siteDescr,
        visit?.manualStoreDetail?.storeName
    ].map((item) => cleanText(item)).filter(Boolean), (item) => normalize(item));
}
function getVisitStoreEmail(visit) {
    const direct = cleanText(
        visit?.emailStore ||
        visit?.storeEmail ||
        visit?.detail?.emailStore ||
        visit?.storeDetail?.emailStore ||
        visit?.manualStoreDetail?.emailStore
    );
    if (isEmailSyntax(direct))
        return direct.toLowerCase();
    for (const key of getVisitStoreLookupKeys(visit)) {
        const detail = getStoreWebDetail(key) || {};
        const master = findMasterStore(key) || {};
        const email = cleanText(detail.emailStore || master.emailStore).toLowerCase();
        if (isEmailSyntax(email))
            return email;
    }
    return '';
}

const CUSTOM_EMAIL_DIRECTORY_KEY = 'visitreport_custom_email_directory_v1';
const SCHEDULED_REPORT_EMAIL_QUEUE_KEY = 'visitreport_scheduled_email_queue_v1';
const DEVICE_BACKUP_KEY = 'regional-bestie-visit-report-v1';
const DEVICE_BACKUP_LAST_PULL_KEY = 'rbv_device_backup_last_pull_v207';
let RBV_EMAIL_SCHEDULER_STARTED = false;
let RBV_EMAIL_SCHEDULER_TIMER = null;
let RBV_EMAIL_SCHEDULER_TIMEOUTS = {};
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
const EMAIL_SAFE_REQUEST_BYTES = 4 * 1024 * 1024;
const EMAIL_PDF_SAFE_BYTES = 3.1 * 1024 * 1024;
const EMAIL_EXCEL_SAFE_BYTES = 520 * 1024;
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
    const safeItems = Array.isArray(items) ? items : [];
    try {
        localStorage.setItem(SCHEDULED_REPORT_EMAIL_QUEUE_KEY, JSON.stringify(safeItems));
        return true;
    }
    catch (error) {
        console.warn('Queue schedule email gagal disimpan penuh:', error);
        try {
            const compactItems = safeItems.map((item) => ({
                ...item,
                payload: {
                    ...(item.payload || {}),
                    attachments: [],
                    body: addEmailNote(item.payload?.body || '', ['Attachment tidak disimpan di timer karena storage device tidak cukup. Jika email terkirim dari timer, attachment perlu dikirim manual dari Gmail.'])
                },
                storageWarning: 'Attachment dilepas karena storage device tidak cukup.'
            }));
            localStorage.setItem(SCHEDULED_REPORT_EMAIL_QUEUE_KEY, JSON.stringify(compactItems));
            window.dispatchEvent(new CustomEvent('rbv-email-feedback-popup', { detail: { icon: 'history', title: 'Timer disimpan mode ringan', message: 'Storage device tidak cukup untuk menyimpan attachment. Timer tetap tersimpan, tapi attachment dilepas dari email schedule.' } }));
            return true;
        }
        catch (secondError) {
            console.warn('Queue schedule email gagal disimpan:', secondError);
            window.dispatchEvent(new CustomEvent('rbv-email-feedback-popup', { detail: { icon: 'close', title: 'Timer gagal disimpan', message: 'Storage device penuh. Kurangi attachment atau kirim email tanpa timer.' } }));
            return false;
        }
    }
}
async function postReportEmailPayload(endpoint, payload) {
    let response;
    try {
        response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }
    catch (networkError) {
        const err = new Error(`Koneksi endpoint email gagal: ${networkError?.message || 'network error'}. Cek internet, endpoint email, dan deploy API.`);
        err.code = 'EMAIL_NETWORK_ERROR';
        throw err;
    }
    let rawText = '';
    let result = {};
    try {
        rawText = await response.text();
        result = rawText ? JSON.parse(rawText) : {};
    }
    catch (_) {
        result = { raw: rawText };
    }
    if (!response.ok || result.ok === false) {
        const detail = cleanText(result.error || result.message || result.details || result.raw || rawText);
        const statusInfo = `HTTP ${response.status}${response.statusText ? ' ' + response.statusText : ''}`;
        const suffix = detail ? `: ${detail.slice(0, 360)}` : '';
        const err = new Error(`Gagal mengirim email (${statusInfo})${suffix}`);
        err.code = 'EMAIL_ENDPOINT_ERROR';
        err.status = response.status;
        err.result = result;
        err.raw = rawText;
        throw err;
    }
    return result;
}
function isRetryableEmailAttachmentError(error) {
    const status = Number(error?.status || 0);
    const text = String(error?.message || error?.raw || '').toLowerCase();
    if ([413, 414, 415, 422, 429, 500, 502, 503, 504].includes(status)) return true;
    return /payload|body|limit|size|large|besar|attachment|lampiran|base64|timeout|fetch|network|json|too\s*large/.test(text);
}
function keepOnlyPdfAttachments(payload) {
    const next = { ...(payload || {}) };
    next.attachments = (payload?.attachments || []).filter((item) => String(item?.mimeType || '').toLowerCase().includes('pdf'));
    return next;
}
async function processScheduledReportEmailQueue(endpoint, options = {}) {
    const queue = readScheduledReportEmailQueue();
    const now = Date.now();
    const remaining = [];
    let sent = 0;
    let failed = 0;
    let skipped = 0;
    for (const job of queue) {
        if (!job) {
            skipped += 1;
            continue;
        }
        const sendAt = Number(job.sendAt || 0);
        const retryAfter = Number(job.retryAfter || 0);
        if (sendAt > now || retryAfter > now) {
            remaining.push(job);
            continue;
        }
        try {
            await postReportEmailPayload(job.endpoint || endpoint, { ...(job.payload || {}), mode: 'send' });
            sent += 1;
        }
        catch (error) {
            failed += 1;
            remaining.push({ ...job, lastError: error?.message || 'Gagal mengirim schedule email.', retryAfter: Date.now() + 5 * 60 * 1000 });
        }
    }
    saveScheduledReportEmailQueue(remaining);
    window.dispatchEvent(new CustomEvent('rbv-email-schedule-change', { detail: remaining }));
    if ((sent || failed) && !options.quiet) {
        window.dispatchEvent(new CustomEvent('rbv-email-feedback-popup', { detail: {
            icon: sent ? 'send' : 'close',
            title: sent ? 'Schedule email diproses' : 'Schedule email belum terkirim',
            message: sent ? `${sent} email schedule berhasil dikirim${failed ? `, ${failed} gagal dan akan dicoba ulang.` : '.'}` : `${failed} email schedule gagal dan akan dicoba ulang saat app aktif/online.`
        } }));
    }
    return { sent, failed, skipped, remaining: remaining.length };
}
function armScheduledReportEmailJob(job, endpoint) {
    if (!job || !job.id)
        return;
    if (RBV_EMAIL_SCHEDULER_TIMEOUTS[job.id]) {
        window.clearTimeout(RBV_EMAIL_SCHEDULER_TIMEOUTS[job.id]);
        delete RBV_EMAIL_SCHEDULER_TIMEOUTS[job.id];
    }
    const delay = Math.max(0, Math.min(Number(job.sendAt || 0) - Date.now(), 2147483647));
    RBV_EMAIL_SCHEDULER_TIMEOUTS[job.id] = window.setTimeout(() => {
        delete RBV_EMAIL_SCHEDULER_TIMEOUTS[job.id];
        processScheduledReportEmailQueue(endpoint || job.endpoint || getEmailReportConfig().endpoint);
    }, delay);
}
function armAllScheduledReportEmailJobs(endpoint) {
    const queue = readScheduledReportEmailQueue();
    Object.keys(RBV_EMAIL_SCHEDULER_TIMEOUTS).forEach((key) => {
        window.clearTimeout(RBV_EMAIL_SCHEDULER_TIMEOUTS[key]);
        delete RBV_EMAIL_SCHEDULER_TIMEOUTS[key];
    });
    queue.forEach((job) => armScheduledReportEmailJob(job, endpoint));
}
function startPersistentEmailScheduler(endpoint) {
    if (RBV_EMAIL_SCHEDULER_STARTED)
        return;
    RBV_EMAIL_SCHEDULER_STARTED = true;
    const run = (quiet = false) => {
        const config = getEmailReportConfig();
        const effectiveEndpoint = endpoint || config.endpoint;
        processScheduledReportEmailQueue(effectiveEndpoint, { quiet });
        armAllScheduledReportEmailJobs(effectiveEndpoint);
    };
    run(true);
    RBV_EMAIL_SCHEDULER_TIMER = window.setInterval(() => run(true), 30000);
    window.addEventListener('online', () => run(false));
    window.addEventListener('focus', () => run(false));
    window.addEventListener('pageshow', () => run(false));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) run(false); });
}
function scheduleReportEmailJob(endpoint, payload, delayMs) {
    const job = {
        id: String(Date.now()) + '-' + Math.random().toString(16).slice(2),
        sendAt: Date.now() + delayMs,
        endpoint,
        payload: { ...payload, mode: 'send' },
        createdAt: new Date().toISOString(),
        persistent: true
    };
    const saved = saveScheduledReportEmailQueue([...readScheduledReportEmailQueue(), job]);
    if (!saved)
        throw new Error('Timer email gagal disimpan. Storage device penuh.');
    const queue = readScheduledReportEmailQueue();
    window.dispatchEvent(new CustomEvent('rbv-email-schedule-change', { detail: queue }));
    armScheduledReportEmailJob(job, endpoint);
    startPersistentEmailScheduler(endpoint);
    return job;
}
function cancelScheduledReportEmailJob(jobId) {
    if (RBV_EMAIL_SCHEDULER_TIMEOUTS[jobId]) {
        window.clearTimeout(RBV_EMAIL_SCHEDULER_TIMEOUTS[jobId]);
        delete RBV_EMAIL_SCHEDULER_TIMEOUTS[jobId];
    }
    const next = readScheduledReportEmailQueue().filter((item) => item.id !== jobId);
    saveScheduledReportEmailQueue(next);
    window.dispatchEvent(new CustomEvent('rbv-email-schedule-change', { detail: next }));
    return next;
}
function cancelAllScheduledReportEmailJobs() {
    Object.keys(RBV_EMAIL_SCHEDULER_TIMEOUTS).forEach((key) => {
        window.clearTimeout(RBV_EMAIL_SCHEDULER_TIMEOUTS[key]);
        delete RBV_EMAIL_SCHEDULER_TIMEOUTS[key];
    });
    saveScheduledReportEmailQueue([]);
    window.dispatchEvent(new CustomEvent('rbv-email-schedule-change', { detail: [] }));
    return [];
}


function buildEmailContact(kind, email, helper, extra = {}) {
    const cleanEmail = cleanText(email).toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))
        return null;
    const role = cleanText(extra.role || kind, cleanText(kind, 'Email'));
    const store = cleanText(extra.store);
    const helperText = cleanText(helper || [store, role].filter(Boolean).join(' • '), role);
    return {
        ...extra,
        kind: cleanText(kind, 'email'),
        email: cleanEmail,
        label: cleanEmail,
        helper: helperText,
        store,
        role
    };
}
function getVisitStoreDetailForEmail(visit) {
    let webDetail = {};
    let masterDetail = {};
    for (const key of getVisitStoreLookupKeys(visit)) {
        if (!webDetail.emailStore)
            webDetail = getStoreWebDetail(key) || webDetail || {};
        if (!masterDetail.emailStore)
            masterDetail = findMasterStore(key) || masterDetail || {};
        if (webDetail.emailStore || masterDetail.emailStore)
            break;
    }
    const merged = {
        ...webDetail,
        ...masterDetail,
        ...(visit?.detail || {}),
        ...(visit?.storeDetail || {}),
        ...(visit?.manualStoreDetail || {})
    };
    const storeEmail = cleanText(getVisitStoreEmail(visit));
    if (storeEmail)
        merged.emailStore = storeEmail;
    return merged;
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
    push('area', visitDetail.areaManagerEmail, 'Area Manager', { store: '', role: 'Area Manager' });
    push('regional', visitDetail.regionalManagerEmail, 'Regional Manager', { store: '', role: 'Regional Manager' });
    (getEffectiveMasterStores() || []).forEach((store) => {
        const storeName = cleanText(store.siteDescr || store.storeName || store.siteCode || 'Master Store');
        push('store', store.emailStore, `${storeName} • Email Store`, { store: storeName, role: 'Email Store' });
        push('area', store.areaManagerEmail, 'Area Manager', { store: '', role: 'Area Manager' });
        push('regional', store.regionalManagerEmail, 'Regional Manager', { store: '', role: 'Regional Manager' });
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
    return LOCKED_CC_EMAILS.map((email) => buildEmailContact('locked-cc', email, 'Auto CC default', { role: 'Auto CC' })).filter(Boolean);
}
function buildInitialEmailForm(visit) {
    const config = getEmailReportConfig();
    const toOptions = getVisitToEmailContactOptions(visit);
    const defaultTo = toOptions[0]?.email || getVisitStoreEmail(visit) || config.defaultTo || '';
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
    // Legacy helper kept for older scheduled payloads. Do not use it for the main email PDF,
    // because stripping photos is the root cause of random photo-less PDF attachments.
    return { ...(visit || {}) };
}
function rbvCollectPdfPhotoCandidates(visit) {
    const items = [];
    function pushPhoto(photo) {
        if (!photo || typeof photo !== 'object') return;
        const src = cleanText(photo.image || photo.dataUrl || photo.src || photo.objectUrl);
        if (src) items.push(src);
    }
    pushPhoto(visit?.qscResultPhoto);
    (visit?.qscResultPhotos || []).forEach(pushPhoto);
    (visit?.findingEvidencePhotos || []).forEach(pushPhoto);
    (visit?.correctiveActionPhotos || []).forEach(pushPhoto);
    return items;
}
function rbvCanBrowserLoadImageSource(src) {
    const value = cleanText(src);
    if (!value) return false;
    if (/^data:image\/(jpeg|jpg|png|webp|gif|bmp|svg\+xml|svg)/i.test(value)) return true;
    if (/^blob:/i.test(value)) return true;
    if (/^https?:/i.test(value)) return true;
    return false;
}
function rbvLoadImageForPdfEmail(src, timeoutMs = 9000) {
    return new Promise((resolve, reject) => {
        const value = cleanText(src);
        if (!value) return reject(new Error('Sumber foto kosong.'));
        const image = new Image();
        let done = false;
        const finish = (fn, payload) => {
            if (done) return;
            done = true;
            window.clearTimeout(timer);
            fn(payload);
        };
        const timer = window.setTimeout(() => finish(reject, new Error('Timeout memuat foto PDF.')), Math.max(2500, timeoutMs));
        image.onload = () => finish(resolve, image);
        image.onerror = () => finish(reject, new Error('Foto tidak bisa dimuat browser.'));
        try { if (/^https?:/i.test(value)) image.crossOrigin = 'anonymous'; } catch (_) {}
        image.decoding = 'async';
        image.src = value;
        try {
            if (image.complete && (image.naturalWidth || image.width)) finish(resolve, image);
        } catch (_) {}
    });
}
async function rbvCompressImageSourceForPdfEmail(src, options = {}) {
    const value = cleanText(src);
    if (!value) return '';
    if (!rbvCanBrowserLoadImageSource(value)) return '';
    const maxSide = Math.max(420, Number(options.maxSide || 1180));
    const quality = Math.max(0.45, Math.min(0.82, Number(options.quality || 0.68)));
    const image = await rbvLoadImageForPdfEmail(value, options.timeoutMs || 9000);
    const naturalWidth = image.naturalWidth || image.width || 1;
    const naturalHeight = image.naturalHeight || image.height || 1;
    const scale = Math.min(1, maxSide / Math.max(naturalWidth, naturalHeight));
    const width = Math.max(1, Math.round(naturalWidth * scale));
    const height = Math.max(1, Math.round(naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
    if (!ctx) throw new Error('Canvas PDF email tidak siap.');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = RBV_ULTRA_LITE_CAMERA_MODE ? 'low' : 'medium';
    ctx.drawImage(image, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    try { canvas.width = 1; canvas.height = 1; } catch (_) {}
    return dataUrl;
}
async function rbvNormalizePhotoForPdfEmail(photo, options = {}) {
    if (!photo || typeof photo !== 'object') return photo;
    const src = cleanText(photo.image || photo.dataUrl || photo.src || photo.objectUrl);
    const next = { ...photo, image: src };
    if (!src) return next;
    try {
        const compressed = await rbvCompressImageSourceForPdfEmail(src, options);
        if (compressed) next.image = compressed;
    } catch (error) {
        console.warn('Foto PDF email gagal dikompres, mencoba sumber asli:', error);
        if (/^data:image\/(jpeg|jpg|png|webp)/i.test(src)) next.image = src;
        else next.image = '';
        next.pdfEmailImageError = error?.message || 'Foto tidak bisa dimuat untuk PDF email.';
    }
    delete next.objectUrl;
    delete next.dataUrl;
    delete next.src;
    return next;
}
async function rbvNormalizePhotoArrayForPdfEmail(items, options = {}) {
    const source = Array.isArray(items) ? items : [];
    const output = [];
    for (const item of source) {
        const photo = await rbvNormalizePhotoForPdfEmail(item, options);
        if (photo && (cleanText(photo.image) || cleanText(photo.description))) output.push(photo);
        await new Promise((resolve) => window.setTimeout(resolve, 0));
    }
    return output;
}
async function buildPdfVisitForEmail(visit, options = {}) {
    const prepared = await rbvPrepareVisitForPdf(visit, { forceAllSections: true });
    const next = { ...(prepared || {}), showQSCResult: true };
    next.qscResultPhoto = await rbvNormalizePhotoForPdfEmail(next.qscResultPhoto || blankPhoto(), options);
    next.qscResultPhotos = await rbvNormalizePhotoArrayForPdfEmail(next.qscResultPhotos || [], options);
    next.findingEvidencePhotos = await rbvNormalizePhotoArrayForPdfEmail(next.findingEvidencePhotos || [], options);
    next.correctiveActionPhotos = await rbvNormalizePhotoArrayForPdfEmail(next.correctiveActionPhotos || [], options);
    if ((next.findingEvidencePhotos || []).some((photo) => cleanText(photo.image) || cleanText(photo.description))) next.showFindingEvidence = true;
    if ((next.correctiveActionPhotos || []).some((photo) => cleanText(photo.image) || cleanText(photo.description))) next.showCorrectiveAction = true;
    return next;
}
function assertValidPdfBlob(blob, context = 'PDF') {
    if (!blob || typeof blob.size !== 'number' || blob.size < 1200) {
        throw new Error(`${context} gagal dibuat. Attachment dibatalkan agar email tidak terkirim tanpa PDF.`);
    }
    if (!/pdf/i.test(String(blob.type || 'application/pdf'))) {
        console.warn('Blob PDF tanpa MIME application/pdf:', blob.type);
    }
}
async function buildPdfAttachmentForEmail(visit, currentPdfBlob) {
    await ensurePdfEngineReady();
    if (!window.ReportVisitPDF?.createBlob)
        throw new Error('Mesin PDF belum siap. Refresh halaman lalu coba lagi.');
    const fileName = window.ReportVisitPDF.buildFileName ? window.ReportVisitPDF.buildFileName(visit) : 'Regional_Bestie_Visit_Report.pdf';
    let optimized = false;
    let emailVisit = await buildPdfVisitForEmail(visit, { maxSide: 1180, quality: 0.68 });
    let blob = await window.ReportVisitPDF.createBlob(emailVisit);
    assertValidPdfBlob(blob, 'PDF email');
    if (blob.size > EMAIL_PDF_SAFE_BYTES) {
        optimized = true;
        emailVisit = await buildPdfVisitForEmail(visit, { maxSide: 860, quality: 0.56, timeoutMs: 7000 });
        blob = await window.ReportVisitPDF.createBlob(emailVisit);
        assertValidPdfBlob(blob, 'PDF email ringan');
    }
    if (blob.size > EMAIL_PDF_SAFE_BYTES) {
        optimized = true;
        emailVisit = await buildPdfVisitForEmail(visit, { maxSide: 640, quality: 0.46, timeoutMs: 6500 });
        blob = await window.ReportVisitPDF.createBlob(emailVisit);
        assertValidPdfBlob(blob, 'PDF email ultra ringan');
    }
    return { blob, fileName, optimized, visit: emailVisit };
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
function AutoResizeTextarea({ value, onChange, className = '', minRows = 1, onPointerDown, onPointerUp, onTouchStart, onTouchEnd, onClick, ...props }) {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current)
            return;
        ref.current.style.height = 'auto';
        const minHeight = Math.max(28, Number(minRows || 1) * 24);
        ref.current.style.height = `${Math.max(ref.current.scrollHeight, minHeight)}px`;
    }, [value, minRows]);
    return React.createElement("textarea", { ...props, ref: ref, value: value, onChange: onChange, rows: minRows, className: cx('rbv-mobile-editable', className), onPointerDown: rbvComposeEditableTapHandler(onPointerDown), onPointerUp: rbvComposeEditableTapHandler(onPointerUp), onTouchStart: rbvComposeEditableTapHandler(onTouchStart), onTouchEnd: rbvComposeEditableTapHandler(onTouchEnd), onClick: rbvComposeEditableTapHandler(onClick) });
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
    const selectedItems = selectedEmails.map((email) => optionMap.get(normalize(email)) || { email, label: email, helper: 'Manual' });
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
        return React.createElement("span", { key: item.email, className: cx("rbv-email-recipient-chip-v99 inline-flex max-w-full items-center rounded-2xl ring-1", "bg-slate-100 text-slate-700 ring-slate-200"), style: recipientChipStyle },
            React.createElement("span", { className: "truncate", style: recipientChipEmailStyle }, item.email),
            React.createElement("button", { type: "button", className: "grid shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-rose-50 hover:text-rose-600", style: recipientRemoveButtonStyle, onClick: () => removeEmail(item.email), "aria-label": `Hapus ${item.email}` }, React.createElement(Icon, { name: "trash", className: "h-3 w-3" })));
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
    const autoCcSeededRef = useRef(false);
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
        if (!open) {
            autoCcSeededRef.current = false;
            return;
        }
        if (autoCcSeededRef.current)
            return;
        autoCcSeededRef.current = true;
        const initialCcValue = ensureLockedEmailList(form.cc);
        if (normalize(initialCcValue) !== normalize(form.cc))
            onChange({ cc: initialCcValue });
    }, [open]);
    if (!open)
        return null;
    const config = getEmailReportConfig();
    const toOptions = getVisitToEmailContactOptions(visit);
    const lockedCcEmails = [];
    const ccOptions = uniqueBy([...getLockedCcContacts().map((item) => ({ ...item, helper: 'Auto CC default', role: 'Auto CC' })), ...getAllMasterEmailContactOptions(visit)], (item) => normalize(item.email));
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
        setFeedbackPopup({ icon: 'trash', title: 'Timer email dibatalkan', message: 'Email terjadwal tidak akan dikirim.' });
    }
    function handleCancelAllSchedules() {
        setScheduledJobs(cancelAllScheduledReportEmailJobs());
        setFeedbackPopup({ icon: 'trash', title: 'Semua timer dibatalkan', message: 'Semua email terjadwal sudah dihapus.' });
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
        React.createElement(EmailRecipientPicker, { label: "Cc", value: form.cc, onChange: (value) => onChange({ cc: value }), options: ccOptions, multiple: true, lockedEmails: lockedCcEmails, placeholder: "Cari semua email master data" }),
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
            scheduleEls,
            statusDisplay,
            null));
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
                React.createElement("span", null, `Batal ${new Date(Number(job.sendAt || Date.now())).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`)))) : null,
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
    const taskRef = useRef(null);
    const [viewerStatus, setViewerStatus] = useState(status || 'Menyiapkan preview PDF...');
    const [fallback, setFallback] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const pinchRef = useRef({ active: false, distance: 0, zoom: 1 });
    function clampZoom(value) {
        const next = Number(value || 1);
        return Math.max(0.65, Math.min(2.75, next));
    }
    function zoomIn() { setZoom((value) => clampZoom(value + 0.15)); }
    function zoomOut() { setZoom((value) => clampZoom(value - 0.15)); }
    function zoomFit() { setZoom(1); }
    useEffect(() => {
        let cancelled = false;
        let pdfDocument = null;
        async function renderPdfDirectly() {
            const host = pagesRef.current;
            if (!host)
                return;
            host.innerHTML = '';
            setFallback(false);
            setPageCount(0);
            if (!blob) {
                setViewerStatus(status || 'Menyiapkan preview PDF...');
                return;
            }
            try {
                setViewerStatus('Memuat preview PDF final...');
                const pdfjs = await ensurePdfPreviewReady();
                if (pdfjs?.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
                    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                }
                const data = await blob.arrayBuffer();
                if (cancelled)
                    return;
                const loadingTask = pdfjs.getDocument({
                    data,
                    disableFontFace: false,
                    isEvalSupported: false,
                    useSystemFonts: true,
                    standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/'
                });
                taskRef.current = loadingTask;
                pdfDocument = await loadingTask.promise;
                if (cancelled)
                    return;
                const total = Math.max(1, Number(pdfDocument.numPages || 1));
                setPageCount(total);
                const isSmallScreen = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 700px)').matches;
                const deviceRatio = Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1.35 : 1.75);
                setViewerStatus(`Preview PDF final siap. Menampilkan ${total} halaman...`);
                for (let pageNumber = 1; pageNumber <= total; pageNumber += 1) {
                    if (cancelled)
                        break;
                    setViewerStatus(`Merender halaman ${pageNumber}/${total}...`);
                    const page = await pdfDocument.getPage(pageNumber);
                    if (cancelled)
                        break;
                    const baseViewport = page.getViewport({ scale: 1 });
                    const hostWidth = Math.max(280, Math.floor((host.clientWidth || 360) - 18));
                    const fitCssScale = Math.max(0.2, hostWidth / baseViewport.width);
                    const cssScale = Math.max(0.2, fitCssScale * clampZoom(zoom));
                    const renderScale = Math.max(0.65, Math.min(4.25, cssScale * deviceRatio));
                    const viewport = page.getViewport({ scale: renderScale });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d', { alpha: false });
                    if (!context)
                        throw new Error('Browser tidak mendukung canvas preview PDF.');
                    canvas.className = 'pdf-canvas-page';
                    canvas.width = Math.ceil(viewport.width);
                    canvas.height = Math.ceil(viewport.height);
                    const displayWidth = Math.ceil(baseViewport.width * cssScale);
                    const displayHeight = Math.ceil(baseViewport.height * cssScale);
                    const pageRatio = `${baseViewport.width} / ${baseViewport.height}`;
                    canvas.style.width = `${displayWidth}px`;
                    canvas.style.height = `${displayHeight}px`;
                    canvas.style.aspectRatio = pageRatio;
                    canvas.style.maxWidth = 'none';
                    const pageWrap = document.createElement('section');
                    pageWrap.className = 'pdf-canvas-page-wrap';
                    pageWrap.style.width = canvas.style.width;
                    pageWrap.style.setProperty('--pdf-page-ratio', pageRatio);
                    pageWrap.style.setProperty('--pdf-page-css-width', canvas.style.width);
                    pageWrap.style.setProperty('--pdf-page-css-height', canvas.style.height);
                    const label = document.createElement('div');
                    label.className = 'pdf-canvas-page-label';
                    label.textContent = `Halaman ${pageNumber} / ${total}`;
                    pageWrap.appendChild(label);
                    pageWrap.appendChild(canvas);
                    host.appendChild(pageWrap);
                    await page.render({ canvasContext: context, viewport }).promise;
                    try { page.cleanup(); } catch (_) { }
                }
                if (!cancelled)
                    setViewerStatus(`Preview PDF final siap${pageCount ? '' : ''}. Zoom ${Math.round(clampZoom(zoom) * 100)}%.`);
            }
            catch (error) {
                console.warn('Preview PDF canvas gagal:', error);
                if (!cancelled) {
                    setFallback(true);
                    setViewerStatus(error?.message || 'Preview PDF gagal ditampilkan.');
                }
            }
        }
        renderPdfDirectly();
        return () => {
            cancelled = true;
            try { taskRef.current?.destroy?.(); } catch (_) { }
            try { pdfDocument?.destroy?.(); } catch (_) { }
        };
    }, [blob, status, zoom]);
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
        pinchRef.current = { active: true, distance, zoom: clampZoom(zoom) };
    }
    function handlePreviewTouchMove(event) {
        const pinch = pinchRef.current;
        if (!pinch.active || !event.touches || event.touches.length < 2) return;
        const distance = touchDistance(event.touches);
        if (!distance || !pinch.distance) return;
        try { event.preventDefault(); } catch (_) {}
        const ratio = distance / pinch.distance;
        setZoom(clampZoom(pinch.zoom * ratio));
    }
    function handlePreviewTouchEnd(event) {
        if (!event.touches || event.touches.length < 2) {
            pinchRef.current = { active: false, distance: 0, zoom: clampZoom(zoom) };
        }
    }
    if (!blob || !pdfUrl) {
        return React.createElement("div", { className: "pdf-lite-empty pdf-direct-empty", role: "status", "aria-live": "polite" }, status || 'Menyiapkan preview PDF final...');
    }
    return (React.createElement("div", { className: "pdf-canvas-direct-preview pdf-canvas-zoom-preview" },
        React.createElement("div", { className: "pdf-canvas-direct-toolbar pdf-canvas-zoom-toolbar", role: "status", "aria-live": "polite" },
            React.createElement("div", { className: "pdf-canvas-statusline" },
                React.createElement("span", { className: "pdf-canvas-direct-dot", "aria-hidden": "true" }),
                React.createElement("strong", null, viewerStatus || status || 'Preview PDF final siap.')),
            React.createElement("div", { className: "pdf-canvas-zoom-controls", "aria-label": "Kontrol zoom preview PDF" },
                React.createElement("button", { type: "button", onClick: zoomOut, disabled: zoom <= 0.66, "aria-label": "Perkecil preview PDF" }, "−"),
                React.createElement("span", null, Math.round(clampZoom(zoom) * 100), "%"),
                React.createElement("button", { type: "button", onClick: zoomIn, disabled: zoom >= 2.74, "aria-label": "Perbesar preview PDF" }, "+"),
                React.createElement("button", { type: "button", onClick: zoomFit, disabled: Math.abs(zoom - 1) < 0.01 }, "Fit"))),
        React.createElement("div", { ref: pagesRef, className: "pdf-canvas-pages", "aria-label": "Preview PDF final identik", onTouchStart: handlePreviewTouchStart, onTouchMove: handlePreviewTouchMove, onTouchEnd: handlePreviewTouchEnd, onTouchCancel: handlePreviewTouchEnd }),
        fallback ? React.createElement("div", { className: "pdf-canvas-fallback" },
            React.createElement("p", null, "Browser ini tidak bisa menampilkan preview PDF canvas. Coba reload halaman."),
            React.createElement("iframe", { className: "pdf-direct-frame", src: pdfUrl + "#toolbar=0&navpanes=0&scrollbar=1&view=FitH", title: "Preview Regional Bestie PDF fallback" })) : null));
}

function rbvPreviewPlainText(value, fallback = '-') {
    const raw = value === undefined || value === null ? '' : String(value);
    if (!raw.trim()) return fallback;
    if (typeof document !== 'undefined' && /<[a-z][\s\S]*>/i.test(raw)) {
        const root = document.createElement('div');
        root.innerHTML = raw
            .replace(/<br\s*\/?\s*>/gi, '\n')
            .replace(/<\/p\s*>/gi, '\n')
            .replace(/<\/div\s*>/gi, '\n')
            .replace(/<\/li\s*>/gi, '\n');
        return (root.textContent || '').replace(/\u00a0/g, ' ').replace(/\n{3,}/g, '\n\n').trim() || fallback;
    }
    return raw.replace(/<[^>]+>/g, ' ').replace(/\u00a0/g, ' ').replace(/\s+\n/g, '\n').replace(/\n\s+/g, '\n').trim() || fallback;
}
function rbvPreviewHasRichValue(value) {
    return rbvPreviewPlainText(value, '').trim().length > 0;
}
function rbvPreviewObservationRows(rows) {
    return (Array.isArray(rows) ? rows : []).filter((row) => row && ['temuan', 'kondisiIdeal', 'dampak', 'penyebab', 'tindakan', 'deadline', 'hasil'].some((key) => rbvPreviewHasRichValue(row[key])));
}
function rbvPreviewPhotoItems(photos) {
    return (Array.isArray(photos) ? photos : []).filter((photo) => photo && (cleanText(photo.image) || rbvPreviewHasRichValue(photo.description)));
}
function rbvPreviewChunks(items, size) {
    const source = Array.isArray(items) ? items : [];
    const result = [];
    for (let index = 0; index < source.length; index += size) result.push(source.slice(index, index + size));
    return result;
}
function RbvHtmlPreviewHeader({ title, subtitle, visit, page }) {
    return React.createElement("div", { className: "rbv-html-pdf-header" },
        React.createElement("div", { className: "rbv-html-pdf-brand" },
            React.createElement("div", { className: "rbv-html-pdf-logo" }, "RBV"),
            React.createElement("div", null,
                React.createElement("strong", null, title),
                subtitle ? React.createElement("span", null, subtitle) : null)),
        React.createElement("div", { className: "rbv-html-pdf-meta" },
            React.createElement("span", null, cleanText(visit?.store, 'Store belum dipilih')),
            React.createElement("span", null, formatDate(visit?.tanggal)),
            page ? React.createElement("span", null, page) : null));
}
function RbvHtmlPreviewField({ label, value }) {
    return React.createElement("div", { className: "rbv-html-pdf-field" },
        React.createElement("span", null, label),
        React.createElement("strong", null, rbvPreviewPlainText(value)));
}
function RbvHtmlPreviewRichBlock({ label, value }) {
    return React.createElement("div", { className: "rbv-html-pdf-rich" },
        React.createElement("span", null, label),
        React.createElement("p", null, rbvPreviewPlainText(value)));
}
function RbvHtmlPreviewPhotoCard({ photo, index }) {
    const description = rbvPreviewPlainText(photo?.description, '');
    return React.createElement("article", { className: "rbv-html-pdf-photo-card" },
        React.createElement("div", { className: "rbv-html-pdf-photo-frame" },
            cleanText(photo?.image) ? React.createElement("img", { src: photo.image, alt: 'Foto ' + (index + 1), loading: "lazy", decoding: "async" }) : React.createElement("span", null, "Foto")),
        description ? React.createElement("p", null, description) : null);
}
function RbvHtmlPreviewObservationPage({ title, rows, visit, pageLabel }) {
    const cleanRows = rbvPreviewObservationRows(rows);
    if (!cleanRows.length) return null;
    return React.createElement(React.Fragment, null, cleanRows.map((row, index) => React.createElement("section", { key: title + '-' + index, className: "rbv-html-pdf-page rbv-html-observation-page" },
        React.createElement(RbvHtmlPreviewHeader, { title: title, subtitle: "Findings & Root Cause Analysis", visit: visit, page: `${pageLabel} ${index + 1}/${cleanRows.length}` }),
        React.createElement("div", { className: "rbv-html-observation-title" },
            React.createElement("span", null, "Temuan ", index + 1),
            row.deadline ? React.createElement("em", null, "Deadline: ", formatDate(row.deadline)) : null),
        React.createElement("div", { className: "rbv-html-observation-grid" },
            React.createElement(RbvHtmlPreviewRichBlock, { label: "Temuan", value: row.temuan }),
            React.createElement(RbvHtmlPreviewRichBlock, { label: "Kondisi Ideal", value: row.kondisiIdeal }),
            React.createElement(RbvHtmlPreviewRichBlock, { label: "Dampak", value: row.dampak }),
            React.createElement(RbvHtmlPreviewRichBlock, { label: "Penyebab", value: row.penyebab }),
            React.createElement(RbvHtmlPreviewRichBlock, { label: "Tindakan Aksi", value: row.tindakan }),
            React.createElement(RbvHtmlPreviewRichBlock, { label: "Hasil", value: row.hasil })))));
}
function RbvHtmlPreviewPhotoPages({ title, subtitle, photos, visit }) {
    const cleanPhotos = rbvPreviewPhotoItems(photos);
    if (!cleanPhotos.length) return null;
    const pages = rbvPreviewChunks(cleanPhotos, 4);
    return React.createElement(React.Fragment, null, pages.map((items, pageIndex) => React.createElement("section", { key: title + '-' + pageIndex, className: "rbv-html-pdf-page rbv-html-photo-page" },
        React.createElement(RbvHtmlPreviewHeader, { title: title, subtitle: subtitle, visit: visit, page: `Foto ${pageIndex + 1}/${pages.length}` }),
        React.createElement("div", { className: "rbv-html-photo-grid" }, items.map((photo, index) => React.createElement(RbvHtmlPreviewPhotoCard, { key: (photo.uploadedAt || '') + '-' + pageIndex + '-' + index, photo: photo, index: pageIndex * 4 + index })) )
    )));
}
function RbvHtmlReportPreview({ visit }) {
    const detail = getStoreWebDetail(visit?.store);
    const qscPhotos = rbvPreviewPhotoItems(normalizeQscPhotos(visit));
    const opiRows = rbvPreviewObservationRows(visit?.opiData);
    const qscRows = rbvPreviewObservationRows(visit?.qscData);
    const findingPhotos = rbvPreviewPhotoItems(visit?.findingEvidencePhotos);
    const correctivePhotos = rbvPreviewPhotoItems(visit?.correctiveActionPhotos);
    const pages = [];
    pages.push(React.createElement("section", { key: "cover", className: "rbv-html-pdf-page rbv-html-cover-page" },
        React.createElement("div", { className: "rbv-html-cover-accent" }),
        React.createElement("div", { className: "rbv-html-cover-content" },
            React.createElement("p", null, "REGIONAL BESTIE"),
            React.createElement("h2", null, "Visit Report"),
            React.createElement("h1", null, cleanText(visit?.store, 'Store belum dipilih')),
            React.createElement("div", { className: "rbv-html-cover-fields" },
                React.createElement(RbvHtmlPreviewField, { label: "Bestie", value: visit?.nama }),
                React.createElement(RbvHtmlPreviewField, { label: "Tanggal", value: formatDate(visit?.tanggal) }),
                React.createElement(RbvHtmlPreviewField, { label: "Kode Toko", value: detail.siteCode4 || detail.siteCode || detail.storeCode || visit?.storeCode || visit?.siteCode }),
                React.createElement(RbvHtmlPreviewField, { label: "Tipe Toko", value: detail.typeStore || detail.storeType || detail.type || visit?.typeStore }),
                React.createElement(RbvHtmlPreviewField, { label: "Store Head", value: detail.storeHead || detail.storeLeader || visit?.storeLeader }),
                React.createElement(RbvHtmlPreviewField, { label: "Area Manager", value: detail.areaManager || visit?.areaManager }),
                React.createElement(RbvHtmlPreviewField, { label: "Regional Manager", value: detail.regionalManager || visit?.regionalManager })
            )
        )
    ));
    pages.push(React.createElement("section", { key: "team", className: "rbv-html-pdf-page rbv-html-team-page" },
        React.createElement(RbvHtmlPreviewHeader, { title: "Store Team", subtitle: "PIC saat kunjungan", visit: visit, page: "Team" }),
        React.createElement("div", { className: "rbv-html-team-grid" },
            React.createElement(RbvHtmlPreviewField, { label: "Store Leader", value: [visit?.storeLeader, visit?.storeLeaderLevel].filter(Boolean).join(' / ') }),
            React.createElement(RbvHtmlPreviewField, { label: "Shift Leader", value: [visit?.shiftLeader, visit?.shiftLeaderLevel].filter(Boolean).join(' / ') })
        ),
        React.createElement("table", { className: "rbv-html-preview-table" },
            React.createElement("thead", null, React.createElement("tr", null,
                React.createElement("th", null, "No"),
                React.createElement("th", null, "Nama Crew"),
                React.createElement("th", null, "Level")
            )),
            React.createElement("tbody", null, (Array.isArray(visit?.crewList) && visit.crewList.length ? visit.crewList : [{ name: '', level: '' }]).map((crew, index) => React.createElement("tr", { key: index },
                React.createElement("td", null, index + 1),
                React.createElement("td", null, cleanText(crew.name, '-')),
                React.createElement("td", null, cleanText(crew.level, '-'))
            )))
        )
    ));
    if (qscPhotos.length) {
        pages.push(React.createElement("section", { key: "qsc-result", className: "rbv-html-pdf-page rbv-html-photo-page" },
            React.createElement(RbvHtmlPreviewHeader, { title: "QSC / Famitrack Result", subtitle: "Foto hasil QSC", visit: visit, page: "QSC" }),
            React.createElement("div", { className: "rbv-html-photo-grid two" }, qscPhotos.map((photo, index) => React.createElement(RbvHtmlPreviewPhotoCard, { key: index, photo: photo, index: index })))
        ));
    }
    const opiPages = React.createElement(RbvHtmlPreviewObservationPage, { title: "OPI Project Observation", rows: opiRows, visit: visit, pageLabel: "OPI" });
    const qscPages = React.createElement(RbvHtmlPreviewObservationPage, { title: "QSC Observation", rows: qscRows, visit: visit, pageLabel: "QSC" });
    const findingPages = React.createElement(RbvHtmlPreviewPhotoPages, { title: "Finding Evidence", subtitle: "of OPI & QSC Observation", photos: findingPhotos, visit: visit });
    const correctivePages = React.createElement(RbvHtmlPreviewPhotoPages, { title: "Corrective Action Evidence & Result", subtitle: "by Regional Bestie", photos: correctivePhotos, visit: visit });
    pages.push(opiPages, qscPages, findingPages, correctivePages);
    if (!opiRows.length && !qscRows.length && !qscPhotos.length && !findingPhotos.length && !correctivePhotos.length) {
        pages.push(React.createElement("section", { key: "empty", className: "rbv-html-pdf-page rbv-html-empty-page" },
            React.createElement(RbvHtmlPreviewHeader, { title: "Report Content", subtitle: "Belum ada detail tambahan", visit: visit, page: "Draft" }),
            React.createElement("div", { className: "rbv-html-empty-message" }, "Isi data observasi dan evidence untuk melihat preview report.")
        ));
    }
    return React.createElement("div", { className: "rbv-html-preview-stage", "aria-label": "Preview report" }, pages);
}
function PreviewPage({ visit, update, onBack }) {
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
            setPdfBlob(null);
            setPdfUrl('');
            setStatus('Menyiapkan preview PDF final...');
            try {
                await ensurePdfEngineReady();
                if (!window.ReportVisitPDF?.createBlob)
                    throw new Error('Mesin PDF belum siap. Refresh halaman lalu coba lagi.');
                const snapshot = await rbvPrepareVisitForPdf(visit, { forceAllSections: true });
                if (cancelled)
                    return;
                setStatus('Membuat preview identik dengan PDF...');
                const blob = await window.ReportVisitPDF.createBlob(snapshot);
                if (cancelled)
                    return;
                objectUrl = URL.createObjectURL(blob);
                setPdfBlob(blob);
                setPdfUrl(objectUrl);
                setStatus('Preview PDF final siap.');
            }
            catch (error) {
                setPdfBlob(null);
                setPdfUrl('');
                setStatus(error?.message || 'Preview PDF gagal dibuat.');
            }
        }
        render();
        return () => {
            cancelled = true;
            if (objectUrl)
                URL.revokeObjectURL(objectUrl);
        };
    }, [visit]);
    useEffect(() => {
        if (!emailOpen)
            setEmailForm(buildInitialEmailForm(visit));
    }, [visit, emailOpen]);
    useEffect(() => {
        const config = getEmailReportConfig();
        startPersistentEmailScheduler(config.endpoint);
        processScheduledReportEmailQueue(config.endpoint, { quiet: true });
    }, []);
    async function handleDownloadPdf() {
        if (!visit || busy || downloadBusy)
            return;
        setBusy(true);
        setDownloadBusy(true);
        setDownloadMessage('Menyiapkan PDF...');
        try {
            await new Promise((resolve) => window.setTimeout(resolve, 80));
            await ensurePdfEngineReady();
            if (!window.ReportVisitPDF?.createBlob)
                throw new Error('Mesin PDF belum siap. Refresh halaman lalu coba lagi.');
            const pdfVisit = await rbvPrepareVisitForPdf(visit, { forceAllSections: true });
            const blob = await window.ReportVisitPDF.createBlob(pdfVisit);
            const fileName = window.ReportVisitPDF.buildFileName ? window.ReportVisitPDF.buildFileName(pdfVisit) : 'Regional_Bestie_Visit_Report.pdf';
            setDownloadMessage('Pilih lokasi simpan...');
            const didSave = await downloadBlobManaged(blob, fileName);
            setDownloadMessage(didSave ? 'PDF tersimpan.' : 'Download dibatalkan.');
            if (didSave && update) {
                update({ isPdfDownloaded: true });
            }
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
        return; try { await ensureCaExportReady(); } catch (error) { console.warn('Export Excel lazy-load gagal:', error); } if (!window.__caAssignmentExport?.buildWorkbook) {
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
                setEmailStatus('Menyiapkan foto untuk PDF...');
                const { blob, fileName, optimized } = await buildPdfAttachmentForEmail(visit, null);
                if (optimized)
                    attachmentNotes.push('PDF dikompres agar attachment stabil dan foto tetap ikut terkirim.');
                if (blob.size <= EMAIL_PDF_SAFE_BYTES) {
                    attachments.push({ filename: fileName, mimeType: 'application/pdf', dataBase64: await blobToBase64Payload(blob) });
                }
                else {
                    throw new Error(`PDF Report terlalu besar (${formatFileSize(blob.size)}) sehingga email dibatalkan. Coba kurangi jumlah foto atau download PDF manual.`);
                }
            }
            if (emailForm.attachExcel) {
                setEmailStatus('Menyiapkan Excel CA Assignment...');
                await ensureCaExportReady();
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
            if (emailForm.attachPdf && !payload.attachments.some((item) => String(item.mimeType || '').toLowerCase().includes('pdf'))) {
                throw new Error('PDF attachment wajib ada. Email dibatalkan supaya tidak terkirim tanpa PDF.');
            }
            if (scheduleMinutes) {
                setEmailStatus(`Email dijadwalkan ${scheduleMinutes} menit ke depan...`);
                scheduleReportEmailJob(config.endpoint, payload, scheduleMinutes * 60 * 1000);
                setEmailStatus(fitted.skipped.length ? `Email dijadwalkan ${scheduleMinutes} menit. Beberapa attachment dilepas karena ukuran terlalu besar.` : `Email berhasil dijadwalkan ${scheduleMinutes} menit ke depan.`);
                window.dispatchEvent(new CustomEvent('rbv-email-feedback-popup', { detail: { icon: 'history', title: 'Email dijadwalkan', message: `Email akan dikirim sesuai waktu yang dipilih (${scheduleMinutes} menit).` } }));
                return;
            }
            setEmailStatus(mode === 'send' ? 'Mengirim email...' : 'Membuat draft email...');
            let sendSkipped = [...fitted.skipped];
            try {
                await postReportEmailPayload(config.endpoint, payload);
            }
            catch (sendError) {
                const hasPdf = payload.attachments.some((item) => String(item.mimeType || '').toLowerCase().includes('pdf'));
                const hasExcel = payload.attachments.some((item) => String(item.mimeType || '').toLowerCase().includes('sheet'));
                if (hasPdf && hasExcel && isRetryableEmailAttachmentError(sendError)) {
                    setEmailStatus('Server email menolak lampiran penuh. Mencoba kirim ulang PDF saja...');
                    const pdfOnlyPayload = keepOnlyPdfAttachments(payload);
                    if (!pdfOnlyPayload.attachments.length)
                        throw sendError;
                    sendSkipped.push('Excel dilepas otomatis karena server email menolak ukuran/lampiran penuh. PDF tetap dikirim.');
                    await postReportEmailPayload(config.endpoint, pdfOnlyPayload);
                }
                else {
                    throw sendError;
                }
            }
            const successMessage = mode === 'send' ? (sendSkipped.length ? 'Email berhasil dikirim. Beberapa attachment dilepas karena ukuran terlalu besar.' : 'Email berhasil dikirim.') : (sendSkipped.length ? 'Draft sudah disimpan diemail, Buka menu draft pada Gmail untuk mengeceknya. Beberapa attachment dilepas karena ukuran terlalu besar.' : 'Draft sudah disimpan diemail, Buka menu draft pada Gmail untuk mengeceknya.');
            setEmailStatus(successMessage);
            if (update && mode === 'send') {
                update({ isEmailSent: true });
            }
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
    return (React.createElement("main", { className: "preview-page w-full px-4 pt-1 pb-6 md:px-8 md:pt-4 md:pb-8" },
        downloadBusy ? React.createElement("div", { className: "download-pdf-overlay", role: "status", "aria-live": "polite" },
            React.createElement("div", { className: "download-pdf-loader" },
                React.createElement("span", { className: "download-pdf-spinner", "aria-hidden": "true" }),
                React.createElement("strong", null, downloadMessage || 'Menyiapkan PDF...'),
                React.createElement("p", null, "Jangan tutup halaman sampai file manager muncul."))) : null,
        React.createElement(EmailReportModal, { open: emailOpen, form: emailForm, onChange: (patch) => setEmailForm((state) => ({ ...state, ...patch })), onClose: () => setEmailOpen(false), onSubmit: handleSendReportEmail, busy: emailBusy, status: emailStatus, visit: visit }),
        React.createElement("div", { className: "preview-header mb-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-end sticky top-0 z-40 bg-slate-50 pt-2 pb-3 -mx-4 px-4 sm:static sm:bg-transparent sm:pt-0 sm:pb-0 sm:mx-0 sm:px-0" },
            React.createElement("div", { className: "flex items-center gap-4 sm:block" },
                React.createElement("button", { 
                    onClick: onBack, 
                    className: "sm:hidden w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-200 active:scale-95 text-slate-600 flex-shrink-0" 
                },
                    React.createElement(Icon, { name: "left", className: "w-5 h-5" })
                ),
                React.createElement("div", { className: "flex-1 min-w-0" },
                    React.createElement("p", { className: "text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary truncate" }, "Preview PDF"),
                    React.createElement("h1", { className: "mt-0.5 sm:mt-1 text-xl sm:text-2xl font-black tracking-tight text-slate-950 md:text-3xl truncate" }, "Review Report")
                )
            ),
            React.createElement("div", { className: "preview-progress-card rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-900 ring-1 ring-emerald-100" },
                React.createElement("div", { className: "mb-2 flex items-center justify-between gap-3" },
                    React.createElement("p", { className: "text-xs font-bold uppercase tracking-wide" }, "Progress"),
                    React.createElement("p", { className: "text-sm font-black" },
                        visitProgress(visit),
                        "%")),
                React.createElement(ProgressBar, { value: visitProgress(visit) }),
                React.createElement(ProgressMissingInfo, { visit: visit, maxItems: 4, compact: true }))),
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

let RB_FIREBASE_DB = null;
async function getConvexRealtimeClient() {
    const config = getConvexConfig();
    if (!config.enabled) return null;
    
    if (RB_FIREBASE_DB) return RB_FIREBASE_DB;
    
    // Wait for CDN scripts if not ready, with automatic script injection fallback
    if (!window.firebase) {
        await new Promise(r => setTimeout(r, 350));
        if (!window.firebase) {
            try {
                const loadScript = (src) => new Promise((resolve, reject) => {
                    const s = document.createElement('script');
                    s.src = src;
                    s.onload = resolve;
                    s.onerror = reject;
                    document.head.appendChild(s);
                });
                await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
                await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js');
            } catch (e) {
                console.warn('Dynamic Firebase SDK load failed:', e);
            }
        }
        if (!window.firebase) return null;
    }
    
    if (!firebase.apps.length) {
        firebase.initializeApp(config.firebaseConfig);
    }
    
    RB_FIREBASE_DB = firebase.firestore();
    try {
        RB_FIREBASE_DB.enablePersistence({ synchronizeTabs: true }).catch((err) => {
            console.warn('Firestore offline persistence warn:', err);
        });
    } catch (e) {}
    return RB_FIREBASE_DB;
}
async function runConvexQuery(functionName, args = {}) {
    const db = await getConvexRealtimeClient();
    if (!db || !functionName) return null;
    
    const cols = getConvexConfig().collections;
    try {
        if (functionName.includes('deviceBackups:getLatest')) {
            const doc = await db.collection(cols.deviceBackups).doc(args.backupKey).get();
            return doc.exists ? doc.data() : null;
        } else if (functionName.includes('appSettings:listConfigs') || functionName.includes('listConfigs')) {
            let query = db.collection(cols.appSettings);
            const snapshot = await query.get();
            let rows = snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
            if (args && args.keys && args.keys.length > 0) {
                rows = rows.filter(r => args.keys.includes(r.key));
            }
            return rows;
        } else if (functionName.includes('listVisits') || functionName.includes('monitor:listVisits')) {
            const snapshot = await db.collection(cols.visits).get();
            let rows = snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
            rows.sort((a, b) => (b.updatedAt || b.updated_at || b.last_visit_at || b.visit_date || 0) - (a.updatedAt || a.updated_at || a.last_visit_at || a.visit_date || 0));
            return args && args.limit ? rows.slice(0, args.limit) : rows;
        } else if (functionName.includes('listAllFindings') || functionName.includes('findings')) {
            const snapshot = await db.collection(cols.findings).get();
            let rows = snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
            rows.sort((a, b) => (b.updatedAt || b.updated_at || b.created_at || 0) - (a.updatedAt || a.updated_at || a.created_at || 0));
            return args && args.limit ? rows.slice(0, args.limit) : rows;
        } else if (functionName.includes('listPresence') || functionName.includes('presence')) {
            const snapshot = await db.collection(cols.presence).get();
            let rows = snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
            rows.sort((a, b) => (b.updatedAt || b.updated_at || b.last_seen || 0) - (a.updatedAt || a.updated_at || a.last_seen || 0));
            return rows.slice(0, 100);
        } else if (functionName.includes('listManualStoreRequests') || functionName.includes('manualRequests')) {
            const snapshot = await db.collection(cols.manualRequests).get();
            let rows = snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
            rows.sort((a, b) => (b.updatedAt || b.updated_at || b.created_at || 0) - (a.updatedAt || a.updated_at || a.created_at || 0));
            return rows.slice(0, args?.limit || 200);
        } else if (functionName.includes('masterStores:listStores') || functionName.includes('listStores')) {
            let query = db.collection(cols.masterStores);
            if (args && args.limit) query = query.limit(args.limit);
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
        }
    } catch(err) { rememberRemoteSyncError(err, 'Firebase Firestore query'); console.error('Firestore Query Error:', err); return null; }
}
async function runConvexMutation(functionName, args = {}) {
    const db = await getConvexRealtimeClient();
    if (!db || !functionName) return null;
    
    const cols = getConvexConfig().collections;
    try {
        if (functionName.includes('upsertVisit')) {
            const p = args.payload || args.visit || args;
            const docRef = db.collection(cols.visits).doc(p.id || p.visit_key || Date.now().toString());
            await docRef.set({ ...p, _id: docRef.id }, { merge: true });
            return { ok: true };
        }
        if (functionName.includes('upsertFindings')) {
            const p = args.payload || args.findings || args;
            const docRef = db.collection(cols.findings).doc(p.visit_key || Date.now().toString());
            await docRef.set({ ...p, _id: docRef.id }, { merge: true });
            return { ok: true };
        }
        if (functionName.includes('upsertManualStoreRequest')) {
            const p = args.payload || args.request || args;
            const docRef = db.collection(cols.manualRequests).doc(p.id || p.req_key || Date.now().toString());
            await docRef.set({ ...p, _id: docRef.id }, { merge: true });
            return { ok: true };
        }
        if (functionName.includes('upsertPresence')) {
            const p = args.payload || args.presence || args;
            const docRef = db.collection(cols.presence).doc(p.id || p.user_id || Date.now().toString());
            await docRef.set({ ...p, _id: docRef.id }, { merge: true });
            return { ok: true };
        }
        if (functionName.includes('appSettings:setConfig')) {
            const docRef = db.collection(cols.appSettings).doc(args.key);
            await docRef.set({ key: args.key, payload: args.payload, updatedAt: Date.now(), updatedBy: args.updatedBy || 'web', _id: docRef.id }, { merge: true });
            return { ok: true };
        }
        if (functionName.includes('deviceBackups:setLatest')) {
            const p = args.payload || args;
            const docRef = db.collection(cols.deviceBackups).doc(args.backupKey);
            await docRef.set({ ...p, updatedAt: Date.now(), _id: docRef.id }, { merge: true });
            return { ok: true };
        }
        if (functionName.includes('masterStores:upsertMany')) {
            const stores = args.stores || args.payload || (Array.isArray(args) ? args : []);
            const batch = db.batch();
            stores.forEach(st => {
                const docRef = db.collection(cols.masterStores).doc(st.code);
                batch.set(docRef, { ...st, _id: docRef.id }, { merge: true });
            });
            await batch.commit();
            return { ok: true };
        }
    } catch(err) { rememberRemoteSyncError(err, 'Firebase Firestore mutation'); console.error('Firestore Mutation Error:', err); return null; }
}
async function subscribeConvexQuery(functionName, args, onData, onError) {
    const db = await getConvexRealtimeClient();
    if (!db || !functionName) return () => {};
    
    const cols = getConvexConfig().collections;
    let query;
    try {
        if (functionName.includes('listVisits')) {
            query = db.collection(cols.visits);
        } else if (functionName.includes('listAllFindings')) {
            query = db.collection(cols.findings);
        } else if (functionName.includes('listManualStoreRequests')) {
            query = db.collection(cols.manualRequests);
        } else if (functionName.includes('listPresence')) {
            query = db.collection(cols.presence);
        } else if (functionName.includes('appSettings:listConfigs') || functionName.includes('listConfigs')) {
            query = db.collection(cols.appSettings);
        } else if (functionName.includes('masterStores:listStores')) {
            query = db.collection(cols.masterStores);
        }
        
        if (!query) {
            if (onData) onData([]);
            return () => {};
        }
        
        const unsubscribe = query.onSnapshot((snapshot) => {
            let docs = snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
            if ((functionName.includes('appSettings:listConfigs') || functionName.includes('listConfigs')) && args && args.keys && args.keys.length > 0) {
                docs = docs.filter(r => args.keys.includes(r.key));
            }
            if (functionName.includes('listVisits')) {
                docs.sort((a, b) => (b.updatedAt || b.updated_at || b.last_visit_at || b.visit_date || 0) - (a.updatedAt || a.updated_at || a.last_visit_at || a.visit_date || 0));
                if (args && args.limit && docs.length > args.limit) docs = docs.slice(0, args.limit);
            } else if (functionName.includes('listAllFindings')) {
                docs.sort((a, b) => (b.updatedAt || b.updated_at || b.created_at || 0) - (a.updatedAt || a.updated_at || a.created_at || 0));
                if (args && args.limit && docs.length > args.limit) docs = docs.slice(0, args.limit);
            } else if (functionName.includes('listPresence')) {
                docs.sort((a, b) => (b.updatedAt || b.updated_at || b.last_seen || 0) - (a.updatedAt || a.updated_at || a.last_seen || 0));
                if (docs.length > 100) docs = docs.slice(0, 100);
            } else if (functionName.includes('listManualStoreRequests')) {
                docs.sort((a, b) => (b.updatedAt || b.updated_at || b.created_at || 0) - (a.updatedAt || a.updated_at || a.created_at || 0));
                if (docs.length > (args?.limit || 200)) docs = docs.slice(0, args?.limit || 200);
            }
            if (onData) onData(docs);
        }, (err) => {
            rememberRemoteSyncError(err, 'Firebase Firestore realtime');
            console.error('Firestore Sub Error:', err);
            if (onError) onError(err);
        });
        
        return () => unsubscribe();
    } catch(err) {
        console.error('Firestore Sub Setup Error:', err);
        if (onData) onData([]);
        return () => {};
    }
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
        session_id: row.session_id || row.sessionId || '-',
        qsc_score: row.qsc_score || row.qscScore || 0,
        opi_score: row.opi_score || row.opiScore || 0,
        is_pdf_downloaded: !!(row.is_pdf_downloaded || row.isPdfDownloaded),
        is_email_sent: !!(row.is_email_sent || row.isEmailSent),
        email_feedback_time: row.email_feedback_time || row.emailFeedbackTime || 0
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
        const payload = await cloudflareRequest('listAppSettings', { params: { keys: [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice, APP_CONFIG_KEYS.emailTemplate, APP_CONFIG_KEYS.webSync, APP_CONFIG_KEYS.schedule, APP_CONFIG_KEYS.features].join(',') } });
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
    if (convexEnabled())
        return 'Convex';
    if (netlifyEnabled())
        return 'Netlify';
    if (supabaseEnabled())
        return 'Supabase';
    if (cloudflareEnabled())
        return 'Cloudflare D1 legacy';
    return 'remote database';
}
async function fetchMasterStoresFromConvex() {
    clearRemoteSyncError();
    if (!convexEnabled())
        return null;
    try {
        const config = getConvexConfig();
        const queryName = config.masterStoreListQuery || 'masterStores:listStores';
        const rows = await runConvexQuery(queryName, { limit: 5000 });
        if (rows !== null)
            return normalizeMasterStoreRows(rows?.rows || rows?.data || rows);
    }
    catch (error) {
        setRemoteSyncError(error?.message || 'Convex master store query gagal.');
        console.warn('Convex master store query gagal:', error);
    }
    return null;
}
async function syncMasterStoresToConvex(rows, options = {}) {
    clearRemoteSyncError();
    const normalized = normalizeMasterStoreRows(rows);
    if (!normalized.length)
        return false;
    if (!convexEnabled()) {
        setRemoteSyncError('Convex belum aktif. Isi deploymentUrl di convex-config.js.');
        return false;
    }
    const config = getConvexConfig();
    try {
        if (options.replace !== false) {
            const mutationName = config.masterStoreReplaceMutation || 'masterStores:replaceStores';
            const result = await runConvexMutation(mutationName, { stores: normalized, updatedBy: SESSION_ID });
            if (result !== null)
                return true;
        }
    }
    catch (error) {
        console.warn('Convex replace master store gagal, coba upsertMany:', error);
    }
    try {
        const mutationName = config.masterStoreUpsertManyMutation || 'masterStores:upsertMany';
        for (let index = 0; index < normalized.length; index += 200) {
            const chunk = normalized.slice(index, index + 200);
            await runConvexMutation(mutationName, { stores: chunk, updatedBy: SESSION_ID });
        }
        return true;
    }
    catch (error) {
        setRemoteSyncError(error?.message || 'Convex master store sync gagal.');
        console.warn('Convex master store sync gagal:', error);
        return false;
    }
}
function remoteSaveSuccessText(label) {
    return `${label} berhasil disimpan dan disinkronkan ke ${remoteSyncLabel()}.`;
}
function remoteSaveFailText(label) {
    const detail = LAST_REMOTE_SYNC_ERROR ? ` Detail: ${LAST_REMOTE_SYNC_ERROR}` : '';
    return `${label} tersimpan lokal, tapi belum berhasil sync ke ${remoteSyncLabel()}.${detail} Cek convex-config.js lalu buka ulang dengan ?v=206.`;
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
        const payload = await netlifyRequest('listAppSettings', { params: { keys: [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice, APP_CONFIG_KEYS.emailTemplate, APP_CONFIG_KEYS.webSync, APP_CONFIG_KEYS.schedule, APP_CONFIG_KEYS.features].join(',') } });
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
            .in('config_key', [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice, APP_CONFIG_KEYS.emailTemplate, APP_CONFIG_KEYS.webSync, APP_CONFIG_KEYS.schedule, APP_CONFIG_KEYS.features]);
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
function hasMeaningfulData(visit) {
    if (!visit) return false;
    const hasOpi = Array.isArray(visit.opiData) && visit.opiData.some(isMeaningfulObservation);
    const hasQsc = Array.isArray(visit.qscData) && visit.qscData.some(isMeaningfulObservation);
    const hasStoreLeader = Boolean(cleanText(visit.storeLeader));
    const hasShiftLeader = Boolean(cleanText(visit.shiftLeader));
    const hasPhotos = Array.isArray(visit.findingEvidencePhotos) && visit.findingEvidencePhotos.length > 0;
    return hasOpi || hasQsc || hasStoreLeader || hasShiftLeader || hasPhotos;
}
function buildVisitKey(visit) {
    if (!visit) return 'unknown-visit';
    if (visit.id && String(visit.id).trim() !== '') return String(visit.id).trim();
    if (visit.visit_key && String(visit.visit_key).trim() !== '') return String(visit.visit_key).trim();
    const b = cleanText(visit.nama || visit.bestieName || visit.bestie_name, 'bestie');
    const s = cleanText(visit.store || visit.storeName || visit.store_name, 'store');
    const d = cleanText(visit.tanggal || visit.visitDate || visit.visit_date, 'date');
    return `${b}-${s}-${d}`.replace(/[^a-zA-Z0-9_-]/g, '_');
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
        user_agent: navigator.userAgent,
        has_meaningful_data: hasMeaningfulData(visit),
        progress: visitProgress(visit) || 0,
        qsc_score: visit.qscScore || 0,
        opi_score: visit.opiScore || 0,
        is_pdf_downloaded: !!visit.isPdfDownloaded,
        is_email_sent: !!visit.isEmailSent,
        email_feedback_time: visit.emailFeedbackTime || 0
    };
}
async function upsertMonitorVisit(visit) {
    const config = getConvexConfig();
    if (convexEnabled() && visit && cleanText(visit.nama) && cleanText(visit.store)) {
        const payload = monitorPayloadFromVisit(visit);
        try {
            const mutationName = config.upsertMutation || 'monitor:upsertVisit';
            const result = await runConvexMutation(mutationName, { payload });
            if (result !== null)
                return;
        }
        catch (error) {
            rememberRemoteSyncError(error, 'Convex monitor mutation');
            console.warn('Convex realtime mutation gagal, fallback HTTP:', error);
        }
        const endpoint = convexUrl(config.upsertPath || 'monitor/upsertVisit');
        if (endpoint) {
            try {
                await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}) },
                    body: JSON.stringify(payload)
                });
                return;
            }
            catch (error) {
                rememberRemoteSyncError(error, 'Convex monitor HTTP');
                console.warn('Convex upsert gagal:', error);
            }
        }
    }
    if (await upsertMonitorVisitToNetlify(visit))
        return;
    if (await upsertMonitorVisitToSupabase(visit))
        return;
    await upsertMonitorVisitToCloudflare(visit);
}
const _findingsSyncThrottle = new Map();
async function syncFindingsToConvex(visit) {
    if (!convexEnabled() || !visit) return;
    const vk = buildVisitKey(visit);
    const now = Date.now();
    const lastSync = _findingsSyncThrottle.get(vk) || 0;
    if (now - lastSync < 30000) return; // throttle 30s per visit
    _findingsSyncThrottle.set(vk, now);
    try {
        const findings = [];
        if (Array.isArray(visit.opiData)) {
            visit.opiData.forEach(row => {
                if (isMeaningfulObservation(row)) {
                    findings.push({
                        type: 'opi',
                        temuan: cleanText(row.temuan),
                        kondisiIdeal: cleanText(row.kondisiIdeal),
                        dampak: cleanText(row.dampak),
                        penyebab: cleanText(row.penyebab),
                        tindakan: cleanText(row.tindakan),
                        hasil: cleanText(row.hasil)
                    });
                }
            });
        }
        if (Array.isArray(visit.qscData)) {
            visit.qscData.forEach(row => {
                if (isMeaningfulObservation(row)) {
                    findings.push({
                        type: 'qsc',
                        temuan: cleanText(row.temuan),
                        kondisiIdeal: cleanText(row.kondisiIdeal),
                        dampak: cleanText(row.dampak),
                        penyebab: cleanText(row.penyebab),
                        tindakan: cleanText(row.tindakan),
                        hasil: cleanText(row.hasil)
                    });
                }
            });
        }
        if (findings.length === 0) return;
        await runConvexMutation('monitor:upsertFindings', {
            payload: {
                visit_key: vk,
                bestie_name: cleanText(visit.nama, '-'),
                store_name: cleanText(visit.store, '-'),
                visit_date: visit.tanggal || new Date().toISOString().slice(0, 10),
                findings
            }
        });
    } catch (err) {
        console.warn('Background findings sync error (silent):', err);
    }
}
let _backfillRunning = false;
async function backfillLocalFindingsToConvex() {
    const BACKFILL_FLAG = 'rbv_findings_backfill_v2';
    if (_backfillRunning || localStorage.getItem(BACKFILL_FLAG)) return;
    if (!convexEnabled()) return;
    _backfillRunning = true;
    try {
        const allVisits = await getAllVisitRecordsForBackup();
        if (!allVisits || allVisits.length === 0) { _backfillRunning = false; return; }
        let synced = 0;
        for (const visit of allVisits) {
            if (!visit || !visit.nama || !visit.store) continue;
            const hasFindings = (Array.isArray(visit.opiData) && visit.opiData.some(isMeaningfulObservation)) ||
                                (Array.isArray(visit.qscData) && visit.qscData.some(isMeaningfulObservation));
            if (!hasFindings) continue;
            const vk = buildVisitKey(visit);
            const findings = [];
            if (Array.isArray(visit.opiData)) {
                visit.opiData.forEach(row => {
                    if (isMeaningfulObservation(row)) {
                        const temuan = cleanText(row.temuan || row.finding || row.observation || row.description || '');
                        if (temuan) findings.push({ type: 'opi', temuan, kondisiIdeal: cleanText(row.kondisiIdeal), dampak: cleanText(row.dampak), penyebab: cleanText(row.penyebab), tindakan: cleanText(row.tindakan), hasil: cleanText(row.hasil) });
                    }
                });
            }
            if (Array.isArray(visit.qscData)) {
                visit.qscData.forEach(row => {
                    if (isMeaningfulObservation(row)) {
                        const temuan = cleanText(row.temuan || row.finding || row.observation || row.description || '');
                        if (temuan) findings.push({ type: 'qsc', temuan, kondisiIdeal: cleanText(row.kondisiIdeal), dampak: cleanText(row.dampak), penyebab: cleanText(row.penyebab), tindakan: cleanText(row.tindakan), hasil: cleanText(row.hasil) });
                    }
                });
            }

            if (findings.length === 0) continue;
            try {
                await runConvexMutation('monitor:upsertFindings', {
                    payload: {
                        visit_key: vk,
                        bestie_name: cleanText(visit.nama, '-'),
                        store_name: cleanText(visit.store, '-'),
                        visit_date: visit.tanggal || '',
                        findings
                    }
                });
                synced++;
                // Small delay between upserts to avoid overwhelming Convex
                if (synced % 5 === 0) await new Promise(r => setTimeout(r, 300));
            } catch (e) {
                console.warn('Backfill upsert skip:', e);
            }
        }
        localStorage.setItem(BACKFILL_FLAG, String(Date.now()));
        console.log(`[Backfill] Synced ${synced} visits findings to Convex`);
    } catch (err) {
        console.warn('Backfill findings error (silent):', err);
    } finally {
        _backfillRunning = false;
    }
}
async function upsertPresence(payload) {
    if (!payload)
        return;
    persistPresenceLocal(payload);
    const config = getConvexConfig();
    if (convexEnabled()) {
        try {
            await runConvexMutation(config.presenceUpsertMutation || 'monitor:upsertPresence', { payload });
            return;
        }
        catch (error) {
            rememberRemoteSyncError(error, 'Convex presence sync');
            console.warn('Convex presence sync gagal:', error);
        }
    }
    if (await upsertPresenceToNetlify(payload))
        return;
    if (await upsertPresenceToSupabase(payload))
        return;
    await upsertPresenceToCloudflare(payload);
}
async function fetchPresenceRowsFromConvex() {
    const config = getConvexConfig();
    if (convexEnabled()) {
        try {
            const queryName = config.presenceQuery || 'monitor:listPresence';
            const rows = await runConvexQuery(queryName, {});
            if (rows !== null)
                return normalizePresenceRows(rows);
        }
        catch (error) {
            rememberRemoteSyncError(error, 'Convex presence query');
            console.warn('Convex presence query gagal:', error);
        }
    }
    const netlifyRows = await fetchPresenceRowsFromNetlify();
    if (netlifyRows !== null)
        return netlifyRows;
    const supabaseRows = await fetchPresenceRowsFromSupabase();
    if (supabaseRows !== null)
        return supabaseRows;
    const cloudflareRows = await fetchPresenceRowsFromCloudflare();
    if (cloudflareRows !== null)
        return cloudflareRows;
    return readLocalPresenceRows();
}
async function fetchMonitorRowsFromConvex() {
    const config = getConvexConfig();
    if (convexEnabled()) {
        try {
            const queryName = config.monitorQuery || 'monitor:listVisits';
            const rows = await runConvexQuery(queryName, {});
            if (rows !== null)
                return normalizeMonitorRows(rows);
        }
        catch (error) {
            rememberRemoteSyncError(error, 'Convex monitor query');
            console.warn('Convex realtime query gagal, fallback HTTP:', error);
        }
        const endpoint = convexUrl(config.listPath || 'monitor/listVisits');
        if (endpoint) {
            try {
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: { ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}) }
                });
                if (response.ok) {
                    const payload = await response.json();
                    return normalizeMonitorRows(payload);
                }
            }
            catch (error) {
                rememberRemoteSyncError(error, 'Convex monitor HTTP');
                console.warn('Convex monitor HTTP fallback gagal:', error);
            }
        }
    }
    const netlifyRows = await fetchMonitorRowsFromNetlify();
    if (netlifyRows !== null)
        return netlifyRows;
    const supabaseRows = await fetchMonitorRowsFromSupabase();
    if (supabaseRows !== null)
        return supabaseRows;
    const cloudflareRows = await fetchMonitorRowsFromCloudflare();
    if (cloudflareRows !== null)
        return cloudflareRows;
    return null;
}
async function fetchManualRequestsFromConvex() {
    const config = getConvexConfig();
    if (convexEnabled()) {
        try {
            const queryName = config.manualRequestsQuery || 'monitor:listManualStoreRequests';
            const rows = await runConvexQuery(queryName, {});
            if (rows !== null)
                return persistManualRequestsFromRemote(rows);
        }
        catch (error) {
            rememberRemoteSyncError(error, 'Convex manual request query');
            console.warn('Convex manual request query gagal, fallback HTTP:', error);
        }
        const endpoint = convexUrl(config.listManualRequestsPath || 'monitor/listManualStoreRequests');
        if (endpoint) {
            try {
                const response = await fetch(endpoint, {
                    method: 'GET',
                    headers: { ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}) }
                });
                if (response.ok) {
                    const payload = await response.json();
                    return persistManualRequestsFromRemote(payload);
                }
            }
            catch (error) {
                rememberRemoteSyncError(error, 'Convex manual request HTTP');
                console.warn('HTTP request toko gagal:', error);
            }
        }
    }
    const netlifyRows = await fetchManualRequestsFromNetlify();
    if (netlifyRows !== null)
        return netlifyRows;
    const supabaseRows = await fetchManualRequestsFromSupabase();
    if (supabaseRows !== null)
        return supabaseRows;
    const cloudflareRows = await fetchManualRequestsFromCloudflare();
    if (cloudflareRows !== null)
        return cloudflareRows;
    return null;
}
async function syncManualRequestToConvex(request) {
    if (!request)
        return;
    const config = getConvexConfig();
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
    if (convexEnabled()) {
        try {
            const result = await runConvexMutation(config.upsertManualRequestMutation || 'monitor:upsertManualStoreRequest', { payload });
            if (result !== null)
                return;
        }
        catch (error) {
            rememberRemoteSyncError(error, 'Convex request toko mutation');
            console.warn('Convex request toko gagal, fallback HTTP:', error);
        }
        const endpoint = convexUrl(config.upsertManualRequestPath || 'monitor/upsertManualStoreRequest');
        if (endpoint) {
            try {
                await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}) },
                    body: JSON.stringify(payload)
                });
                return;
            }
            catch (error) {
                rememberRemoteSyncError(error, 'Convex request toko HTTP');
                console.warn('HTTP request toko gagal:', error);
            }
        }
    }
    if (await syncManualRequestToNetlify(request))
        return;
    if (await syncManualRequestToSupabase(request))
        return;
    await syncManualRequestToCloudflare(request);
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
async function applySilentWebSyncSignal(payload) {
    const signal = payload && typeof payload === 'object' ? payload : {};
    const key = cleanText(signal.signalId || signal.sentAt || signal.version);
    if (!key)
        return;
    if (localStorage.getItem(RBV_WEB_SYNC_SIGNAL_KEY) === key)
        return;
    localStorage.setItem(RBV_WEB_SYNC_SIGNAL_KEY, key);
    try {
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.filter((cacheKey) => cacheKey.startsWith('bestie-visit-')).map((cacheKey) => caches.delete(cacheKey)));
        }
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
        console.warn('Silent web sync gagal:', error);
    }
    window.dispatchEvent(new CustomEvent('rbv-silent-web-sync', { detail: signal }));
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
        if (row.key === APP_CONFIG_KEYS.webSync)
            applySilentWebSyncSignal(row.payload);
        if (row.key === APP_CONFIG_KEYS.features) {
            localStorage.setItem('rbv_features_config_v1', JSON.stringify(row.payload));
            window.dispatchEvent(new Event('rbv-features-config-change'));
        }
        if (row.key === APP_CONFIG_KEYS.schedule) {
            saveScheduleConfig(Array.isArray(row.payload) ? row.payload : []);
        }
    });
    return normalized;
}
async function fetchAppConfigsFromConvex() {
    const config = getConvexConfig();
    if (convexEnabled()) {
        try {
            const queryName = config.appConfigListQuery || 'appSettings:listConfigs';
            const rows = await runConvexQuery(queryName, { keys: [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice, APP_CONFIG_KEYS.emailTemplate, APP_CONFIG_KEYS.webSync, APP_CONFIG_KEYS.schedule, APP_CONFIG_KEYS.features] });
            if (rows !== null)
                return normalizeRemoteAppConfigRows(rows);
        }
        catch (error) {
            rememberRemoteSyncError(error, 'Convex app config query');
            console.warn('Convex app config query gagal:', error);
        }
    }
    const netlifyRows = await fetchAppConfigsFromNetlify();
    if (netlifyRows !== null)
        return netlifyRows;
    const supabaseRows = await fetchAppConfigsFromSupabase();
    if (supabaseRows !== null)
        return supabaseRows;
    const cloudflareRows = await fetchAppConfigsFromCloudflare();
    if (cloudflareRows !== null)
        return cloudflareRows;
    return null;
}
async function syncAppConfigToConvex(key, payload) {
    clearRemoteSyncError();
    const config = getConvexConfig();
    if (convexEnabled() && key) {
        try {
            await runConvexMutation(config.appConfigSetMutation || 'appSettings:setConfig', {
                key,
                payload,
                updatedBy: SESSION_ID
            });
            return true;
        }
        catch (error) {
            rememberRemoteSyncError(error, 'Convex app config sync');
            console.warn('Convex app config sync gagal:', error);
        }
    }
    if (await syncAppConfigToNetlify(key, payload))
        return true;
    if (await syncAppConfigToSupabase(key, payload))
        return true;
    if (await syncAppConfigToCloudflare(key, payload))
        return true;
    return false;
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
    const onDoneRef = useRef(onDone);
    const doneRef = useRef(false);
    const savedLogin = readBestieLogin();
    const [nikInput, setNikInput] = useState(savedLogin.nik || '');
    const [loginName, setLoginName] = useState(savedLogin.name || '');
    const [loginError, setLoginError] = useState('');
    const [introDone, setIntroDone] = useState(false);
    const [closing, setClosing] = useState(false);
    const nikInputRef = useRef(null);

    useEffect(() => {
        onDoneRef.current = onDone;
    }, [onDone]);

    useEffect(() => {
        doneRef.current = false;
        setClosing(false);
        setLoginError('');
        setIntroDone(false);
        const timer = window.setTimeout(() => setIntroDone(true), Math.max(900, durationMs + 160));
        return () => window.clearTimeout(timer);
    }, [durationMs]);

    useEffect(() => {
        if (!introDone || closing) return;
        const focusTimer = window.setTimeout(() => nikInputRef.current?.focus?.(), 80);
        return () => window.clearTimeout(focusTimer);
    }, [introDone, closing]);

    function finishWelcome() {
        if (doneRef.current) return;
        doneRef.current = true;
        setClosing(true);
        window.setTimeout(() => {
            if (typeof onDoneRef.current === 'function') onDoneRef.current();
        }, 400);
    }

    function handleNikChange(event) {
        const nik = normalizeNik(event.target.value);
        setNikInput(nik);
        const found = findBestieByNik(nik);
        setLoginName(found ? found.name : '');
        if (loginError) setLoginError('');
    }

    function submitBestieLogin(event) {
        event?.preventDefault?.();
        const saved = saveBestieLogin({ nik: nikInput });
        if (!saved) {
            setLoginError('NIK tidak terdaftar. Cek kembali angka NIK Regional Bestie.');
            return;
        }
        setLoginName(saved.name);
        finishWelcome();
    }

    return (
        React.createElement("div", {
            className: cx("fixed inset-0 z-[100] grid place-items-center bg-slate-900/40 backdrop-blur-xl transition-all duration-500", closing ? "opacity-0" : "opacity-100"),
            role: "dialog",
            "aria-modal": "true"
        },
        React.createElement("div", {
            className: cx("relative w-[92vw] max-w-sm rounded-[32px] bg-white/95 p-8 shadow-2xl backdrop-blur-2xl transition-all duration-500", closing ? "scale-95 opacity-0 translate-y-8" : "scale-100 opacity-100 translate-y-0", !introDone && "animate-pulse")
        },
            React.createElement("div", { className: "absolute -top-12 left-1/2 -translate-x-1/2 rounded-full bg-white p-2 shadow-xl" },
                React.createElement("div", { className: "flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 shadow-inner" },
                    React.createElement(Icon, { name: "spark", className: "h-8 w-8 text-white" })
                )
            ),
            
            React.createElement("div", { className: "mt-6 text-center" },
                React.createElement("h1", { className: "text-2xl font-black text-slate-900 tracking-tight whitespace-pre-line" }, title),
                React.createElement("p", { className: "mt-2 text-sm font-medium text-slate-500 leading-relaxed whitespace-pre-line" }, subtitle),
                
                !introDone ? (
                    React.createElement("div", { className: "mt-8" },
                        React.createElement("div", { className: "h-1.5 w-full overflow-hidden rounded-full bg-slate-100" },
                            React.createElement("div", { 
                                className: "h-full rounded-full bg-teal-500 transition-all ease-linear",
                                style: { animation: `rbvWelcomeProgress ${durationSeconds}s linear forwards` }
                            })
                        ),
                        React.createElement("p", { className: "mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse" }, "Menyiapkan Sistem...")
                    )
                ) : (
                    React.createElement("form", { onSubmit: submitBestieLogin, className: "mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500" },
                        React.createElement("div", { className: "text-left" },
                            React.createElement("label", { className: "ml-1 text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "NIK Regional Bestie"),
                            React.createElement("div", { className: "relative mt-1" },
                                React.createElement("div", { className: "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4" },
                                    React.createElement(Icon, { name: "user", className: "h-5 w-5 text-slate-400" })
                                ),
                                React.createElement("input", {
                                    ref: nikInputRef,
                                    value: nikInput,
                                    onChange: handleNikChange,
                                    inputMode: "numeric",
                                    maxLength: 12,
                                    placeholder: "Contoh: 123456",
                                    className: "block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 py-3.5 px-11 text-center text-lg font-black tracking-widest text-slate-900 transition-all focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                                })
                            )
                        ),
                        
                        React.createElement("div", { className: "mt-4 flex min-h-[48px] items-center justify-center rounded-xl bg-slate-50 px-4" },
                            loginName ? (
                                React.createElement("div", { className: "flex items-center gap-2 text-teal-600 animate-in fade-in zoom-in duration-300" },
                                    React.createElement(Icon, { name: "check-circle", className: "h-5 w-5" }),
                                    React.createElement("span", { className: "font-extrabold" }, loginName)
                                )
                            ) : loginError ? (
                                React.createElement("span", { className: "text-xs font-semibold text-rose-500" }, loginError)
                            ) : (
                                React.createElement("span", { className: "text-xs font-medium text-slate-400" }, "Nama Anda akan muncul di sini")
                            )
                        ),
                        
                        React.createElement("button", {
                            type: "submit",
                            disabled: !findBestieByNik(nikInput),
                            className: "mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-xl shadow-slate-900/20 transition-all hover:scale-[0.98] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                        },
                            "Mulai Visit",
                            React.createElement(Icon, { name: "right", className: "h-5 w-5" })
                        )
                    )
                )
            )
        ),
        React.createElement("div", {
            className: cx(
                "fixed inset-x-0 bottom-6 sm:bottom-8 z-[110] flex justify-center items-center pointer-events-none px-4",
                closing ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0",
                "transition-all duration-300"
            ),
            style: {
                bottom: 'max(24px, calc(env(safe-area-inset-bottom, 0px) + 20px))'
            }
        },
            React.createElement("a", {
                href: "https://trakteer.id/HEHBESTIE/tip",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "coffee-floating-btn pointer-events-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 text-white text-xs sm:text-sm font-black border-2 border-white/60 shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            },
                React.createElement(Icon, { name: "coffee", className: "w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" }),
                React.createElement("span", { className: "tracking-wide whitespace-nowrap" }, "Trakteer Bestie Coffee")
            )
        )
        )
    );
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
    return (React.createElement("div", { className: "fixed inset-0 z-[120] grid place-items-center bg-brand-teal/80 p-5 backdrop-blur-xl fade-in", role: "dialog", "aria-modal": "true" },
        React.createElement("div", { className: "secret-pin-card w-full max-w-sm rounded-[40px] bg-white p-8 shadow-2xl relative overflow-hidden" },
            React.createElement("div", { className: "absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-teal to-brand-orange" }),
            React.createElement("div", { className: "mb-8 flex flex-col items-center text-center" },
                React.createElement("div", { className: "mb-4 grid h-16 w-16 place-items-center rounded-[24px] bg-brand-teal/10 text-brand-teal" },
                    React.createElement(Icon, { name: "shield", className: "w-8 h-8" })
                ),
                React.createElement("h2", { className: "text-2xl font-black text-slate-900 tracking-tight" }, "Panel Rahasia"),
                React.createElement("p", { className: "text-sm font-medium text-slate-500 mt-1" }, "Masukkan PIN untuk melanjutkan")
            ),
            React.createElement("div", { className: "relative mb-6" },
                React.createElement("input", { ref: inputRef, value: pin, onChange: (event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6)), type: "password", inputMode: "numeric", maxLength: "6", className: "w-full bg-slate-50 border-2 border-slate-100 focus:border-brand-teal focus:bg-white text-center text-4xl font-black tracking-[0.5em] rounded-[24px] py-4 transition-all outline-none", placeholder: "------", "aria-label": "PIN panel rahasia" }),
            ),
            error ? React.createElement("div", { className: "mb-4 p-3 rounded-2xl bg-rose-50 text-rose-600 text-center text-sm font-bold flex items-center justify-center gap-2" },
                React.createElement(Icon, { name: "info", className: "w-4 h-4" }),
                error
            ) : null,
            React.createElement("button", { onClick: onClose, className: "w-full py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors" }, "Batal")
        )
    ));
}
function SecretMonitorPanel({ open, onClose, history, welcomeConfig, onWelcomeConfigChange, scheduleConfig, onScheduleConfigChange }) {
    const [features, setFeatures] = useState(() => readFeaturesConfig());
    useEffect(() => {
        const handler = () => setFeatures(readFeaturesConfig());
        window.addEventListener('rbv-features-config-change', handler);
        return () => window.removeEventListener('rbv-features-config-change', handler);
    }, []);
    const [settingsTab, setSettingsTab] = useState('features');
    const isSuperUser = readBestieLogin()?.name === 'Aan Bagus Permana';
    const handleToggleFeature = async (key) => {
        const next = { ...features, [key]: !features[key] };
        setFeatures(next);
        await saveFeaturesConfig(next);
    };

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
    const masterUploadInputRef = useRef(null);
    const [masterStoreRows, setMasterStoreRows] = useState(() => readLocalMasterStores());
    const [masterStoreStatus, setMasterStoreStatus] = useState('Master data detail toko siap. Upload Excel akan disimpan lokal lalu dipublish ke Convex untuk semua device.');
    const [masterStoreBusy, setMasterStoreBusy] = useState(false);
    const [masterStoreQuery, setMasterStoreQuery] = useState('');
    // --- Schedule state ---
    const [schedStatus, setSchedStatus] = useState('');
    const [schedBusy, setSchedBusy] = useState(false);
    const schedFileRef = useRef(null);
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
    async function cloudflarePanelFetchJson(url, options = {}) {
        const response = await fetch(url, {
            method: options.method || 'GET',
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-store',
            headers: { Accept: 'application/json', ...(options.headers || {}) },
            body: options.body
        });
        const rawText = await response.text().catch(() => '');
        let payload = null;
        if (rawText) {
            try {
                payload = JSON.parse(rawText);
            }
            catch (error) {
                throw new Error(`Endpoint tidak mengirim JSON valid: ${rawText.slice(0, 120)}`);
            }
        }
        if (!response.ok || payload?.ok === false) {
            throw new Error(payload?.error || payload?.message || `HTTP ${response.status}`);
        }
        return payload || { ok: true };
    }
    async function testCloudflareD1Panel() {
        if (cloudflareDbBusy)
            return;
        setCloudflareDbBusy(true);
        const endpoint = cleanText(getCloudflareApiUrl() || getCloudflareConfig().endpoint || getCloudflareConfig().workerUrl || getCloudflareConfig().apiPath || '/api/rbv-data');
        setCloudflareDbStatus(`Mengecek endpoint aktif: ${endpoint}`);
        try {
            const healthUrl = new URL(endpoint, window.location.origin);
            healthUrl.searchParams.set('_panelCheck', String(Date.now()));
            const healthPayload = await cloudflarePanelFetchJson(healthUrl.toString());
            const d1Payload = await cloudflareRequest('testD1');
            const settingsPayload = await cloudflareRequest('listAppSettings', { params: { keys: [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice, APP_CONFIG_KEYS.emailTemplate, APP_CONFIG_KEYS.webSync, APP_CONFIG_KEYS.schedule, APP_CONFIG_KEYS.features].join(',') } });
            const rows = settingsPayload?.rows || settingsPayload?.data || [];
            const count = Array.isArray(rows) ? rows.length : 0;
            setCloudflareDbStatus(`READY: Worker aktif (${healthPayload?.provider || 'cloudflare-d1'}), D1 aktif, app settings terbaca ${count} item. Endpoint: ${endpoint}`);
        }
        catch (error) {
            setCloudflareDbStatus(`GAGAL: ${error?.message || 'request gagal.'} Endpoint: ${endpoint}. Cek lagi binding DB di Worker, CORS, dan deploy file cloudflare/worker.mjs terbaru. Setelah deploy buka ?v=206.`);
        }
        finally {
            setCloudflareDbBusy(false);
        }
    }
    async function pullCloudflareSettingsPanel() {
        if (cloudflareDbBusy)
            return;
        setCloudflareDbBusy(true);
        setCloudflareDbStatus('Menarik setting terbaru dari Cloudflare D1 ke panel lokal...');
        try {
            const rows = await fetchAppConfigsFromCloudflare();
            if (rows === null)
                throw new Error(LAST_REMOTE_SYNC_ERROR || 'Cloudflare tidak mengirim data settings.');
            const applied = applyRemoteAppConfigRows(rows);
            const nextWelcome = readWelcomeConfig();
            setWelcomeTitle(nextWelcome.title);
            setWelcomeSubtitle(nextWelcome.subtitle);
            setWelcomeDurationSeconds(nextWelcome.durationSeconds);
            const nextNotice = readUpdateNoticeConfig();
            setNoticeEnabled(nextNotice.enabled);
            setNoticeTitle(nextNotice.title);
            setNoticeMessagesText(nextNotice.messages.join('\n'));
            setNoticeIntervalSeconds(nextNotice.intervalSeconds);
            const nextEmailTemplate = readEmailTemplateConfig();
            setEmailSubjectTemplate(nextEmailTemplate.subjectTemplate);
            setEmailBodyTemplate(nextEmailTemplate.bodyTemplate);
            setCloudflareDbStatus(`Tarik setting selesai. ${applied.length} item diterapkan dari Cloudflare D1 ke panel.`);
        }
        catch (error) {
            setCloudflareDbStatus(`Tarik setting gagal: ${error?.message || 'request gagal.'}`);
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
    async function testConvexPanel() {
        if (cloudflareDbBusy)
            return;
        setCloudflareDbBusy(true);
        const deployment = cleanText(getConvexDeploymentUrl() || getConvexConfig().deploymentUrl || '');
        const siteUrl = cleanText(getConvexHttpUrl() || getConvexConfig().siteUrl || '');
        setCloudflareDbStatus(`Mengecek Convex deployment: ${deployment || 'belum diisi'}`);
        try {
            if (!convexEnabled())
                throw new Error('Convex belum aktif. Isi enabled:true dan deploymentUrl di convex-config.js.');
            const config = getConvexConfig();
            const settingsRows = await runConvexQuery(config.appConfigListQuery || 'appSettings:listConfigs', { keys: [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice, APP_CONFIG_KEYS.emailTemplate, APP_CONFIG_KEYS.webSync, APP_CONFIG_KEYS.schedule, APP_CONFIG_KEYS.features] });
            const masterRows = await runConvexQuery(config.masterStoreListQuery || 'masterStores:listStores', { limit: 10 });
            const settingCount = normalizeRemoteAppConfigRows(settingsRows).length;
            const masterCount = normalizeMasterStoreRows(masterRows?.rows || masterRows?.data || masterRows).length;
            setCloudflareDbStatus(`READY: Convex aktif. Settings terbaca ${settingCount} item, sample master toko ${masterCount} baris. URL: ${deployment}${siteUrl ? ` | Site: ${siteUrl}` : ''}`);
        }
        catch (error) {
            setCloudflareDbStatus(`GAGAL: ${error?.message || 'Convex gagal dites.'} Cek convex-config.js, jalankan npx convex dev, lalu buka ulang ?v=206.`);
        }
        finally {
            setCloudflareDbBusy(false);
        }
    }
    async function pullConvexSettingsPanel() {
        if (cloudflareDbBusy)
            return;
        setCloudflareDbBusy(true);
        setCloudflareDbStatus('Menarik setting terbaru dari Convex ke panel lokal...');
        try {
            const rows = await fetchAppConfigsFromConvex();
            if (rows === null)
                throw new Error(LAST_REMOTE_SYNC_ERROR || 'Convex tidak mengirim data settings.');
            const applied = applyRemoteAppConfigRows(rows);
            const nextWelcome = readWelcomeConfig();
            setWelcomeTitle(nextWelcome.title);
            setWelcomeSubtitle(nextWelcome.subtitle);
            setWelcomeDurationSeconds(nextWelcome.durationSeconds);
            const nextNotice = readUpdateNoticeConfig();
            setNoticeEnabled(nextNotice.enabled);
            setNoticeTitle(nextNotice.title);
            setNoticeMessagesText(nextNotice.messages.join('\n'));
            setNoticeIntervalSeconds(nextNotice.intervalSeconds);
            const nextEmailTemplate = readEmailTemplateConfig();
            setEmailSubjectTemplate(nextEmailTemplate.subjectTemplate);
            setEmailBodyTemplate(nextEmailTemplate.bodyTemplate);
            setFeatures(readFeaturesConfig());
            setScheduleConfig(readScheduleConfig());
            setCloudflareDbStatus(`Tarik setting selesai. ${applied.length} item diterapkan dari Convex ke panel.`);
        }
        catch (error) {
            setCloudflareDbStatus(`Tarik setting gagal: ${error?.message || 'request gagal.'}`);
        }
        finally {
            setCloudflareDbBusy(false);
        }
    }
    async function syncHistoryToConvexPanel() {
        if (cloudflareDbBusy)
            return;
        setCloudflareDbBusy(true);
        setCloudflareDbStatus('Mengirim history lokal ke Convex...');
        try {
            if (!convexEnabled())
                throw new Error('Convex belum aktif. Isi deploymentUrl di convex-config.js.');
            const config = getConvexConfig();
            const visits = await getAllVisitRecordsForBackup();
            let success = 0;
            for (const item of visits) {
                if (!item || !cleanText(item.nama) || !cleanText(item.store))
                    continue;
                const payload = monitorPayloadFromVisit(item);
                await runConvexMutation(config.upsertMutation || 'monitor:upsertVisit', { payload });
                success += 1;
            }
            setCloudflareDbStatus(`Sync Convex selesai. ${success}/${visits.length} history terkirim.`);
            refresh({ quiet: true });
        }
        catch (error) {
            setCloudflareDbStatus(`Sync Convex gagal: ${error?.message || 'unknown error.'}`);
        }
        finally {
            setCloudflareDbBusy(false);
        }
    }
    async function broadcastSilentWebSync() {
        if (cloudflareDbBusy)
            return;
        setCloudflareDbBusy(true);
        setCloudflareDbStatus('Mengirim perintah Silent Web Sync ke semua device aktif...');
        try {
            if (!convexEnabled())
                throw new Error('Convex belum aktif. Isi deploymentUrl di convex-config.js.');
            const payload = {
                signalId: `web-sync-${Date.now()}`,
                version: APP_BUILD_VERSION,
                sentAt: Date.now(),
                mode: 'silent-cache-update',
                message: 'Device aktif akan membersihkan cache dan mengecek service worker tanpa reload paksa.'
            };
            const synced = await syncAppConfigToConvex(APP_CONFIG_KEYS.webSync, payload);
            if (!synced)
                throw new Error(LAST_REMOTE_SYNC_ERROR || 'gagal menyimpan signal ke Convex.');
            setCloudflareDbStatus('Silent Web Sync terkirim. Device aktif akan update cache tanpa memaksa reload; versi baru penuh dipakai saat user refresh/buka ulang.');
        }
        catch (error) {
            setCloudflareDbStatus(`Silent Web Sync gagal: ${error?.message || 'unknown error.'}`);
        }
        finally {
            setCloudflareDbBusy(false);
        }
    }
    async function uploadDeviceBackupPanel() {
        if (cloudflareDbBusy)
            return;
        setCloudflareDbBusy(true);
        setCloudflareDbStatus('Membuat backup cepat device ke Convex...');
        try {
            const payload = await pushDeviceBackupToConvex();
            setCloudflareDbStatus(`Backup cepat tersimpan di Convex. Visit: ${payload.visits.length}, master toko: ${payload.masterStores.length}. Di device baru tekan Tarik Device Backup.`);
        }
        catch (error) {
            setCloudflareDbStatus(`Backup cepat gagal: ${error?.message || 'unknown error.'}`);
        }
        finally {
            setCloudflareDbBusy(false);
        }
    }
    async function pullDeviceBackupPanel() {
        if (cloudflareDbBusy)
            return;
        setCloudflareDbBusy(true);
        setCloudflareDbStatus('Menarik backup cepat dari Convex...');
        try {
            const result = await pullDeviceBackupFromConvex();
            if (!result) {
                setCloudflareDbStatus('Tarik Device Backup dibatalkan.');
                return;
            }
            setHistory(readHistoryMeta());
            setCloudflareDbStatus(`Tarik Device Backup selesai. Visit lokal: ${result.visits}, master toko: ${result.masterStores}. Reload ringan disarankan setelah ini.`);
        }
        catch (error) {
            setCloudflareDbStatus(`Tarik Device Backup gagal: ${error?.message || 'unknown error.'}`);
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
            if (remoteRows !== null && remoteRows.length > 0) {
                applyRows(remoteRows, cloudflareEnabled() ? 'cloudflare' : (netlifyEnabled() ? 'netlify' : (supabaseEnabled() ? 'supabase' : ((source === 'firebase realtime' || source === 'convex realtime') ? 'firebase realtime' : 'firebase'))));
            }
            else {
                const lRows = localRows();
                const isFbActive = convexEnabled();
                applyRows(lRows, (isFbActive && remoteRows !== null) ? 'firebase' : 'local');
                if (isFbActive && remoteRows !== null && lRows.length > 0) {
                    setTimeout(() => { syncHistoryToConvexPanel(); }, 300);
                }
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
    async function refreshMasterStoresFromConvex() {
        if (masterStoreBusy)
            return;
        setMasterStoreBusy(true);
        setMasterStoreStatus('Menarik master data detail toko dari Convex...');
        try {
            const rowsFromConvex = await fetchMasterStoresFromConvex();
            if (rowsFromConvex === null)
                throw new Error(LAST_REMOTE_SYNC_ERROR || 'Convex belum mengirim data master toko.');
            const saved = saveLocalMasterStores(rowsFromConvex);
            setMasterStoreRows(saved);
            setMasterStoreStatus(`Master data Convex diterapkan: ${saved.length} toko.`);
        }
        catch (error) {
            setMasterStoreStatus(`Tarik master gagal: ${error?.message || 'unknown error.'}`);
        }
        finally {
            setMasterStoreBusy(false);
        }
    }
    async function syncLocalMasterStoresToConvex() {
        if (masterStoreBusy)
            return;
        const rowsToSync = normalizeMasterStoreRows(masterStoreRows);
        if (!rowsToSync.length) {
            setMasterStoreStatus('Belum ada master data toko untuk dikirim. Upload Excel dulu.');
            return;
        }
        setMasterStoreBusy(true);
        setMasterStoreStatus(`Mengirim ${rowsToSync.length} master toko ke Convex...`);
        try {
            const ok = await syncMasterStoresToConvex(rowsToSync, { replace: true });
            if (ok) {
                const remoteRows = await fetchMasterStoresFromConvex();
                if (remoteRows && remoteRows.length) {
                    const confirmed = saveLocalMasterStores(remoteRows);
                    setMasterStoreRows(confirmed);
                    setMasterStoreStatus(`Sync Convex berhasil: ${confirmed.length} toko tersimpan dan siap untuk semua device.`);
                }
                else {
                    setMasterStoreStatus(`Sync Convex berhasil: ${rowsToSync.length} toko terkirim.`);
                }
            }
            else {
                setMasterStoreStatus(`Sync Convex gagal: ${LAST_REMOTE_SYNC_ERROR || 'cek deploymentUrl dan function masterStores.'}`);
            }
        }
        finally {
            setMasterStoreBusy(false);
        }
    }
    async function handleMasterStoreFileChange(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file)
            return;
        setMasterStoreBusy(true);
        setMasterStoreStatus(`Membaca file ${file.name}...`);
        try {
            const parsedRows = await parseMasterStoreExcelFile(file);
            if (!parsedRows.length)
                throw new Error('Tidak ada baris master toko valid. Pastikan header sesuai template.');
            const saved = saveLocalMasterStores(parsedRows);
            setMasterStoreRows(saved);
            setMasterStoreStatus(`Upload berhasil: ${saved.length} toko terbaca lokal. Publish ke Convex untuk semua device...`);
            const ok = await syncMasterStoresToConvex(saved, { replace: true });
            if (ok) {
                const remoteRows = await fetchMasterStoresFromConvex();
                if (remoteRows && remoteRows.length) {
                    const confirmed = saveLocalMasterStores(remoteRows);
                    setMasterStoreRows(confirmed);
                    setMasterStoreStatus(`Upload + publish Convex selesai: ${confirmed.length} toko aktif untuk semua device.`);
                }
                else {
                    setMasterStoreStatus(`Upload + sync Convex selesai: ${saved.length} toko terkirim. Device lain akan menarik data saat reload/buka ulang.`);
                }
            }
            else {
                setMasterStoreStatus(`Upload hanya tersimpan lokal (${saved.length} toko), belum masuk Convex: ${LAST_REMOTE_SYNC_ERROR || 'cek config Convex / deploy function masterStores.'}`);
            }
        }
        catch (error) {
            setMasterStoreStatus(`Upload gagal: ${error?.message || 'file tidak valid.'}`);
        }
        finally {
            setMasterStoreBusy(false);
        }
    }
    function clearLocalMasterStoreUpload() {
        if (!confirmAction('Hapus master data toko lokal hasil upload dan kembali ke data bawaan?'))
            return;
        localStorage.removeItem(MASTER_STORE_LOCAL_KEY);
        const fallbackRows = normalizeMasterStoreRows(MASTER_STORES);
        setMasterStoreRows(fallbackRows);
        setMasterStoreStatus(`Data lokal direset. Fallback bawaan: ${fallbackRows.length} toko.`);
    }
    // ---- Schedule Excel Import ----
    function normalizeScheduleDateStr(rawDate) {
        if (!rawDate) return '';
        if (typeof rawDate === 'number') {
            const d = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
            return !isNaN(d.getTime()) ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : '';
        }
        const str = String(rawDate).trim();
        if (/^\d{4}[\/\-]\d{2}[\/\-]\d{2}/.test(str)) return str.slice(0, 10).replace(/\//g, '-');
        const m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
        return str;
    }
    function parseExcelSchedule(file) {
        return new Promise((resolve, reject) => {
            if (typeof window.XLSX === 'undefined') { reject(new Error('Library SheetJS belum dimuat. Coba refresh halaman.')); return; }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const wb = window.XLSX.read(data, { type: 'array' });
                    const parsed = [];
                    (wb.SheetNames || []).forEach(sheetName => {
                        const ws = wb.Sheets[sheetName];
                        if (!ws) return;
                        const rawRows = window.XLSX.utils.sheet_to_json(ws, { header: 1 });
                        if (!rawRows || !rawRows.length) return;
                        let headerIdx = -1;
                        let namaIdx = -1, dateIdx = -1, descIdx = -1, locIdx = -1;
                        for (let r = 0; r < Math.min(rawRows.length, 15); r++) {
                            const rowHeader = (rawRows[r] || []).map(h => String(h || '').trim().toLowerCase());
                            const nIdx = rowHeader.findIndex(h => h.includes('nama') || h.includes('bestie') || h.includes('auditor') || h.includes('name') || h.includes('user') || h.includes('pic') || h.includes('trainer'));
                            const dIdx = rowHeader.findIndex(h => h.includes('date') || h.includes('tanggal') || h.includes('tgl') || h.includes('jadwal') || h.includes('start') || h.includes('hari') || h.includes('waktu'));
                            const dsIdx = rowHeader.findIndex(h => h.includes('desc') || h.includes('deskripsi') || h.includes('keterangan') || h.includes('toko') || h.includes('store') || h.includes('aktivitas') || h.includes('activity') || h.includes('notes') || h.includes('kunjungan'));
                            const lIdx = rowHeader.findIndex(h => h.includes('location') || h.includes('lokasi') || h.includes('tempat') || h.includes('room') || h.includes('ruang') || h.includes('cabang'));
                            if (nIdx >= 0 && (dIdx >= 0 || dsIdx >= 0 || rowHeader.length > 1)) {
                                headerIdx = r;
                                namaIdx = nIdx;
                                dateIdx = dIdx >= 0 ? dIdx : 1;
                                descIdx = dsIdx;
                                locIdx = lIdx;
                                break;
                            }
                        }
                        if (headerIdx < 0 || namaIdx < 0) {
                            headerIdx = 0;
                            namaIdx = 0;
                            dateIdx = rawRows[0].length > 1 ? 1 : 0;
                            descIdx = rawRows[0].length > 2 ? 2 : -1;
                            locIdx = rawRows[0].length > 6 ? 6 : -1;
                        }
                        for (let i = headerIdx + 1; i < rawRows.length; i++) {
                            const row = rawRows[i];
                            if (!row || !row.length) continue;
                            const rawNama = String(row[namaIdx] || '').trim();
                            if (!rawNama || rawNama.toLowerCase() === 'nama') continue;
                            const matchedBestie = findRegisteredLeaderboardBestie(rawNama);
                            if (!matchedBestie) continue;
                            let dateStr = normalizeScheduleDateStr(row[dateIdx]);
                            if (!dateStr) {
                                const todayD = new Date();
                                dateStr = `${todayD.getFullYear()}-${String(todayD.getMonth() + 1).padStart(2, '0')}-${String(todayD.getDate()).padStart(2, '0')}`;
                            }
                            const desc = descIdx >= 0 ? String(row[descIdx] || '').trim() : 'Jadwal Aktif';
                            const loc = locIdx >= 0 ? String(row[locIdx] || '').trim() : '';
                            parsed.push({
                                nama: matchedBestie.name,
                                date: dateStr,
                                description: desc || 'Jadwal Aktif',
                                location: loc || '',
                                sheetName: String(sheetName || '').trim()
                            });
                        }
                    });
                    resolve(parsed);
                } catch(err) { reject(err); }
            };
            reader.onerror = () => reject(new Error('Gagal membaca file.'));
            reader.readAsArrayBuffer(file);
        });
    }
    async function handleScheduleUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        setSchedBusy(true);
        setSchedStatus('Membaca file Excel...');
        try {
            const parsed = await parseExcelSchedule(file);
            if (!parsed.length) { setSchedStatus('Tidak ada data jadwal untuk bestie yang terdaftar di Leaderboard.'); setSchedBusy(false); return; }
            const saved = saveScheduleConfig(parsed);
            onScheduleConfigChange(saved);
            setSchedStatus(`Berhasil import ${parsed.length} entri khusus Bestie terdaftar. Menyinkronkan ke Firebase...`);
            const synced = await syncAppConfigToConvex(APP_CONFIG_KEYS.schedule, parsed);
            setSchedStatus(synced ? `✅ ${parsed.length} entri jadwal tersimpan & tersinkron.` : `⚠️ ${parsed.length} entri disimpan lokal, Firebase sync gagal.`);
        } catch(err) {
            setSchedStatus(`❌ Error: ${err?.message || 'Gagal memproses file.'}`);
        } finally {
            setSchedBusy(false);
            if (schedFileRef.current) schedFileRef.current.value = '';
        }
    }
    function clearSchedule() {
        if (!window.confirm('Hapus semua data jadwal?')) return;
        saveScheduleConfig([]);
        onScheduleConfigChange([]);
        setSchedStatus('Data jadwal dihapus.');
    }
    function renderSchedulePanel() {
        const todayStr = new Date().toLocaleDateString('en-CA');
        const todaySchedules = (scheduleConfig || []).filter(s => String(s.date || '').slice(0, 10) === todayStr);
        const displaySchedules = todaySchedules.length > 0 ? todaySchedules : (scheduleConfig || []).slice(0, 15);
        const listLabel = todaySchedules.length > 0
            ? `Jadwal hari ini (${todayStr}):`
            : `Daftar jadwal aktif (${Math.min((scheduleConfig || []).length, 15)} dari ${(scheduleConfig || []).length}):`;
        return React.createElement('div', { className: 'rounded-3xl border border-violet-200 bg-violet-50 p-5 mb-5' },
            React.createElement('div', { className: 'flex items-center justify-between mb-3' },
                React.createElement('div', null,
                    React.createElement('p', { className: 'text-xs font-extrabold uppercase tracking-[0.18em] text-violet-700' }, '📅 Upload Jadwal'),
                    React.createElement('h3', { className: 'text-lg font-black text-slate-900' }, 'Import Jadwal Mingguan (Excel)')
                ),
                (scheduleConfig || []).length > 0 ? React.createElement('button', { type: 'button', onClick: clearSchedule, className: 'text-xs font-bold text-red-500 hover:text-red-700 underline' }, 'Hapus Semua') : null
            ),
            React.createElement('p', { className: 'text-xs text-slate-500 mb-4' }, 'Upload file .xlsx (kolom: Nama, Start Date, Description). Sistem otomatis memfilter khusus nama-nama Regional Bestie yang terdaftar di Leaderboard.'),
            React.createElement('div', { className: 'flex flex-col gap-3 sm:flex-row sm:items-center' },
                React.createElement('label', { className: 'flex cursor-pointer items-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow hover:bg-violet-700 transition-colors', style: schedBusy ? { opacity: 0.6, pointerEvents: 'none' } : {} },
                    schedBusy ? 'Memproses...' : '📂 Pilih File Excel (.xlsx)',
                    React.createElement('input', { ref: schedFileRef, type: 'file', accept: '.xlsx,.xls', className: 'hidden', onChange: handleScheduleUpload, disabled: schedBusy })
                ),
                (scheduleConfig || []).length > 0
                    ? React.createElement('p', { className: 'text-xs font-bold text-violet-700 bg-violet-100 px-3 py-1.5 rounded-full' }, `${scheduleConfig.length} entri aktif · ${todaySchedules.length} hari ini`)
                    : React.createElement('p', { className: 'text-xs text-slate-400' }, 'Belum ada data jadwal.')
            ),
            schedStatus ? React.createElement('p', { className: 'mt-3 text-xs font-semibold text-slate-700 bg-white rounded-xl px-4 py-3 border border-violet-100' }, schedStatus) : null,
            displaySchedules.length > 0 ? React.createElement('div', { className: 'mt-4 space-y-2' },
                React.createElement('p', { className: 'text-xs font-bold text-slate-600 mb-1' }, listLabel),
                displaySchedules.map((s, i) => React.createElement('div', { key: i, className: 'flex gap-3 bg-white rounded-xl p-3 border border-violet-100 text-xs' },
                    React.createElement('span', { className: 'font-bold text-violet-800 shrink-0 w-32 truncate' }, s.nama),
                    React.createElement('span', { className: 'text-slate-500 shrink-0' }, s.date ? `[${String(s.date).slice(0, 10)}]` : ''),
                    React.createElement('span', { className: 'text-slate-700 truncate' }, s.description || s.toko || s.store || '-')
                ))
            ) : null
        );
    }
    function renderMasterStorePanel() {
        const normalizedMasterRows = normalizeMasterStoreRows(masterStoreRows);
        const previewRows = masterStoreFiltered.slice(0, 20);
        return React.createElement("div", { className: "mb-5 rounded-3xl border border-cyan-100 bg-cyan-50/80 p-4" },
            React.createElement("input", { ref: masterUploadInputRef, type: "file", accept: ".xlsx,.xls,.csv", className: "hidden", onChange: handleMasterStoreFileChange }),
            React.createElement("div", { className: "mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.18em] text-audit-primary" }, "Master Data Detail Toko"),
                    React.createElement("h3", { className: "text-lg font-black text-slate-950" }, "Upload Excel ke Database Convex"),
                    React.createElement("p", { className: "mt-1 text-xs font-semibold text-slate-600" }, "Upload file template untuk mengganti master store lookup, email toko, area manager, regional manager, alamat, dan status operasional.")),
                React.createElement("div", { className: "flex flex-wrap gap-2" },
                    React.createElement(Button, { variant: "secondary", icon: "excel", onClick: downloadMasterStoreTemplateExcel }, "Template Excel"),
                    React.createElement(Button, { variant: "secondary", icon: "upload", onClick: () => masterUploadInputRef.current?.click(), disabled: masterStoreBusy }, masterStoreBusy ? 'Proses...' : 'Upload Excel'),
                    React.createElement(Button, { variant: "secondary", icon: "download", onClick: refreshMasterStoresFromConvex, disabled: masterStoreBusy }, "Tarik Convex"),
                    React.createElement(Button, { variant: "secondary", icon: "spark", onClick: syncLocalMasterStoresToConvex, disabled: masterStoreBusy }, "Sync Convex"),
                    React.createElement(Button, { variant: "secondary", icon: "trash", onClick: clearLocalMasterStoreUpload, disabled: masterStoreBusy }, "Reset Lokal"))),
            React.createElement("div", { className: "grid gap-3 md:grid-cols-3" },
                React.createElement("div", { className: "rounded-2xl bg-white p-3 ring-1 ring-cyan-100" },
                    React.createElement("p", { className: "text-[10px] font-black uppercase tracking-[0.18em] text-slate-400" }, "Total Master"),
                    React.createElement("p", { className: "mt-1 text-2xl font-black text-slate-950" }, normalizedMasterRows.length)),
                React.createElement("div", { className: "rounded-2xl bg-white p-3 ring-1 ring-cyan-100" },
                    React.createElement("p", { className: "text-[10px] font-black uppercase tracking-[0.18em] text-slate-400" }, "Database"),
                    React.createElement("p", { className: "mt-1 text-sm font-black text-cyan-800" }, convexEnabled() ? 'Convex aktif' : 'Convex belum aktif')),
                React.createElement("div", { className: "rounded-2xl bg-white p-3 ring-1 ring-cyan-100" },
                    React.createElement("p", { className: "text-[10px] font-black uppercase tracking-[0.18em] text-slate-400" }, "Status"),
                    React.createElement("p", { className: "mt-1 text-xs font-bold leading-5 text-slate-700" }, masterStoreStatus))),
            React.createElement("p", { className: "mt-4 rounded-2xl bg-white p-3 text-xs font-bold leading-5 text-slate-600 ring-1 ring-cyan-100" }, "Preview toko di panel disembunyikan agar panel mobile lebih ringan. Upload Excel tetap membaca kolom: kode store, Store Head, Area Manager, Regional Manager, Email Store, dan Alamat Store."));
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
        applyRows(localRows(), 'local');
        setManualRequests(readManualStoreRequests());
        setPresenceRows(readLocalPresenceRows());
        setMasterStoreRows(readLocalMasterStores());
        setConnectionState('idle');
        setLastSync('');
        setLoading(false);
        // Revamp 207: Aktifkan langsung koneksi realtime Firebase & auto-sync saat panel rahasia dibuka
        // agar status monitoring langsung merespons "Live Firebase" tanpa perlu klik manual.
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
                        applyRows(nextRows, 'firebase realtime');
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
    const masterStoreFiltered = normalizeMasterStoreRows(masterStoreRows).filter((store) => {
        const haystack = normalize([store.siteCode4, store.siteCode, store.siteDescr, store.type, store.city, store.address, store.emailStore, store.areaManager].join(' '));
        return !masterStoreQuery || haystack.includes(normalize(masterStoreQuery));
    });
    const onlinePresence = normalizePresenceRows(presenceRows).filter((row) => row.is_online);
    const uniqueBesties = new Set(rows.map((row) => normalize(row.bestie_name)).filter(Boolean)).size;
    const today = new Date().toISOString().slice(0, 10);
    const todayVisits = rows.filter((row) => String(row.visit_date || '').slice(0, 10) === today).length;
    const isLive = source === 'cloudflare' || source === 'netlify' || source === 'supabase' || source === 'convex realtime' || source === 'convex' || source === 'firebase' || source === 'firebase realtime';
    const sourceBadgeLabel = source === 'cloudflare' ? 'Cloudflare D1' : source === 'netlify' ? 'Netlify Sync' : source === 'supabase' ? 'Supabase Sync' : (source === 'convex realtime' || source === 'convex' || source === 'firebase' || source === 'firebase realtime') ? 'Live Firebase' : 'Lokal (Offline/Backup)';
    const connectionTone = connectionState === 'online' ? 'success' : connectionState === 'error' || connectionState === 'fallback' ? 'warning' : 'default';
    return (React.createElement("div", { className: "secret-admin-backdrop fixed inset-0 z-[85] overflow-auto bg-slate-950/65 p-3 backdrop-blur-sm lg:p-6", role: "dialog", "aria-modal": "true" },
        React.createElement("div", { className: "secret-admin-panel mx-auto max-w-6xl rounded-[32px] bg-white p-5 shadow-2xl lg:p-7" },
            React.createElement("div", { className: "mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between" },
                React.createElement("div", null,
                    React.createElement("div", { className: "flex flex-wrap items-center gap-2" },
                        React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary" }, "Panel Rahasia Admin"),
                        secretTab === 'monitoring' ? React.createElement(Badge, { tone: isLive ? 'success' : 'default' }, sourceBadgeLabel) : React.createElement(Badge, { tone: "default" }, "Setting Web"),
                        secretTab === 'monitoring' ? React.createElement(Badge, { tone: connectionTone }, connectionState) : null),
                    React.createElement("h2", { className: "mt-2 text-2xl font-black text-slate-950" }, secretTab === 'monitoring' ? 'Monitoring Realtime' : 'Admin Control Center'),
                    secretTab === 'monitoring' && lastSync ? React.createElement("p", { className: "mt-1 text-xs font-semibold text-slate-500" },
                        "Update terakhir: ",
                        formatDateTime(lastSync)) : null,
                    (!isLive && LAST_REMOTE_SYNC_ERROR) ? React.createElement("div", { className: "mt-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-bold text-amber-800 break-all" },
                        `⚠️ Info Koneksi Firebase Offline/Lokal: ${LAST_REMOTE_SYNC_ERROR}`
                    ) : null),
                React.createElement("div", { className: "flex flex-wrap gap-2" },
                    secretTab === 'monitoring' ? React.createElement(Button, { variant: "secondary", icon: "excel", onClick: downloadMasterStoreTemplateExcel }, "Template Excel") : null,
                    secretTab === 'monitoring' ? React.createElement(Button, { variant: "secondary", icon: "download", onClick: () => exportJson(rows, 'regional-bestie-monitor.json') }, "Export JSON") : null,
                    secretTab === 'monitoring' ? React.createElement(Button, { variant: "secondary", icon: "spark", onClick: () => refresh(), disabled: loading }, loading ? 'Sync...' : 'Refresh') : null,
                    React.createElement(Button, { variant: "icon", onClick: onClose, "aria-label": "Tutup" },
                        React.createElement(Icon, { name: "close", className: "h-4 w-4" })))),
            React.createElement("div", { className: "secret-panel-tabs mb-5 grid grid-cols-2 gap-2 rounded-3xl bg-slate-100 p-1" },
                React.createElement("button", { type: "button", className: cx('secret-panel-tab', secretTab === 'settings' && 'active'), onClick: () => setSecretTab('settings') },
                    React.createElement(Icon, { name: "settings", className: "h-4 w-4" }),
                    React.createElement("span", null, "Setting Web")),
                React.createElement("button", { type: "button", className: cx('secret-panel-tab', secretTab === 'monitoring' && 'active'), onClick: () => { setSecretTab('monitoring'); refresh(); } },
                    React.createElement(Icon, { name: "history", className: "h-4 w-4" }),
                    React.createElement("span", null, "Monitoring"))),
            secretTab === 'settings' ? (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "flex overflow-x-auto gap-2 pb-4 mb-2 no-scrollbar" },
                    [
                        { id: 'features', label: 'Fitur & Analitik', icon: 'spark' },
                        { id: 'sync', label: 'Data & Migrasi', icon: 'upload' },
                        { id: 'content', label: 'Konten Tampilan', icon: 'clipboard' },
                        { id: 'docs', label: 'Email & PDF', icon: 'document' },
                        { id: 'master', label: 'Data Master', icon: 'store' }
                    ].map(st => React.createElement("button", {
                        key: st.id,
                        onClick: () => setSettingsTab(st.id),
                        className: cx("flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all", settingsTab === st.id ? "bg-slate-800 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200")
                    }, React.createElement(Icon, { name: st.icon, className: "w-3.5 h-3.5" }), st.label))
                ),
                settingsTab === 'features' && React.createElement("div", { className: "mb-5 rounded-3xl border border-slate-200 bg-white p-5 space-y-4 fade-in" },
                    React.createElement("h3", { className: "text-lg font-black text-slate-900 mb-3" }, "Tampilan Fitur Analitik"),
                    React.createElement("div", { className: "grid gap-3 md:grid-cols-2" },
                        [
                            { key: 'map', label: 'Peta Kunjungan Live (GIS)' },
                            { key: 'ai', label: 'AI Executive Summary' },
                            { key: 'trend', label: 'Tren Temuan (QSC vs OPI)' },
                            { key: 'leaderboard', label: 'Leaderboard (List Toko)' }
                        ].map(f => React.createElement("div", { key: f.key, className: "flex items-center justify-between p-3 bg-slate-50 rounded-xl" },
                            React.createElement("span", { className: "text-sm font-bold text-slate-700" }, f.label),
                            React.createElement("button", { onClick: () => isSuperUser && handleToggleFeature(f.key), className: cx("relative inline-flex h-8 w-16 items-center rounded-full transition-colors shadow-inner", !isSuperUser && "opacity-50 cursor-not-allowed"), style: { backgroundColor: features[f.key] ? '#10b981' : '#cbd5e1' } },
                                React.createElement("span", { className: "inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform", style: { transform: features[f.key] ? 'translateX(34px)' : 'translateX(4px)' } }),
                                React.createElement("span", { className: "absolute text-[10px] font-black text-white pointer-events-none", style: { left: features[f.key] ? '10px' : 'auto', right: features[f.key] ? 'auto' : '10px' } }, features[f.key] ? 'ON' : 'OFF')
                            )
                        ))
                    )
                ),
                settingsTab === 'sync' && React.createElement("div", { className: "mb-5 grid gap-4 md:grid-cols-2 fade-in" },
                    React.createElement("div", { className: "rounded-3xl border border-emerald-200 bg-emerald-50 p-5" },
                        React.createElement("h3", { className: "text-lg font-black text-slate-900 mb-1" }, "Sync & Refresh All"),
                        React.createElement("p", { className: "text-xs text-slate-600 mb-4" }, "Tarik setting terbaru, kirim history kunjungan, dan sinkronisasi data global dengan satu klik."),
                        React.createElement(Button, { variant: "primary", icon: "spark", className: "w-full justify-center", onClick: async () => { await pullConvexSettingsPanel(); await syncHistoryToConvexPanel(); await refresh(); }, disabled: cloudflareDbBusy }, cloudflareDbBusy ? 'Menyinkronkan...' : 'Deep Sync Sekarang')
                    ),
                    React.createElement("div", { className: "rounded-3xl border border-cyan-200 bg-cyan-50 p-5" },
                        React.createElement("h3", { className: "text-lg font-black text-slate-900 mb-1" }, "Device Migration"),
                        React.createElement("p", { className: "text-xs text-slate-600 mb-4" }, "Backup seluruh data kunjungan perangkat ini atau pulihkan data dari cloud untuk pindah device."),
                        React.createElement("div", { className: "grid grid-cols-2 gap-2" },
                            React.createElement(Button, { variant: "secondary", icon: "upload", onClick: uploadDeviceBackupPanel, disabled: cloudflareDbBusy }, "Backup"),
                            React.createElement(Button, { variant: "secondary", icon: "download", onClick: pullDeviceBackupPanel, disabled: cloudflareDbBusy }, "Restore")
                        )
                    )
                ),
                settingsTab === 'content' && React.createElement("div", { className: "grid gap-5 md:grid-cols-2 mb-5 fade-in" },
                    React.createElement("div", { className: "rounded-3xl border border-slate-200 bg-white p-5 space-y-4" },
                        React.createElement("div", { className: "flex justify-between items-center" },
                            React.createElement("h3", { className: "text-lg font-black text-slate-900" }, "Welcome & Assignment"),
                            React.createElement(Button, { variant: "secondary", icon: "check", onClick: () => { saveWelcomeSettings(); saveAssignmentSettings(); } }, "Simpan")
                        ),
                        React.createElement(Field, { label: "Judul Welcome" }, React.createElement(TextInput, { value: welcomeTitle, onChange: e => setWelcomeTitle(e.target.value) })),
                        React.createElement(Field, { label: "Sub Judul" }, React.createElement(TextArea, { value: welcomeSubtitle, onChange: e => setWelcomeSubtitle(e.target.value), minRows: 2 })),
                        React.createElement(Field, { label: "Link Assignment" }, React.createElement(TextInput, { type: "url", value: assignmentLink, onChange: e => setAssignmentLink(e.target.value) }))
                    ),
                    React.createElement("div", { className: "rounded-3xl border border-slate-200 bg-white p-5 space-y-4" },
                        React.createElement("div", { className: "flex justify-between items-center" },
                            React.createElement("h3", { className: "text-lg font-black text-slate-900" }, "Home Notice"),
                            React.createElement("div", { className: "flex items-center gap-3" },
                                React.createElement(Toggle, { checked: noticeEnabled, onChange: setNoticeEnabled, label: "" }),
                                React.createElement(Button, { variant: "secondary", icon: "check", onClick: saveNoticeSettings }, "Simpan")
                            )
                        ),
                        React.createElement(Field, { label: "Judul Notice" }, React.createElement(TextInput, { value: noticeTitle, onChange: e => setNoticeTitle(e.target.value) })),
                        React.createElement(Field, { label: "Teks Slide" }, React.createElement(TextArea, { value: noticeMessagesText, onChange: e => setNoticeMessagesText(e.target.value), minRows: 4 }))
                    )
                ),
                settingsTab === 'docs' && React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "rounded-3xl border border-slate-200 bg-white p-5 mb-5 fade-in" },
                        React.createElement("div", { className: "flex justify-between items-center mb-4" },
                            React.createElement("h3", { className: "text-lg font-black text-slate-900" }, "Email Template & Directory"),
                            React.createElement(Button, { variant: "secondary", icon: "check", onClick: saveEmailTemplateSettings }, "Simpan Template")
                        ),
                        React.createElement("div", { className: "grid gap-5 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-3" },
                                React.createElement(Field, { label: "Subject" }, React.createElement(TextInput, { value: emailSubjectTemplate, onChange: e => setEmailSubjectTemplate(e.target.value) })),
                                React.createElement(Field, { label: "Body" }, React.createElement(TextArea, { value: emailBodyTemplate, onChange: e => setEmailBodyTemplate(e.target.value), minRows: 5 }))
                            ),
                            React.createElement("div", null,
                                React.createElement("div", { className: "flex gap-2 mb-3" },
                                    React.createElement(TextInput, { value: emailDirectoryDraft.email, onChange: e => setEmailDirectoryDraft(s => ({ ...s, email: e.target.value })), placeholder: "email@domain.com" }),
                                    React.createElement(Button, { variant: "secondary", icon: "plus", onClick: saveEmailDirectoryItem }, "Add")
                                ),
                                React.createElement("div", { className: "h-32 overflow-y-auto border border-slate-100 rounded-xl p-2 space-y-1" },
                                    emailDirectory.map(item => React.createElement("div", { key: item.id, className: "flex justify-between items-center p-2 bg-slate-50 rounded-lg text-xs" },
                                        React.createElement("span", { className: "font-bold text-slate-700" }, item.email),
                                        React.createElement("button", { onClick: () => deleteEmailDirectoryItem(item.id), className: "text-red-500 hover:text-red-700" }, React.createElement(Icon, { name: "trash", className: "w-4 h-4" }))
                                    ))
                                )
                            )
                        )
                    ),
                    React.createElement("div", { className: "rounded-3xl border border-slate-200 bg-white p-5 mb-5" },
                        React.createElement("div", { className: "flex justify-between items-center mb-4" },
                            React.createElement("h3", { className: "text-lg font-black text-slate-900" }, "PDF Settings"),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(Button, { variant: "secondary", icon: "eraser", onClick: resetPdfSettings }, "Reset"),
                                React.createElement(Button, { variant: "secondary", icon: "check", onClick: () => applyPdfSettings({ tableFontSize: pdfTableFontSize, tableTitleFontSize: pdfTableTitleFontSize, evidenceFontSize: pdfEvidenceFontSize, tableExtraRows: pdfTableExtraRows, photoGridPerPage: pdfPhotoGridPerPage }, true) }, "Simpan PDF")
                            )
                        ),
                        React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-3" },
                            React.createElement(Field, { label: "Font Isi" }, React.createElement(TextInput, { type: "number", step: "0.5", value: pdfTableFontSize, onChange: e => setPdfTableFontSize(e.target.value) })),
                            React.createElement(Field, { label: "Font Judul" }, React.createElement(TextInput, { type: "number", step: "0.5", value: pdfTableTitleFontSize, onChange: e => setPdfTableTitleFontSize(e.target.value) })),
                            React.createElement(Field, { label: "Font Foto" }, React.createElement(TextInput, { type: "number", step: "0.5", value: pdfEvidenceFontSize, onChange: e => setPdfEvidenceFontSize(e.target.value) })),
                            React.createElement(Field, { label: "Extra Baris" }, React.createElement(TextInput, { type: "number", value: pdfTableExtraRows, onChange: e => setPdfTableExtraRows(e.target.value) })),
                            React.createElement(Field, { label: "Grid Foto" }, React.createElement(TextInput, { type: "number", value: pdfPhotoGridPerPage, onChange: e => setPdfPhotoGridPerPage(e.target.value) }))
                        )
                    )
                ),
                settingsTab === 'master' && React.createElement(React.Fragment, null, renderSchedulePanel(), renderMasterStorePanel()),
                React.createElement("div", { className: "hidden" },
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
                                    " • ",
                                    item.storeCode || '-',
                                    " • ",
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
                renderMasterStorePanel(),
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