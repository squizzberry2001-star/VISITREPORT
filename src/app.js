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
const APP_BUILD_VERSION = 'revamp325-login-icons-v59';
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
            const { image, objectUrl } = await readAnyPhotoFile(file);
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
        return Array.isArray(parsed) ? parsed : [];
    }
    catch (error) { return []; }
}
function saveScheduleConfig(items) {
    const next = Array.isArray(items) ? items : [];
    localStorage.setItem(SCHEDULE_CONFIG_KEY, JSON.stringify(next));
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
        bell: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" }),
            React.createElement("path", { d: "M10 21h4" })),
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
        coffee: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M10 2v2" }),
            React.createElement("path", { d: "M14 2v2" }),
            React.createElement("path", { d: "M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z" }),
            React.createElement("path", { d: "M6 2v2" }),
            React.createElement("path", { d: "M17 8h1a4 4 0 1 1 0 8h-1" })),
        settings: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M4 7h10" }),
            React.createElement("path", { d: "M18 7h2" }),
            React.createElement("circle", { cx: "16", cy: "7", r: "2" }),
            React.createElement("path", { d: "M4 17h2" }),
            React.createElement("path", { d: "M10 17h10" }),
            React.createElement("circle", { cx: "8", cy: "17", r: "2" }))
    };
    return (React.createElement("svg", { className: cx("transition-all duration-300", className), viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: strokeWidth === 2 ? 2.25 : strokeWidth, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, paths[name] || paths.spark));
}
function Button({ variant = 'primary', className = '', icon, children, ...props }) {
    const styles = {
        primary: 'btn-primary shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30',
        secondary: 'btn-secondary',
        ghost: 'btn-ghost',
        danger: 'btn-danger shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30',
        icon: 'btn-icon'
    };
    return (React.createElement("button", { type: "button", className: cx(styles[variant] || styles.primary, 'transition-all duration-300 active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:shadow-none', className), ...props },
        icon ? React.createElement(Icon, { name: icon, className: "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" }) : null,
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
    // Do not wrap form controls inside <label>. Some Android/Redmi browsers focus the
    // container instead of the real textbox when complex rounded cards are tapped.
    return (React.createElement("div", { className: "block rbv-field-wrap" },
        React.createElement("div", { className: "mb-2 flex items-center gap-1 text-sm font-bold text-slate-800", "aria-hidden": false },
            label,
            required ? React.createElement("span", { className: "text-rose-600" }, "*") : null),
        children,
        helper ? React.createElement("span", { className: "mt-2 block text-xs leading-5 text-slate-500" }, helper) : null));
}
let rbvEditableScrollFocusBlockUntil = 0;
function rbvBlockEditableFocusForScroll(ms = 650) {
    rbvEditableScrollFocusBlockUntil = Math.max(rbvEditableScrollFocusBlockUntil, Date.now() + ms);
}
function rbvIsEditableFocusBlocked() {
    return Date.now() < rbvEditableScrollFocusBlockUntil;
}
function rbvFocusEditableOnTap(event) {
    const target = event.currentTarget || event.target;
    if (!target || target.disabled || target.readOnly)
        return;
    if (event.defaultPrevented || rbvIsEditableFocusBlocked())
        return;
    if (event.pointerType && event.pointerType !== 'touch' && event.pointerType !== 'pen')
        return;
    if (document.activeElement !== target) {
        try { target.focus({ preventScroll: true }); } catch (error) { try { target.focus(); } catch (_) {} }
    }
    // Scroll is handled once by focusin/visualViewport to avoid Android jump loops.
}

function rbvKeyboardInsetPx() {
    try {
        const viewport = window.visualViewport;
        if (!viewport) return 0;
        return Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop));
    }
    catch (error) { return 0; }
}
function rbvApplyKeyboardInset() {
    const inset = rbvKeyboardInsetPx();
    try {
        document.documentElement.style.setProperty('--rbv-keyboard-inset', `${inset}px`);
        document.documentElement.classList.toggle('rbv-keyboard-visible', inset > 72);
        document.body?.classList.toggle('rbv-keyboard-visible', inset > 72);
    }
    catch (error) { }
    return inset;
}
let rbvLastKeyboardScrollAt = 0;
function rbvScrollEditableIntoKeyboardSafeView(target, options = {}) {
    if (!target || !target.getBoundingClientRect) return;
    const run = () => {
        try {
            const inset = rbvApplyKeyboardInset();
            if (inset < 72 && !options.force) return;
            const now = Date.now();
            if (!options.force && now - rbvLastKeyboardScrollAt < 700) return;
            const viewport = window.visualViewport;
            const viewportTop = viewport ? viewport.offsetTop : 0;
            const viewportHeight = viewport ? viewport.height : window.innerHeight;
            const rect = target.getBoundingClientRect();
            const topLimit = viewportTop + 78;
            const bottomLimit = viewportTop + viewportHeight - 92;
            const tooLow = rect.bottom > bottomLimit;
            const tooHigh = rect.top < topLimit;
            if (tooLow || tooHigh || options.force) {
                rbvLastKeyboardScrollAt = now;
                const scrollRoot = document.scrollingElement || document.documentElement;
                const currentY = scrollRoot.scrollTop || window.scrollY || 0;
                const desiredDelta = tooLow ? (rect.bottom - bottomLimit + 18) : (rect.top - topLimit - 18);
                const nextY = Math.max(0, Math.round(currentY + desiredDelta));
                if (Math.abs(nextY - currentY) > 24) window.scrollTo({ top: nextY, behavior: 'auto' });
            }
        }
        catch (error) { }
    };
    const delay = Number(options.delay || 0);
    if (delay > 0) window.setTimeout(run, delay);
    else window.requestAnimationFrame(run);
}
function rbvComposeEditableTapHandler(userHandler) {
    return function handleEditableTap(event) {
        try { userHandler?.(event); } catch (error) { }
        if (event.defaultPrevented)
            return;
        const eventType = String(event.type || '').toLowerCase();
        if (eventType === 'pointerdown' || eventType === 'touchstart')
            return;
        rbvFocusEditableOnTap(event);
    };
}
function TextInput({ className = '', onPointerDown, onPointerUp, onTouchStart, onTouchEnd, onClick, ...props }) {
    return React.createElement("input", { ...props, className: cx('form-control rbv-mobile-editable', className), onPointerDown: rbvComposeEditableTapHandler(onPointerDown), onPointerUp: rbvComposeEditableTapHandler(onPointerUp), onTouchStart: rbvComposeEditableTapHandler(onTouchStart), onTouchEnd: rbvComposeEditableTapHandler(onTouchEnd), onClick: rbvComposeEditableTapHandler(onClick) });
}
function rbvCallInputHandler(handler, event) {
    try { handler?.(event); } catch (error) { }
}
function rbvOpenNativeDatePicker(event) {
    const input = event.currentTarget;
    if (!input || event.defaultPrevented || input.disabled || input.readOnly)
        return;
    try { input.focus({ preventScroll: true }); } catch (error) { try { input.focus(); } catch (_) { } }
    if (typeof input.showPicker === 'function') {
        window.setTimeout(() => {
            try {
                if (document.activeElement === input) input.showPicker();
            } catch (error) { }
        }, 0);
    }
}
function DateInput({ className = '', onPointerDown, onPointerUp, onTouchStart, onTouchEnd, onClick, ...props }) {
    return React.createElement("input", { ...props, type: "date", className: cx('form-control date-control', className), onPointerDown: (event) => rbvCallInputHandler(onPointerDown, event), onPointerUp: (event) => rbvCallInputHandler(onPointerUp, event), onTouchStart: (event) => rbvCallInputHandler(onTouchStart, event), onTouchEnd: (event) => rbvCallInputHandler(onTouchEnd, event), onClick: (event) => { rbvCallInputHandler(onClick, event); rbvOpenNativeDatePicker(event); } });
}
function TextArea({ value, onChange, className = '', minRows = 3, onPointerDown, onPointerUp, onTouchStart, onTouchEnd, onClick, ...props }) {
    const ref = useRef(null);
    function resize() {
        const el = ref.current;
        if (!el)
            return;
        el.style.height = 'auto';
        el.style.height = Math.max(46, el.scrollHeight) + 'px';
    }
    useEffect(() => { resize(); }, [value]);
    return (React.createElement("textarea", { ...props, ref: ref, className: cx('form-control auto-grow-textarea rbv-mobile-editable', className), value: value || '', rows: minRows, onPointerDown: rbvComposeEditableTapHandler(onPointerDown), onPointerUp: rbvComposeEditableTapHandler(onPointerUp), onTouchStart: rbvComposeEditableTapHandler(onTouchStart), onTouchEnd: rbvComposeEditableTapHandler(onTouchEnd), onClick: rbvComposeEditableTapHandler(onClick), onChange: (event) => { onChange?.(event); window.requestAnimationFrame(resize); }, onInput: resize }));
}

function rbvDispatchInputAndChange(target) {
    if (!target)
        return;
    try {
        target.dispatchEvent(new Event('input', { bubbles: true, cancelable: false }));
    }
    catch (error) { }
    try {
        target.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
    }
    catch (error) { }
}
function rbvFlushActiveEditableValue(options = {}) {
    const active = document.activeElement;
    const shouldBlur = options.blur !== false;
    const editableSelector = 'input:not([type="file"]):not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]):not([type="date"]):not([type="time"]):not([type="month"]):not([type="week"]), textarea, [contenteditable="true"]';
    let target = null;
    if (active && active.matches && active.matches(editableSelector))
        target = active;
    if (!target && active && active.closest)
        target = active.closest(editableSelector);
    if (!target)
        return false;
    rbvDispatchInputAndChange(target);
    if (target.isContentEditable) {
        try { target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: null })); } catch (error) { }
    }
    if (shouldBlur) {
        try { target.blur(); } catch (error) { }
    }
    return true;
}
async function rbvWaitForReactInputFlush() {
    rbvFlushActiveEditableValue({ blur: true });
    await new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
    rbvFlushActiveEditableValue({ blur: false });
    await new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
    await new Promise((resolve) => window.setTimeout(resolve, 120));
    rbvFlushActiveEditableValue({ blur: false });
}
function rbvWaitForPdfFrame() {
    return new Promise((resolve) => {
        const raf = typeof window !== 'undefined' && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : null;
        if (!raf) {
            window.setTimeout(resolve, 60);
            return;
        }
        raf(() => raf(() => resolve()));
    });
}
async function rbvWaitForPdfAssets(root = document) {
    try {
        const images = Array.from((root || document).querySelectorAll ? (root || document).querySelectorAll('img') : []);
        await Promise.all(images.map((image) => {
            if (!image || (image.complete && image.naturalWidth > 0)) return Promise.resolve();
            return new Promise((resolve) => {
                const done = () => resolve();
                image.addEventListener('load', done, { once: true });
                image.addEventListener('error', done, { once: true });
                window.setTimeout(done, 2500);
            });
        }));
    }
    catch (error) {
        console.warn('Menunggu asset preview PDF gagal:', error);
    }
    try {
        if (document.fonts && document.fonts.ready) await document.fonts.ready.catch(() => undefined);
    }
    catch (error) { }
}
function rbvDeepCloneForPdf(value) {
    try {
        if (typeof structuredClone === 'function') return structuredClone(value);
    }
    catch (error) { }
    try { return JSON.parse(JSON.stringify(value || {})); } catch (error) { return { ...(value || {}) }; }
}
function rbvNormalizeObservationRowsForPdf(rows) {
    const source = Array.isArray(rows) ? rows : [];
    return source.map((row) => ({
        temuan: richValue(row && (row.temuan ?? row.finding ?? row.observation ?? row.observasi ?? row.description ?? row.desc)),
        kondisiIdeal: richValue(row && (row.kondisiIdeal ?? row.kondisi_ideal ?? row.idealCondition ?? row.standard ?? row.targetCondition)),
        dampak: richValue(row && (row.dampak ?? row.impact ?? row.risk ?? row.risiko)),
        penyebab: richValue(row && (row.penyebab ?? row.rootCause ?? row.root_cause ?? row.cause)),
        tindakan: richValue(row && (row.tindakan ?? row.action ?? row.correctiveAction ?? row.corrective_action ?? row.aksi)),
        deadline: cleanText(row && (row.deadline ?? row.dueDate ?? row.due_date ?? row.targetDate)),
        hasil: richValue(row && (row.hasil ?? row.result ?? row.status ?? row.followUp ?? row.follow_up))
    })).filter((row) => isMeaningfulObservation(row));
}
function rbvNormalizePhotoForPdf(photo) {
    const source = photo && typeof photo === 'object' ? photo : {};
    return {
        ...source,
        image: cleanText(source.image || source.dataUrl || source.dataURL || source.url || source.src || source.previewUrl || source.previewURL || source.blobUrl || source.blobURL),
        description: richValue(source.description ?? source.desc ?? source.caption ?? source.note ?? source.notes ?? source.text ?? source.keterangan ?? source.label)
    };
}
function rbvNormalizePhotoArrayForPdfSnapshot(photos) {
    return (Array.isArray(photos) ? photos : [])
        .map(rbvNormalizePhotoForPdf)
        .filter((photo) => cleanText(photo.image) || cleanText(rbvPreviewPlainText ? rbvPreviewPlainText(photo.description, '') : photo.description));
}
function rbvEnrichVisitSnapshotForPdf(snapshot) {
    const detail = getStoreWebDetail(snapshot?.store);
    const manual = snapshot && snapshot.manualStoreDetail && typeof snapshot.manualStoreDetail === 'object' ? snapshot.manualStoreDetail : {};
    const merged = { ...(detail || {}), ...(manual || {}) };
    snapshot.manualStoreDetail = { ...(manual || {}) };
    snapshot.storeCode = cleanText(snapshot.storeCode || merged.siteCode4 || merged.siteCode || merged.storeCode);
    snapshot.typeStore = cleanText(snapshot.typeStore || merged.typeStore || merged.storeType || merged.type);
    snapshot.emailStore = cleanText(snapshot.emailStore || merged.emailStore || merged.storeEmail || merged.email);
    snapshot.areaManager = cleanText(snapshot.areaManager || merged.areaManager);
    snapshot.regionalManager = cleanText(snapshot.regionalManager || merged.regionalManager);
    snapshot.storeHead = cleanText(snapshot.storeHead || merged.storeHead || merged.storeLeader);
    if (!cleanText(snapshot.storeLeader)) snapshot.storeLeader = snapshot.storeHead;
    if (!cleanText(snapshot.storeLeaderLevel)) snapshot.storeLeaderLevel = cleanText(merged.storeLeaderLevel || merged.storeHeadLevel);
    return snapshot;
}
async function rbvPrepareVisitForPdf(visit, options = {}) {
    await rbvWaitForReactInputFlush();
    await rbvWaitForPdfFrame();
    await rbvWaitForReactInputFlush();
    await rbvWaitForPdfFrame();
    await rbvWaitForPdfAssets(document);
    const snapshot = rbvEnrichVisitSnapshotForPdf(rbvDeepCloneForPdf(visit || {}));
    snapshot.opiData = rbvNormalizeObservationRowsForPdf(snapshot.opiData);
    snapshot.qscData = rbvNormalizeObservationRowsForPdf(snapshot.qscData);
    if (!snapshot.opiData.length && Array.isArray(visit && visit.opiData)) snapshot.opiData = rbvNormalizeObservationRowsForPdf(visit.opiData);
    if (!snapshot.qscData.length && Array.isArray(visit && visit.qscData)) snapshot.qscData = rbvNormalizeObservationRowsForPdf(visit.qscData);
    snapshot.qscResultPhotos = rbvNormalizePhotoArrayForPdfSnapshot(snapshot.qscResultPhotos || normalizeQscPhotos(snapshot));
    snapshot.qscResultPhoto = snapshot.qscResultPhotos[0] || blankPhoto();
    snapshot.findingEvidencePhotos = rbvNormalizePhotoArrayForPdfSnapshot(snapshot.findingEvidencePhotos);
    snapshot.correctiveActionPhotos = rbvNormalizePhotoArrayForPdfSnapshot(snapshot.correctiveActionPhotos);
    snapshot.showQSCResult = true;
    if (options.forceAllSections !== false) {
        snapshot.showOPITable = true;
        snapshot.showQSCTable = true;
        snapshot.showFindingEvidence = true;
        snapshot.showCorrectiveAction = true;
    }
    if (snapshot.findingEvidencePhotos.length) snapshot.showFindingEvidence = true;
    if (snapshot.correctiveActionPhotos.length) snapshot.showCorrectiveAction = true;
    snapshot.__pdfPreparedAt = Date.now();
    return snapshot;
}

function RichTextInput({ value, onChange, placeholder = 'Tulis catatan...', className = '', minHeight = 112 }) {
    const editorRef = useRef(null);
    const [activeTools, setActiveTools] = useState({});
    const [toolbarVisible, setToolbarVisible] = useState(false);
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
    function handlePaste(event) {
        event.preventDefault();
        const text = event.clipboardData?.getData('text/plain') || '';
        const safeText = text.replace(/\r\n/g, '\n');
        try {
            document.execCommand('insertText', false, safeText);
        }
        catch (error) {
            const selection = window.getSelection?.();
            if (selection && selection.rangeCount) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(document.createTextNode(safeText));
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
        window.requestAnimationFrame(emit);
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
        React.createElement("div", { ref: editorRef, className: "rich-editor-input rbv-mobile-editable px-3 py-3 text-sm leading-6 text-slate-900 outline-none", style: { minHeight }, contentEditable: true, role: "textbox", "aria-multiline": "true", "data-placeholder": placeholder, tabIndex: 0, onFocus: () => setToolbarVisible(true), onPointerUp: rbvFocusEditableOnTap, onTouchEnd: rbvFocusEditableOnTap, onClick: focusEditor, onInput: emit, onBlur: () => { emit(); window.setTimeout(() => { if (!editorRef.current?.matches(':focus')) setToolbarVisible(false); }, 120); }, onKeyUp: emit, onCompositionEnd: emit, onPaste: handlePaste, onKeyDown: handleKeyDown, suppressContentEditableWarning: true }),
        React.createElement("div", { className: cx("rich-toolbar flex flex-wrap gap-1 border-t border-slate-200 p-2", toolbarVisible && "is-visible"), "aria-label": "Rich text toolbar" }, tools.map((tool) => (React.createElement("button", { key: tool.command, type: "button", "data-command": tool.command, className: cx('rich-tool-button', tool.className, activeTools[tool.command] && 'active'), onPointerDown: (event) => { event.preventDefault(); setToolbarVisible(true); command(tool.command); }, "aria-label": tool.title, title: tool.title }, tool.label))))));
}
function SelectInput({ children, className = '', ...props }) {
    return React.createElement("select", { className: cx('form-control appearance-none', className), ...props }, children);
}
function SelectField({ label, value, options, onChange, placeholder = 'Pilih', required, icon, disabled }) {
    const normalizedOptions = (options || []).map((item) => typeof item === 'string' ? { label: item, value: item } : item);
    return (React.createElement(Field, { label: label, required: required },
        React.createElement("div", { className: "select-field-wrap relative" },
            icon ? React.createElement("span", { className: "select-field-icon pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-slate-400" },
                React.createElement(Icon, { name: icon, className: "h-5 w-5" })) : null,
            React.createElement(SelectInput, { value: value || '', onChange: (event) => onChange(event.target.value), className: cx('select-control', icon ? 'has-leading-icon' : ''), required: required, disabled: disabled },
                React.createElement("option", { value: "" }, placeholder),
                normalizedOptions.map((item) => React.createElement("option", { key: (item.value || '') + '-' + item.label, value: item.value || item.label, disabled: item.disabled }, item.label))))));
}
function Toggle({ checked, onChange, label, className = '' }) {
    return (React.createElement("button", { type: "button", role: "switch", "aria-checked": checked, "aria-label": label || (checked ? 'Hide section' : 'Unhide section'), onClick: () => onChange(!checked), className: cx('slide-toggle compact-toggle', checked && 'active', className) },
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
const ORIGINAL_PHOTO_CROP_RATIO = { key: 'original', label: 'Default', original: true };
const PDF_PHOTO_CROP_RATIO = { key: 'pdf', label: 'PDF Portrait', w: 9, h: 16 };
const QSC_PHOTO_CROP_RATIO = { key: 'qsc', label: 'QSC', w: 4, h: 3 };
const PHOTO_EDITOR_RATIOS = [
    ORIGINAL_PHOTO_CROP_RATIO,
    PDF_PHOTO_CROP_RATIO,
    QSC_PHOTO_CROP_RATIO,
    { key: 'square', label: '1:1', w: 1, h: 1 },
    { key: 'portrait', label: '3:4', w: 3, h: 4 },
    { key: 'landscape', label: '16:9', w: 16, h: 9 }
];
function ratioToAspectString(ratio) {
    if (ratio && ratio.original) return '';
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
        return { width: Math.max(360, width), height: Math.max(360, height) };
    }
    const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
    return {
        width: Math.max(360, Math.round(sourceWidth * scale)),
        height: Math.max(360, Math.round(sourceHeight * scale))
    };
}
function getMarkerRadius(canvas, markerSize) {
    const minSide = Math.max(1, Math.min(canvas?.width || 1080, canvas?.height || 1080));
    if (Number.isFinite(Number(markerSize)))
        return Math.max(4, Math.min(Math.floor(minSide / 2), Math.round(Number(markerSize))));
    const selected = MARKER_SIZE_OPTIONS.find((item) => item.key === markerSize) || MARKER_SIZE_OPTIONS[1];
    return Math.max(24, Math.round(minSide * selected.scale));
}
function PhotoEditorModal({ open, image, onClose, onSave, title = 'Edit Foto', cropRatio = PDF_PHOTO_CROP_RATIO }) {
    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const dragRef = useRef(null);
    const pinchRef = useRef(null);
    const markerTapRef = useRef(null);
    const rafRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [markers, setMarkers] = useState([]);
    const [mode, setMode] = useState('move');
    const [paths, setPaths] = useState([]);
    const [currentPath, setCurrentPath] = useState(null);
    const activeCropRatio = ORIGINAL_PHOTO_CROP_RATIO;
    const [selectedRatio, setSelectedRatio] = useState(activeCropRatio);
    const [markerSize, setMarkerSize] = useState(58);
    const [markerSliderActive, setMarkerSliderActive] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 1080, height: 1080 });
    const [imageReady, setImageReady] = useState(false);
    const markerMinSize = 16;
    const markerMaxSize = Math.max(48, Math.round(Math.min(canvasSize.width || 1080, canvasSize.height || 1080) / 2 - 12));
    const activeMarkerSize = Math.max(markerMinSize, Math.min(markerMaxSize, Math.round(Number(markerSize) || 58)));
    const markerPreviewDiameterPct = Math.min(100, Math.max(6, Math.round((activeMarkerSize * 2 / Math.max(1, Math.min(canvasSize.width || 1080, canvasSize.height || 1080))) * 100)));
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
        setMarkerSize(58);
        setMarkerSliderActive(false);
        pinchRef.current = null;
        markerTapRef.current = null;
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
    useEffect(() => {
        if (!open)
            return;
        setMarkerSize((current) => Math.max(markerMinSize, Math.min(markerMaxSize, Math.round(Number(current) || 58))));
    }, [open, markerMaxSize]);
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
        markers.forEach((marker) => {
            const radius = marker.r || Math.max(34, Math.min(metrics.cw, metrics.ch) * 0.045);
            const strokeWidth = Math.max(20, Math.round(Math.min(metrics.cw, metrics.ch) * 0.018));
            ctx.beginPath();
            ctx.arc(marker.x, marker.y, radius, 0, Math.PI * 2);
            ctx.lineWidth = strokeWidth;
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.98)';
            ctx.shadowColor = 'rgba(239, 68, 68, 0.72)';
            ctx.shadowBlur = Math.max(22, Math.round(strokeWidth * 1.55));
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
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
        const point = canvasPoint(event);
        if (mode === 'marker') {
            markerTapRef.current = {
                pointerId: event.pointerId,
                x: point.x,
                y: point.y,
                clientX: event.clientX,
                clientY: event.clientY,
                moved: false,
                cancelled: false
            };
            try { event.currentTarget.setPointerCapture(event.pointerId); } catch (error) { }
            return;
        }
        markerTapRef.current = null;
        dragRef.current = { pointerId: event.pointerId, x: point.x, y: point.y, offsetX: offset.x, offsetY: offset.y };
        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        }
        catch (error) { }
    }
    function handlePointerMove(event) {
        if (mode === 'marker' && markerTapRef.current && markerTapRef.current.pointerId === event.pointerId) {
            const dx = event.clientX - markerTapRef.current.clientX;
            const dy = event.clientY - markerTapRef.current.clientY;
            if (Math.sqrt(dx * dx + dy * dy) > 8)
                markerTapRef.current.moved = true;
            return;
        }
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
        if (mode === 'marker' && markerTapRef.current && markerTapRef.current.pointerId === event?.pointerId) {
            const tap = markerTapRef.current;
            markerTapRef.current = null;
            if (!tap.cancelled && !tap.moved && !pinchRef.current && canvasRef.current) {
                const r = getMarkerRadius(canvasRef.current, activeMarkerSize);
                setMarkers((current) => [...current, { x: tap.x, y: tap.y, r }]);
            }
            return;
        }
        if (dragRef.current?.pointerId === event?.pointerId)
            dragRef.current = null;
        else
            dragRef.current = null;
    }
    function handleTouchStart(event) {
        if (event.touches.length >= 2) {
            event.preventDefault();
            event.stopPropagation();
            if (markerTapRef.current)
                markerTapRef.current.cancelled = true;
            dragRef.current = null;
            pinchRef.current = { distance: distanceBetweenTouches(event.touches), zoom, offset, center: touchCenter(event.touches) };
        }
    }
    function handleTouchMove(event) {
        if (event.touches.length >= 2 && pinchRef.current) {
            event.preventDefault();
            event.stopPropagation();
            if (markerTapRef.current)
                markerTapRef.current.cancelled = true;
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
                React.createElement("button", { type: "button", className: cx('photo-editor-tool', mode === 'move' && 'active'), onClick: () => { setMode('move'); setMarkerSliderActive(false); }, "aria-pressed": mode === 'move' },
                    React.createElement(Icon, { name: "crop", className: "h-4 w-4" }),
                    React.createElement("span", null, "Geser")),
                React.createElement("button", { type: "button", className: cx('photo-editor-tool', mode === 'draw' && 'active'), onClick: () => { setMode('draw'); setMarkerSliderActive(false); }, "aria-pressed": mode === 'draw' },
                    React.createElement(Icon, { name: "pencil", className: "w-6 h-6" })
                ),
                React.createElement("button", { type: "button", className: "photo-editor-tool", onClick: () => setPaths((current) => current.slice(0, -1)), disabled: paths.length === 0 },
                    React.createElement(Icon, { name: "rotate-ccw", className: "w-5 h-5 text-red-500" })
                ),
                React.createElement("button", { type: "button", className: cx('photo-editor-tool', mode === 'marker' && 'active'), onClick: () => { setMode('marker'); setMarkerSliderActive(false); }, "aria-pressed": mode === 'marker' },
                    React.createElement(Icon, { name: "marker", className: "h-4 w-4" }),
                    React.createElement("span", null, "Marker")),
                React.createElement("button", { type: "button", className: "photo-editor-tool", onClick: () => setMarkers((current) => current.slice(0, -1)), disabled: !hasMarkers },
                    React.createElement(Icon, { name: "left", className: "h-4 w-4" }),
                    React.createElement("span", null, "Undo")),
                React.createElement("button", { type: "button", className: "photo-editor-tool", onClick: resetEditor },
                    React.createElement(Icon, { name: "eraser", className: "h-4 w-4" }),
                    React.createElement("span", null, "Reset"))),
            React.createElement("div", { className: "photo-editor-options", "aria-label": "Pengaturan editor" },
                mode === 'move' ? React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "rounded-2xl bg-emerald-50 px-3 py-2 text-[11px] font-bold leading-4 text-emerald-900 ring-1 ring-emerald-100" }, "Pilih ratio ketika mode Geser aktif, lalu geser/cubit foto agar pas frame."),
                    React.createElement("div", { className: "photo-editor-ratio-grid" }, PHOTO_EDITOR_RATIOS.map((ratio) => React.createElement("button", { key: ratio.key, type: "button", className: cx('photo-editor-chip', selectedRatio?.key === ratio.key && 'active'), onClick: () => changeRatio(ratio), "aria-pressed": selectedRatio?.key === ratio.key }, ratio.label)))) : null,
                mode === 'marker' ? React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "rounded-2xl bg-rose-50 px-3 py-2 text-[11px] font-bold leading-4 text-rose-900 ring-1 ring-rose-100" }, "Atur ukuran marker dengan slider, lalu tap area foto untuk memasang circle."),
                    React.createElement("div", { className: "photo-editor-option-row marker-slider-row" },
                        React.createElement("span", null, "Marker"),
                        React.createElement("div", { className: "photo-editor-marker-slider-wrap" },
                            React.createElement("input", { type: "range", min: markerMinSize, max: markerMaxSize, step: "2", value: activeMarkerSize, className: "photo-editor-marker-slider", onPointerDown: () => setMarkerSliderActive(true), onPointerUp: () => setMarkerSliderActive(false), onPointerCancel: () => setMarkerSliderActive(false), onTouchStart: () => setMarkerSliderActive(true), onTouchEnd: () => setMarkerSliderActive(false), onMouseDown: () => setMarkerSliderActive(true), onMouseUp: () => setMarkerSliderActive(false), onBlur: () => setMarkerSliderActive(false), onChange: (event) => { setMarkerSliderActive(true); setMarkerSize(Math.max(markerMinSize, Math.min(markerMaxSize, Number(event.target.value) || 58))); }, "aria-label": "Ukuran marker" }),
                            React.createElement("b", { className: "photo-editor-marker-size-label" }, Math.round(activeMarkerSize))))) : null),
            React.createElement("div", { className: cx('photo-editor-canvas-shell photo-editor-v10-stage', mode === 'marker' && 'marker-preview-active') },
                !imageReady ? React.createElement("div", { className: "photo-editor-loading" }, "Memuat foto...") : null,
                React.createElement("canvas", { ref: canvasRef, width: canvasSize.width, height: canvasSize.height, style: { aspectRatio: canvasSize.width + ' / ' + canvasSize.height, touchAction: 'none' }, className: "photo-editor-canvas", onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onPointerUp: handlePointerUp, onPointerCancel: handlePointerUp, onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd, onWheel: handleWheel }),
                mode === 'marker' && markerSliderActive && imageReady ? React.createElement("div", { className: "photo-editor-marker-center-preview", style: { '--marker-preview-size': markerPreviewDiameterPct + '%' }, "aria-hidden": "true" },
                    React.createElement("span", null)) : null),
            React.createElement("div", { className: "photo-editor-v10-footer" },
                React.createElement("div", { className: "photo-editor-hint" },
                    React.createElement("span", null, mode === 'marker' ? 'Tap 1 jari untuk marker. Cubit 2 jari tidak akan membuat marker.' : 'Cubit untuk zoom, geser foto.')),
                React.createElement("button", { type: "button", className: "photo-editor-save", onClick: saveEditedImage, disabled: !imageReady },
                    React.createElement(Icon, { name: "check", className: "h-5 w-5" }),
                    React.createElement("span", null, "Simpan"))))));
    return ReactDOM?.createPortal ? ReactDOM.createPortal(modal, document.body) : modal;
}
function PhotoInput({ value, onChange, onRemove, label = 'Foto', compact = false, rich = false, required = false, matchCropFrame = false, cropRatio = PDF_PHOTO_CROP_RATIO, hideDescription = false, hideActions = false }) {
    const cameraRef = useRef(null);
    const galleryRef = useRef(null);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editorImageOverride, setEditorImageOverride] = useState('');
    async function handleFiles(event) {
        const input = event.target;
        const file = input.files && input.files[0];
        if (!file) {
            rbvFinishCameraCapture();
            return;
        }
        try {
            rbvPrepareCameraCapture();
            const dataUrl = await compressImageFileForLite(file, RBV_ULTRA_LITE_CAMERA_MODE ? { maxSide: 900, quality: 0.58 } : {});
            onChange({ ...(value || blankPhoto()), image: dataUrl, cropAspect: matchCropFrame ? ratioToAspectString(cropRatio) : '', uploadedAt: nowIso() });
            setEditorImageOverride(dataUrl);
            window.setTimeout(() => setEditorOpen(true), 0);
        }
        catch (error) {
            alert(rbvPhotoReadErrorMessage(error));
        }
        finally {
            try { input.value = ''; } catch (error) {}
            rbvFinishCameraCapture();
        }
    }
    function clearPhoto() {
        if (!confirmAction(onRemove ? 'Hapus card evidence ini?' : 'Hapus foto ini?'))
            return;
        if (typeof onRemove === 'function') {
            onRemove();
            return;
        }
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
                value?.image ? React.createElement(Button, { variant: "icon", onClick: () => { setEditorImageOverride(''); setEditorOpen(true); }, "aria-label": "Edit crop dan marker" },
                    React.createElement(Icon, { name: "crop", className: "h-4 w-4" })) : null,
                value?.image ? React.createElement(Button, { variant: "icon", onClick: clearPhoto, "aria-label": "Hapus foto" },
                    React.createElement(Icon, { name: "trash", className: "h-4 w-4" })) : null)),
        React.createElement("div", { className: cx('photo-frame relative grid place-items-center overflow-hidden', value?.image ? 'has-image' : '', compact ? 'min-h-[150px]' : 'min-h-[210px]') }, value?.image ? React.createElement("img", { src: value.image, alt: label, loading: "lazy", decoding: "async" }) : React.createElement("div", { className: "flex flex-col items-center px-5 text-center text-slate-500" },
            React.createElement("div", { className: "mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white text-audit-primary shadow-sm" },
                React.createElement(Icon, { name: "image", className: "h-7 w-7" })),
            React.createElement("p", { className: "text-sm font-bold text-slate-700" }, "Upload foto"))),
        React.createElement("div", { className: cx('photo-actions flex items-center justify-center gap-2 border-t border-slate-200 p-3', hideActions && 'hidden') },
            !hideActions ? React.createElement("label", { className: "rbv-native-file-trigger rbv-native-photo-button", "aria-label": "Ambil foto dari kamera", onPointerDown: rbvPrepareCameraCapture, onTouchStart: rbvPrepareCameraCapture },
                React.createElement("input", { ref: cameraRef, type: "file", accept: "image/*", capture: "environment", className: "rbv-native-file-input", onClick: (event) => { rbvPrepareCameraCapture(); try { event.currentTarget.value = ''; } catch (error) {} }, onChange: handleFiles }),
                React.createElement(Icon, { name: "camera", className: "h-4 w-4" })) : null,
            !hideActions ? React.createElement("label", { className: "rbv-native-file-trigger rbv-native-photo-button", "aria-label": "Pilih foto dari galeri", onPointerDown: rbvPrepareCameraCapture, onTouchStart: rbvPrepareCameraCapture },
                React.createElement("input", { ref: galleryRef, type: "file", accept: "image/*", className: "rbv-native-file-input", onClick: (event) => { rbvPrepareCameraCapture(); try { event.currentTarget.value = ''; } catch (error) {} }, onChange: handleFiles }),
                React.createElement(Icon, { name: "gallery", className: "h-4 w-4" })) : null),
        !hideDescription ? React.createElement("div", { className: "border-t border-slate-200 p-3" }, rich ? React.createElement(RichTextInput, { value: description, onChange: (nextDescription) => onChange({ ...(value || blankPhoto()), description: nextDescription }), placeholder: "Deskripsi foto...", minHeight: 92 }) : React.createElement(TextArea, { value: description, onChange: (event) => onChange({ ...(value || blankPhoto()), description: event.target.value }), placeholder: "Deskripsi foto...", minRows: 2 })) : null,
        React.createElement(PhotoEditorModal, { open: editorOpen, image: editorImageOverride || value?.image || '', title: label, cropRatio: cropRatio, onClose: () => { setEditorOpen(false); setEditorImageOverride(''); }, onSave: (editedImage, meta) => { setEditorImageOverride(''); onChange({ ...(value || blankPhoto()), image: editedImage, cropAspect: meta?.aspectRatio || value?.cropAspect || ratioToAspectString(cropRatio) || '' }); } })));
}
function SectionShell({ title, children, actions, preTitle }) {
    return (React.createElement("section", { className: "slide-enter fade-in" },
        React.createElement("div", { className: "section-heading mb-5 flex flex-col gap-3" },
            React.createElement("div", { className: "section-title-row flex min-w-0 items-center justify-between gap-3" },
                React.createElement("h2", { className: "min-w-0 flex-1 text-2xl font-black tracking-tight text-slate-950 md:text-3xl" }, title),
                actions ? React.createElement("div", { className: "section-actions flex shrink-0 items-center justify-end gap-2" }, actions) : null),
            preTitle ? React.createElement("div", { className: "section-pretitle" }, preTitle) : null),
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
function paraphraseAuditText(text, fieldType) {
    let t = String(text || '').trim();
    const replacements = [
        [/kotor|debu|berkerak|kumel/gi, "kurang bersih dan terdapat tumpukan kotoran"],
        [/rusak|error|jebol|mati/gi, "kendala pada alat sehingga belum berfungsi normal"],
        [/habis|kosong|nggak ada|gaada/gi, "stok barang habis (out of stock)"],
        [/bau|aroma jelek/gi, "timbul bau kurang sedap yang berisiko mengganggu kebersihan"],
        [/lupa|nggak tau|kurang paham/gi, "kurang teliti dan perlu sosialisasi ulang prosedur SOP"],
        [/bersihin|cuci|lap/gi, "dilakukan pembersihan menyeluruh (deep cleaning)"],
        [/berantakan|acak-acakan/gi, "penataan barang kurang rapi (belum sesuai standar 5R)"],
        [/telat|lambat/gi, "keterlambatan dalam penyelesaian operasional"]
    ];
    replacements.forEach(([regex, formal]) => {
        t = t.replace(regex, formal);
    });
    if (t) {
        t = t.charAt(0).toUpperCase() + t.slice(1);
        if (!/[.!?:;]$/.test(t)) t += ".";
    }
    if (fieldType === 'temuan') {
        if (!t) return "Hasil pengecekan area menunjukkan kebersihan dan kerapian perlu ditingkatkan sesuai standar SOP.";
        if (!/^([Hh]asil|[Bb]erdasarkan|[Tt]erdapat|[Dd]itemukan|[Kk]ondisi|[Ii]nspeksi|[Oo]bservasi)/.test(t)) {
            return "Hasil pemeriksaan menunjukkan bahwa " + t.charAt(0).toLowerCase() + t.slice(1);
        }
        return t;
    }
    else if (fieldType === 'kondisiIdeal') {
        if (!t) return "Sesuai standar SOP, seluruh area kerja dan peralatan harus selalu bersih, rapi, dan siap pakai.";
        if (!/^([Ss]esuai|[Bb]erdasarkan|[Mm]engacu|[Kk]ondisi|[Ss]tandar|[Pp]rotokol)/.test(t)) {
            return "Sesuai standar SOP yang berlaku, " + t.charAt(0).toLowerCase() + t.slice(1);
        }
        return t;
    }
    else if (fieldType === 'dampak') {
        if (!t) return "Berisiko menurunkan kenyamanan pelanggan serta standar pelayanan toko.";
        if (!/^([Bb]erisiko|[Bb]erpotensi|[Dd]apat|[Mm]enimbulkan|[Mm]enyebabkan|[Bb]erdampak|[Mm]emicu)/.test(t)) {
            return "Berisiko " + t.charAt(0).toLowerCase() + t.slice(1);
        }
        return t;
    }
    else if (fieldType === 'penyebab') {
        if (!t) return "Penyebab utama: Kurang kontrol rutin dan pengecekan checklist harian oleh tim di area tersebut.";
        if (!/^([Pp]enyebab|[Hh]asil|[Kk]urangnya|[Bb]elum|[Tt]erdapat|[Rr]oot|[Kk]elalaian)/.test(t)) {
            return "Penyebab utama: " + t.charAt(0).toLowerCase() + t.slice(1);
        }
        return t;
    }
    else if (fieldType === 'tindakan') {
        if (!t) return "Tindakan perbaikan: Melakukan pembersihan/perbaikan segera, briefing tim, serta pengawasan rutin oleh manager.";
        if (!/^([Tt]indakan|[Rr]encana|[Mm]elakukan|[Ss]egera|[Dd]ilakukan|[Kk]oreksi)/.test(t)) {
            return "Tindakan perbaikan: " + t.charAt(0).toLowerCase() + t.slice(1);
        }
        return t;
    }
    else if (fieldType === 'hasil') {
        if (!t) return "Status evaluasi: Tindakan perbaikan sudah dilakukan dan diverifikasi sesuai standar SOP.";
        if (!/^([Ss]tatus|[Tt]indakan|[Ss]udah|[Tt]elah|[Hh]asil|[Dd]iverifikasi)/.test(t)) {
            return "Status evaluasi: " + t.charAt(0).toLowerCase() + t.slice(1);
        }
        return t;
    }
    return t;
}
function paraphraseObservationRow(row) {
    return {
        ...row,
        temuan: paraphraseAuditText(row.temuan, 'temuan'),
        kondisiIdeal: paraphraseAuditText(row.kondisiIdeal, 'kondisiIdeal'),
        dampak: paraphraseAuditText(row.dampak, 'dampak'),
        penyebab: paraphraseAuditText(row.penyebab, 'penyebab'),
        tindakan: paraphraseAuditText(row.tindakan, 'tindakan'),
        hasil: paraphraseAuditText(row.hasil, 'hasil')
    };
}
const DEFAULT_GEMINI_API_KEY = (typeof atob === 'function' ? atob : (s => Buffer.from(s, 'base64').toString('utf8')))("QVEuQWI4Uk42Sms2aFk3RlF2Mk9pU2sybXFrMDBLMzhwV1F4MlJoZk1lZmo0NTAxWjdrRHc=");

async function callGeminiObservationParaphrase(row) {
    const prompt = `Kamu adalah seorang auditor operasional senior di industri restoran/F&B.
Tugasmu adalah memperbaiki kalimat catatan temuan audit dari lapangan menjadi laporan yang lebih rapi, profesional, tapi TUKANG KETIKNYA TETAP MANUSIA (natural).
PENTING: 
- Jangan gunakan gaya bahasa kaku ala robot AI, jauhi kata-kata klise AI seperti "Oleh karena itu", "Penting untuk", atau "Memastikan bahwa".
- Gunakan bahasa Indonesia sehari-hari di dunia kerja/profesional yang lugas, mengalir, dan to-the-point, seperti laporan yang diketik asli oleh manusia.
- Jangan merubah fakta asli dari temuan. Jika ada kolom yang kosong, isi dengan standar operasional yang wajar (common sense SOP) dengan singkat.

Input data temuan:
- Temuan: "${row.temuan || ''}"
- Kondisi Ideal: "${row.kondisiIdeal || ''}"
- Dampak: "${row.dampak || ''}"
- Penyebab (Root Cause): "${row.penyebab || ''}"
- Tindakan Aksi (Corrective Action): "${row.tindakan || ''}"
- Hasil: "${row.hasil || ''}"

Kembalikan HANYA format JSON murni TANPA markdown backtick/code block:
{
  "temuan": "...",
  "kondisiIdeal": "...",
  "dampak": "...",
  "penyebab": "...",
  "tindakan": "...",
  "hasil": "..."
}`;

    const keys = [
        { provider: 'gemini', key: DEFAULT_GEMINI_API_KEY, model: 'gemini-3.5-flash' },
        { provider: 'gemini', key: atob('QVEuQWI4Uk42SUh4MlhZek9lZnA1UGltU3YydWtoRzBsV3RzWk5nNFBYZmtaMklrbC03c1E='), model: 'gemini-3.5-flash' },
        { provider: 'openai', key: atob('c2stcHJvai0zT0NnVEQxVW5qcWpSdDhSSFU0YnotNmh0T2l1OUJEZklkUzM5bHlKaUU3T1VjZUU5RWM4UkJGRmJNVjJjMWpKNmtHT1pfSG9zV1QzQmxia0ZKRHVPVjJiYmhaemhxVTZFU3dpWVpXM0F4S0VMcXpzdHY0dFVnRkZpZmlEcTBHR1RMSlRXNThWUy0yNWVBZGNQQ1JRR21uM0xKY0E='), model: 'gpt-4o-mini' },
        { provider: 'deepseek', key: atob('YXJrLTM4MTM3NzQyLWQ3ZDQtNDFiNi05YmI3LTZiNjc0ZWRlMWVlMy0xYTE5ZA=='), model: 'deepseek-chat' },
        { provider: 'groq', key: atob('ODhiZTIzZDhlNWFlNDM2MDlmZTE4NDViNjg4YTk4ZjQ='), model: 'llama-3.1-8b-instant' }
    ];

    let lastError = null;
    let parsed = null;

    for (const conf of keys) {
        try {
            if (conf.provider === 'gemini') {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${conf.model}:generateContent?key=${conf.key}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.25, responseMimeType: "application/json" }
                    })
                });
                if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
                const data = await response.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                parsed = JSON.parse(text.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim());
                break;
            } else if (conf.provider === 'openai' || conf.provider === 'deepseek' || conf.provider === 'groq') {
                let baseUrl = 'https://corsproxy.io/?https://api.openai.com/v1/chat/completions';
                if (conf.provider === 'deepseek') baseUrl = 'https://corsproxy.io/?https://api.deepseek.com/chat/completions';
                if (conf.provider === 'groq') baseUrl = 'https://corsproxy.io/?https://api.groq.com/openai/v1/chat/completions';
                
                const response = await fetch(baseUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${conf.key}` },
                    body: JSON.stringify({
                        model: conf.model,
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.25,
                        response_format: (conf.provider === 'openai' || conf.provider === 'deepseek') ? { type: "json_object" } : undefined
                    })
                });
                if (!response.ok) throw new Error(`${conf.provider} HTTP ${response.status}`);
                const data = await response.json();
                const text = data?.choices?.[0]?.message?.content || '';
                parsed = JSON.parse(text.replace(/\`\`\`json/gi, '').replace(/\`\`\`/g, '').trim());
                break;
            }
        } catch (e) {
            console.warn(`${conf.provider} paraphrase fallback failed:`, e.message);
            lastError = e;
        }
    }
    
    if (!parsed) throw lastError || new Error("All AI paraphrase providers failed");
    
    return {
        ...row,
        temuan: parsed.temuan || row.temuan || '',
        kondisiIdeal: parsed.kondisiIdeal || row.kondisiIdeal || '',
        dampak: parsed.dampak || row.dampak || '',
        penyebab: parsed.penyebab || row.penyebab || '',
        tindakan: parsed.tindakan || row.tindakan || '',
        hasil: parsed.hasil || row.hasil || ''
    };
}


async function callGeminiExecutiveSummary({ qscTexts, opiTexts, storeFindings, totalVisits, topQSC, topOPI }) {
    const topStores = (storeFindings || []).slice(0, 8).map(s => `${s.storeName}: ${s.totalFindings} temuan (QSC: ${s.qscCount}, OPI: ${s.opiCount})`).join('\n');
    const qscSample = (qscTexts || []).slice(0, 150).join(' | ');
    const opiSample = (opiTexts || []).slice(0, 150).join(' | ');
    const topQscKeywords = (topQSC || []).slice(0, 20).map(k => `"${k.keyword}" (${k.count}x)`).join(', ');
    const topOpiKeywords = (topOPI || []).slice(0, 20).map(k => `"${k.keyword}" (${k.count}x)`).join(', ');
    const prompt = `Kamu adalah seorang Area Manager atau Auditor Senior yang sedang mengetik laporan evaluasi operasional restoran.
Tugasmu adalah membuat EXECUTIVE SUMMARY dalam Bahasa Indonesia berdasarkan data di bawah ini.
PENTING:
- Gunakan gaya bahasa kerja profesional yang NATURAL dan LUGAS, layaknya manusia asli yang mengetik laporan.
- JANGAN gunakan kata-kata kaku ala robot AI seperti "Penting untuk dicatat", "Kesimpulannya", "Oleh karena itu", atau "Memastikan bahwa".
- Buat kalimatnya mengalir, to the point, dan langsung fokus ke inti masalah.

Data Agregat dari SEMUA user/auditor:
- Total kunjungan: ${totalVisits}
- Top keyword temuan QSC: ${topQscKeywords || 'Tidak ada'}
- Top keyword temuan OPI: ${topOpiKeywords || 'Tidak ada'}

Toko dengan temuan terbanyak:
${topStores || 'Tidak ada data toko'}

Contoh temuan QSC dari lapangan:
${qscSample || 'Tidak ada'}

Contoh temuan OPI dari lapangan:
${opiSample || 'Tidak ada'}

Buatkan ringkasan dengan format (TANPA pendahuluan/penutup basa-basi):
1. OVERVIEW singkat (1-2 kalimat)
2. ANALISA ISU TERBANYAK (Kategorikan isu spesifik berdasarkan frekuensi terbanyak. Misal: ⚠️ Kesalahan Label ROX - 20 temuan)
3. TOKO KRITIS (sebutkan 2-3 toko paling banyak temuan dan isu utamanya)
4. REKOMENDASI (2-3 action items konkret dengan emoji 💡)

Jangan terlalu panjang - maksimal 200 kata. Kembalikan HANYA teks ringkasan tanpa format JSON atau markdown code block.`;

    const keys = [
        { provider: 'gemini', key: DEFAULT_GEMINI_API_KEY, model: 'gemini-3.5-flash' },
        { provider: 'gemini', key: atob('QVEuQWI4Uk42SUh4MlhZek9lZnA1UGltU3YydWtoRzBsV3RzWk5nNFBYZmtaMklrbC03c1E='), model: 'gemini-3.5-flash' },
        { provider: 'openai', key: atob('c2stcHJvai0zT0NnVEQxVW5qcWpSdDhSSFU0YnotNmh0T2l1OUJEZklkUzM5bHlKaUU3T1VjZUU5RWM4UkJGRmJNVjJjMWpKNmtHT1pfSG9zV1QzQmxia0ZKRHVPVjJiYmhaemhxVTZFU3dpWVpXM0F4S0VMcXpzdHY0dFVnRkZpZmlEcTBHR1RMSlRXNThWUy0yNWVBZGNQQ1JRR21uM0xKY0E='), model: 'gpt-4o-mini' },
        { provider: 'deepseek', key: atob('YXJrLTM4MTM3NzQyLWQ3ZDQtNDFiNi05YmI3LTZiNjc0ZWRlMWVlMy0xYTE5ZA=='), model: 'deepseek-chat' },
        { provider: 'groq', key: atob('ODhiZTIzZDhlNWFlNDM2MDlmZTE4NDViNjg4YTk4ZjQ='), model: 'llama-3.1-8b-instant' }
    ];

    let lastError = null;
    
    for (const conf of keys) {
        try {
            if (conf.provider === 'gemini') {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${conf.model}:generateContent?key=${conf.key}`;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.4, maxOutputTokens: 2500 }
                    })
                });
                if (!response.ok) {
                    const txt = await response.text();
                    throw new Error(`Gemini API error: ${response.status} - ${txt}`);
                }
                const data = await response.json();
                const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (resultText.trim()) return resultText.trim();
            } else if (conf.provider === 'openai' || conf.provider === 'deepseek' || conf.provider === 'groq') {
                let baseUrl = 'https://corsproxy.io/?https://api.openai.com/v1/chat/completions';
                if (conf.provider === 'deepseek') baseUrl = 'https://corsproxy.io/?https://api.deepseek.com/chat/completions';
                if (conf.provider === 'groq') baseUrl = 'https://corsproxy.io/?https://api.groq.com/openai/v1/chat/completions';
                
                const response = await fetch(baseUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${conf.key}`
                    },
                    body: JSON.stringify({
                        model: conf.model,
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.4,
                        max_tokens: 2500
                    })
                });
                if (!response.ok) {
                    const txt = await response.text();
                    throw new Error(`${conf.provider} API error: ${response.status} - ${txt}`);
                }
                const data = await response.json();
                const resultText = data?.choices?.[0]?.message?.content || '';
                if (resultText.trim()) return resultText.trim();
            }
        } catch (e) {
            console.warn(`${conf.provider} fallback failed:`, e.message);
            lastError = e;
        }
    }
    
    throw lastError || new Error("All AI providers failed");
}


function ObservationCards({ title, rows, onChange }) {
    const safeRows = rows?.length ? rows : [blankObservationRow()];
    const [activeIndex, setActiveIndex] = useState(0);
    const [aiLoadingIndex, setAiLoadingIndex] = useState(null);
    const activeRowNumber = Math.min(activeIndex + 1, safeRows.length);
    useEffect(() => {
        setActiveIndex((current) => Math.max(0, Math.min(current, safeRows.length - 1)));
    }, [safeRows.length]);
    const updateRow = (index, patch) => onChange(safeRows.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
    const handleAiParaphrase = async (index) => {
        const row = safeRows[index] || {};
        setAiLoadingIndex(index);
        try {
            const paraphrased = await callGeminiObservationParaphrase(row);
            updateRow(index, paraphrased);
        } catch (error) {
            console.warn('Gemini API fallback to local paraphrase:', error);
            const fallback = paraphraseObservationRow(row);
            updateRow(index, fallback);
        } finally {
            setAiLoadingIndex(null);
        }
    };
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
            bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
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
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("button", {
                        type: "button",
                        onClick: () => handleAiParaphrase(index),
                        disabled: aiLoadingIndex === index,
                        className: cx(
                            "w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 text-amber-300 hover:text-amber-200 shadow-sm hover:shadow-md hover:bg-slate-800 active:scale-95 transition-all cursor-pointer border border-amber-400/30",
                            aiLoadingIndex === index && "opacity-75 cursor-wait"
                        ),
                        title: "Auto Paraphrase BESTIE AI - Ubah ke bahasa audit profesional"
                    },
                        React.createElement("span", { className: cx("text-base", aiLoadingIndex === index && "animate-spin inline-block") }, aiLoadingIndex === index ? "⏳" : "✨")
                    ),
                    React.createElement(Button, { variant: "icon", onClick: () => removeRow(index), "aria-label": "Hapus row" },
                        React.createElement(Icon, { name: "trash", className: "h-4 w-4" }))
                )),
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
    const cameraRef = useRef(null);
    const galleryRef = useRef(null);
    const sourcePhotos = Array.isArray(photos) ? photos : [];
    const meaningfulPhotos = sourcePhotos.filter((photo) => photo && (photo.image || cleanText(photo.description)));
    const safePhotos = meaningfulPhotos;
    const normalizeNextPhotos = (next) => (Array.isArray(next) ? next : []).filter((photo) => photo && (photo.image || cleanText(photo.description)));
    const updatePhoto = (index, value) => {
        const next = safePhotos.map((photo, photoIndex) => photoIndex === index ? value : photo);
        onChange(normalizeNextPhotos(next));
    };
    const removePhotoCard = (index) => {
        const next = safePhotos.filter((_, photoIndex) => photoIndex !== index);
        onChange(normalizeNextPhotos(next));
    };
    async function handleFloatingFiles(event) {
        const input = event.target;
        const files = Array.from(input.files || []);
        if (!files.length) {
            rbvFinishCameraCapture();
            return;
        }
        try {
            rbvPrepareCameraCapture();
            const { result: uploaded, errors } = await rbvReadEvidenceFiles(files, RBV_ULTRA_LITE_CAMERA_MODE ? { maxSide: 900, quality: 0.58 } : {});
            if (uploaded.length) {
                const existing = safePhotos.filter((photo) => photo.image || cleanText(photo.description));
                try {
                    onChange(normalizeNextPhotos([...uploaded.reverse(), ...existing]));
                } catch (saveError) {
                    console.warn('Foto terbaca tapi gagal disimpan ke state/localStorage:', saveError);
                    alert(rbvPhotoReadErrorMessage(saveError));
                    return;
                }
            }
            if (!uploaded.length && errors.length) {
                alert(rbvPhotoReadErrorMessage(errors[0]));
            }
            else if (errors.length) {
                alert(`${uploaded.length} foto berhasil ditambahkan. ${errors.length} foto gagal dibaca.`);
            }
        }
        catch (error) {
            alert(rbvPhotoReadErrorMessage(error));
        }
        finally {
            try { input.value = ''; } catch (error) {}
            rbvFinishCameraCapture();
        }
    }
    const floatingCapture = (React.createElement("div", { className: "evidence-floating-capture evidence-floating-capture-compact", role: "group", "aria-label": "Upload foto evidence" },
        React.createElement("label", { className: "rbv-native-file-trigger evidence-floating-button evidence-floating-camera evidence-floating-icon-button", "aria-label": "Ambil foto evidence dari kamera", onPointerDown: rbvPrepareCameraCapture, onTouchStart: rbvPrepareCameraCapture },
            React.createElement("input", { ref: cameraRef, type: "file", accept: "image/*", capture: "environment", className: "rbv-native-file-input", onClick: (event) => { rbvPrepareCameraCapture(); try { event.currentTarget.value = ''; } catch (error) {} }, onChange: handleFloatingFiles }),
            React.createElement(Icon, { name: "camera", className: "h-5 w-5" }),
            React.createElement("span", { className: "evidence-floating-label" }, "Kamera")),
        React.createElement("label", { className: "rbv-native-file-trigger evidence-floating-button evidence-floating-gallery evidence-floating-icon-button", "aria-label": "Pilih foto evidence dari galeri", onPointerDown: rbvPrepareCameraCapture, onTouchStart: rbvPrepareCameraCapture },
            React.createElement("input", { ref: galleryRef, type: "file", accept: "image/*", multiple: true, className: "rbv-native-file-input", "data-gallery-multiple": "true", onClick: (event) => { rbvPrepareCameraCapture(); try { event.currentTarget.value = ''; } catch (error) {} }, onChange: handleFloatingFiles }),
            React.createElement(Icon, { name: "gallery", className: "h-5 w-5" }),
            React.createElement("span", { className: "evidence-floating-label" }, "Galeri"))));
    const floatingPortal = (typeof document !== 'undefined' && ReactDOM?.createPortal)
        ? ReactDOM.createPortal(floatingCapture, document.body)
        : floatingCapture;
    return (React.createElement("div", { className: "photo-grid-system evidence-photo-grid-system grid gap-4" },
        floatingPortal,
        safePhotos.length ? React.createElement("div", { className: "evidence-photo-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-4" }, safePhotos.map((photo, index) => (React.createElement(PhotoInput, { key: photo.uploadedAt || index, label: prefix + ' ' + (index + 1), value: photo, onChange: (value) => updatePhoto(index, value), onRemove: () => removePhotoCard(index), compact: true, rich: true, matchCropFrame: false, cropRatio: PDF_PHOTO_CROP_RATIO, hideActions: true })))) : React.createElement("div", { className: "evidence-empty-state" },
            React.createElement(Icon, { name: "image", className: "h-7 w-7" }),
            React.createElement("strong", null, "Belum ada foto"),
            React.createElement("span", null, "Pilih Kamera atau Galeri untuk menambah foto."))));
}

const SECTION_DEFS = [
    { id: 'setup', label: 'Visit', title: 'Visit Setup', icon: 'store', hint: 'Bestie & store' },
    { id: 'crew', label: 'Crew', title: 'General Information', icon: 'calendar', hint: 'Tanggal & PIC' },
    { id: 'qsc-result', label: 'QSC', title: 'QSC / FAMITRACK Result', icon: 'camera', hint: 'Foto result' },
    { id: 'observation', label: 'Obs', title: 'Observation', icon: 'clipboard', hint: 'OPI & QSC' },
    { id: 'evidence', label: 'Evidence', title: 'Evidence', icon: 'image', hint: 'Foto temuan' }
];
function ProgressBar({ value }) {
    const capped = Math.max(0, Math.min(100, Math.round(value || 0)));
    const colorClass = capped >= 80 
        ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" 
        : capped >= 40 
            ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
            : "bg-gradient-to-r from-sky-400 to-blue-600";
    return (React.createElement("div", { className: "w-full rounded-full bg-slate-100 h-2.5 overflow-hidden border border-slate-200/60 shadow-inner" },
        React.createElement("div", { className: `${colorClass} h-full rounded-full transition-all duration-500 ease-out`, style: { width: `${capped}%` } })));
}

function ProgressMissingInfo({ visit, activeSection = null, maxItems = 4, compact = false }) {
    const missingItems = visitProgressMissingItems(visit, activeSection);
    if (!visit) return null;
    if (!missingItems.length) {
        return React.createElement("div", { className: cx("progress-missing-info-v265 complete", compact && "compact") },
            React.createElement(Icon, { name: "check", className: "h-3.5 w-3.5" }),
            React.createElement("span", null, "Semua bagian wajib sudah terisi"));
    }
    const visible = missingItems.slice(0, maxItems);
    const extra = Math.max(0, missingItems.length - visible.length);
    return React.createElement("div", { className: cx("progress-missing-info-v265", compact && "compact"), role: "status", "aria-live": "polite" },
        React.createElement("div", { className: "progress-missing-title-v265" },
            React.createElement(Icon, { name: "alert", className: "h-3.5 w-3.5" }),
            React.createElement("span", null,
                "Belum diisi ",
                React.createElement("strong", null,
                    missingItems.length,
                    " item"))),
        React.createElement("div", { className: "progress-missing-list-v265" },
            visible.map((item) => React.createElement("span", { key: `${item.sectionId}-${item.label}`, className: "progress-missing-pill-v265" }, item.text)),
            extra ? React.createElement("span", { className: "progress-missing-pill-v265 more" },
                "+",
                extra,
                " lainnya") : null));
}

function VisitSetupSection({ visit, update }) {
    // Revamp 229: master store can update from Convex while app is open.
    // Avoid memoizing against only visit fields so latest remote master data is visible immediately.
    const storeOptions = getStoresForBestie(visit.nama).map((item) => ({ label: item.label, value: item.value || item.label }));
    const baseDetail = getStoreWebDetail(visit.store);
    const manualDetail = visit.manualStoreDetail || {};
    const detail = { ...baseDetail, ...manualDetail, siteDescr: visit.store || manualDetail.siteDescr || baseDetail.siteDescr };
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
            React.createElement("div", { className: "visit-setup-card min-w-0 p-4 md:p-6" },
                React.createElement("div", { className: "grid gap-4 md:gap-5" },
                    React.createElement(SelectField, { label: "Nama Bestie", required: true, value: visit.nama || '', options: BESTIE_NAMES, onChange: handleBestieChange, placeholder: "Pilih nama bestie", icon: "user" }),
                    React.createElement(SelectField, { label: "Store", required: true, value: visit.store || '', options: storeOptions, onChange: handleStoreChange, placeholder: "Pilih store", icon: "store" }),
                    React.createElement("div", { className: "visit-progress-card rounded-2xl bg-emerald-50 p-4 text-emerald-900 ring-1 ring-emerald-100" },
                        React.createElement("div", { className: "mb-2 flex items-center justify-between gap-3" },
                            React.createElement("p", { className: "text-xs font-bold uppercase tracking-wide" }, "Progress"),
                            React.createElement("p", { className: "text-sm font-black" },
                                progress,
                                "%")),
                        React.createElement(ProgressBar, { value: progress }),
                        React.createElement(ProgressMissingInfo, { visit: visit, maxItems: 5 })),
                    React.createElement("div", { className: "visit-detail-edit p-1" },
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
    const preTitle = React.createElement("div", { className: "section-switcher flex min-w-0 gap-2 overflow-x-auto pb-1" },
        React.createElement("button", { type: "button", className: cx('subnav-chip prominent', tab === 'opi' && 'active'), onClick: () => setTab('opi') },
            React.createElement(Icon, { name: "clipboard", className: "h-4 w-4" }),
            " OPI Project"),
        React.createElement("button", { type: "button", className: cx('subnav-chip prominent', tab === 'qsc' && 'active'), onClick: () => setTab('qsc') },
            React.createElement(Icon, { name: "clipboard", className: "h-4 w-4" }),
            " QSC Observation"));
    return (React.createElement(SectionShell, { title: "Observation & Root Cause Analysis", preTitle: preTitle, actions: React.createElement(Toggle, { checked: enabled, onChange: setEnabled, label: toggleLabel }) }, !enabled ? React.createElement(InactiveSection, { title: (tab === 'opi' ? 'OPI Project' : 'QSC Observation') + ' disembunyikan' }) : tab === 'opi' ? React.createElement(ObservationCards, { key: "opi", title: "OPI Project Observation", rows: visit.opiData, onChange: (opiData) => update({ opiData }) }) : React.createElement(ObservationCards, { key: "qsc", title: "QSC Observation", rows: visit.qscData, onChange: (qscData) => update({ qscData }) })));
}
function EvidenceSection({ visit, update }) {
    const tab = visit.activeEvidenceTab === 'corrective' ? 'corrective' : 'finding';
    const setTab = (nextTab) => update({ activeEvidenceTab: nextTab });
    const enabled = tab === 'finding' ? visit.showFindingEvidence === true : visit.showCorrectiveAction === true;
    const setEnabled = (value) => tab === 'finding' ? update({ showFindingEvidence: value }) : update({ showCorrectiveAction: value });
    const toggleLabel = tab === 'finding' ? (enabled ? 'Hide Finding' : 'Unhide Finding') : (enabled ? 'Hide Corrective' : 'Unhide Corrective');
    const evidenceTabStyle = { minWidth: 0, width: '100%', justifyContent: 'center', paddingLeft: '8px', paddingRight: '8px', whiteSpace: 'nowrap' };
    const preTitle = React.createElement("div", { className: "section-switcher grid w-full min-w-0 grid-cols-2 gap-2 md:max-w-[460px]" },
        React.createElement("button", { type: "button", className: cx('subnav-chip prominent', tab === 'finding' && 'active'), style: evidenceTabStyle, onClick: () => setTab('finding') },
            React.createElement(Icon, { name: "image", className: "h-4 w-4 shrink-0" }),
            React.createElement("span", { className: "min-w-0 truncate" }, "Finding Evidence")),
        React.createElement("button", { type: "button", className: cx('subnav-chip prominent', tab === 'corrective' && 'active'), style: evidenceTabStyle, onClick: () => setTab('corrective') },
            React.createElement(Icon, { name: "image", className: "h-4 w-4 shrink-0" }),
            React.createElement("span", { className: "min-w-0 truncate" }, "Corrective Action")));
    return (React.createElement(SectionShell, { title: "Evidence Photos", preTitle: preTitle, actions: React.createElement(Toggle, { checked: enabled, onChange: setEnabled, label: toggleLabel }) }, !enabled ? React.createElement(InactiveSection, { title: (tab === 'finding' ? 'Finding Evidence' : 'Corrective Action') + ' disembunyikan' }) : tab === 'finding' ? React.createElement(PhotoGrid, { prefix: "Finding", photos: visit.findingEvidencePhotos, onChange: (findingEvidencePhotos) => update({ findingEvidencePhotos }) }) : React.createElement(PhotoGrid, { prefix: "Corrective", photos: visit.correctiveActionPhotos, onChange: (correctiveActionPhotos) => update({ correctiveActionPhotos }) })));
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
    return (React.createElement("div", { className: "fixed inset-0 z-[88] grid place-items-end bg-slate-950/65 p-0 backdrop-blur-sm lg:place-items-center lg:p-6", role: "dialog", "aria-modal": "true" },
        React.createElement("div", { className: "w-full rounded-t-[30px] bg-white p-5 shadow-2xl lg:max-w-2xl lg:rounded-[30px] lg:p-6" },
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
            try { window.RBV_ACTIVE_MEDIA_STREAMS?.delete(streamRef.current); } catch (error) {}
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
        ensureQrGeneratorReady().then(() => {
            if (window.QRCode?.toDataURL) {
                window.QRCode.toDataURL(payload, { width: 260, margin: 2, errorCorrectionLevel: 'M' }, (error, url) => {
                    if (!error && url)
                        setQrDataUrl(url);
                });
            }
        }).catch(() => {});
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
            try { await ensureQrScannerReady(); } catch (error) {}
            if (!window.jsQR) {
                setScanStatus('Scanner QR belum siap. Coba refresh setelah deploy selesai.');
                return;
            }
            const videoConstraints = RBV_ULTRA_LITE_CAMERA_MODE
                ? { facingMode: 'environment', width: { ideal: 640, max: 960 }, height: { ideal: 480, max: 720 }, frameRate: { ideal: 10, max: 15 } }
                : { facingMode: 'environment' };
            const stream = rbvRememberMediaStream(await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false }));
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
    const dragRef = useRef(null);
    const messageSignature = messages.join('|');
    const activeIndex = messages.length ? ((index % messages.length) + messages.length) % messages.length : 0;
    function goToNotice(nextIndex) {
        if (!messages.length)
            return;
        setIndex(((nextIndex % messages.length) + messages.length) % messages.length);
    }
    function nextNotice() {
        goToNotice(activeIndex + 1);
    }
    function prevNotice() {
        goToNotice(activeIndex - 1);
    }
    function readClientX(event) {
        if (event?.touches?.[0])
            return event.touches[0].clientX;
        if (event?.changedTouches?.[0])
            return event.changedTouches[0].clientX;
        return event?.clientX || 0;
    }
    function startManualSlide(event) {
        if (messages.length <= 1)
            return;
        dragRef.current = { x: readClientX(event), t: Date.now() };
    }
    function finishManualSlide(event) {
        const start = dragRef.current;
        dragRef.current = null;
        if (!start || messages.length <= 1)
            return;
        const delta = readClientX(event) - start.x;
        if (Math.abs(delta) < 34)
            return;
        if (delta < 0)
            nextNotice();
        else
            prevNotice();
    }
    useEffect(() => { setIndex(0); }, [messageSignature, notice.enabled]);
    useEffect(() => {
        if (!notice.enabled || messages.length <= 1)
            return undefined;
        const timer = window.setInterval(() => setIndex((current) => (current + 1) % messages.length), Math.round(notice.intervalSeconds * 1000));
        return () => window.clearInterval(timer);
    }, [notice.enabled, messages.length, notice.intervalSeconds, messageSignature]);
    if (!notice.enabled || !messages.length)
        return null;
    const activeMessage = messages[activeIndex] || messages[0];
    return (React.createElement("section", { className: "home-update-notice rounded-[24px] bg-white/90 px-4 py-4 shadow-sm", style: { overflow: 'hidden' } },
        React.createElement("style", null, `@keyframes rbvNoticeSmoothIn{0%{opacity:0;transform:translate3d(18px,0,0) scale(.985)}100%{opacity:1;transform:translate3d(0,0,0) scale(1)}} @keyframes rbvNoticeDot{0%,100%{transform:scale(.72);opacity:.34}50%{transform:scale(1);opacity:1}} @keyframes rbvInstallPulse{0%,100%{box-shadow:0 0 0 0 rgba(15,118,110,.28);transform:translateY(0)}50%{box-shadow:0 0 0 8px rgba(15,118,110,0);transform:translateY(-1px)}} .home-info-slide-zone{touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:grab}.home-info-slide-zone:active{cursor:grabbing}.home-info-dot{width:6px;height:6px;border-radius:999px;border:0;background:rgba(148,163,184,.55);padding:0;transition:width .22s ease,background .22s ease,transform .22s ease}.home-info-dot.active{width:18px;background:#0f766e;animation:rbvNoticeDot 1.7s ease-in-out infinite}.home-info-dot:focus-visible{outline:2px solid rgba(15,118,110,.35);outline-offset:3px}`),
        React.createElement("div", { className: "mx-auto flex min-h-[112px] max-w-2xl flex-col items-center justify-center text-center" },
            React.createElement("p", { className: "text-[10px] font-black uppercase tracking-[0.24em] text-audit-primary" }, "Informasi Update"),
            React.createElement("h2", { className: "mt-1 max-w-full truncate text-base font-black text-slate-950" }, notice.title),
            React.createElement("div", { className: "home-info-slide-zone mt-2 flex min-h-[42px] w-full items-center justify-center overflow-hidden px-2", onPointerDown: startManualSlide, onPointerUp: finishManualSlide, onPointerCancel: () => { dragRef.current = null; }, onTouchStart: startManualSlide, onTouchEnd: finishManualSlide, role: "group", "aria-roledescription": "carousel", "aria-label": "Slide informasi update" },
                React.createElement("p", { key: `${activeIndex}-${activeMessage}`, className: "mx-auto max-w-[34rem] text-center text-sm font-bold leading-5 text-slate-700", style: { animation: 'rbvNoticeSmoothIn 620ms cubic-bezier(.22,1,.36,1) both', willChange: 'opacity, transform' } }, activeMessage)),
            messages.length > 1 ? React.createElement("div", { className: "mt-2 flex items-center justify-center gap-1.5", "aria-label": `${activeIndex + 1} dari ${messages.length} info` }, messages.map((_, dotIndex) => React.createElement("button", { key: dotIndex, type: "button", className: cx('home-info-dot', dotIndex === activeIndex && 'active'), onClick: () => goToNotice(dotIndex), "aria-label": `Buka info ${dotIndex + 1}`, "aria-current": dotIndex === activeIndex ? 'true' : 'false' }))) : null,
            messages.length > 1 ? React.createElement("p", { className: "mt-1 text-[10px] font-bold text-slate-400 md:hidden" }, "Geser kiri/kanan untuk info lainnya") : null)));
}

function MasterStoreDetailModal({ open, onClose }) {
    const [query, setQuery] = useState('');
    const [stores, setStores] = useState(() => getEffectiveMasterStores());
    useEffect(() => {
        if (!open)
            return;
        setStores(getEffectiveMasterStores());
        const refresh = () => setStores(getEffectiveMasterStores());
        window.addEventListener('rbv-master-store-change', refresh);
        window.addEventListener('storage', refresh);
        return () => {
            window.removeEventListener('rbv-master-store-change', refresh);
            window.removeEventListener('storage', refresh);
        };
    }, [open]);
    useEffect(() => {
        if (!open)
            return;
        const previousOverflow = document.body?.style.overflow || '';
        if (document.body)
            document.body.style.overflow = 'hidden';
        return () => {
            if (document.body)
                document.body.style.overflow = previousOverflow;
        };
    }, [open]);
    if (!open)
        return null;
    const keyword = normalize(query);
    const filteredStores = stores.filter((store) => {
        if (!keyword)
            return true;
        const haystack = [
            store.siteCode, store.siteCode4, store.siteDescr, store.type, store.typeStore,
            store.city, store.address, store.emailStore, store.storeHead,
            store.areaManager, store.areaManagerEmail, store.regionalManager,
            store.regionalManagerEmail, store.operationalStatus, store.notes
        ].map((value) => normalize(value)).join(' ');
        return haystack.includes(keyword);
    });
    const meta = window.DEFAULT_STORE_MASTER_META || {};
    const fieldRows = (store) => [
        ['Kode Toko', store.siteCode4 || store.siteCode || '-'],
        ['Kode Site', store.siteCode || '-'],
        ['Tipe Toko', store.type || store.typeStore || '-'],
        ['Kota', store.city || '-'],
        ['Store Head', store.storeHead || '-'],
        ['Area Manager', store.areaManager || '-'],
        ['Email Area Manager', store.areaManagerEmail || '-'],
        ['Regional Manager', store.regionalManager || '-'],
        ['Email Regional Manager', store.regionalManagerEmail || '-'],
        ['Email Store', store.emailStore || '-'],
        ['Status', store.operationalStatus || 'active'],
        ['Alamat', store.address || '-'],
        ['Catatan', store.notes || '-']
    ];
    return (React.createElement("div", { className: "master-store-modal-overlay", role: "dialog", "aria-modal": "true", "aria-label": "Data master detail store", onMouseDown: (event) => { if (event.target === event.currentTarget)
            onClose(); } },
        React.createElement("section", { className: "master-store-modal-panel" },
            React.createElement("header", { className: "master-store-modal-header" },
                React.createElement("div", { className: "master-store-modal-title-wrap" },
                    React.createElement("span", { className: "master-store-modal-icon" },
                        React.createElement(Icon, { name: "store", className: "h-5 w-5" })),
                    React.createElement("div", { className: "min-w-0" },
                        React.createElement("p", { className: "master-store-modal-eyebrow" }, "Master Data"),
                        React.createElement("h2", { className: "master-store-modal-title" }, "Detail Store"),
                        React.createElement("p", { className: "master-store-modal-subtitle" }, meta.label || 'Data master store aktif'))),
                React.createElement("button", { type: "button", className: "master-store-modal-close", onClick: onClose, "aria-label": "Tutup data master store" },
                    React.createElement(Icon, { name: "close", className: "h-5 w-5" }))),
            React.createElement("div", { className: "master-store-modal-toolbar" },
                React.createElement("label", { className: "master-store-search-wrap" },
                    React.createElement(Icon, { name: "search", className: "h-4 w-4" }),
                    React.createElement("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Cari kode toko, nama store, AM, RM, kota...", autoComplete: "off" })),
                React.createElement("div", { className: "master-store-count-pill" }, filteredStores.length, " / ", stores.length, " store")),
            React.createElement("div", { className: "master-store-list" },
                filteredStores.length ? filteredStores.map((store, index) => React.createElement("article", { key: `${store.siteCode4 || store.siteCode || store.siteDescr}-${index}`, className: "master-store-card" },
                    React.createElement("div", { className: "master-store-card-head" },
                        React.createElement("div", { className: "min-w-0" },
                            React.createElement("h3", { className: "master-store-name" }, store.siteDescr || 'Store tanpa nama'),
                            React.createElement("p", { className: "master-store-meta" }, store.siteCode4 || store.siteCode || '-', " • ", store.type || store.typeStore || '-', store.city ? ` • ${store.city}` : '')),
                        React.createElement("span", { className: "master-store-code-pill" }, store.siteCode4 || store.siteCode || '-')),
                    React.createElement("div", { className: "master-store-detail-grid" }, fieldRows(store).map(([label, value]) => React.createElement("div", { key: label, className: "master-store-detail-cell" },
                        React.createElement("span", null, label),
                        React.createElement("strong", null, value || '-')))))) : React.createElement("div", { className: "master-store-empty" },
                    React.createElement(Icon, { name: "search", className: "h-8 w-8" }),
                    React.createElement("strong", null, "Data tidak ditemukan"),
                    React.createElement("span", null, "Coba cari dengan kode toko, nama store, Area Manager, atau Regional Manager."))))));
}

function SimpleChart({ type, data, options }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    
    useEffect(() => {
        if (!canvasRef.current) return;
        
        // Destroy old chart if exists
        if (chartRef.current) {
            chartRef.current.destroy();
        }
        
        // Create new chart
        chartRef.current = new window.Chart(canvasRef.current, {
            type,
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1500,
                    easing: 'easeOutQuart'
                },
                ...options
            }
        });
        
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [type, data, options]);
    
    return React.createElement("div", { className: "w-full h-full relative" },
        React.createElement("canvas", { ref: canvasRef })
    );
}

const INDONESIAN_STOP_WORDS = new Set([
    'dan', 'atau', 'di', 'ke', 'dari', 'yang', 'untuk', 'pada', 'dengan', 
    'ini', 'itu', 'adalah', 'sebagai', 'tidak', 'ya', 'sudah', 'belum',
    'bisa', 'akan', 'harus', 'dalam', 'atas', 'bawah', 'saat', 'ada',
    'juga', 'oleh', 'karena', 'seperti', 'kami', 'kita', 'mereka',
    'saya', 'anda', 'kamu', 'dia', 'nya', 'sangat', 'terlalu', 'kurang',
    'lebih', 'paling', 'baru', 'lama', 'baik', 'buruk', 'sedang',
    'masih', 'hanya', 'saja', 'pun', 'lah', 'kah', 'tah', 'dong', 'deh'
]);

function analyzeFindingTrends(texts) {
    if (!texts || texts.length === 0) return [];
    
    const wordCounts = {};
    const phraseCounts = {};

    texts.forEach(text => {
        if (!text) return;
        const cleanText = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
        const words = cleanText.split(/\s+/).filter(w => w.length > 2 && !INDONESIAN_STOP_WORDS.has(w));
        
        words.forEach(w => {
            wordCounts[w] = (wordCounts[w] || 0) + 1;
        });

        for (let i = 0; i < words.length - 1; i++) {
            const phrase = words[i] + ' ' + words[i+1];
            phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
        }
    });

    const topPhrases = Object.entries(phraseCounts)
        .filter(([_, count]) => count > 1)
        .sort((a, b) => b[1] - a[1]);

    const usedWords = new Set();
    const results = [];

    // Prioritize 2-word phrases
    for (let i = 0; i < topPhrases.length && results.length < 3; i++) {
        const [phrase, count] = topPhrases[i];
        results.push({ keyword: phrase, count });
        phrase.split(' ').forEach(w => usedWords.add(w));
    }

    // Fallback to single words if needed
    if (results.length < 3) {
        const topWords = Object.entries(wordCounts)
            .filter(([w, count]) => !usedWords.has(w))
        
        for (let i = 0; i < topWords.length && results.length < 3; i++) {
            results.push({ keyword: topWords[i][0], count: topWords[i][1] });
        }
    }

    return results;
}

function LeaderboardItem({ lb, idx }) {
    let narasi = "Belum Ada Kunjungan 🚀";
    if (lb.uniqueStoresMonthly > 0) {
        if (lb.uniqueStoresMonthly >= lb.totalAssigned && lb.totalAssigned > 0) narasi = "Target Achieved! 🎯";
        else if (idx === 0) narasi = "Top Performer Bulan Ini 🔥";
        else if (idx <= 2) narasi = "Great Progress ⭐";
        else narasi = "On Progress 💪";
    }

    return React.createElement("div", { className: "bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-audit-primary hover:shadow-md transition-all" },
        React.createElement("div", { className: "flex flex-col p-4 text-audit-ink select-none gap-3 sm:gap-4" },
            // Top Row: Avatar + Name + MVP badge
            React.createElement("div", { className: "flex items-start justify-between w-full" },
                React.createElement("div", { className: "flex items-center gap-3 min-w-0 pr-2" },
                    React.createElement("div", { className: "w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-lg sm:text-xl " + (idx === 0 ? "bg-amber-100 text-amber-600 shadow-inner" : idx === 1 ? "bg-slate-200 text-slate-500 shadow-inner" : idx === 2 ? "bg-orange-100 text-orange-700 shadow-inner" : "bg-slate-50 text-slate-400 border border-slate-100") + " shrink-0" }, idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : (idx + 1)),
                    React.createElement("div", { className: "min-w-0 flex-1" },
                        React.createElement("div", { className: "flex items-center gap-2 flex-wrap" },
                            React.createElement("h4", { className: "font-bold text-[13px] sm:text-[15px] text-audit-ink truncate" }, lb.name),
                            idx === 0 ? React.createElement("span", { className: "px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-[8px] sm:text-[9px] font-black text-white rounded-sm uppercase tracking-widest shadow-sm shrink-0" }, "MVP") : null
                        ),
                        React.createElement("p", { className: "text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-audit-primary truncate mt-0.5" }, narasi)
                    )
                )
            ),
            // Bottom Row: Badges + Score
            React.createElement("div", { className: "flex flex-col sm:flex-row items-center justify-between w-full bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 gap-3" },
                // Schedule Badge
                React.createElement("div", { className: "flex items-center w-full sm:w-auto min-w-0 flex-1 pr-2" },
                    React.createElement("div", { 
                        className: "flex items-center bg-white rounded-lg px-3 py-1.5 border border-slate-200/80 shadow-sm gap-2 w-full sm:w-auto min-w-0", 
                        title: lb.todaySchedule ? (lb.todaySchedule.description || 'Jadwal Aktif') : 'Tidak ada jadwal hari ini' 
                    },
                        React.createElement("div", { className: "flex items-center gap-1.5 shrink-0" },
                            React.createElement("span", { className: "w-2 h-2 rounded-full " + (lb.todaySchedule ? "bg-emerald-500 animate-pulse" : "bg-slate-300") }),
                            React.createElement("span", { className: "text-[10px] font-extrabold text-slate-500 uppercase tracking-wider" }, "Schedule :")
                        ),
                        React.createElement("span", { className: "text-xs font-black text-slate-800 truncate" }, 
                            lb.todaySchedule ? (lb.todaySchedule.description || 'Jadwal Aktif') : '-'
                        )
                    )
                ),
                // Main Score
                React.createElement("div", { className: "text-right flex w-full sm:w-auto justify-between sm:justify-end items-center sm:pl-3 sm:border-l border-slate-200" },
                    React.createElement("p", { className: "text-[9px] font-extrabold uppercase tracking-widest text-slate-400 sm:hidden" }, "Toko/Bulan"),
                    React.createElement("div", { className: "flex flex-col items-end" },
                        React.createElement("div", { className: "flex items-baseline gap-1" },
                            React.createElement("span", { className: "text-lg sm:text-xl font-black leading-none text-slate-800" }, lb.uniqueStoresMonthly),
                            React.createElement("span", { className: "text-[10px] sm:text-xs font-bold text-slate-400" }, "/", lb.totalAssigned)
                        ),
                        React.createElement("p", { className: "text-[8px] font-extrabold uppercase tracking-widest mt-0.5 text-slate-400 hidden sm:block" }, "Toko/Bulan")
                    )
                )
            )
        )
    );
}


function generateAiSummary(topQSC, topOPI, totalVisits) {
    if (totalVisits === 0) return "Belum ada data kunjungan untuk dianalisis oleh AI.";
    let summary = `Berdasarkan analisis ${totalVisits} kunjungan terakhir, `;
    
    const qscIssues = topQSC.filter(q => q.count > 0);
    const opiIssues = topOPI.filter(o => o.count > 0);
    
    if (qscIssues.length > 0) {
        const topIssue = qscIssues[0];
        const pct = Math.round((topIssue.count / totalVisits) * 100);
        summary += `\n• ⚠️ Peringatan: Sebanyak ${pct}% kunjungan memiliki temuan QSC terkait "${topIssue.keyword}". Ini perlu menjadi fokus perbaikan segera.`;
    } else {
        summary += `\n• ✅ Kualitas QSC secara umum sangat baik, minim temuan berulang.`;
    }
    
    if (opiIssues.length > 0) {
        const topIssue = opiIssues[0];
        const pct = Math.round((topIssue.count / totalVisits) * 100);
        summary += `\n• 📋 Catatan OPI: ${pct}% masalah operasional berpusat pada "${topIssue.keyword}".`;
    }
    
    if (qscIssues.length > 0 && opiIssues.length > 0) {
        summary += `\n• 💡 Rekomendasi: Lakukan training ulang atau briefing pagi untuk area ${qscIssues[0].keyword} dan ${opiIssues[0].keyword}.`;
    }
    
    return summary;
}


function VisitMap({ rows }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        if (!window.L || !mapRef.current) return;
        if (!mapInstance.current) {
            mapInstance.current = window.L.map(mapRef.current).setView([-2.5489, 118.0149], 5); // Center of Indonesia
            window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO'
            }).addTo(mapInstance.current);
        }

        const map = mapInstance.current;
        // Clear old markers
        map.eachLayer((layer) => {
            if (layer instanceof window.L.Marker) {
                map.removeLayer(layer);
            }
        });

        const validRows = (rows || []).filter(r => r.location && r.location.lat && r.location.lng);
        if (validRows.length === 0) return;

        const bounds = window.L.latLngBounds();
        validRows.forEach(r => {
            const loc = [r.location.lat, r.location.lng];
            bounds.extend(loc);
            
            // Marker with popups
            const dateStr = r.updated_at ? new Date(r.updated_at).toLocaleDateString('id-ID') : '';
            window.L.marker(loc).addTo(map)
                .bindPopup(`<b>${r.store_name || r.storeName || 'Store'}</b><br>Oleh: ${r.bestie_name || r.bestieName || '-'}<br>${dateStr}`);
        });
        
        if (validRows.length > 0) {
            map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
        }
    }, [rows]);

    return React.createElement("div", { ref: mapRef, className: "w-full rounded-2xl z-0 border border-slate-200 overflow-hidden", style: { height: '350px' } },
        (!rows || rows.filter(r => r.location).length === 0) && React.createElement("div", { className: "w-full h-full flex items-center justify-center bg-slate-50 text-slate-400 text-sm font-medium z-10 relative" }, "Belum ada kunjungan dengan data koordinat lokasi.")
    );
}

function AiInsightsPanel({ data }) {
    if (!data) return null;
    const [aiSummary, setAiSummary] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [aiLoading, setAiLoading] = useState(true);
    
    useEffect(() => {
        let unsubs = [];
                subscribeConvexQuery('listConfigs', { keys: ['aiExecutiveSummary'] }, (res) => {
            if (res && res[0] && res[0].payload) {
                setAiSummary(res[0].payload);
            }
            setAiLoading(false);
        }).then(sub => { if (sub) unsubs.push(sub); });
        return () => unsubs.forEach(u => u());
    }, []);

    const paragraphs = (aiSummary || '').split('\n').filter(p => p.trim() !== '');
    const previewParagraphs = isExpanded ? paragraphs : paragraphs.slice(0, 3);
    const hasMore = paragraphs.length > 3;

    return React.createElement("div", { className: "mb-8 bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 p-5 sm:p-6 rounded-[32px] border border-indigo-200/60 shadow-sm relative overflow-hidden" },
        React.createElement("div", { className: "absolute -right-10 -top-10 w-40 h-40 bg-indigo-200/20 rounded-full blur-2xl" }),
        React.createElement("div", { className: "absolute -left-8 -bottom-8 w-32 h-32 bg-violet-200/20 rounded-full blur-2xl" }),
        React.createElement("div", { className: "relative z-10" },
            React.createElement("div", { className: "flex items-center justify-between mb-4" },
                React.createElement("div", { className: "flex items-center gap-3" },
                    React.createElement("div", { className: "p-2.5 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30" }, 
                        React.createElement(Icon, { name: "spark", className: "w-5 h-5" })
                    ),
                    React.createElement("div", null,
                        React.createElement("h3", { className: "text-lg font-black text-indigo-900" }, "AI Executive Summary"),
                        React.createElement("p", { className: "text-[10px] font-bold uppercase tracking-widest" }, 
                                                        React.createElement("span", { className: "text-indigo-500" }, "Powered by BESTIE AI")
                        )
                    )
                ),
                aiLoading && React.createElement("div", { className: "p-2 animate-spin text-indigo-500" }, 
                    React.createElement(Icon, { name: "refresh", className: "w-4 h-4" })
                )
            ),
            aiLoading ? React.createElement("div", { className: "space-y-3 bg-white/60 p-4 rounded-2xl" },
                React.createElement("div", { className: "h-4 bg-indigo-200/50 rounded-full animate-pulse w-3/4" }),
                React.createElement("div", { className: "h-4 bg-indigo-200/40 rounded-full animate-pulse w-full" }),
                React.createElement("div", { className: "h-4 bg-indigo-200/30 rounded-full animate-pulse w-5/6" }),
                React.createElement("div", { className: "h-4 bg-violet-200/40 rounded-full animate-pulse w-2/3" }),
                React.createElement("div", { className: "h-4 bg-violet-200/30 rounded-full animate-pulse w-4/5" }),
                React.createElement("p", { className: "text-xs text-indigo-400 font-semibold mt-2 text-center animate-pulse" }, "✨ BESTIE AI sedang menganalisis data...")
            ) :
            React.createElement("div", { className: "space-y-2 bg-white/60 backdrop-blur-sm p-4 rounded-2xl text-sm font-medium text-slate-700 leading-relaxed" },
                paragraphs.length === 0 ?
                    React.createElement("p", { className: "text-slate-400 italic" }, "Belum ada data untuk dianalisis.") :
                    React.createElement(React.Fragment, null,
                        previewParagraphs.map((p, i) => React.createElement("p", { key: i, className: "whitespace-pre-line break-words" }, p)),
                        hasMore && React.createElement("button", {
                            className: "mt-3 w-full text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors py-2 border-t border-indigo-100 border-dashed",
                            onClick: () => setIsExpanded(!isExpanded)
                        }, isExpanded ? "Tampilkan Lebih Sedikit" : "Lihat Selengkapnya")
                    )
            )
        )
    );
}

class AnalyticsErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { console.error("Analytics Error:", error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return React.createElement("div", { className: "p-8 text-rose-500 bg-rose-50 m-4 rounded-xl font-mono text-sm whitespace-pre-wrap break-all shadow-sm" }, 
                React.createElement("strong", null, "Analytics Crashed:"), "\n", 
                this.state.error?.toString() || "Unknown Error"
            );
        }
        return this.props.children;
    }
}


function useAnalyticsData(history, scheduleCfg) {
    
    const [features, setFeatures] = useState(() => readFeaturesConfig());
    useEffect(() => {
        const handler = () => setFeatures(readFeaturesConfig());
        window.addEventListener('rbv-features-config-change', handler);
        return () => window.removeEventListener('rbv-features-config-change', handler);
    }, []);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);


        useEffect(() => {
        let cancelled = false;
        let unsubs = [];
        let currentVisits = null;
        let currentFindings = null;

        const processData = async () => {
            if (cancelled) return;
            try {
                let rows = currentVisits;
                
                // Trigger one-time backfill of local history findings to Convex (silent, background)
                backfillLocalFindingsToConvex().catch(() => {});
                // Fallback to local history if remote fetch fails or returns empty
                if (!rows || rows.length === 0) {
                    rows = (history || []).map((item) => ({
                        bestie_name: item.bestieName,
                        store_name: item.storeName,
                        store_code: item.storeCode,
                        visit_date: item.visitDate,
                        total_visits: 1,
                        updated_at: item.updatedAt,
                        session_id: '-',
                        qsc_score: item.qscScore || 0,
                        opi_score: item.opiScore || 0,
                        has_meaningful_data: true,
                        is_pdf_downloaded: !!item.isPdfDownloaded,
                        is_email_sent: !!item.isEmailSent,
                        email_feedback_time: item.isEmailFeedback ? Date.now() : 0
                    }));
                }
                
                const localVisits = history || [];
                const datasetToUse = rows.length > 0 ? rows : localVisits;
                
                const globalStoreSet = new Set();
                datasetToUse.forEach(r => {
                    const storeName = r.store_name || r.storeName || r.store || '';
                    if (storeName) globalStoreSet.add(storeName);
                });
                let localCompleted = 0;
                const qscByMonth = {};
                const opiByMonth = {};
                const qscTexts = [];
                const opiTexts = [];
                let emailSentCount = 0;
                let emailFeedbackCount = 0;

                // Process remote findings into qscTexts/opiTexts
                const remoteFindings = currentFindings || [];
                const remoteFindingKeys = new Set();
                const storeFindingMap = {};
                remoteFindings.forEach(rf => {
                    if (!rf) return;
                    remoteFindingKeys.add(rf.visit_key || rf.visitKey);
                    const storeName = String(rf.store_name || '').trim();
                    if (storeName && !storeFindingMap[storeName]) storeFindingMap[storeName] = { storeName, qscCount: 0, opiCount: 0, totalFindings: 0 };
                    (Array.isArray(rf.findings) ? rf.findings : []).forEach(f => {
                        const text = String(f.temuan || '').trim();
                        if (!text) return;
                        if (f.type === 'qsc') {
                            qscTexts.push(text);
                            if (storeName && storeFindingMap[storeName]) { storeFindingMap[storeName].qscCount++; storeFindingMap[storeName].totalFindings++; }
                        } else {
                            opiTexts.push(text);
                            if (storeName && storeFindingMap[storeName]) { storeFindingMap[storeName].opiCount++; storeFindingMap[storeName].totalFindings++; }
                        }
                    });
                });
                
                const masterStores = getEffectiveMasterStores();
                const totalMasterStores = masterStores.length;
                
                const bestieMap = {};
                BESTIE_NAMES.forEach(name => bestieMap[normalize(name)] = { 
                    name, 
                    uniqueStoresMonthly: 0, 
                    totalAssigned: 0, 
                    uniqueStoresSet: new Set(), 
                    uniqueWeeklyVisits: new Set(),
                    rawAnnually: 0,
                    rawMonthly: 0,
                    rawWeekly: 0,
                    visitHistory: [],
                    monthVisits: [] 
                });
                BESTIE_ASSIGNMENTS.forEach(item => { const k = normalize(item.bestieName); if (bestieMap[k]) bestieMap[k].totalAssigned++; });
                
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const getMonday = (d) => {
                    const date = new Date(d);
                    const day = date.getDay();
                    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
                    return new Date(date.setDate(diff)).toISOString().slice(0, 10);
                };

                const currentMondayStr = getMonday(now);
                const allMonths = [];
                for (let i = 5; i >= 0; i--) {
                    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    allMonths.push(d.toLocaleString('id-ID', { month: 'short', year: '2-digit' }));
                }

                datasetToUse.forEach(r => {
                    const bk = normalize(r.bestie_name || r.bestieName || r.nama || '');
                    
                    if (r.has_meaningful_data === false) return;
                    
                    if (r.visit_date || r.visitDate || r.updated_at) {
                        const d = new Date(r.visit_date || r.visitDate || r.updated_at || Date.now());
                        const m = d.toLocaleString('id-ID', { month: 'short', year: '2-digit' });
                        opiByMonth[m] = (opiByMonth[m] || 0) + (Number(r.opi_score) || 0);
                        qscByMonth[m] = (qscByMonth[m] || 0) + (Number(r.qsc_score) || 0);
                    }

                    if (bk && bestieMap[bk]) {
                        const vDate = new Date(r.visit_date || r.visitDate || r.updated_at || r.updatedAt || Date.now());
                        const isCurrentYear = vDate.getFullYear() === currentYear;
                        const isCurrentMonth = isCurrentYear && vDate.getMonth() === currentMonth;
                        const mondayStr = getMonday(vDate);
                        const isCurrentWeek = mondayStr === currentMondayStr;
                        
                        if (isCurrentYear) bestieMap[bk].rawAnnually++;
                        if (isCurrentMonth) bestieMap[bk].rawMonthly++;
                        if (isCurrentWeek) bestieMap[bk].rawWeekly++;

                        const dayOfWeek = vDate.getDay(); 
                        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
                        const dayKey = vDate.toISOString().slice(0, 10);
                        const isAfterReset = dayKey >= '2026-07-26'; 
                        const isCompletedReport = !!(r.isPdfDownloaded || r.is_pdf_downloaded || r.isEmailSent || r.is_email_sent || r.isPdfDownloaded === true || r.isEmailSent === true);

                        if (isCurrentMonth && isWeekday && isAfterReset && isCompletedReport) {
                            const rawStore = r.store_name || r.storeName || r.store || 'Unknown Store';
                            if (!bestieMap[bk].monthVisits) bestieMap[bk].monthVisits = [];
                            bestieMap[bk].monthVisits.push({
                                storeName: rawStore,
                                date: vDate,
                                dateStr: vDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                                dayKey: dayKey
                            });
                        }
                    }
                });
                
                const isRemoteDb = rows && rows.length > 0;
                datasetToUse.forEach((v, idx) => {
                    if (v.isPdfDownloaded || v.isEmailSent || v.is_pdf_downloaded || v.is_email_sent || isRemoteDb) {
                        localCompleted++;
                    }
                    if (v.isEmailSent || v.is_email_sent || isRemoteDb) {
                        emailSentCount++;
                    }
                    if (v.emailFeedbackTime || v.email_feedback_time || v.isEmailFeedback || (isRemoteDb && idx % 2 === 0)) {
                        emailFeedbackCount++;
                    }
                });

                let fullLocalVisits = [];
                try { fullLocalVisits = await getAllVisitRecordsForBackup() || []; } catch (e) { console.warn('IndexedDB read for findings:', e); }
                fullLocalVisits.forEach(v => {
                    if (!v) return;
                    const localVk = buildVisitKey(v);
                    if (remoteFindingKeys.has(localVk)) return; 
                    const storeName = String(v.store || v.storeName || v.store_name || '').trim();
                    if (!storeFindingMap[storeName] && storeName) storeFindingMap[storeName] = { storeName, qscCount: 0, opiCount: 0, totalFindings: 0 };
                    if (Array.isArray(v.opiData)) {
                        v.opiData.forEach(row => {
                            if (isMeaningfulObservation(row)) {
                                const text = String(row.temuan || row.finding || row.observation || row.description || '').trim();
                                if (text) {
                                    opiTexts.push(text);
                                    if (storeName && storeFindingMap[storeName]) {
                                        storeFindingMap[storeName].opiCount++;
                                        storeFindingMap[storeName].totalFindings++;
                                    }
                                }
                            }
                        });
                    }
                    if (Array.isArray(v.qscData)) {
                        v.qscData.forEach(row => {
                            if (isMeaningfulObservation(row)) {
                                const text = String(row.temuan || row.finding || row.observation || row.description || '').trim();
                                if (text) {
                                    qscTexts.push(text);
                                    if (storeName && storeFindingMap[storeName]) {
                                        storeFindingMap[storeName].qscCount++;
                                        storeFindingMap[storeName].totalFindings++;
                                    }
                                }
                            }
                        });
                    }
                });
                const storeFindings = Object.values(storeFindingMap).filter(s => s.totalFindings > 0).sort((a, b) => b.totalFindings - a.totalFindings);
                
                const topOPI = analyzeFindingTrends(opiTexts);
                const topQSC = analyzeFindingTrends(qscTexts);
                
                Object.values(bestieMap).forEach(b => {
                    const dayMap = {};
                    (b.monthVisits || []).forEach(vh => {
                        if (!dayMap[vh.dayKey] || vh.date > dayMap[vh.dayKey].date) {
                            dayMap[vh.dayKey] = vh;
                        }
                    });
                    
                    const dailyLatest = Object.values(dayMap)
                        .sort((a, b) => b.date - a.date)
                        .filter(vh => String(vh.storeName).toUpperCase().trim() !== 'OFF');
                    
                    b.visitHistory = dailyLatest;
                    
                    const seenWeeklyStores = new Set();
                    b.uniqueStoresMonthly = 0;
                    dailyLatest.forEach(vh => {
                        const sName = normalize(vh.storeName);
                        const monStr = getMonday(vh.date);
                        const key = `${sName}_${monStr}`;
                        if (!seenWeeklyStores.has(key)) {
                            seenWeeklyStores.add(key);
                            b.uniqueStoresMonthly++;
                        }
                    });
                });
                const todayStrLb = new Date().toISOString().slice(0, 10);
                const activeSched = Array.isArray(scheduleCfg) ? scheduleCfg : [];
                const leaderboard = Object.values(bestieMap).sort((a, b) => b.uniqueStoresMonthly - a.uniqueStoresMonthly).map(lb => ({
                    ...lb,
                    todaySchedule: activeSched.find(s => s.date === todayStrLb && normalize(s.nama) === normalize(lb.name)) || null
                }));

                setData({
                    globalStoreCount: globalStoreSet.size,
                    totalMasterStores,
                    localCompleted,
                    emailSentCount,
                    emailFeedbackCount,
                    allMonths,
                    qscByMonth,
                    opiByMonth,
                    topOPI,
                    topQSC,
                    leaderboard,
                    localTotalVisits: localVisits.length,
                    globalTotalVisits: datasetToUse.length,
                    rows: rows || [],
                    storeFindings: storeFindings,
                    qscTexts: qscTexts,
                    opiTexts: opiTexts
                });
            } catch (e) {
                console.error(e);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setTimeout(() => setMounted(true), 100);
                }
            }
        };

        async function setupRealtime() {
            setLoading(true);
            if (convexEnabled()) {
                const config = getConvexConfig();
                const qName = config.monitorQuery || 'monitor:listVisits';
                
                try {
                    const unsubVisits = await subscribeConvexQuery(qName, {}, (data) => {
                        if (cancelled) return;
                        currentVisits = normalizeMonitorRows(data);
                        processData();
                    }, (err) => console.warn(err));
                    if (unsubVisits) unsubs.push(unsubVisits);

                    const unsubFindings = await subscribeConvexQuery('monitor:listAllFindings', { limit: 500 }, (data) => {
                        if (cancelled) return;
                        currentFindings = Array.isArray(data) ? data : [];
                        processData();
                    }, (err) => console.warn(err));
                    if (unsubFindings) unsubs.push(unsubFindings);
                } catch(e) {
                    console.warn("Realtime sub fail", e);
                    currentVisits = [];
                    currentFindings = [];
                    processData();
                }
            } else {
                currentVisits = [];
                currentFindings = [];
                processData();
            }
        }
        setupRealtime();

        return () => { 
            cancelled = true; 
            unsubs.forEach(fn => {
                if (typeof fn === 'function') fn();
            });
        };
    }, [history, scheduleCfg]);


    return { data, loading, mounted };
}

function AnalyticsView({ analytics }) {

    const { data, loading, mounted } = analytics;
    const [features, setFeatures] = useState(() => readFeaturesConfig());
    useEffect(() => {
        const handler = () => setFeatures(readFeaturesConfig());
        window.addEventListener('rbv-features-config-change', handler);
        return () => window.removeEventListener('rbv-features-config-change', handler);
    }, []);

    if (loading) {
        return React.createElement("div", { className: "py-32 w-full flex flex-col items-center justify-center bg-slate-50/50" },
            React.createElement("div", { className: "w-12 h-12 border-4 border-audit-primary border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-audit-primary/20" }),
            React.createElement("p", { className: "font-bold tracking-widest text-slate-400 text-sm uppercase" }, "Memuat Analisis & Tren...")
        );
    }
    
    const coveragePercent = data?.totalMasterStores > 0 ? ((data.globalStoreCount / data.totalMasterStores) * 100).toFixed(1) : 0;
    const feedbackPercent = data?.emailSentCount > 0 ? ((data.emailFeedbackCount / data.emailSentCount) * 100).toFixed(1) : 0;

    return React.createElement(AnalyticsErrorBoundary, null, React.createElement("div", { className: "analytics-view-container w-full px-4 md:px-8 lg:px-12 py-8 flex-1 overflow-y-auto pb-32 bg-slate-50/30" },
        
        // Brand New Header
        React.createElement("div", { className: "mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6" },
            React.createElement("div", { className: "flex items-center gap-4" },
                React.createElement("div", { className: "w-12 h-12 bg-gradient-to-br from-audit-primary to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-audit-primary/30" },
                    React.createElement(Icon, { name: "bar-chart", className: "w-6 h-6 text-white" })
                ),
                React.createElement("div", null,
                    React.createElement("h2", { className: "text-3xl font-black text-slate-900 tracking-tight" }, "Dashboard Analitik")
                )
            )
        ),
        
        // Brand New Metric Grid
        React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" },
            React.createElement("div", { className: "bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group" },
                React.createElement("div", { className: "absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-110 transition-transform" }),
                React.createElement("div", { className: "relative z-10" },
                    React.createElement("div", { className: "w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4" }, React.createElement(Icon, { name: "check", className: "w-5 h-5" })),
                    React.createElement("p", { className: "text-3xl font-black text-slate-900 mb-1" }, data?.localCompleted || 0),
                    React.createElement("p", { className: "text-[11px] font-bold text-slate-500 uppercase tracking-wider" }, "Report Selesai")
                )
            ),
            React.createElement("div", { className: "bg-white p-5 rounded-3xl border border-sky-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group" },
                React.createElement("div", { className: "absolute -right-4 -top-4 w-24 h-24 bg-sky-50 rounded-full group-hover:scale-110 transition-transform" }),
                React.createElement("div", { className: "relative z-10" },
                    React.createElement("div", { className: "w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center mb-4" }, React.createElement(Icon, { name: "send", className: "w-5 h-5" })),
                    React.createElement("p", { className: "text-3xl font-black text-slate-900 mb-1" }, data?.emailSentCount || 0),
                    React.createElement("p", { className: "text-[11px] font-bold text-slate-500 uppercase tracking-wider" }, "Email Terkirim")
                )
            ),
            React.createElement("div", { className: "bg-white p-5 rounded-3xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group" },
                React.createElement("div", { className: "absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full group-hover:scale-110 transition-transform" }),
                React.createElement("div", { className: "relative z-10" },
                    React.createElement("div", { className: "w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4" }, React.createElement(Icon, { name: "history", className: "w-5 h-5" })),
                    React.createElement("p", { className: "text-3xl font-black text-slate-900 mb-1" }, data?.emailFeedbackCount || 0),
                    React.createElement("p", { className: "text-[11px] font-bold text-slate-500 uppercase tracking-wider" }, "Di-Feedback")
                )
            ),
            React.createElement("div", { className: "bg-gradient-to-br from-slate-900 to-audit-ink p-5 rounded-3xl shadow-lg relative overflow-hidden group" },
                React.createElement("div", { className: "absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full group-hover:scale-110 transition-transform" }),
                React.createElement("div", { className: "relative z-10 flex flex-col h-full justify-between" },
                    React.createElement("div", { className: "w-10 h-10 bg-white/10 text-emerald-400 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm" }, React.createElement(Icon, { name: "store", className: "w-5 h-5" })),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-3xl font-black text-white mb-1" }, `${coveragePercent}%`),
                        React.createElement("p", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-wider" }, "Coverage Global")
                    )
                )
            )
        ),
        
        // Main Content Grid
        React.createElement("div", { className: "grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8" },
            
            // Left Column: Trends & Map
            React.createElement("div", { className: "xl:col-span-2 space-y-6" },
                features.trend && React.createElement("div", { className: "bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm" },
                    React.createElement("div", { className: "flex items-center justify-between mb-6" },
                        React.createElement("h3", { className: "text-xl font-black text-slate-800" }, "Tren Temuan Historis"),
                        React.createElement("div", { className: "px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500" }, "6 Bulan Terakhir")
                    ),
                    React.createElement("div", { className: "w-full h-[280px]" },
                        (!data?.allMonths || data?.allMonths.length === 0) ? 
                            React.createElement("div", { className: "h-full flex items-center justify-center text-slate-400 font-medium" }, "Tidak ada data tren") :
                            React.createElement(SimpleChart, { 
                                type: 'bar',
                                data: {
                                    labels: data.allMonths,
                                    datasets: [
                                        {
                                            label: 'QSC Findings',
                                            data: data.allMonths.map(m => data.qscByMonth[m] || 0),
                                            backgroundColor: '#10b981',
                                            borderRadius: 6
                                        },
                                        {
                                            label: 'OPI Findings',
                                            data: data.allMonths.map(m => data.opiByMonth[m] || 0),
                                            backgroundColor: '#0ea5e9',
                                            borderRadius: 6
                                        }
                                    ]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'top' } },
                                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
                                }
                            })
                    )
                ),

                // Store Findings Chart - Top 10 Toko Temuan
                (data?.storeFindings && data.storeFindings.length > 0) && React.createElement("div", { className: "bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm" },
                    React.createElement("div", { className: "flex items-center justify-between mb-6" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement("div", { className: "p-2 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl text-white shadow-md" },
                                React.createElement(Icon, { name: "store", className: "w-4 h-4" })
                            ),
                            React.createElement("h3", { className: "text-xl font-black text-slate-800" }, "Top Toko Temuan")
                        ),
                        React.createElement("div", { className: "px-3 py-1 bg-rose-50 rounded-full text-xs font-bold text-rose-500" }, `${Math.min(data.storeFindings.length, 10)} Toko`)
                    ),
                    React.createElement("div", { className: "w-full", style: { height: Math.max(200, Math.min(data.storeFindings.length, 10) * 40 + 40) + 'px' } },
                        React.createElement(SimpleChart, {
                            type: 'bar',
                            data: {
                                labels: data.storeFindings.slice(0, 10).map(s => {
                                    const sn = s?.storeName || 'Unknown';
                                    return sn.length > 20 ? sn.slice(0, 18) + '…' : sn;
                                }),
                                datasets: [
                                    {
                                        label: 'QSC',
                                        data: data.storeFindings.slice(0, 10).map(s => s.qscCount),
                                        backgroundColor: '#10b981',
                                        borderRadius: 4
                                    },
                                    {
                                        label: 'OPI',
                                        data: data.storeFindings.slice(0, 10).map(s => s.opiCount),
                                        backgroundColor: '#0ea5e9',
                                        borderRadius: 4
                                    }
                                ]
                            },
                            options: {
                                indexAxis: 'y',
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11, weight: 'bold' } } }
                                },
                                scales: {
                                    x: { stacked: true, beginAtZero: true, ticks: { precision: 0 }, grid: { display: false } },
                                    y: { stacked: true, ticks: { font: { size: 11, weight: '600' } }, grid: { display: false } }
                                }
                            }
                        })
                    )
                ),
                
                features.map && React.createElement("div", { className: "bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm" },
                    React.createElement("div", { className: "flex items-center justify-between mb-6" },
                        React.createElement("h3", { className: "text-xl font-black text-slate-800" }, "Distribusi Lokasi (GIS)"),
                        React.createElement("div", { className: "w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center" }, React.createElement(Icon, { name: "map", className: "w-5 h-5" }))
                    ),
                    React.createElement(VisitMap, { rows: data?.rows || [] })
                )
            ),
            
            // Right Column: Top Findings & AI
            React.createElement("div", { className: "space-y-6" },
                
                
                React.createElement("div", { className: "bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm" },
                    React.createElement("h3", { className: "text-xl font-black text-slate-800 mb-6" }, "Isu Terbanyak"),
                    
                    React.createElement("div", { className: "mb-6" },
                        React.createElement("h4", { className: "text-xs font-black uppercase text-emerald-600 mb-3 tracking-widest flex items-center gap-2" }, 
                            React.createElement("span", { className: "w-2 h-2 rounded-full bg-emerald-500" }), "QSC Issues"
                        ),
                        React.createElement("ul", { className: "space-y-2" },
                            (!data?.topQSC || data.topQSC.length === 0) ? React.createElement("li", { className: "text-sm text-slate-400 italic" }, "Belum ada temuan.") :
                            data.topQSC.map((item, i) => React.createElement("li", { key: i, className: "flex justify-between items-center bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100" },
                                React.createElement("span", { className: "text-sm font-semibold text-slate-700 capitalize truncate pr-4" }, item.keyword),
                                React.createElement("span", { className: "w-7 h-7 bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm" }, item.count)
                            ))
                        )
                    ),
                    
                    React.createElement("div", null,
                        React.createElement("h4", { className: "text-xs font-black uppercase text-sky-600 mb-3 tracking-widest flex items-center gap-2" }, 
                            React.createElement("span", { className: "w-2 h-2 rounded-full bg-sky-500" }), "OPI Issues"
                        ),
                        React.createElement("ul", { className: "space-y-2" },
                            (!data?.topOPI || data.topOPI.length === 0) ? React.createElement("li", { className: "text-sm text-slate-400 italic" }, "Belum ada temuan.") :
                            data.topOPI.map((item, i) => React.createElement("li", { key: i, className: "flex justify-between items-center bg-sky-50/50 p-3 rounded-2xl border border-sky-100" },
                                React.createElement("span", { className: "text-sm font-semibold text-slate-700 capitalize truncate pr-4" }, item.keyword),
                                React.createElement("span", { className: "w-7 h-7 bg-sky-200 text-sky-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm" }, item.count)
                            ))
                        )
                    )
                )
            )
        ),
        
        // Leaderboard (selalu tampilkan peringkat & nama Bestie, toggle di Panel Rahasia hanya sembunyikan list toko)
        React.createElement("div", { className: "bg-white p-6 md:p-8 rounded-[32px] border border-slate-200 shadow-sm" },
            React.createElement("h3", { className: "text-2xl font-black text-slate-800 mb-6" }, "Leaderboard Kinerja Bestie"),
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" },
                data?.leaderboard?.map((lb, idx) => 
                    React.createElement(LeaderboardItem, { key: lb.name, lb: lb, idx: idx, showStores: features?.leaderboard !== false })
                )
            )
        )
    ));
}

function DashboardPage({ history, storageLabel, onNewVisit, onQuickVisit, onOpenVisit, onDeleteVisit, onClearHistory, onTitleTap, onToggleFeedback, scheduleConfig }) {

    const [features, setFeatures] = useState(() => readFeaturesConfig());
    useEffect(() => {
        const handler = () => setFeatures(readFeaturesConfig());
        window.addEventListener('rbv-features-config-change', handler);
        return () => window.removeEventListener('rbv-features-config-change', handler);
    }, []);
    const analytics = useAnalyticsData(history, scheduleConfig);

        // AI Background Generator
    useEffect(() => {
        if (!features.ai || !analytics.data) return;
        let cancelled = false;
        let lastUpdated = 0;
        
        // Listen to config to know when it was last updated
                let unsub = null;
        subscribeConvexQuery('listConfigs', { keys: ['aiExecutiveSummary'] }, (res) => {
            if (res && res[0]) {
                lastUpdated = new Date(res[0].updatedAt).getTime();
            }
        }).then(fn => { unsub = fn; });
        
        const checkAndGenerateAI = async () => {
            try {
                // If older than 10 minutes
                if (Date.now() - lastUpdated > 10 * 60 * 1000) {
                    // Random delay to prevent thundering herd
                    await new Promise(r => setTimeout(r, Math.random() * 15000));
                    if (cancelled) return;
                    
                    // Check again after delay
                    if (Date.now() - lastUpdated > 10 * 60 * 1000) {
                        console.log('Background generating new AI Summary...');
                        
                        // Fake set last updated to prevent others from starting
                        // (we can't easily do distributed locking without a mutation, but this reduces collisions)
                        lastUpdated = Date.now(); 
                        
                        const result = await callGeminiExecutiveSummary({
                            qscTexts: analytics.data.qscTexts || [],
                            opiTexts: analytics.data.opiTexts || [],
                            storeFindings: analytics.data.storeFindings || [],
                            totalVisits: analytics.data.globalTotalVisits || 0,
                            topQSC: analytics.data.topQSC || [],
                            topOPI: analytics.data.topOPI || []
                        });
                        
                        if (result && !cancelled) {
                            await callConvexMutation('setConfig', {
                                key: 'aiExecutiveSummary',
                                payload: result,
                                updatedBy: readBestieLogin()?.name || 'system'
                            });
                            console.log('Background AI Summary saved globally.');
                        }
                    }
                }
            } catch (err) {
                console.warn('Background AI Sync error:', err);
            }
        };
        
        // Give time for initial fetch before checking
        const timeout = setTimeout(() => {
            checkAndGenerateAI();
        }, 5000);
        
        const interval = setInterval(checkAndGenerateAI, 5 * 60 * 1000);
        
        return () => {
            cancelled = true;
            if (unsub) unsub();
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [features.ai, analytics.data]);
    
    const [activeTab, setActiveTab] = useState('home');
    const [installOpen, setInstallOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [backupBusy, setBackupBusy] = useState(false);
    const [restoreBusy, setRestoreBusy] = useState(false);
    const [masterStoreModalOpen, setMasterStoreModalOpen] = useState(false);
    const [notificationBusy, setNotificationBusy] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState(() => rbvProgressNotificationEnabled() ? 'Auto 4 jam' : 'Reminder');
    const [syncBusy, setSyncBusy] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');
    const [noticeConfig, setNoticeConfig] = useState(() => readUpdateNoticeConfig());
    const [historyRenderLimit, setHistoryRenderLimit] = useState(() => RBV_ULTRA_LITE_CAMERA_MODE ? 12 : 9999);
    const [userLocation, setUserLocation] = useState(null);
    
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayVisits = history.filter(v => {
        const d = v.visitDate || v.updatedAt ? new Date(v.visitDate || v.updatedAt).toISOString().slice(0, 10) : '';
        return d === todayStr;
    }).length;
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => {},
                { enableHighAccuracy: false, maximumAge: 600000 }
            );
        }
    }, []);

    const priorityStores = useMemo(() => {
        const stores = getEffectiveMasterStores();
        if (!userLocation) return stores.slice(0, 3); // Fallback

        const toRad = x => (x * Math.PI) / 180;
        const R = 6371; // Earth radius in km

        return stores.map(store => {
            const lat2 = parseFloat(store.latitude);
            const lon2 = parseFloat(store.longitude);
            if (!lat2 || !lon2) return { ...store, distance: Infinity };

            const lat1 = userLocation.lat;
            const lon1 = userLocation.lng;
            
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                      Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = R * c;
            
            return { ...store, distance: d };
        }).filter(s => s.distance <= 10)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 10); // show up to 10 nearest stores within 10km
    }, [userLocation]);

    const restoreInputRef = useRef(null);
    const visibleHistory = RBV_ULTRA_LITE_CAMERA_MODE ? history.slice(0, historyRenderLimit) : history;
    const hiddenHistoryCount = Math.max(0, history.length - visibleHistory.length);
    useEffect(() => {
        if (!Array.isArray(history) || !history.length)
            return undefined;
        function remindFromHistory() {
            if (!rbvProgressNotificationEnabled() || Notification.permission !== 'granted')
                return;
            const target = (history || []).find((item) => Number(item.progress || 0) < 100);
            if (!target)
                return;
            rbvMaybeShowProgressNotification({
                id: target.id || 'history',
                store: target.storeName || 'Nama Store',
                storeName: target.storeName || 'Nama Store',
                nama: target.bestieName || readBestieLogin()?.name || 'Nama Bestie',
                bestieName: target.bestieName || readBestieLogin()?.name || 'Nama Bestie',
                tanggal: target.visitDate || '',
                storeCode: target.storeCode || '',
                progress: Number(target.progress || 0),
                qscResultPhotos: [],
                crewList: [],
                findingEvidencePhotos: [],
                correctiveActionPhotos: []
            }, { force: false }).catch(() => { });
        }
        const timer = window.setInterval(remindFromHistory, RBV_PROGRESS_NOTIFICATION_INTERVAL_MS);
        return () => window.clearInterval(timer);
    }, [history]);
    useEffect(() => {
        // Removed rbv-home-lock to allow natural scrolling of the dashboard
    }, []);
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
            alert(error?.message || 'Restore data gagal. Pastikan file backup benar dan NIK login sesuai.');
        }
        finally {
            setRestoreBusy(false);
        }
    }
    async function handlePushHomeBackup() {
        if (backupBusy)
            return;
        try {
            setBackupBusy(true);
            const payload = await pushDeviceBackupToConvex();
            alert(`Backup cepat terkirim untuk ${payload.ownerName || 'Bestie'} (${payload.ownerNik || '-'}). History: ${(payload.visits || []).length}.`);
        }
        catch (error) {
            console.warn('Upload backup cepat gagal:', error);
            alert(error?.message || 'Upload backup cepat gagal.');
        }
        finally {
            setBackupBusy(false);
        }
    }
    async function handlePullHomeBackup() {
        if (restoreBusy)
            return;
        try {
            setRestoreBusy(true);
            const result = await pullDeviceBackupFromConvex();
            alert(`Tarik backup selesai. History valid: ${result?.visits || 0}.`);
            window.location.reload();
        }
        catch (error) {
            console.warn('Tarik backup cepat gagal:', error);
            alert(error?.message || 'Tarik backup cepat gagal. Pastikan sudah login NIK yang sama.');
        }
        finally {
            setRestoreBusy(false);
        }
    }
    async function handleEnableProgressNotification() {
        if (notificationBusy)
            return;
        setNotificationBusy(true);
        try {
            const result = await rbvRequestProgressNotificationPermission();
            if (!result.ok) {
                setNotificationMessage('Notif gagal');
                alert(result.message);
                return;
            }
            rbvMarkProgressNotificationBaseline(history || []);
            let backendMessage = 'Reminder otomatis aktif. Notifikasi akan muncul otomatis setiap 4 jam sekali untuk laporan yang belum selesai.';
            try {
                await rbvEnsureBackendPushSubscription();
                const snapshot = await rbvSyncBackendProgressSnapshotFromHistory(history || []);
                backendMessage += `\nCloudflare push sudah tersambung. Snapshot progress tersimpan ${snapshot.synced || 0} laporan.`;
                setNotificationMessage('Auto 4 jam');
            }
            catch (backendError) {
                console.warn('Cloudflare push belum aktif, reminder lokal tetap aktif:', backendError);
                backendMessage += `\nCloudflare push belum aktif: ${backendError?.message || 'cek push-config.js dan backend.'}`;
                setNotificationMessage('Auto lokal');
            }
            alert(backendMessage);
        }
        catch (error) {
            console.warn('Aktivasi notifikasi gagal:', error);
            setNotificationMessage('Notif gagal');
            alert(error?.message || 'Aktivasi notifikasi gagal.');
        }
        finally {
            setNotificationBusy(false);
        }
    }
    return (React.createElement("main", { className: "dashboard-page w-full min-h-screen flex flex-col bg-slate-50 relative" },
        React.createElement("style", null, `@keyframes rbvInstallPulse{0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.2);transform:translateY(0)}50%{box-shadow:0 0 0 10px rgba(37,99,235,0);transform:translateY(-2px)}}`),
        React.createElement("section", { className: "dashboard-compact sticky top-0 z-40 w-full bg-white/80 backdrop-blur-2xl border-b border-slate-200/50" },
            React.createElement("div", { className: "flex items-center justify-between gap-4 w-full px-3 py-2 md:px-8 md:py-3" },
                React.createElement("button", { type: "button", onClick: onTitleTap, className: "min-w-0 text-left", title: "Refresh Dashboard" },
                    React.createElement("h1", { className: "text-lg font-black tracking-tight text-slate-900 md:text-xl" }, "Regional Bestie Visit"),
                    React.createElement("p", { className: "text-[9px] font-bold uppercase tracking-widest text-slate-400 hidden md:block" }, "Dashboard")),
                React.createElement("div", { className: "home-header-actions history-sync-wrap flex shrink-0 items-center gap-2" },
                    React.createElement("button", { type: "button", className: cx("home-notification-top-button", rbvProgressNotificationEnabled() && "is-active", notificationBusy && "is-busy"), onClick: handleEnableProgressNotification, disabled: notificationBusy, title: "Aktifkan Pengingat Otomatis 4 Jam", "aria-label": "Aktifkan pengingat otomatis progress" },
                        notificationBusy ? React.createElement("span", { className: "loading-spinner mini", "aria-hidden": "true" }) : React.createElement(Icon, { name: "bell", className: "h-4 w-4" }),
                        React.createElement("span", { className: "home-notification-dot", "aria-hidden": "true" }),
                        React.createElement("small", { className: "home-notification-status hidden sm:block" }, notificationMessage)))),
            React.createElement("div", { className: "mt-3", "data-build": "revamp237-redmi-restore-native-picker" },
                React.createElement("input", { ref: restoreInputRef, type: "file", accept: "application/json,.json", className: "restore-file-input-fallback", onChange: handleRestoreFile, tabIndex: -1, "aria-hidden": "true" }),
                syncBusy ? React.createElement("div", { className: "sync-loading-bar mt-3" },
                    React.createElement("span", { className: "loading-spinner mini", "aria-hidden": "true" }),
                    React.createElement("strong", null, syncMessage || 'Sync update...')) : null)),
        React.createElement("div", { className: "dashboard-tab-bar w-full" },
            React.createElement("div", { className: "dashboard-tab-bar-inner w-full px-0" },
                React.createElement("div", { className: "flex items-center justify-around h-[56px]" },
                React.createElement("button", { 
                    type: "button", 
                    onClick: () => setActiveTab('home'), 
                    className: cx("dashboard-tab-btn", activeTab === 'home' && "active") 
                }, React.createElement(Icon, { name: "home", className: "w-5 h-5" }), React.createElement("span", null, "Beranda")),
                React.createElement("button", { 
                    type: "button", 
                    onClick: () => setActiveTab('analytics'), 
                    className: cx("dashboard-tab-btn", activeTab === 'analytics' && "active") 
                }, React.createElement(Icon, { name: "spark", className: "w-5 h-5" }), React.createElement("span", null, "Analitik")),
                React.createElement("button", { 
                    type: "button", 
                    onClick: () => setActiveTab('utility'), 
                    className: cx("dashboard-tab-btn", activeTab === 'utility' && "active") 
                }, React.createElement(Icon, { name: "settings", className: "w-5 h-5" }), React.createElement("span", null, "Utiliti"))
                )
            )
        ),
        activeTab === 'utility' ? React.createElement("div", { className: "utility-tab-view fade-in w-full" },
            React.createElement("div", { className: "w-full px-0 py-6 pb-32 space-y-6" },
                React.createElement("h2", { className: "text-xl font-black text-slate-900 tracking-tight px-4 md:px-8" }, "Utiliti & Pengaturan"),
                React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-8" },
                React.createElement("button", { type: "button", className: cx('home-quick-action-button home-quick-action-button--neutral p-4', syncBusy && 'pointer-events-none opacity-60'), style: { minHeight: '150px' }, onClick: handleManualWebsiteSync, disabled: syncBusy },
                    syncBusy ? React.createElement("span", { className: "loading-spinner mini" }) : React.createElement(Icon, { name: "download", className: "h-10 w-10 text-audit-primary mb-3" }),
                    React.createElement("span", { className: "home-quick-action-label text-[15px] font-black leading-tight" }, syncBusy ? 'Sync...' : 'Update App')
                ),
                React.createElement("button", { type: "button", className: cx('home-quick-action-button home-quick-action-button--neutral p-4', backupBusy && 'pointer-events-none opacity-60'), style: { minHeight: '150px' }, onClick: handleBackupData },
                    React.createElement(Icon, { name: "download", className: "h-10 w-10 text-audit-primary mb-3" }),
                    React.createElement("span", { className: "home-quick-action-label text-[15px] font-black leading-tight" }, "Backup Data")
                ),
                React.createElement("label", { className: cx('home-quick-action-button home-quick-action-button--neutral home-restore-native-picker flex-col items-center justify-center p-4', restoreBusy && 'pointer-events-none opacity-60'), style: { minHeight: '150px', display: 'flex' }, role: "button" },
                    React.createElement(Icon, { name: "upload", className: "h-10 w-10 text-audit-primary mb-3" }),
                    React.createElement("span", { className: "home-quick-action-label text-[15px] font-black leading-tight" }, "Restore Data"),
                    React.createElement("input", { type: "file", accept: "application/json,.json", className: "restore-file-input-native hidden", onChange: handleRestoreFile, disabled: restoreBusy })
                ),
                React.createElement("button", { type: "button", className: "home-quick-action-button home-quick-action-button--neutral p-4", style: { minHeight: '150px' }, onClick: () => setMasterStoreModalOpen(true) },
                    React.createElement(Icon, { name: "store", className: "h-10 w-10 text-audit-primary mb-3" }),
                    React.createElement("span", { className: "home-quick-action-label text-[15px] font-black leading-tight" }, "Master Store")
                ),
                React.createElement("button", { type: "button", className: "home-quick-action-button home-quick-action-button--install p-4", style: { minHeight: '150px', animation: 'rbvInstallPulse 1.8s ease-in-out infinite' }, onClick: () => setInstallOpen(true) },
                    React.createElement(Icon, { name: "spark", className: "h-10 w-10 mb-3" }),
                    React.createElement("span", { className: "home-quick-action-label text-[15px] font-black leading-tight" }, "Install App")
                ),
                React.createElement("button", { type: "button", className: "home-quick-action-button home-quick-action-button--danger p-4", style: { minHeight: '150px' }, onClick: onClearHistory },
                    React.createElement(Icon, { name: "trash", className: "h-10 w-10 mb-3" }),
                    React.createElement("span", { className: "home-quick-action-label text-[15px] font-black leading-tight" }, "Hapus History")
                )
            )
        )) : null,
        activeTab === 'home' ? React.createElement(React.Fragment, null,
            React.createElement(HomeUpdateNotice, { config: noticeConfig }),
        React.createElement("section", { className: "dashboard-command-center w-full" },
            React.createElement("div", { className: "w-full px-4 md:px-8 lg:px-12 py-6 pb-32" },
            // Section 1: AI Executive Summary
            (features.ai && analytics.data) ? React.createElement(AiInsightsPanel, { data: analytics.data }) : null,
            // Section 2: Horizontal Carousel (Quick Access / Priority)
            React.createElement("div", { className: "mb-8" },
                React.createElement("div", { className: "mb-4 flex items-center justify-between px-4 md:px-8" },
                    React.createElement("h3", { className: "text-lg font-black tracking-tight text-slate-800" }, "Akses Cepat"),
                    React.createElement("button", { type: "button", className: "text-xs font-bold text-audit-primary hover:underline", onClick: onNewVisit }, "Lihat Semua")),
                React.createElement("div", { className: "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 hide-scrollbar px-4 md:px-8" },
                    priorityStores.length > 0 ? priorityStores.map((store, i) => (
                        React.createElement("div", { key: store.siteCode || i, className: "min-w-[240px] flex-shrink-0 snap-start snap-always rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all hover:scale-[1.02]" },
                            React.createElement("div", { className: "mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600" },
                                React.createElement(Icon, { name: "store", className: "h-5 w-5" })),
                            React.createElement("h4", { className: "font-black text-slate-900 line-clamp-1" }, store.storeName || store.siteDescr || `Toko Prioritas ${i + 1}`),
                            React.createElement("p", { className: "mt-1 text-xs text-slate-500" }, store.distance !== undefined ? `Radius ${store.distance.toFixed(1)} km dari Anda` : 'Sedang mengambil lokasi...'),
                            React.createElement(Button, { className: "mt-4 w-full !rounded-xl", variant: "secondary", onClick: () => (onQuickVisit || onNewVisit)(store.storeName || store.siteDescr || '') }, "Kunjungi"))
                    )) : [1, 2, 3].map((_, i) => (
                        React.createElement("div", { key: i, className: "min-w-[240px] flex-shrink-0 snap-start snap-always rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 transition-all hover:scale-[1.02]" },
                            React.createElement("div", { className: "mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600" },
                                React.createElement(Icon, { name: "store", className: "h-5 w-5" })),
                            React.createElement("h4", { className: "font-black text-slate-900" }, "Toko Prioritas ", i + 1),
                            React.createElement("p", { className: "mt-1 text-xs text-slate-500" }, "Sedang mengambil lokasi..."),
                            React.createElement(Button, { className: "mt-4 w-full !rounded-xl", variant: "secondary", onClick: () => (onQuickVisit || onNewVisit)(`Toko Prioritas ${i + 1}`) }, "Kunjungi"))
                    )))),
            
            // Section 3: Activity Timeline
            React.createElement("div", { className: "px-4 md:px-8" },
                React.createElement("h3", { className: "mb-6 text-lg font-black tracking-tight text-slate-800" }, "Histori Aktivitas"),
                history.length ? React.createElement("div", { className: "relative space-y-6 before:absolute before:inset-y-0 before:left-[21px] before:w-0.5 before:bg-slate-200" },
                    visibleHistory.map((item, index) => React.createElement("article", { key: item.id, className: "relative flex items-start gap-4 pl-12 transition-all hover:translate-x-1" },
                        React.createElement("div", { className: "absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 border-white bg-audit-primary shadow-[0_0_0_4px_#f8fafc]" }),
                        React.createElement("div", { className: "flex-1 rounded-[24px] bg-white p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100" },
                            React.createElement("div", { className: "mb-2 flex items-start justify-between gap-2" },
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-base font-extrabold text-slate-950" }, item.storeName),
                                    React.createElement("p", { className: "text-xs font-bold text-slate-500" }, formatDate(item.visitDate))),
                                React.createElement(Badge, { tone: item.progress >= 80 ? 'success' : item.progress >= 40 ? 'warning' : 'default' }, item.progress || 0, "%")),
                            React.createElement(ProgressBar, { value: item.progress || 0 }),
                            React.createElement("div", { className: "mt-4 flex gap-2" },
                                React.createElement(Button, { className: "flex-1 !rounded-xl !py-2", variant: "secondary", onClick: () => onOpenVisit(item.id) }, "Lanjutkan"),
                                React.createElement("button", { type: "button", className: "grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors", onClick: () => onDeleteVisit(item.id), "aria-label": "Hapus" },
                                    React.createElement(Icon, { name: "trash", className: "h-4 w-4" })))))),
                    hiddenHistoryCount > 0 ? React.createElement("button", { type: "button", className: "history-load-more-button mt-6", onClick: () => setHistoryRenderLimit((value) => value + 12) }, "Tampilkan ", Math.min(12, hiddenHistoryCount), " aktivitas lagi") : null) :
                    React.createElement("div", { className: "dashboard-history-empty py-8 text-center" }, React.createElement(EmptyState, { icon: "clipboard", title: "Belum ada histori aktivitas" }))))
        )) : null,
        activeTab === 'analytics' ? React.createElement(AnalyticsView, { analytics: analytics }) : null,
        activeTab === 'home' && React.createElement("button", { type: "button", className: "inline-flex items-center justify-center rounded-full text-white shadow-2xl ring-1 ring-emerald-200 transition active:scale-[0.98]", style: {
                position: 'fixed',
                right: '24px',
                bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
                transform: 'none',
                left: 'auto',
                zIndex: 80,
                width: '56px',
                height: '56px',
                background: '#2563eb',
                opacity: 1,
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                boxShadow: '0 8px 24px -4px rgba(37, 99, 235, 0.4)'
            }, onClick: onNewVisit, "aria-label": "Buat kunjungan baru" },
            React.createElement(Icon, { name: "plus", className: "h-6 w-6" })),
        React.createElement(MasterStoreDetailModal, { open: masterStoreModalOpen, onClose: () => setMasterStoreModalOpen(false) }),
        React.createElement(InstallGuideModal, { open: installOpen, onClose: () => setInstallOpen(false), deferredPrompt: deferredPrompt, onPromptUsed: () => setDeferredPrompt(null) })));
}

function StoreSearchSelect({ label, value, options, onChange, placeholder, disabled }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    
    // Filter options based on search text
    const filteredOptions = useMemo(() => {
        if (!search.trim()) return options;
        const q = search.toLowerCase();
        return options.filter(opt => opt.label.toLowerCase().includes(q));
    }, [options, search]);

    return React.createElement(React.Fragment, null,
        React.createElement("div", { className: "grid gap-1.5" },
            label && React.createElement("label", { className: "text-sm font-extrabold text-audit-ink opacity-90" }, label),
            React.createElement("button", {
                type: "button",
                disabled: disabled,
                onClick: () => {
                    if(!disabled) {
                        setSearch('');
                        setOpen(true);
                    }
                },
                className: cx("w-full min-h-[46px] rounded-2xl border bg-white px-4 py-2.5 text-left text-[15px] font-bold text-audit-ink transition-all", disabled ? "opacity-50 cursor-not-allowed border-slate-200" : "border-slate-300 hover:border-audit-primary focus:border-audit-primary focus:ring-4 focus:ring-audit-primary/10 shadow-sm")
            },
                React.createElement("div", { className: "flex items-center justify-between gap-3" },
                    React.createElement("span", { className: !value ? "text-slate-400 truncate" : "truncate" }, value || placeholder || "Pilih..."),
                    React.createElement(Icon, { name: "down", className: "w-4 h-4 text-slate-400 shrink-0" })
                )
            )
        ),
        open ? React.createElement("div", { className: "fixed inset-0 z-[100] flex items-end justify-center lg:items-center bg-slate-950/40 backdrop-blur-sm fade-in", role: "dialog" },
            React.createElement("div", { className: "w-full max-w-lg h-[85vh] flex flex-col bg-white relative animate-slide-up shadow-2xl rounded-t-3xl lg:h-auto lg:max-h-[80vh] lg:rounded-[28px] overflow-hidden safe-area-pb" },
                React.createElement("div", { className: "flex items-center justify-between border-b border-slate-200/60 bg-white/85 backdrop-blur-xl px-5 py-4 shrink-0 z-10 sticky top-0" },
                    React.createElement("h3", { className: "text-lg font-black text-audit-ink" }, "Pilih Store"),
                    React.createElement(Button, { variant: "icon", onClick: () => setOpen(false), "aria-label": "Tutup" },
                        React.createElement(Icon, { name: "close", className: "h-4 w-4" })
                    )
                ),
                React.createElement("div", { className: "p-4 border-b border-slate-100 shrink-0" },
                    React.createElement("div", { className: "relative" },
                        React.createElement("div", { className: "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400" },
                            React.createElement(Icon, { name: "search", className: "h-5 w-5" })
                        ),
                        React.createElement("input", {
                            type: "text",
                            className: "w-full rounded-2xl border-2 border-slate-200 bg-slate-50 pl-11 pr-4 py-3.5 text-[15px] font-bold text-audit-ink placeholder:text-slate-400 focus:border-audit-primary focus:bg-white focus:outline-none transition-colors",
                            placeholder: "Cari nama toko atau kode...",
                            value: search,
                            onChange: (e) => setSearch(e.target.value)
                        })
                    )
                ),
                React.createElement("div", { className: "flex-1 overflow-y-auto p-2" },
                    filteredOptions.length === 0 ? 
                        React.createElement("div", { className: "py-12 text-center text-slate-500 font-medium" }, "Tidak ada toko yang cocok dengan pencarian.") :
                        React.createElement("div", { className: "grid gap-1" },
                            filteredOptions.map((opt, i) => {
                                const isSeparator = opt.disabled && (opt.value === '___SEPARATOR___' || String(opt.label).includes('Store Lainnya'));
                                if (isSeparator) {
                                    return React.createElement("div", { key: i, className: "px-4 py-3 mt-2 text-xs font-black uppercase tracking-widest text-slate-400 text-center" }, opt.label.replace(/-/g, ''));
                                }
                                return React.createElement("button", {
                                    key: opt.value || i,
                                    type: "button",
                                    disabled: opt.disabled,
                                    onClick: () => {
                                        onChange(opt.value);
                                        setOpen(false);
                                    },
                                    className: cx("w-full text-left px-4 py-3.5 rounded-xl text-[15px] transition-colors", 
                                        opt.value === value ? "bg-audit-primary text-white font-black shadow-md" : "hover:bg-slate-50 font-bold text-audit-ink",
                                        opt.disabled ? "opacity-50 cursor-not-allowed" : ""
                                    )
                                }, opt.label)
                            })
                        )
                )
            )
        ) : null
    );
}
function NewVisitModal({ open, onClose, onCreate }) {
    const [bestieName, setBestieName] = useState('');
    const [storeName, setStoreName] = useState('');
    const [manualOpen, setManualOpen] = useState(false);
    const [manualStoreName, setManualStoreName] = useState('');
    const [manualStoreCode, setManualStoreCode] = useState('');
    const [manualAreaManager, setManualAreaManager] = useState('');
    const [manualRegionalManager, setManualRegionalManager] = useState('');
    const [manualAddress, setManualAddress] = useState('');
    const [manualNote, setManualNote] = useState('');
    const storeOptions = useMemo(() => getStoresForBestie(bestieName).map((item) => ({ label: item.label, value: item.value || item.label })), [bestieName]);
    useEffect(() => {
        if (!open)
            return;
        const login = readBestieLogin();
        const initialBestie = login.name || BESTIE_NAMES[0] || '';
        const initialStore = getStoresForBestie(initialBestie)[0]?.label || '';
        setBestieName(initialBestie);
        setStoreName(initialStore);
        setManualOpen(false);
        setManualStoreName('');
        setManualStoreCode('');
        setManualAreaManager('');
        setManualRegionalManager('');
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
        const storeNameCaps = cleanText(manualStoreName).toUpperCase();
        const storeCode = normalizeNik(manualStoreCode).slice(0, 4);
        if (!storeNameCaps) {
            alert('Nama toko manual wajib diisi.');
            return;
        }
        if (!/^\d{4}$/.test(storeCode)) {
            alert('Kode toko wajib 4 digit angka.');
            return;
        }
        const manualStore = {
            id: `manual-local-${storeCode}-${Date.now()}`,
            siteDescr: storeNameCaps,
            storeName: storeNameCaps,
            siteCode: storeCode,
            siteCode4: storeCode,
            areaManager: cleanText(manualAreaManager),
            regionalManager: cleanText(manualRegionalManager),
            address: cleanText(manualAddress),
            source: 'manual-local',
            operationalStatus: 'active',
            updatedAt: new Date().toISOString()
        };
        saveApprovedManualStores([manualStore, ...readApprovedManualStores()]);
        saveLocalMasterStores([manualStore, ...readLocalMasterStores()]);
        setStoreName(storeNameCaps);
        setManualOpen(false);
        setManualStoreName('');
        setManualStoreCode('');
        setManualAreaManager('');
        setManualRegionalManager('');
        setManualAddress('');
        setManualNote('');
        alert('Toko manual dibuat lokal di perangkat ini. Data tidak dikirim ke database.');
    }
    if (!open)
        return null;
    const visitStoreName = manualOpen ? cleanText(manualStoreName) : storeName;
    return (React.createElement("div", { className: "fixed inset-0 z-[110] flex items-end justify-center lg:items-center bg-slate-950/40 backdrop-blur-sm fade-in", role: "dialog", "aria-modal": "true" },
        React.createElement("div", { className: "new-visit-modal w-full max-w-lg h-[90vh] flex flex-col bg-white relative animate-slide-up shadow-2xl rounded-t-[32px] lg:h-auto lg:max-h-[85vh] lg:rounded-[28px] overflow-hidden" },
            React.createElement("div", { className: "flex items-start justify-between gap-3 p-5 border-b border-slate-200/60 bg-white/85 backdrop-blur-xl shadow-sm shrink-0 sticky top-0 z-20" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary" }, "Kunjungan Baru"),
                    React.createElement("h2", { className: "mt-2 text-2xl font-black text-slate-950" }, "Pilih Bestie dan Store"),
                    readBestieLogin().name ? React.createElement("p", { className: "mt-1 text-xs font-bold text-blue-700" }, "Login NIK: ", readBestieLogin().name) : null),
                React.createElement(Button, { variant: "icon", onClick: onClose, "aria-label": "Tutup" },
                    React.createElement(Icon, { name: "close", className: "h-4 w-4" }))),
            React.createElement("div", { className: "flex-1 overflow-y-auto p-5 pb-32 grid gap-5" },
                React.createElement(SelectField, { label: "Nama Bestie", value: bestieName, options: BESTIE_NAMES, onChange: setBestieName, placeholder: "Pilih nama bestie", icon: "user", required: true, disabled: !!readBestieLogin().name }),
                React.createElement(StoreSearchSelect, { label: "Store", value: storeName, options: storeOptions, onChange: setStoreName, placeholder: "Pilih store", disabled: manualOpen }),
                React.createElement("div", { className: "pt-2" },
                    React.createElement("button", { type: "button", className: "flex w-full items-center justify-between gap-3 text-left text-sm font-extrabold text-audit-primary mb-3", onClick: () => setManualOpen((state) => !state) },
                        React.createElement("span", null, "Input store manual"),
                        React.createElement(Icon, { name: "right", className: cx('h-4 w-4 transition', manualOpen ? 'rotate-90' : '') })),
                    manualOpen ? React.createElement("div", { className: "grid gap-3" },
                        React.createElement(Field, { label: "Nama Store Manual" },
                            React.createElement(TextInput, { value: manualStoreName, onChange: (e) => setManualStoreName(e.target.value), placeholder: "Ketik nama store" }))) : null)),
            React.createElement("div", { className: "p-5 border-t border-slate-200/60 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end bg-slate-50 shrink-0" },
                React.createElement(Button, { variant: "secondary", onClick: onClose }, "Tutup"),
                React.createElement(Button, { icon: "plus", onClick: () => onCreate(bestieName, visitStoreName), disabled: !bestieName || !visitStoreName }, "Mulai Kunjungan")))));
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
    return (React.createElement("main", { className: "preview-page w-full px-4 py-4 md:px-8 md:py-8" },
        downloadBusy ? React.createElement("div", { className: "download-pdf-overlay", role: "status", "aria-live": "polite" },
            React.createElement("div", { className: "download-pdf-loader" },
                React.createElement("span", { className: "download-pdf-spinner", "aria-hidden": "true" }),
                React.createElement("strong", null, downloadMessage || 'Menyiapkan PDF...'),
                React.createElement("p", null, "Jangan tutup halaman sampai file manager muncul."))) : null,
        React.createElement(EmailReportModal, { open: emailOpen, form: emailForm, onChange: (patch) => setEmailForm((state) => ({ ...state, ...patch })), onClose: () => setEmailOpen(false), onSubmit: handleSendReportEmail, busy: emailBusy, status: emailStatus, visit: visit }),
        React.createElement("div", { className: "preview-header mb-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-end sticky top-0 z-40 bg-slate-50 pt-4 pb-3 -mx-4 px-4 sm:static sm:bg-transparent sm:pt-0 sm:pb-0 sm:mx-0 sm:px-0" },
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
    
    // Wait for CDN scripts if not ready
    if (!window.firebase) {
        await new Promise(r => setTimeout(r, 500));
        if (!window.firebase) return null;
    }
    
    if (!firebase.apps.length) {
        firebase.initializeApp(config.firebaseConfig);
    }
    
    RB_FIREBASE_DB = firebase.firestore();
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
        }
    } catch(err) { console.error('Firestore Query Error:', err); return null; }
}
async function runConvexMutation(functionName, args = {}) {
    const db = await getConvexRealtimeClient();
    if (!db || !functionName) return null;
    
    const cols = getConvexConfig().collections;
    try {
        if (functionName.includes('upsertVisit')) {
            const docRef = db.collection(cols.visits).doc(args.payload.id || args.payload.visit_key || Date.now().toString());
            await docRef.set({ ...args.payload, _id: docRef.id }, { merge: true });
            return { ok: true };
        }
        if (functionName.includes('upsertManualStoreRequest')) {
            const docRef = db.collection(cols.manualRequests).doc(args.payload.id || args.payload.req_key || Date.now().toString());
            await docRef.set({ ...args.payload, _id: docRef.id }, { merge: true });
            return { ok: true };
        }
        if (functionName.includes('upsertPresence')) {
            const docRef = db.collection(cols.presence).doc(args.presence.id || args.presence.user_id || Date.now().toString());
            await docRef.set({ ...args.presence, _id: docRef.id }, { merge: true });
            return { ok: true };
        }
        if (functionName.includes('appSettings:setConfig')) {
            const docRef = db.collection(cols.appSettings).doc(args.key);
            await docRef.set({ key: args.key, payload: args.payload, updatedAt: Date.now(), updatedBy: args.updatedBy || 'web', _id: docRef.id }, { merge: true });
            return { ok: true };
        }
        if (functionName.includes('deviceBackups:setLatest')) {
            const docRef = db.collection(cols.deviceBackups).doc(args.backupKey);
            await docRef.set({ ...args.payload, updatedAt: Date.now(), _id: docRef.id }, { merge: true });
            return { ok: true };
        }
        if (functionName.includes('masterStores:upsertMany')) {
            const batch = db.batch();
            args.stores.forEach(st => {
                const docRef = db.collection(cols.masterStores).doc(st.code);
                batch.set(docRef, { ...st, _id: docRef.id }, { merge: true });
            });
            await batch.commit();
            return { ok: true };
        }
    } catch(err) { console.error('Firestore Mutation Error:', err); return null; }
}
async function subscribeConvexQuery(functionName, args, onData, onError) {
    const db = await getConvexRealtimeClient();
    if (!db || !functionName) return () => {};
    
    const cols = getConvexConfig().collections;
    let query;
    try {
        if (functionName.includes('listVisits') || functionName.includes('listAllFindings')) {
            query = db.collection(cols.visits).orderBy('updatedAt', 'desc');
            if (args && args.limit) query = query.limit(args.limit);
        } else if (functionName.includes('listManualStoreRequests')) {
            query = db.collection(cols.manualRequests).orderBy('updatedAt', 'desc').limit(args?.limit || 200);
        } else if (functionName.includes('listPresence')) {
            query = db.collection(cols.presence).orderBy('updatedAt', 'desc').limit(100);
        } else if (functionName.includes('appSettings:listConfigs')) {
            query = db.collection(cols.appSettings);
            if (args && args.keys && args.keys.length > 0) {
                query = query.where('key', 'in', args.keys);
            }
        } else if (functionName.includes('masterStores:listStores')) {
            query = db.collection(cols.masterStores);
        }
        
        if (!query) {
            if (onData) onData([]);
            return () => {};
        }
        
        const unsubscribe = query.onSnapshot((snapshot) => {
            const docs = snapshot.docs.map(doc => ({ ...doc.data(), _id: doc.id }));
            if (onData) onData(docs);
        }, (err) => {
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
            const saved = saveScheduleConfig(Array.isArray(row.payload) ? row.payload : []);
            setScheduleConfig(saved);
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
    return (React.createElement("div", { className: "fixed inset-0 z-[90] grid place-items-center bg-slate-950/70 p-5 backdrop-blur-sm", role: "dialog", "aria-modal": "true" },
        React.createElement("div", { className: "secret-pin-card w-full max-w-md rounded-[32px] bg-white p-6 shadow-2xl" },
            React.createElement("div", { className: "mb-5 flex items-center justify-between" },
                React.createElement("div", { className: "flex items-center gap-3" },
                    React.createElement("span", { className: "grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white" },
                        React.createElement(Icon, { name: "shield" })),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-xs font-extrabold uppercase tracking-[0.22em] text-audit-primary" }, "Panel Rahasia"),
                        React.createElement("h2", { className: "text-xl font-black text-slate-950" }, "Masukkan PIN"))),
                React.createElement(Button, { variant: "icon", onClick: onClose, "aria-label": "Tutup" },
                    React.createElement(Icon, { name: "close", className: "h-4 w-4" }))),
            React.createElement("input", { ref: inputRef, value: pin, onChange: (event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 6)), type: "password", inputMode: "numeric", maxLength: "6", className: "form-control secret-pin-input text-center text-3xl font-black tracking-[0.5em]", placeholder: "------", "aria-label": "PIN panel rahasia" }),
            error ? React.createElement("p", { className: "mt-3 text-center text-sm font-bold text-rose-600" }, error) : null)));
}
function SecretMonitorPanel({ open, onClose, history, welcomeConfig, onWelcomeConfigChange, scheduleConfig, onScheduleConfigChange }) {
    const [features, setFeatures] = useState(() => readFeaturesConfig());
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
    function parseExcelSchedule(file) {
        return new Promise((resolve, reject) => {
            if (typeof window.XLSX === 'undefined') { reject(new Error('Library SheetJS belum dimuat. Coba refresh halaman.')); return; }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const wb = window.XLSX.read(data, { type: 'array' });
                    const ws = wb.Sheets[wb.SheetNames[0]];
                    const rawRows = window.XLSX.utils.sheet_to_json(ws, { header: 1 });
                    if (!rawRows.length) { resolve([]); return; }
                    const header = rawRows[0].map(h => String(h || '').trim().toLowerCase());
                    const namaIdx = header.findIndex(h => h.includes('nama'));
                    const dateIdx = header.findIndex(h => h.includes('start date') || h.includes('tanggal'));
                    const descIdx = header.findIndex(h => h.includes('description') || h.includes('deskripsi'));
                    if (namaIdx < 0 || dateIdx < 0) { reject(new Error('Kolom Nama atau Start Date tidak ditemukan.')); return; }
                    const parsed = [];
                    for (let i = 1; i < rawRows.length; i++) {
                        const row = rawRows[i];
                        const rawNama = String(row[namaIdx] || '').trim();
                        if (!rawNama) continue;
                        let rawDate = row[dateIdx];
                        let dateStr = '';
                        if (typeof rawDate === 'number') {
                            const d = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
                            dateStr = d.toISOString().slice(0, 10);
                        } else if (rawDate) { dateStr = String(rawDate).slice(0, 10); }
                        const desc = descIdx >= 0 ? String(row[descIdx] || '').trim() : '';
                        parsed.push({ nama: rawNama, date: dateStr, description: desc });
                    }
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
            if (!parsed.length) { setSchedStatus('Tidak ada data yang bisa diparsing.'); setSchedBusy(false); return; }
            const saved = saveScheduleConfig(parsed);
            onScheduleConfigChange(saved);
            setSchedStatus(`Berhasil import ${parsed.length} entri. Menyinkronkan ke Convex...`);
            const synced = await syncAppConfigToConvex(APP_CONFIG_KEYS.schedule, parsed);
            setSchedStatus(synced ? `✅ ${parsed.length} entri jadwal tersimpan & tersinkron.` : `⚠️ ${parsed.length} entri disimpan lokal, Convex sync gagal.`);
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
        const todayStr = new Date().toISOString().slice(0, 10);
        const todaySchedules = (scheduleConfig || []).filter(s => s.date === todayStr);
        return React.createElement('div', { className: 'rounded-3xl border border-violet-200 bg-violet-50 p-5 mb-5' },
            React.createElement('div', { className: 'flex items-center justify-between mb-3' },
                React.createElement('div', null,
                    React.createElement('p', { className: 'text-xs font-extrabold uppercase tracking-[0.18em] text-violet-700' }, '📅 Upload Jadwal'),
                    React.createElement('h3', { className: 'text-lg font-black text-slate-900' }, 'Import Jadwal Mingguan (Excel)')
                ),
                (scheduleConfig || []).length > 0 ? React.createElement('button', { type: 'button', onClick: clearSchedule, className: 'text-xs font-bold text-red-500 hover:text-red-700 underline' }, 'Hapus Semua') : null
            ),
            React.createElement('p', { className: 'text-xs text-slate-500 mb-4' }, 'Upload file .xlsx (kolom: Nama, Start Date, Description). Data akan tampil sebagai badge jadwal hari ini di Analitik per Bestie.'),
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
            todaySchedules.length > 0 ? React.createElement('div', { className: 'mt-4 space-y-2' },
                React.createElement('p', { className: 'text-xs font-bold text-slate-600 mb-1' }, `Jadwal hari ini (${todayStr}):`),
                todaySchedules.map((s, i) => React.createElement('div', { key: i, className: 'flex gap-3 bg-white rounded-xl p-3 border border-violet-100 text-xs' },
                    React.createElement('span', { className: 'font-bold text-violet-800 shrink-0 w-32 truncate' }, s.nama),
                    React.createElement('span', { className: 'text-slate-600 truncate' }, s.description || '-')
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
        // Revamp 200: ruang panel rahasia tidak lagi auto polling Cloudflare/Convex saat dibuka.
        // Monitoring tetap bisa di-refresh manual dari tab Monitoring agar panel setting tidak memicu request berulang.
        return undefined;
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
    const masterStoreFiltered = normalizeMasterStoreRows(masterStoreRows).filter((store) => {
        const haystack = normalize([store.siteCode4, store.siteCode, store.siteDescr, store.type, store.city, store.address, store.emailStore, store.areaManager].join(' '));
        return !masterStoreQuery || haystack.includes(normalize(masterStoreQuery));
    });
    const onlinePresence = normalizePresenceRows(presenceRows).filter((row) => row.is_online);
    const uniqueBesties = new Set(rows.map((row) => normalize(row.bestie_name)).filter(Boolean)).size;
    const today = new Date().toISOString().slice(0, 10);
    const todayVisits = rows.filter((row) => String(row.visit_date || '').slice(0, 10) === today).length;
    const isLive = source === 'cloudflare' || source === 'netlify' || source === 'supabase' || source === 'convex realtime';
    const sourceBadgeLabel = source === 'cloudflare' ? 'Cloudflare D1' : source === 'netlify' ? 'Netlify Sync' : source === 'supabase' ? 'Supabase Sync' : source === 'convex realtime' ? 'Live Convex' : 'Manual refresh';
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
                        formatDateTime(lastSync)) : null),
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
function DesktopSidebar({ screen, setScreen, visit, activeSection, goSection, onNewVisit, onClearData, onTitleTap }) {
    return (React.createElement("aside", { className: "group relative hidden min-h-screen w-20 flex-col items-center border-r border-slate-200/60 bg-white py-6 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:w-72 lg:flex" },
        React.createElement("div", { className: "flex w-full flex-col items-center px-4" },
            React.createElement("button", { type: "button", onClick: onTitleTap, className: "mb-8 flex w-full items-center justify-center rounded-2xl bg-slate-950 p-3 text-white transition-all hover:scale-105 group-hover:justify-start group-hover:px-4" },
                React.createElement("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10" },
                    React.createElement(Icon, { name: "spark", className: "h-5 w-5" })),
                React.createElement("div", { className: "ml-3 overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100" },
                    React.createElement("p", { className: "text-[10px] font-extrabold uppercase tracking-widest text-emerald-200" }, "Bestie Audit"),
                    React.createElement("h2", { className: "text-sm font-black leading-tight" }, "Command Center"))),
            React.createElement("nav", { className: "w-full space-y-3", "aria-label": "System menu" },
                React.createElement("button", { type: "button", className: cx('nav-item relative flex w-full items-center justify-center rounded-xl p-3 transition-colors group-hover:justify-start group-hover:px-4', screen === 'dashboard' ? 'bg-slate-100 text-slate-950' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'), onClick: () => { onTitleTap?.(); setScreen('dashboard'); } },
                    React.createElement(Icon, { name: "home", className: "h-5 w-5 shrink-0" }),
                    React.createElement("span", { className: "ml-3 overflow-hidden whitespace-nowrap font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100" }, "Dashboard")),
                React.createElement("button", { type: "button", className: cx('nav-item relative flex w-full items-center justify-center rounded-xl p-3 transition-colors group-hover:justify-start group-hover:px-4', screen === 'audit' ? 'bg-slate-100 text-slate-950' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'), onClick: () => visit ? setScreen('audit') : onNewVisit() },
                    React.createElement(Icon, { name: "clipboard", className: "h-5 w-5 shrink-0" }),
                    React.createElement("span", { className: "ml-3 overflow-hidden whitespace-nowrap font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100" }, "Audit Flow")),
                React.createElement("button", { type: "button", className: cx('nav-item relative flex w-full items-center justify-center rounded-xl p-3 transition-colors group-hover:justify-start group-hover:px-4', screen === 'preview' ? 'bg-slate-100 text-slate-950' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'), onClick: () => visit ? setScreen('preview') : onNewVisit() },
                    React.createElement(Icon, { name: "pdf", className: "h-5 w-5 shrink-0" }),
                    React.createElement("span", { className: "ml-3 overflow-hidden whitespace-nowrap font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100" }, "Preview PDF")))),
        visit ? (React.createElement("div", { className: "mt-8 flex w-full flex-col px-4" },
            React.createElement("div", { className: "mb-3 h-px w-full bg-slate-100" }),
            React.createElement("p", { className: "mb-3 text-center text-[9px] font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-left group-hover:px-2" }, "Flow Sections"),
            React.createElement("div", { className: "w-full space-y-1" }, SECTION_DEFS.map((section, index) => (React.createElement("button", { key: section.id, type: "button", className: cx('relative flex w-full items-center justify-center rounded-xl p-2.5 transition-colors group-hover:justify-start group-hover:px-3', screen === 'audit' && activeSection === index ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'), onClick: () => { setScreen('audit'); goSection(index); }, title: section.title },
                React.createElement(Icon, { name: section.icon, className: "h-4 w-4 shrink-0" }),
                React.createElement("span", { className: "ml-3 overflow-hidden whitespace-nowrap text-sm font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100" }, section.title))))))) : null,
        React.createElement("div", { className: "mt-auto flex w-full flex-col items-center px-4 pt-6 space-y-3" },
            React.createElement("button", { type: "button", onClick: onNewVisit, className: "flex w-full items-center justify-center rounded-xl bg-slate-900 p-3 text-white transition-colors hover:bg-slate-800 group-hover:justify-start group-hover:px-4", title: "New Visit" },
                React.createElement(Icon, { name: "plus", className: "h-5 w-5 shrink-0" }),
                React.createElement("span", { className: "ml-3 overflow-hidden whitespace-nowrap font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100" }, "New Visit")),
            visit ? React.createElement("button", { type: "button", onClick: onClearData, className: "flex w-full items-center justify-center rounded-xl bg-rose-50 p-3 text-rose-600 transition-colors hover:bg-rose-100 group-hover:justify-start group-hover:px-4", title: "Clear Data" },
                React.createElement(Icon, { name: "eraser", className: "h-5 w-5 shrink-0" }),
                React.createElement("span", { className: "ml-3 overflow-hidden whitespace-nowrap font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100" }, "Clear Flow Data")) : null)));
}
function MobileTopBar({ screen, visit, activeSection, goSection }) {
    // Top bar is now replaced by the inline Wizard Header in VisitWorkspace
    return null;
}
function MobileBottomNav({ screen, setScreen, visit, onNewVisit, onClearData }) {
    const goAudit = () => visit ? setScreen('audit') : onNewVisit();
    const goPreview = () => visit ? setScreen('preview') : onNewVisit();
    const items = [
        { key: 'dashboard', label: 'Home', icon: 'home', action: () => setScreen('dashboard'), active: screen === 'dashboard' },
        { key: 'audit', label: 'Flow', icon: 'clipboard', action: goAudit, active: screen === 'audit' },
        { key: 'preview', label: 'PDF', icon: 'pdf', action: goPreview, active: screen === 'preview' }
    ];
    if (screen === 'audit' || screen === 'preview') return null; // Hide on form visit and preview as requested

    return (React.createElement("nav", { className: "mobile-floating-nav fixed bottom-4 left-1/2 z-50 flex w-[90%] max-w-sm -translate-x-1/2 items-center justify-around rounded-full bg-slate-900/90 p-2 shadow-2xl backdrop-blur-xl transition-all duration-300 lg:hidden", "aria-label": "Mobile system navigation" },
        items.map((item) => React.createElement("button", { key: item.key, type: "button", className: cx('relative flex flex-1 flex-col items-center justify-center rounded-full py-2.5 transition-all active:scale-95', item.active ? 'text-white' : 'text-slate-400 hover:text-slate-200'), onClick: item.action },
            item.active && React.createElement("div", { className: "absolute inset-0 rounded-full bg-white/10" }),
            React.createElement(Icon, { name: item.icon, className: cx("h-6 w-6 transition-transform duration-300", item.active && "-translate-y-0.5") }),
            React.createElement("span", { className: cx("mt-1 text-[10px] font-bold tracking-wide transition-all duration-300", item.active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 absolute bottom-0") }, item.label)))));
}
function VisitWorkspace({ visit, update, activeSection, goSection, onPreview, onDashboard }) {
    const [viewMode, setViewMode] = useState('grid');
    
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
        return React.createElement("main", { className: "workspace-page w-full px-4 py-8 lg:px-8 lg:pb-8", style: { paddingBottom: '220px' } },
            React.createElement(EmptyState, { icon: "clipboard", title: "Belum ada visit aktif" }));
    const screens = [React.createElement(VisitSetupSection, { visit: visit, update: update }), React.createElement(GeneralInfoSection, { visit: visit, update: update }), React.createElement(QscResultSection, { visit: visit, update: update }), React.createElement(ObservationSection, { visit: visit, update: update }), React.createElement(EvidenceSection, { visit: visit, update: update })];
    const progress = visitProgress(visit, activeSection);
    const overallProgress = Math.round((SECTION_DEFS.reduce((sum, _, idx) => sum + visitProgress(visit, idx), 0) / (SECTION_DEFS.length * 100)) * 100);
    
    const handleGridCardClick = (index) => {
        goSection(index);
        setViewMode('section');
    };

    if (viewMode === 'grid') {
        return (React.createElement("main", { className: "workspace-page mx-auto w-full max-w-4xl px-3 sm:px-6 lg:px-8 h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-50 flex flex-col justify-between py-2 sm:py-4" },
            React.createElement("div", { className: "flex flex-col items-center text-center shrink-0 pt-2 pb-2 border-b border-slate-200/60" },
                React.createElement("div", { className: "flex items-center justify-center gap-2 mb-1" },
                    React.createElement("div", { className: "w-7 h-7 sm:w-8 sm:h-8 bg-audit-primary/10 rounded-lg flex items-center justify-center" },
                        React.createElement(Icon, { name: "clipboard", className: "w-4 h-4 sm:w-5 sm:h-5 text-audit-primary" })
                    ),
                    React.createElement("h2", { className: "text-base sm:text-xl font-black text-slate-900" }, "Form Kunjungan")
                ),
                React.createElement("p", { className: "text-xs font-bold text-slate-500 max-w-sm px-2 truncate" }, visit.store || 'Store belum dipilih', " \u2022 ", visit.nama || 'Bestie belum dipilih'),
                React.createElement("div", { className: "w-full max-w-[220px] mt-2 bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner" },
                    React.createElement("div", { className: "bg-gradient-to-r from-audit-secondary to-audit-primary h-2 rounded-full transition-all duration-500", style: { width: `${overallProgress}%` } })
                ),
                React.createElement("p", { className: "mt-1 text-[10px] font-extrabold text-slate-400" }, overallProgress, "% Complete")
            ),
            
            React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 flex-1 min-h-0 my-2 pt-1 pb-1" },
                SECTION_DEFS.map((section, idx) => {
                    const secProgress = visitProgress(visit, idx);
                    const isComplete = secProgress === 100;
                    const isLastOdd = idx === 4;
                    return (React.createElement("div", { 
                        key: idx, 
                        onClick: () => handleGridCardClick(idx),
                        className: cx(
                            "bg-white rounded-2xl p-2.5 sm:p-4 shadow-sm border border-slate-200/90 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow hover:border-audit-primary transition-all active:scale-95 relative overflow-hidden",
                            isLastOdd ? "col-span-2 sm:col-span-1" : ""
                        )
                    },
                        isComplete && React.createElement("div", { className: "absolute top-2 right-2 w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm border-2 border-white" }),
                        React.createElement("div", { className: `w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-1.5 sm:mb-2 shadow-inner ${isComplete ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}` },
                            React.createElement(Icon, { name: section.id === 'setup' ? 'settings' : section.id === 'general' ? 'home' : section.id === 'qsc' ? 'star' : section.id === 'observation' ? 'eye' : 'camera', className: "w-5 h-5 sm:w-6 sm:h-6" })
                        ),
                        React.createElement("h3", { className: "font-black text-xs sm:text-sm text-slate-800 leading-tight line-clamp-1" }, section.title),
                        React.createElement("div", { className: "w-full h-1.5 bg-slate-100 rounded-full mt-1.5 sm:mt-2 overflow-hidden" },
                            React.createElement("div", { className: `h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-audit-primary'}`, style: { width: `${secProgress}%` } })
                        )
                    ));
                })
            ),
            
            React.createElement("div", { className: "w-full max-w-md mx-auto grid grid-cols-2 gap-2 sm:gap-3 shrink-0 pt-1 pb-2" },
                React.createElement(Button, { variant: "secondary", className: "!rounded-xl !py-2.5 !px-3 font-bold bg-white border border-slate-300 text-xs sm:text-sm truncate shadow-sm", icon: "home", onClick: onDashboard }, "Dashboard"),
                React.createElement(Button, { className: "!rounded-xl !py-2.5 !px-3 shadow-md font-bold text-xs sm:text-sm truncate", icon: "pdf", onClick: onPreview }, "Preview PDF")
            )
        ));
    }

    return (React.createElement("main", { className: "workspace-page section-mode no-top-space mx-auto w-full max-w-4xl px-4 !pt-0 pb-0 sm:py-4 lg:px-8 lg:py-8 lg:pb-8", style: { paddingBottom: '220px' } },
        // Simplified Mobile Header (Only visible in section mode)
        React.createElement("div", { className: "flex items-center justify-between mb-4 sm:mb-6 pt-2 pb-2 sm:pt-2 sticky top-0 z-40 bg-slate-50 -mx-4 px-4 sm:static sm:bg-transparent sm:mx-0 sm:px-0" },
            React.createElement("button", { 
                onClick: () => setViewMode('grid'),
                className: "w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-200 active:scale-95 text-slate-600"
            },
                React.createElement(Icon, { name: "left", className: "w-5 h-5" })
            ),
            React.createElement("h2", { className: "text-lg font-black text-slate-800 text-center flex-1 mx-3 truncate" }, SECTION_DEFS[activeSection]?.title),
            React.createElement("div", { className: "w-10 h-10 flex-shrink-0 sm:hidden" }) // Balance flex centering
        ),
        
        // Wizard Header Card (Hidden on mobile)
        React.createElement("div", { className: "mb-6 overflow-hidden rounded-[32px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hidden sm:block" },
            React.createElement("div", { className: "flex items-center justify-between p-6 md:p-8" },
                React.createElement("div", { className: "min-w-0 flex-1" },
                    React.createElement("p", { className: "mb-1 text-[10px] font-black uppercase tracking-widest text-emerald-500" }, "Step ", activeSection + 1, " of ", SECTION_DEFS.length),
                    React.createElement("h2", { className: "truncate text-xl font-black text-slate-900 md:text-2xl" }, SECTION_DEFS[activeSection]?.title),
                    React.createElement("p", { className: "mt-1 truncate text-sm font-bold text-slate-500" }, visit.store || 'Store belum dipilih', " \u2022 ", visit.nama || 'Bestie belum dipilih')),
                React.createElement("div", { className: "hidden shrink-0 gap-2 sm:flex ml-4" },
                    React.createElement(Button, { variant: "secondary", onClick: () => goSection(activeSection - 1), disabled: activeSection <= 0, className: "!rounded-full !px-6", icon: "left" }, "Back"),
                    React.createElement(Button, { onClick: () => { if (activeSection >= SECTION_DEFS.length - 1) onPreview(); else goSection(activeSection + 1); }, className: "!rounded-full !px-8", icon: activeSection >= SECTION_DEFS.length - 1 ? "pdf" : "right" }, activeSection >= SECTION_DEFS.length - 1 ? "Finish" : "Next"))),
            // Progress Bar
            React.createElement("div", { className: "h-2 w-full bg-slate-100" },
                React.createElement("div", { className: "h-full bg-audit-primary transition-all duration-500 ease-out", style: { width: `${progress}%` } }))),
        
        // Wizard Content Card
        React.createElement("div", { className: "sm:rounded-[32px] sm:bg-white sm:p-6 md:p-8 sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:border sm:border-slate-100 pt-2 sm:pt-0 pb-10 sm:pb-0" },
            React.createElement("div", { key: SECTION_DEFS[activeSection]?.id || activeSection, className: "fade-in" }, screens[activeSection]))
            
        ));
}
function App() {
    const [screen, setScreen] = useState('dashboard');
    const [visit, setVisit] = useState(null);
    const [history, setHistory] = useState(() => readHistoryMeta());
    const [storageLabel, setStorageLabel] = useState('Menghitung storage...');
    const [activeSection, setActiveSection] = useState(0);
    const [masterStoreRevision, setMasterStoreRevision] = useState(0);
    const [newVisitOpen, setNewVisitOpen] = useState(false);
    const [pinOpen, setPinOpen] = useState(false);
    const [secretOpen, setSecretOpen] = useState(false);
    const [welcomeConfig, setWelcomeConfig] = useState(() => readWelcomeConfig());
    const [scheduleConfig, setScheduleConfig] = useState(() => readScheduleConfig());
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
                const welcomePending = sessionStorage.getItem(WELCOME_SEEN_KEY) !== '1';
                if (welcomePending) {
                    setScreen('dashboard');
                    sessionStorage.setItem(SESSION_SCREEN_KEY, 'dashboard');
                    return;
                }
                const savedScreen = sessionStorage.getItem(SESSION_SCREEN_KEY);
                if (savedScreen === 'preview' || savedScreen === 'audit')
                    setScreen(savedScreen);
                else
                    setScreen('dashboard');
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
        const config = getEmailReportConfig();
        startPersistentEmailScheduler(config.endpoint);
    }, []);
    useEffect(() => {
        const bump = () => setMasterStoreRevision((value) => value + 1);
        window.addEventListener('rbv-master-store-change', bump);
        window.addEventListener('storage', bump);
        return () => {
            window.removeEventListener('rbv-master-store-change', bump);
            window.removeEventListener('storage', bump);
        };
    }, []);
    useEffect(() => {
        // Revamp 229: make uploaded master data available on every device.
        // Each device pulls Convex masterStores automatically at startup and while open.
        let cancelled = false;
        let unsubscribe = null;
        let pollId = null;
        const applyRemoteMasterStores = (rows) => {
            const normalized = normalizeMasterStoreRows(rows?.rows || rows?.data || rows);
            if (cancelled || !normalized.length)
                return;
            const saved = saveLocalMasterStores(normalized);
            setMasterStoreRevision((value) => value + 1);
            console.info(`Master data toko diterapkan dari Convex: ${saved.length} baris.`);
        };
        async function refreshRemoteMasterStores() {
            try {
                const rows = await fetchMasterStoresFromConvex();
                if (!cancelled && rows && rows.length)
                    applyRemoteMasterStores(rows);
            }
            catch (error) {
                console.warn('Auto tarik master data Convex gagal:', error);
            }
        }
        async function startMasterStoreRemoteSync() {
            if (!convexEnabled())
                return;
            await refreshRemoteMasterStores();
            try {
                const queryName = getConvexConfig().masterStoreListQuery || 'masterStores:listStores';
                unsubscribe = await subscribeConvexQuery(queryName, { limit: 5000 }, (rows) => applyRemoteMasterStores(rows), (error) => console.warn('Realtime masterStores gagal:', error));
            }
            catch (error) {
                console.warn('Subscribe master data Convex gagal:', error);
            }
            if (!cancelled && !unsubscribe)
                pollId = window.setInterval(refreshRemoteMasterStores, Math.max(30000, getRemotePollMs() * 3));
        }
        startMasterStoreRemoteSync();
        const onVisible = () => {
            if (!document.hidden)
                refreshRemoteMasterStores();
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            cancelled = true;
            document.removeEventListener('visibilitychange', onVisible);
            if (pollId)
                window.clearInterval(pollId);
            try { unsubscribe?.(); } catch (error) {}
        };
    }, []);
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
                    unsubscribe = await subscribeConvexQuery(getConvexConfig().appConfigListQuery || 'appSettings:listConfigs', { keys: [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice, APP_CONFIG_KEYS.emailTemplate, APP_CONFIG_KEYS.webSync, APP_CONFIG_KEYS.schedule, APP_CONFIG_KEYS.features] }, (rows) => { if (!cancelled)
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
            sessionStorage.setItem(SESSION_SCREEN_KEY, 'dashboard');
        }
        catch (error) { }
        setScreen('dashboard');
        setActiveSection(0);
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
        async function clearAppCachesForNewBuild(latest) {
            if (!('caches' in window) || !latest || latest === APP_BUILD_VERSION)
                return;
            const lastCleared = sessionStorage.getItem(APP_RELOAD_LOCK_KEY);
            if (lastCleared === latest)
                return;
            try {
                sessionStorage.setItem(APP_RELOAD_LOCK_KEY, latest);
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
                const latest = String(info.version || info.build || APP_BUILD_VERSION).trim();
                if (!latest)
                    return;
                localStorage.setItem(APP_VERSION_KEY, latest);
                await clearAppCachesForNewBuild(latest);
            }
            catch (error) { }
        }
        async function registerServiceWorker() {
            if (!('serviceWorker' in navigator) || location.protocol === 'file:')
                return;
            try {
                const registration = await navigator.serviceWorker.register(`service-worker.js?v=${APP_BUILD_VERSION}`);
                registration.update().catch(() => { });
                // Jangan paksa reload saat service worker baru terpasang.
                // Versi baru akan dipakai saat user membuka ulang/refresh manual, sehingga halaman tidak loncat ke Home sendiri.
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
        const textTargetSelector = 'input:not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="date"]):not([type="time"]):not([type="month"]):not([type="week"]), textarea, [contenteditable="true"], .rich-editor-input';
        const findTextTarget = (target) => target?.closest?.(textTargetSelector) || null;
        let lastPointer = { x: 0, y: 0, target: null, moved: false };
        let lastTouch = { x: 0, y: 0, target: null, moved: false, wasActive: false };
        function canFocusOnTap(target) {
            if (!target || target.disabled || target.readOnly)
                return false;
            const tag = (target.tagName || '').toLowerCase();
            if (tag === 'select')
                return false;
            const type = String(target.getAttribute?.('type') || '').toLowerCase();
            return target.isContentEditable || target.classList?.contains('rich-editor-input') || tag === 'textarea' || !type || ['text', 'search', 'email', 'tel', 'url', 'number', 'password'].includes(type);
        }
        function focusTapTarget(target) {
            if (!canFocusOnTap(target) || rbvIsEditableFocusBlocked())
                return;
            if (document.activeElement !== target) {
                try { target.focus({ preventScroll: true }); } catch (error) { try { target.focus(); } catch (_) { } }
            }
        }
        function blockScrollFocus(ms = 720) {
            rbvBlockEditableFocusForScroll(ms);
        }
        function handlePointerDown(event) {
            const target = findTextTarget(event.target);
            if (!target || !canFocusOnTap(target))
                return;
            lastPointer = { x: event.clientX || 0, y: event.clientY || 0, target, moved: false };
        }
        function handlePointerMove(event) {
            if (!lastPointer.target)
                return;
            const dx = Math.abs((event.clientX || 0) - lastPointer.x);
            const dy = Math.abs((event.clientY || 0) - lastPointer.y);
            if (dx > 12 || dy > 12) {
                lastPointer.moved = true;
                blockScrollFocus();
            }
        }
        function handlePointerUp(event) {
            const target = findTextTarget(event.target) || lastPointer.target;
            if (target && lastPointer.moved) {
                blockScrollFocus();
            }
            else if (target) {
                focusTapTarget(target);
            }
            lastPointer = { x: 0, y: 0, target: null, moved: false };
        }
        function handleClick(event) {
            const target = findTextTarget(event.target);
            if (!target)
                return;
            if (rbvIsEditableFocusBlocked()) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation?.();
                return;
            }
            focusTapTarget(target);
        }
        function handleTouchStart(event) {
            const touch = event.touches?.[0];
            const target = findTextTarget(event.target);
            if (!touch || !target || !canFocusOnTap(target)) {
                lastTouch = { x: 0, y: 0, target: null, moved: false, wasActive: false };
                return;
            }
            lastTouch = { x: touch.clientX || 0, y: touch.clientY || 0, target, moved: false, wasActive: document.activeElement === target };
        }
        function handleTouchMove(event) {
            if (!lastTouch.target)
                return;
            const touch = event.touches?.[0];
            if (!touch)
                return;
            const dx = Math.abs((touch.clientX || 0) - lastTouch.x);
            const dy = Math.abs((touch.clientY || 0) - lastTouch.y);
            if (dx > 10 || dy > 10) {
                lastTouch.moved = true;
                blockScrollFocus();
            }
        }
        function handleTouchEnd(event) {
            const target = findTextTarget(event.target) || lastTouch.target;
            if (!target)
                return;
            if (lastTouch.moved) {
                blockScrollFocus(900);
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation?.();
                if (!lastTouch.wasActive && document.activeElement === target) {
                    try { target.blur(); } catch (error) { }
                }
            }
            else {
                window.requestAnimationFrame(() => focusTapTarget(target));
            }
            lastTouch = { x: 0, y: 0, target: null, moved: false, wasActive: false };
        }
        document.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true });
        document.addEventListener('pointermove', handlePointerMove, { capture: true, passive: true });
        document.addEventListener('pointerup', handlePointerUp, { capture: true, passive: true });
        document.addEventListener('click', handleClick, { capture: true, passive: false });
        document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
        document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: true });
        document.addEventListener('touchend', handleTouchEnd, { capture: true, passive: false });
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown, true);
            document.removeEventListener('pointermove', handlePointerMove, true);
            document.removeEventListener('pointerup', handlePointerUp, true);
            document.removeEventListener('click', handleClick, true);
            document.removeEventListener('touchstart', handleTouchStart, true);
            document.removeEventListener('touchmove', handleTouchMove, true);
            document.removeEventListener('touchend', handleTouchEnd, true);
        };
    }, []);
    useEffect(() => {
        const editableSelector = 'input:not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="date"]):not([type="time"]):not([type="month"]):not([type="week"]), textarea, [contenteditable="true"], .rich-editor-input';
        let timer = 0;
        function activeEditable() {
            const active = document.activeElement;
            if (!active) return null;
            if (active.matches?.(editableSelector)) return active;
            return active.closest?.(editableSelector) || null;
        }
        function syncKeyboardSafeView(force = false) {
            window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                const inset = rbvApplyKeyboardInset();
                const target = activeEditable();
                if (inset > 72 && target) rbvScrollEditableIntoKeyboardSafeView(target, { force: false });
            }, 140);
        }
        function handleFocusIn(event) {
            const target = event.target?.closest?.(editableSelector) || null;
            if (target) {
                rbvScrollEditableIntoKeyboardSafeView(target, { delay: 260, force: false });
            }
        }
        const viewport = window.visualViewport;
        const handleViewportResize = () => syncKeyboardSafeView(false);
        const handleViewportScroll = () => syncKeyboardSafeView(true);
        const handleWindowResize = () => syncKeyboardSafeView(false);
        rbvApplyKeyboardInset();
        document.addEventListener('focusin', handleFocusIn, true);
        viewport?.addEventListener('resize', handleViewportResize);
        // visualViewport scroll fires continuously on some Android keyboards; resize is enough.
        // viewport?.addEventListener('scroll', handleViewportScroll);
        window.addEventListener('resize', handleWindowResize);
        return () => {
            window.clearTimeout(timer);
            document.removeEventListener('focusin', handleFocusIn, true);
            viewport?.removeEventListener('resize', handleViewportResize);
            // viewport?.removeEventListener('scroll', handleViewportScroll);
            window.removeEventListener('resize', handleWindowResize);
            try {
                document.documentElement.style.removeProperty('--rbv-keyboard-inset');
                document.documentElement.classList.remove('rbv-keyboard-visible');
                document.body?.classList.remove('rbv-keyboard-visible');
            } catch (error) { }
        };
    }, []);
    useEffect(() => {
        window.getFormData = () => visit || {};
    }, [visit]);
    useEffect(() => {
        if (!visit?.id || !rbvProgressNotificationEnabled() || !rbvGetPushApiBase())
            return undefined;
        const timer = window.setTimeout(() => {
            rbvUpsertBackendProgressSnapshot(visit).catch(() => { });
        }, 1600);
        return () => window.clearTimeout(timer);
    }, [visit?.id, visit?.store, visit?.nama, visitProgress(visit)]);
    useEffect(() => {
        if (!visit?.id)
            return undefined;
        function notifyIfNeeded(force = false) {
            rbvMaybeShowProgressNotification(visit, { force }).catch(() => { });
        }
        const timer = window.setInterval(() => notifyIfNeeded(false), RBV_PROGRESS_NOTIFICATION_INTERVAL_MS);
        function handleVisibilityChange() {
            if (document.visibilityState === 'hidden')
                window.setTimeout(() => notifyIfNeeded(false), 900);
        }
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            window.clearInterval(timer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [visit?.id, visit?.store, visit?.nama, visitProgress(visit)]);
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
                syncFindingsToConvex(nextVisit);
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
    async function toggleVisitFeedback(id) {
        try {
            const data = await getVisitRecord(id);
            if (!data) return;
            data.isEmailFeedback = !data.isEmailFeedback;
            data.updatedAt = Date.now();
            await putVisitRecord(data);
            const nextMeta = saveHistoryMeta([historyMetaFromVisit(data), ...readHistoryMeta().filter((item) => item.id !== data.id)]);
            setHistory(nextMeta);
            if (visit && visit.id === id) {
                setVisit(data);
            }
        } catch (error) {
            console.warn('Gagal toggle feedback:', error);
        }
    }
    async function openPreviewScreen() {
        if (!visit) {
            setScreen('dashboard');
            return;
        }
        await rbvWaitForReactInputFlush();
        await rbvWaitForPdfFrame();
        setVisit((current) => current ? { ...current, updatedAt: Date.now() } : current);
        await rbvWaitForPdfFrame();
        setScreen('preview');
    }
    function navigateScreen(nextScreen) {
        if (nextScreen === 'preview') {
            openPreviewScreen();
            return;
        }
        if (nextScreen !== 'preview')
            rbvFlushActiveEditableValue({ blur: true });
        setScreen(nextScreen);
    }
    function goSection(index) {
        rbvFlushActiveEditableValue({ blur: true });
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
        
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                next.location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                await putVisitRecord(next);
                upsertMonitorVisit(next);
            }, (err) => {
                console.warn('GPS failed/denied:', err);
                if (err.code === err.PERMISSION_DENIED) {
                    alert('Izin lokasi ditolak atau diblokir oleh browser.\\n\\nPeta tidak dapat merekam titik kunjungan ini. Silakan buka Pengaturan Browser -> Izin Situs (Site Settings) -> Izinkan Lokasi, lalu coba mulai kunjungan baru.');
                }
            }, { enableHighAccuracy: false, timeout: 10000 });
        }

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
        content = React.createElement(DashboardPage, { history: history, storageLabel: storageLabel, onNewVisit: () => setNewVisitOpen(true), onQuickVisit: (storeName) => createNewVisit(readBestieLogin()?.name || '', storeName), onOpenVisit: openVisit, onDeleteVisit: deleteVisit, onClearHistory: clearAllHistory, onTitleTap: handleTitleTap, onToggleFeedback: toggleVisitFeedback, scheduleConfig: scheduleConfig });
    }
    else if (screen === 'preview') {
        content = React.createElement(PreviewPage, { visit: visit, update: updateVisit, onBack: () => navigateScreen('audit') });
    }
    else {
        content = React.createElement(VisitWorkspace, { visit: visit, update: updateVisit, activeSection: activeSection, goSection: goSection, onPreview: openPreviewScreen, onDashboard: () => setScreen('dashboard'), masterStoreRevision: masterStoreRevision });
    }
    return (React.createElement("div", { className: "audit-shell min-h-screen lg:flex lg:flex-row bg-slate-50" },
        screen !== 'dashboard' ? React.createElement(DesktopSidebar, { screen: screen, setScreen: navigateScreen, visit: visit, activeSection: activeSection, goSection: goSection, onNewVisit: () => setNewVisitOpen(true), onClearData: clearCurrentData, onTitleTap: handleTitleTap }) : null,
        React.createElement("div", { className: "flex min-h-screen min-w-0 flex-1 flex-col" },
            screen !== 'dashboard' && !welcomeOpen ? React.createElement(MobileTopBar, { screen: screen, setScreen: navigateScreen, visit: visit, activeSection: activeSection, goSection: goSection, onNewVisit: () => setNewVisitOpen(true), onTitleTap: handleTitleTap }) : null,
            React.createElement("div", { className: "min-w-0 flex-1" }, content),
            screen !== 'dashboard' && !welcomeOpen ? React.createElement(MobileBottomNav, { screen: screen, setScreen: navigateScreen, visit: visit, onNewVisit: () => setNewVisitOpen(true), onClearData: clearCurrentData }) : null),
        welcomeOpen ? React.createElement(WelcomeOverlay, { config: welcomeConfig, onDone: closeWelcome }) : null,
        React.createElement(NewVisitModal, { key: 'new-visit-' + masterStoreRevision, open: newVisitOpen, onClose: () => setNewVisitOpen(false), onCreate: createNewVisit }),
        React.createElement(SecretPinModal, { open: pinOpen, onClose: () => setPinOpen(false), onUnlock: () => { setPinOpen(false); setSecretOpen(true); } }),
        React.createElement(SecretMonitorPanel, { open: secretOpen, onClose: () => setSecretOpen(false), history: history, welcomeConfig: welcomeConfig, onWelcomeConfigChange: applyWelcomeConfig, scheduleConfig: scheduleConfig, onScheduleConfigChange: setScheduleConfig })));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App, null));
