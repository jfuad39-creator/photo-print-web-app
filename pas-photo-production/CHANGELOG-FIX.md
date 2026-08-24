# Pas Foto Print — Patch v2.6.0 (Fix Layout A5 & Gap 10R)

## Masalah yang dilaporkan

1. **Media A5** — order "Paket Cetak Foto" (4x6=4, 3x4=4, 2x3=6) yang memakai
   lebih dari satu foto sumber (background biru & merah) tersusun **berantakan**,
   tidak seperti blok referensi yang rapi (2×2 4x6, baris 4× 3x4, baris 6× 2x3).
2. **Media 10R** (dan ukuran lain di luar A4/A5) menyisakan **area kosong / gap**
   yang seharusnya masih bisa diisi foto lain.

## Akar masalah (root cause)

Kedua bug punya penyebab yang **sama persis**, ada di `client/js/layout-engine.js`.

Setiap **baris** pada Order Ukuran (`state.items`) sebelumnya selalu menjadi
**satu pool item terpisah** di layout-engine — walaupun dua baris kebetulan
punya ukuran fisik (lebar × tinggi) **persis sama**, misalnya dua baris "4x6"
dengan foto sumber / warna latar berbeda (kasus paling umum: tombol
"Paket Cetak Foto" dipakai dua kali, atau background per foto diganti-ganti).

Semua fungsi penyusunan (packing) di `layout-engine.js` menghitung kapasitas
**per pool item**, bukan per ukuran fisik:

- `packReferenceA4()` / `packReferenceA5()` memakai `findSize()` yang hanya
  mengembalikan **satu item pertama** yang cocok ukurannya. Baris kedua & seterusnya
  dengan ukuran sama **sama sekali diabaikan** oleh template blok referensi ini,
  lalu "bocor" ke `packSheet()` generik untuk sisa area → hasil terlihat berantakan.
- `packSheet()` generik (guillotine bin-packing) memperlakukan tiap baris sebagai
  **batch kapasitas terpisah**. Grid yang seharusnya bisa penuh (misalnya 8 foto
  ukuran sama sejajar) malah terpecah jadi beberapa blok kecil, dan sisa ruang di
  antaranya tidak pernah dipakai ulang secara optimal → muncul gap / lubang kosong.

## Perbaikan

Ditambahkan fungsi `mergeRowsBySize()` di `layout-engine.js` yang dipanggil di
awal `build()`, **sebelum** data dikirim ke `packReferenceA4`, `packReferenceA5`,
`packSheet`, maupun `packHorizontalShelf`:

- Baris-baris order dengan ukuran fisik (lebar × tinggi mm) **persis sama**
  digabung menjadi **satu pool item** dengan `qty` gabungan.
- Identitas asli tiap baris (foto sumber, warna latar, label, sizeId) **tetap
  disimpan** di array `segments` milik pool item gabungan tersebut.
- `addSlot()` (fungsi yang benar-benar membuat satu slot cetak) sekarang menarik
  segmen berikutnya yang masih tersisa lewat `nextSegment()`, sehingga tiap slot
  tetap menampilkan foto & warna latar sesuai baris order aslinya, secara
  berurutan (baris pertama dihabiskan dulu, baru baris berikutnya).

**Tidak ada satu pun algoritma packing yang diubah** (packReferenceA4/A5,
packSheet, packHorizontalShelf semuanya persis sama seperti sebelumnya) — yang
berubah hanya **data yang dikirim** ke algoritma tersebut, sehingga kapasitas
grid/blok dihitung dengan benar (gabungan), dan hasil packing kembali rapi /
tanpa gap, persis seperti sebelum ada beberapa baris dengan ukuran sama.

### Patch v2.6.1: Preview benar, artboard masih memakai foto lama

- `slotId` pada pool gabungan kini tetap memakai ID dan nomor urut dari baris
  order asal. Penggabungan hanya memengaruhi perhitungan geometri packing.
- `host/main.jsx` tidak lagi selalu memulihkan `sourcePath` hasil generate lama.
  Foto lama hanya dipertahankan jika benar-benar diganti manual lewat tombol
  **Ganti Foto** di Slot Editor (`sourceOverridden: true`). Perubahan sumber
  foto melalui dropdown panel kini langsung diterapkan saat Generate.
- Aturan yang sama diterapkan pada warna background: warna dari panel menjadi
  sumber utama, kecuali background slot memang diedit manual setelah Generate
  (`backgroundOverridden: true`).

## File yang diubah

- `client/js/layout-engine.js` — penggabungan ukuran dan stabilitas `slotId`.
  Lihat komentar `FIX v2.6.0` di bagian atas file untuk detail lengkap.
- `host/main.jsx` — membedakan sumber dari panel dan penggantian foto manual.

File lain (`client/index.html`, `client/css/theme.css`, `client/js/state.js`,
`client/js/bridge.js`, `client/js/app.js`) disertakan **apa
adanya** (tidak ada perubahan logika) supaya paket tetap lengkap & konsisten.

## Cara pakai

1. Salin folder `pas-photo-production/` ini menimpa folder ekstensi CEP Anda
   yang sudah ada (folder `CSXS/`, `lib/CSInterface.js`, dan file manifest lain
   yang sudah ada sebelumnya **tidak perlu diubah** — cukup timpa `client/` dan
   `host/`).
2. Restart Illustrator (atau tutup-buka ulang panel ekstensinya) supaya file
   JS yang di-cache browser panel ikut ter-reload.
3. Uji ulang kombinasi yang sebelumnya bermasalah:
   - Media **A5** + "Paket Cetak Foto" dengan 2 foto sumber berbeda.
   - Media **10R** dengan order berisi baris ukuran yang sama lebih dari satu.
