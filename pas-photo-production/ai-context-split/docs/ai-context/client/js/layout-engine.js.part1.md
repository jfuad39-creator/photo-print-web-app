<!-- AI CONTEXT | original: client/js/layout-engine.js | part 1 dari 4 | r2, clampNum, borderPitchGap, sameSize, findSize, onlyPassportSizes, nextSegment, addSlot, templateFits, hasRemaining, applyPosition, packReferenceA4 -->
```javascript
/* =====================================================================
 * client/js/layout-engine.js (PFLayout)
 * ---------------------------------------------------------------------
 * Mesin penyusun layout pas-foto ke lembar cetak (ES5 - aman untuk
 * CEP/Chromium lama). Murni kalkulasi geometri, tidak menyentuh DOM
 * atau Illustrator.
 *
 * mergeRowsBySize() dipanggil di awal build(), sebelum data dikirim ke
 * packReferenceA4/A5, packSheet, dan packHorizontalShelf: baris-baris
 * Order Ukuran dengan ukuran fisik identik digabung jadi satu pool item
 * (qty gabungan) supaya kapasitas grid/blok dihitung benar, sementara
 * identitas asli tiap baris (foto, warna latar, label, sizeId) tetap
 * tersimpan di `segments` dan dikonsumsi berurutan lewat nextSegment().
 * JANGAN hapus langkah ini — tanpanya, media dengan >1 baris ukuran
 * sama (A5, 10R, dst) kembali menyusun layout dengan berantakan/ada
 * gap. Detail bug & alasan lengkap: lihat CHANGELOG.md versi 2.6.0.
 * ===================================================================== */
(function (root) {
  "use strict";

  var MEDIA_SIZES = {
    A3: [297, 420],
    A4: [210, 297],
    A5: [148, 210],
    A6: [105, 148],
    LETTER: [216, 279],
    "4R": [102, 152],
    "10R": [254, 305],
    "10x15": [100, 150],
    "20x30": [200, 300]
  };

  var EPS = 0.001;
  var MIN_DIM = 8;

  /* Marjin atas artboard secara default TIDAK mengikuti parameter "margin"
     input (yang mengatur marjin kiri/kanan/bawah, default 4.5mm). Marjin
     atas selalu memakai nilai tetap ini kecuali job.media.marginTop
     dikirim secara eksplisit oleh pemanggil. */
  var DEFAULT_TOP_MARGIN = 5;

  function r2(v) { return Math.round(v * 100) / 100; }
  function clampNum(v, d) { v = Number(v); return isFinite(v) ? v : d; }

  function borderPitchGap(gap, offsetBorder) {
    var g = clampNum(gap, 0);
    var o = clampNum(offsetBorder, 0);
    if (g < 0) g = 0;
    if (o < 0) o = 0;
    return r2(g + 2 * o);
  }

  function sameSize(item, w, h) {
    return Math.abs(item.w - w) < 0.01 && Math.abs(item.h - h) < 0.01;
  }

  function findSize(pool, w, h) {
    for (var i = 0; i < pool.length; i++) {
      if (sameSize(pool[i], w, h)) return pool[i];
    }
    return null;
  }

  function onlyPassportSizes(pool) {
    if (!pool.length) return false;
    for (var i = 0; i < pool.length; i++) {
      if (!sameSize(pool[i], 40, 60) && !sameSize(pool[i], 30, 40) && !sameSize(pool[i], 20, 30)) return false;
    }
    return !!(findSize(pool, 40, 60) || findSize(pool, 30, 40) || findSize(pool, 20, 30));
  }

  /* nextSegment: ambil "segmen" (baris order asli) berikutnya yang masih
     punya sisa qty di dalam satu pool item gabungan `it`. Segmen dipakai
     hanya untuk menentukan identitas foto sumber/warna latar/label per
     SLOT yang dibuat - TIDAK memengaruhi perhitungan kapasitas/geometri
     blok (yang selalu memakai it.qty gabungan, seperti sebelumnya).
     Kalau `it` tidak punya field segments (mis. dipanggil dari kode lama
     / pengujian unit yang belum di-update), fallback ke `it` sendiri
     supaya tetap backward-compatible. */
  function nextSegment(it) {
    if (!it || !it.segments || !it.segments.length) return null;
    for (var i = 0; i < it.segments.length; i++) {
      if (it.segments[i].qty > 0) return it.segments[i];
    }
    return null;
  }

  function addSlot(slots, it, x, y, w, h, rot, offsetBorder) {
    if (!it || it.qty <= 0) return false;
    var seg = nextSegment(it);
    var sourceId = seg ? seg.srcId : it.srcId;
    var sourcePath = seg ? seg.srcPath : (it.srcPath || "");
    var bg = seg ? seg.bg : (it.bg || "");
    var label = seg ? seg.label : it.label;
    var captionText = seg ? seg.captionText : (it.captionText || "");
    var sizeId = seg ? seg.sizeId : (it.sizeId || it.id);
    /* Geometry memakai pool gabungan, tetapi identitas slot tetap mengikuti
       baris order asal agar override generate ulang tidak tertukar. */
    var slotId = seg ? (seg.id + "-" + (seg.seq++)) : (it.id + "-" + (it.seq++));
    slots.push({
      slotId: slotId,
      sizeId: sizeId,
      label: label,
      sourceId: sourceId,
      sourcePath: sourcePath || "",
      x: r2(x),
      y: r2(y),
      width: r2(w),
      height: r2(h),
      physicalWidth: it.w,
      physicalHeight: it.h,
      rotation: rot,
      crop: { x: 0, y: 0, scale: 100 },
      offsetBorder: offsetBorder,
      backgroundColor: bg || "",
      captionText: captionText || ""
    });
    it.qty--;
    if (seg) seg.qty--;
    return true;
  }

  function templateFits(area, w, h) {
    return area.w + EPS >= w && area.h + EPS >= h;
  }

  function hasRemaining(pool) {
    for (var i = 0; i < pool.length; i++) if (pool[i].qty > 0) return true;
    return false;
  }

  /* Menggeser seluruh slot pada satu sheet secara horizontal (kiri/tengah/kanan)
     sebagai satu kesatuan blok, tanpa mengubah susunan relatif antar slot dan
     tanpa mengubah posisi vertikal (selalu tetap menempel di atas, sesuai
     perilaku packing yang sudah ada). Diterapkan setelah packing selesai,
     sehingga bekerja untuk semua strategi packing (reference A4/A5, shelf, dll)
     tanpa perlu mengubah algoritma penyusunannya masing-masing. */
  function applyPosition(slots, area, position) {
    if (!slots.length) return slots;
    var minX = Infinity, maxX = -Infinity;
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].x < minX) minX = slots[i].x;
      var right = slots[i].x + slots[i].width;
      if (right > maxX) maxX = right;
    }
    var contentW = maxX - minX;
    var freeW = area.w - contentW;
    if (freeW < EPS) return slots;
    var targetLeft;
    if (position === "left") targetLeft = area.x;
    else if (position === "right") targetLeft = area.x + freeW;
    else targetLeft = area.x + freeW / 2;
    var dx = targetLeft - minX;
    if (Math.abs(dx) > EPS) {
      for (var j = 0; j < slots.length; j++) slots[j].x = r2(slots[j].x + dx);
    }
    return slots;
  }

  function packReferenceA4(pool, area, offsetBorder, rotateMode) {
    var d = borderPitchGap(0, offsetBorder);
    var blockW = 200 + 5 * d;
    var blockH = 90 + 2 * d;
    if (!templateFits(area, blockW, blockH)) return [];
    var p46 = findSize(pool, 40, 60), p34 = findSize(pool, 30, 40), p23 = findSize(pool, 20, 30);
    var slots = [], x0 = area.x, y0 = area.y;
    var stride = blockH + d;
    var maxBlocks = Math.floor((area.h + d + EPS) / stride), b = 0;
    for (; b < maxBlocks && p46 && p34 && p23 && p46.qty >= 4 && p34.qty >= 4 && p23.qty >= 6; b++) {
      var y = y0 + b * stride;
      for (var i = 0; i < 4; i++) addSlot(slots, p46, x0 + i * (40 + d), y, 40, 60, 0, offsetBorder);
      for (var j = 0; j < 4; j++) addSlot(slots, p34, x0 + j * (40 + d), y + 60 + d, 40, 30, 90, offsetBorder);
      var cx = x0 + 4 * (40 + d);
      for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 2; c++) addSlot(slots, p23, cx + c * (20 + d), y + r * (30 + d), 20, 30, 0, offsetBorder);
      }
    }
    if (hasRemaining(pool) && b * stride < area.h - EPS) {
      var more = packSheet(pool, { x: area.x, y: area.y + b * stride, w: area.w, h: area.h - b * stride }, 0, rotateMode, offsetBorder);
      for (var m = 0; m < more.length; m++) slots.push(more[m]);
    }
    return slots;
  }

  
```
