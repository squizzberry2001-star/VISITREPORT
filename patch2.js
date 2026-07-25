const fs = require('fs');
let app = fs.readFileSync('src/app.js', 'utf8');

const targetStart = "secretTab === 'settings' ? (React.createElement(React.Fragment, null,";
const targetEnd = "        ) : (React.createElement(React.Fragment, null,";

const startIndex = app.indexOf(targetStart);
const endIndex = app.indexOf(targetEnd);

if (startIndex === -1 || endIndex === -1) {
    console.error('Boundaries not found');
    process.exit(1);
}

const replacement = \secretTab === 'settings' ? (React.createElement(React.Fragment, null,
                // 1. Unified Sync & Device Migration Section
                React.createElement("div", { className: "mb-5 grid gap-4 md:grid-cols-2" },
                    // Deep Sync Card
                    React.createElement("div", { className: "rounded-3xl border border-emerald-200 bg-emerald-50 p-5" },
                        React.createElement("h3", { className: "text-lg font-black text-slate-900 mb-1" }, "Sync & Refresh All"),
                        React.createElement("p", { className: "text-xs text-slate-600 mb-4" }, "Tarik setting terbaru, kirim history kunjungan, dan sinkronisasi data global dengan satu klik."),
                        React.createElement(Button, { variant: "primary", icon: "spark", className: "w-full justify-center", onClick: async () => { await pullConvexSettingsPanel(); await syncHistoryToConvexPanel(); await refresh(); }, disabled: cloudflareDbBusy }, cloudflareDbBusy ? 'Menyinkronkan...' : 'Deep Sync Sekarang')
                    ),
                    // Backup Migration Card
                    React.createElement("div", { className: "rounded-3xl border border-cyan-200 bg-cyan-50 p-5" },
                        React.createElement("h3", { className: "text-lg font-black text-slate-900 mb-1" }, "Device Migration"),
                        React.createElement("p", { className: "text-xs text-slate-600 mb-4" }, "Backup seluruh data kunjungan perangkat ini atau pulihkan data dari cloud untuk pindah device."),
                        React.createElement("div", { className: "grid grid-cols-2 gap-2" },
                            React.createElement(Button, { variant: "secondary", icon: "upload", onClick: uploadDeviceBackupPanel, disabled: cloudflareDbBusy }, "Backup"),
                            React.createElement(Button, { variant: "secondary", icon: "download", onClick: pullDeviceBackupPanel, disabled: cloudflareDbBusy }, "Restore")
                        )
                    )
                ),
                // 2. Settings Grid (Welcome, Assignment, Notice, PDF)
                React.createElement("div", { className: "grid gap-5 md:grid-cols-2 mb-5" },
                    // Welcome & Assignment
                    React.createElement("div", { className: "rounded-3xl border border-slate-200 bg-white p-5 space-y-4" },
                        React.createElement("div", { className: "flex justify-between items-center" },
                            React.createElement("h3", { className: "text-lg font-black text-slate-900" }, "Welcome & Assignment"),
                            React.createElement(Button, { variant: "secondary", icon: "check", onClick: () => { saveWelcomeSettings(); saveAssignmentSettings(); } }, "Simpan")
                        ),
                        React.createElement(Field, { label: "Judul Welcome" }, React.createElement(TextInput, { value: welcomeTitle, onChange: e => setWelcomeTitle(e.target.value) })),
                        React.createElement(Field, { label: "Sub Judul" }, React.createElement(TextArea, { value: welcomeSubtitle, onChange: e => setWelcomeSubtitle(e.target.value), minRows: 2 })),
                        React.createElement(Field, { label: "Link Assignment" }, React.createElement(TextInput, { type: "url", value: assignmentLink, onChange: e => setAssignmentLink(e.target.value) }))
                    ),
                    // Notice
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
                // 3. Email Config
                React.createElement("div", { className: "rounded-3xl border border-slate-200 bg-white p-5 mb-5" },
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
                // 4. PDF Settings
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
                ),
                // 5. Master Store Data & Manual Requests
                renderMasterStorePanel(),
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
                                    " \u2022 ",
                                    item.storeCode || '-',
                                    " \u2022 ",
                                    formatDateTime(item.createdAt)),
                                item.address ? React.createElement("p", { className: "mt-1 text-xs text-slate-600" }, item.address) : null),
                            React.createElement("div", { className: "flex flex-wrap items-center gap-2" },
                                React.createElement(Badge, { tone: item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'warning' : 'default' }, item.status),
                                item.status === 'pending' ? React.createElement(React.Fragment, null,
                                    React.createElement(Button, { variant: "secondary", icon: "check", onClick: () => approveRequest(item.id) }, "Approve"),
                                    React.createElement(Button, { variant: "danger", icon: "close", onClick: () => rejectRequest(item.id) }, "Reject")) : null))))) : React.createElement("div", { className: "rounded-2xl bg-white p-4 text-sm font-bold text-slate-500 ring-1 ring-slate-200" }, "Belum ada request.")))))
\;

app = app.substring(0, startIndex) + replacement + app.substring(endIndex);
fs.writeFileSync('src/app.js', app);
console.log('UI Revamped successfully.');
