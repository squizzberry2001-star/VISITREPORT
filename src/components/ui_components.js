function Icon({ name, className = 'h-5 w-5', strokeWidth = 2 }) {
    const paths = {
        user: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
            React.createElement("circle", { cx: "12", cy: "7", r: "4" })),
        chart: React.createElement(React.Fragment, null,
            React.createElement("path", { d: "M3 3v18h18" }),
            React.createElement("path", { d: "m19 9-5 5-4-4-3 3" })),
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
        document.documentElement.classList.toggle('rbv-keyboard-visible', inset > 150);
        document.body?.classList.toggle('rbv-keyboard-visible', inset > 150);
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
            if (!options.force && now - rbvLastKeyboardScrollAt < 400) return;
            const viewport = window.visualViewport;
            const viewportTop = viewport ? viewport.offsetTop : 0;
            const viewportHeight = viewport ? viewport.height : window.innerHeight;
            const rect = target.getBoundingClientRect();
            // Clearance dari atas (sticky header) dan bawah (keyboard + buffer)
            const topLimit = viewportTop + 72;
            const bottomLimit = viewportTop + viewportHeight - 32;
            const tooLow = rect.bottom > bottomLimit;
            const tooHigh = rect.top < topLimit;
            if (tooLow || tooHigh || options.force) {
                rbvLastKeyboardScrollAt = now;
                // Prefer native scrollIntoView untuk Android compatibility
                try {
                    target.scrollIntoView({ block: 'center', behavior: 'auto' });
                } catch (_) {
                    const scrollRoot = document.scrollingElement || document.documentElement;
                    const currentY = scrollRoot.scrollTop || window.scrollY || 0;
                    const desiredDelta = tooLow ? (rect.bottom - bottomLimit + 24) : (rect.top - topLimit - 24);
                    const nextY = Math.max(0, Math.round(currentY + desiredDelta));
                    if (Math.abs(nextY - currentY) > 16) window.scrollTo({ top: nextY, behavior: 'auto' });
                }
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
                React.createElement("input", { ref: cameraRef, type: "file", accept: "image/*,image/jpeg,image/png,image/heic,image/webp", capture: getNativeCameraCaptureAttr() || undefined, className: "rbv-native-file-input", onChange: handleFiles }),
                React.createElement(Icon, { name: "camera", className: "h-4 w-4" })) : null,
            !hideActions ? React.createElement("label", { className: "rbv-native-file-trigger rbv-native-photo-button", "aria-label": "Pilih foto dari galeri", onPointerDown: rbvPrepareCameraCapture, onTouchStart: rbvPrepareCameraCapture },
                React.createElement("input", { ref: galleryRef, type: "file", accept: "image/*,image/jpeg,image/png,image/heic,image/webp", className: "rbv-native-file-input", onChange: handleFiles }),
                React.createElement(Icon, { name: "gallery", className: "h-4 w-4" })) : null),
        !hideDescription ? React.createElement("div", { className: "border-t border-slate-200 p-3" }, rich ? React.createElement(RichTextInput, { value: description, onChange: (nextDescription) => onChange({ ...(value || blankPhoto()), description: nextDescription }), placeholder: "Deskripsi foto...", minHeight: 92 }) : React.createElement(TextArea, { value: description, onChange: (event) => onChange({ ...(value || blankPhoto()), description: event.target.value }), placeholder: "Deskripsi foto...", minRows: 2 })) : null,
        React.createElement(PhotoEditorModal, { open: editorOpen, image: editorImageOverride || value?.image || '', title: label, cropRatio: cropRatio, onClose: () => { setEditorOpen(false); setEditorImageOverride(''); }, onSave: (editedImage, meta) => { setEditorImageOverride(''); onChange({ ...(value || blankPhoto()), image: editedImage, cropAspect: meta?.aspectRatio || value?.cropAspect || ratioToAspectString(cropRatio) || '' }); } })));
}
function SectionShell({ title, children, actions, preTitle }) {
    return (React.createElement("section", { className: "slide-enter fade-in" },
        (actions || preTitle) && React.createElement("div", { className: "section-heading mb-4 flex flex-col gap-3" },
            React.createElement("div", { className: "section-title-row flex min-w-0 items-center justify-between gap-3" },
                actions ? React.createElement("div", { className: "section-actions flex shrink-0 items-center justify-end gap-2 ml-auto" }, actions) : null),
            preTitle ? React.createElement("div", { className: "section-pretitle" }, preTitle) : null),
        children));
}