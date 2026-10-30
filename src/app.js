function DesktopSidebar() {
    // Sidebar revamped to unified bottom navbar for desktop per user request
    return null;
}
function MobileTopBar({ screen, visit, activeSection, goSection }) {
    // Top bar is now replaced by the inline Wizard Header in VisitWorkspace
    return null;
}
function AppBottomNav({ screen, setScreen, visit, onNewVisit, onClearData, onTitleTap }) {
    // Hide entirely when actively doing an audit or preview to maximize screen space
    if (screen === 'audit' || screen === 'preview') return null; 

    return React.createElement("div", { className: "rbv-dock-container" },
        React.createElement("nav", { className: "rbv-bottom-dock", "aria-label": "System navigation" },
            // Home / Dashboard
            React.createElement("button", {
                type: "button",
                className: cx("rbv-dock-item", screen === "dashboard" && "active"),
                onClick: () => { setScreen("dashboard"); },
                title: "Dashboard"
            },
                React.createElement(Icon, { name: "home", className: "rbv-dock-icon", strokeWidth: screen === "dashboard" ? 2.5 : 2 }),
                React.createElement("span", { className: "rbv-dock-label" }, "Home")
            ),

            // Schedule / Jadwal
            React.createElement("button", {
                type: "button",
                className: cx("rbv-dock-item", screen === "schedule" && "active"),
                onClick: () => { setScreen("schedule"); },
                title: "Jadwal Bestie"
            },
                React.createElement(Icon, { name: "calendar", className: "rbv-dock-icon", strokeWidth: screen === "schedule" ? 2.5 : 2 }),
                React.createElement("span", { className: "rbv-dock-label" }, "Jadwal")
            ),

            // Center Action - Kunjungan Baru
            React.createElement("div", { className: "rbv-dock-fab-slot" },
                // Mobile circular floating FAB
                React.createElement("button", {
                    type: "button",
                    "aria-label": "Kunjungan Baru",
                    className: "rbv-dock-fab-mobile",
                    onClick: onNewVisit
                },
                    React.createElement(Icon, { name: "plus", className: "h-6 w-6 stroke-[2.5px]" })
                ),
                // Desktop sleek jewel action pill
                React.createElement("button", {
                    type: "button",
                    className: "rbv-dock-fab-desktop",
                    onClick: onNewVisit,
                    title: "Mulai Kunjungan Baru"
                },
                    React.createElement(Icon, { name: "plus", className: "h-4 w-4 stroke-[2.5px]" }),
                    React.createElement("span", null, "Kunjungan")
                )
            ),

            // Analytics / Analitik
            React.createElement("button", {
                type: "button",
                className: cx("rbv-dock-item", screen === "analytics" && "active"),
                onClick: () => setScreen("analytics"),
                title: "Analitik"
            },
                React.createElement(Icon, { name: "chart", className: "rbv-dock-icon", strokeWidth: screen === "analytics" ? 2.5 : 2 }),
                React.createElement("span", { className: "rbv-dock-label" }, "Analitik")
            ),

            // Utility / Profil
            React.createElement("button", {
                type: "button",
                className: cx("rbv-dock-item", screen === "utility" && "active"),
                onClick: () => setScreen("utility"),
                title: "Utiliti & Profil"
            },
                React.createElement(Icon, { name: "user", className: "rbv-dock-icon", strokeWidth: screen === "utility" ? 2.5 : 2 }),
                React.createElement("span", { className: "rbv-dock-label" }, "Profil")
            )
        )
    );
}
const MobileBottomNav = AppBottomNav;
function VisitWorkspace({ visit, update, activeSection, goSection, onPreview, onDashboard, masterStoreRevision }) {
    const [viewMode, setViewMode] = useState('section');
    
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
    const screens = [React.createElement(VisitSetupSection, { key: "setup-" + (masterStoreRevision || 0), visit: visit, update: update }), React.createElement(GeneralInfoSection, { visit: visit, update: update }), React.createElement(QscResultSection, { visit: visit, update: update }), React.createElement(ObservationSection, { visit: visit, update: update }), React.createElement(EvidenceSection, { visit: visit, update: update })];
    const progress = visitProgress(visit, activeSection);
    const overallProgress = Math.round((SECTION_DEFS.reduce((sum, _, idx) => sum + visitProgress(visit, idx), 0) / (SECTION_DEFS.length * 100)) * 100);
    
    const handleGridCardClick = (index) => {
        goSection(index);
        setViewMode('section');
    };

    if (viewMode === 'grid') {
        return (React.createElement("main", { className: "workspace-page mx-auto w-full max-w-4xl h-[100dvh] max-h-[100dvh] overflow-hidden bg-brand-bg flex flex-col" },
            // Hero Header for Form Visit
            React.createElement("div", { className: "bg-brand-teal text-white rounded-b-[40px] px-6 pt-4 pb-6 relative overflow-hidden shadow-xl shrink-0" },
                React.createElement("div", { className: "absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" }),
                React.createElement("div", { className: "absolute -bottom-10 -left-10 w-32 h-32 bg-brand-orange/20 rounded-full blur-xl" }),
                
                React.createElement("div", { className: "flex justify-between items-center relative z-10 mb-3" },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("button", { onClick: onDashboard, className: "w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-95 transition-transform" },
                            React.createElement(Icon, { name: "left", className: "w-5 h-5 text-white" })
                        ),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-white/70 text-xs font-medium mb-0.5" }, visit.store || 'Store belum dipilih'),
                            React.createElement("h1", { className: "text-lg font-black tracking-tight leading-none" }, "Form Kunjungan")
                        )
                    ),
                    React.createElement(SyncStatusBadge, null)
                ),
                
                // Progress Card
                React.createElement("div", { className: "bg-white/10 backdrop-blur-md border border-white/20 rounded-[28px] p-5 relative z-10" },
                    React.createElement("div", { className: "flex justify-between items-center mb-3" },
                        React.createElement("div", null,
                            React.createElement("h2", { className: "text-base font-bold mb-0.5" }, "Progres Audit"),
                            React.createElement("p", { className: "text-white/70 text-xs" }, visit.nama || 'Bestie belum dipilih')
                        ),
                        React.createElement("div", { className: "text-2xl font-black text-brand-orange" }, overallProgress, "%")
                    ),
                    React.createElement("div", { className: "w-full bg-white/20 rounded-full h-2 overflow-hidden" },
                        React.createElement("div", { className: "bg-brand-orange h-2 rounded-full transition-all duration-500", style: { width: `${overallProgress}%` } })
                    )
                )
            ),
            
            // Bento Grid for Sections
            React.createElement("div", { className: "flex-1 overflow-y-auto px-4 pt-2 pb-32" },
                React.createElement("div", { className: "grid grid-cols-2 gap-3 sm:gap-4" },
                    SECTION_DEFS.map((section, idx) => {
                        const secProgress = visitProgress(visit, idx);
                        const isComplete = secProgress === 100;
                        const isLastOdd = idx === 4;
                        
                        // Icon mapping
                        const iconMap = { setup: 'settings', general: 'home', qsc: 'star', observation: 'eye', evidence: 'camera' };
                        const iconName = iconMap[section.id] || 'clipboard';
                        
                        return (React.createElement("div", { 
                            key: idx, 
                            onClick: () => handleGridCardClick(idx),
                            className: cx(
                                "bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-brand-teal/30 transition-all active:scale-95 relative overflow-hidden",
                                isLastOdd ? "col-span-2 flex-row items-center sm:col-span-1 sm:flex-col sm:items-start" : "h-[120px]"
                            )
                        },
                            // Checkmark if complete
                            isComplete && React.createElement("div", { className: "absolute top-3 right-3 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-sm" },
                                React.createElement(Icon, { name: "check", className: "w-3 h-3" })
                            ),
                            
                            // Top part: Icon
                            React.createElement("div", { className: cx("w-10 h-10 rounded-2xl flex items-center justify-center mb-2", isComplete ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-bg text-brand-teal', isLastOdd && "mb-0 mr-3 sm:mr-0 sm:mb-2") },
                                React.createElement(Icon, { name: iconName, className: "w-5 h-5" })
                            ),
                            
                            // Bottom part: Title & Progress
                            React.createElement("div", { className: cx("flex-1", isLastOdd && "flex flex-col justify-center") },
                                React.createElement("h3", { className: "font-extrabold text-sm text-slate-800 leading-tight mb-2" }, section.title),
                                React.createElement("div", { className: "w-full flex items-center gap-2" },
                                    React.createElement("div", { className: "flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden" },
                                        React.createElement("div", { className: cx("h-full rounded-full transition-all", isComplete ? 'bg-emerald-500' : 'bg-brand-teal'), style: { width: `${secProgress}%` } })
                                    ),
                                    React.createElement("span", { className: "text-[10px] font-bold text-slate-400" }, secProgress, "%")
                                )
                            )
                        ));
                    })
                )
            ),
            
            // Bottom Action Bar
            React.createElement("div", { className: "fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100/50 z-50 flex gap-3" },
                React.createElement(Button, { variant: "secondary", className: "flex-1 !rounded-2xl !py-3.5 !font-extrabold bg-white border border-slate-200 text-slate-700 shadow-sm", icon: "pdf", onClick: onPreview }, "Preview PDF"),
                React.createElement("button", {
                    type: "button",
                    onClick: () => { goSection(0); setViewMode('section'); },
                    className: "flex-[1.5] rounded-2xl bg-brand-teal text-white font-extrabold text-sm shadow-xl shadow-brand-teal/20 hover:bg-[#153640] active:scale-95 transition-all flex items-center justify-center gap-2"
                },
                    React.createElement("span", null, "Mulai Isi"),
                    React.createElement(Icon, { name: "right", className: "w-4 h-4" })
                )
            )
        ));
    }

    return (React.createElement("main", { className: "workspace-page section-mode no-top-space mx-auto w-full min-h-screen flex flex-col bg-slate-50 relative pb-36" },
        // Unified Sleek Sticky Header
        React.createElement("header", { className: "sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-slate-200/80 px-4 py-3 sm:px-6 shadow-sm transition-all" },
            React.createElement("div", { className: "max-w-4xl mx-auto flex items-center justify-between gap-3" },
                // Left: Back button + Store & Bestie info
                React.createElement("div", { className: "flex items-center gap-3 min-w-0" },
                    React.createElement("button", {
                        type: "button",
                        onClick: onDashboard,
                        className: "w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-slate-700 transition-all border border-slate-200/70 cursor-pointer",
                        title: "Kembali ke Dashboard"
                    },
                        React.createElement(Icon, { name: "left", className: "w-5 h-5" })
                    ),
                    React.createElement("div", { className: "min-w-0" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement("h1", { className: "text-sm sm:text-base font-black text-slate-900 truncate leading-tight" },
                                visit.store || 'Store belum dipilih'
                            ),
                            React.createElement(SyncStatusBadge, null)
                        ),
                        React.createElement("p", { className: "text-[11px] sm:text-xs font-semibold text-slate-500 truncate mt-0.5" },
                            visit.nama || 'Bestie belum dipilih',
                            " \u2022 ",
                            formatDate(visit.tanggal)
                        )
                    )
                ),

                // Right: Overall progress + View Grid Toggle + Preview PDF
                React.createElement("div", { className: "flex items-center gap-2 shrink-0" },
                    React.createElement("button", {
                        type: "button",
                        onClick: () => setViewMode('grid'),
                        className: "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200/60",
                        title: "Lihat Ringkasan Grid"
                    },
                        React.createElement(Icon, { name: "spark", className: "w-3.5 h-3.5" }),
                        React.createElement("span", null, "Grid")
                    ),
                    React.createElement("div", { className: "flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[11px] sm:text-xs font-black shadow-sm" },
                        React.createElement("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" }),
                        React.createElement("span", null, `${overallProgress}%`)
                    ),
                    React.createElement("button", {
                        type: "button",
                        onClick: onPreview,
                        className: "flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-brand-teal text-white hover:bg-[#153640] active:scale-95 text-xs font-extrabold shadow-md shadow-brand-teal/20 transition-all cursor-pointer",
                        title: "Lihat Preview PDF"
                    },
                        React.createElement(Icon, { name: "pdf", className: "w-4 h-4" }),
                        React.createElement("span", { className: "hidden xs:inline sm:inline" }, "Preview")
                    )
                )
            ),
            // Sub-bar: Active section title and progress percentage
            React.createElement("div", { className: "max-w-4xl mx-auto mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs" },
                React.createElement("div", { className: "flex items-center gap-2 min-w-0" },
                    React.createElement("span", { className: "px-2 py-0.5 rounded-md bg-brand-orange/15 text-brand-orange font-black text-[10px] sm:text-[11px] uppercase tracking-wider shrink-0" },
                        `Langkah ${activeSection + 1}/${SECTION_DEFS.length}`
                    ),
                    React.createElement("h2", { className: "font-black text-slate-800 text-xs sm:text-sm truncate" },
                        SECTION_DEFS[activeSection]?.title
                    )
                ),
                React.createElement("span", { className: "text-[11px] font-bold text-slate-400 shrink-0 ml-2" },
                    `${progress}% selesai`
                )
            ),
            // Progress Bar Line at bottom of header
            React.createElement("div", { className: "absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden" },
                React.createElement("div", {
                    className: "h-full bg-brand-teal transition-all duration-500 ease-out",
                    style: { width: `${progress}%` }
                })
            )
        ),

        // Main Form Content Card
        React.createElement("div", { className: "max-w-4xl mx-auto w-full px-3 sm:px-6 pt-4 pb-36 flex-1" },
            React.createElement("div", { className: "bg-white rounded-[28px] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-3 sm:p-8 transition-all" },
                React.createElement("div", { key: SECTION_DEFS[activeSection]?.id || activeSection, className: "fade-in" },
                    screens[activeSection]
                )
            )
        ),

        // Section Bottom Navbar (Direct Switch between Sections)
        React.createElement("div", { className: "rbv-form-dock-container" },
            React.createElement("nav", { className: "rbv-form-bottom-dock", "aria-label": "Navigasi section form" },
                // Previous button
                React.createElement("button", {
                    type: "button",
                    onClick: () => {
                        if (activeSection <= 0) onDashboard();
                        else goSection(activeSection - 1);
                    },
                    className: "rbv-form-nav-btn rbv-form-prev-btn",
                    title: activeSection <= 0 ? "Kembali ke Dashboard" : "Bagian Sebelumnya",
                    "aria-label": "Sebelumnya"
                },
                    React.createElement(Icon, { name: activeSection <= 0 ? "home" : "left", className: "w-4 h-4 sm:w-4 sm:h-4" }),
                    React.createElement("span", { className: "hidden md:inline text-xs font-bold" }, activeSection <= 0 ? "Home" : "Prev")
                ),

                // 5 Section Tabs
                React.createElement("div", { className: "rbv-form-sections-row" },
                    SECTION_DEFS.map((sec, idx) => {
                        const isActive = idx === activeSection;
                        const secProgress = visitProgress(visit, idx);
                        const isComplete = secProgress === 100;

                        const shortLabels = ['Setup', 'Info', 'QSC', 'Observasi', 'Evidence'];
                        const iconNames = ['store', 'home', 'spark', 'clipboard', 'camera'];

                        return React.createElement("button", {
                            key: sec.id || idx,
                            type: "button",
                            onClick: () => goSection(idx),
                            className: cx("rbv-form-sec-tab", isActive && "active", isComplete && "complete"),
                            title: `${sec.title} (${secProgress}%)`,
                            "aria-label": sec.title
                        },
                            React.createElement("div", { className: "rbv-form-tab-icon-wrap" },
                                React.createElement(Icon, {
                                    name: iconNames[idx] || sec.icon || 'clipboard',
                                    className: "rbv-form-tab-icon",
                                    strokeWidth: isActive ? 2.5 : 2
                                }),
                                isComplete && React.createElement("span", { className: "rbv-form-check-badge", title: "Selesai" }, "\u2713")
                            ),
                            React.createElement("span", { className: "rbv-form-tab-label" },
                                React.createElement("span", { className: "hidden lg:inline mr-0.5 opacity-70" }, `${idx + 1}.`),
                                shortLabels[idx] || sec.label || sec.title
                            )
                        );
                    })
                ),

                // Next / Selesai button
                React.createElement("button", {
                    type: "button",
                    onClick: () => {
                        if (activeSection >= SECTION_DEFS.length - 1) onPreview();
                        else goSection(activeSection + 1);
                    },
                    className: cx(
                        "rbv-form-nav-btn rbv-form-next-btn",
                        activeSection >= SECTION_DEFS.length - 1 ? "is-finish" : "is-next"
                    ),
                    title: activeSection >= SECTION_DEFS.length - 1 ? "Selesai & Buka Preview PDF" : "Bagian Selanjutnya",
                    "aria-label": "Selanjutnya"
                },
                    React.createElement("span", { className: "hidden md:inline text-xs font-black" },
                        activeSection >= SECTION_DEFS.length - 1 ? "Selesai" : "Lanjut"
                    ),
                    React.createElement(Icon, {
                        name: activeSection >= SECTION_DEFS.length - 1 ? "pdf" : "right",
                        className: "w-4 h-4 sm:w-4 sm:h-4"
                    })
                )
            )
        )
    ));
}

function CoffeePopup({ open, onClose }) {
  if (!open) return null;
  return React.createElement("div", { className: "fixed inset-0 z-[90] grid place-items-center bg-slate-950/70 p-5 backdrop-blur-sm", role: "dialog", "aria-modal": "true" },
    React.createElement("div", { className: "w-full max-w-sm rounded-[32px] bg-white p-6 shadow-2xl text-center", style: { animation: 'rbvWelcomeTextIn .4s ease-out' } },
      React.createElement("div", { className: "mb-4 text-6xl" }, "\u2615"),
      React.createElement("h2", { className: "text-2xl font-black text-slate-950 mb-2" }, "Traktir Kopi Dulu?"),
      React.createElement("p", { className: "text-slate-600 mb-6 text-sm font-medium leading-relaxed" }, "Dukung pengembangan aplikasi ini dengan traktir saya segelas kopi. Bantuan Anda sangat berarti!"),
      React.createElement("div", { className: "flex flex-col gap-3" },
        React.createElement("a", { href: "https://trakteer.id/", target: "_blank", rel: "noopener noreferrer", onClick: onClose, className: "btn btn-primary w-full text-center" }, "Traktir Sekarang"),
        React.createElement("button", { type: "button", onClick: onClose, className: "font-bold text-slate-500 py-3 hover:text-slate-800 transition-colors" }, "Nanti")
      )
    )
  );
}
function App() {
    const [screen, setScreen] = useState('dashboard');
    const [updateAvailable, setUpdateAvailable] = useState(false);
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
    const [adminUser, setAdminUser] = useState(() => typeof isAdminUser === 'function' ? isAdminUser() : false);
    const [adminMode, setAdminMode] = useState(() => typeof isAdminUser === 'function' ? isAdminUser() : false);
    const [presenceRows, setPresenceRows] = useState(() => typeof readLocalPresenceRows === 'function' ? readLocalPresenceRows() : []);

    useEffect(() => {
        const handleAdminChange = () => {
            const isAdmin = typeof isAdminUser === 'function' ? isAdminUser() : false;
            setAdminUser(isAdmin);
            if (isAdmin) setAdminMode(true);
        };
        window.addEventListener('rbv-admin-niks-change', handleAdminChange);
        window.addEventListener('rbv-bestie-login-change', handleAdminChange);
        return () => {
            window.removeEventListener('rbv-admin-niks-change', handleAdminChange);
            window.removeEventListener('rbv-bestie-login-change', handleAdminChange);
        };
    }, []);

    useEffect(() => {
        if (!('geolocation' in navigator)) return;
        const captureGps = () => {
            const login = typeof readBestieLogin === 'function' ? readBestieLogin() : null;
            if (!login?.nik) return;
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    if (pos && pos.coords && typeof recordBestieLiveGps === 'function') {
                        recordBestieLiveGps({
                            nik: login.nik,
                            name: login.name,
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                            accuracy: Math.round(pos.coords.accuracy || 0),
                            activeStore: visit?.store,
                            storeCode: visit?.storeCode,
                            visitId: visit?.id,
                            progress: typeof visitProgress === 'function' ? visitProgress(visit) : 0
                        });
                    }
                },
                (err) => {},
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
            );
        };
        captureGps();
        const timer = setInterval(captureGps, 25000);
        return () => clearInterval(timer);
    }, [visit?.id, visit?.store, typeof visitProgress === 'function' ? visitProgress(visit) : 0]);
    const [welcomeOpen, setWelcomeOpen] = useState(() => {
        try {
            return sessionStorage.getItem(WELCOME_SEEN_KEY) !== '1';
        }
        catch (error) {
            return true;
        }
    });

    async function forceUpdateApp() {
        if ('serviceWorker' in navigator) {
            try {
                const regs = await navigator.serviceWorker.getRegistrations();
                for (let reg of regs) { await reg.unregister(); }
            } catch (e) {}
        }
        if ('caches' in window) {
            try {
                const keys = await caches.keys();
                await Promise.all(keys.map(key => caches.delete(key)));
            } catch (e) {}
        }
        window.location.reload(true);
    }

    const secretTapRef = useRef({ count: 0, timer: null });
  const [coffeeOpen, setCoffeeOpen] = useState(false);
  useEffect(() => {
    let dismissed = false;
    try { dismissed = sessionStorage.getItem('coffee_dismissed') === '1'; } catch (e) {}
    if (!welcomeOpen && !dismissed) {
      if (screen === 'dashboard' || screen === 'preview') {
        const timer = setTimeout(() => setCoffeeOpen(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [welcomeOpen, screen]);
  function closeCoffee() {
    try { sessionStorage.setItem('coffee_dismissed', '1'); } catch (error) {}
    setCoffeeOpen(false);
  }

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
        const syncSched = () => setScheduleConfig(readScheduleConfig());
        window.addEventListener('rbv-master-store-change', bump);
        window.addEventListener('rbv-schedule-config-change', syncSched);
        window.addEventListener('storage', bump);
        return () => {
            window.removeEventListener('rbv-master-store-change', bump);
            window.removeEventListener('rbv-schedule-config-change', syncSched);
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
            const incoming = rows?.rows || rows?.data || rows;
            if (cancelled || !Array.isArray(incoming) || !incoming.length)
                return;
            const current = getEffectiveMasterStores();
            if (current && current.length === incoming.length) {
                const firstCur = current[0];
                const firstInc = incoming[0];
                if (firstCur && firstInc && (firstCur.siteCode4 || firstCur.siteCode) === (firstInc.siteCode4 || firstInc.siteCode || firstInc.code)) {
                    const lastCur = current[current.length - 1];
                    const lastInc = incoming[incoming.length - 1];
                    if (lastCur && lastInc && (lastCur.siteCode4 || lastCur.siteCode) === (lastInc.siteCode4 || lastInc.siteCode || lastInc.code)) {
                        return; // Already up to date, skip redundant processing!
                    }
                }
            }
            saveLocalMasterStores(incoming, { replace: true });
            console.info(`Master data toko diterapkan dari remote: ${incoming.length} baris.`);
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
                    unsubscribe = await subscribeConvexQuery(getConvexConfig().appConfigListQuery || 'appSettings:listConfigs', { keys: [APP_CONFIG_KEYS.welcome, APP_CONFIG_KEYS.updateNotice, APP_CONFIG_KEYS.emailTemplate, APP_CONFIG_KEYS.webSync, APP_CONFIG_KEYS.schedule, APP_CONFIG_KEYS.features, APP_CONFIG_KEYS.besties] }, (rows) => { if (!cancelled)
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
                const latest = String(info.version || info.build || APP_BUILD_VERSION).trim();
                if (!latest)
                    return;
                localStorage.setItem(APP_VERSION_KEY, latest);
                if (latest !== APP_BUILD_VERSION) {
                    setUpdateAvailable(true);
                    await clearAppCachesForNewBuild(latest);
                }
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
        window._rbvActiveVisitContext = {
            storeName: visit.storeName || visit.store || 'FamilyMart',
            storeCode: visit.storeCode || 'FMI',
            location: visit.location || null
        };
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
    function handleLogout() {
        const login = typeof readBestieLogin === 'function' ? readBestieLogin() : null;
        const msg = login?.name ? `Keluar / Logout dari akun ${login.name}?` : 'Keluar / Logout dari akun Bestie?';
        if (confirm(msg)) {
            if (typeof clearBestieLogin === 'function') {
                clearBestieLogin();
            }
            setAdminMode(false);
            setAdminUser(false);
            setWelcomeOpen(true);
            setScreen('dashboard');
        }
    }

    let content;
    if (adminUser && adminMode) {
        content = React.createElement(AdminCommandCenter, {
            onSwitchToFieldMode: () => setAdminMode(false),
            onOpenSecretPanel: () => setSecretOpen(true),
            history: history,
            presenceRows: presenceRows,
            scheduleConfig: scheduleConfig,
            onNewVisit: () => setNewVisitOpen(true), onLogout: handleLogout
        });
    }
    else if (['dashboard', 'analytics', 'utility', 'schedule'].includes(screen)) {
        content = React.createElement(DashboardPage, { activeTab: screen === "dashboard" ? "home" : screen, onTabChange: navigateScreen, history: history, storageLabel: storageLabel, onNewVisit: () => setNewVisitOpen(true), onQuickVisit: (storeName) => createNewVisit(readBestieLogin()?.name || '', storeName), onOpenVisit: openVisit, onDeleteVisit: deleteVisit, onClearHistory: clearAllHistory, onTitleTap: handleTitleTap, onToggleFeedback: toggleVisitFeedback, scheduleConfig: scheduleConfig, onLogout: handleLogout });
    }
    else if (screen === 'preview') {
        content = React.createElement(PreviewPage, { visit: visit, update: updateVisit, onBack: () => navigateScreen('audit') });
    }
    else {
        content = React.createElement(VisitWorkspace, { visit: visit, update: updateVisit, activeSection: activeSection, goSection: goSection, onPreview: openPreviewScreen, onDashboard: () => setScreen('dashboard'), masterStoreRevision: masterStoreRevision });
    }
    return (React.createElement("div", { className: "audit-shell min-h-screen flex flex-col bg-slate-50 relative pb-20 lg:pb-24" },
        React.createElement("div", { className: "flex min-h-screen min-w-0 flex-1 flex-col" },
            // Return to Admin Command Center button when admin is in field mode
            adminUser && !adminMode && !['audit', 'preview'].includes(screen) ? (
                React.createElement("div", { className: "fixed top-3 right-4 z-50 animate-pulse" },
                    React.createElement("button", {
                        type: "button",
                        onClick: () => setAdminMode(true),
                        className: "flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-xl shadow-blue-500/30 border border-blue-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    },
                        React.createElement("span", null, "🛡️"),
                        React.createElement("span", null, "Kembali ke Command Center")
                    )
                )
            ) : null,
            !['audit', 'preview'].includes(screen) && !welcomeOpen && !(adminUser && adminMode) ? React.createElement(MobileTopBar, { screen: screen, setScreen: navigateScreen, visit: visit, activeSection: activeSection, goSection: goSection, onNewVisit: () => setNewVisitOpen(true), onTitleTap: handleTitleTap }) : null,
            React.createElement("div", { className: "min-w-0 flex-1" }, content),
            !['audit', 'preview'].includes(screen) && !welcomeOpen && !(adminUser && adminMode) ? React.createElement(AppBottomNav, { screen: screen, setScreen: navigateScreen, visit: visit, onNewVisit: () => setNewVisitOpen(true), onClearData: clearCurrentData, onTitleTap: handleTitleTap }) : null),
        welcomeOpen ? React.createElement(WelcomeOverlay, { config: welcomeConfig, onDone: closeWelcome }) : null,
                React.createElement(NewVisitModal, { key: 'new-visit-' + masterStoreRevision, open: newVisitOpen, onClose: () => setNewVisitOpen(false), onCreate: createNewVisit }),
        React.createElement(CoffeePopup, { open: coffeeOpen, onClose: closeCoffee }),
        React.createElement(SecretPinModal, { open: pinOpen, onClose: () => setPinOpen(false), onUnlock: () => { setPinOpen(false); setSecretOpen(true); } }),
        React.createElement(SecretMonitorPanel, { open: secretOpen, onClose: () => setSecretOpen(false), history: history, welcomeConfig: welcomeConfig, onWelcomeConfigChange: applyWelcomeConfig, scheduleConfig: scheduleConfig, onScheduleConfigChange: setScheduleConfig })));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App, null));
