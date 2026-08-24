# Pas Foto Print — Production Manager

Plugin CEP untuk Adobe Illustrator (2021+) — auto-layout pas foto ke
dalam lembar cetak (A4, A5, 4R, 10R, dst), lengkap dengan slot editor
untuk mengedit posisi, crop, background, dan foto per-slot langsung di
artboard.

Versi saat ini: **2.7.0** (lihat `CSXS/manifest.xml`). Riwayat
perubahan lengkap ada di [`CHANGELOG.md`](./CHANGELOG.md). Peta
arsitektur untuk yang mau menyunting kode (termasuk AI coding
assistant) ada di [`CLAUDE.md`](./CLAUDE.md).

## Fitur utama

- Import beberapa foto sumber sekaligus, atau ambil langsung dari objek
  yang dipilih di Illustrator.
- Order ukuran (4x6, 3x4, 2x3, 2R–8R, dll) dengan quantity per baris,
  termasuk shortcut "Paket Cetak Foto" (4x6=4, 3x4=4, 2x3=6).
- Auto-layout ke lembar cetak dengan beberapa strategi packing sesuai
  media (blok referensi untuk A4/A5, guillotine bin-packing untuk media
  lain) — lihat `client/js/layout-engine.js`.
- Slot Editor: geser posisi, crop, zoom, duplikat, dan ganti background
  warna per slot atau per ukuran, langsung pada hasil yang sudah
  di-generate ke artboard.
- Generate ulang yang mempertahankan edit manual sebelumnya (background,
  foto, crop per-slot) selama baris pesanan ukurannya tidak dihapus.
- Panel juga bisa dibuka langsung di browser (`client/index.html`) untuk
  mode preview saja — `bridge.js` mendeteksi otomatis apakah sedang
  berjalan di dalam host CEP atau tidak.

## Instalasi (mode developer / unsigned extension)

1. Salin folder `pas-photo-production/` ini ke folder ekstensi CEP:
   - **Windows**: `%APPDATA%\Adobe\CEP\extensions\pas-photo-production`
   - **macOS**: `~/Library/Application Support/Adobe/CEP/extensions/pas-photo-production`
2. Aktifkan `PlayerDebugMode` (ekstensi ini belum ditandatangani):
   - **Windows (Registry)**: `HKEY_CURRENT_USER\Software\Adobe\CSXS.11` →
     `PlayerDebugMode` = `"1"` (String)
   - **macOS (Terminal)**: `defaults write com.adobe.CSXS.11 PlayerDebugMode 1`
3. Buka/restart Adobe Illustrator, lalu buka panel via
   `Window > Extensions > Pas Foto Print`.

File `.debug` di root proyek sudah mengarahkan CEP debugger ke port
`8088` untuk host Illustrator (`ILST`) — berguna untuk attach Chrome
DevTools ke panel saat development.

## Struktur proyek

```
pas-photo-production/
├── CLAUDE.md                    peta arsitektur untuk dev/AI assistant
├── README.md                    dokumen ini
├── CHANGELOG.md                 riwayat perubahan lengkap
├── .debug                       konfigurasi debug CEP (port 8088)
├── CSXS/
│   ├── manifest.xml             deklarasi extension CEP (sumber versi resmi)
│   ├── English.xml              nama & deskripsi extension
│   └── panel-icon*.svg/png      ikon panel (lihat catatan di CHANGELOG.md)
├── lib/
│   └── CSInterface.js           library standar Adobe CEP (dipakai index.html)
├── host/
│   └── main.jsx                 ExtendScript — jalan di dalam Illustrator
└── client/
    ├── index.html               UI panel
    ├── app.json                 metadata locale/versi client
    ├── css/
    │   ├── theme.css            tema panel
    │   └── panel.css            layout panel
    ├── icons/                   ikon tombol di dalam panel
    └── js/
        ├── state.js             state panel + persistensi localStorage
        ├── bridge.js             jembatan panel <-> ExtendScript (PFBridge)
        ├── layout-engine.js      mesin penyusun layout (PFLayout)
        ├── bg-swap.js            chroma-key ganti background — BELUM disambungkan ke UI
        └── app.js                controller UI panel
```

## Catatan penting

- **`client/js/bg-swap.js` belum aktif.** File ini ada dan berfungsi
  secara mandiri (chroma-key background swap via canvas), tapi tidak
  dimuat oleh `client/index.html` dan tidak dipanggil dari mana pun.
  Sebelum menghapus atau menyambungkannya ke UI, cek dulu apakah ini
  fitur yang sengaja ditunda. Detail di `CHANGELOG.md`.
- **Ikon panel mungkin tampil generik** di menu `Window > Extensions`
  karena `CSXS/manifest.xml` belum punya blok `<Icons>` yang merujuk ke
  file PNG yang tersedia. Tidak memengaruhi fungsi generate/edit foto.
- Kode client (`client/js/*.js`) sengaja ditulis **ES5** (kompatibel
  dengan Chromium lama di CEP), dan `host/main.jsx` ditulis **ES3**
  (batasan ExtendScript Illustrator) — lihat `CLAUDE.md` untuk detail
  konvensi ini sebelum menambah kode baru.
