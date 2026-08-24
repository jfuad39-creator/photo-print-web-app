<!-- AI CONTEXT | original: client/css/theme.css | part 1 dari 6 | *; html, body; ::-webkit-scrollbar; ::-webkit-scrollbar-track; ::-webkit-scrollbar-thumb; ::-webkit-scrollbar-thumb:hover; .ic; .ic-sm -->
```css
/* =====================================================================
 * Pas Foto Print - panel theme (dark, redesign v2.5.2)
 * ---------------------------------------------------------------------
 * REDESIGN UI ONLY - tidak ada perubahan logika / algoritma.
 *  - Accent color: HIJAU TOSCA (teal).
 *  - Background panel: abu-abu gelap sesuai referensi gambar 3.
 *  - Garis dekoratif tepi kiri (rail gradient) DIHAPUS.
 *  - Dropdown preset ukuran diberi spacing lebih lega.
 *  - Preview fit container (tanpa scroll horizontal).
 *  - Numfield spinner padding diperlebar agar angka tidak mepet panah.
 *  - Hint teks dropzone dibuat minimal, tidak mengganggu.
 *  - Semua class/ID yang dipakai app.js dipertahankan persis.
 *
 * FIX v2.5.2:
 *  1. Teks hint dropzone ("Drag & drop...") dibuat sangat subtle / kecil.
 *  2. Preview sheet tidak lagi terpotong horizontal.
 *  3. Preset ukuran foto (2R-8R) dijaga lewat state.js reset setiap sesi.
 * ===================================================================== */

:root {
  /* ---- background panel: abu-abu gelap (sesuai gambar referensi 3) ---- */
  --bg: #3c3c3e;
  --bg-2: #434345;
  --bg-3: #4a4a4c;
  --bg-4: #363638;
  --line: #555558;
  --line-soft: #4e4e50;
  --txt: #f0f0f1;
  --txt-dim: #a8a8aa;
  --txt-faint: #808083;

  /* ---- accent: diselaraskan dengan skema warna baru (lihat referensi
     palet: navy #023852, teal #079fa0, mint #9fd8c5, yellow #fac005,
     red #dc2e2f). --accent* tetap dipakai UNIVERSAL untuk semua elemen
     interaktif (tombol, input focus, checkbox/radio, scrollbar, dll)
     agar seluruh panel tetap konsisten & kontras teks tetap aman;
     diturunkan dari swatch teal (#079fa0) mengikuti proporsi lightness
     ramp accent lama. Warna lain di palet dipakai sebagai aksen
     identitas per-section (lihat --sec1/--sec3/--sec4/--sec5 di bawah,
     dipakai hanya pada step-badge & ikon judul tiap section). */
  --accent: #09c8c9;
  --accent-2: #12f3f5;
  --accent-3: #079fa0;
  --accent-ink: #85eff0;
  --accent-soft: rgba(9, 200, 201, .14);
  --accent-soft-2: rgba(9, 200, 201, .28);
  --accent-glow: rgba(9, 200, 201, .35);

  /* ---- aksen identitas per-section (step-badge + ikon judul saja) ----
     1 Sumber Foto = navy, 2 Order Ukuran = teal (pakai --accent* di atas,
     tanpa override), 3 Media & Layout = mint, 4 Preview = yellow,
     5 Slot Editor = red. Setiap pasangan -icon/-ink sudah dicek kontras
     terhadap --bg-2 (kartu): icon >= 3:1 (elemen grafis/non-teks),
     ink >= 4.5:1 (teks angka pada badge). */
  --sec1-icon: #38bbfa;
  --sec1-ink: #a3daf5;
  --sec1-soft: rgba(2, 56, 82, .22);
  --sec1-soft-2: rgba(2, 56, 82, .45);

  --sec3-icon: #9fd8c5;
  --sec3-ink: #bcdfd3;
  --sec3-soft: rgba(159, 216, 197, .16);
  --sec3-soft-2: rgba(159, 216, 197, .38);

  --sec4-icon: #fac005;
  --sec4-ink: #f6e2a2;
  --sec4-soft: rgba(250, 192, 5, .16);
  --sec4-soft-2: rgba(250, 192, 5, .38);

  --sec5-icon: #e97c7d;
  --sec5-ink: #ebadad;
  --sec5-soft: rgba(220, 46, 47, .16);
  --sec5-soft-2: rgba(220, 46, 47, .38);

  /* token tambahan (permintaan: accent colors dibuat warna-warni) - dipakai
     untuk memperluas identitas warna tiap section ke tombol/kontrol lain
     (bukan cuma step-badge & ikon judul seperti sebelumnya). --red / trash
     TIDAK disentuh sama sekali. */
  --sec4-glow: rgba(250, 192, 5, .35);
  --sec4-btn-ink: #2e2400;
  --sec5-glow: rgba(233, 124, 125, .35);
  --sec5-btn-ink: #3a0f10;

  /* --red TIDAK diubah: dipakai khusus untuk ikon/tombol hapus (trash),
     supaya warnanya tetap seperti semula sesuai permintaan. */
  --green: #34d399;
  --orange: #f5b34c;
  --red: #f9473a;

  --radius: 12px;
  --radius-sm: 8px;
  --radius-xs: 6px;

  /* Tinggi topbar aktual (px), dihitung & di-update oleh app.js
     (syncTopbarHeight, lihat init() + resize listener) supaya elemen lain
     yang ikut di-pin di bawah topbar (.tab-bar) selalu pas menempel tanpa
     celah/tabrakan walau topbar-actions wrap ke baris ke-2 di panel
     sempit. 60px hanya fallback sebelum JS sempat mengukur. */
  --topbar-h: 60px;
}

* { box-sizing: border-box; }

/* Reset default browser focus ring (muncul sebagai kotak putih saat klik) pada
   semua tombol & kontrol interaktif. Cukup di elemen dasarnya (bukan hanya
   dalam :focus) supaya spesifisitasnya mengalahkan default UA agent stylesheet. */
button, button:focus,
input[type="radio"], input[type="radio"]:focus,
input[type="checkbox"], input[type="checkbox"]:focus,
select, select:focus {
  outline: none;
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--txt);
  font: 12px/1.5 "Segoe UI", -apple-system, Tahoma, sans-serif;
  -webkit-user-select: none;
  user-select: none;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #5a5a5d; border-radius: 8px; border: 2px solid var(--bg); }
::-webkit-scrollbar-thumb:hover { background: var(--accent-3); }

/* ---------- icon system ---------- */
.icon-sprite { display: none; }
.ic {
  width: 15px; height: 15px; flex: 0 0 auto;
  stroke: currentColor; fill: none;
  stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round;
}
.ic-sm { width: 13px; height: 13px; }
.ic-lg { width: 18px; height: 18px; }
.ic-xl { width: 26px; height: 26px; stroke-width: 1.4; }

/* ---------- shell ---------- */
main {
  position: relative;
  padding: 12px 12px 22px 12px;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}
.col { display: flex; flex-direction: column; gap: 12px; min-width: 0; }

/* ---------- tab bar (Setup / Slot Editor) ----------
   Di-pin (sticky) tepat di bawah topbar supaya tetap kelihatan & bisa
   diklik saat isi panel di-scroll. top:var(--topbar-h) diukur otomatis
   dari tinggi topbar sesungguhnya lewat JS (app.js syncTopbarHeight())
   supaya tetap presisi walau topbar-actions wrap ke baris ke-2 di panel
   sempit. Background solid (bukan transparan) supaya konten yang lewat
   di baliknya saat scroll benar-benar tertutup, + shadow tipis di bawah
   sebagai penanda visual "melayang" di atas konten. */
.tab-bar {
  display: flex; gap: 6px; margin-bottom: 14px;
  background: var(--bg-2); border: 1px solid var(--line);
  border-radius: var(--radius-sm); padding: 4px;
  position: sticky; top: var(--topbar-h); z-index: 25;
  box-shadow: 0 6px 10px -6px rgba(0, 0, 0, .4);
}
.tab-btn {
  flex: 1 1 0; display: flex; align-items: center; justify-content: center; gap: 7px;
  background: none; border: 0; border-radius: var(--radius-xs);
  padding: 9px 10px; cursor: pointer; font-family: inherit;
  font-size: 11.5px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
  color: var(--txt-dim); transition: background .15s, color .15s;
}
.tab-btn .ic { color: var(--txt-faint); transition: color .15s; }
.tab-btn:hover { color: var(--txt); }
.tab-btn.active { background: var(--bg-4); color: var(--txt); box-shadow: inset 0 0 0 1px var(--line-soft); }
.tab-btn.active .ic { color: var(--accent-2); }
#tabBtnEditor.active { color: var(--sec5-ink); }
#tabBtnEditor.active .ic { color: var(--sec5-icon); }

.tab-panel { display: none; }
.tab-panel.active { display: block; }
```
