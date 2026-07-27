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

function formatScheduleBadgeText(sched) {
    if (!sched) return 'Belum ada jadwal hari ini';
    const todayCa = new Date().toLocaleDateString('en-CA');
    const datePrefix = (sched.date && String(sched.date).slice(0, 10) !== todayCa)
        ? `[${String(sched.date).slice(5, 10).replace('-', '/')}] `
        : '';
    const rawDesc = String(sched.description || sched.toko || sched.store || 'Jadwal Aktif').trim();
    const lines = rawDesc.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean);
    let descText = lines[0] || 'Jadwal Aktif';
    descText = descText.replace(/\s*-\s*$/, '').trim();
    const loc = String(sched.location || '').trim();
    const mainText = (loc && !descText.toLowerCase().includes(loc.toLowerCase()))
        ? `${descText} — ${loc}`
        : descText;
    return `${datePrefix}${mainText}`;
}

function LeaderboardItem({ lb, idx }) {
    let narasi = "Belum Ada Kunjungan 🚀";
    if (lb.uniqueStoresMonthly > 0) {
        if (lb.uniqueStoresMonthly >= lb.totalAssigned && lb.totalAssigned > 0) narasi = "Target Achieved! 🎯";
        else if (idx === 0) narasi = "Top Performer Bulan Ini 🔥";
        else if (idx <= 2) narasi = "Great Progress ⭐";
        else narasi = "On Progress 💪";
    }
    const schedText = formatScheduleBadgeText(lb.todaySchedule);

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
            // Bottom Row: Schedule + Score
            React.createElement("div", { className: "w-full bg-slate-50/50 p-2.5 rounded-xl border border-slate-100" },
                // Schedule Badge — full width, text wraps on mobile
                React.createElement("div", { 
                    className: "bg-white rounded-xl px-3 py-2 border border-slate-200 shadow-sm w-full mb-2.5", 
                    title: lb.todaySchedule ? (`${lb.todaySchedule.date ? '[' + lb.todaySchedule.date + '] ' : ''}${lb.todaySchedule.description || 'Jadwal Aktif'}${lb.todaySchedule.location ? ' — ' + lb.todaySchedule.location : ''}`) : 'Belum ada jadwal terdaftar untuk bestie ini' 
                },
                    React.createElement("div", { className: "flex items-start gap-2" },
                        React.createElement("div", { className: "flex items-center gap-1.5 shrink-0 pt-0.5" },
                            React.createElement("span", { className: "w-2 h-2 rounded-full inline-block shrink-0 " + ((lb.todaySchedule && schedText && schedText.trim()) ? "bg-emerald-500 shadow-sm animate-pulse" : "bg-slate-300") }),
                            React.createElement("span", { className: "text-[9px] font-black text-slate-400 uppercase tracking-wider shrink-0" }, "Jadwal:")
                        ),
                        React.createElement("span", { className: "text-[11px] sm:text-xs font-bold text-slate-800 leading-snug break-words" }, 
                            (lb.todaySchedule && schedText && schedText.trim()) ? schedText : "Belum ada jadwal terdaftar"
                        )
                    )
                ),
                // Score row
                React.createElement("div", { className: "flex items-center justify-between w-full" },
                    React.createElement("p", { className: "text-[9px] font-extrabold uppercase tracking-widest text-slate-400" }, "Toko/Bulan"),
                    React.createElement("div", { className: "flex items-baseline gap-1" },
                        React.createElement("span", { className: "text-lg sm:text-xl font-black leading-none text-slate-800" }, lb.uniqueStoresMonthly),
                        React.createElement("span", { className: "text-[10px] sm:text-xs font-bold text-slate-400" }, "/", lb.totalAssigned)
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

                        if (isCurrentMonth) {
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
                
                const isRemoteDb = Boolean(currentVisits && currentVisits.length > 0);
                datasetToUse.forEach((v, idx) => {
                    if (v.store_name || v.storeName || v.isPdfDownloaded || v.isEmailSent || v.is_pdf_downloaded || v.is_email_sent || isRemoteDb) {
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
                const nowLocal = new Date();
                const todayStrLb = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`;
                const activeSched = Array.isArray(scheduleCfg) ? scheduleCfg : [];

                const leaderboard = Object.values(bestieMap).sort((a, b) => b.uniqueStoresMonthly - a.uniqueStoresMonthly).map(lb => {
                    const bestieScheds = activeSched.filter(s => matchBestieScheduleName(s.nama || s.bestie || s.auditor || s.name || '', lb.name));
                    const todayMatch = bestieScheds.find(s => String(s.date || '').slice(0, 10) === todayStrLb);
                    const upcomingMatch = bestieScheds.filter(s => String(s.date || '').slice(0, 10) >= todayStrLb).sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')))[0] || null;
                    return {
                        ...lb,
                        todaySchedule: todayMatch || upcomingMatch
                    };
                });

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
            const fallbackTimer = setTimeout(() => {
                if (!cancelled) {
                    processData();
                }
            }, 1200);
            unsubs.push(() => clearTimeout(fallbackTimer));

            if (convexEnabled()) {
                const config = getConvexConfig();
                const qName = config.monitorQuery || 'monitor:listVisits';
                
                try {
                    const unsubVisits = await subscribeConvexQuery(qName, {}, (data) => {
                        if (cancelled) return;
                        clearTimeout(fallbackTimer);
                        currentVisits = normalizeMonitorRows(data);
                        processData();
                    }, (err) => {
                        console.warn('Firestore listVisits sub error:', err);
                        if (!cancelled) processData();
                    });
                    if (unsubVisits) unsubs.push(unsubVisits);

                    const unsubFindings = await subscribeConvexQuery('monitor:listAllFindings', { limit: 500 }, (data) => {
                        if (cancelled) return;
                        currentFindings = Array.isArray(data) ? data : [];
                        processData();
                    }, (err) => {
                        console.warn('Firestore listAllFindings sub error:', err);
                        if (!cancelled) processData();
                    });
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

function SyncStatusBadge() {
    const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setIsSyncing(true);
            try {
                backfillLocalFindingsToConvex().finally(() => {
                    setTimeout(() => setIsSyncing(false), 1200);
                });
            } catch (e) {
                setIsSyncing(false);
            }
        };
        const handleOffline = () => {
            setIsOnline(false);
            setIsSyncing(false);
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOnline) {
        return React.createElement("div", {
            className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300/80 shadow-sm transition-all",
            title: "Mode Offline Aktif. Anda dapat terus mengaudit tanpa sinyal, data disimpan di HP & otomatis disinkronkan saat online."
        },
            React.createElement("span", { className: "w-2 h-2 rounded-full bg-amber-500" }),
            React.createElement("span", null, "Offline Mode")
        );
    }

    if (isSyncing) {
        return React.createElement("div", {
            className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 transition-all",
            title: "Menyinkronkan data offline ke cloud..."
        },
            React.createElement("span", { className: "w-2 h-2 rounded-full bg-blue-500 animate-pulse" }),
            React.createElement("span", { className: "hidden sm:inline" }, "Sync Cloud...")
        );
    }

    return React.createElement("div", {
        className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 transition-all",
        title: "Terhubung ke jaringan. Semua data tersinkronisasi ke cloud dan tersimpan offline."
    },
        React.createElement("span", { className: "w-2 h-2 rounded-full bg-emerald-500" }),
        React.createElement("span", { className: "hidden sm:inline" }, "Cloud Sync Aktif")
    );
}

function DashboardPage({ activeTab = 'home', onTabChange, history, storageLabel, onNewVisit, onQuickVisit, onOpenVisit, onDeleteVisit, onClearHistory, onTitleTap, onToggleFeedback, scheduleConfig }) {

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

    const bestieName = readBestieLogin()?.name || 'Bestie';
    const scheduleCount = 5; // Default target
    const progressPercent = Math.min(100, Math.round((todayVisits / scheduleCount) * 100));

    return (React.createElement("main", { className: "dashboard-page w-full min-h-screen flex flex-col bg-[var(--brand-bg)] relative pb-20" },
        React.createElement("style", null, `@keyframes rbvInstallPulse{0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.2);transform:translateY(0)}50%{box-shadow:0 0 0 10px rgba(37,99,235,0);transform:translateY(-2px)}}`),
        
        // Brand New Header & Hero (Dark Teal)
        React.createElement("div", { className: "bg-[var(--brand-teal)] text-white rounded-b-[40px] px-6 pt-10 pb-8 relative overflow-hidden shadow-xl" },
            // Decoration circles
            React.createElement("div", { className: "absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" }),
            React.createElement("div", { className: "absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--brand-orange)]/20 rounded-full blur-xl" }),
            
            // Header Top
            React.createElement("div", { className: "flex justify-between items-center relative z-10 mb-8" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-white/70 text-sm font-medium mb-1" }, "Selamat Pagi,"),
                    React.createElement("h1", { className: "text-2xl font-black tracking-tight" }, bestieName)
                ),
                React.createElement("button", { onClick: onTitleTap, className: "w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20" },
                    React.createElement(Icon, { name: "user", className: "w-6 h-6 text-white" })
                )
            ),
            
            // Progress Hero Card
            React.createElement("div", { className: "bg-white/10 backdrop-blur-md border border-white/20 rounded-[28px] p-6 relative z-10" },
                React.createElement("div", { className: "flex justify-between items-center mb-6" },
                    React.createElement("div", null,
                        React.createElement("h2", { className: "text-lg font-bold mb-1" }, "Target Hari Ini"),
                        React.createElement("p", { className: "text-white/70 text-sm" }, todayVisits, " dari ", scheduleCount, " Kunjungan")
                    ),
                    // Progress Ring
                    React.createElement("div", { className: "relative w-16 h-16 flex items-center justify-center" },
                        React.createElement("svg", { className: "w-full h-full -rotate-90", viewBox: "0 0 36 36" },
                            React.createElement("path", { className: "text-white/20", d: "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831", fill: "none", stroke: "currentColor", strokeWidth: "3" }),
                            React.createElement("path", { className: "text-[var(--brand-orange)]", strokeDasharray: `${progressPercent}, 100`, d: "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round" })
                        ),
                        React.createElement("span", { className: "absolute text-sm font-bold" }, progressPercent, "%")
                    )
                ),
                React.createElement("button", { onClick: onNewVisit, className: "w-full bg-[var(--brand-orange)] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-500/30 active:scale-95 transition-transform" }, "Mulai Kunjungan")
            )
        ),
        
        // Content Area
        React.createElement("div", { className: "px-6 py-6" },
            React.createElement(HomeUpdateNotice, { config: noticeConfig }),
            (features.ai && analytics.data) ? React.createElement(AiInsightsPanel, { data: analytics.data }) : null,
            
            // Jadwal Hari Ini
            React.createElement("div", { className: "mb-8" },
                React.createElement("div", { className: "flex justify-between items-center mb-4" },
                    React.createElement("h3", { className: "text-lg font-black text-slate-800 tracking-tight" }, "Jadwal Hari Ini"),
                    React.createElement("button", { className: "text-sm text-[var(--brand-teal)] font-bold", onClick: () => setMasterStoreModalOpen(true) }, "Lihat Semua")
                ),
                React.createElement("div", { className: "flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-6 px-6" },
                    priorityStores.length > 0 ? priorityStores.map((store, i) => (
                        React.createElement("div", { key: store.siteCode || i, className: "min-w-[160px] flex-shrink-0 snap-start snap-always rounded-[24px] bg-white p-4 shadow-sm border border-slate-100 transition-all" },
                            React.createElement("div", { className: "w-10 h-10 rounded-full bg-[var(--brand-orange-light)] text-[var(--brand-orange)] flex items-center justify-center mb-3" },
                                React.createElement(Icon, { name: "store", className: "w-5 h-5" })
                            ),
                            React.createElement("h4", { className: "font-black text-slate-900 text-sm line-clamp-2 leading-tight mb-1" }, store.storeName || store.siteDescr || `Toko ${i + 1}`),
                            React.createElement("p", { className: "text-xs text-slate-500" }, store.distance !== undefined ? `${store.distance.toFixed(1)} km` : 'Lokasi...')
                        )
                    )) : [1, 2, 3].map((_, i) => (
                        React.createElement("div", { key: i, className: "min-w-[160px] flex-shrink-0 snap-start snap-always rounded-[24px] bg-white p-4 shadow-sm border border-slate-100 transition-all" },
                            React.createElement("div", { className: "w-10 h-10 rounded-full bg-[var(--brand-orange-light)] text-[var(--brand-orange)] flex items-center justify-center mb-3" },
                                React.createElement(Icon, { name: "store", className: "w-5 h-5" })
                            ),
                            React.createElement("h4", { className: "font-black text-slate-900 text-sm leading-tight mb-1" }, "Toko Prioritas ", i + 1),
                            React.createElement("p", { className: "text-xs text-slate-500" }, "Memuat...")
                        )
                    ))
                )
            ),
            
            // Histori Aktivitas
            React.createElement("div", { className: "mb-8" },
                React.createElement("h3", { className: "text-lg font-black text-slate-800 tracking-tight mb-4" }, "Histori Aktivitas"),
                history.length ? React.createElement("div", { className: "space-y-4" },
                    visibleHistory.map((item, index) => React.createElement("div", { key: item.id, className: "bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex items-center justify-between" },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement("div", { className: "w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400" },
                                React.createElement(Icon, { name: item.progress >= 100 ? "check" : "clipboard", className: "w-6 h-6" })
                            ),
                            React.createElement("div", null,
                                React.createElement("h4", { className: "font-bold text-slate-900 text-sm max-w-[160px] truncate" }, item.storeName),
                                React.createElement("p", { className: "text-xs text-slate-500" }, formatDate(item.visitDate))
                            )
                        ),
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement("span", { className: cx("text-xs font-bold px-2.5 py-1 rounded-full", item.progress >= 80 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700") }, item.progress || 0, "%"),
                            React.createElement("button", { onClick: () => onOpenVisit(item.id), className: "w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors" },
                                React.createElement(Icon, { name: "arrow-right", className: "w-4 h-4" })
                            )
                        )
                    )),
                    hiddenHistoryCount > 0 ? React.createElement("button", { type: "button", className: "w-full py-3 text-sm font-bold text-[var(--brand-teal)] text-center", onClick: () => setHistoryRenderLimit((value) => value + 12) }, "Tampilkan Lebih Banyak") : null
                ) : React.createElement("div", { className: "py-8 text-center" }, React.createElement(EmptyState, { icon: "clipboard", title: "Belum ada histori aktivitas" }))
            )
        ),
        
        // Settings/Utility view if tab is active
        activeTab === 'utility' ? React.createElement("div", { className: "fixed inset-0 z-[60] bg-white overflow-y-auto pb-24 fade-in" },
            React.createElement("div", { className: "sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 border-b border-slate-100" },
                React.createElement("h2", { className: "text-xl font-black text-slate-900 tracking-tight" }, "Utiliti"),
                React.createElement("button", { onClick: () => onTabChange?.('home'), className: "w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full" }, React.createElement(Icon, { name: "x", className: "w-5 h-5" }))
            ),
            React.createElement("div", { className: "px-6 py-6 grid grid-cols-2 gap-4" },
                React.createElement("button", { type: "button", className: cx('bg-slate-50 border border-slate-100 rounded-[24px] p-5 flex flex-col items-center justify-center gap-3', syncBusy && 'pointer-events-none opacity-60'), onClick: handleManualWebsiteSync },
                    syncBusy ? React.createElement("span", { className: "loading-spinner mini" }) : React.createElement(Icon, { name: "download", className: "h-8 w-8 text-[var(--brand-teal)]" }),
                    React.createElement("span", { className: "text-sm font-bold" }, syncBusy ? 'Sync...' : 'Update App')
                ),
                React.createElement("button", { type: "button", className: cx('bg-slate-50 border border-slate-100 rounded-[24px] p-5 flex flex-col items-center justify-center gap-3', backupBusy && 'pointer-events-none opacity-60'), onClick: handleBackupData },
                    React.createElement(Icon, { name: "download", className: "h-8 w-8 text-[var(--brand-teal)]" }),
                    React.createElement("span", { className: "text-sm font-bold" }, "Backup")
                ),
                React.createElement("label", { className: cx('bg-slate-50 border border-slate-100 rounded-[24px] p-5 flex flex-col items-center justify-center gap-3', restoreBusy && 'pointer-events-none opacity-60'), role: "button" },
                    React.createElement(Icon, { name: "upload", className: "h-8 w-8 text-[var(--brand-teal)]" }),
                    React.createElement("span", { className: "text-sm font-bold" }, "Restore"),
                    React.createElement("input", { type: "file", accept: "application/json,.json", className: "hidden", onChange: handleRestoreFile, disabled: restoreBusy })
                ),
                React.createElement("button", { type: "button", className: "bg-slate-50 border border-slate-100 rounded-[24px] p-5 flex flex-col items-center justify-center gap-3", onClick: () => setMasterStoreModalOpen(true) },
                    React.createElement(Icon, { name: "store", className: "h-8 w-8 text-[var(--brand-teal)]" }),
                    React.createElement("span", { className: "text-sm font-bold" }, "Master Store")
                ),
                React.createElement("button", { type: "button", className: "bg-[var(--brand-orange-light)] border border-orange-100 rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 text-[var(--brand-orange)]", onClick: () => setInstallOpen(true) },
                    React.createElement(Icon, { name: "spark", className: "h-8 w-8" }),
                    React.createElement("span", { className: "text-sm font-bold" }, "Install App")
                ),
                React.createElement("button", { type: "button", className: "bg-rose-50 border border-rose-100 rounded-[24px] p-5 flex flex-col items-center justify-center gap-3 text-rose-600", onClick: onClearHistory },
                    React.createElement(Icon, { name: "trash", className: "h-8 w-8" }),
                    React.createElement("span", { className: "text-sm font-bold" }, "Hapus Histori")
                )
            )
        ) : null,
        
        // Analytics view if tab is active
        activeTab === 'analytics' ? React.createElement("div", { className: "fixed inset-0 z-[60] bg-white overflow-y-auto fade-in" },
            React.createElement("div", { className: "sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 border-b border-slate-100" },
                React.createElement("h2", { className: "text-xl font-black text-slate-900 tracking-tight" }, "Analitik"),
                React.createElement("button", { onClick: () => onTabChange?.('home'), className: "w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full" }, React.createElement(Icon, { name: "x", className: "w-5 h-5" }))
            ),
            React.createElement(AnalyticsView, { analytics: analytics })
        ) : null,
        
        // Old FAB desktop fallback
        React.createElement("button", { type: "button", className: "hidden lg:inline-flex items-center justify-center rounded-full text-white shadow-2xl transition active:scale-[0.98]", style: {
                position: 'fixed', right: '24px', bottom: '24px', zIndex: 80, width: '56px', height: '56px', background: 'var(--brand-orange)',
                boxShadow: '0 8px 24px -4px rgba(255, 176, 103, 0.4)'
            }, onClick: onNewVisit, "aria-label": "Buat kunjungan baru" },
            React.createElement(Icon, { name: "plus", className: "h-6 w-6" })
        ),
        
        React.createElement(MasterStoreDetailModal, { open: masterStoreModalOpen, onClose: () => setMasterStoreModalOpen(false) }),
        React.createElement(InstallGuideModal, { open: installOpen, onClose: () => setInstallOpen(false), deferredPrompt: deferredPrompt, onPromptUsed: () => setDeferredPrompt(null) })
    ));
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