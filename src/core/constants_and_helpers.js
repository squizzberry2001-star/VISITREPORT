const { useEffect, useMemo, useRef, useState, useCallback } = React;
// =============================================================
function convexEnabled() { return Boolean(window.RB_FIREBASE_CONFIG && window.RB_FIREBASE_CONFIG.enabled); }
function getConvexConfig() { return window.RB_FIREBASE_CONFIG || { collections: {} }; }

function getConvexDeploymentUrl() { return ''; }
function getConvexHttpUrl() { return ''; }
function convexUrl(path) { return ''; }

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
    emailTemplate: 'email_report_template',
    webSync: 'web_update_signal',
    schedule: 'rbv_schedule_config_v1',
    features: 'rbv_features_config_v1'
};
const MASTER_STORE_LOCAL_KEY = 'rbv_master_store_detail_rows_v200';
const MASTER_STORE_TEMPLATE_FILE = 'templates/master-data-detail-toko-template.xlsx';
const MASTER_STORE_TEMPLATE_HEADERS = [
    'siteCode', 'siteCode4', 'siteDescr', 'type', 'city', 'address',
    'emailStore', 'storeHead', 'areaManager', 'areaManagerEmail',
    'regionalManager', 'regionalManagerEmail', 'operationalStatus',
    'latitude', 'longitude', 'notes'
];

const BESTIE_LOGIN_KEY = 'rbv_bestie_login_v1';
const RBV_WEB_SYNC_SIGNAL_KEY = 'rbv_web_sync_signal_v202';
const RBV_PROGRESS_NOTIFICATION_ENABLED_KEY = 'rbv_progress_notification_enabled_v1';
const RBV_PROGRESS_NOTIFICATION_LAST_KEY = 'rbv_progress_notification_last_v1';
const RBV_PROGRESS_NOTIFICATION_INTERVAL_MS = 4 * 60 * 60 * 1000;
const RBV_PUSH_API_BASE_KEY = 'rbv_push_api_base_v1';
const RBV_PUSH_SUBSCRIPTION_SENT_KEY = 'rbv_push_subscription_sent_v1';

const BESTIE_LOGIN_DATA = [
    { nik: '210822947', name: 'Aan Bagus Permana' },
    { nik: '230723742', name: 'Anggi Novita' },
    { nik: '210923045', name: 'Aulia Fauziah' },
    { nik: '210823002', name: 'Bagus Pradika' },
    { nik: '210923054', name: 'Cindy Silvia Sahyu' },
    { nik: '210822948', name: 'Edi Sukarno' },
    { nik: '230623709', name: 'Fajar Saputra' },
    { nik: '230523581', name: 'Fendi Setiawan' },
    { nik: '210923070', name: 'Fiqri Amatul Firdaus' },
    { nik: '211123186', name: 'Karlina Endah Puji Astuti' },
    { nik: '200622511', name: 'Malik Ibrahim' },
    { nik: '230723758', name: 'Muhammad Fikri' },
    { nik: '201222610', name: 'Novilya Dwi Rahman' },
    { nik: '210722912', name: 'Rani Ismawati' },
    { nik: '210822981', name: 'Rully Alfandi' },
    { nik: '220623417', name: 'Seftiana Putri Rahmawati' },
    { nik: '230523599', name: 'Tia Fitri' },
    { nik: '230823803', name: 'Yuyun Yuliyanti' }
];
function normalizeNik(value) {
    return String(value || '').replace(/\D/g, '').slice(0, 12);
}
function findBestieByNik(value) {
    const nik = normalizeNik(value);
    return BESTIE_LOGIN_DATA.find((item) => item.nik === nik) || null;
}
function matchBestieScheduleName(schedName, bestieName) {
    if (!schedName || !bestieName) return false;
    const sn = String(schedName).toLowerCase().trim();
    const bn = String(bestieName).toLowerCase().trim();
    return sn === bn;
}
function findRegisteredLeaderboardBestie(schedName) {
    if (!schedName) return null;
    const foundName = BESTIE_NAMES.find((name) => matchBestieScheduleName(schedName, name));
    return foundName ? { name: foundName } : null;
}
function filterRegisteredLeaderboardSchedules(items) {
    if (!Array.isArray(items)) return [];
    const filtered = [];
    items.forEach((item) => {
        if (!item) return;
        const matched = findRegisteredLeaderboardBestie(item.nama || item.bestie || item.auditor || item.name || '');
        if (matched) {
            filtered.push({
                ...item,
                nama: matched.name
            });
        }
    });
    return filtered;
}
function readBestieLogin() {
    try {
        const parsed = JSON.parse(localStorage.getItem(BESTIE_LOGIN_KEY) || '{}');
        const nik = normalizeNik(parsed.nik);
        const found = findBestieByNik(nik);
        return found ? { nik: found.nik, name: found.name, loggedAt: parsed.loggedAt || 0 } : { nik: '', name: '' };
    }
    catch (error) {
        return { nik: '', name: '' };
    }
}
function saveBestieLogin(payload) {
    const found = findBestieByNik(payload && payload.nik);
    if (!found)
        return null;
    const next = { nik: found.nik, name: found.name, loggedAt: Date.now() };
    localStorage.setItem(BESTIE_LOGIN_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('rbv-bestie-login-change', { detail: next }));
    return next;
}

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
const APP_BUILD_VERSION = 'revamp327-modular-v77';
const APP_VERSION_KEY = 'rbv_app_version_v1';
const APP_RELOAD_LOCK_KEY = 'rbv_auto_reload_lock_v1';
const VERSION_ENDPOINT = 'version.json';
function cx(...classes) {
    return classes.filter(Boolean).join(' ');
}

// =============================================================
// Revamp 204: Lite Mobile Performance Mode
// =============================================================
const RBV_LITE_MODE = (() => {
    try {
        const params = new URLSearchParams(window.location.search || '');
        const forced = params.get('lite');
        if (forced === '0' || forced === 'false') return false;
        if (forced === '1' || forced === 'true') return true;
        const memory = Number(navigator.deviceMemory || 0);
        const cores = Number(navigator.hardwareConcurrency || 0);
        const smallScreen = Math.min(window.innerWidth || 9999, window.innerHeight || 9999) <= 430;
        const oldIos = /OS (1[0-4])_/i.test(navigator.userAgent || '');
        const oldAndroid = /Android\s([5-8])\b/i.test(navigator.userAgent || '');
        return oldIos || oldAndroid || (memory && memory <= 2) || (cores && cores <= 4 && smallScreen);
    } catch (error) {
        return false;
    }
})();
window.RBV_LITE_MODE = RBV_LITE_MODE;
// =============================================================
// Revamp 220: Ultra Lite Camera Mode for low-memory Android devices
// =============================================================
const RBV_ULTRA_LITE_CAMERA_MODE = (() => {
    try {
        const params = new URLSearchParams(window.location.search || '');
        const forced = params.get('ultracam') || params.get('cameraLite') || params.get('camera_lite');
        if (forced === '0' || forced === 'false') return false;
        if (forced === '1' || forced === 'true') return true;
        const ua = String(navigator.userAgent || '').toLowerCase();
        const memory = Number(navigator.deviceMemory || 0);
        const cores = Number(navigator.hardwareConcurrency || 0);
        const smallScreen = Math.min(window.innerWidth || 9999, window.innerHeight || 9999) <= 480;
        const lowMemoryBrand = /infinix|tecno|itel|redmi|m200|realme|oppo|vivo|android go/i.test(ua);
        return RBV_LITE_MODE || (smallScreen && lowMemoryBrand) || (memory && memory <= 3) || (smallScreen && cores && cores <= 4);
    } catch (error) {
        return RBV_LITE_MODE;
    }
})();
window.RBV_ULTRA_LITE_CAMERA_MODE = RBV_ULTRA_LITE_CAMERA_MODE;
window.RBV_ACTIVE_MEDIA_STREAMS = window.RBV_ACTIVE_MEDIA_STREAMS || new Set();
function rbvRememberMediaStream(stream) {
    try {
        if (stream && window.RBV_ACTIVE_MEDIA_STREAMS) window.RBV_ACTIVE_MEDIA_STREAMS.add(stream);
    } catch (error) {}
    return stream;
}
function rbvReleaseCameraResources() {
    try {
        if (window.RBV_ACTIVE_MEDIA_STREAMS) {
            Array.from(window.RBV_ACTIVE_MEDIA_STREAMS).forEach((stream) => {
                try { stream.getTracks?.().forEach((track) => track.stop()); } catch (error) {}
                try { window.RBV_ACTIVE_MEDIA_STREAMS.delete(stream); } catch (error) {}
            });
        }
        document.querySelectorAll('video').forEach((video) => {
            try {
                const stream = video.srcObject;
                if (stream?.getTracks) stream.getTracks().forEach((track) => track.stop());
                video.pause?.();
                video.srcObject = null;
                video.removeAttribute('src');
                video.load?.();
            } catch (error) {}
        });
    } catch (error) {}
}
function getNativeCameraCaptureAttr() {
    try {
        const ua = navigator?.userAgent || '';
        if (/Android/i.test(ua)) return 'camera';
        return 'environment';
    } catch (error) {
        return 'environment';
    }
}
function rbvPrepareCameraCapture() {
    if (!RBV_ULTRA_LITE_CAMERA_MODE) return;
    try {
        document.documentElement.classList.add('rbv-camera-capture-active');
        document.body?.classList.add('rbv-camera-capture-active');
        rbvReleaseCameraResources();
    } catch (error) {}
}
function rbvFinishCameraCapture() {
    if (!RBV_ULTRA_LITE_CAMERA_MODE) return;
    window.setTimeout(() => {
        try {
            document.documentElement.classList.remove('rbv-camera-capture-active');
            document.body?.classList.remove('rbv-camera-capture-active');
            rbvReleaseCameraResources();
        } catch (error) {}
    }, 80);
}
try {
    document.documentElement.classList.toggle('rbv-lite-mode', RBV_LITE_MODE);
    document.documentElement.classList.toggle('rbv-ultra-lite-camera', RBV_ULTRA_LITE_CAMERA_MODE);
    document.documentElement.classList.add('rbv-lazy-libs');
} catch (error) {}
const RBV_LIBS = {
    xlsx: 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
    qrcode: 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js',
    jsqr: 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',
    jspdf: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    autotable: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js',
    pdfjs: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    jszip: 'jszip.min.js?v=' + encodeURIComponent(APP_BUILD_VERSION),
    pdfAssets: 'src/pdf-template-assets.js?v=' + encodeURIComponent(APP_BUILD_VERSION),
    pdfGenerator: 'pdf-generator.js?v=' + encodeURIComponent(APP_BUILD_VERSION),
    caExport: 'ca-assignment-export.js?v=' + encodeURIComponent(APP_BUILD_VERSION),
    heic2any: 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js'
};
const rbvScriptPromises = new Map();
function loadScriptOnce(src, globalCheck) {
    if (typeof globalCheck === 'function') {
        try { if (globalCheck()) return Promise.resolve(true); } catch (error) {}
    }
    if (rbvScriptPromises.has(src)) return rbvScriptPromises.get(src);
    const promise = new Promise((resolve, reject) => {
        const existing = Array.from(document.scripts || []).find((script) => script.src && script.src.includes(src.split('?')[0]));
        if (existing) {
            existing.addEventListener('load', () => resolve(true), { once: true });
            existing.addEventListener('error', () => reject(new Error('Gagal memuat library: ' + src)), { once: true });
            if (typeof globalCheck === 'function') {
                setTimeout(() => { try { if (globalCheck()) resolve(true); } catch (error) {} }, 30);
            }
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Gagal memuat library: ' + src));
        document.head.appendChild(script);
    });
    rbvScriptPromises.set(src, promise);
    return promise;
}
async function ensureXlsxReady() {
    await loadScriptOnce(RBV_LIBS.xlsx, () => !!window.XLSX?.read);
    return window.XLSX;
}
async function ensureQrGeneratorReady() {
    await loadScriptOnce(RBV_LIBS.qrcode, () => !!window.QRCode?.toDataURL);
    return window.QRCode;
}
async function ensureQrScannerReady() {
    await loadScriptOnce(RBV_LIBS.jsqr, () => !!window.jsQR);
    return window.jsQR;
}
function getJsPdfConstructor() {
    return window.jspdf?.jsPDF || window.jsPDF || null;
}
function ensureJsPdfAutoTableAttached() {
    const jsPDF = getJsPdfConstructor();
    if (!jsPDF)
        return false;
    if (typeof jsPDF.API?.autoTable === 'function') {
        try {
            const testDoc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            return typeof testDoc.autoTable === 'function';
        }
        catch (error) {
            return true;
        }
    }
    const plugin = window.jspdfAutoTable || window.jsPDF?.autoTable || window.autoTable;
    const autoTableFn = typeof plugin === 'function'
        ? plugin
        : typeof plugin?.default === 'function'
            ? plugin.default
            : typeof plugin?.autoTable === 'function'
                ? plugin.autoTable
                : null;
    try {
        if (typeof plugin?.applyPlugin === 'function')
            plugin.applyPlugin(jsPDF);
        if (typeof window.jspdfAutoTable?.applyPlugin === 'function')
            window.jspdfAutoTable.applyPlugin(jsPDF);
    }
    catch (error) {
        console.warn('AutoTable applyPlugin gagal:', error);
    }
    if (typeof jsPDF.API?.autoTable === 'function')
        return true;
    if (autoTableFn && jsPDF.API) {
        jsPDF.API.autoTable = function autoTableBridge(options) {
            return autoTableFn(this, options || {});
        };
        return true;
    }
    return false;
}
async function ensurePdfEngineReady() {
    await loadScriptOnce(RBV_LIBS.jspdf, () => !!getJsPdfConstructor());
    await loadScriptOnce(RBV_LIBS.autotable, () => ensureJsPdfAutoTableAttached());
    if (!ensureJsPdfAutoTableAttached())
        throw new Error('Plugin tabel PDF belum siap. Coba reload halaman lalu buka Preview lagi.');
    await loadScriptOnce(RBV_LIBS.pdfAssets, () => !!window.ReportVisitAssets || !!window.PDF_TEMPLATE_ASSETS || !!window.RBV_PDF_TEMPLATE_ASSETS);
    await loadScriptOnce(RBV_LIBS.pdfGenerator, () => !!window.ReportVisitPDF?.createBlob);
    if (!ensureJsPdfAutoTableAttached())
        throw new Error('Plugin tabel PDF belum aktif setelah mesin PDF dimuat.');
    return window.ReportVisitPDF;
}
async function ensurePdfPreviewReady() {
    await loadScriptOnce(RBV_LIBS.pdfjs, () => !!window.pdfjsLib?.getDocument);
    return window.pdfjsLib;
}
async function ensureCaExportReady() {
    await loadScriptOnce(RBV_LIBS.jszip, () => typeof window.JSZip !== 'undefined');
    await loadScriptOnce(RBV_LIBS.caExport, () => !!window.__caAssignmentExport?.buildWorkbook);
    return window.__caAssignmentExport;
}

const RBV_PHOTO_EXTENSION_RE = /\.(jpe?g|jfif|pjpeg|png|webp|gif|heic|heif|avif|bmp|dib|tiff?|svg|ico)$/i;
const RBV_PHOTO_MIME_BY_EXT = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', jfif: 'image/jpeg', pjpeg: 'image/jpeg',
    png: 'image/png', webp: 'image/webp', gif: 'image/gif', heic: 'image/heic', heif: 'image/heif',
    avif: 'image/avif', bmp: 'image/bmp', dib: 'image/bmp', tif: 'image/tiff', tiff: 'image/tiff',
    svg: 'image/svg+xml', ico: 'image/x-icon'
};
function rbvPhotoExtension(file) {
    const name = String(file?.name || '').toLowerCase();
    const match = name.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : '';
}
function rbvGuessPhotoMime(file) {
    const type = String(file?.type || '').toLowerCase().trim();
    if (/^image\//i.test(type)) return type;
    const ext = rbvPhotoExtension(file);
    return RBV_PHOTO_MIME_BY_EXT[ext] || 'image/jpeg';
}
function rbvIsProbablyPhotoFile(file) {
    if (!file) return false;
    const type = String(file.type || '').toLowerCase().trim();
    const name = String(file.name || '').toLowerCase().trim();
    if (/^image\//i.test(type)) return true;
    if (RBV_PHOTO_EXTENSION_RE.test(name)) return true;
    // Be permissive for mobile camera/gallery files: some Android browsers return empty MIME/name.
    // The input accept already limits the picker to images, so unknown binary is allowed and normalized.
    if (!type || type === 'application/octet-stream') return true;
    return false;
}
function rbvIsHeicLike(file) {
    const type = String(file?.type || '').toLowerCase();
    const ext = rbvPhotoExtension(file);
    return /heic|heif/.test(type) || ext === 'heic' || ext === 'heif';
}
async function ensureHeic2AnyReady() {
    if (typeof window.heic2any === 'function') return window.heic2any;
    await loadScriptOnce(RBV_LIBS.heic2any, () => typeof window.heic2any === 'function');
    if (typeof window.heic2any !== 'function') throw new Error('Converter HEIC belum siap. Pastikan koneksi internet aktif lalu coba lagi.');
    return window.heic2any;
}
async function rbvConvertHeicToJpegDataUrl(file) {
    const heic2any = await ensureHeic2AnyReady();
    const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: RBV_ULTRA_LITE_CAMERA_MODE ? 0.62 : 0.76 });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    if (!blob) throw new Error('HEIC gagal dikonversi ke JPG.');
    return fileToDataUrl(blob);
}
function rbvNormalizePhotoDataUrl(dataUrl, file) {
    let value = String(dataUrl || '');
    if (!value) return '';
    if (/^data:image\//i.test(value)) return value;
    const mime = rbvGuessPhotoMime(file);
    if (/^data:[^;]+;/i.test(value)) return value.replace(/^data:[^;]+;/i, `data:${mime};`);
    if (/^data:;base64,/i.test(value)) return value.replace(/^data:;base64,/i, `data:${mime};base64,`);
    return value;
}
async function compressImageFileForLite(file, options = {}) {
    const maxSide = Number(options.maxSide || (RBV_ULTRA_LITE_CAMERA_MODE ? 900 : (RBV_LITE_MODE ? 1180 : 1500)));
    const quality = Number(options.quality || (RBV_ULTRA_LITE_CAMERA_MODE ? 0.58 : (RBV_LITE_MODE ? 0.68 : 0.78)));
    if (!file) throw new Error('File foto tidak ditemukan.');
    if (Number(file.size || 0) <= 0) throw new Error('File foto kosong. Coba ambil/pilih ulang foto.');
    const type = String(file.type || '').toLowerCase();
    const name = String(file.name || '').toLowerCase();
    if (!rbvIsProbablyPhotoFile(file)) throw new Error('File yang dipilih bukan gambar.');

    let canvas = null;
    let source = null;
    let objectUrl = '';
    try {
        try {
            if (typeof window.createImageBitmap === 'function') {
                source = await window.createImageBitmap(file, { imageOrientation: 'from-image' });
            }
        } catch (bitmapError) {
            source = null;
        }
        if (!source) {
            objectUrl = URL.createObjectURL(file);
            source = await loadImageElement(objectUrl);
        }
        const sourceWidth = source.naturalWidth || source.width || 1;
        const sourceHeight = source.naturalHeight || source.height || 1;
        const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
        canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(sourceWidth * scale));
        canvas.height = Math.max(1, Math.round(sourceHeight * scale));
        const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
        if (!ctx) throw new Error('Canvas browser tidak siap.');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = RBV_ULTRA_LITE_CAMERA_MODE ? 'low' : 'medium';
        ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise((resolve) => {
            try {
                canvas.toBlob(resolve, 'image/jpeg', Math.max(0.46, Math.min(0.84, quality)));
            } catch (error) {
                resolve(null);
            }
        });
        if (blob) return fileToDataUrl(blob);
        return canvas.toDataURL('image/jpeg', Math.max(0.46, Math.min(0.84, quality)));
    } catch (error) {
        console.warn('Kompresi/decode foto gagal, mencoba baca file asli:', error);
        if (rbvIsHeicLike(file)) {
            try { return await rbvConvertHeicToJpegDataUrl(file); } catch (heicError) { console.warn('Konversi HEIC gagal, simpan file asli:', heicError); }
        }
        return rbvNormalizePhotoDataUrl(await fileToDataUrl(file), file);
    } finally {
        try { if (objectUrl) URL.revokeObjectURL(objectUrl); } catch (error) {}
        try { if (source && typeof source.close === 'function') source.close(); } catch (error) {}
        try {
            if (source && source.tagName === 'IMG') source.src = '';
            if (canvas) { canvas.width = 1; canvas.height = 1; }
        } catch (error) {}
    }
}
function rbvPhotoReadErrorMessage(error) {
    const message = cleanText(error?.message || error, 'Foto gagal dibaca.');
    if (/quota|storage|disk|space|full|exceeded/i.test(message)) {
        return 'Storage browser penuh. Hapus beberapa history/foto lama lalu coba lagi.';
    }
    if (/heic|heif|converter/i.test(message)) return message;
    if (/kosong|bukan gambar|tidak ditemukan/i.test(message)) return message;
    if (/security|permission|denied|notallowed/i.test(message)) return 'Browser menolak akses file/foto. Tutup web lalu buka ulang, kemudian pilih foto lagi.';
    return 'Foto gagal dibaca: ' + message;
}
async function rbvGetActiveVisitContext() {
    try {
        if (window._rbvActiveVisitContext) return window._rbvActiveVisitContext;
        const activeId = localStorage.getItem(ACTIVE_VISIT_KEY);
        if (activeId) {
            const visit = await getVisitRecord(activeId);
            if (visit) {
                return {
                    storeName: visit.storeName || visit.store || 'FamilyMart',
                    storeCode: visit.storeCode || 'FMI',
                    location: visit.location || null
                };
            }
        }
    } catch(e) {}
    return { storeName: 'FamilyMart', storeCode: 'FMI', location: null };
}
async function rbvApplyPhotoWatermark(dataUrl, options = {}) {
    if (!dataUrl || typeof document === 'undefined') return dataUrl;
    try {
        const ctxMeta = await rbvGetActiveVisitContext();
        const storeName = options.storeName || ctxMeta.storeName || 'FamilyMart';
        const storeCode = options.storeCode || ctxMeta.storeCode || 'FMI';
        let lat = ctxMeta.location?.lat;
        let lng = ctxMeta.location?.lng;
        
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            try {
                if ('geolocation' in navigator) {
                    const pos = await new Promise((res, rej) => {
                        navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: false, timeout: 800 });
                    });
                    if (pos && pos.coords) {
                        lat = pos.coords.latitude;
                        lng = pos.coords.longitude;
                    }
                }
            } catch (gpsErr) {}
        }

        const dateStr = new Date().toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).replace('.', ':') + ' WIB';

        const gpsStr = (typeof lat === 'number' && typeof lng === 'number')
            ? `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
            : 'GPS: (Lokasi Tidak Tersedia)';

        const img = await new Promise((resolve, reject) => {
            const imageObj = new Image();
            imageObj.onload = () => resolve(imageObj);
            imageObj.onerror = () => reject(new Error('Image load error'));
            imageObj.src = dataUrl;
        });

        const canvas = document.createElement('canvas');
        const width = img.naturalWidth || img.width || 800;
        const height = img.naturalHeight || img.height || 600;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return dataUrl;

        ctx.drawImage(img, 0, 0, width, height);

        const bannerHeight = Math.max(54, Math.round(height * 0.11));
        const accentHeight = Math.max(3, Math.round(height * 0.006));
        const fontSizeTop = Math.max(14, Math.round(bannerHeight * 0.32));
        const fontSizeBottom = Math.max(12, Math.round(bannerHeight * 0.25));

        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

        ctx.fillStyle = '#10b981';
        ctx.fillRect(0, height - bannerHeight, width, accentHeight);

        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'middle';
        const paddingX = Math.max(14, Math.round(width * 0.03));
        
        ctx.font = `bold ${fontSizeTop}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        const topY = height - bannerHeight + (bannerHeight * 0.33);
        ctx.fillText(`🏢 ${storeName} (${storeCode})`, paddingX, topY);

        ctx.font = `500 ${fontSizeBottom}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        const bottomY = height - bannerHeight + (bannerHeight * 0.73);
        ctx.fillText(`📅 ${dateStr} • 📍 ${gpsStr}`, paddingX, bottomY);

        const quality = Number(options.quality || 0.85);
        return canvas.toDataURL('image/jpeg', quality);
    } catch (e) {
        console.warn('Watermark error, fallback raw image:', e);
        return dataUrl;
    }
}
async function rbvReadEvidenceFiles(files, options = {}) {
    const list = Array.from(files || []).filter(Boolean);
    const result = [];
    const errors = [];
    const maxFiles = Math.max(1, Number(options.maxFiles || 40));
    const selected = list.slice(0, maxFiles);
    async function readAnyPhotoFile(file) {
        if (!file) throw new Error('File foto tidak ditemukan.');
        if (Number(file.size || 0) <= 0) throw new Error('File foto kosong. Coba ambil/pilih ulang foto.');
        const isPhotoLike = rbvIsProbablyPhotoFile(file);
        let dataUrl = '';
        if (rbvIsHeicLike(file)) {
            try { dataUrl = await rbvConvertHeicToJpegDataUrl(file); } catch (error) { console.warn('Konversi HEIC gagal, lanjut raw reader:', error); }
        }
        if (!dataUrl) {
            try { dataUrl = rbvNormalizePhotoDataUrl(await fileToDataUrl(file), file); } catch (error) { console.warn('Raw FileReader gagal:', error); }
        }
        // Jika raw data terlalu besar, coba kompres; kalau kompres gagal tetap pakai raw agar upload tidak gagal.
        const largeRaw = dataUrl && dataUrl.length > (RBV_ULTRA_LITE_CAMERA_MODE ? 900000 : 1800000);
        if ((largeRaw || !dataUrl) && isPhotoLike && !/^data:image\/(svg|gif)/i.test(dataUrl || '')) {
            try {
                const compressed = await compressImageFileForLite(file, options);
                if (compressed) dataUrl = rbvNormalizePhotoDataUrl(compressed, file);
            } catch (error) {
                console.warn('Kompresi fallback gagal, pakai raw/object URL:', error);
            }
        }
        if (dataUrl) return { image: rbvNormalizePhotoDataUrl(dataUrl, file), objectUrl: '' };
        // Last-resort untuk browser yang menolak FileReader tapi masih bisa preview blob dari picker.
        try {
            const objectUrl = URL.createObjectURL(file);
            if (objectUrl) return { image: objectUrl, objectUrl };
        } catch (error) {}
        throw new Error('Browser tidak mengirim data foto. Coba pilih ulang dari Galeri, bukan dari Recent/Cloud.');
    }
    for (const file of selected) {
        try {
            const { image: rawImage, objectUrl } = await readAnyPhotoFile(file);
            const image = await rbvApplyPhotoWatermark(rawImage, options);
            result.push({
                ...blankPhoto(),
                image,
                objectUrl: objectUrl || '',
                cropAspect: ratioToAspectString(PDF_PHOTO_CROP_RATIO),
                uploadedAt: nowIso(),
                sourceName: file.name || '',
                sourceType: rbvGuessPhotoMime(file),
                sourceSize: Number(file.size || 0)
            });
            await new Promise((resolve) => setTimeout(resolve, 0));
        } catch (error) {
            console.warn('Foto evidence gagal diproses:', error, file);
            errors.push(error);
        }
    }
    if (list.length > selected.length) {
        errors.push(new Error(`${list.length - selected.length} foto belum dimasukkan karena batas sekali upload ${maxFiles} foto.`));
    }
    return { result, errors };
}
function rbvIdle(callback, timeout = 600) {
    if (window.requestIdleCallback) return window.requestIdleCallback(callback, { timeout });
    return window.setTimeout(callback, Math.min(timeout, 250));
}

function nowIso() {
    try {
        return new Date().toISOString();
    }
    catch (error) {
        return String(Date.now());
    }
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
const SCHEDULE_CONFIG_KEY = 'rbv_schedule_config_v1';

function readFeaturesConfig() {
    try {
        const raw = localStorage.getItem('rbv_features_config_v1');
        const parsed = raw ? JSON.parse(raw) : {};
        const safeParsed = (parsed && typeof parsed === 'object') ? parsed : {};
        return {
            map: safeParsed.map !== false,
            ai: safeParsed.ai !== false,
            trend: safeParsed.trend !== false,
            leaderboard: safeParsed.leaderboard !== false
        };
    } catch (e) { return { map: true, ai: true, trend: true, leaderboard: true }; }
}
function saveFeaturesConfig(config) {
    localStorage.setItem('rbv_features_config_v1', JSON.stringify(config));
    window.dispatchEvent(new Event('rbv-features-config-change'));
    return syncAppConfigToConvex(APP_CONFIG_KEYS.features, config);
}

function readScheduleConfig() {
    try {
        const parsed = JSON.parse(localStorage.getItem(SCHEDULE_CONFIG_KEY) || '[]');
        return filterRegisteredLeaderboardSchedules(Array.isArray(parsed) ? parsed : []);
    }
    catch (error) { return []; }
}
function saveScheduleConfig(items) {
    const next = filterRegisteredLeaderboardSchedules(items);
    localStorage.setItem(SCHEDULE_CONFIG_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('rbv-schedule-config-change'));
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
function normalizeMasterStoreCode(value) {
    const text = cleanText(value);
    if (!text)
        return '';
    const raw = text.replace(/\.0$/, '');
    return /^\d+$/.test(raw) ? raw.padStart(Math.min(Math.max(raw.length, 4), 8), '0') : raw;
}
function rbvNormalizeMasterHeaderKey(value) {
    return normalize(String(value || ''))
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');
}
function pickMasterStoreValue(row, keys, fallback = '') {
    const source = row || {};
    for (const key of keys) {
        if (source[key] !== undefined && source[key] !== null && String(source[key]).trim() !== '')
            return source[key];
    }
    const normalizedKeys = new Set(keys.map(rbvNormalizeMasterHeaderKey));
    for (const [rawKey, value] of Object.entries(source)) {
        if (value === undefined || value === null || String(value).trim() === '') continue;
        if (normalizedKeys.has(rbvNormalizeMasterHeaderKey(rawKey))) return value;
    }
    return fallback;
}
function normalizeMasterStoreRow(row, index = 0) {
    const source = row && typeof row === 'object' ? row : {};
    const siteCode4 = normalizeMasterStoreCode(pickMasterStoreValue(source, ['siteCode4', 'Site Code 4', 'SITE_CODE4', 'Site', 'SITE', 'Kode Toko', 'Kode Store', 'Store Code', 'kodeToko', 'kodeStore', 'storeCode', 'store_code', 'site']));
    const siteCode = cleanText(pickMasterStoreValue(source, ['siteCode', 'Site Code', 'SITE_CODE', 'Site', 'SITE', 'code', 'kode', 'kodeStore', 'storeCode']));
    const siteDescr = cleanText(pickMasterStoreValue(source, ['siteDescr', 'Site Descr', 'Site Description', 'SITE_DESCR', 'Nama Toko', 'Nama Store', 'Store Name', 'namaToko', 'namaStore', 'storeName', 'store_name', 'name']));
    const status = cleanText(pickMasterStoreValue(source, ['operationalStatus', 'Operational Status', 'status', 'Status'], 'active')).toLowerCase();
    const typeStore = cleanText(pickMasterStoreValue(source, ['type', 'Type', 'typeStore', 'Type Store', 'TYPE STORE', 'Jenis', 'Jenis Store', 'jenis', 'formatStore', 'Format Store']));
    const emailStore = cleanText(pickMasterStoreValue(source, ['emailStore', 'Email Store', 'EMAIL STORE', 'Email Toko', 'Email', 'EMAIL', 'storeEmail', 'Store Email', 'email_store', 'mailStore', 'Mail Store'])).toLowerCase();
    return {
        id: cleanText(source.id || source._id || siteCode4 || siteCode || `master-${index}`),
        siteCode,
        siteCode4,
        siteDescr,
        type: typeStore,
        typeStore,
        city: cleanText(pickMasterStoreValue(source, ['city', 'City', 'Kota', 'kota'])),
        address: cleanText(pickMasterStoreValue(source, ['address', 'Address', 'Alamat', 'Alamat Store', 'alamat', 'alamatStore'])),
        emailStore,
        storeHead: cleanText(pickMasterStoreValue(source, ['storeHead', 'Store Head', 'STORE HEAD', 'Kepala Toko', 'kepalaToko', 'headStore'])),
        areaManager: cleanText(pickMasterStoreValue(source, ['areaManager', 'Area Manager', 'AREA MANAGER', 'Nama Area Manager', 'am', 'AM'])),
        areaManagerEmail: cleanText(pickMasterStoreValue(source, ['areaManagerEmail', 'Area Manager Email', 'Email Area Manager', 'amEmail', 'AM Email'])).toLowerCase(),
        regionalManager: cleanText(pickMasterStoreValue(source, ['regionalManager', 'Regional Manager', 'REGIONAL MANAGER', 'Nama Regional Manager', 'rm', 'RM'])),
        regionalManagerEmail: cleanText(pickMasterStoreValue(source, ['regionalManagerEmail', 'Regional Manager Email', 'Email Regional Manager', 'rmEmail', 'RM Email'])).toLowerCase(),
        operationalStatus: ['inactive', 'temporary_closed'].includes(status) ? status : 'active',
        latitude: cleanText(pickMasterStoreValue(source, ['latitude', 'lat'])),
        longitude: cleanText(pickMasterStoreValue(source, ['longitude', 'lng', 'lon'])),
        notes: cleanText(pickMasterStoreValue(source, ['notes', 'note', 'Catatan', 'catatan'])),
        updatedAt: cleanText(source.updatedAt || source.updated_at || new Date().toISOString())
    };
}
function normalizeMasterStoreRows(rows) {
    const input = Array.isArray(rows) ? rows : [];
    return uniqueBy(input.map((row, index) => normalizeMasterStoreRow(row, index)).filter((row) => row.siteDescr || row.siteCode4 || row.siteCode), (row) => normalize(row.siteCode4 || row.siteCode || row.siteDescr));
}
function readLocalMasterStores() {
    const local = normalizeMasterStoreRows(readJsonArray(MASTER_STORE_LOCAL_KEY));
    return local.length ? local : normalizeMasterStoreRows(MASTER_STORES);
}
function saveLocalMasterStores(rows) {
    const normalized = normalizeMasterStoreRows(rows);
    localStorage.setItem(MASTER_STORE_LOCAL_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent('rbv-master-store-change', { detail: normalized }));
    return normalized;
}
function getEffectiveMasterStores() {
    return readLocalMasterStores();
}
async function downloadMasterStoreTemplateExcel() {
    const sampleRows = [
        ['1', '0001', 'CIBUBUR', 'FamiSuper', 'Depok', 'Jl. Alternatif Cibubur, Depok', 'store.fmcibubur@familymartindonesia.com', 'Nama Store Head', 'Nama Area Manager', 'area.manager@email.com', 'Nama Regional Manager', 'regional.manager@email.com', 'active', '', '', 'Contoh baris, boleh dihapus'],
        ['2', '0002', 'BULUNGAN', 'CVS', 'Jakarta Selatan', 'Jl. Raya Bulungan No. 18', 'store.bulungan@familymartindonesia.com', '', '', '', '', '', 'active', '', '', '']
    ];
    try { await ensureXlsxReady(); } catch (error) { console.warn('XLSX lazy-load gagal:', error); }
    if (window.XLSX?.utils?.book_new) {
        const workbook = window.XLSX.utils.book_new();
        const sheet = window.XLSX.utils.aoa_to_sheet([MASTER_STORE_TEMPLATE_HEADERS, ...sampleRows]);
        sheet['!cols'] = MASTER_STORE_TEMPLATE_HEADERS.map((header) => ({ wch: ['address', 'emailStore', 'areaManagerEmail', 'regionalManagerEmail', 'notes'].includes(header) ? 34 : 18 }));
        window.XLSX.utils.book_append_sheet(workbook, sheet, 'Master Data Toko');
        window.XLSX.writeFile(workbook, 'master-data-detail-toko-template.xlsx');
        return;
    }
    const link = document.createElement('a');
    link.href = MASTER_STORE_TEMPLATE_FILE + '?v=' + encodeURIComponent(APP_BUILD_VERSION);
    link.download = 'master-data-detail-toko-template.xlsx';
    document.body.appendChild(link);
    link.click();
    link.remove();
}
async function parseMasterStoreExcelFile(file) {
    await ensureXlsxReady();
    return new Promise((resolve, reject) => {
        if (!window.XLSX?.read) {
            reject(new Error('Library Excel belum termuat. Reload halaman lalu coba lagi.'));
            return;
        }
        const reader = new FileReader();
        reader.onerror = () => reject(reader.error || new Error('File gagal dibaca.'));
        reader.onload = () => {
            try {
                const workbook = window.XLSX.read(new Uint8Array(reader.result), { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const matrix = window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', blankrows: false });
                const normalizeHeader = (value) => normalize(String(value || '')).replace(/\s+/g, '');
                const headerIndex = matrix.findIndex((row) => {
                    const keys = (row || []).map(normalizeHeader);
                    const hasCode = keys.includes('site') || keys.includes('sitecode') || keys.includes('sitecode4') || keys.includes('kodetoko') || keys.includes('kodestore') || keys.includes('storecode');
                    const hasName = keys.includes('sitedescr') || keys.includes('sitedescription') || keys.includes('namatoko') || keys.includes('namastore') || keys.includes('storename');
                    const hasUsefulDetail = keys.includes('typestore') || keys.includes('emailstore') || keys.includes('emailtoko') || keys.includes('storehead') || keys.includes('areamanager') || keys.includes('regionalmanager');
                    return hasCode && (hasName || hasUsefulDetail);
                });
                let rows;
                if (headerIndex >= 0) {
                    const headers = (matrix[headerIndex] || []).map((cell) => cleanText(cell));
                    rows = matrix.slice(headerIndex + 1).map((line) => {
                        const object = {};
                        headers.forEach((header, index) => {
                            if (header)
                                object[header] = line[index];
                        });
                        return object;
                    });
                }
                else {
                    rows = window.XLSX.utils.sheet_to_json(sheet, { defval: '' });
                }
                resolve(normalizeMasterStoreRows(rows));
            }
            catch (error) {
                reject(error);
            }
        };
        reader.readAsArrayBuffer(file);
    });
}

const BESTIE_NAMES = uniqueBy([...BESTIE_LOGIN_DATA.map((item) => item.name), ...BESTIE_ASSIGNMENTS.map((item) => cleanText(item.bestieName))].filter(Boolean).sort((a, b) => a.localeCompare(b)), (item) => item);
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
    const userStores = assigned.length ? assigned : fallback;
    const otherStores = getEffectiveMasterStores().map((item) => ({
        label: cleanText(item.siteDescr),
        source: 'master',
        master: item,
        value: cleanText(item.siteDescr)
    })).filter((item) => item.label && !userStores.some(u => normalize(u.label) === normalize(item.label)));
    
    const combined = [...userStores, ...approvedManual];
    const uniqueCombined = uniqueBy(combined, (item) => normalize(item.label)).sort((a, b) => a.label.localeCompare(b.label));
    
    if (uniqueCombined.length && otherStores.length) {
        uniqueCombined.push({ label: '─── Store Lainnya ───', value: '___SEPARATOR___', disabled: true });
    }
    
    return [...uniqueCombined, ...otherStores];
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
    return getEffectiveMasterStores().find((item) => normalize(item.siteDescr) === key || normalize(item.siteCode) === key || normalize(item.siteCode4) === key) || null;
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
    const login = readBestieLogin();
    const resolvedBestie = cleanText(bestieName, login.name || '');
    const now = Date.now();
    return {
        id: `visit_${now}_${Math.random().toString(36).slice(2, 8)}`,
        createdAt: now,
        updatedAt: now,
        bestieNik: login.name && normalize(login.name) === normalize(resolvedBestie) ? login.nik : '',
        nama: resolvedBestie,
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
        findingEvidencePhotos: [],
        correctiveActionPhotos: [],
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
    return ['temuan', 'finding', 'observation', 'description', 'desc', 'kondisiIdeal', 'dampak', 'penyebab', 'tindakan', 'deadline', 'hasil'].some((key) => cleanText(row?.[key]));
}
function isEditableTarget(target) {
    const node = target instanceof Element ? target : null;
    if (!node)
        return false;
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
    return Math.round((flat.filter(Boolean).length / flat.length) * 100);
}
function visitProgress(visit, activeSection = null) {
    if (!visit) return 0;
    if (typeof visit.progress === 'number' && visit.progress > 0 && !visit.qscData && !visit.opiData && !visit.findingEvidencePhotos) {
        return Math.max(0, Math.min(100, Math.round(visit.progress)));
    }
    const sectionChecks = visitProgressChecks(visit);
    if (Number.isInteger(activeSection) && typeof SECTION_DEFS !== 'undefined' && SECTION_DEFS && SECTION_DEFS[activeSection]) {
        const sectionId = SECTION_DEFS[activeSection].id;
        return rbvProgressFromChecks((sectionChecks[sectionId] || []).map((item) => item.value));
    }
    return rbvProgressFromChecks(Object.values(sectionChecks).map((items) => items.map((item) => item.value)));
}

function visitProgressChecks(visit) {
    const qscPhotos = normalizeQscPhotos(visit);
    const findingRows = visit.findingEvidencePhotos || [];
    const correctiveRows = visit.correctiveActionPhotos || [];
    const crewRows = Array.isArray(visit.crewList) ? visit.crewList : [];
    return {
        setup: [
            { label: 'Nama Bestie', value: visit.nama },
            { label: 'Store', value: visit.store }
        ],
        crew: [
            { label: 'Tanggal Visit', value: visit.tanggal },
            { label: 'Store Leader', value: visit.storeLeader },
            { label: 'Level Store Leader', value: visit.storeLeaderLevel },
            { label: 'Shift Leader', value: visit.shiftLeader },
            { label: 'Level Shift Leader', value: visit.shiftLeaderLevel },
            { label: 'Crew Store', value: crewRows.some((crew) => cleanText(crew.name) || cleanText(crew.level)) }
        ],
        'qsc-result': [
            { label: 'Foto FAMITRACK Result', value: qscPhotos[0]?.image },
            { label: 'Foto QSC Result', value: qscPhotos[1]?.image }
        ],
        observation: [
            { label: 'Tabel OPI', value: visit.showOPITable !== false ? (visit.opiData || []).some(isMeaningfulObservation) : true },
            { label: 'Tabel QSC', value: visit.showQSCTable !== false ? (visit.qscData || []).some(isMeaningfulObservation) : true }
        ],
        evidence: [
            { label: 'Finding Evidence', value: visit.showFindingEvidence !== false ? findingRows.some((photo) => photo.image || cleanText(photo.description)) : true },
            { label: 'Corrective Action', value: visit.showCorrectiveAction !== false ? correctiveRows.some((photo) => photo.image || cleanText(photo.description)) : true }
        ]
    };
}
function visitProgressMissingItems(visit, activeSection = null) {
    if (!visit) return [];
    const sectionChecks = visitProgressChecks(visit);
    let sectionIds = Object.keys(sectionChecks);
    if (Number.isInteger(activeSection) && typeof SECTION_DEFS !== 'undefined' && SECTION_DEFS && SECTION_DEFS[activeSection]) {
        sectionIds = [SECTION_DEFS[activeSection].id];
    }
    const includeSectionName = sectionIds.length > 1;
    return sectionIds.flatMap((sectionId) => {
        const sectionTitle = (typeof SECTION_DEFS !== 'undefined' && SECTION_DEFS || []).find((section) => section.id === sectionId)?.title || sectionId;
        return (sectionChecks[sectionId] || [])
            .filter((item) => !rbvProgressValue(item.value))
            .map((item) => ({
            sectionId,
            sectionTitle,
            label: item.label,
            text: includeSectionName ? `${sectionTitle}: ${item.label}` : item.label
        }));
    });
}

function historyMetaFromVisit(visit) {
    const detail = getStoreWebDetail(visit?.store);
    const login = readBestieLogin();
    const matchedLogin = login.name && normalize(login.name) === normalize(visit?.nama);
    return {
        id: visit.id,
        bestieNik: cleanText(visit.bestieNik || (matchedLogin ? login.nik : '')),
        bestieName: cleanText(visit.nama, '-'),
        storeName: cleanText(visit.store, '-'),
        storeCode: cleanText(detail.siteCode4 || detail.siteCode || detail.storeCode || visit.storeCode),
        visitDate: cleanText(visit.tanggal, ''),
        updatedAt: visit.updatedAt || Date.now(),
        createdAt: visit.createdAt || Date.now(),
        progress: visitProgress(visit),
        isPdfDownloaded: !!visit.isPdfDownloaded,
        isEmailSent: !!visit.isEmailSent,
        isEmailFeedback: !!visit.isEmailFeedback,
        temuanCount: Array.isArray(visit.observationData) ? visit.observationData.length : 0
    };
}

function rbvProgressNotificationSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
}
function rbvProgressNotificationEnabled() {
    try { return localStorage.getItem(RBV_PROGRESS_NOTIFICATION_ENABLED_KEY) === '1'; }
    catch (error) { return false; }
}
function rbvSetProgressNotificationEnabled(enabled) {
    try { localStorage.setItem(RBV_PROGRESS_NOTIFICATION_ENABLED_KEY, enabled ? '1' : '0'); }
    catch (error) { }
}
function rbvBuildProgressNotificationPayload(visit) {
    const progress = Number.isFinite(Number(visit?.progress)) ? Math.max(0, Math.min(100, Math.round(Number(visit.progress)))) : visitProgress(visit);
    const store = cleanText(visit?.store || visit?.storeName, 'Nama Store');
    const bestie = cleanText(visit?.nama || visit?.bestieName, 'Bestie');
    return {
        progress,
        title: `${store} • Progress ${progress}%`,
        body: `${bestie} Laporan visit ${store} progres sudah ${progress}% ayo selesaikan dan kirim email.`,
        tag: `rbv-progress-${cleanText(visit?.id || store, 'visit')}`
    };
}
function rbvReadProgressNotificationLastMap() {
    try {
        const parsed = JSON.parse(localStorage.getItem(RBV_PROGRESS_NOTIFICATION_LAST_KEY) || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    }
    catch (error) { return {}; }
}
function rbvWriteProgressNotificationLastMap(map) {
    try { localStorage.setItem(RBV_PROGRESS_NOTIFICATION_LAST_KEY, JSON.stringify(map || {})); }
    catch (error) { }
}
function rbvMarkProgressNotificationBaseline(visits = []) {
    const map = rbvReadProgressNotificationLastMap();
    const now = Date.now();
    const source = Array.isArray(visits) ? visits : [];
    source.forEach((item) => {
        const id = cleanText(item?.id, '');
        if (id)
            map[id] = now;
    });
    rbvWriteProgressNotificationLastMap(map);
}

function rbvGetPushApiBase() {
    try {
        const fromStorage = String(localStorage.getItem(RBV_PUSH_API_BASE_KEY) || '').trim();
        const fromWindow = String(window.RBV_PUSH_CONFIG?.apiBase || window.RBV_PUSH_API_BASE || '').trim();
        return (fromStorage || fromWindow).replace(/\/+$/, '');
    }
    catch (error) {
        return '';
    }
}
function rbvSetPushApiBase(value) {
    try {
        localStorage.setItem(RBV_PUSH_API_BASE_KEY, String(value || '').trim().replace(/\/+$/, ''));
    }
    catch (error) { }
}
function rbvUrlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String || '').length % 4) % 4);
    const base64 = String(base64String || '').replace(/-/g, '+').replace(/_/g, '/') + padding;
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
function rbvBuildPushUserId() {
    const login = readBestieLogin();
    if (login?.nik)
        return `bestie-${login.nik}`;
    try {
        let id = localStorage.getItem('rbv_push_device_id_v1');
        if (!id) {
            id = `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
            localStorage.setItem('rbv_push_device_id_v1', id);
        }
        return id;
    }
    catch (error) {
        return 'default-user';
    }
}
function rbvBuildBackendProgressPayload(visit) {
    const payload = rbvBuildProgressNotificationPayload(visit);
    const login = readBestieLogin();
    const store = cleanText(visit?.store || visit?.storeName, 'Nama Store');
    const detail = getStoreWebDetail(store) || {};
    return {
        userId: rbvBuildPushUserId(),
        visitId: cleanText(visit?.id || ''),
        storeName: store,
        storeCode: cleanText(detail.siteCode4 || detail.siteCode || visit?.storeCode || ''),
        bestieName: cleanText(visit?.nama || visit?.bestieName || login?.name, 'Nama Bestie'),
        progress: payload.progress,
        title: payload.title,
        body: payload.body,
        url: location.href
    };
}
async function rbvFetchPushApi(path, options = {}) {
    const base = rbvGetPushApiBase();
    if (!base)
        throw new Error('Backend push belum diset. Isi PUSH_API_BASE di push-config.js setelah deploy backend.');
    const response = await fetch(`${base}${path}`, {
        method: options.method || 'GET',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        headers: {
            Accept: 'application/json',
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(options.headers || {})
        },
        body: options.body ? JSON.stringify(options.body) : undefined
    });
    const text = await response.text().catch(() => '');
    let data = null;
    if (text) {
        try { data = JSON.parse(text); }
        catch (error) { data = { message: text }; }
    }
    if (!response.ok || data?.ok === false)
        throw new Error(data?.error || data?.message || `HTTP ${response.status}`);
    return data || { ok: true };
}
async function rbvEnsureBackendPushSubscription() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window))
        throw new Error('Browser belum support backend push notification.');
    const publicKeyPayload = await rbvFetchPushApi('/api/push/public-key');
    const publicKey = cleanText(publicKeyPayload?.publicKey);
    if (!publicKey)
        throw new Error('Backend tidak mengirim VAPID public key.');
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: rbvUrlBase64ToUint8Array(publicKey)
        });
    }
    await rbvFetchPushApi('/api/push/subscribe', {
        method: 'POST',
        body: {
            userId: rbvBuildPushUserId(),
            subscription,
            userAgent: navigator.userAgent,
            subscribedAt: new Date().toISOString()
        }
    });
    try { localStorage.setItem(RBV_PUSH_SUBSCRIPTION_SENT_KEY, String(Date.now())); }
    catch (error) { }
    return true;
}
async function rbvSendBackendProgressReminder(visit) {
    const payload = rbvBuildBackendProgressPayload(visit);
    return rbvFetchPushApi('/api/push/send-progress-reminder', {
        method: 'POST',
        body: payload
    });
}

async function rbvUpsertBackendProgressSnapshot(visit) {
    if (!visit || !rbvGetPushApiBase())
        return false;
    const payload = rbvBuildBackendProgressPayload(visit);
    await rbvFetchPushApi('/api/push/upsert-progress', {
        method: 'POST',
        body: payload
    });
    return true;
}
async function rbvSyncBackendProgressSnapshotFromHistory(history = []) {
    if (!rbvGetPushApiBase())
        return { ok: false, synced: 0, skipped: true };
    const source = Array.isArray(history) ? history : [];
    const pending = source
        .filter((item) => item && Number(item.progress || 0) < 100)
        .slice(0, 20);
    let synced = 0;
    for (const item of pending) {
        try {
            await rbvUpsertBackendProgressSnapshot({
                id: item.id || `history-${synced}`,
                store: item.storeName || item.store || 'Nama Store',
                storeName: item.storeName || item.store || 'Nama Store',
                nama: item.bestieName || item.nama || readBestieLogin()?.name || 'Nama Bestie',
                bestieName: item.bestieName || item.nama || readBestieLogin()?.name || 'Nama Bestie',
                tanggal: item.visitDate || item.tanggal || '',
                storeCode: item.storeCode || '',
                progress: Number(item.progress || 0),
                qscResultPhotos: [],
                crewList: [],
                findingEvidencePhotos: [],
                correctiveActionPhotos: []
            });
            synced += 1;
        }
        catch (error) {
            console.warn('Sync progress snapshot ke backend push gagal:', error);
        }
        await new Promise((resolve) => window.setTimeout(resolve, 0));
    }
    return { ok: true, synced };
}


async function rbvRequestProgressNotificationPermission() {
    if (!rbvProgressNotificationSupported())
        return { ok: false, message: 'Browser ini belum support notifikasi web/PWA.' };
    let permission = Notification.permission;
    if (permission === 'default') {
        try { permission = await Notification.requestPermission(); }
        catch (error) { permission = Notification.permission; }
    }
    if (permission !== 'granted') {
        rbvSetProgressNotificationEnabled(false);
        return { ok: false, message: 'Izin notifikasi belum diberikan atau diblokir browser.' };
    }
    rbvSetProgressNotificationEnabled(true);
    return { ok: true, message: 'Notifikasi pengingat progress aktif.' };
}
async function rbvShowProgressNotification(visit, options = {}) {
    if (!visit || !rbvProgressNotificationSupported() || Notification.permission !== 'granted')
        return false;
    const payload = rbvBuildProgressNotificationPayload(visit);
    if (payload.progress >= 100 && !options.force)
        return false;
    const icon = 'icons/icon-192.png';
    const notificationOptions = {
        body: payload.body,
        icon,
        badge: icon,
        tag: payload.tag,
        renotify: true,
        data: { url: location.href, visitId: visit.id || '' }
    };
    try {
        if (navigator.serviceWorker?.ready) {
            const registration = await navigator.serviceWorker.ready;
            if (registration?.showNotification) {
                await registration.showNotification(payload.title, notificationOptions);
                return true;
            }
        }
    }
    catch (error) { }
    try {
        const notif = new Notification(payload.title, notificationOptions);
        notif.onclick = () => { try { window.focus(); } catch (error) { } };
        return true;
    }
    catch (error) { return false; }
}
async function rbvMaybeShowProgressNotification(visit, options = {}) {
    if (!visit || !rbvProgressNotificationEnabled() || Notification.permission !== 'granted')
        return false;
    const payload = rbvBuildProgressNotificationPayload(visit);
    if (payload.progress >= 100)
        return false;
    const id = cleanText(visit.id, 'active');
    const map = rbvReadProgressNotificationLastMap();
    const now = Date.now();
    const lastAt = Number(map[id] || 0);
    if (!options.force && !lastAt) {
        map[id] = now;
        rbvWriteProgressNotificationLastMap(map);
        return false;
    }
    if (!options.force && now - lastAt < RBV_PROGRESS_NOTIFICATION_INTERVAL_MS)
        return false;
    const sent = await rbvShowProgressNotification(visit, options);
    if (sent) {
        map[id] = now;
        rbvWriteProgressNotificationLastMap(map);
    }
    return sent;
}

function readHistoryMeta() {
    try {
        const parsed = JSON.parse(localStorage.getItem(HISTORY_META_KEY) || '[]');
        return filterHistoryMetaForLogin(Array.isArray(parsed) ? parsed : []).map(item => {
            let p = item.progress;
            if (item.isEmailSent || item.isPdfDownloaded) p = Math.max(100, p || 100);
            else if (typeof p !== 'number' || Number.isNaN(p)) p = 0;
            return { ...item, progress: Math.max(0, Math.min(100, Math.round(p))) };
        });
    }
    catch (error) {
        return [];
    }
}
function saveHistoryMeta(items) {
    const next = filterHistoryMetaForLogin(uniqueBy(items.filter((item) => item && item.id), (item) => item.id))
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
function getBackupOwnerLogin() {
    const login = readBestieLogin();
    if (!login.nik || !login.name)
        throw new Error('Login NIK dulu sebelum backup atau restore data.');
    return login;
}
function visitBelongsToBestieLogin(visit, login = readBestieLogin()) {
    if (!login?.name)
        return true;
    const nameKey = normalize(login.name);
    const nikKey = normalizeNik(login.nik);
    const visitNik = normalizeNik(visit?.bestieNik || visit?.nik || visit?.regionalBestieNik || visit?.loginNik);
    if (nikKey && visitNik && visitNik === nikKey)
        return true;
    return normalize(visit?.nama || visit?.bestieName || visit?.regionalBestie || visit?.detail?.bestieName) === nameKey;
}
function filterVisitsForLogin(visits, login = readBestieLogin()) {
    const safeVisits = Array.isArray(visits) ? visits.filter((item) => item && item.id) : [];
    if (!login?.name)
        return safeVisits;
    return safeVisits.filter((visit) => visitBelongsToBestieLogin(visit, login));
}
function filterHistoryMetaForLogin(items, login = readBestieLogin()) {
    const safeItems = Array.isArray(items) ? items.filter((item) => item && item.id) : [];
    if (!login?.name)
        return safeItems;
    const nameKey = normalize(login.name);
    const nikKey = normalizeNik(login.nik);
    return safeItems.filter((item) => {
        const itemNik = normalizeNik(item.bestieNik || item.nik || item.regionalBestieNik || item.loginNik);
        if (nikKey && itemNik && itemNik === nikKey)
            return true;
        return normalize(item.bestieName || item.nama || item.regionalBestie) === nameKey;
    });
}
function buildHistoryBackupPayload(login, visits) {
    const filteredVisits = filterVisitsForLogin(visits, login).map((visit) => ({
        ...visit,
        bestieNik: login.nik,
        nama: cleanText(visit.nama, login.name)
    }));
    const meta = filteredVisits.map((visit) => ({ ...historyMetaFromVisit(visit), bestieNik: login.nik }));
    return {
        app: 'regional-bestie-visit-report',
        type: 'nik-history-transfer-backup',
        version: 3,
        ownerNik: login.nik,
        ownerName: login.name,
        exportedAt: new Date().toISOString(),
        build: APP_BUILD_VERSION,
        localStorage: {
            [BESTIE_LOGIN_KEY]: JSON.stringify(login),
            [HISTORY_META_KEY]: JSON.stringify(meta)
        },
        visits: filteredVisits
    };
}
function validateBackupOwner(payload, login = getBackupOwnerLogin()) {
    const ownerNik = normalizeNik(payload?.ownerNik || payload?.nik || payload?.loginNik);
    const ownerName = cleanText(payload?.ownerName || payload?.bestieName || payload?.nama);
    if (ownerNik && ownerNik !== login.nik)
        throw new Error(`Backup ini milik NIK ${ownerNik}. Login saat ini ${login.nik}. Restore dibatalkan.`);
    if (!ownerNik && ownerName && normalize(ownerName) !== normalize(login.name))
        throw new Error(`Backup ini milik ${ownerName}. Login saat ini ${login.name}. Restore dibatalkan.`);
    return true;
}
async function backupVisitReportData() {
    const login = getBackupOwnerLogin();
    const allVisits = await getAllVisitRecordsForBackup();
    const payload = buildHistoryBackupPayload(login, allVisits);
    if (!payload.visits.length) {
        const ok = confirmAction(`Belum ada history milik ${login.name}. Tetap buat file backup kosong?`);
        if (!ok)
            return payload;
    }
    const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const safeName = login.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'Bestie';
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    downloadBlob(blob, `bestie-history-${safeName}-${login.nik}-${stamp}.json`);
    return payload;
}
async function restoreVisitReportDataFromFile(file) {
    const login = getBackupOwnerLogin();
    const raw = await readBackupFileText(file);
    const payload = JSON.parse(raw);
    if (!payload || payload.app !== 'regional-bestie-visit-report') {
        throw new Error('File backup tidak sesuai aplikasi ini.');
    }
    validateBackupOwner(payload, login);
    const visits = filterVisitsForLogin(payload.visits, login);
    const currentVisits = filterVisitsForLogin(await getAllVisitRecordsForBackup(), login);
    const ok = confirmAction(`Restore history untuk ${login.name} (${login.nik})?\n\nHistory device ini: ${currentVisits.length}\nJumlah visit backup valid: ${visits.length}\n\nData akan digabung dan hanya history NIK ini yang tampil.`);
    if (!ok)
        return false;
    const mergedVisits = uniqueBy([...visits, ...currentVisits].filter((item) => item && item.id), (item) => item.id)
        .map((visit) => ({ ...visit, bestieNik: login.nik, nama: cleanText(visit.nama, login.name), updatedAt: visit.updatedAt || Date.now() }));
    for (const visit of mergedVisits) {
        await putVisitRecord(visit);
    }
    const visitMeta = mergedVisits.map((visit) => ({ ...historyMetaFromVisit(visit), bestieNik: login.nik }));
    saveHistoryMeta(visitMeta);
    if (!localStorage.getItem(ACTIVE_VISIT_KEY) && mergedVisits[0]?.id)
        localStorage.setItem(ACTIVE_VISIT_KEY, mergedVisits[0].id);
    alert(`Restore selesai. ${mergedVisits.length} history milik ${login.name} siap digunakan.`);
    window.location.reload();
    return true;
}
function getDeviceBackupKeyForLogin(login = getBackupOwnerLogin()) {
    return `${DEVICE_BACKUP_KEY}:${login.nik}`;
}
async function buildDeviceTransferBackupPayload() {
    const login = getBackupOwnerLogin();
    const visits = filterVisitsForLogin(await getAllVisitRecordsForBackup(), login);
    return {
        ...buildHistoryBackupPayload(login, visits),
        type: 'convex-nik-history-transfer-backup',
        version: 4,
        backupKey: getDeviceBackupKeyForLogin(login),
        deviceId: getLinkedDeviceId()
    };
}
async function restoreVisitReportDataFromPayload(payload, options = {}) {
    const login = getBackupOwnerLogin();
    if (!payload || payload.app !== 'regional-bestie-visit-report') {
        throw new Error('Payload backup tidak sesuai aplikasi ini.');
    }
    validateBackupOwner(payload, login);
    const visits = filterVisitsForLogin(payload.visits, login);
    const currentVisits = filterVisitsForLogin(await getAllVisitRecordsForBackup(), login);
    const shouldAsk = options.confirm !== false;
    if (shouldAsk) {
        const ok = confirmAction(`Tarik history cepat dari Convex untuk ${login.name}?\n\nHistory device ini: ${currentVisits.length}\nJumlah visit backup valid: ${visits.length}\n\nHanya data NIK ${login.nik} yang akan tampil.`);
        if (!ok)
            return false;
    }
    const mergedVisits = uniqueBy([...visits, ...currentVisits].filter((item) => item && item.id), (item) => item.id)
        .map((visit) => ({ ...visit, bestieNik: login.nik, nama: cleanText(visit.nama, login.name), updatedAt: visit.updatedAt || Date.now() }));
    for (const visit of mergedVisits) {
        await putVisitRecord(visit);
    }
    const visitMeta = mergedVisits.map((visit) => ({ ...historyMetaFromVisit(visit), bestieNik: login.nik }));
    saveHistoryMeta(visitMeta);
    localStorage.setItem(DEVICE_BACKUP_LAST_PULL_KEY, new Date().toISOString());
    return { visits: mergedVisits.length, ownerNik: login.nik, ownerName: login.name };
}
async function pushDeviceBackupToConvex() {
    if (!convexEnabled())
        throw new Error('Convex belum aktif. Isi deploymentUrl di convex-config.js.');
    const config = getConvexConfig();
    const payload = await buildDeviceTransferBackupPayload();
    const mutationName = config.deviceBackupSetMutation || 'deviceBackups:setLatest';
    await runConvexMutation(mutationName, { backupKey: payload.backupKey || getDeviceBackupKeyForLogin(), deviceId: payload.deviceId, payload });
    return payload;
}
async function pullDeviceBackupFromConvex() {
    if (!convexEnabled())
        throw new Error('Convex belum aktif. Isi deploymentUrl di convex-config.js.');
    const config = getConvexConfig();
    const queryName = config.deviceBackupGetQuery || 'deviceBackups:getLatest';
    const result = await runConvexQuery(queryName, { backupKey: getDeviceBackupKeyForLogin() });
    const payload = result?.payload || result;
    if (!payload)
        throw new Error('Belum ada backup cepat di Convex. Jalankan Upload Device Backup dari device lama dulu.');
    return restoreVisitReportDataFromPayload(payload, { confirm: true });
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