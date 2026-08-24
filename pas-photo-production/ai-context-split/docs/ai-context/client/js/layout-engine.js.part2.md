<!-- AI CONTEXT | original: client/js/layout-engine.js | part 2 dari 4 | packReferenceA5, evaluateBlock, betterBlock, orientationsFor, chooseBlock, rectsOverlap -->
```javascript
function packReferenceA5(pool, area, offsetBorder, rotateMode) {
    var d = borderPitchGap(0, offsetBorder);
    var blockW = 120 + 5 * d;
    var blockH = 150 + 3 * d;
    if (!templateFits(area, blockW, blockH)) return [];
    var p46 = findSize(pool, 40, 60), p34 = findSize(pool, 30, 40), p23 = findSize(pool, 20, 30);
    var slots = [], x0 = area.x + r2((area.w - blockW) / 2), y0 = area.y;
    var stride = blockH + d;
    var maxBlocks = Math.floor((area.h + d + EPS) / stride), b = 0;
    for (; b < maxBlocks && p46 && p34 && p23 && p46.qty >= 4 && p34.qty >= 4 && p23.qty >= 6; b++) {
      var y = y0 + b * stride;
      for (var rr = 0; rr < 2; rr++) {
        for (var cc = 0; cc < 2; cc++) addSlot(slots, p46, x0 + cc * (60 + d), y + rr * (40 + d), 60, 40, 90, offsetBorder);
      }
      var y34 = y + 2 * (40 + d);
      for (var i = 0; i < 4; i++) addSlot(slots, p34, x0 + i * (30 + d), y34, 30, 40, 0, offsetBorder);
      var y23 = y34 + 40 + d;
      for (var j = 0; j < 6; j++) addSlot(slots, p23, x0 + j * (20 + d), y23, 20, 30, 0, offsetBorder);
    }
    if (hasRemaining(pool) && b * stride < area.h - EPS) {
      /* FIX alignment A5: sisa item (mis. kelebihan 2x3 yang tidak cukup
         untuk menutup satu blok referensi penuh lagi) SEBELUMNYA dikirim
         ke packSheet() dengan area mentah { x: area.x, w: area.w } - yaitu
         lebar penuh artboard dihitung dari margin kiri. Padahal baris-baris
         di dalam blok referensi di atasnya (4x6/3x4/2x3) semua digambar
         mulai dari x0 yang SUDAH DITENGAHKAN
         (x0 = area.x + (area.w - blockW) / 2), bukan dari area.x mentah.
         packSheet() sendiri selalu menempel ke pojok kiri-atas area yang
         diberikan, jadi baris sisa tsb jadi rata-kiri ke margin artboard,
         bukan sejajar dengan kolom blok referensi di atasnya - inilah
         penyebab baris 2x3 (6 lembar) paling bawah terlihat "geser" /
         tidak teralignment dengan susunan di atasnya. Perbaikan: kirim
         area fallback dengan x = x0 dan w = blockW (kolom yang SAMA persis
         dipakai blok referensi), supaya baris sisa apa pun tetap sejajar
         pada kolom yang sama. */
      var more = packSheet(pool, { x: x0, y: area.y + b * stride, w: blockW, h: area.h - b * stride }, 0, rotateMode, offsetBorder);
      for (var m = 0; m < more.length; m++) slots.push(more[m]);
    }
    return slots;
  }

  function evaluateBlock(fr, item, w, h, rot, gap) {
    if (w > fr.w + EPS || h > fr.h + EPS) return null;
    var cols = Math.floor((fr.w + gap + EPS) / (w + gap));
    var rows = Math.floor((fr.h + gap + EPS) / (h + gap));
    if (cols < 1 || rows < 1) return null;
    var capacity = cols * rows;
    var n = Math.min(item.qty, capacity);
    if (n < 1) return null;
    /* Blok HARUS selalu berupa grid penuh (useRows x useCols terisi semua),
       tidak boleh menyisakan sel kosong di baris terakhir DI DALAM footprint
       blok sendiri - sel kosong semacam itu tidak pernah dikembalikan ke
       free-rectangle pool (splitRect hanya memotong sisa di KANAN/BAWAH
       blok), sehingga hilang percuma dan membuat susunan tampak bolong/
       tidak rapi (paling terlihat pada media kecil di bawah A5, di mana
       kapasitas per blok kecil sehingga baris terakhir yang tidak penuh
       sering terjadi). Sebelumnya useCols dipaksa = cols walau baris
       terakhir hanya terisi sebagian. Sekarang: jika n tidak habis dibagi
       cols, baris terakhir yang tidak penuh itu TIDAK disertakan pada blok
       ini - sisanya akan otomatis diproses lagi pada iterasi berikutnya
       (masuk ke free-rectangle lain, misalnya sisa area di bawah blok ini)
       sehingga tetap terpasang, hanya di grid/baris terpisah yang tetap
       penuh. */
    var useRows, useCols;
    if (n <= cols) {
      useRows = 1;
      useCols = n;
    } else {
      useRows = Math.floor(n / cols);
      useCols = cols;
      n = useRows * cols;
    }
    var blockW = useCols * w + (useCols - 1) * gap;
    var blockH = useRows * h + (useRows - 1) * gap;
    return { item: item, w: w, h: h, rot: rot, cols: useCols, rows: useRows, count: n, blockW: blockW, blockH: blockH, usedArea: n * w * h, leftoverW: fr.w - blockW, leftoverH: fr.h - blockH };
  }

  function betterBlock(a, b) {
    if (!b) return true;
    if (a.usedArea > b.usedArea + EPS) return true;
    if (a.usedArea < b.usedArea - EPS) return false;
    if (a.rows < b.rows) return true;
    if (a.rows > b.rows) return false;
    var ua = a.w * a.h, ub = b.w * b.h;
    if (ua > ub + EPS) return true;
    if (ua < ub - EPS) return false;
    if (a.leftoverW < b.leftoverW - EPS) return true;
    if (a.leftoverW > b.leftoverW + EPS) return false;
    return a.blockH < b.blockH - EPS;
  }

  function orientationsFor(item, rotateMode) {
    var list = [];
    var square = Math.abs(item.w - item.h) < EPS;
    if (rotateMode === "force" && !square) { list.push({ w: item.h, h: item.w, rot: 90 }); return list; }
    list.push({ w: item.w, h: item.h, rot: 0 });
    if (rotateMode !== "off" && !square) list.push({ w: item.h, h: item.w, rot: 90 });
    return list;
  }

  function chooseBlock(fr, pool, gap, rotateMode) {
    var best = null;
    for (var i = 0; i < pool.length; i++) {
      var item = pool[i];
      if (item.qty <= 0) continue;
      var ors = orientationsFor(item, rotateMode);
      for (var o = 0; o < ors.length; o++) {
        var cand = evaluateBlock(fr, item, ors[o].w, ors[o].h, ors[o].rot, gap);
        if (cand && betterBlock(cand, best)) best = cand;
      }
    }
    return best;
  }

  /* FIX (bug: "1 slot foto lompat ke baris baru di A5 padahal ruang di
     sampingnya masih cukup"): splitRect() versi lama memotong sisa
     ruang jadi HANYA SATU potongan - salah satu sisi (kanan ATAU
     bawah blok) selalu dipersempit jadi setinggi/selebar blok yang
     BARU SAJA ditaruh, bukan setinggi/selebar free-rectangle aslinya.
     Begitu blok berikutnya yang ditaruh di sana lebih PENDEK dari
     blok sebelumnya (mis. baris foto 2x3 yang cuma setinggi 20mm,
     ditaruh setelah baris foto 4x6 setinggi 60mm), potongan "kanan"
     yang tersisa ikut kepotong jadi cuma setinggi blok pendek itu -
     padahal secara fisik ruang di sampingnya (ke bawah) masih kosong
     dan cukup lebar. Akibatnya foto berikutnya yang lebih tinggi dari
     blok pendek itu dianggap "tidak muat" di situ, walau lebarnya
     jelas cukup, dan terpaksa dilempar ke baris baru sendirian.

     Perbaikan: setiap blok yang ditempatkan menyisakan DUA potongan
     dalam ukuran PENUH (kanan = lebar sisa x TINGGI PENUH
     free-rectangle asal, bawah = LEBAR PENUH free-rectangle asal x
     sisa tinggi) - bukan cuma satu yang dipilih berdasarkan mana yang
     "lebih kecil". Konsekuensinya, potongan kanan & bawah ini boleh
     tumpang tindih satu sama lain di pojok kanan-bawah (properti
     standar algoritma "Maximal Rectangles" utk 2D bin-packing) -
     supaya ini tetap aman (tidak ada dua slot foto yang akhirnya
     ditaruh saling tumpang tindih di area yang sama), subtractRect()
     dipanggil terhadap SEMUA free-rectangle yang masih ada di pool
     setiap kali ada blok baru ditempatkan, bukan cuma yang sedang
     dipecah - lihat pemanggilannya di packSheet(). */
  function rectsOverlap(a, b) {
    return a.x < b.x + b.w - EPS && a.x + a.w > b.x + EPS &&
           a.y < b.y + b.h - EPS && a.y + a.h > b.y + EPS;
  }

  
```
