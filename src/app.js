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
                    React.createElement("span", { className: "ml-3 overflow-hidden whitespace-nowrap font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100" }, "Preview PDF")),
                React.createElement("button", { type: "button", className: cx('nav-item relative flex w-full items-center justify-center rounded-xl p-3 transition-colors group-hover:justify-start group-hover:px-4', screen === 'analytics' ? 'bg-slate-100 text-slate-950' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'), onClick: () => setScreen('analytics') },
                    React.createElement(Icon, { name: "chart", className: "h-5 w-5 shrink-0" }),
                    React.createElement("span", { className: "ml-3 overflow-hidden whitespace-nowrap font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100" }, "Analitik")),
                React.createElement("button", { type: "button", className: cx('nav-item relative flex w-full items-center justify-center rounded-xl p-3 transition-colors group-hover:justify-start group-hover:px-4', screen === 'utility' ? 'bg-slate-100 text-slate-950' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'), onClick: () => setScreen('utility') },
                    React.createElement(Icon, { name: "user", className: "h-5 w-5 shrink-0" }),
                    React.createElement("span", { className: "ml-3 overflow-hidden whitespace-nowrap font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100" }, "Utiliti & Profil")))),
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
function MobileBottomNav({ screen, setScreen, visit, onNewVisit, onClearData, onTitleTap }) {
    const goAudit = () => visit ? setScreen('audit') : onNewVisit();
    const goPreview = () => visit ? setScreen('preview') : onNewVisit();
    
    // Hide entirely when actively doing an audit to maximize screen space
    if (screen === 'audit') return null; 

    return React.createElement("nav", { className: "fixed bottom-0 left-0 w-full z-50 bg-white border-t border-slate-100 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.04)] lg:hidden", "aria-label": "Mobile system navigation" },
        React.createElement("div", { className: "flex justify-between items-center h-16 px-6 relative" },
            // Left side
            React.createElement("button", { type: "button", className: cx('flex flex-col items-center justify-center w-12', screen === 'dashboard' ? 'text-brand-teal' : 'text-slate-600'), onClick: () => setScreen('dashboard') },
                React.createElement(Icon, { name: "home", className: "h-6 w-6", strokeWidth: screen === 'dashboard' ? 2.5 : 2 })
            ),
            React.createElement("button", { type: "button", className: cx('flex flex-col items-center justify-center w-12', screen === 'preview' ? 'text-brand-teal' : 'text-slate-600'), onClick: goPreview },
                React.createElement(Icon, { name: "pdf", className: "h-6 w-6", strokeWidth: screen === 'preview' ? 2.5 : 2 })
            ),

            // Center FAB space
            React.createElement("div", { className: "w-16 h-16 pointer-events-none" }),

            // Floating FAB
            React.createElement("button", { type: "button", className: "absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 bg-brand-orange rounded-full text-white shadow-lg shadow-orange-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all", onClick: onNewVisit },
                React.createElement(Icon, { name: "plus", className: "h-7 w-7", strokeWidth: 3 })
            ),

            // Right side
            React.createElement("button", { type: "button", className: cx('flex flex-col items-center justify-center w-12', screen === 'analytics' ? 'text-brand-teal' : 'text-slate-600'), onClick: () => setScreen('analytics') },
                React.createElement(Icon, { name: "chart", className: "h-6 w-6", strokeWidth: screen === 'analytics' ? 2.5 : 2 })
            ),
            React.createElement("button", { type: "button", className: cx('flex flex-col items-center justify-center w-12', screen === 'utility' ? 'text-brand-teal' : 'text-slate-600'), onClick: () => setScreen('utility') },
                React.createElement(Icon, { name: "user", className: "h-6 w-6", strokeWidth: screen === 'utility' ? 2.5 : 2 })
            )
        )
    );
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
                    React.createElement("h2", { className: "text-base sm:text-xl font-black text-slate-900" }, "Form Kunjungan"),
                    React.createElement(SyncStatusBadge, null)
                ),
                React.createElement("p", { className: "text-xs font-bold text-slate-500 max-w-sm px-2 truncate" }, visit.store || 'Store belum dipilih', " \u2022 ", visit.nama || 'Bestie belum dipilih'),
                React.createElement("div", { className: "w-full max-w-[220px] mt-2 bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner" },
                    React.createElement("div", { className: "bg-gradient-to-r from-audit-secondary to-audit-primary h-2 rounded-full transition-all duration-500", style: { width: `${overallProgress}%` } })
                ),
                React.createElement("p", { className: "mt-1 text-[10px] font-extrabold text-slate-400" }, overallProgress, "% Complete")
            ),
            
            React.createElement("div", { className: "my-2 flex justify-center shrink-0" },
                React.createElement("button", {
                    type: "button",
                    onClick: () => { goSection(0); setViewMode('section'); },
                    className: "w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                },
                    React.createElement("span", null, "🚀 Mulai Isi Laporan (Wizard Flow)"),
                    React.createElement(Icon, { name: "right", className: "w-4 h-4" })
                )
            ),

            React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 flex-1 min-h-0 my-1 pt-1 pb-1" },
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
        React.createElement("div", { className: "flex items-center justify-between mb-2 sm:mb-6 pt-2 pb-2 sm:pt-2 sticky top-0 z-40 bg-slate-50 -mx-4 px-4 sm:static sm:bg-transparent sm:mx-0 sm:px-0" },
            React.createElement("button", { 
                onClick: () => setViewMode('grid'),
                className: "w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white rounded-full shadow-sm border border-slate-200 active:scale-95 text-slate-600",
                title: "Kembali ke Menu Grid"
            },
                React.createElement(Icon, { name: "left", className: "w-5 h-5" })
            ),
            React.createElement("h2", { className: "text-base sm:text-lg font-black text-slate-800 text-center flex-1 mx-3 truncate" }, SECTION_DEFS[activeSection]?.title),
            React.createElement("button", {
                type: "button",
                onClick: () => setViewMode('grid'),
                className: "px-2.5 py-1.5 rounded-xl bg-slate-200 text-slate-700 font-extrabold text-[11px] sm:hidden"
            }, "Grid")
        ),

        // Horizontal Step Chip Bar (Seamless Navigation Without Going Back to Grid)
        React.createElement("div", { className: "flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3 -mx-4 px-4 sm:mx-0 sm:px-0" },
            SECTION_DEFS.map((sec, idx) => {
                const isActive = idx === activeSection;
                const secProgress = visitProgress(visit, idx);
                const isComplete = secProgress === 100;
                return React.createElement("button", {
                    key: idx,
                    type: "button",
                    onClick: () => goSection(idx),
                    className: cx(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs whitespace-nowrap transition-all border shrink-0 cursor-pointer",
                        isActive
                            ? "bg-audit-primary text-white border-audit-primary shadow-sm scale-105"
                            : isComplete
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )
                },
                    React.createElement("span", null, `${idx + 1}. `),
                    React.createElement("span", null, sec.title),
                    isComplete && !isActive && React.createElement("span", { className: "text-emerald-500 font-black" }, "✓")
                );
            })
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
            React.createElement("div", { key: SECTION_DEFS[activeSection]?.id || activeSection, className: "fade-in" }, screens[activeSection])),

        // Sticky Mobile Bottom Wizard Navigation Bar (Eliminates "Keluar Masuk Grid")
        React.createElement("div", {
            className: "fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-[0_-4px_16px_rgb(0,0,0,0.06)] flex items-center justify-between gap-2 sm:hidden",
            style: { paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))' }
        },
            React.createElement("button", {
                type: "button",
                onClick: () => {
                    if (activeSection <= 0) setViewMode('grid');
                    else goSection(activeSection - 1);
                },
                className: "flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs active:scale-95 transition-all"
            },
                React.createElement(Icon, { name: "left", className: "w-4 h-4" }),
                React.createElement("span", null, activeSection <= 0 ? "Grid" : "Prev")
            ),
            React.createElement("div", { className: "flex flex-col items-center justify-center text-center min-w-0" },
                React.createElement("span", { className: "text-[11px] font-black text-slate-800 truncate" },
                    `Step ${activeSection + 1}/${SECTION_DEFS.length}`
                ),
                React.createElement("span", { className: "text-[9px] font-extrabold uppercase text-audit-primary" },
                    `${progress}% Selesai`
                )
            ),
            React.createElement("button", {
                type: "button",
                onClick: () => {
                    if (activeSection >= SECTION_DEFS.length - 1) onPreview();
                    else goSection(activeSection + 1);
                },
                className: cx(
                    "flex items-center gap-1 px-3.5 py-2 rounded-xl font-extrabold text-xs text-white shadow-sm active:scale-95 transition-all",
                    activeSection >= SECTION_DEFS.length - 1 ? "bg-emerald-600 hover:bg-emerald-700" : "bg-audit-primary hover:bg-audit-primary-hover"
                )
            },
                React.createElement("span", null, activeSection >= SECTION_DEFS.length - 1 ? "Preview PDF" : "Next"),
                React.createElement(Icon, { name: activeSection >= SECTION_DEFS.length - 1 ? "pdf" : "right", className: "w-4 h-4" })
            )
        )
            
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
    let content;
    if (['dashboard', 'analytics', 'utility'].includes(screen)) {
        content = React.createElement(DashboardPage, { activeTab: screen === "dashboard" ? "home" : screen, onTabChange: navigateScreen, history: history, storageLabel: storageLabel, onNewVisit: () => setNewVisitOpen(true), onQuickVisit: (storeName) => createNewVisit(readBestieLogin()?.name || '', storeName), onOpenVisit: openVisit, onDeleteVisit: deleteVisit, onClearHistory: clearAllHistory, onTitleTap: handleTitleTap, onToggleFeedback: toggleVisitFeedback, scheduleConfig: scheduleConfig });
    }
    else if (screen === 'preview') {
        content = React.createElement(PreviewPage, { visit: visit, update: updateVisit, onBack: () => navigateScreen('audit') });
    }
    else {
        content = React.createElement(VisitWorkspace, { visit: visit, update: updateVisit, activeSection: activeSection, goSection: goSection, onPreview: openPreviewScreen, onDashboard: () => setScreen('dashboard'), masterStoreRevision: masterStoreRevision });
    }
    return (React.createElement("div", { className: "audit-shell min-h-screen lg:flex lg:flex-row bg-slate-50" },
        !['audit', 'preview'].includes(screen) ? React.createElement(DesktopSidebar, { screen: screen, setScreen: navigateScreen, visit: visit, activeSection: activeSection, goSection: goSection, onNewVisit: () => setNewVisitOpen(true), onClearData: clearCurrentData, onTitleTap: handleTitleTap }) : null,
        React.createElement("div", { className: "flex min-h-screen min-w-0 flex-1 flex-col" },
            !['audit', 'preview'].includes(screen) && !welcomeOpen ? React.createElement(MobileTopBar, { screen: screen, setScreen: navigateScreen, visit: visit, activeSection: activeSection, goSection: goSection, onNewVisit: () => setNewVisitOpen(true), onTitleTap: handleTitleTap }) : null,
            React.createElement("div", { className: "min-w-0 flex-1" }, content),
            !['audit', 'preview'].includes(screen) && !welcomeOpen ? React.createElement(MobileBottomNav, { screen: screen, setScreen: navigateScreen, visit: visit, onNewVisit: () => setNewVisitOpen(true), onClearData: clearCurrentData }) : null),
        welcomeOpen ? React.createElement(WelcomeOverlay, { config: welcomeConfig, onDone: closeWelcome }) : null,
        React.createElement(NewVisitModal, { key: 'new-visit-' + masterStoreRevision, open: newVisitOpen, onClose: () => setNewVisitOpen(false), onCreate: createNewVisit }),
        React.createElement(SecretPinModal, { open: pinOpen, onClose: () => setPinOpen(false), onUnlock: () => { setPinOpen(false); setSecretOpen(true); } }),
        React.createElement(SecretMonitorPanel, { open: secretOpen, onClose: () => setSecretOpen(false), history: history, welcomeConfig: welcomeConfig, onWelcomeConfigChange: applyWelcomeConfig, scheduleConfig: scheduleConfig, onScheduleConfigChange: setScheduleConfig })));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App, null));
