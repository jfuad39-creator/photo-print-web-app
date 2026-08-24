<!-- AI CONTEXT | original: client/index.html | part 1 dari 6 | supporting HTML; ICON SET (SVG sprite, stroke sederhana) - dekoratif saja; TOPBAR -->
```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pas Foto Print</title>
  <link rel="stylesheet" href="css/theme.css" />
</head>
<body>

<!-- ============================================================
     ICON SET (SVG sprite, stroke sederhana) - dekoratif saja
     ============================================================ -->
<svg class="icon-sprite" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <symbol id="i-logo" viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="13" rx="3" fill="var(--accent)"/>
    <rect x="8.6" y="4" width="6.8" height="3.6" rx="1.3" fill="var(--accent)"/>
    <circle cx="12" cy="14" r="4.7" fill="var(--accent-2)"/>
    <circle cx="12" cy="14" r="2.7" fill="var(--accent-3)"/>
    <circle cx="10.5" cy="12.5" r=".75" fill="var(--accent-ink)"/>
  </symbol>
  <symbol id="i-image" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M4 17.5l4.6-4.3a2 2 0 0 1 2.7 0L16 17.5"/><path d="M14.5 14.6l1.6-1.5a2 2 0 0 1 2.7 0L20 14.3"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5.5v13M5.5 12h13"/></symbol>
  <symbol id="i-pointer" viewBox="0 0 24 24"><path d="M5 3.5l6.4 16.2 2.3-6.3 6.3-2.3z"/></symbol>
  <symbol id="i-upload" viewBox="0 0 24 24"><path d="M12 16V4.5"/><path d="M7.5 9L12 4.5 16.5 9"/><path d="M4 16.5v2.2A1.3 1.3 0 0 0 5.3 20h13.4a1.3 1.3 0 0 0 1.3-1.3v-2.2"/></symbol>
  <symbol id="i-rows" viewBox="0 0 24 24"><rect x="3" y="4.5" width="18" height="5" rx="1.6"/><rect x="3" y="14.5" width="18" height="5" rx="1.6"/></symbol>
  <symbol id="i-sliders" viewBox="0 0 24 24"><path d="M3.5 7.5h16M3.5 16.5h16"/><circle cx="9" cy="7.5" r="2.4"/><circle cx="15" cy="16.5" r="2.4"/></symbol>
  <symbol id="i-eye" viewBox="0 0 24 24"><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></symbol>
  <symbol id="i-refresh" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.5-5.8"/><path d="M20.2 4.2v4.6h-4.6"/></symbol>
  <symbol id="i-doc" viewBox="0 0 24 24"><path d="M14 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V7.5z"/><path d="M14 3v4.5h4.5"/><path d="M9.5 14.5h5M12 12v5"/></symbol>
  <symbol id="i-layers" viewBox="0 0 24 24"><path d="M12 3.5l8.5 4.6L12 12.7 3.5 8.1z"/><path d="M4 12.5l8 4.4 8-4.4"/></symbol>
  <symbol id="i-undo" viewBox="0 0 24 24"><path d="M9.5 14.5L4.5 9.5l5-5"/><path d="M4.5 9.5h10a5 5 0 0 1 0 10h-4"/></symbol>
  <symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="1.6"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/></symbol>
  <symbol id="i-crop" viewBox="0 0 24 24"><path d="M6.5 2.5v15h15"/><path d="M2.5 6.5h15v15"/></symbol>
  <symbol id="i-zoom-in" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20.5 20.5l-4.8-4.8"/><path d="M11 8.5v5M8.5 11h5"/></symbol>
  <symbol id="i-zoom-out" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20.5 20.5l-4.8-4.8"/><path d="M8.5 11h5"/></symbol>
  <symbol id="i-flip-h" viewBox="0 0 24 24"><path d="M12 3v18" stroke-dasharray="2.5 2.5"/><path d="M8.5 7.5L4 12l4.5 4.5z"/><path d="M15.5 7.5L20 12l-4.5 4.5z"/></symbol>
  <symbol id="i-flip-v" viewBox="0 0 24 24"><path d="M3 12h18" stroke-dasharray="2.5 2.5"/><path d="M7.5 8.5L12 4l4.5 4.5z"/><path d="M7.5 15.5L12 20l4.5-4.5z"/></symbol>
  <symbol id="i-rotate" viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20.2 4.5V9h-4.5"/><rect x="9" y="9" width="6" height="6" rx="1"/></symbol>
  <symbol id="i-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="11.5" height="11.5" rx="2"/><path d="M15.5 6.5v-1A2 2 0 0 0 13.5 3.5h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1"/></symbol>
  <symbol id="i-trash" viewBox="0 0 24 24"><path d="M4 6.5h16"/><path d="M9.5 6.5V4h5v2.5"/><path d="M6.5 6.5l1 13h9l1-13"/></symbol>
  <symbol id="i-swap" viewBox="0 0 24 24"><path d="M4 8.5h13"/><path d="M13.5 5L17 8.5 13.5 12"/><path d="M20 15.5H7"/><path d="M10.5 12L7 15.5 10.5 19"/></symbol>
  <symbol id="i-bolt" viewBox="0 0 24 24"><path d="M13.5 2.5L4.5 13.5h6l-1 8 9-11h-6z"/></symbol>
  <symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><path d="M12 7.8v.2"/></symbol>
  <symbol id="i-up" viewBox="0 0 24 24"><path d="M6.5 14.5L12 9l5.5 5.5"/></symbol>
  <symbol id="i-down" viewBox="0 0 24 24"><path d="M6.5 9.5L12 15l5.5-5.5"/></symbol>
  <symbol id="i-left" viewBox="0 0 24 24"><path d="M14.5 6.5L9 12l5.5 5.5"/></symbol>
  <symbol id="i-right" viewBox="0 0 24 24"><path d="M9.5 6.5L15 12l-5.5 5.5"/></symbol>
  <symbol id="i-grid" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></symbol>
  <symbol id="i-ruler" viewBox="0 0 24 24"><rect x="2.5" y="8" width="19" height="8" rx="1.6"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/></symbol>
  <symbol id="i-print" viewBox="0 0 24 24"><path d="M6.5 9V2.5h11V9"/><path d="M6.5 18H4.5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6.5" y="13.5" width="11" height="8" rx=".8"/></symbol>
  <symbol id="i-tag" viewBox="0 0 24 24"><rect x="3" y="15" width="18" height="6" rx="1.4"/><path d="M6.5 15v-2a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v2"/><path d="M9.5 10V7.5a2.5 2.5 0 0 1 5 0V10"/></symbol>
</svg>

<!-- ============================================================
     TOPBAR
     ============================================================ -->
<header class="topbar">
  <div class="brand">
    <span class="logo"><svg class="ic"><use xlink:href="#i-logo"/></svg></span>
    <div class="brand-txt">
      <strong>Pas Foto</strong>
      <span class="brand-sub">Print</span>
    </div>
    <span class="version-pill" id="hostInfo">Mode browser</span>
  </div>
  <div class="topbar-actions">
    <button id="btnUndo" class="btn small ghost" title="Undo (Ctrl+Z)" aria-label="Undo (Ctrl+Z)"><svg class="ic ic-sm"><use xlink:href="#i-undo"/></svg></button>
    <button id="btnUngroup" class="btn small ghost" title="Ungroup semua hasil generate" aria-label="Ungroup semua hasil generate"><svg class="ic ic-sm"><use xlink:href="#i-layers"/></svg></button>
    <button id="btnResetArtboard" class="btn small ghost" title="Hapus semua hasil generate PFPM sebelumnya" aria-label="Hapus semua hasil generate sebelumnya"><svg class="ic ic-sm"><use xlink:href="#i-trash"/></svg></button>
    <button id="btnCreateDoc" class="btn small outline-accent" title="Buat dokumen baru sesuai pengaturan Media & Layout"><svg class="ic ic-sm"><use xlink:href="#i-doc"/></svg><span>Doc</span></button>
    <button id="btnPrint" class="btn small ghost" title="Buka dialog Print Illustrator untuk dokumen aktif" aria-label="Buka dialog Print Illustrator"><svg class="ic ic-sm"><use xlink:href="#i-print"/></svg></button>
    <button id="btnReset" class="btn small danger" title="Reset semua parameter panel ke default" aria-label="Reset semua parameter panel ke default"><svg class="ic ic-sm"><use xlink:href="#i-refresh"/></svg></button>
  </div>
</header>

<main>
  
```
