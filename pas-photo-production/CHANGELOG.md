# Changelog — Pas Foto Print (Production Manager)

Semua perubahan penting proyek ini dicatat di file ini, urut dari yang
terbaru. Sebelum file ini dibuat, riwayat perbaikan tersebar di tiga
tempat berbeda (`README.md`, `README.txt`, `CHANGELOG-FIX.md`) dan di
komentar kepala masing-masing file kode — semuanya sudah digabung ke sini
pada proses rapi-rapi struktur proyek.

> Catatan: versi resmi yang berlaku adalah yang tertulis di
> `CSXS/manifest.xml` (`ExtensionBundleVersion`), karena itu yang
> benar-benar dibaca Illustrator. String versi di dalam kode
> (`client/js/app.js`, `host/main.jsx`) sudah disinkronkan ke nilai yang
> sama pada pembersihan ini — sebelumnya sempat tidak sinkron (manifest
> 2.7.0, tapi teks di panel menampilkan "v2.4.0" dan `host` melapor
> "2.3.0").

## [2.7.4] — Fix: 2.7.3 cuma benar untuk slot BARU, slot lama masih ketuker

Susulan dari 2.7.3. Setelah dicoba: sebagian foto masih ketuker warnanya
(ganti background malah mewarnai bar caption) - tapi tidak semua. Penyebab:
fix 2.7.3 (`markCaptionPart`/`isCaptionPart`) menandai bar caption lewat
`.note` SAAT DIBUAT - tapi slot yang sudah ada di artboard dari HASIL
GENERATE SEBELUM 2.7.3 terlanjur digambar tanpa tag itu sama sekali. Untuk
slot lama itu, `findBgRect()` masih balik ke perilaku lama (anggap match
pertama yang ditemukan sebagai background) dan tetap salah ambil bar
caption. Itu sebabnya sebagian foto (yang sempat di-generate sebelum
update) masih bermasalah, sementara slot yang baru digenerate v2.7.3
sudah benar.

**Fix**: `findBgRect()`/`findCaptionBar()`/`findCaptionText()` sekarang
tidak bergantung 100% ke tag itu. Tambahan lapis kedua yang berlaku
untuk SEMUA versi (lama maupun baru): bar caption dari dulu selalu
ditaruh PALING DEPAN (`PLACEATBEGINNING`) dan background rect studio dari
dulu selalu ditaruh PALING BELAKANG (`PLACEATEND`) di dalam clipGroup -
urutan ini tidak pernah berubah sejak fitur caption pertama ada, jauh
sebelum 2.7.3. `findBgRect()` sekarang mengambil match PALING BELAKANG
(bukan match pertama yang ditemukan), `findCaptionBar()` mengambil match
PALING DEPAN sebagai fallback kalau tidak ada yang bertanda, dan
`findCaptionText()` disederhanakan (cuma ada satu TextFrame yang mungkin
ada di situ - teks caption - jadi tidak butuh tag sama sekali). Slot lama
maupun baru sekarang sama-sama benar, tanpa perlu di-generate ulang.

File yang berubah: `host/main.jsx` (`findBgRect`/`findCaptionBar`/
`findCaptionText`). Versi naik ke 2.7.4.

## [2.7.3] — Fix: ganti background malah mengubah warna band caption + fitur baru Font & Kerning Label

**Bug (regresi sejak caption ada di clipGroup sebagai PathItem tambahan):**
`findBgRect()` mencari background rect studio dengan asumsi lama "di dalam
clipGroup cuma ada 2 kemungkinan PathItem: clip mask & background" - lupa
kalau bar putih caption (`addCaptionBar()`) JUGA sebuah PathItem non-clip
di clipGroup yang sama. Akibatnya `findBgRect()` bisa salah mengembalikan
BAR CAPTION sebagai kalau itu background studio. Efeknya, lewat Slot
Editor > Ganti Background: warna yang harusnya jadi warna backdrop foto
malah mewarnai ulang bar putih caption-nya; kalau background di-set "tanpa
warna", bar caption-nya malah ikut TERHAPUS. Bug yang sama juga membuat
`rebuildPhoto()` (dipanggil saat ganti foto manual) berpotensi salah
menyusun ulang z-order bar caption jadi ke belakang foto (caption jadi
tak kelihatan). **Fix**: bar caption sekarang ditandai (`markCaptionPart`,
lewat `.note` seperti pola tag lain di file ini) supaya `findBgRect()`
bisa melewatinya secara eksplisit, bukan menebak dari urutan.

**Fitur baru: Font & Kerning Label** - diminta lewat chat: atur ukuran
font dan tracking (kerning) label teks berdasarkan ukuran & seleksi di
artboard, mengikuti pola yang sudah ada di fitur Ganti Background:
- **Slot Editor tab, kotak "Font & kerning label"** (di dalam `.pad-grid`,
  otomatis nonaktif kalau tidak ada seleksi di kanvas, sama seperti
  kotak Posisi/Crop/Duplikat): tombol +/-1pt & +/-0.5pt untuk ukuran
  font, +/-10 & +/-50 untuk tracking, dan tombol "Reset Label" (kembali
  ke default panel Label & tracking 0). Semua tombol ini DELTA (nambah/
  ngurang dari ukuran yang sedang aktif di artboard), bukan nilai
  mutlak - konsisten dengan tombol zoom crop yang sudah ada.
- **Kotak "Font & Kerning Label per Ukuran"** (selalu aktif, tidak butuh
  seleksi - sama seperti kotak Ganti Background di atasnya): isi delta
  ukuran font dan/atau tracking, pilih ukuran (mis. 4x6) dari dropdown,
  lalu terapkan ke SEMUA slot ukuran itu di dokumen sekaligus.
- Teks caption otomatis di-**recenter** ke titik tengah bar putihnya
  setelah ukuran/tracking berubah - posisi tidak pernah geser.
- Hasil atur manual (`captionFontSizeOverride`/`captionTracking`)
  disimpan di meta tiap slot & **dipertahankan lintas generate ulang**
  (lewat `collectPreservedState`, sama seperti crop/flip/background) -
  dan begitu ada override manual, auto-fit ukuran font dari 2.7.1
  otomatis DILEWATI untuk slot itu supaya tidak menimpa balik pilihan
  manual user setiap generate ulang.
- `#selInfo` (info seleksi di Slot Editor) sekarang juga menampilkan
  ukuran font & tracking label yang sedang aktif, saat tepat satu slot
  berlabel aktif terpilih (indikator hijau, di bawah indikator warna
  background yang sudah ada).

File yang berubah: `host/main.jsx` (`findBgRect`/`markCaptionPart`/
`isCaptionPart` baru, `findCaptionBar`/`findCaptionText`/
`adjustCaptionOnSlot` baru, `api.captionAdjust`/`api.captionAdjustBySize`
baru, `addCaptionBar` menerima `style.tracking`/`style.autoFit`,
`createSlot`/`collectPreservedState` menyimpan & mengoper override baru),
`client/index.html` (kotak "Font & kerning label" + "Font & Kerning Label
per Ukuran" baru), `client/js/app.js` (wiring tombol baru + indikator
`capLiveIndicatorHtml`, `renderBgSizeTarget` digeneralisasi jadi
`renderSizeTargetSelect` dipakai bareng oleh dropdown background & label).
Versi naik ke 2.7.3.

## [2.7.2] — Fix: caption di-center termasuk margin offsetBorder, bukan cuma band capH

Susulan dari 2.7.1. Setelah 2.7.1 dicoba, laporan lanjutan: teks caption
memang sudah center, tapi HANYA di dalam bar putih tambahan (band setinggi
`captionHeightMm`/capH) - bukan di tengah keseluruhan AREA PUTIH yang
kelihatan mata, yang sebenarnya juga mencakup margin `offsetBorder` (jarak
kosong antara tepi foto dan garis border hitam) di sisi caption. Karena
band capH itu cuma sebagian dari area putih itu, teks kelihatan nempel ke
sisi foto dan nyisa banyak putih kosong di sisi luar (dekat garis border).

**Percobaan pertama** (sekarang dibatalkan): memindah bar+teks caption
keluar dari `clipGroup` ke `parent` (setingkat dengan garis offsetBorder)
supaya boleh melebar sampai margin tanpa kepotong clip mask. Ternyata ini
match berbahaya - `nudge`/`rotate90`/`duplicateSlot`/`deleteSlot` semuanya
menggerakkan/memutar/menduplikasi/menghapus slot dengan cara mem-perlakukan
`clipGroup` + border (lewat `borderItemsForSlot`) sebagai satu kesatuan;
caption yang jadi item lepas di `parent` tidak ikut ter-track sama sekali
oleh mekanisme itu → berpotensi caption ketinggalan/tidak ikut saat slot
dipindah, diputar manual, diduplikasi, atau dihapus. Pendekatan ini
DIBATALKAN sebelum dirilis setelah ditemukan risikonya, bukan cuma
di-tweak - lihat histori edit `host/main.jsx` bila perlu detail teknisnya.

**Fix final (dipakai)**: caption tetap jadi ANAK `clipGroup` seperti
semula (supaya nudge/rotate90/duplicate/delete tidak perlu disentuh sama
sekali - semuanya bekerja dengan rigid-transform `clipGroup` apa adanya).
Yang berubah: clip mask `clipGroup` itu sendiri "diperlebar" sejauh
`offsetBorder`, KHUSUS di sisi caption saja (bawah untuk band horizontal,
kanan untuk band tegak/rotated) - sehingga band capH ikut melebar mencakup
margin offsetBorder itu, dan caption boleh di-center di area yang lebih
besar itu tanpa kepotong clip. Posisi garis offsetBorder sendiri (yang
digambar terpisah lewat `drawOffsetBorder`) TIDAK berubah - kebetulan
persis jatuh di tepi clip mask yang baru, jadi caption menyambung rapi ke
garis border. Ukuran & posisi FOTO tidak ikut berubah - `photoFrame` tetap
dihitung dari `fw`/`fh`/`capH` yang ASLI (bukan versi yang diperlebar).

Efek samping kecil yang disengaja: karena band tempat teks di-fit sekarang
sedikit lebih besar (`capH + offsetBorder`, bukan cuma `capH`), auto-fit
ukuran font dari 2.7.1 punya sedikit lebih banyak ruang untuk membesar -
biasanya cuma beda beberapa persen dengan `offsetBorder` default (1.5mm).

File yang berubah: `host/main.jsx` - `addCaptionBar()` (balik jadi anak
`clipGroup`, tidak berubah banyak dari 2.7.1), `createSlot()` (tambah
`fwClip`/`fhClip`/`capHVisual` utk memperlebar clip mask & band di sisi
caption), `rebuildPhoto()` (baca ukuran clip yang sudah diperlebar itu,
kurangi lagi `offsetBorder`-nya sebelum dipakai hitung ulang `capH2` /
posisi foto saat foto diganti manual lewat Slot Editor - supaya hasilnya
tetap konsisten dengan hasil generate awal). Versi naik ke 2.7.2.

## [2.7.1] — Fix: label teks caption (posisi tengah, auto-size, hairline gap)

Tiga bug dilaporkan bareng pada fitur label teks (mis. nama sekolah) di
`addCaptionBar()` (`host/main.jsx`), semuanya di area yang sama:

1. **Teks tidak berada di tengah area putih** — paling kelihatan di slot
   yang band caption-nya diputar 90° (band tegak di sisi kanan, dipakai
   untuk slot besar seperti 4x6). Penyebab: `tf.rotate(..., Transformation.
   CENTER)` di Illustrator berputar mengelilingi titik tengah *geometric*
   bounds teks (metrik frame font), sedangkan centering sebelum rotate
   memakai titik tengah *visibleBounds* (tinta yang benar-benar tampak) —
   selisih antara keduanya membuat teks geser dari tengah band begitu
   diputar. **Fix**: tambah langkah re-center SETELAH rotate() — ukur
   ulang `visibleBounds` lalu geser sekali lagi ke titik tengah band yang
   sebenarnya.
2. **Ukuran/panjang teks di slot 4x6 tidak otomatis menyesuaikan** —
   auto-shrink lama cuma mengecek satu sumbu (sumbu "panjang" band) dan
   cuma bisa mengecilkan font, tidak pernah membesarkan. Di band tegak
   slot 4x6 (panjangnya = tinggi foto, jauh lebih panjang dari teksnya)
   ini bikin font tetap kecil sesuai angka fontSize di panel, tidak
   pernah ikut menyesuaikan ruang yang tersedia — dan sumbu "tebal" band
   sama sekali tidak pernah dicek. **Fix**: auto-fit sekarang mengecek
   DUA sumbu (panjang & tebal) sekaligus, bisa membesarkan maupun
   mengecilkan font (dibatasi maksimal 4x fontSize panel, minimal 3pt),
   supaya ukuran label selalu proporsional dengan besar band-nya.
3. **Ada gap kecil warna background di sekeliling area putih caption** —
   trap overlap antara bar putih caption dan clip mask cuma 0.5pt,
   kadang masih kelihatan sebagai garis rambut tipis di hasil
   export/print. **Fix**: trap dinaikkan ke 1.2pt.

File yang berubah: `host/main.jsx` (`addCaptionBar()`). Tidak ada
perubahan pada `layout-engine.js`, `app.js`, atau `state.js` — murni
perbaikan rendering caption di sisi Illustrator. Versi dinaikkan ke
2.7.1 (`CSXS/manifest.xml`, `client/js/app.js`, `host/main.jsx`).

## [Unreleased] — perbaikan UX hasil review

- **Fix (revisi ke-2): kotak "Ganti Background Foto" masih terasa
  menyatu dengan blok yang redup di atasnya, walau sudah dikasih
  divider.** Percobaan pertama (divider tipis berlabel "SELALU AKTIF —
  TIDAK PERLU SELEKSI" antara `#editorBody` dan `.bg-editor-box`) masih
  membuat `.bg-editor-box` terasa seperti kelanjutan kartu "5. Slot
  Editor" yang bisa terlihat mati, karena keduanya masih duduk di
  aliran (flow) kartu yang sama tanpa batas kotak yang jelas. Diganti
  jadi perbaikan struktural: `#selInfo` + `#editorBody` sekarang
  dibungkus bareng jadi `.editor-panel` (kotak sendiri, gaya sama
  seperti `.pad-box` — latar sedikit lebih gelap + border) supaya area
  yang bisa meredup punya batas kotak yang tegas. `.bg-editor-box` jadi
  kotak terpisah yang SETARA persis di bawahnya — bukan lagi pemisah
  divider di tengah alur — lengkap dengan kepala kotak sendiri
  (`.bg-editor-head`) dan badge hijau "⚡ Selalu aktif"
  (`.bg-editor-badge`, sengaja beda warna dari merah `--sec5-icon`
  identitas kartu supaya terbaca sebagai status "hidup", bukan cuma
  identitas section) di kanan judul. Border kiri aksen merah pada
  `.bg-editor-box` (konvensi yang sama dipakai `.sel-info`)
  dipertahankan. Tidak ada perubahan logika/behaviour JS — `#editorBody`
  dan `#selInfo` tetap punya id yang sama persis, JS di `app.js` yang
  men-toggle `.disabled` tidak disentuh — murni restrukturisasi markup
  di `client/index.html` + styling di `client/css/theme.css`.

  **Revisi lanjutan:** border kiri aksen merah pada `.bg-editor-box`
  dihapus lagi — dengan kepala kotak + badge hijau sudah cukup untuk
  menandai status "selalu aktif", garis merah tebal di satu sisi malah
  jadi satu-satunya elemen beraksen warna di antara kotak-kotak netral
  lain di kartu ini (`.pad-box`, `.editor-panel`) sehingga terlihat
  tidak balance. Border `.bg-editor-box` sekarang polos, identik dengan
  `.editor-panel`/`.pad-box` (`border: 1px solid var(--line-soft)`)
  supaya seluruh kotak di kartu "5. Slot Editor" konsisten satu bahasa
  visual, dan `.sel-info` (di dalam `.editor-panel`) tetap memakai
  border kiri merahnya sendiri seperti semula karena itu konvensi lama
  yang independen dari perubahan ini.
- **Fix: layout 2 kolom di panel tidak pernah bisa aktif.** CSS
  (`client/css/panel.css`) sudah punya 3 tingkat breakpoint dua-kolom
  (`min-width: 940px`, `1280px`, `1680px`), tapi `CSXS/manifest.xml`
  membatasi `MaxSize` lebar panel hanya `900px` — jadi di dalam
  Illustrator, breakpoint itu tidak pernah tercapai berapa pun panel
  di-resize, dan panel selalu tampil satu kolom. `MaxSize` lebar
  dinaikkan ke `1800px` (tinggi tidak diubah) supaya layout dua kolom
  yang sudah dirancang benar-benar bisa dipakai saat panel dilebarkan
  atau di-undock. Tidak ada perubahan CSS.
- **Fix: nama aksesibel tombol ikon-only hanya mengandalkan `title`.**
  Menambahkan `aria-label` (senada dengan `title` yang sudah ada) pada
  28 tombol ikon-only yang sebelumnya tidak punya teks/label visible:
  topbar (Undo, Ungroup, Reset Artboard, Print, Reset), tombol refresh
  seleksi di Slot Editor, serta ketiga D-pad (posisi/nudge, crop,
  duplikat) di Slot Editor. Tombol yang sudah punya teks visible (mis.
  "Flip H", "Reset Crop", tombol zoom) tidak disentuh karena sudah
  punya nama aksesibel dari teksnya sendiri.
- **Fitur: kartu "5. Slot Editor" dipecah jadi tab tersendiri, terpisah
  dari alur Setup.** Ditambahkan tab bar (`#tabBtnSetup` /
  `#tabBtnEditor`) di atas `.layout` - tab "Setup" berisi kartu 1-4
  (Sumber Foto, Order Ukuran, Media & Layout, Preview + tombol
  Generate) seperti semula, tab "Slot Editor" berisi kartu 5 (Ganti
  Background + Slot Editor) sendirian, full-width. Pemisahan ini aman
  karena Slot Editor membaca seleksi kanvas Illustrator langsung lewat
  polling `refreshSelection` tiap 1.4 detik di `app.js`, independen
  dari `#preview` - jadi tetap sinkron walau tab-nya sedang tidak
  aktif. Pindah tab murni manual (tidak auto-pindah setelah klik
  Generate). Satu hal yang perlu dijaga: `preview()` bisa saja dipicu
  dari topbar (popup "Buat Dokumen Baru", tombol Reset) selagi tab
  Setup sedang disembunyikan (`#preview` punya `clientWidth` 0 saat
  itu) - `switchTab()` sengaja memanggil ulang `preview()` setiap kali
  pindah KE tab Setup supaya lebar preview selalu dihitung ulang
  dengan benar, bukan mengandalkan fallback 320px di dalam `preview()`.

## [2.7.0] — versi manifest saat ini

Tidak ditemukan catatan perubahan tertulis untuk lompatan ke 2.7.0 di
paket sumber (kemungkinan bump versi manifest tanpa entri dokumentasi
terpisah saat itu). String versi di `app.js` dan `host/main.jsx`
disamakan ke 2.7.0 pada pembersihan struktur ini agar konsisten dengan
manifest.

## [2.6.1] — Fix: preview benar, artboard masih pakai foto/warna lama

- `slotId` pada pool ukuran yang digabung kini tetap memakai ID & nomor
  urut dari baris order asal — penggabungan pool hanya memengaruhi
  perhitungan geometri packing, bukan identitas slot.
- `host/main.jsx` tidak lagi selalu memulihkan `sourcePath` lama secara
  otomatis. Foto lama hanya dipertahankan jika memang diganti manual
  lewat tombol **Ganti Foto** di Slot Editor (`sourceOverridden: true`).
  Perubahan sumber foto dari dropdown panel langsung berlaku saat
  Generate.
- Aturan yang sama berlaku untuk warna background: warna dari panel jadi
  sumber utama, kecuali background slot memang diedit manual setelah
  Generate (`backgroundOverridden: true`).

## [2.6.0] — Fix layout A5 berantakan & gap di media 10R

**Masalah:**
1. Media A5 dengan order yang punya >1 baris ukuran fisik sama (mis. dua
   baris "4x6" dengan foto sumber/warna latar beda — kasus umum saat
   tombol "Paket Cetak Foto" dipakai dua kali) tersusun berantakan,
   tidak seperti blok referensi yang rapi.
2. Media di luar A4/A5 (mis. 10R) menyisakan gap kosong padahal foto
   lain seharusnya masih muat.

**Akar masalah:** setiap baris di Order Ukuran (`state.items`) selalu
jadi satu pool item terpisah di `layout-engine.js`, walau dua baris
punya ukuran fisik identik. `packReferenceA4()`/`packReferenceA5()`
lewat `findSize()` hanya mengambil satu item pertama yang cocok —
baris kedua dst dengan ukuran sama diabaikan lalu "bocor" ke
`packSheet()` generik. `packSheet()` sendiri memperlakukan tiap baris
sebagai batch kapasitas terpisah, jadi grid yang harusnya penuh malah
terpecah jadi blok-blok kecil dengan sisa ruang yang tidak dipakai
ulang.

**Perbaikan:** fungsi baru `mergeRowsBySize()` di `layout-engine.js`,
dipanggil di awal `build()` sebelum data masuk ke `packReferenceA4`,
`packReferenceA5`, `packSheet`, atau `packHorizontalShelf`. Baris-baris
dengan ukuran fisik identik digabung jadi satu pool item ber-`qty`
gabungan; identitas asli tiap baris (foto, warna latar, label, sizeId)
tetap tersimpan di array `segments` pool tersebut. `addSlot()` menarik
segmen berikutnya lewat `nextSegment()` sehingga tiap slot tetap
menampilkan foto/warna sesuai baris order aslinya, berurutan.

Tidak ada algoritma packing yang diubah — yang berubah hanya data yang
dikirim ke algoritma tersebut.

## [2.5.2] — Perbaikan preview

- Kalkulasi skala preview: mengurangi extra margin agar lembar cetak
  tidak terpotong saat container sempit.
- `renderSizePresets()` sekarang selalu dipanggil saat init supaya
  preset 2R–8R selalu tersedia.

## [2.4.1] — Fix: Ganti Background pada slot yang sudah di-generate

Fitur "Ganti Background Foto" di Slot Editor:

1. **Terapkan ke Slot Terpilih** — pilih satu/lebih slot di Illustrator,
   pilih warna, terapkan ke slot yang dipilih.
2. **Terapkan ke Ukuran Ini** — pilih ukuran dari dropdown, terapkan ke
   SEMUA slot berukuran itu sekaligus tanpa pilih satu-satu.

**Akar masalah (root cause):** `client/js/state.js` (`buildJob()`)
membentuk id unik per baris order dengan menggabungkan `sizeId` +
suffix acak (mis. `"4x6|ab12"`), lalu `layout-engine.js` memakai id
gabungan ini sebagai `sizeId` tiap slot hasil generate. Akibatnya dua
baris order dengan ukuran fisik sama menghasilkan `sizeId` berbeda pada
slot yang tersimpan di Illustrator — sementara dropdown "Terapkan ke
Ukuran Ini" mengirim `sizeId` mentah (mis. `"4x6"`) ke
`host/main.jsx` (`api.setBackgroundBySize`), yang tidak pernah cocok,
sehingga pencarian slot selalu menghasilkan 0 hasil (pesan error
"Tidak ada slot ukuran ... di dokumen ini").

**Perbaikan (murni tambah field, tidak mengubah algoritma layout):**
- `client/js/state.js` — `buildJob()` mengirim field `sizeId` mentah
  terpisah dari `id` komposit (yang tetap dipakai untuk membentuk
  `slotId`).
- `client/js/layout-engine.js` — `build()`/`addSlot()` menyimpan
  `sizeId` dari field baru itu (fallback ke id lama bila tidak ada) ke
  `slot.sizeId`.
- `host/main.jsx` — fungsi `collectAllSlots()` baru untuk mengiterasi
  semua slot di seluruh layer dokumen (bukan hanya `doc.pageItems` yang
  cuma mengembalikan item top-level); API `getGeneratedSizes` baru
  untuk daftar ukuran unik dari slot yang sudah di-generate;
  `setBackgroundBySize` diperbaiki memakai `collectAllSlots()`.
- `client/js/app.js` — fungsi `refreshBgSizeTarget()` baru untuk mengisi
  dropdown ukuran dari slot yang ada di dokumen; dropdown di-refresh
  setelah generate, delete slot, dan reset artboard.

## Sebelum v2.4.0 — riwayat lama (versi persis tidak tercatat)

Perubahan berikut ada di riwayat proyek tapi tidak terikat ke nomor
versi yang presisi di paket sumber:

- **Generate ulang tidak lagi menghapus edit manual.** Sebelumnya,
  `api.generate()` dengan opsi "Ganti hasil sebelumnya" aktif (default)
  selalu menghapus seluruh layer hasil generate lama lalu membangun
  ulang dari nol, sehingga edit manual di artboard (ganti
  background/foto per-slot, crop, flip, slot hasil Duplicate) ikut
  hilang. Sekarang, sebelum layer lama dihapus, `collectPreservedState()`
  mengambil edit tersebut dari slot yang sudah ada (dikenali lewat
  `slotId` yang stabil lintas generate). Slot hasil "Duplicate" (di luar
  struktur baris pesanan) dipindah ke layer tersendiri, tidak ikut
  dihapus/disusun ulang. Batasan yang disengaja: rotasi manual ("Putar
  90") pada satu slot tidak ikut dipertahankan otomatis, karena bisa
  membuat foto/bingkai tidak sinkron dengan hasil susun ulang baru.
- Tombol **"Doc" (Create New Document)** memakai
  `app.documents.addDocument(preset, DocumentPreset, false)` — jalur
  internal yang sama dengan menu File > New bawaan Illustrator, supaya
  viewport tidak melompat/scroll ke pasteboard.
- Tombol **"Generate ke Illustrator"** memakai koordinat artboard aktif
  sebagai anchor dan mengembalikan indeks artboard aktif setelah selesai.
- Ikon panel didesain ulang (grid 2×2 / kamera sederhana). File SVG
  referensi: `CSXS/panel-icon-normal.svg`, `panel-icon-dark.svg`,
  `panel-icon-rollover.svg`.

## Catatan tentang aset & fitur yang belum lengkap

- **Ikon panel biner** (`CSXS/panel-icon*.png` dan `client/icons/*.png`)
  ada di paket tapi **tidak dirujuk di mana pun** — `CSXS/manifest.xml`
  tidak punya blok `<Icons>`, jadi Illustrator kemungkinan menampilkan
  ikon generik di menu Window > Extensions. File SVG referensi
  (`panel-icon-normal.svg`, `panel-icon-dark.svg`,
  `panel-icon-rollover.svg`) tersedia sebagai basis bila ingin
  menghasilkan ulang PNG dan menyambungkannya lewat `<Icons>` di
  manifest.
- **`client/js/bg-swap.js`** (chroma-key ganti background otomatis,
  mengekspor `window.PFBg`) **tidak dimuat** oleh `client/index.html` —
  tidak ada `<script src="js/bg-swap.js">`, dan tidak ada kode lain yang
  memanggil `PFBg`. Ini kemungkinan fitur yang belum selesai
  disambungkan ke UI, dibiarkan apa adanya (tidak dihapus) sampai ada
  keputusan untuk menyelesaikan atau membuang fitur ini. Lihat
  `CLAUDE.md` bagian "Hal yang perlu diperhatikan".
- **`client/lib/CSInterface.js`** (polyfill CSInterface v7.0.0) adalah
  duplikat yang **tidak pernah dipakai** — `client/index.html` memuat
  `../lib/CSInterface.js` (library CEP asli di root `lib/`), bukan
  yang di `client/lib/`. File duplikat ini **dihapus** pada pembersihan
  struktur proyek ini.
