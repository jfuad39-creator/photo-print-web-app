<!-- AI CONTEXT | original: client/css/theme.css | part 3 dari 6 | .btn:hover; .btn:active; .btn:focus; .btn:focus-visible; .btn.small; .btn.ghost; .btn.ghost:hover; .btn.outline-accent -->
```css

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
/* Tombol "Generate ke Illustrator" - gradient ungu > pink > hijau tosca
   sesuai referensi desain, dibedakan dari .btn.primary default (teal)
   supaya tidak ikut mengubah warna tombol lain yang juga pakai class ini
   (mis. #btnBgApplySize di atas). */
#btnGenerate.btn.primary {
  background: linear-gradient(90deg, #ff4698 0%, #ff7a59 45%, #12f3f5 100%);
  /* FIX: base .btn menetapkan "border: 1px solid var(--line)" (abu-abu).
     Sebelumnya di sini hanya border-color yang di-override jadi
     transparent, TANPA menghapus lebar bordernya (tetap 1px, hanya
     warnanya transparan). Border transparan 1px yang digabung dengan
     border-radius 999px (bentuk pill penuh) menimbulkan seam/garis samar
     tepat di kedua ujung yang paling melengkung, karena rendering lapisan
     border (walau transparan) tidak selalu menyatu sempurna dengan
     lapisan background gradient di baliknya - celah anti-aliasing itu
     yang membuat sedikit warna var(--line) (abu-abu, dari .btn) terlihat
     bocor di kedua ujung tombol. Pakai "border: none" (menghapus SELURUH
     lapisan border, bukan cuma warnanya) supaya tidak ada lapisan border
     yang perlu di-render sama sekali - gradient tombol jadi mengisi
     bentuk pill dengan bersih tanpa seam di kedua ujung. */
  border: none; color: #ffffff;
  box-shadow: 0 5px 16px rgba(255, 70, 152, .3), 0 5px 18px rgba(18, 243, 245, .18);
  /* Bentuk pill (stadium) + kapsul ikon terpisah menempel di ujung kanan,
     mengikuti referensi desain tombol yang diminta. Warna (gradient di atas),
     warna teks, dan ikon (bolt) SENGAJA tidak diubah sama sekali - hanya
     bentuk/susunannya yang direvisi. */
  display: flex; align-items: stretch; justify-content: flex-start;
  gap: 0;
  border-radius: 999px;
  padding: 4px;
}
#btnGenerate.btn.primary:hover { filter: brightness(1.07); }
.btn-generate-label {
  flex: 1 1 auto;
  display: flex; align-items: center; justify-content: center;
  padding: 8px 6px 8px 22px;
}
.btn-generate-icon {
  flex: 0 0 auto;
  width: 36px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, .22);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .32), 0 2px 6px rgba(0, 0, 0, .18);
}
.btn-generate-icon .ic { width: 17px; height: 17px; }
/* "Terapkan ke Ukuran Ini" - solid orange, dibedakan dari tombol primary
   (teal/gradient) supaya tidak ikut berubah warna tombol Generate lain
   yang juga pakai class .btn.primary. */
#btnBgApplySize.btn.primary {
  background: var(--orange);
  border-color: var(--orange);
  color: #3a2100;
  box-shadow: 0 5px 16px rgba(245, 179, 76, .35);
}
#btnBgApplySize.btn.primary:hover { filter: brightness(1.07); }
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
  /* height + line-height eksplisit (bukan cuma padding vertikal) supaya
     teks pilihan select tidak terpotong di bagian atas - beberapa versi
     Chromium/CEF menghitung kotak konten select dari line-height, bukan
     dari padding, jadi kalau cuma andalkan padding teks bisa ke-clip. */
  height: 32px;
  line-height: 30px;
  padding: 0 28px 0 9px;
  background-image: linear-gradient(45deg, transparent 50%, var(--txt-dim) 50%),
                    linear-gradient(135deg, var(--txt-dim) 50%, transparent 50%);
  background-position: calc(100% - 16px) calc(50% + 1px), calc(100% - 11px) calc(50% + 1px);
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
}
select.input.tiny {
  height: 30px;
  line-height: 28px;
  padding: 0 34px 0 10px;
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
  /* rata bawah: kalau label di satu kolom kepanjangan sampai turun 2 baris
     (mis. "Margin kiri/kanan/bawah (mm)"), kolom sebelahnya yang labelnya
     cuma 1 baris (mis. "Gap (mm)") ikut didorong ke bawah juga, supaya
     kotak inputnya tetap sejajar sebaris - bukan cuma nempel rata atas. */
  align-items: end;
}
.custom-size-fields { grid-column: 1 / -1; }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 11px 12px; align-items: end; }

.position-field { grid-column: 1 / -1; }
.position-options { display: flex; gap: 8px; margin-top: 6px; }
.pos-radio {
  flex: 1 1 0; display: flex; align-items: center; justify-content: center; gap: 6px;
  font-size: 11px; color: var(--txt-dim); cursor: pointer; text-align: center; white-space: nowrap;
  padding: 7px 4px; border: 1px solid var(--line); border-radius: var(--radius-xs);
  background: rgba(0, 0, 0, .10); transition: .13s;
}
.pos-radio input[type="radio"] {
  width: 13px; height: 13px; margin: 0; flex: 0 0 auto; cursor: pointer; accent-color: var(--sec3-icon);
}
.pos-radio:hover { border-color: #5a5a5d; background: rgba(159, 216, 197, .10); color: var(--txt); }
.pos-radio:has(input:checked),
.pos-radio.active {
  border-color: var(--sec3-soft-2); background: var(--sec3-soft); color: var(--sec3-ink);
}
```
