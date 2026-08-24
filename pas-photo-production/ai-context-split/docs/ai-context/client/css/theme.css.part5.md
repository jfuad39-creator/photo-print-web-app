<!-- AI CONTEXT | original: client/css/theme.css | part 5 dari 6 | .structure-toggle .chevron; .structure-toggle[aria-expanded="true"] .chevron; .structure-body; .structure-panel .structure-body; .structure-panel .structure-body.open; @keyframes structureOpen; from; to -->
```css

.structure-toggle .chevron { margin-left: auto; width: 12px; height: 12px; color: var(--txt-faint); transition: transform .18s; }
.structure-toggle[aria-expanded="true"] .chevron { transform: rotate(180deg); }
.structure-body {
  margin-top: 11px;
  animation: structureOpen .15s ease;
}
.structure-panel .structure-body { display: none; }
.structure-panel .structure-body.open { display: flex; }
@keyframes structureOpen { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

.radio-row { display: flex; flex-direction: column; gap: 9px; }
.radio, .check {
  display: flex; gap: 9px; align-items: flex-start;
  font-size: 11.5px; color: var(--txt); cursor: pointer; line-height: 1.45;
  padding: 8px 9px; border: 1px solid transparent; border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, .10);
  transition: .13s;
}
.radio:hover, .check:hover { border-color: #5a5a5d; background: rgba(159, 216, 197, .10); }
.radio input[type="radio"], .check input[type="checkbox"] {
  width: 14px; height: 14px; margin: 1px 0 0; flex: 0 0 auto; cursor: pointer;
}
.radio b, .check b { font-weight: 600; }
.radio i, .check i {
  font-style: normal; color: var(--sec3-ink); font-size: 9.5px;
  border: 1px solid var(--sec3-soft-2); background: var(--sec3-soft);
  border-radius: 4px; padding: 1px 5px; margin-left: 4px; white-space: nowrap;
}
.radio small, .check small { display: block; color: var(--txt-faint); font-size: 10px; margin-top: 2px; }

/* ---------- FIX 2: preview - sheet tidak lagi terpotong ----------
   Masalah: preview-box memiliki overflow-x:hidden yang memotong sheet
   saat skala sheet mendekati lebar container. Sheet dan stage-row juga
   perlu menyesuaikan lebar secara otomatis.

   Solusi:
   - preview-box tetap overflow-y:auto tapi overflow-x sekarang auto
     (bukan hidden) supaya kalau masih mepet bisa scroll, tapi utamanya
     scale dihitung lebih aman di app.js.
   - sheet-stage dan stage-row tidak dibatasi max-width yang rigid.
   - sheet element dibiarkan flex-shrink agar menyesuaikan. */
.preview-card { display: flex; flex-direction: column; }
.preview-box {
  background: var(--bg-4);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 16px 10px;
  min-height: 340px;
  max-height: 68vh;
  overflow-y: auto;
  overflow-x: auto;
  display: flex; flex-direction: column; align-items: center; gap: 18px;
}
.preview-box:empty::after {
  content: "Preview lembar akan tampil di sini.";
  color: var(--txt-faint); font-size: 11px; margin: auto;
}
.sheet-block {
  display: flex; flex-direction: column; gap: 8px;
  align-items: flex-start;
  width: 100%;
}
.sheet-caption {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; color: var(--txt-dim); font-weight: 600; letter-spacing: .02em;
}
.sheet-caption::before {
  content: ""; width: 7px; height: 7px; border-radius: 50%;
  background: var(--sec4-icon); box-shadow: 0 0 0 3px var(--sec4-soft); flex: 0 0 auto;
}
.sheet-stage {
  display: flex; flex-direction: column;
}
.stage-row {
  display: flex; align-items: flex-start;
}

.ruler-h {
  display: flex; align-items: center; justify-content: space-between;
  height: 15px; padding: 0 3px; margin-bottom: 5px;
  font-size: 9px; color: var(--txt-faint); letter-spacing: .04em;
  border-bottom: 1px solid var(--line-soft);
}
.ruler-v {
  writing-mode: vertical-rl;
  display: flex; align-items: center; justify-content: space-between;
  padding: 3px 0; margin-right: 5px;
  font-size: 9px; color: var(--txt-faint); letter-spacing: .04em;
  border-right: 1px solid var(--line-soft);
  flex: 0 0 auto;
}
.ruler-h > *, .ruler-v > * { font-style: normal; font-weight: 500; opacity: .95; }

.sheet {
  position: relative;
  background: #fff;
  border: 1px solid var(--sec4-icon);
  border-radius: 3px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, .35), 0 0 0 1px rgba(250, 192, 5, .22);
  overflow: hidden;
  flex: 0 0 auto;
}
.sheet-guide {
  position: absolute;
  border: 1px dashed rgba(196, 144, 0, .75);
  pointer-events: none;
}
.slot {
  position: absolute;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 23, .55);
  overflow: hidden;
}
.slot.rot { box-shadow: inset 0 0 0 1px rgba(196, 144, 0, .85); }
.slot-photo {
  position: absolute;
  left: 50%;
  top: 50%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transform-origin: center center;
}
.slot-border {
  position: absolute;
  box-sizing: border-box;
  border: 1px solid rgba(15, 23, 23, .85);
  pointer-events: none;
}
/* bar caption di preview (perkiraan visual saja - lihat addCaptionBar()
   di host/main.jsx untuk render presisi yang benar-benar dipakai saat
   Generate). Ditumpuk di atas .slot-photo, menempel bawah slot. */
.slot-caption {
  position: absolute; left: 0; bottom: 0; width: 100%; box-sizing: border-box;
  background: #fff; color: #111;
  display: flex; align-items: center; justify-content: center;
  font-size: 7px; font-weight: 700; line-height: 1.1; text-align: center;
  padding: 0 2px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
}

.msg {
  margin: 10px 2px 0; font-size: 10.5px; color: var(--txt-dim);
  display: flex; align-items: center; gap: 7px; line-height: 1.45; min-height: 16px;
}
.msg:empty { display: none; }
.msg.ok { color: var(--sec4-ink); }
.msg.err { color: #ff9c95; }
.msg::before {
  content: ""; width: 6px; height: 6px; border-radius: 50%; flex: 0 0 auto; background: currentColor; opacity: .8;
}
.generate-wrap { margin-top: 12px; }
.generate-note {
  margin: 8px 2px 0; font-size: 10px; color: var(--txt-faint); text-align: center;
}

/* ---------- editor ---------- */
.sel-info {
  background: var(--bg-3); border: 1px solid var(--line); border-left: 2px solid var(--sec5-icon);
  border-radius: var(--radius-xs); padding: 9px 11px; font-size: 11px; color: var(--txt);
  margin-bottom: 12px; word-break: break-all; line-height: 1.5;
}
.sel-info b { color: var(--sec5-ink); }
.sel-info.empty { color: var(--txt-faint); border-left-color: #5a5a5d; }

/* indikator "background saat ini" (lihat bgLiveIndicatorHtml di app.js) -
   dot kecil menampilkan warna background HASIL BACAAN ULANG dari dokumen
   (bukan pendingBg), jadi selalu sinkron dengan yang benar-benar sudah
   diterapkan ke slot terpilih. Pola checker dipakai utk transparan (sama
   seperti .bg-swatch.none), pola diagonal 2 warna dipakai utk "campuran"
   saat slot yang diseleksi punya background berbeda-beda. */
.bg-live { display: flex; align-items: center; gap: 6px; margin-top: 6px; }
.bg-live-dot {
  width: 13px; height: 13px; border-radius: 50%; flex: 0 0 auto;
  border: 1px solid rgba(255, 255, 255, .3); background-color: #fff;
}
.bg-live-dot.none {
  background-color: #3a3a3c;
  background-image:
    linear-gradient(45deg, #6b6b6d 25%, transparent 25%, transparent 75%, #6b6b6d 75%),
    linear-gradient(45deg, #6b6b6d 25%, transparent 25%, transparent 75%, #6b6b6d 75%);
  background-size: 6px 6px; background-position: 0 0, 3px 3px;
}
.bg-live-dot.mixed {
  background: linear-gradient(135deg, #e0201f 0 50%, #1a56db 50% 100%);
}
```
