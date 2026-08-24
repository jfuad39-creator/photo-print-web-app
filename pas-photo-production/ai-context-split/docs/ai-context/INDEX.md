# INDEX — AI Context Split

Ini adalah salinan konteks untuk dibaca AI. Source code proyek asli tidak diubah. Semua part tetap berada dalam struktur path asal di folder `docs/ai-context/` saat dikopi ke proyek.

## `host/main.jsx`

| Part | Baris sumber | Ukuran kode | Ringkasan | File |
|---:|---:|---:|---|---|
| 1/11 | 1–102 | 6.7 KB | response, payload, safeName, pad2, rgb, num, hexToRgb, activeDoc, getMeta, getBorderMeta, setMeta, resolveSlot | `host/main.jsx.part1.md` |
| 2/11 | 102–202 | 6.8 KB | fitPlaced, markBorder, drawOffsetBorder, bringBordersToFront, addBackgroundRect, markCaptionPart, isCaptionPart, findBgRect, findCaptionBar, findCaptionText | `host/main.jsx.part2.md` |
| 3/11 | 202–317 | 5.5 KB | setSlotBackground, adjustCaptionOnSlot | `host/main.jsx.part3.md` |
| 4/11 | 317–445 | 6.7 KB | addCaptionBar | `host/main.jsx.part4.md` |
| 5/11 | 445–541 | 7.2 KB | createSlot | `host/main.jsx.part5.md` |
| 6/11 | 541–622 | 5.0 KB | isDuplicateSlotId, collectPreservedState, drawCutGuide, ensureArtboard, mediaSize, pickStartupPreset | `host/main.jsx.part6.md` |
| 7/11 | 622–702 | 3.5 KB | api.createDocument | `host/main.jsx.part7.md` |
| 8/11 | 702–841 | 7.6 KB | api.generate | `host/main.jsx.part8.md` |
| 9/11 | 841–913 | 7.1 KB | api.ungroupAll, api.selectionInfo, rebuildPhoto, applyToSelection, api.nudge | `host/main.jsx.part9.md` |
| 10/11 | 913–1006 | 7.4 KB | api.crop, api.flip, api.rotate90, api.replacePhoto, api.setBackground, api.setBackgroundBySize, api.captionAdjust, api.captionAdjustBySize, api.resetArtboard, api.duplicateSlot, api.deleteSlot | `host/main.jsx.part10.md` |
| 11/11 | 1006–1042 | 3.0 KB | api.undo, api.print, api.pickFiles, api.fromSelection, api.docInfo, api.ping | `host/main.jsx.part11.md` |

## `client/css/panel.css`

| Part | Baris sumber | Ukuran kode | Ringkasan | File |
|---:|---:|---:|---|---|
| 1/4 | 1–199 | 7.4 KB | *; html, body; ::-webkit-scrollbar; ::-webkit-scrollbar-track; ::-webkit-scrollbar-thumb; ::-webkit-scrollbar-thumb:hover; .ic; .ic-sm | `client/css/panel.css.part1.md` |
| 2/4 | 199–375 | 7.2 KB | .card--mint .label-mini .ic; .card--yellow .step-badge; .card--yellow .card-head h2 .ic; .card--yellow .label-mini .ic; .card--red .step-badge; .card--red .card-head h2 .ic; .card--red .label-mini .ic; .btn:hover | `client/css/panel.css.part2.md` |
| 3/4 | 375–547 | 7.4 KB | .photo-card .nm; .photo-card .nm:focus; .photo-card .del; .photo-card .del:hover; .photo-card .bg-row; .bg-swatch, .bg-custom; .bg-swatch:hover, .bg-custom:hover; .bg-swatch.active, .bg-custom.active | `client/css/panel.css.part3.md` |
| 4/4 | 547–750 | 7.1 KB | .sheet-block; .sheet-caption; .sheet-caption::before; .sheet-stage; .stage-row; .ruler-h; .ruler-v; .ruler-h > *, .ruler-v > * | `client/css/panel.css.part4.md` |

## `client/css/theme.css`

| Part | Baris sumber | Ukuran kode | Ringkasan | File |
|---:|---:|---:|---|---|
| 1/6 | 1–185 | 7.1 KB | *; html, body; ::-webkit-scrollbar; ::-webkit-scrollbar-track; ::-webkit-scrollbar-thumb; ::-webkit-scrollbar-thumb:hover; .ic; .ic-sm | `client/css/theme.css.part1.md` |
| 2/6 | 185–333 | 7.4 KB | .brand; .brand-txt; .brand-txt strong; .brand-sub; .logo; .logo .ic; .version-pill; .version-pill.action:hover | `client/css/theme.css.part2.md` |
| 3/6 | 333–492 | 7.4 KB | .btn:hover; .btn:active; .btn:focus; .btn:focus-visible; .btn.small; .btn.ghost; .btn.ghost:hover; .btn.outline-accent | `client/css/theme.css.part3.md` |
| 4/6 | 492–670 | 7.4 KB | .numfield input; .numfield input::-webkit-outer-spin-button, .numfield input::-webkit-inner-spin-button; .numfield .spin; .numfield .spin button; .numfield .spin button:focus, .numfield .spin button:focus-visible, .numfield .spin but...; .numfield .spin button:hover; .dropzone.over; .photo-grid | `client/css/theme.css.part4.md` |
| 5/6 | 670–857 | 7.0 KB | .structure-toggle .chevron; .structure-toggle[aria-expanded="true"] .chevron; .structure-body; .structure-panel .structure-body; .structure-panel .structure-body.open; @keyframes structureOpen; from; to | `client/css/theme.css.part5.md` |
| 6/6 | 857–1048 | 8.5 KB | .editor; .editor.disabled; .bg-editor-head; .bg-editor-badge; .bg-editor-badge .ic; .bg-editor-box .bg-row; .bg-editor-box .bg-row .bg-swatch, .bg-editor-box .bg-row .bg-custom; .bg-editor-box .bg-custom input[type="color"] | `client/css/theme.css.part6.md` |

## `client/js/app.js`

| Part | Baris sumber | Ukuran kode | Ringkasan | File |
|---:|---:|---:|---|---|
| 1/8 | 1–155 | 6.6 KB | $, $$, el, esc, fileUrl, isRenderable, fmtCm, sizeOptionText, attachSpinner, toast, renderPhotos, addPhotoPaths | `client/js/app.js.part1.md` |
| 2/8 | 155–287 | 5.3 KB | renderSizePresets, renderOrder, renderSizeTargetSelect | `client/js/app.js.part2.md` |
| 3/8 | 287–412 | 6.3 KB | bindOptions, syncTopbarHeight, switchTab | `client/js/app.js.part3.md` |
| 4/8 | 412–473 | 2.7 KB | renderCaptionTab | `client/js/app.js.part4.md` |
| 5/8 | 473–618 | 5.9 KB | preview | `client/js/app.js.part5.md` |
| 6/8 | 618–804 | 7.4 KB | openCreateDocModal, closeCreateDocModal, runCreateDocument, syncMediaTypeFromModal, setEditorEnabled, bgLiveIndicatorHtml | `client/js/app.js.part6.md` |
| 7/8 | 804–928 | 6.6 KB | capLiveIndicatorHtml, refreshSelection, setBgApplySelEnabled, renderEditBgSwatches | `client/js/app.js.part7.md` |
| 8/8 | 928–1001 | 3.0 KB | init | `client/js/app.js.part8.md` |

## `client/js/layout-engine.js`

| Part | Baris sumber | Ukuran kode | Ringkasan | File |
|---:|---:|---:|---|---|
| 1/4 | 1–185 | 7.1 KB | r2, clampNum, borderPitchGap, sameSize, findSize, onlyPassportSizes, nextSegment, addSlot, templateFits, hasRemaining, applyPosition, packReferenceA4 | `client/js/layout-engine.js.part1.md` |
| 2/4 | 185–330 | 7.3 KB | packReferenceA5, evaluateBlock, betterBlock, orientationsFor, chooseBlock, rectsOverlap | `client/js/layout-engine.js.part2.md` |
| 3/4 | 330–526 | 8.5 KB | subtractRect, containsRect, pruneContainedRects, uniqueBandHeights, simulateBand, chooseBand, packHorizontalShelf, packSheet, mergeRowsBySize | `client/js/layout-engine.js.part3.md` |
| 4/4 | 526–648 | 7.1 KB | build, scoreResult, generate | `client/js/layout-engine.js.part4.md` |

## `client/index.html`

| Part | Baris sumber | Ukuran kode | Ringkasan | File |
|---:|---:|---:|---|---|
| 1/6 | 1–78 | 7.1 KB | supporting HTML; ICON SET (SVG sprite, stroke sederhana) - dekoratif saja; TOPBAR | `client/index.html.part1.md` |
| 2/6 | 78–146 | 3.5 KB | TAB BAR: "Setup" (kartu 1-4, alur sebelum generate) vs "Slot Editor" (kartu 5, kerja di dokumen yang sudah di-generate). Slot Editor dipisah jadi tab sendiri karena dia baca seleksi kanvas Illustrator langsung (poll refreshSelection tiap 1.4 detik di app.js) - independen dari Preview, jadi aman disembunyikan tanpa mengganggu apa pun. Pindah tab dilakukan manual oleh user (tidak auto-pindah setelah Generate).; 1. PHOTO SOURCE; 2. ORDER | `client/index.html.part2.md` |
| 3/6 | 146–294 | 6.6 KB | 3. MEDIA & OPTIONS | `client/index.html.part3.md` |
| 4/6 | 294–360 | 3.8 KB | 4. PREVIEW; 5. EDITOR; GANTI BACKGROUND (slot yang SUDAH di-generate) ============ Kotak ini SENGAJA ditaruh DI LUAR #editorBody (sebelum ".editor-panel" di bawah) supaya tidak ikut ter-disable saat tidak ada seleksi di kanvas - karena tombol "Terapkan ke Ukuran Ini" (btnBgApplySize) memang dirancang untuk bekerja pada SEMUA slot berukuran sama di seluruh dokumen tanpa perlu ada seleksi aktif sama sekali. STRUKTUR LAYOUT: kotak ini ditaruh di ATAS ".editor-panel" (bukan di bawah seperti sebelumnya) supaya kontrol background yang "selalu aktif" langsung terlihat duluan, sebelum bagian posisi/crop/duplikat yang bisa redup (disabled) saat tidak ada slot terpilih. ".bg-editor-box" tetap berdiri sebagai kotak sendiri, setara dengan ".editor-panel" - lengkap dengan kepala kotak sendiri + badge "Selalu aktif" di kanan supaya statusnya langsung kebaca tanpa perlu baca teks. | `client/index.html.part4.md` |
| 5/6 | 360–481 | 8.6 KB | FONT & KERNING LABEL PER UKURAN ============ Sama seperti kotak Ganti Background di atas, kotak ini SENGAJA "selalu aktif" (di luar #editorBody) karena tombol Terapkan-nya bekerja lewat sizeId ke SEMUA slot berukuran sama di dokumen, tidak butuh seleksi aktif di kanvas. Untuk atur font/kerning HANYA pada slot yang sedang dipilih, pakai tombol +/- di kotak "Font & kerning label" dalam ".pad-grid" di bawah (di dalam #editorBody, otomatis nonaktif kalau tidak ada seleksi). | `client/index.html.part5.md` |
| 6/6 | 481–577 | 4.0 KB | TAB: LABEL - bar teks (mis. nama sekolah) di bagian bawah tiap foto, di dalam frame + border yang sama (lihat createSlot() / addCaptionBar() di host/main.jsx). Resolusi teks per slot: baris Order Ukuran > foto sumber > default global di sini.; MODAL: Buat Dokumen Baru - pilih ukuran A4 / A5 | `client/index.html.part6.md` |
