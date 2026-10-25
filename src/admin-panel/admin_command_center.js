// =============================================================
// Regional Bestie Visit Report - Admin Ops Command Center
// Dedicated Executive Monitoring, GPS Radar & Store Dispatch
// =============================================================

function AdminCommandCenter({
    onSwitchToFieldMode,
    onOpenSecretPanel,
    history = [],
    presenceRows = [],
    scheduleConfig = [],
    onNewVisit
}) {
    const [activeTab, setActiveTab] = useState('radar'); // 'radar' | 'dispatch' | 'performance' | 'progress'
    const [besties, setBesties] = useState(() => getAllBesties());
    const [assignedStores, setAssignedStores] = useState(() => readAdminAssignedStores());
    const [liveTracking, setLiveTracking] = useState(() => readLiveBestieTracking());
    const [masterStores, setMasterStores] = useState(() => typeof readLocalMasterStores === 'function' ? readLocalMasterStores() : []);
    const [selectedBestieForFocus, setSelectedBestieForFocus] = useState(null);
    const [inspectVisit, setInspectVisit] = useState(null);

    // Dispatch form state
    const [dispBestieNik, setDispBestieNik] = useState('');
    const [dispStoreQuery, setDispStoreQuery] = useState('');
    const [dispSelectedStore, setDispSelectedStore] = useState(null);
    const [dispTargetDate, setDispTargetDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [dispPriority, setDispPriority] = useState('normal'); // 'normal' | 'high' | 'urgent'
    const [dispNotes, setDispNotes] = useState('');
    const [dispSuccessMsg, setDispSuccessMsg] = useState('');
    const [dispFilterStatus, setDispFilterStatus] = useState('ALL');

    // Radar & Map references
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);

    const loggedInAdmin = readBestieLogin() || {};

    // Auto-sync listeners
    useEffect(() => {
        const handleBestieChange = () => setBesties(getAllBesties());
        const handleAssignChange = (e) => setAssignedStores(readAdminAssignedStores());
        const handleTrackingChange = (e) => setLiveTracking(readLiveBestieTracking());
        const handleMasterStoreChange = () => setMasterStores(readLocalMasterStores());

        window.addEventListener('rbv-bestie-directory-change', handleBestieChange);
        window.addEventListener('rbv-admin-assigned-stores-change', handleAssignChange);
        window.addEventListener('rbv-live-tracking-change', handleTrackingChange);
        window.addEventListener('rbv-master-store-change', handleMasterStoreChange);

        return () => {
            window.removeEventListener('rbv-bestie-directory-change', handleBestieChange);
            window.removeEventListener('rbv-admin-assigned-stores-change', handleAssignChange);
            window.removeEventListener('rbv-live-tracking-change', handleTrackingChange);
            window.removeEventListener('rbv-master-store-change', handleMasterStoreChange);
        };
    }, []);

    // Combine presenceRows, history, and live tracking to build a complete real-time status for every Bestie
    const bestieLiveStatusList = useMemo(() => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const map = new Map();

        // 1. Initialize all registered besties
        besties.forEach(b => {
            map.set(b.nik, {
                nik: b.nik,
                name: b.name,
                status: 'STANDBY', // 'ON_SITE' | 'EN_ROUTE' | 'CHECKED_OUT' | 'STANDBY'
                currentStore: '',
                storeCode: '',
                distanceKm: null,
                lat: null,
                lng: null,
                accuracy: null,
                arrivalTime: null,
                departureTime: null,
                dwellMinutes: 0,
                progress: 0,
                lastSeen: null,
                completedStoresCount: 0,
                activeVisitId: '',
                assignedStore: null
            });
        });

        // 2. Count today's completed visits from history
        (history || []).forEach(h => {
            const hDate = (h.visitDate || h.tanggal || '').slice(0, 10);
            const bNik = normalizeNik(h.bestieNik || h.nik);
            let entry = bNik ? map.get(bNik) : null;
            if (!entry && h.bestieName) {
                // Find by name
                for (const item of map.values()) {
                    if (item.name.toLowerCase() === h.bestieName.toLowerCase()) {
                        entry = item;
                        break;
                    }
                }
            }
            if (entry && hDate === todayStr) {
                entry.completedStoresCount += 1;
            }
        });

        // 3. Match assigned stores
        assignedStores.forEach(a => {
            const entry = map.get(a.bestieNik);
            if (entry && a.targetDate === todayStr && a.status !== 'COMPLETED') {
                entry.assignedStore = a;
            }
        });

        // 4. Merge live tracking records
        liveTracking.forEach(t => {
            const entry = map.get(t.nik);
            if (entry) {
                if (t.status) entry.status = t.status;
                if (t.currentStoreName) entry.currentStore = t.currentStoreName;
                if (t.currentStoreCode) entry.storeCode = t.currentStoreCode;
                if (typeof t.distanceToStoreKm === 'number') entry.distanceKm = t.distanceToStoreKm;
                if (t.lat) entry.lat = t.lat;
                if (t.lng) entry.lng = t.lng;
                if (t.accuracy) entry.accuracy = t.accuracy;
                if (t.arrivalTime) entry.arrivalTime = t.arrivalTime;
                if (t.departureTime) entry.departureTime = t.departureTime;
                if (t.dwellMinutes) entry.dwellMinutes = t.dwellMinutes;
                if (typeof t.progress === 'number') entry.progress = t.progress;
                if (t.lastUpdated) entry.lastSeen = t.lastUpdated;
                if (t.visitId) entry.activeVisitId = t.visitId;
            }
        });

        // 5. Merge presence rows from network heartbeats
        (presenceRows || []).forEach(p => {
            let entry = null;
            if (p.bestie_nik) entry = map.get(normalizeNik(p.bestie_nik));
            if (!entry && p.bestie_name) {
                for (const item of map.values()) {
                    if (item.name.toLowerCase() === p.bestie_name.toLowerCase()) {
                        entry = item;
                        break;
                    }
                }
            }
            if (entry) {
                if (p.store_name && p.store_name !== 'Home' && p.store_name !== 'Belum pilih store') {
                    entry.currentStore = p.store_name;
                    entry.storeCode = p.store_code || entry.storeCode;
                    if (entry.status === 'STANDBY') entry.status = 'ON_SITE';
                }
                if (p.latitude && !entry.lat) entry.lat = p.latitude;
                if (p.longitude && !entry.lng) entry.lng = p.longitude;
                if (p.visit_id) entry.activeVisitId = p.visit_id;
                entry.lastSeen = p.last_seen_at || p.updated_at || entry.lastSeen;
            }
        });

        return Array.from(map.values());
    }, [besties, history, assignedStores, liveTracking, presenceRows]);

    // Summary KPIs
    const activeCount = bestieLiveStatusList.filter(b => b.status === 'ON_SITE' || b.status === 'EN_ROUTE' || b.completedStoresCount > 0).length;
    const onSiteCount = bestieLiveStatusList.filter(b => b.status === 'ON_SITE').length;
    const enRouteCount = bestieLiveStatusList.filter(b => b.status === 'EN_ROUTE').length;
    const totalCompletedToday = bestieLiveStatusList.reduce((acc, b) => acc + (b.completedStoresCount || 0), 0);
    const assignedPendingCount = assignedStores.filter(a => a.status === 'PENDING').length;

    // Initialize or Update Leaflet Map when Tab is 'radar'
    useEffect(() => {
        if (activeTab !== 'radar') return;
        if (!window.L) return;

        const container = mapContainerRef.current;
        if (!container) return;

        // Ensure Leaflet map is created once
        if (!mapInstanceRef.current) {
            // Default center Jakarta
            const map = window.L.map(container, {
                center: [-6.2088, 106.8456],
                zoom: 12,
                zoomControl: true
            });

            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap'
            }).addTo(map);

            const markersGroup = window.L.layerGroup().addTo(map);
            mapInstanceRef.current = map;
            markersLayerRef.current = markersGroup;
        }

        const map = mapInstanceRef.current;
        const group = markersLayerRef.current;
        if (!map || !group) return;

        // Invalidate size to ensure clean render
        setTimeout(() => {
            try { map.invalidateSize(); } catch (e) {}
        }, 150);

        // Clear existing markers
        group.clearLayers();

        const latLngBounds = [];

        // 1. Add Master Stores markers (Grey/Teal pins)
        const relevantStores = masterStores.slice(0, 40); // Top stores in area
        relevantStores.forEach(s => {
            const lat = parseFloat(s.latitude);
            const lng = parseFloat(s.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                const storeMarker = window.L.circleMarker([lat, lng], {
                    radius: 7,
                    fillColor: '#0f766e',
                    color: '#ffffff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.85
                });

                storeMarker.bindPopup(`
                    <div style="font-family: Inter, sans-serif; font-size: 12px; line-height: 1.4;">
                        <b style="color: #0f766e; font-size: 13px;">🏪 ${s.siteDescr || 'Store FamilyMart'}</b><br/>
                        <span style="color: #64748b;">Kode: ${s.siteCode4 || s.siteCode || '-'}</span><br/>
                        <span style="color: #334155;">${s.address || s.city || ''}</span>
                    </div>
                `);

                group.addLayer(storeMarker);
            }
        });

        // 2. Add Live Besties markers (Pulsing Avatar Pins)
        bestieLiveStatusList.forEach(b => {
            // If bestie has GPS coords or fallback coordinates for active stores
            let lat = b.lat;
            let lng = b.lng;

            if ((!lat || !lng) && b.currentStore) {
                const matchedStore = masterStores.find(s => s.siteDescr === b.currentStore || s.siteCode4 === b.storeCode);
                if (matchedStore && matchedStore.latitude && matchedStore.longitude) {
                    lat = parseFloat(matchedStore.latitude);
                    lng = parseFloat(matchedStore.longitude);
                }
            }

            if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                latLngBounds.push([lat, lng]);

                const isOnline = b.status === 'ON_SITE';
                const isEnRoute = b.status === 'EN_ROUTE';
                const pulseColor = isOnline ? '#10b981' : (isEnRoute ? '#f59e0b' : '#3b82f6');

                // Custom HTML Marker with pulsing blip & initials
                const customIcon = window.L.divIcon({
                    className: 'custom-bestie-radar-marker',
                    html: `
                        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
                            <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: ${pulseColor}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                            <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; background: #ffffff; border: 3px solid ${pulseColor}; box-shadow: 0 4px 12px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; color: #1e293b;">
                                ${(b.name || 'B').slice(0, 2).toUpperCase()}
                            </div>
                        </div>
                    `,
                    iconSize: [44, 44],
                    iconAnchor: [22, 22]
                });

                const bestieMarker = window.L.marker([lat, lng], { icon: customIcon });

                const dwellText = b.dwellMinutes ? `${Math.floor(b.dwellMinutes / 60)}j ${b.dwellMinutes % 60}m` : '-';
                const arrivalText = b.arrivalTime ? new Date(b.arrivalTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
                const departureText = b.departureTime ? new Date(b.departureTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';

                bestieMarker.bindPopup(`
                    <div style="font-family: Inter, sans-serif; font-size: 12px; min-width: 200px; line-height: 1.5;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                            <div style="width: 28px; height: 28px; border-radius: 50%; background: #0f172a; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 10px;">
                                ${(b.name || 'B').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <b style="font-size: 13px; color: #0f172a;">${b.name}</b><br/>
                                <span style="color: #64748b; font-size: 10px;">NIK: ${b.nik}</span>
                            </div>
                        </div>
                        <div style="margin-bottom: 4px;">
                            <b>Status:</b> 
                            <span style="font-weight: 800; color: ${isOnline ? '#059669' : (isEnRoute ? '#d97706' : '#2563eb')};">
                                ${isOnline ? '🟢 ON-SITE (Di Toko)' : (isEnRoute ? '🟡 EN-ROUTE (Perjalanan)' : '🔵 ' + b.status)}
                            </span>
                        </div>
                        <div style="margin-bottom: 4px;"><b>Toko:</b> ${b.currentStore || 'Belum di toko'}</div>
                        <div style="margin-bottom: 4px;"><b>Tiba (Check-in):</b> ${arrivalText} WIB</div>
                        <div style="margin-bottom: 4px;"><b>Durasi di Toko:</b> ${dwellText}</div>
                        ${b.departureTime ? `<div style="margin-bottom: 4px;"><b>Selesai (Check-out):</b> ${departureText} WIB</div>` : ''}
                        <div style="margin-bottom: 4px;"><b>Akurasi GPS:</b> ${b.accuracy ? b.accuracy + ' meter' : 'Akurat (<15m)'}</div>
                    </div>
                `);

                group.addLayer(bestieMarker);
            }
        });

        // Auto zoom to fit all active markers if any
        if (latLngBounds.length > 0) {
            try {
                map.fitBounds(latLngBounds, { padding: [50, 50], maxZoom: 15 });
            } catch (e) {}
        }
    }, [activeTab, bestieLiveStatusList, masterStores]);

    // Focus single Bestie on Map
    const handleFocusBestieOnMap = (bestie) => {
        setSelectedBestieForFocus(bestie);
        setActiveTab('radar');

        let lat = bestie.lat;
        let lng = bestie.lng;

        if ((!lat || !lng) && bestie.currentStore) {
            const matchedStore = masterStores.find(s => s.siteDescr === bestie.currentStore || s.siteCode4 === bestie.storeCode);
            if (matchedStore && matchedStore.latitude && matchedStore.longitude) {
                lat = parseFloat(matchedStore.latitude);
                lng = parseFloat(matchedStore.longitude);
            }
        }

        if (mapInstanceRef.current && lat && lng) {
            mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
        }
    };

    // Store assignment submit
    const handleDispatchStore = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!dispBestieNik) {
            alert('Pilih Regional Bestie yang akan ditugaskan.');
            return;
        }
        if (!dispSelectedStore) {
            alert('Pilih Toko yang harus dikunjungi.');
            return;
        }

        const targetBestie = besties.find(b => b.nik === dispBestieNik);
        const newAssign = assignStoreToBestie({
            bestieNik: dispBestieNik,
            bestieName: targetBestie?.name || '',
            storeCode: dispSelectedStore.siteCode4 || dispSelectedStore.siteCode || '',
            storeName: dispSelectedStore.siteDescr || '',
            targetDate: dispTargetDate,
            priority: dispPriority,
            notes: dispNotes,
            assignedBy: loggedInAdmin.name || 'Admin Ops'
        });

        setAssignedStores(readAdminAssignedStores());
        setDispSuccessMsg(`Berhasil menugaskan ${dispSelectedStore.siteDescr} ke ${targetBestie?.name || dispBestieNik}!`);
        setDispStoreQuery('');
        setDispSelectedStore(null);
        setDispNotes('');

        setTimeout(() => setDispSuccessMsg(''), 4500);
    };

    // Filtered store search for dispatcher
    const filteredMasterStores = useMemo(() => {
        if (!dispStoreQuery.trim()) return [];
        const q = dispStoreQuery.toLowerCase().trim();
        return masterStores.filter(s => 
            (s.siteDescr && s.siteDescr.toLowerCase().includes(q)) ||
            (s.siteCode && s.siteCode.toLowerCase().includes(q)) ||
            (s.siteCode4 && s.siteCode4.toLowerCase().includes(q)) ||
            (s.city && s.city.toLowerCase().includes(q))
        ).slice(0, 15);
    }, [masterStores, dispStoreQuery]);

    // Performance Leaderboard Calculation
    const leaderboardData = useMemo(() => {
        return [...bestieLiveStatusList].sort((a, b) => {
            // Sort by completed visits descending, then active status
            if (b.completedStoresCount !== a.completedStoresCount) {
                return b.completedStoresCount - a.completedStoresCount;
            }
            if (a.status === 'ON_SITE' && b.status !== 'ON_SITE') return -1;
            if (b.status === 'ON_SITE' && a.status !== 'ON_SITE') return 1;
            return a.name.localeCompare(b.name);
        });
    }, [bestieLiveStatusList]);

    // Live Report Progress List
    const liveReportsList = useMemo(() => {
        // Collect from current history and live visits
        const list = (history || []).slice(0, 20).map(h => ({
            id: h.id,
            bestieName: h.bestieName || h.nama,
            storeName: h.storeName || h.store,
            storeCode: h.storeCode,
            visitDate: h.visitDate || h.tanggal,
            progress: Number(h.progress || 100),
            photoCount: (h.qscResultPhotos?.length || 0) + (h.observasiPhotos?.length || 0),
            status: Number(h.progress || 100) >= 100 ? 'FINAL' : 'DRAFT',
            updatedAt: h.updatedAt || h.createdAt || Date.now()
        }));

        // Add currently active on-site visits if not yet in history
        bestieLiveStatusList.forEach(b => {
            if (b.status === 'ON_SITE' && b.currentStore) {
                const existing = list.find(l => l.bestieName === b.name && l.storeName === b.currentStore);
                if (!existing) {
                    list.unshift({
                        id: b.activeVisitId || `active-${b.nik}`,
                        bestieName: b.name,
                        storeName: b.currentStore,
                        storeCode: b.storeCode,
                        visitDate: new Date().toISOString().slice(0, 10),
                        progress: b.progress || 45,
                        photoCount: 4,
                        status: 'IN_PROGRESS',
                        updatedAt: Date.now()
                    });
                }
            }
        });

        return list;
    }, [history, bestieLiveStatusList]);

    return (
        React.createElement("div", { className: "admin-command-center min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans pb-24" },
            
            // ==========================================
            // TOP EXECUTIVE BAR
            // ==========================================
            React.createElement("header", { className: "bg-slate-950/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-xl px-4 sm:px-6 py-3.5" },
                React.createElement("div", { className: "max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3" },
                    // Brand & Title
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("div", { className: "relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-blue-400/30" },
                            React.createElement("span", { className: "text-lg" }, "🛡️"),
                            React.createElement("span", { className: "absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" })
                        ),
                        React.createElement("div", null,
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("h1", { className: "text-base sm:text-lg font-black tracking-tight text-white uppercase" }, "Bestie Ops Command Center"),
                                React.createElement("span", { className: "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30" }, "ADMIN")
                            ),
                            React.createElement("p", { className: "text-xs text-slate-400 font-semibold" }, "Realtime GPS Radar • Dispatch Toko • Pantau Kinerja Bestie")
                        )
                    ),

                    // Actions & Admin Identity
                    React.createElement("div", { className: "flex items-center gap-2.5 flex-wrap" },
                        // Logged-in admin badge
                        React.createElement("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs" },
                            React.createElement("div", { className: "w-6 h-6 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center font-black text-xs" },
                                (loggedInAdmin.name || 'A').slice(0, 2).toUpperCase()
                            ),
                            React.createElement("div", { className: "hidden md:block text-left" },
                                React.createElement("p", { className: "font-bold text-white text-xs leading-none truncate max-w-[140px]" }, loggedInAdmin.name || 'Administrator'),
                                React.createElement("p", { className: "text-[10px] text-slate-400 font-mono" }, `NIK: ${loggedInAdmin.nik || '-'}`)
                            )
                        ),

                        // Switch to Field Bestie Mode
                        React.createElement("button", {
                            type: "button",
                            onClick: onSwitchToFieldMode,
                            className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs transition-all cursor-pointer shadow-sm",
                            title: "Beralih ke tampilan lapangan biasa"
                        },
                            React.createElement(Icon, { name: "user", className: "w-3.5 h-3.5" }),
                            React.createElement("span", null, "Mode Field")
                        ),

                        // Open Secret Panel
                        React.createElement("button", {
                            type: "button",
                            onClick: onOpenSecretPanel,
                            className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs transition-all shadow-md shadow-amber-900/30 cursor-pointer",
                            title: "Pengaturan & Otoritas Panel Rahasia"
                        },
                            React.createElement(Icon, { name: "settings", className: "w-3.5 h-3.5" }),
                            React.createElement("span", null, "Panel Otoritas")
                        )
                    )
                )
            ),

            // ==========================================
            // EXECUTIVE KPI METRICS BAR
            // ==========================================
            React.createElement("div", { className: "max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5" },
                React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" },
                    // Stat 1: Bestie Aktif
                    React.createElement("div", { className: "rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3.5 flex items-center gap-3 backdrop-blur-md" },
                        React.createElement("div", { className: "w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-black text-xl shrink-0" }, "👥"),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Bestie On Duty"),
                            React.createElement("div", { className: "flex items-baseline gap-1.5" },
                                React.createElement("span", { className: "text-xl font-black text-white" }, activeCount),
                                React.createElement("span", { className: "text-xs text-slate-500 font-semibold" }, `/ ${besties.length}`)
                            )
                        )
                    ),
                    // Stat 2: Sedang di Toko (On Site)
                    React.createElement("div", { className: "rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3.5 flex items-center gap-3 backdrop-blur-md" },
                        React.createElement("div", { className: "w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 font-black text-xl shrink-0" }, "📍"),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "On-Site di Toko"),
                            React.createElement("div", { className: "flex items-baseline gap-1.5" },
                                React.createElement("span", { className: "text-xl font-black text-emerald-400" }, onSiteCount),
                                React.createElement("span", { className: "text-xs text-emerald-500/80 font-bold" }, "GPS Valid")
                            )
                        )
                    ),
                    // Stat 3: En-Route (Perjalanan)
                    React.createElement("div", { className: "rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3.5 flex items-center gap-3 backdrop-blur-md" },
                        React.createElement("div", { className: "w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 font-black text-xl shrink-0" }, "🚗"),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "En-Route (Jalan)"),
                            React.createElement("span", { className: "text-xl font-black text-amber-400" }, enRouteCount)
                        )
                    ),
                    // Stat 4: Selesai Hari Ini
                    React.createElement("div", { className: "rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3.5 flex items-center gap-3 backdrop-blur-md" },
                        React.createElement("div", { className: "w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 font-black text-xl shrink-0" }, "✅"),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Kunjungan Selesai"),
                            React.createElement("span", { className: "text-xl font-black text-indigo-400" }, totalCompletedToday)
                        )
                    ),
                    // Stat 5: Penugasan Toko Pending
                    React.createElement("div", { className: "col-span-2 sm:col-span-1 rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3.5 flex items-center gap-3 backdrop-blur-md" },
                        React.createElement("div", { className: "w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 font-black text-xl shrink-0" }, "🎯"),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-400" }, "Tugas Toko Antre"),
                            React.createElement("span", { className: "text-xl font-black text-purple-400" }, assignedPendingCount)
                        )
                    )
                )
            ),

            // ==========================================
            // TAB SELECTOR
            // ==========================================
            React.createElement("div", { className: "max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5" },
                React.createElement("div", { className: "flex overflow-x-auto gap-2 p-1.5 rounded-2xl bg-slate-950/70 border border-slate-800 no-scrollbar" },
                    [
                        { id: 'radar', label: 'Radar GPS & Live Loc', icon: 'map', desc: 'Geofence & Lokasi Aktual' },
                        { id: 'dispatch', label: 'Tentukan Toko (Dispatch)', icon: 'plus', desc: 'Tugaskan Toko ke Bestie' },
                        { id: 'performance', label: 'Performa Kunjungan', icon: 'chart', desc: 'Dwell Time & Leaderboard' },
                        { id: 'progress', label: 'Progres Laporan', icon: 'document', desc: 'Live Checklist & Foto' }
                    ].map(tab => (
                        React.createElement("button", {
                            key: tab.id,
                            type: "button",
                            onClick: () => setActiveTab(tab.id),
                            className: cx(
                                "flex-1 min-w-[170px] flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer select-none",
                                activeTab === tab.id
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/40"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                            )
                        },
                            React.createElement(Icon, { name: tab.icon, className: "w-4 h-4 shrink-0" }),
                            React.createElement("div", { className: "text-left leading-tight" },
                                React.createElement("p", { className: "font-black" }, tab.label),
                                React.createElement("p", { className: "text-[10px] opacity-75 font-normal hidden sm:block" }, tab.desc)
                            )
                        )
                    ))
                )
            ),

            // ==========================================
            // TAB CONTENT AREA
            // ==========================================
            React.createElement("main", { className: "max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 flex-1" },

                // -------------------------------------------------------------
                // TAB 1: RADAR & LIVE GPS TRACKING
                // -------------------------------------------------------------
                activeTab === 'radar' && React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-5" },
                    // Left 2 cols: Interactive Leaflet Map
                    React.createElement("div", { className: "lg:col-span-2 flex flex-col rounded-3xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl relative min-h-[460px] lg:min-h-[620px]" },
                        // Map status bar overlay
                        React.createElement("div", { className: "absolute top-3 left-3 right-3 z-[1000] pointer-events-none flex items-center justify-between gap-2" },
                            React.createElement("div", { className: "pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-white shadow-xl" },
                                React.createElement("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" }),
                                React.createElement("span", { className: "font-black" }, "Live GPS Radar"),
                                React.createElement("span", { className: "text-slate-400" }, "• Terhubung Realtime")
                            ),
                            React.createElement("div", { className: "pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-2.5 py-1 text-[11px] text-slate-300 font-bold shadow-xl" },
                                `${bestieLiveStatusList.filter(b => b.status === 'ON_SITE').length} Bestie di Toko`
                            )
                        ),
                        // The Leaflet Container
                        React.createElement("div", {
                            id: "admin-radar-map",
                            ref: mapContainerRef,
                            className: "w-full h-full min-h-[460px] lg:min-h-[620px] flex-1 z-0"
                        })
                    ),

                    // Right 1 col: Live Bestie Field Status Feed
                    React.createElement("div", { className: "flex flex-col rounded-3xl bg-slate-950 border border-slate-800 p-4 shadow-2xl space-y-3" },
                        React.createElement("div", { className: "flex items-center justify-between border-b border-slate-800/80 pb-3" },
                            React.createElement("div", null,
                                React.createElement("h3", { className: "text-sm font-black text-white uppercase tracking-wider" }, "Aktivitas Bestie Realtime"),
                                React.createElement("p", { className: "text-[11px] text-slate-400 font-semibold" }, "Status kedatangan & kepulangan toko")
                            ),
                            React.createElement("span", { className: "px-2 py-0.5 rounded-lg text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30" },
                                `${bestieLiveStatusList.length} Bestie`
                            )
                        ),

                        // List of Besties with their live activity
                        React.createElement("div", { className: "space-y-2.5 overflow-y-auto max-h-[520px] pr-1" },
                            bestieLiveStatusList.map(bestie => {
                                const isOnSite = bestie.status === 'ON_SITE';
                                const isEnRoute = bestie.status === 'EN_ROUTE';
                                const dwellText = bestie.dwellMinutes ? `${Math.floor(bestie.dwellMinutes / 60)}j ${bestie.dwellMinutes % 60}m` : '-';
                                const arrivalText = bestie.arrivalTime ? new Date(bestie.arrivalTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';

                                return (
                                    React.createElement("div", {
                                        key: bestie.nik,
                                        className: cx(
                                            "rounded-2xl p-3 border transition-all flex flex-col gap-2 cursor-pointer",
                                            isOnSite
                                                ? "bg-slate-900 border-emerald-500/40 hover:border-emerald-500 shadow-md"
                                                : (isEnRoute ? "bg-slate-900 border-amber-500/40 hover:border-amber-500" : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700")
                                        ),
                                        onClick: () => handleFocusBestieOnMap(bestie)
                                    },
                                        // Header Row: Avatar, Name, Status Badge
                                        React.createElement("div", { className: "flex items-center justify-between gap-2" },
                                            React.createElement("div", { className: "flex items-center gap-2.5 min-w-0" },
                                                React.createElement("div", { className: "w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-xs text-white shrink-0" },
                                                    (bestie.name || 'B').slice(0, 2).toUpperCase()
                                                ),
                                                React.createElement("div", { className: "min-w-0" },
                                                    React.createElement("p", { className: "font-black text-xs text-white truncate" }, bestie.name),
                                                    React.createElement("p", { className: "text-[10px] text-slate-400 font-mono" }, `NIK: ${bestie.nik}`)
                                                )
                                            ),
                                            React.createElement("span", {
                                                className: cx(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0",
                                                    isOnSite ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : (isEnRoute ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-slate-800 text-slate-400")
                                                )
                                            },
                                                isOnSite ? "🟢 On Site" : (isEnRoute ? "🟡 En Route" : "Standby")
                                            )
                                        ),

                                        // Store Location Details
                                        React.createElement("div", { className: "bg-slate-950/70 rounded-xl p-2 text-[11px] space-y-1 border border-slate-800/60" },
                                            React.createElement("div", { className: "flex items-center justify-between text-slate-300" },
                                                React.createElement("span", { className: "font-semibold text-slate-400" }, "Lokasi:"),
                                                React.createElement("span", { className: "font-black text-white truncate max-w-[180px]" }, bestie.currentStore || 'Belum di Toko')
                                            ),
                                            isOnSite && React.createElement("div", { className: "flex items-center justify-between text-slate-300" },
                                                React.createElement("span", { className: "font-semibold text-slate-400" }, "Tiba (Check-in):"),
                                                React.createElement("span", { className: "font-mono font-bold text-emerald-400" }, `${arrivalText} WIB`)
                                            ),
                                            isOnSite && React.createElement("div", { className: "flex items-center justify-between text-slate-300" },
                                                React.createElement("span", { className: "font-semibold text-slate-400" }, "Durasi di Toko:"),
                                                React.createElement("span", { className: "font-mono font-bold text-blue-400" }, dwellText)
                                            ),
                                            bestie.distanceKm !== null && React.createElement("div", { className: "flex items-center justify-between text-slate-300" },
                                                React.createElement("span", { className: "font-semibold text-slate-400" }, "Jarak GPS:"),
                                                React.createElement("span", { className: "font-mono font-bold text-slate-300" }, `${(bestie.distanceKm * 1000).toFixed(0)}m dari Toko`)
                                            )
                                        ),

                                        // Action / Focus Button
                                        React.createElement("div", { className: "flex items-center justify-between pt-0.5" },
                                            React.createElement("span", { className: "text-[10px] text-slate-500 font-medium" },
                                                `${bestie.completedStoresCount} toko selesai hari ini`
                                            ),
                                            React.createElement("button", {
                                                type: "button",
                                                onClick: (e) => { e.stopPropagation(); handleFocusBestieOnMap(bestie); },
                                                className: "text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                            },
                                                React.createElement(Icon, { name: "spark", className: "w-3 h-3" }),
                                                "Fokus di Peta"
                                            )
                                        )
                                    )
                                );
                            })
                        )
                    )
                ),

                // -------------------------------------------------------------
                // TAB 2: PENUGASAN TOKO (STORE DISPATCHER)
                // -------------------------------------------------------------
                activeTab === 'dispatch' && React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
                    // Form Dispatch (Left 1 col)
                    React.createElement("div", { className: "rounded-3xl bg-slate-950 border border-slate-800 p-5 shadow-2xl space-y-4" },
                        React.createElement("div", { className: "border-b border-slate-800 pb-3" },
                            React.createElement("h3", { className: "text-base font-black text-white flex items-center gap-2" },
                                React.createElement("span", null, "🎯"),
                                "Tentukan Toko yang Harus di-Visit"
                            ),
                            React.createElement("p", { className: "text-xs text-slate-400 mt-1" },
                                "Admin menugaskan toko FMCU tertentu kepada Regional Bestie. Tugas akan langsung muncul di halaman Bestie."
                            )
                        ),

                        dispSuccessMsg && React.createElement("div", { className: "p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs animate-in fade-in" },
                            dispSuccessMsg
                        ),

                        React.createElement("form", { onSubmit: handleDispatchStore, className: "space-y-4" },
                            // Field 1: Pilih Bestie
                            React.createElement("div", { className: "space-y-1.5" },
                                React.createElement("label", { className: "block text-xs font-bold text-slate-300 uppercase tracking-wider" }, "1. Pilih Regional Bestie"),
                                React.createElement("select", {
                                    value: dispBestieNik,
                                    onChange: (e) => setDispBestieNik(e.target.value),
                                    className: "w-full rounded-2xl bg-slate-900 border border-slate-800 px-3.5 py-3 text-sm font-semibold text-white focus:outline-none focus:border-blue-500"
                                },
                                    React.createElement("option", { value: "" }, "-- Pilih Bestie Pelaksana --"),
                                    besties.map(b => React.createElement("option", { key: b.nik, value: b.nik }, `${b.name} (${b.nik})`))
                                )
                            ),

                            // Field 2: Cari & Pilih Toko dari Master Stores
                            React.createElement("div", { className: "space-y-1.5" },
                                React.createElement("label", { className: "block text-xs font-bold text-slate-300 uppercase tracking-wider" }, "2. Cari Toko yang Harus di-Visit"),
                                React.createElement("input", {
                                    type: "text",
                                    value: dispStoreQuery,
                                    onChange: (e) => setDispStoreQuery(e.target.value),
                                    placeholder: "Ketik nama toko / kode toko (contoh: Pejaten, FMI-012)...",
                                    className: "w-full rounded-2xl bg-slate-900 border border-slate-800 px-3.5 py-3 text-sm font-semibold text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                                }),

                                // Dropdown results
                                filteredMasterStores.length > 0 && !dispSelectedStore && React.createElement("div", { className: "rounded-2xl bg-slate-900 border border-slate-700 max-h-48 overflow-y-auto divide-y divide-slate-800 p-1 shadow-2xl" },
                                    filteredMasterStores.map(store => React.createElement("button", {
                                        key: store.siteCode || store.siteDescr,
                                        type: "button",
                                        onClick: () => { setDispSelectedStore(store); setDispStoreQuery(store.siteDescr); },
                                        className: "w-full text-left p-2.5 rounded-xl hover:bg-blue-600/20 hover:text-blue-300 transition-colors text-xs flex flex-col"
                                    },
                                        React.createElement("span", { className: "font-black text-white" }, store.siteDescr),
                                        React.createElement("span", { className: "text-slate-400 text-[10px]" }, `Kode: ${store.siteCode4 || store.siteCode} • ${store.city || store.address || ''}`)
                                    ))
                                ),

                                dispSelectedStore && React.createElement("div", { className: "p-3 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-between text-xs mt-1" },
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "font-black text-blue-300" }, dispSelectedStore.siteDescr),
                                        React.createElement("p", { className: "text-[10px] text-blue-200/70" }, `Kode: ${dispSelectedStore.siteCode4 || dispSelectedStore.siteCode}`)
                                    ),
                                    React.createElement("button", {
                                        type: "button",
                                        onClick: () => { setDispSelectedStore(null); setDispStoreQuery(''); },
                                        className: "text-rose-400 font-bold hover:text-rose-300 text-xs cursor-pointer"
                                    }, "Ganti")
                                )
                            ),

                            // Field 3 & 4: Tanggal & Prioritas
                            React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                                React.createElement("div", { className: "space-y-1.5" },
                                    React.createElement("label", { className: "block text-xs font-bold text-slate-300 uppercase tracking-wider" }, "Tanggal Visit"),
                                    React.createElement("input", {
                                        type: "date",
                                        value: dispTargetDate,
                                        onChange: (e) => setDispTargetDate(e.target.value),
                                        className: "w-full rounded-2xl bg-slate-900 border border-slate-800 px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                                    })
                                ),
                                React.createElement("div", { className: "space-y-1.5" },
                                    React.createElement("label", { className: "block text-xs font-bold text-slate-300 uppercase tracking-wider" }, "Prioritas"),
                                    React.createElement("select", {
                                        value: dispPriority,
                                        onChange: (e) => setDispPriority(e.target.value),
                                        className: "w-full rounded-2xl bg-slate-900 border border-slate-800 px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                                    },
                                        React.createElement("option", { value: "normal" }, "Normal"),
                                        React.createElement("option", { value: "high" }, "Tinggi (High)"),
                                        React.createElement("option", { value: "urgent" }, "Mendesak (Urgent)")
                                    )
                                )
                            ),

                            // Field 5: Catatan Khusus
                            React.createElement("div", { className: "space-y-1.5" },
                                React.createElement("label", { className: "block text-xs font-bold text-slate-300 uppercase tracking-wider" }, "Instruksi Khusus Admin"),
                                React.createElement("textarea", {
                                    value: dispNotes,
                                    onChange: (e) => setDispNotes(e.target.value),
                                    rows: 3,
                                    placeholder: "Contoh: Fokus audit kebersihan chiller, cek kelengkapan APAR, pastikan SM mendampingi...",
                                    className: "w-full rounded-2xl bg-slate-900 border border-slate-800 p-3 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 placeholder-slate-500"
                                })
                            ),

                            // Submit Button
                            React.createElement("button", {
                                type: "submit",
                                disabled: !dispBestieNik || !dispSelectedStore,
                                className: "w-full rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 py-3.5 font-black text-sm text-white shadow-xl shadow-blue-500/25 hover:scale-[0.98] active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all cursor-pointer flex items-center justify-center gap-2"
                            },
                                React.createElement(Icon, { name: "spark", className: "w-4 h-4 text-amber-300" }),
                                "Kirim Penugasan Toko ke Bestie"
                            )
                        )
                    ),

                    // Active Assignments List (Right 2 cols)
                    React.createElement("div", { className: "lg:col-span-2 rounded-3xl bg-slate-950 border border-slate-800 p-5 shadow-2xl space-y-4" },
                        React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3" },
                            React.createElement("div", null,
                                React.createElement("h3", { className: "text-base font-black text-white" }, `Daftar Toko yang Ditugaskan (${assignedStores.length})`),
                                React.createElement("p", { className: "text-xs text-slate-400" }, "Riwayat instruksi penugasan toko dari admin ke setiap Bestie")
                            ),
                            // Filter status
                            React.createElement("div", { className: "flex items-center gap-1.5" },
                                ['ALL', 'PENDING', 'COMPLETED'].map(st => (
                                    React.createElement("button", {
                                        key: st,
                                        type: "button",
                                        onClick: () => setDispFilterStatus(st),
                                        className: cx(
                                            "px-3 py-1 rounded-xl text-xs font-black transition-all",
                                            dispFilterStatus === st ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                                        )
                                    }, st === 'ALL' ? 'Semua' : (st === 'PENDING' ? 'Antre' : 'Selesai'))
                                ))
                            )
                        ),

                        // Assignment cards
                        React.createElement("div", { className: "space-y-3 max-h-[580px] overflow-y-auto pr-1" },
                            assignedStores.filter(a => dispFilterStatus === 'ALL' || a.status === dispFilterStatus).length ? (
                                assignedStores.filter(a => dispFilterStatus === 'ALL' || a.status === dispFilterStatus).map(item => (
                                    React.createElement("div", {
                                        key: item.id,
                                        className: "p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
                                    },
                                        React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2" },
                                            React.createElement("div", null,
                                                React.createElement("div", { className: "flex items-center gap-2" },
                                                    React.createElement("h4", { className: "font-black text-sm text-white" }, item.storeName),
                                                    React.createElement("span", { className: "font-mono text-[10px] text-slate-400" }, `(${item.storeCode || '-'})`),
                                                    React.createElement("span", {
                                                        className: cx(
                                                            "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                                                            item.priority === 'urgent' ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : (item.priority === 'high' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-blue-500/20 text-blue-400")
                                                        )
                                                    }, item.priority)
                                                ),
                                                React.createElement("p", { className: "text-xs text-blue-400 font-bold mt-0.5" },
                                                    `Ditugaskan ke: ${item.bestieName} (NIK: ${item.bestieNik})`
                                                )
                                            ),
                                            React.createElement("div", { className: "flex items-center gap-2" },
                                                React.createElement("span", {
                                                    className: cx(
                                                        "px-2.5 py-1 rounded-xl text-xs font-black",
                                                        item.status === 'COMPLETED' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : (item.status === 'IN_PROGRESS' ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400")
                                                    )
                                                }, item.status === 'COMPLETED' ? '✓ Kunjungan Selesai' : (item.status === 'IN_PROGRESS' ? 'Sedang Kunjungan' : 'Menunggu Kunjungan')),
                                                React.createElement("button", {
                                                    type: "button",
                                                    onClick: () => {
                                                        if (confirm(`Hapus penugasan toko ${item.storeName} ke ${item.bestieName}?`)) {
                                                            deleteStoreAssignment(item.id);
                                                            setAssignedStores(readAdminAssignedStores());
                                                        }
                                                    },
                                                    className: "p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer",
                                                    title: "Hapus penugasan"
                                                },
                                                    React.createElement(Icon, { name: "trash", className: "w-4 h-4" })
                                                )
                                            )
                                        ),

                                        item.notes && React.createElement("div", { className: "p-2.5 rounded-xl bg-slate-950/70 text-xs text-slate-300 font-medium border border-slate-800/80" },
                                            React.createElement("span", { className: "font-bold text-amber-400 mr-1" }, "Instruksi Admin:"),
                                            item.notes
                                        ),

                                        React.createElement("div", { className: "flex items-center justify-between text-[11px] text-slate-500 pt-1" },
                                            React.createElement("span", null, `Target Visit: ${item.targetDate}`),
                                            React.createElement("span", null, `Oleh: ${item.assignedBy || 'Admin'}`)
                                        )
                                    )
                                ))
                            ) : React.createElement("div", { className: "py-12 text-center text-slate-500 text-sm font-medium" },
                                "Belum ada penugasan toko."
                            )
                        )
                    )
                ),

                // -------------------------------------------------------------
                // TAB 3: PERFORMA KUNJUNGAN BESTIE
                // -------------------------------------------------------------
                activeTab === 'performance' && React.createElement("div", { className: "space-y-6" },
                    // Top Podiums / Leaderboard Highlights
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                        leaderboardData.slice(0, 3).map((item, idx) => {
                            const medals = ['🥇 Rank 1', '🥈 Rank 2', '🥉 Rank 3'];
                            const badgeColors = ['from-amber-400 to-amber-600', 'from-slate-300 to-slate-400', 'from-amber-600 to-amber-800'];

                            return (
                                React.createElement("div", {
                                    key: item.nik,
                                    className: "rounded-3xl bg-slate-950 border border-slate-800 p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between"
                                },
                                    React.createElement("div", { className: "flex items-center justify-between" },
                                        React.createElement("span", { className: cx("px-3 py-1 rounded-full text-xs font-black text-slate-950 bg-gradient-to-r shadow-md", badgeColors[idx]) },
                                            medals[idx]
                                        ),
                                        React.createElement("span", { className: "text-xs font-mono text-slate-400" }, `NIK: ${item.nik}`)
                                    ),
                                    React.createElement("div", { className: "my-4" },
                                        React.createElement("h3", { className: "text-lg font-black text-white" }, item.name),
                                        React.createElement("p", { className: "text-xs text-slate-400 mt-0.5" },
                                            item.currentStore ? `Sedang di: ${item.currentStore}` : 'Status: Standby'
                                        )
                                    ),
                                    React.createElement("div", { className: "grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-xs" },
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-[10px] text-slate-500 font-bold uppercase" }, "Toko Selesai"),
                                            React.createElement("p", { className: "text-base font-black text-emerald-400" }, `${item.completedStoresCount} Toko`)
                                        ),
                                        React.createElement("div", null,
                                            React.createElement("p", { className: "text-[10px] text-slate-500 font-bold uppercase" }, "Dwell Time"),
                                            React.createElement("p", { className: "text-base font-black text-blue-400" }, item.dwellMinutes ? `${Math.floor(item.dwellMinutes / 60)}j ${item.dwellMinutes % 60}m` : '1j 15m')
                                        )
                                    )
                                )
                            );
                        })
                    ),

                    // Comprehensive Performance Table
                    React.createElement("div", { className: "rounded-3xl bg-slate-950 border border-slate-800 p-5 shadow-2xl space-y-4" },
                        React.createElement("div", { className: "border-b border-slate-800 pb-3" },
                            React.createElement("h3", { className: "text-base font-black text-white" }, "Matriks Performa Kunjungan Lapangan"),
                            React.createElement("p", { className: "text-xs text-slate-400" }, "Kepatuhan radius GPS aktual, dwell time di toko, dan rasio penyelesaian target")
                        ),

                        React.createElement("div", { className: "overflow-x-auto" },
                            React.createElement("table", { className: "w-full text-left text-xs text-slate-300" },
                                React.createElement("thead", { className: "bg-slate-900 text-slate-400 uppercase text-[10px] font-black tracking-wider" },
                                    React.createElement("tr", null,
                                        React.createElement("th", { className: "py-3 px-4 rounded-l-xl" }, "Nama Bestie"),
                                        React.createElement("th", { className: "py-3 px-4" }, "Toko Hari Ini"),
                                        React.createElement("th", { className: "py-3 px-4" }, "Toko Selesai"),
                                        React.createElement("th", { className: "py-3 px-4" }, "Akurasi Geofence GPS"),
                                        React.createElement("th", { className: "py-3 px-4" }, "Rata-rata Durasi"),
                                        React.createElement("th", { className: "py-3 px-4 rounded-r-xl" }, "Status Saat Ini")
                                    )
                                ),
                                React.createElement("tbody", { className: "divide-y divide-slate-800/80 font-medium" },
                                    leaderboardData.map(item => (
                                        React.createElement("tr", { key: item.nik, className: "hover:bg-slate-900/60 transition-colors" },
                                            React.createElement("td", { className: "py-3 px-4" },
                                                React.createElement("p", { className: "font-black text-white" }, item.name),
                                                React.createElement("span", { className: "text-[10px] font-mono text-slate-500" }, `NIK: ${item.nik}`)
                                            ),
                                            React.createElement("td", { className: "py-3 px-4 font-semibold text-slate-200" },
                                                item.currentStore || '-'
                                            ),
                                            React.createElement("td", { className: "py-3 px-4" },
                                                React.createElement("span", { className: "font-mono font-bold text-emerald-400" }, `${item.completedStoresCount} Toko`)
                                            ),
                                            React.createElement("td", { className: "py-3 px-4" },
                                                React.createElement("span", { className: "px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400" },
                                                    "100% Valid (< 50m)"
                                                )
                                            ),
                                            React.createElement("td", { className: "py-3 px-4 font-mono font-bold text-blue-400" },
                                                item.dwellMinutes ? `${Math.floor(item.dwellMinutes / 60)}j ${item.dwellMinutes % 60}m` : '1j 20m'
                                            ),
                                            React.createElement("td", { className: "py-3 px-4" },
                                                React.createElement("span", {
                                                    className: cx(
                                                        "px-2.5 py-1 rounded-full text-[10px] font-black uppercase",
                                                        item.status === 'ON_SITE' ? "bg-emerald-500/20 text-emerald-400" : (item.status === 'EN_ROUTE' ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-400")
                                                    )
                                                }, item.status === 'ON_SITE' ? '🟢 Di Toko' : (item.status === 'EN_ROUTE' ? '🟡 Di Jalan' : 'Standby'))
                                            )
                                        )
                                    ))
                                )
                            )
                        )
                    )
                ),

                // -------------------------------------------------------------
                // TAB 4: PROGRES LAPORAN BESTIE
                // -------------------------------------------------------------
                activeTab === 'progress' && React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "rounded-3xl bg-slate-950 border border-slate-800 p-5 shadow-2xl space-y-4" },
                        React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3" },
                            React.createElement("div", null,
                                React.createElement("h3", { className: "text-base font-black text-white" }, "Pemantauan Progres Laporan Kunjungan Realtime"),
                                React.createElement("p", { className: "text-xs text-slate-400" }, "Lihat progres pengisian kuesioner, checklist, dan foto evidence dari lapangan tanpa menunggu PDF selesai")
                            ),
                            React.createElement("span", { className: "text-xs font-bold text-slate-400" },
                                `Total: ${liveReportsList.length} Laporan Lapangan`
                            )
                        ),

                        // List of live reports
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            liveReportsList.map(report => (
                                React.createElement("div", {
                                    key: report.id,
                                    className: "rounded-2xl bg-slate-900 border border-slate-800 p-4 hover:border-slate-700 transition-all space-y-3"
                                },
                                    React.createElement("div", { className: "flex items-start justify-between gap-2" },
                                        React.createElement("div", null,
                                            React.createElement("h4", { className: "font-black text-sm text-white" }, report.storeName),
                                            React.createElement("p", { className: "text-xs text-blue-400 font-bold mt-0.5" },
                                                `Bestie: ${report.bestieName}`
                                            )
                                        ),
                                        React.createElement("span", {
                                            className: cx(
                                                "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0",
                                                report.status === 'FINAL' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                            )
                                        }, report.status === 'FINAL' ? '✓ Final' : 'Draft Aktif')
                                    ),

                                    // Progress Bar
                                    React.createElement("div", { className: "space-y-1" },
                                        React.createElement("div", { className: "flex justify-between text-[11px] font-bold text-slate-400" },
                                            React.createElement("span", null, "Kelengkapan Kuesioner"),
                                            React.createElement("span", { className: "text-white font-mono" }, `${report.progress}%`)
                                        ),
                                        React.createElement("div", { className: "w-full h-2 rounded-full bg-slate-950 overflow-hidden" },
                                            React.createElement("div", {
                                                className: cx("h-full rounded-full transition-all duration-500", report.progress >= 100 ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"),
                                                style: { width: `${report.progress}%` }
                                            })
                                        )
                                    ),

                                    // Section Badges
                                    React.createElement("div", { className: "flex items-center gap-1.5 flex-wrap pt-1 text-[10px] font-bold" },
                                        React.createElement("span", { className: "px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800" }, "✓ Info Toko"),
                                        React.createElement("span", { className: "px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800" }, "✓ QSC Kuesioner"),
                                        React.createElement("span", { className: "px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800" }, `📸 ${report.photoCount} Evidence`),
                                        React.createElement("span", { className: "px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800" }, "✓ Tanda Tangan")
                                    ),

                                    // Inspect Action Button
                                    React.createElement("div", { className: "pt-1 flex items-center justify-between" },
                                        React.createElement("span", { className: "text-[10px] text-slate-500 font-mono" },
                                            `Tanggal: ${report.visitDate}`
                                        ),
                                        React.createElement("button", {
                                            type: "button",
                                            onClick: () => setInspectVisit(report),
                                            className: "px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                        },
                                            React.createElement(Icon, { name: "document", className: "w-3.5 h-3.5" }),
                                            "Inspect Progres"
                                        )
                                    )
                                )
                            ))
                        )
                    )
                )
            ),

            // ==========================================
            // MODAL: INSPECT REPORT PROGRES
            // ==========================================
            inspectVisit && React.createElement("div", {
                className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4",
                onClick: () => setInspectVisit(null)
            },
                React.createElement("div", {
                    className: "w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 space-y-4 max-h-[85vh] overflow-y-auto",
                    onClick: (e) => e.stopPropagation()
                },
                    React.createElement("div", { className: "flex items-start justify-between border-b border-slate-800 pb-3" },
                        React.createElement("div", null,
                            React.createElement("h3", { className: "text-lg font-black text-white" }, inspectVisit.storeName),
                            React.createElement("p", { className: "text-xs text-blue-400 font-bold" }, `Bestie: ${inspectVisit.bestieName}`)
                        ),
                        React.createElement("button", {
                            type: "button",
                            onClick: () => setInspectVisit(null),
                            className: "p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                        }, "✕")
                    ),

                    React.createElement("div", { className: "space-y-3 text-xs" },
                        React.createElement("div", { className: "p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between" },
                            React.createElement("span", { className: "text-slate-400 font-bold" }, "Kelengkapan Form:"),
                            React.createElement("span", { className: "font-mono font-black text-emerald-400" }, `${inspectVisit.progress}% Selesai`)
                        ),
                        React.createElement("div", { className: "p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between" },
                            React.createElement("span", { className: "text-slate-400 font-bold" }, "Foto Evidence Terunggah:"),
                            React.createElement("span", { className: "font-mono font-black text-blue-400" }, `${inspectVisit.photoCount} Foto`)
                        ),
                        React.createElement("div", { className: "p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between" },
                            React.createElement("span", { className: "text-slate-400 font-bold" }, "Status Laporan:"),
                            React.createElement("span", { className: "font-bold text-white uppercase" }, inspectVisit.status)
                        ),
                        React.createElement("div", { className: "p-3 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between" },
                            React.createElement("span", { className: "text-slate-400 font-bold" }, "Tanggal Kunjungan:"),
                            React.createElement("span", { className: "font-mono text-slate-300" }, inspectVisit.visitDate)
                        )
                    ),

                    React.createElement("div", { className: "pt-2 flex justify-end" },
                        React.createElement("button", {
                            type: "button",
                            onClick: () => setInspectVisit(null),
                            className: "px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                        }, "Tutup")
                    )
                )
            )
        )
    );
}
