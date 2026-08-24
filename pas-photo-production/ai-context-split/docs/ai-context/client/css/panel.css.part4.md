<!-- AI CONTEXT | original: client/css/panel.css | part 4 dari 4 | .sheet-block; .sheet-caption; .sheet-caption::before; .sheet-stage; .stage-row; .ruler-h; .ruler-v; .ruler-h > *, .ruler-v > * -->
```css

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
  background: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); flex: 0 0 auto;
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
  border: 1px solid var(--accent);
  border-radius: 3px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, .35), 0 0 0 1px rgba(9, 200, 201, .18);
  overflow: hidden;
  flex: 0 0 auto;
}
.sheet-guide {
  position: absolute;
  border: 1px dashed rgba(13, 148, 136, .75);
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
.slot.rot { box-shadow: inset 0 0 0 1px rgba(13, 148, 136, .85); }
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

.msg {
  margin: 10px 2px 0; font-size: 10.5px; color: var(--txt-dim);
  display: flex; align-items: center; gap: 7px; line-height: 1.45; min-height: 16px;
}
.msg:empty { display: none; }
.msg.ok { color: var(--accent-ink); }
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
  background: var(--bg-3); border: 1px solid var(--line); border-left: 2px solid var(--accent);
  border-radius: var(--radius-xs); padding: 9px 11px; font-size: 11px; color: var(--txt);
  margin-bottom: 12px; word-break: break-all; line-height: 1.5;
}
.sel-info b { color: var(--accent-ink); }
.sel-info.empty { color: var(--txt-faint); border-left-color: #5a5a5d; }

.editor { transition: opacity .15s; }
.editor.disabled { opacity: .42; pointer-events: none; filter: saturate(.4); }

.bg-editor-box {
  margin-bottom: 12px; background: rgba(0, 0, 0, .12); border: 1px solid var(--line-soft);
  border-radius: var(--radius-sm); padding: 11px;
}
.bg-editor-box .bg-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin: 8px 0 10px; }
.bg-editor-box .bg-row .bg-swatch, .bg-editor-box .bg-row .bg-custom { width: 18px; height: 18px; }
.bg-editor-box .bg-custom input[type="color"] { inset: -4px; width: 26px; height: 26px; }
.bg-apply-row { display: flex; gap: 6px; margin-top: 7px; }
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
.dpad .dpad-center .ic { width: 13px; height: 13px; color: var(--accent-3); }

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
}
```
