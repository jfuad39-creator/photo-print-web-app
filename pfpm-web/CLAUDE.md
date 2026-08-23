# Pas Foto Web - peta arsitektur & status

Konversi `pas-photo-production` (CEP plugin Illustrator) -> web app
`.html` standalone: klik 2x, offline, tanpa Illustrator, tanpa server.
Baca file ini duluan kalau lanjut kerja di proyek ini.

**Chroma-key (bg-swap.js) DIPANGKAS dari roadmap** - keputusan eksplisit
user, bukan sekadar ditunda. Jangan diusulkan lagi kecuali user minta
ulang.

## Struktur proyek

```
pfpm-web/
├── CLAUDE.md          file ini
├── build.sh            gabungkan src/ jadi 1 file HTML mandiri
├── src/                source development (terpisah per file, gampang diedit)
│   ├── index.html
│   ├── css/theme.css    hampir 100% reuse dari CEP, dipangkas class Illustrator-only
│   └── js/
│       ├── state.js         ADAPTASI dari CEP (foto = File object, bukan path)
│       ├── layout-engine.js REUSE VERBATIM dari CEP, TIDAK BOLEH DIUBAH sembarangan
│       │                    (algoritma packing sensitif, lihat komentar kepala
│       │                    file-nya sendiri + histori bug versi 2.6.0)
│       └── app.js           controller BARU, di-porting per tahap (lihat status)
└── dist/
    └── pas-foto-web.html   HASIL AKHIR yang dikirim ke user - dibuat oleh build.sh,
                             JANGAN diedit manual (akan tertimpa build berikutnya)
```

**Alur kerja tiap sesi:** edit file di `src/`, jalankan `./build.sh`,
baru `dist/pas-foto-web.html` yang dikasih ke user buat ditest.

## Status tahapan

- [x] **Tahap 1 - Form input** (selesai): Sumber Foto (file picker +
      drag-drop, browser File API, TIFF pakai placeholder karena browser
      juga tidak bisa render TIFF lewat `<img>`, sama seperti batasan di
      CEP), Order Ukuran, Media & Layout, Struktur & Output (minus opsi
      "Artboard per lembar"/"Timpa hasil sebelumnya" - konsep khusus
      Illustrator, tidak relevan tanpa dokumen Illustrator).
- [x] **Tahap 2 - Preview visual** (selesai, LEBIH CEPAT dari perkiraan
      awal): ternyata `preview()` versi CEP itu SUDAH rendering DOM/CSS
      murni (div ber-posisi absolut + `background-image` utk foto, CSS
      transform utk rotasi 90 derajat) - BUKAN Illustrator-dependent sama
      sekali. Jadi bukan "kanvas `<canvas>` dibangun dari nol" seperti
      dugaan awal di analisis kelayakan, cukup di-PORT: satu-satunya
      penyesuaian adalah pencocokan foto per slot lewat `sourceId` (di
      versi CEP lewat `path` filesystem, tidak ada padanannya di
      browser). Semua CSS class terkait (`.sheet-block`, `.sheet-stage`,
      `.ruler-h/v`, `.sheet`, `.sheet-guide`, `.slot`, `.slot-photo`,
      `.slot-border`) sudah ikut ter-reuse dari `theme.css` tanpa
      perubahan. Menampilkan: lembar per sheet dengan ruler mm, garis
      margin, tiap slot dengan thumbnail foto asli (background-image dari
      blob URL) terrotasi sesuai `slot.rotation`, warna bg custom kalau
      foto PNG transparan, dan border offset (kotak tipis di luar frame
      slot). Status efisiensi/jumlah foto tersusun tampil di bawah kotak
      preview. Diverifikasi lewat jsdom: 14/14 slot ter-render dengan
      benar (termasuk 4 slot 4x6 yang ter-rotasi 90 derajat di template
      referensi A5), toggle "Tanpa border" langsung menghilangkan semua
      elemen border secara live.
      **Batasan yang diwarisi dari versi CEP (bukan regresi baru):**
      `.slot-photo` selalu pakai `background-size:cover` - preview visual
      TIDAK membedakan fitMode "Isi penuh" vs "Muat penuh" (keduanya
      tampil sebagai cover/crop di layar); crop/zoom manual per-slot juga
      belum tercermin di preview (wajar, itu fitur tahap 3). Ini
      pendekatan yang SAMA dengan preview CEP - preview memang perkiraan
      kasar, bukan reproduksi pixel-perfect dari hasil generate/export
      final.
      **Cut-guide (garis panduan potong magenta) SENGAJA TIDAK digambar
      di preview** - di versi CEP pun itu cuma digambar langsung ke
      artboard Illustrator saat Generate (lihat `drawCutGuide` di
      `host/main.jsx`), bukan bagian dari preview panel. Ekuivalennya di
      web nanti muncul di hasil export PDF (tahap 4), bukan di layar.
- [x] **Tahap 3 - Slot editor interaktif** (selesai): klik slot di preview
      -> kartu "Slot Editor" muncul di bawahnya (markup/CSS class
      disamakan dengan tab Slot Editor versi CEP - `.editor-panel`,
      `.pad-grid`/`.pad-box`/`.dpad`/`.dpad-plus`, `.zoom-row`,
      `.tool-grid` - semua sudah ikut ke-reuse dari `theme.css`).
      Kontrol: dpad posisi (nudge 1mm/klik) + drag langsung di preview,
      dpad crop+zoom (+/-5%/10%, clamp 20-600%) + Reset Crop, Rotate 90°,
      Flip H/V, dropdown Ganti Foto (pilih dari foto yang sudah
      diunggah), swatch Background per-slot, Duplikat (dpad 4 arah,
      offset selebar/setinggi slot), Hapus (khusus duplikat), Reset Edit,
      tombol tutup.
      **Model data** (lihat state.js): slot ASLI hasil
      `PFLayout.generate()` di-override lewat `overrides[slotId]` (dx/dy,
      crop, rotationExtra, flipH/V, sourceId, backgroundColor - dikunci
      by slotId, sama seperti pola CEP tapi disimpan di memori JS
      langsung, bukan dibaca ulang dari dokumen karena memang tidak ada
      dokumen terpisah di web). Slot DUPLIKAT berdiri sendiri di
      `duplicates[]`, tidak lewat override sama sekali karena tidak ikut
      disusun ulang oleh layout-engine. `preview()` (app.js) menggabungkan
      keduanya lewat `resolveSlot()` sebelum render, dan diregenerasi utuh
      (`slotIndex` dibangun ulang) tiap ada perubahan supaya drag/klik
      selalu sinkron dengan DOM yang baru.
      **Penyesuaian sengaja dari versi CEP** (bukan bug, keputusan
      desain - lihat bagian bawah file ini):
       1. "Rotate 90°" cuma memutar KONTEN foto, bukan frame+border
          (CEP muter frame+border sekaligus, berisiko nabrak slot
          tetangga karena layout-engine tidak ikut dipanggil ulang).
       2. "Ganti Foto" jadi dropdown dari foto yang sudah diunggah,
          bukan file-dialog baru.
       3. "Hapus Slot" cuma tersedia utk duplikat - slot asli selalu
          muncul lagi mengikuti qty Order Ukuran walau "dihapus" (karena
          preview() generate ulang dari nol tiap kali, tidak baca state
          "canvas" terpisah seperti CEP) - makanya utk slot asli yang
          disediakan adalah "Reset Edit" (kembalikan ke default), bukan
          delete.
      Diverifikasi lengkap lewat jsdom: klik pilih, nudge, rotate, flip,
      zoom, ganti background, duplikat (+1 slot), DRAG (mousedown ->
      mousemove live-update posisi elemen tanpa render ulang -> mouseup
      commit + render ulang, posisi konsisten sebelum/sesudah), hapus
      duplikat (kembali ke jumlah slot semula), reset edit, tutup panel -
      semua lolos tanpa error. Sempat ketemu 1 bug nyata saat testing
      (`dragState.startX/startY` lupa di-set di awal drag, bikin posisi
      jadi NaN dan macet di posisi lama) - sudah diperbaiki & diverifikasi
      ulang, dicatat di sini sebagai pengingat: SELALU test drag lewat
      jsdom (mousedown+mousemove+mouseup manual), jangan asumsikan
      "kelihatannya benar" dari baca kode saja.
      **Belum ada di tahap ini** (bisa menyusul kalau diminta, bukan
      prioritas sekarang): multi-select (baru single-select), snap-to-
      grid saat drag, undo/redo, persist overrides/duplicates ke
      localStorage (hilang kalau halaman di-reload, sama seperti foto -
      lihat catatan desain soal ini).
- [ ] **Tahap 4 - Export PDF presisi + print**: window.print() (proof)
      dan export PDF ukuran fisik exact + raster 300dpi (final, lewat
      jsPDF atau serupa, di-embed langsung bukan CDN).
- ~~Tahap 5 - Aktifkan bg-swap.js chroma key~~ **DIPANGKAS, tidak
      dikerjakan.**
- [x] **Layout 3 kolom resizable** (selesai, di luar urutan tahap semula -
      request tambahan setelah tahap 3): Setup (kiri) | Preview (tengah)
      | Slot Editor (kanan), aktif di layar >=1100px lewat `#layoutRoot`
      (`grid-template-columns: var(--w-a) 10px minmax(380px,1fr) 10px
      var(--w-c)`). Dua `.resizer` (kiri & kanan) bisa di-drag mouse ATAU
      di-fokus+panah kiri/kanan (aksesibilitas) buat atur lebar kolom
      Setup/Slot Editor secara independen (kolom Preview otomatis
      mengisi sisa). Lebar di-clamp 240-640px, disimpan sebagai CSS var
      `--w-a`/`--w-c` di `#layoutRoot`, dan diinget lewat localStorage key
      TERPISAH `pfweb.layout.v1` (bukan lewat PFState/state.js - ini
      preferensi TAMPILAN, bukan bagian dari data job cetak).
      Kolom Slot Editor SEKARANG SELALU KELIHATAN (dulu cuma muncul saat
      ada slot terpilih) - saat kosong, isinya diganti pesan
      `.sel-info.empty` + `#editorBody` diberi class `.disabled`
      (meredup + non-aktif, pola yang sama persis dengan `#selInfo`/
      `.editor.disabled` versi CEP), bukan disembunyikan total -
      `#previewHint` yang lama (di kartu Preview) dihapus karena pesan
      ajakannya sudah pindah ke sini.
      Di layar sempit (<1100px), `.resizer` disembunyikan total lewat
      CSS dan `.layout` balik ke 1 kolom stacking vertikal seperti
      sebelum ada resizer (Setup -> Preview -> Slot Editor berurutan ke
      bawah) - tidak perlu deteksi breakpoint di JS sama sekali, listener
      resize tetap terpasang tapi tidak akan pernah terpicu karena
      elemennya display:none.
      Di layar lebar, tiap kolom scroll SENDIRI-SENDIRI (independent
      scroll - `body{height:100vh;overflow:hidden}` + `main{flex:1}` +
      `.col{overflow-y:auto;height:100%}`, pola umum aplikasi 3-panel
      spt Figma/Photoshop) supaya kolom Setup yang pendek tidak ikut
      kebawa scroll panjang oleh kolom Preview yang bisa berisi banyak
      lembar.
      Diverifikasi lewat jsdom: toggle empty/disabled saat pilih & tutup
      slot, drag resizer kiri (Setup melebar +dx) & kanan (Slot Editor
      MENYEMPIT -dx, arah sengaja dibalik - lihat komentar di app.js),
      clamp di batas MAX_W, resize via keyboard (ArrowLeft/Right saat
      resizer difokus), dan localStorage persistence (gagal dgn aman
      lewat try/catch di lingkungan file:// yang membatasi localStorage,
      sesuai catatan "localStorage kadang dibatasi tergantung browser"
      dari konteks proyek awal - TIDAK bikin app crash).

## Keputusan desain penting (jangan diubang tanpa alasan kuat)

- **`layout-engine.js` tidak disentuh sama sekali** dari versi CEP -
  murni geometri, tidak ada dependency Illustrator, plug-and-play. Kalau
  ada bug packing, cek dulu apakah itu bug lama yang sudah ada di versi
  CEP juga (baca CHANGELOG.md versi 2.6.0 di proyek CEP-nya) sebelum
  menyalahkan hasil konversi ini.
- **`state.js` tidak mem-persist foto** ke localStorage sama sekali
  (File object tidak bisa diserialisasi) - PERSIS seperti perilaku versi
  CEP yang juga selalu reset foto tiap sesi baru (`load()` di sana pun
  begitu, walau alasannya beda). Media/opsi JUGA sengaja tidak
  di-resume otomatis dari localStorage saat ini (sama seperti versi CEP)
  - `save()` menulis ke localStorage tapi belum ada yang membaca
    baliknya; ini titik yang tepat kalau nanti mau nambah resume
    otomatis.
- **`sourcePath` di buildJob() sengaja dikosongkan** ("") - versi CEP
  pakai field ini untuk `new File(path)` di ExtendScript, tidak relevan
  di browser. Identitas foto tiap slot cukup lewat `sourceId`, di-lookup
  balik ke `PFState.photoById()` saat render/export nanti.
- **Fitur "Dari Seleksi" (ambil foto dari objek terpilih di Illustrator)
  gugur permanen** - tidak ada padanannya di browser murni, sudah
  digantikan drag-drop/file-picker yang sudah ada.
- **build.sh pakai FUNCTION sebagai replacer di `.replace()`, bukan
  string** - kalau string, `$$` di app.js (nama fungsi
  `function $$(sel)`) ketelan jadi `$` tunggal oleh pola substitusi
  `$$` -> `$` milik `String.replace()`. Sudah pernah kena bug ini
  sekali, jangan diulang kalau nulis ulang build.sh dari nol.
