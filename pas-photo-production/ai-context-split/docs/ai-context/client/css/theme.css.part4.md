<!-- AI CONTEXT | original: client/css/theme.css | part 4 dari 6 | .numfield input; .numfield input::-webkit-outer-spin-button, .numfield input::-webkit-inner-spin-button; .numfield .spin; .numfield .spin button; .numfield .spin button:focus, .numfield .spin button:focus-visible, .numfield .spin but...; .numfield .spin button:hover; .dropzone.over; .photo-grid -->
```css


/* ---------- numeric spinner (dibuat oleh app.js) ---------- */
.numfield { position: relative; display: block; }
.numfield input {
  -moz-appearance: textfield;
  padding-right: 26px;
}
.numfield input::-webkit-outer-spin-button,
.numfield input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.numfield .spin {
  position: absolute; right: 3px; top: 3px; bottom: 3px;
  display: flex; flex-direction: column; width: 18px;
  border-radius: 4px; overflow: hidden;
}
.numfield .spin button {
  flex: 1 1 50%; background: transparent; border: 0; color: var(--txt-faint);
  cursor: pointer; font-size: 7px; line-height: 1; padding: 0;
  display: flex; align-items: center; justify-content: center;
  transition: .12s;
  outline: none; -webkit-appearance: none;
}
.numfield .spin button:focus,
.numfield .spin button:focus-visible,
.numfield .spin button:active { outline: none; box-shadow: none; }
.numfield .spin button:hover { color: #063b30; background: var(--sec3-icon); }

/* ---------- checkbox & radio ---------- */
input[type="radio"], input[type="checkbox"] { accent-color: var(--sec3-icon); }

/* ---------- photo source ---------- */
.dropzone {
  border: 1px dashed #606063;
  border-radius: var(--radius);
  padding: 12px;
  background: rgba(0, 0, 0, .10);
  transition: .15s;
}
.dropzone.over { border-color: var(--sec1-icon); background: var(--sec1-soft); }
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(94px, 1fr));
  gap: 10px;
}
.photo-grid:empty { display: none; }
.photo-card {
  background: var(--bg-3); border: 1px solid var(--line);
  border-radius: var(--radius-sm); overflow: hidden; position: relative;
  transition: border-color .13s, transform .13s;
}
.photo-card:hover { border-color: var(--sec1-icon); transform: translateY(-1px); }
.photo-card .thumb { width: 100%; height: 84px; object-fit: cover; display: block; background: #2a2a2c; }
.photo-card .ph {
  width: 100%; height: 84px; display: grid; place-items: center;
  color: var(--txt-faint); font-size: 22px; background: #2e2e30;
}
.photo-card .meta { padding: 6px 8px; display: flex; align-items: center; gap: 6px; }
.photo-card .dot {
  width: 7px; height: 7px; border-radius: 50%; flex: 0 0 auto; background: var(--sec1-icon);
  box-shadow: 0 0 0 2px rgba(56, 187, 250, .18);
}
.photo-card .nm {
  font-size: 10.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
  background: transparent; border: 0; color: var(--txt); padding: 0; font-family: inherit;
}
.photo-card .nm:focus { outline: none; color: var(--sec1-ink); }
.photo-card .del {
  position: absolute; top: 5px; right: 5px; width: 20px; height: 20px; border-radius: 50%;
  background: rgba(30, 30, 32, .82); color: #fff; border: 1px solid rgba(255, 255, 255, .14);
  cursor: pointer; line-height: 1; font-size: 12px; display: grid; place-items: center; padding: 0;
}
.photo-card .del:hover { background: var(--red); border-color: var(--red); }

.photo-card .bg-row {
  display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
  padding: 0 8px 7px;
}
.bg-swatch, .bg-custom {
  width: 14px; height: 14px; border-radius: 50%; flex: 0 0 auto;
  border: 1px solid rgba(255, 255, 255, .22); cursor: pointer; padding: 0;
  background-color: #fff; transition: transform .1s, border-color .1s;
}
.bg-swatch:hover, .bg-custom:hover { transform: scale(1.12); }
.bg-swatch.active, .bg-custom.active {
  border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft);
}
.bg-swatch.none {
  background-color: #3a3a3c;
  background-image:
    linear-gradient(45deg, #6b6b6d 25%, transparent 25%, transparent 75%, #6b6b6d 75%),
    linear-gradient(45deg, #6b6b6d 25%, transparent 25%, transparent 75%, #6b6b6d 75%);
  background-size: 6px 6px;
  background-position: 0 0, 3px 3px;
}
.bg-custom {
  position: relative; overflow: hidden;
  background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red);
}
.bg-custom input[type="color"] {
  position: absolute; inset: -4px; width: 22px; height: 22px;
  border: 0; padding: 0; cursor: pointer; background: none;
}

/* ---------- FIX 1: hint teks dibuat sangat subtle / kecil ----------
   Teks "Drag & drop file JPG / PNG / TIFF ke sini, atau klik + Tambah Foto."
   sebelumnya terlalu menonjol dan mengganggu. Sekarang dibuat sangat kecil,
   dim, dan tanpa ikon besar supaya dropzone terlihat bersih. */
.hint {
  color: var(--txt-faint); font-size: 10px; margin: 6px 2px 0; line-height: 1.4;
}
.hint .ic { display: none; }
.hint b { color: var(--txt-dim); font-weight: 600; }
#photoHint {
  text-align: center; font-size: 9.5px; color: #6a6a6d; margin: 4px 0 0; padding: 0;
}
#photoHint .ic { display: none; }
#photoHint span { display: inline; }
#orderHint {
  display: flex; align-items: center; gap: 6px;
  color: var(--txt-faint); font-size: 10px; margin: 6px 2px 0;
}
#orderHint .ic { display: inline-block; width: 13px; height: 13px; vertical-align: -2px; margin-right: 4px; }
.photo-grid + .hint { margin-top: 10px; }

/* ---------- order rows ---------- */
.order-legend {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  font-size: 9.5px; letter-spacing: .07em; text-transform: uppercase;
  color: var(--txt-faint); padding: 0 2px 8px; border-bottom: 1px solid var(--line-soft);
}
.order-legend span { display: inline-flex; align-items: center; gap: 5px; }
.order-legend i {
  width: 4px; height: 4px; border-radius: 50%; background: #5c5c5f; display: inline-block;
}
.order-list { display: flex; flex-direction: column; }
.order-row {
  display: grid; grid-template-columns: 52px 1fr 1fr 1fr 32px;
  gap: 10px; align-items: center;
  padding: 10px 2px;
  border-bottom: 1px solid var(--line-soft);
}
.order-row.has-src { grid-template-columns: 52px 1fr 1fr 1fr minmax(90px, 1.4fr) 32px; }
.order-row:last-child { border-bottom: 0; }
.order-row .tag {
  font-weight: 700; font-size: 11px; color: var(--accent-ink);
  background: var(--accent-soft); border: 1px solid var(--accent-soft-2);
  border-radius: 6px; padding: 5px 0; text-align: center; letter-spacing: .02em;
}
.order-row .x {
  display: grid; place-items: center;
  background: transparent; border: 0; color: var(--red); cursor: pointer;
  justify-self: center; line-height: 1; padding: 5px; border-radius: 6px; transition: .12s;
}
.order-row .x .ic { width: 18px; height: 18px; stroke-width: 2; color: var(--red); }
.order-row .x:hover { color: #fff; background: var(--red); }
.order-row .x:hover .ic { color: #fff; }

/* ---------- media & struktur output ---------- */
/* #mediaLayoutBody (.media-layout-grid) collapsible, default tersembunyi -
   persis seperti .structure-body di bawahnya, dibuka lewat #mediaLayoutToggle. */
.media-layout-grid { display: none; gap: 18px; align-items: stretch; flex-wrap: wrap; animation: structureOpen .15s ease; }
.media-layout-grid.open { display: flex; }
.media-fields { flex: 1 1 320px; min-width: 0; }
.structure-panel {
  flex: 1 1 250px; min-width: 0;
  border-left: 1px solid var(--line); padding-left: 18px;
}
.label-mini {
  display: flex; align-items: center; gap: 6px;
  font-size: 10px; text-transform: uppercase; letter-spacing: .08em;
  color: var(--txt-dim); margin-bottom: 11px; font-weight: 700;
}
.label-mini .ic { width: 13px; height: 13px; color: var(--accent-2); }

.structure-toggle {
  width: 100%; background: none; border: 0; padding: 5px 6px; margin: -5px -6px 0; cursor: pointer;
  font-family: inherit; text-align: left; border-radius: var(--radius-xs);
}
.structure-toggle:hover { color: var(--txt); background: var(--bg-3); }
```
