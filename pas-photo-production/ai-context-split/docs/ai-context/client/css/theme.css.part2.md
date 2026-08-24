<!-- AI CONTEXT | original: client/css/theme.css | part 2 dari 6 | .brand; .brand-txt; .brand-txt strong; .brand-sub; .logo; .logo .ic; .version-pill; .version-pill.action:hover -->
```css


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
/* "Generate" pill (menggantikan teks status "Illustrator ready") - dibuat
   bisa diklik & fungsinya delegasi ke tombol #btnGenerate yang sama persis
   (lihat app.js init()), jadi diberi cursor + hover supaya terlihat aktif. */
.version-pill.action {
  cursor: pointer;
  transition: background .13s, border-color .13s, color .13s, transform .08s;
}
.version-pill.action:hover { background: var(--accent-soft); border-color: var(--accent); color: var(--accent-ink); }
.version-pill.action:active { transform: translateY(1px); }
.topbar-actions { display: flex; gap: 3px; flex-wrap: wrap; }
/* Ikon di topbar diperbesar (13px -> 17px -> 21px sesuai permintaan
   berikutnya). Supaya baris tombolnya tetap muat 1 baris (tidak pecah ke
   baris ke-2), padding & gap tombol di topbar ini dikecilkan lagi
   secukupnya untuk mengimbangi tambahan lebar dari ikon yang lebih besar -
   total lebar baris jadi kira-kira sama seperti sebelumnya (17px), hanya
   ikonnya yang terlihat jauh lebih besar. */
.topbar-actions .btn { gap: 3px; }
.topbar-actions .btn.small { padding: 5px 6px; }
.topbar-actions .ic.ic-sm { width: 21px; height: 21px; }

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

/* .card-toggle: header yang sekaligus jadi tombol collapse/expand untuk
   seluruh isi card di bawahnya (dipakai pertama kali oleh card "Media &
   Layout" - lihat #mediaLayoutToggle/#mediaLayoutBody di index.html).
   Perilaku & tampilan chevron sengaja disamakan dengan .structure-toggle
   supaya kedua jenis panel collapsible di panel ini terasa konsisten. */
.card-toggle {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  width: 100%; background: none; border: 0; padding: 0; margin: 0;
  cursor: pointer; font-family: inherit; text-align: left;
}
.card-toggle .chevron { width: 14px; height: 14px; color: var(--txt-faint); transition: transform .18s; flex: 0 0 auto; }
.card-toggle[aria-expanded="true"] .chevron { transform: rotate(180deg); }

/* ---------- aksen warna-warni per section (hanya badge nomor + ikon
   judul kartu, dan ikon label-mini di dalam kartu yang sama) ----------
   Section 2 "Order Ukuran" sengaja tidak di-override: sudah memakai
   warna teal bawaan (--accent-2 / --accent-ink / --accent-soft*). */
.card--navy .step-badge { background: var(--sec1-soft); border-color: var(--sec1-soft-2); color: var(--sec1-ink); }
.card--navy .card-head h2 .ic { color: var(--sec1-icon); }
.card--navy .label-mini .ic { color: var(--sec1-icon); }

.card--mint .step-badge { background: var(--sec3-soft); border-color: var(--sec3-soft-2); color: var(--sec3-ink); }
.card--mint .card-head h2 .ic { color: var(--sec3-icon); }
.card--mint .label-mini .ic { color: var(--sec3-icon); }

.card--yellow .step-badge { background: var(--sec4-soft); border-color: var(--sec4-soft-2); color: var(--sec4-ink); }
.card--yellow .card-head h2 .ic { color: var(--sec4-icon); }
.card--yellow .label-mini .ic { color: var(--sec4-icon); }

.card--red .step-badge { background: var(--sec5-soft); border-color: var(--sec5-soft-2); color: var(--sec5-ink); }
.card--red .card-head h2 .ic { color: var(--sec5-icon); }
.card--red .label-mini .ic { color: var(--sec5-icon); }

/* ---- ekstensi warna-warni: class yang DIPAKAI BERSAMA di lebih dari 1
   section (tombol accent-soft/outline-accent/primary, fokus input, swatch
   background) di-override per section di sini supaya tiap section konsisten
   pakai warna identitasnya sendiri. Section 2 "Order Ukuran" & elemen global
   (topbar, toast, scrollbar) SENGAJA tidak di-override, tetap warna teal
   bawaan (--accent*), jadi tetap ada 1 warna "netral". ---- */
.card--navy .btn.accent-soft { background: var(--sec1-soft); border-color: var(--sec1-soft-2); color: var(--sec1-ink); }
.card--navy .btn.accent-soft:hover { background: var(--sec1-soft-2); border-color: var(--sec1-icon); color: #eaf7ff; }
.card--navy .bg-swatch.active, .card--navy .bg-custom.active { border-color: var(--sec1-icon); box-shadow: 0 0 0 2px var(--sec1-soft); }

.card--mint .input:focus { border-color: var(--sec3-icon); box-shadow: 0 0 0 2px var(--sec3-soft); }

.card--yellow .btn.outline-accent { border-color: var(--sec4-icon); color: var(--sec4-ink); }
.card--yellow .btn.outline-accent:hover { background: var(--sec4-soft); border-color: var(--sec4-icon); }
.card--yellow .btn.primary {
  background: linear-gradient(135deg, var(--sec4-ink), var(--sec4-icon) 60%);
  border-color: var(--sec4-icon); color: var(--sec4-btn-ink);
  box-shadow: 0 5px 16px var(--sec4-glow);
}

.card--red .btn.accent-soft { background: var(--sec5-soft); border-color: var(--sec5-soft-2); color: var(--sec5-ink); }
.card--red .btn.accent-soft:hover { background: var(--sec5-soft-2); border-color: var(--sec5-icon); color: #fff0ef; }
.card--red .btn.primary {
  background: linear-gradient(135deg, var(--sec5-ink), var(--sec5-icon) 60%);
  border-color: var(--sec5-icon); color: var(--sec5-btn-ink);
  box-shadow: 0 5px 16px var(--sec5-glow);
}
.card--red .input:focus { border-color: var(--sec5-icon); box-shadow: 0 0 0 2px var(--sec5-soft); }
.card--red .bg-swatch.active, .card--red .bg-custom.active { border-color: var(--sec5-icon); box-shadow: 0 0 0 2px var(--sec5-soft); }

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
```
