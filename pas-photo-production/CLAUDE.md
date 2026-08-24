# CLAUDE.md — Peta proyek untuk AI coding assistant

Dokumen ini untuk AI assistant (atau developer baru) yang perlu
memahami proyek ini dengan cepat sebelum menyunting kode. Untuk fitur
dan cara pakai, lihat `README.md`. Untuk riwayat perubahan, lihat
`CHANGELOG.md`.

## Apa proyek ini

CEP (Common Extension Platform) panel untuk Adobe Illustrator. Bukan
web app biasa — ada dua runtime terpisah yang berkomunikasi lewat
`evalScript`:

1. **Panel/UI** (`client/`) — jalan di Chromium embed (CEF) di dalam
   Illustrator, atau di browser biasa untuk mode preview.
2. **Host** (`host/main.jsx`) — ExtendScript, jalan *di dalam* proses
   Illustrator, punya akses langsung ke dokumen/artboard/pageItems.

Panel tidak pernah menyentuh dokumen Illustrator secara langsung — semua
manipulasi dokumen lewat pemanggilan fungsi di `host/main.jsx` via
`CSInterface.evalScript()`, dibungkus oleh `client/js/bridge.js`.

## Alur data

```
client/index.html (UI)
   ↓ event tombol
client/js/app.js (controller)
   ↓ baca/tulis
client/js/state.js (state + localStorage, key "pfpm.state.v22")
   ↓ buildJob()
client/js/layout-engine.js (hitung posisi tiap slot di lembar cetak)
   ↓ hasil layout
client/js/app.js → PFBridge.call("generate", job)
   ↓ evalScript, lewat lib/CSInterface.js
host/main.jsx  →  PFPM.generate(jsonString)  (jalan di Illustrator)
   ↓ manipulasi DOM Illustrator (artboard, pageItems, layer)
   ↓ return JSON string
client/js/bridge.js parse(raw) → callback ke app.js
```

Konvensi pemanggilan host: `PFBridge.call("namaFungsi", args, callback)`
mengeksekusi `PFPM.namaFungsi("<json encoded>")` di `host/main.jsx` lewat
`evalScript`. Semua fungsi publik host ada di object `api` / namespace
`PFPM` di `host/main.jsx` — cari definisinya di sana sebelum menambah
fungsi baru dari sisi panel.

## Modul kunci dan tanggung jawabnya

| File | Tanggung jawab |
|---|---|
| `client/js/state.js` | Satu-satunya sumber kebenaran untuk data form panel (foto sumber, order ukuran, pengaturan media). Persist ke `localStorage`. `buildJob()` mengubah state jadi payload untuk layout-engine. |
| `client/js/layout-engine.js` (`PFLayout`) | Algoritma packing murni (tidak menyentuh DOM/Illustrator). `mergeRowsBySize()` menggabungkan baris order dengan ukuran fisik sama sebelum packing (lihat CHANGELOG 2.6.0) — **jangan hapus langkah ini**, tanpanya layout A5/10R kembali berantakan. |
| `client/js/bridge.js` (`PFBridge`) | Satu-satunya jalur komunikasi ke `host/main.jsx`. Semua pemanggilan host **harus** lewat sini, jangan panggil `evalScript` langsung dari `app.js`. |
| `client/js/app.js` | Controller UI: bind event tombol, render preview, orkestrasi state → layout-engine → bridge. |
| `client/js/bg-swap.js` (`PFBg`) | Chroma-key ganti background otomatis via `<canvas>`. **Belum dimuat** di `index.html` — lihat bagian "Hal yang perlu diperhatikan" di bawah sebelum menyentuh file ini. |
| `host/main.jsx` | Semua manipulasi dokumen Illustrator: generate slot ke artboard, `collectAllSlots()` (iterasi semua slot lintas layer), `collectPreservedState()` (simpan edit manual sebelum generate ulang), ganti background/foto per slot. |
| `lib/CSInterface.js` | Library resmi Adobe CEP, dimuat langsung oleh `client/index.html` (`<script src="../lib/CSInterface.js">`). Jangan bingung dengan file lain bernama sama — hanya ada satu sekarang, di `lib/`, bukan di `client/lib/`. |

## Batasan teknis yang wajib dipatuhi

- **`client/js/*.js` harus ES5.** CEP memakai Chromium versi lama;
  jangan pakai `let`/`const`/arrow function/class/template literal di
  file-file ini.
- **`host/main.jsx` harus ES3 (ExtendScript)**, bukan ES5 sekalipun.
  Tidak ada `JSON` bawaan — ada polyfill manual di kepala file, jangan
  hapus. Tidak ada `Array.prototype.map/filter/forEach` versi modern
  tanpa polyfill — cek dulu sebelum pakai method array baru.
- **Path di `CSXS/manifest.xml` bersifat relatif dan rapuh.**
  `MainPath` (`./client/index.html`) dan `ScriptPath` (`./host/main.jsx`)
  serta path dalam `<script src>` di `index.html` (`../lib/CSInterface.js`,
  `css/theme.css`, `js/*.js`) **tidak boleh dipindah/direname** tanpa
  update semua rujukan tersebut — memindah folder untuk "kerapian" bisa
  membuat panel gagal load di Illustrator.
- **Jangan mengubah algoritma di `layout-engine.js`** (`packReferenceA4`,
  `packReferenceA5`, `packSheet`, `packHorizontalShelf`) tanpa memahami
  riwayat bug di `CHANGELOG.md` versi 2.6.0 — algoritma ini sensitif
  terhadap bagaimana data pool item dibentuk sebelum dikirim ke sana.

## Konvensi versi & dokumentasi (berlaku sejak pembersihan struktur ini)

Sebelumnya, riwayat perbaikan ditulis sebagai komentar naratif panjang
di kepala tiap file kode yang disunting — membuat file sulit dibaca
karena logika aktual tertimbun narasi bug lama, dan versi antar file
jadi tidak sinkron (lihat `CHANGELOG.md` bagian atas untuk detail
ketidaksinkronan yang sempat terjadi). Mulai sekarang:

1. Nomor versi resmi **hanya** di `CSXS/manifest.xml`
   (`ExtensionBundleVersion` + `Extension Version`). String versi lain
   di kode (kalau ada, mis. pesan status di `app.js` atau `api.ping()`
   di `main.jsx`) harus disamakan ke nilai ini saat rilis.
2. Setiap perubahan fungsional dicatat sebagai entri baru di
   `CHANGELOG.md`, bukan sebagai komentar blok di kepala file.
3. Komentar di kepala file cukup menjelaskan **apa fungsi file ini
   sekarang**, bukan riwayat perubahan.

## Hal yang perlu diperhatikan (jangan diasumsikan aman)

- `client/js/bg-swap.js` tidak disambungkan ke `index.html`. Sebelum
  mengaktifkannya (menambah `<script src="js/bg-swap.js">`), pastikan
  fitur ini sudah dites — kode ini tidak tersentuh sejak dibuat dan
  belum ada bukti pernah dipakai di alur generate/slot editor yang
  aktif sekarang.
- Ikon panel (`CSXS/panel-icon*.png`, `client/icons/*.png`) tidak
  dirujuk oleh `manifest.xml` (tidak ada blok `<Icons>`). Menambahkan
  blok `<Icons>` adalah perubahan yang aman untuk dicoba, tapi belum
  pernah diverifikasi menampilkan ikon yang benar di Illustrator.
- File `.debug` menetapkan port debug `8088` untuk host `ILST`. Kalau
  menambah dukungan host lain (Photoshop, dll), file ini juga perlu
  diperbarui, bersama `HostList` di `manifest.xml`.
