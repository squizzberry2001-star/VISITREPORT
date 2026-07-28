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
    return (React.createElement("div", { className: "grid gap-4 sm:gap-4 sm:p-5" },
        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
            React.createElement("div", { className: "surface-card rounded-[28px] p-4 sm:p-5" },
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
            React.createElement("div", { className: "surface-card rounded-[28px] p-4 sm:p-5" },
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
        React.createElement("div", { className: "surface-card rounded-[28px] p-4 sm:p-4 sm:p-5 md:p-6" },
            React.createElement("div", { className: "mb-5" },
                React.createElement("h3", { className: "text-lg font-extrabold text-slate-950" }, "Crew Store")),
            React.createElement("div", { className: "grid gap-3" }, crewList.map((crew, index) => (React.createElement("div", { key: index, className: "grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 grid-cols-[44px_1fr] sm:grid-cols-[44px_1fr_130px_44px] items-end" },
                React.createElement("div", { className: "grid h-11 w-11 place-items-center rounded-2xl bg-white text-sm font-black text-slate-600 shadow-sm" }, index + 1),
                React.createElement(Field, { label: "Nama Crew" },
                    React.createElement(TextInput, { value: crew.name || '', onChange: (e) => updateCrew(index, { name: e.target.value }), placeholder: "Nama crew" })),
                React.createElement("div", { className: "col-start-2 sm:col-start-3" }, 
                    React.createElement(Field, { label: "Level" },
                        React.createElement(SelectInput, { value: crew.level || '', onChange: (e) => updateCrew(index, { level: e.target.value }) }, JOB_LEVELS.map((level) => React.createElement("option", { key: level, value: level }, level || 'Pilih'))))),
                React.createElement(Button, { variant: "icon", onClick: () => removeCrew(index), className: "h-11 w-11 border border-slate-200 bg-white sm:bg-transparent sm:border-transparent sm:h-10 sm:w-10 !p-0 grid place-items-center rounded-xl", "aria-label": "Hapus crew" },
                    React.createElement(Icon, { name: "trash", className: "h-4 w-4 text-rose-500" })))))),
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


const RBV_OBSERVATION_PRESETS = [
    {
        label: '🔴 Tidak Ada ROX / Expired Date',
        category: 'QSC',
        temuan: 'Tidak ada rox pada bahan sisa buka kemasan (cranberry, cashew, coffee jelly, BBQ, sauce, powder, dll)',
        dampak: 'Potensi penggunaan bahan yang sudah melewati batas layak konsumsi atau kedaluwarsa karena tidak terpantau masa simpannya',
        kondisiIdeal: 'Semua produk yang sudah dibuka wajib di rox',
        tindakan: 'Melakukan briefing ulang mengenai pentingnya food safety dan standar rox kepada crew',
        penyebab: 'Kurangnya kedisiplinan crew dalam melakukan rox segera setelah produk dibuka',
        hasil: 'Akan di monitoring visit berikutnya'
    },
    {
        label: '🔴 Toilet Kotor / Form Check Tidak Ada',
        category: 'QSC',
        temuan: 'Toilet kotor, tidak ada handsoap dan form check toilet',
        dampak: 'Mengganggu kenyamanan customer',
        kondisiIdeal: 'Toilet terawat dan dikontrol secara berkala',
        tindakan: 'Buat form checklist toilet dan monitoring dari store leader',
        penyebab: 'Form toilet tidak ada dan tidak ada monitoring dari store leader / shift leader',
        hasil: 'Akan di monitoring visit selanjutnya'
    },
    {
        label: '🔴 Gondola Berantakan & Price Card Kotor',
        category: 'QSC',
        temuan: 'Gondola berantakan beserta price card dan area kotor',
        dampak: 'Menurunkan kenyamanan customer dan potensi kesalahan harga',
        kondisiIdeal: 'Gondola tertata rapi sesuai planogram, price card dipasang dengan tepat sesuai dengan produknya dan lantai dalam keadaan bersih',
        tindakan: 'Menetapkan jadwal pembersihan gondola dan pengecekan kerapihan gondola secara berkala',
        penyebab: 'Kurangnya pengawasan dari store leader',
        hasil: 'Akan di monitoring visit berikutnya'
    },
    {
        label: '🔴 Logbook Tidak Diisi PIC',
        category: 'QSC',
        temuan: 'Logbook tidak diisi dari awal shift / awal go',
        dampak: 'Data tidak bisa dijadikan acuan',
        kondisiIdeal: 'Form logbook diisi dengan konsisten dan secara aktual',
        tindakan: 'Briefing dan monitoring oleh PIC untuk pengisian logbook',
        penyebab: 'Kurang monitoring dari PIC, logbook hanya tergeletak',
        hasil: 'Akan di monitoring visit berikutnya'
    },
    {
        label: '🔴 Equipment Berdebu (Grill Sosis/Chiller/Ice Cream)',
        category: 'QSC',
        temuan: 'Equipment berdebu (pinggir grill sosis, tutup mesin ice cream, atau chiller)',
        dampak: 'Estetika toko menurun, risiko kontaminasi debu pada produk',
        kondisiIdeal: 'Seluruh permukaan dan bagian equipment dalam keadaan bersih bebas dari debu',
        tindakan: 'Melakukan pembersihan menyeluruh pada area yang berdebu',
        penyebab: 'Pembersihan ketika closing belum maksimal sehingga area tersebut tidak dibersihkan',
        hasil: 'Akan di monitoring di visit berikutnya'
    },
    {
        label: '🔴 Timer 30 Minute Cycle Tidak Dipakai',
        category: 'OPI',
        temuan: 'Timer 30 minute cycle tidak digunakan',
        dampak: 'Kualitas pelayanan dan pemantauan area secara berkala tidak terkontrol',
        kondisiIdeal: 'Timer 30 minute cycle wajib digunakan dan dijalankan oleh kru',
        tindakan: 'Melakukan coaching langsung kepada kru mengenai kewajiban pemakaian timer 30 menit',
        penyebab: 'Timer hanya diletakkan di meja kasir tanpa diaktifkan',
        hasil: 'Akan di monitoring visit berikutnya'
    },
    {
        label: '🔴 Standing Poster Promo Belum Diganti',
        category: 'OPI',
        temuan: 'Standing poster promo tidak diganti dengan periode terbaru',
        dampak: 'Potensi kesalahpahaman promo customer dan selisih harga kasir',
        kondisiIdeal: 'Seluruh materi promosi dan standing poster terpasang sesuai periode promo aktual',
        tindakan: 'Segera mengganti poster promo dan briefing PIC marketing toko',
        penyebab: 'Kru belum mengecek materi promosi baru yang dikirim dari pusat',
        hasil: 'Akan di monitoring visit berikutnya'
    }
];
function ObservationCards({ title, rows, onChange }) {
    const safeRows = rows?.length ? rows : [blankObservationRow()];
    const [activeIndex, setActiveIndex] = useState(0);
    const [aiLoadingIndex, setAiLoadingIndex] = useState(null);
    const [presetOpenIndex, setPresetOpenIndex] = useState(null);
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
    const applyPresetToRow = (index, preset) => {
        const deadlineDefault = new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10);
        updateRow(index, {
            temuan: preset.temuan,
            dampak: preset.dampak,
            kondisiIdeal: preset.kondisiIdeal,
            tindakan: preset.tindakan,
            penyebab: preset.penyebab,
            hasil: preset.hasil,
            deadline: (safeRows[index]?.deadline || deadlineDefault)
        });
        setPresetOpenIndex(null);
    };
    const appendActionText = (index, text, hasilText) => {
        const row = safeRows[index] || {};
        const current = row.tindakan || '';
        const updatedTindakan = current ? `${current}. ${text}` : text;
        const patch = { tindakan: updatedTindakan };
        if (hasilText && !row.hasil) {
            patch.hasil = hasilText;
        }
        updateRow(index, patch);
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
        safeRows.map((row, index) => (React.createElement("article", { key: index, className: cx('observation-item-card surface-card rounded-[28px] p-4 md:p-4 sm:p-5', index === activeIndex && 'mobile-active') },
            React.createElement("div", { className: "mb-4 flex items-center justify-between gap-3" },
                React.createElement(Badge, { tone: isMeaningfulObservation(row) ? 'success' : 'default' },
                    "Temuan ",
                    index + 1),
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("div", { className: "relative inline-block" },
                        React.createElement("button", {
                            type: "button",
                            onClick: () => setPresetOpenIndex(presetOpenIndex === index ? null : index),
                            className: "px-2.5 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-sm hover:bg-amber-600 active:scale-95 transition-all flex items-center gap-1",
                            title: "Pilih dari Kamus Temuan (6 Kolom Otomatis)"
                        },
                            React.createElement("span", null, "⚡ Kamus Preset")
                        ),
                        presetOpenIndex === index ? React.createElement("div", {
                            className: "absolute right-0 top-full mt-1.5 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-2 max-h-72 overflow-y-auto"
                        },
                            React.createElement("div", { className: "text-[10px] font-black uppercase text-slate-400 px-2 py-1 flex items-center justify-between" },
                                React.createElement("span", null, "PILIH PRESET TEMUAN (AUTO-FILL):"),
                                React.createElement("button", { type: "button", onClick: () => setPresetOpenIndex(null), className: "text-slate-500 hover:text-slate-800" }, "✕")
                            ),
                            RBV_OBSERVATION_PRESETS.map((preset, pIdx) => (
                                React.createElement("button", {
                                    key: pIdx,
                                    type: "button",
                                    onClick: () => applyPresetToRow(index, preset),
                                    className: "w-full text-left px-2.5 py-2 rounded-xl hover:bg-amber-50 active:bg-amber-100 transition-colors border-b border-slate-100 last:border-0"
                                },
                                    React.createElement("div", { className: "text-xs font-bold text-slate-800" }, preset.label),
                                    React.createElement("div", { className: "text-[10px] text-slate-500 line-clamp-1" }, preset.temuan)
                                )
                            ))
                        ) : null
                    ),
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
                React.createElement("div", { className: "flex flex-col gap-2" },
                    richField('Tindakan Aksi', 'tindakan', row, index, 'Aksi perbaikan yang disepakati...'),
                    React.createElement("div", { className: "flex flex-wrap items-center gap-1.5 mt-1" },
                        React.createElement("span", { className: "text-[11px] font-bold text-slate-500 mr-1" }, "Aksi Buddy Trainer:"),
                        React.createElement("button", {
                            type: "button",
                            onClick: () => appendActionText(index, "Melakukan briefing ulang dan pembinaan langsung mengenai SOP kepada crew di toko", "Selesai dibriefing di hari kunjungan"),
                            className: "px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 active:scale-95 transition-all"
                        }, "🗣️ + Brief Ulang"),
                        React.createElement("button", {
                            type: "button",
                            onClick: () => appendActionText(index, "Rekomendasi TNA (Training Needs Analysis) untuk All Crew Store / PIC terkait pemantapan modul ini", "Akan dijadwalkan refresher training berikutnya"),
                            className: "px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 active:scale-95 transition-all"
                        }, "🎓 + TNA (Training)"),
                        React.createElement("button", {
                            type: "button",
                            onClick: () => appendActionText(index, "Eskalasi perbaikan fasilitas/peralatan kepada Store Manager dan tim Maintenance", "Akan di monitoring perbaikan fasilitas"),
                            className: "px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 active:scale-95 transition-all"
                        }, "🔧 + Eskalasi Fisik")
                    )
                ),
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
            React.createElement("input", { ref: cameraRef, type: "file", accept: "image/*,image/jpeg,image/png,image/heic,image/webp", capture: getNativeCameraCaptureAttr(), className: "rbv-native-file-input", onClick: () => { rbvPrepareCameraCapture(); }, onChange: handleFloatingFiles }),
            React.createElement(Icon, { name: "camera", className: "h-5 w-5" }),
            React.createElement("span", { className: "evidence-floating-label" }, "Kamera")),
        React.createElement("label", { className: "rbv-native-file-trigger evidence-floating-button evidence-floating-gallery evidence-floating-icon-button", "aria-label": "Pilih foto evidence dari galeri", onPointerDown: rbvPrepareCameraCapture, onTouchStart: rbvPrepareCameraCapture },
            React.createElement("input", { ref: galleryRef, type: "file", accept: "image/*,image/jpeg,image/png,image/heic,image/webp", multiple: true, className: "rbv-native-file-input", "data-gallery-multiple": "true", onClick: () => { rbvPrepareCameraCapture(); }, onChange: handleFloatingFiles }),
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
        React.createElement("div", { className: "visit-setup-grid grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:gap-4 sm:gap-4 sm:p-5" },
            React.createElement("div", { className: "visit-setup-card min-w-0 p-4 md:p-6" },
                React.createElement("div", { className: "grid gap-4 md:gap-4 sm:gap-4 sm:p-5" },
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
        React.createElement("div", { className: "grid gap-4 sm:gap-4 sm:p-5" },
            React.createElement("div", { className: "date-card surface-card rounded-[28px] p-4 sm:p-4 sm:p-5 md:p-6" },
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
    const setEnabled = (value) => tab === 'opi' ? update({ showOPITable: value }) : update({ showQSCTable: value });
    const preTitle = React.createElement("div", { className: "section-switcher grid grid-cols-2 gap-2 w-full min-w-0 overflow-x-auto pb-1 items-center" },
        React.createElement("button", { type: "button", className: cx('subnav-chip prominent relative transition-all duration-300 flex items-center justify-center gap-1.5', tab === 'opi' ? 'active !pr-2 !py-1.5' : ''), onClick: () => setTab('opi') },
            React.createElement(Icon, { name: "clipboard", className: "h-4 w-4 shrink-0" }),
            React.createElement("span", { className: "font-bold tracking-wide" }, "OPI"),
            tab === 'opi' && React.createElement("div", { className: "ml-1 pl-2 border-l border-brand-teal/20 flex items-center shrink-0 scale-75 origin-left", onClick: (e) => e.stopPropagation() }, React.createElement(Toggle, { checked: enabled, onChange: setEnabled }))
        ),
        React.createElement("button", { type: "button", className: cx('subnav-chip prominent relative transition-all duration-300 flex items-center justify-center gap-1.5', tab === 'qsc' ? 'active !pr-2 !py-1.5' : ''), onClick: () => setTab('qsc') },
            React.createElement(Icon, { name: "clipboard", className: "h-4 w-4 shrink-0" }),
            React.createElement("span", { className: "font-bold tracking-wide" }, "QSC"),
            tab === 'qsc' && React.createElement("div", { className: "ml-1 pl-2 border-l border-brand-teal/20 flex items-center shrink-0 scale-75 origin-left", onClick: (e) => e.stopPropagation() }, React.createElement(Toggle, { checked: enabled, onChange: setEnabled }))
        )
    );
    return (React.createElement(SectionShell, { title: "Observation & Root Cause Analysis", preTitle: preTitle }, !enabled ? React.createElement(InactiveSection, { title: (tab === 'opi' ? 'OPI Project' : 'QSC Observation') + ' disembunyikan' }) : tab === 'opi' ? React.createElement(ObservationCards, { key: "opi", title: "OPI Project Observation", rows: visit.opiData, onChange: (opiData) => update({ opiData }) }) : React.createElement(ObservationCards, { key: "qsc", title: "QSC Observation", rows: visit.qscData, onChange: (qscData) => update({ qscData }) })));
}
function EvidenceSection({ visit, update }) {
    const tab = visit.activeEvidenceTab === 'corrective' ? 'corrective' : 'finding';
    const setTab = (nextTab) => update({ activeEvidenceTab: nextTab });
    const enabled = tab === 'finding' ? visit.showFindingEvidence === true : visit.showCorrectiveAction === true;
    const setEnabled = (value) => tab === 'finding' ? update({ showFindingEvidence: value }) : update({ showCorrectiveAction: value });
    const toggleLabel = tab === 'finding' ? (enabled ? 'Hide Finding' : 'Unhide Finding') : (enabled ? 'Hide Corrective' : 'Unhide Corrective');
    const evidenceTabStyle = { minWidth: 0, width: '100%', justifyContent: 'center', paddingLeft: '8px', paddingRight: '8px', whiteSpace: 'nowrap' };
    const preTitle = React.createElement("div", { className: "section-switcher flex w-full min-w-0 gap-2 overflow-x-auto pb-1 md:max-w-[460px]" },
        React.createElement("button", { type: "button", className: cx('subnav-chip prominent relative transition-all duration-300 flex items-center justify-center gap-1.5', tab === 'finding' ? 'active !pr-2 !py-1.5' : ''), style: evidenceTabStyle, onClick: () => setTab('finding') },
            React.createElement(Icon, { name: "image", className: "h-4 w-4 shrink-0" }),
            React.createElement("span", { className: "min-w-0 truncate font-bold tracking-wide" }, "FINDING"),
            tab === 'finding' && React.createElement("div", { className: "ml-1 pl-2 border-l border-brand-teal/20 flex items-center shrink-0 scale-75 origin-left", onClick: (e) => e.stopPropagation() }, React.createElement(Toggle, { checked: enabled, onChange: setEnabled }))
        ),
        React.createElement("button", { type: "button", className: cx('subnav-chip prominent relative transition-all duration-300 flex items-center justify-center gap-1.5', tab === 'corrective' ? 'active !pr-2 !py-1.5' : ''), style: evidenceTabStyle, onClick: () => setTab('corrective') },
            React.createElement(Icon, { name: "image", className: "h-4 w-4 shrink-0" }),
            React.createElement("span", { className: "min-w-0 truncate font-bold tracking-wide" }, "CORRECTIVE"),
            tab === 'corrective' && React.createElement("div", { className: "ml-1 pl-2 border-l border-brand-teal/20 flex items-center shrink-0 scale-75 origin-left", onClick: (e) => e.stopPropagation() }, React.createElement(Toggle, { checked: enabled, onChange: setEnabled }))
        )
    );
    return (React.createElement(SectionShell, { title: "Evidence Photos", preTitle: preTitle }, !enabled ? React.createElement(InactiveSection, { title: (tab === 'finding' ? 'Finding Evidence' : 'Corrective Action') + ' disembunyikan' }) : tab === 'finding' ? React.createElement(PhotoGrid, { prefix: "Finding", photos: visit.findingEvidencePhotos, onChange: (findingEvidencePhotos) => update({ findingEvidencePhotos }) }) : React.createElement(PhotoGrid, { prefix: "Corrective", photos: visit.correctiveActionPhotos, onChange: (correctiveActionPhotos) => update({ correctiveActionPhotos }) })));
}
function AssignmentSection({ visit, update, onPreview }) {
    return (React.createElement(SectionShell, { title: "Store Assignment" },
        React.createElement("div", { className: "surface-card rounded-[28px] p-4 sm:p-4 sm:p-5 md:p-6" },
            React.createElement(Field, { label: "Assignment Link" },
                React.createElement(TextInput, { type: "url", value: visit.storeAssignmentLink || '', onChange: (e) => update({ storeAssignmentLink: e.target.value }), placeholder: "https://..." })),
            React.createElement("div", { className: "mt-5 flex flex-wrap gap-2" },
                React.createElement(Button, { icon: "eye", onClick: onPreview }, "Preview PDF")))));
}