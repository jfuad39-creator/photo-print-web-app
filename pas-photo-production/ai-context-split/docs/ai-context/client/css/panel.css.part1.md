<!-- AI CONTEXT | original: client/css/panel.css | part 1 dari 4 | *; html, body; ::-webkit-scrollbar; ::-webkit-scrollbar-track; ::-webkit-scrollbar-thumb; ::-webkit-scrollbar-thumb:hover; .ic; .ic-sm -->
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

  /* --red TIDAK diubah: dipakai khusus untuk ikon/tombol hapus (trash),
     supaya warnanya tetap seperti semula sesuai permintaan. */
  --green: #34d399;
  --orange: #f5b34c;
  --red: #f9473a;

  --radius: 12px;
  --radius-sm: 8px;
  --radius-xs: 6px;
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

/* ---------- topbar ---------- */
.topbar {
  position: sticky; top: 0; z-index: 30;
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; flex-wrap: wrap;
  padding: 9px 14px;
  background: linear-gradient(180deg, #454547, #3e3e40);
  border-bottom: 1px solid var(--line);
}
.brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.brand-txt { display: flex; flex-direction: column; line-height: 1.15; min-width: 0; }
.brand-txt strong { font-size: 13px; font-weight: 700; letter-spacing: .01em; white-space: nowrap; }
.brand-sub {
  font-size: 9.5px; letter-spacing: .16em; text-transform: uppercase; color: var(--txt-faint);
}
.logo {
  width: 32px; height: 32px; flex: 0 0 auto;
  display: grid; place-items: center;
}
.logo .ic { width: 32px; height: 32px; stroke: none; }
.version-pill {
  background: var(--bg-3); border: 1px solid var(--line); color: var(--accent-ink);
  font-size: 9.5px; font-weight: 600; padding: 3px 9px; border-radius: 20px; letter-spacing: .04em;
  white-space: nowrap;
}
.topbar-actions { display: flex; gap: 6px; flex-wrap: wrap; }

/* ---------- card ---------- */
.card {
  background: var(--bg-2);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 13px 14px 14px;
}
.card-head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; flex-wrap: wrap; margin-bottom: 12px;
}
.card-head h2 {
  margin: 0; display: flex; align-items: center; gap: 8px;
  font-size: 11.5px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; color: #f2f2f3;
}
.card-head h2 .ic { color: var(--accent-2); }
.step-badge {
  display: inline-grid; place-items: center;
  width: 18px; height: 18px; border-radius: 6px;
  background: var(--accent-soft); border: 1px solid var(--accent-soft-2);
  color: var(--accent-ink); font-size: 10px; font-weight: 700; letter-spacing: 0;
}
.head-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

/* ---------- aksen warna-warni per section (hanya badge nomor + ikon
   judul kartu, dan ikon label-mini di dalam kartu yang sama) ----------
   Section 2 "Order Ukuran" sengaja tidak di-override: sudah memakai
   warna teal bawaan (--accent-2 / --accent-ink / --accent-soft*). */
.card--navy .step-badge { background: var(--sec1-soft); border-color: var(--sec1-soft-2); color: var(--sec1-ink); }
.card--navy .card-head h2 .ic { color: var(--sec1-icon); }
.card--navy .label-mini .ic { color: var(--sec1-icon); }

.card--mint .step-badge { background: var(--sec3-soft); border-color: var(--sec3-soft-2); color: var(--sec3-ink); }
.card--mint .card-head h2 .ic { color: var(--sec3-icon); }
```
