<!-- AI CONTEXT | original: client/css/panel.css | part 2 dari 4 | .card--mint .label-mini .ic; .card--yellow .step-badge; .card--yellow .card-head h2 .ic; .card--yellow .label-mini .ic; .card--red .step-badge; .card--red .card-head h2 .ic; .card--red .label-mini .ic; .btn:hover -->
```css

.card--mint .label-mini .ic { color: var(--sec3-icon); }

.card--yellow .step-badge { background: var(--sec4-soft); border-color: var(--sec4-soft-2); color: var(--sec4-ink); }
.card--yellow .card-head h2 .ic { color: var(--sec4-icon); }
.card--yellow .label-mini .ic { color: var(--sec4-icon); }

.card--red .step-badge { background: var(--sec5-soft); border-color: var(--sec5-soft-2); color: var(--sec5-ink); }
.card--red .card-head h2 .ic { color: var(--sec5-icon); }
.card--red .label-mini .ic { color: var(--sec5-icon); }

/* ---------- buttons ---------- */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  background: var(--bg-3);
  color: var(--txt);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 7px 11px;
  cursor: pointer;
  font-size: 11.5px;
  font-family: inherit;
  font-weight: 500;
  white-space: nowrap;
  transition: background .13s, border-color .13s, color .13s, transform .08s, box-shadow .13s;
}
.btn:hover { background: #545456; border-color: #666669; }
.btn:active { transform: translateY(1px); }
.btn:focus { outline: none; }
.btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.btn.small { padding: 6px 9px; font-size: 11px; }
.btn.ghost { background: transparent; }
.btn.ghost:hover { background: var(--bg-3); }
.btn.outline-accent {
  background: transparent; border-color: var(--accent-3); color: var(--accent-ink);
}
.btn.outline-accent:hover { background: var(--accent-soft); border-color: var(--accent); }
.btn.accent-soft {
  background: var(--accent-soft); border-color: var(--accent-soft-2); color: var(--accent-ink); font-weight: 600;
}
.btn.accent-soft:hover { background: var(--accent-soft-2); border-color: var(--accent); color: #d6fff8; }
.btn.primary {
  background: linear-gradient(135deg, var(--accent-2), var(--accent) 45%, var(--accent-3));
  border-color: var(--accent-3); color: #04302a; font-weight: 700;
  box-shadow: 0 5px 16px var(--accent-glow);
}
.btn.primary:hover { filter: brightness(1.07); }
.btn.danger { background: transparent; border-color: var(--line); color: #ff8f8a; }
.btn.danger:hover { background: rgba(249, 71, 58, .12); border-color: #6b3436; }
.btn.block { width: 100%; padding: 12px; font-size: 12.5px; }
#btnPrintPackage { margin-top: 10px; }
.btn.icon { padding: 7px; }
.btn[disabled] { opacity: .4; cursor: not-allowed; }
.btn-col { display: flex; flex-direction: column; gap: 3px; padding: 8px 6px; font-size: 10.5px; }
.btn-col .ic { width: 16px; height: 16px; }

/* ---------- inputs ---------- */
.input, select.input, input.input {
  width: 100%;
  background: var(--bg-4);
  border: 1px solid var(--line);
  color: var(--txt);
  border-radius: var(--radius-xs);
  padding: 7px 9px;
  font-size: 11.5px;
  font-family: inherit;
  transition: border-color .13s, box-shadow .13s;
}
.input:hover { border-color: #6a6a6d; }
.input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
.input.tiny { width: auto; padding: 6px 8px; }
select.input {
  -webkit-appearance: none; appearance: none;
  padding-right: 28px;
  background-image: linear-gradient(45deg, transparent 50%, var(--txt-dim) 50%),
                    linear-gradient(135deg, var(--txt-dim) 50%, transparent 50%);
  background-position: calc(100% - 16px) calc(50% + 1px), calc(100% - 11px) calc(50% + 1px);
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
}
select.input.tiny {
  padding: 6px 34px 6px 10px;
  min-width: 120px;
  background-position: calc(100% - 16px) calc(50% + 1px), calc(100% - 11px) calc(50% + 1px);
}
label { display: block; font-size: 10px; color: var(--txt-dim); letter-spacing: .03em; }
label > .input, label > .numfield { margin-top: 5px; }
.field-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 10px; text-transform: uppercase; letter-spacing: .07em; color: var(--txt-dim); font-weight: 600;
}
.field-label .ic { width: 12px; height: 12px; color: var(--txt-faint); }

.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
  gap: 11px 12px;
}
.custom-size-fields { grid-column: 1 / -1; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 11px 12px; }

.position-field { grid-column: 1 / -1; }
.position-options { display: flex; gap: 8px; margin-top: 6px; }
.pos-radio {
  flex: 1 1 0; display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 11px; color: var(--txt-dim); cursor: pointer; text-align: center; white-space: nowrap;
  padding: 7px 4px; border: 1px solid var(--line); border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, .10); transition: .13s;
}
.pos-radio input[type="radio"] {
  width: 13px; height: 13px; margin: 0; flex: 0 0 auto; cursor: pointer; accent-color: var(--accent);
}
.pos-radio:hover { border-color: #5a5a5d; background: rgba(9, 200, 201, .06); color: var(--txt); }
.pos-radio:has(input:checked),
.pos-radio.active {
  border-color: var(--accent-soft-2); background: var(--accent-soft); color: var(--accent-ink);
}

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
.numfield .spin button:hover { color: #04302a; background: var(--accent); }

/* ---------- checkbox & radio ---------- */
input[type="radio"], input[type="checkbox"] { accent-color: var(--accent); }

/* ---------- photo source ---------- */
.dropzone {
  border: 1px dashed #606063;
  border-radius: var(--radius);
  padding: 12px;
  background: rgba(0, 0, 0, .10);
  transition: .15s;
}
.dropzone.over { border-color: var(--accent); background: var(--accent-soft); }
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
.photo-card:hover { border-color: var(--accent-3); transform: translateY(-1px); }
.photo-card .thumb { width: 100%; height: 84px; object-fit: cover; display: block; background: #2a2a2c; }
.photo-card .ph {
  width: 100%; height: 84px; display: grid; place-items: center;
  color: var(--txt-faint); font-size: 22px; background: #2e2e30;
}
.photo-card .meta { padding: 6px 8px; display: flex; align-items: center; gap: 6px; }
.photo-card .dot {
  width: 7px; height: 7px; border-radius: 50%; flex: 0 0 auto; background: var(--accent);
  box-shadow: 0 0 0 2px rgba(9, 200, 201, .18);
}
```
