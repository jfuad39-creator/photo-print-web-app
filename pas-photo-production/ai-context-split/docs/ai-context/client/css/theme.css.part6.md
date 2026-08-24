<!-- AI CONTEXT | original: client/css/theme.css | part 6 dari 6 | .editor; .editor.disabled; .bg-editor-head; .bg-editor-badge; .bg-editor-badge .ic; .bg-editor-box .bg-row; .bg-editor-box .bg-row .bg-swatch, .bg-editor-box .bg-row .bg-custom; .bg-editor-box .bg-custom input[type="color"] -->
```css


/* .editor-panel membungkus #selInfo + #editorBody jadi satu kotak sendiri
   (gaya sama seperti .pad-box) supaya area yang bisa meredup saat tidak ada
   seleksi punya batas kotak yang jelas, terpisah dari .bg-editor-box di
   atasnya - lihat catatan di index.html. */
.editor-panel {
  background: rgba(0, 0, 0, .12); border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm); padding: 11px; margin-bottom: 12px;
}

.editor { transition: opacity .15s; }
.editor.disabled { opacity: .42; pointer-events: none; filter: saturate(.4); }

/* .bg-editor-box berdiri sebagai kotak terpisah yang SETARA dengan
   .editor-panel di bawahnya (bukan lanjutannya) - TIDAK ikut opacity/
   saturate milik #editorBody.disabled. Sengaja dibuat border netral,
   SAMA seperti .pad-box/.editor-panel (bukan diberi aksen warna di
   tepi) supaya seragam dengan kotak-kotak lain di kartu ini - status
   "selalu aktif" cukup dikomunikasikan lewat kepala kotak sendiri
   (.bg-editor-head) + badge hijau (.bg-editor-badge), tidak perlu
   garis tepi tambahan yang malah bikin kotak ini terlihat menonjol
   sendiri dan tidak balance dengan elemen lain. Menggantikan
   pendekatan divider sebelumnya. */
.bg-editor-box {
  background: rgba(0, 0, 0, .12); border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm); padding: 11px; margin-bottom: 12px;
}
.bg-editor-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 8px; margin-bottom: 9px;
}
.bg-editor-badge {
  display: inline-flex; align-items: center; gap: 4px; flex: 0 0 auto;
  background: rgba(52, 211, 153, .14); border: 1px solid rgba(52, 211, 153, .4);
  color: #7be7c3; font-size: 9px; font-weight: 700; letter-spacing: .04em;
  text-transform: uppercase; padding: 3px 8px 3px 7px; border-radius: 20px;
  white-space: nowrap;
}
.bg-editor-badge .ic { width: 10px; height: 10px; }
.bg-editor-box .bg-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin: 0 0 10px; }
.bg-editor-box .bg-row .bg-swatch, .bg-editor-box .bg-row .bg-custom { width: 18px; height: 18px; }
.bg-editor-box .bg-custom input[type="color"] { inset: -4px; width: 26px; height: 26px; }
.bg-apply-row { display: flex; gap: 6px; margin-top: 7px; }

/* ---------- tab Label (caption teks bawah foto) ---------- */
#capBody.disabled { opacity: .42; pointer-events: none; filter: saturate(.4); }
.cap-override-list { display: flex; flex-direction: column; gap: 7px; }
.cap-override-row {
  display: grid; grid-template-columns: 1fr 1.3fr; align-items: center; gap: 8px;
}
.cap-override-name {
  font-size: 11px; color: var(--txt-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.cap-override-input { font-size: 11px; }
.bg-apply-row .btn { flex: 1; }
.bg-apply-row select { min-width: 0; }
.bg-apply-row:first-of-type { margin-top: 0; }

.pad-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
.pad-box {
  background: rgba(0, 0, 0, .12); border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm); padding: 11px;
}
.dpad {
  display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr);
  gap: 5px; max-width: 148px; margin: 0 auto;
}
.dpad .btn { padding: 7px 0; }
.dpad .dpad-center {
  display: grid; place-items: center; color: var(--txt-faint);
  border: 1px dashed var(--line); border-radius: var(--radius-xs); font-size: 9px;
}
.dpad .dpad-center .ic { width: 13px; height: 13px; color: var(--sec5-icon); }

.dpad.dpad-plus {
  grid-template-areas:
    ".    up     ."
    "left center right"
    ".    down   .";
}
.dpad.dpad-plus [data-dup="up"] { grid-area: up; }
.dpad.dpad-plus [data-dup="down"] { grid-area: down; }
.dpad.dpad-plus [data-dup="left"] { grid-area: left; }
.dpad.dpad-plus [data-dup="right"] { grid-area: right; }
.dpad.dpad-plus .dpad-center { grid-area: center; }

.zoom-row { display: flex; gap: 6px; align-items: center; margin-top: 12px; flex-wrap: wrap; }
.zoom-row .btn { flex: 1 1 auto; }
.tool-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(74px, 1fr));
  gap: 6px; margin-top: 10px;
}

/* ---------- toast ---------- */
.toast {
  position: fixed; left: 50%; bottom: 16px; transform: translate(-50%, 24px);
  background: #2a2a2c; border: 1px solid var(--line); border-left: 3px solid var(--accent);
  color: var(--txt); padding: 10px 16px; border-radius: 9px; font-size: 11.5px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, .45);
  opacity: 0; pointer-events: none; transition: .22s ease; z-index: 90; max-width: 88vw;
}
.toast.show { opacity: 1; transform: translate(-50%, 0); }
.toast.ok { border-left-color: var(--accent); }
.toast.err { border-left-color: var(--red); }

/* ---------- modal: buat dokumen baru (pilih ukuran A4/A5) ---------- */
.modal-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(10, 10, 12, .6);
  display: none; align-items: center; justify-content: center;
  padding: 20px; opacity: 0; transition: opacity .15s ease;
}
.modal-overlay.open { display: flex; opacity: 1; }
.modal-box {
  width: 100%; max-width: 320px;
  background: var(--bg-2); border: 1px solid var(--line);
  border-radius: var(--radius); padding: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, .5);
  transform: translateY(6px) scale(.98); transition: transform .15s ease;
}
.modal-overlay.open .modal-box { transform: translateY(0) scale(1); }
.modal-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.modal-head h3 { display: flex; align-items: center; gap: 7px; margin: 0; font-size: 13.5px; color: var(--txt); }
.modal-head h3 .ic { color: var(--accent-2); }
.modal-x {
  background: transparent; border: none; color: var(--txt-dim);
  font-size: 18px; line-height: 1; cursor: pointer; padding: 2px 7px; border-radius: var(--radius-xs);
}
.modal-x:hover { background: var(--bg-3); color: var(--txt); }
.modal-desc { margin: 8px 0 14px; font-size: 11.5px; color: var(--txt-dim); }
.modal-size-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
.size-choice {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  background: var(--bg-3); border: 1px solid var(--line); border-radius: var(--radius-sm);
  padding: 14px 8px 12px; cursor: pointer; font-family: inherit;
  transition: border-color .13s, background .13s, transform .08s;
}
.size-choice:hover { border-color: var(--accent); background: var(--accent-soft); }
.size-choice:active { transform: translateY(1px); }
.size-choice-swatch { display: block; background: #f2f2f3; border-radius: 2px; box-shadow: 0 2px 6px rgba(0, 0, 0, .35); }
.size-choice-a4 { width: 42px; height: 59px; }
.size-choice-a5 { width: 33px; height: 47px; }
.size-choice-name { font-size: 13px; font-weight: 700; color: var(--txt); }
.size-choice-dim { font-size: 10px; color: var(--txt-dim); }

/* =====================================================================
 * RESPONSIVE - panel CEP bisa dilebarkan / disempitkan
 * ===================================================================== */

@media (max-width: 430px) {
  main { padding: 10px 10px 20px 10px; }
  .card { padding: 11px 11px 12px; }
  .order-row { grid-template-columns: 44px 1fr 1fr 1fr 28px; gap: 7px; }
  .order-row.has-src { grid-template-columns: 44px 1fr 1fr 1fr 28px; row-gap: 7px; }
  .order-row.has-src .src { grid-column: 1 / -1; grid-row: 2; }
  .order-row.has-src .x { grid-column: 5; grid-row: 1; }
  .structure-panel { border-left: 0; border-top: 1px solid var(--line); padding-left: 0; padding-top: 14px; }
  .preview-box { padding: 12px 6px; min-height: 260px; }
  .brand-sub { display: none; }
}

@media (min-width: 620px) {
  .preview-box { min-height: 420px; }
}

@media (min-width: 940px) {
  main { padding: 14px 14px 26px 14px; }
  .layout { grid-template-columns: minmax(320px, 380px) minmax(0, 1fr); gap: 14px; }
  .col-b { position: sticky; top: 60px; }
  .preview-box { min-height: 520px; max-height: calc(100vh - 260px); }
}

@media (min-width: 1280px) {
  .layout { grid-template-columns: minmax(360px, 430px) minmax(0, 1fr); gap: 16px; }
  .preview-box { min-height: 620px; padding: 22px 14px; }
  .card { padding: 15px 16px 16px; }
}

@media (min-width: 1680px) {
  .layout { grid-template-columns: minmax(380px, 460px) minmax(0, 1fr); }
}

@media (max-height: 620px) {
  .preview-box { max-height: 46vh; min-height: 220px; }
  .topbar { position: relative; }
  /* topbar sudah tidak sticky di panel pendek (di atas) - tab-bar ikut
     dilepas juga, kalau tidak dia akan "mengambang" nempel ke top yang
     salah karena acuannya (topbar) sudah tidak lagi menempel di 0. */
  .tab-bar { position: relative; top: auto; }
}
```
