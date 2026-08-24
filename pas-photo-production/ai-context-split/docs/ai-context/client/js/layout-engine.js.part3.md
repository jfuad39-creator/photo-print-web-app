<!-- AI CONTEXT | original: client/js/layout-engine.js | part 3 dari 4 | subtractRect, containsRect, pruneContainedRects, uniqueBandHeights, simulateBand, chooseBand, packHorizontalShelf, packSheet, mergeRowsBySize -->
```javascript
function subtractRect(f, p) {
    if (!rectsOverlap(f, p)) return [f];
    var out = [];
    var leftW = p.x - f.x;
    if (leftW > EPS) out.push({ x: f.x, y: f.y, w: leftW, h: f.h });
    var rightW = (f.x + f.w) - (p.x + p.w);
    if (rightW > EPS) out.push({ x: p.x + p.w, y: f.y, w: rightW, h: f.h });
    var topH = p.y - f.y;
    if (topH > EPS) out.push({ x: f.x, y: f.y, w: f.w, h: topH });
    var bottomH = (f.y + f.h) - (p.y + p.h);
    if (bottomH > EPS) out.push({ x: f.x, y: p.y + p.h, w: f.w, h: bottomH });
    return out;
  }

  function containsRect(a, b) {
    return a.x <= b.x + EPS && a.y <= b.y + EPS &&
           a.x + a.w >= b.x + b.w - EPS && a.y + a.h >= b.y + b.h - EPS;
  }

  /* Buang free-rectangle yang seluruhnya sudah tercakup rectangle lain
     di daftar - murni menjaga daftar tetap ramping (performa), tidak
     memengaruhi kebenaran, karena subtractRect() di atas memang
     sengaja boleh menghasilkan rectangle yang tumpang tindih. */
  function pruneContainedRects(list) {
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var redundant = false;
      for (var j = 0; j < list.length; j++) {
        if (i === j) continue;
        if (containsRect(list[j], list[i]) && (!containsRect(list[i], list[j]) || j < i)) { redundant = true; break; }
      }
      if (!redundant) out.push(list[i]);
    }
    return out;
  }

  function uniqueBandHeights(pool, remH, rotateMode) {
    var map = {}, out = [];
    for (var i = 0; i < pool.length; i++) {
      var item = pool[i];
      if (item.qty <= 0) continue;
      var ors = orientationsFor(item, rotateMode);
      for (var o = 0; o < ors.length; o++) {
        var h = r2(ors[o].h);
        if (h <= remH + EPS && !map[h]) { map[h] = true; out.push(h); }
      }
    }
    out.sort(function(a,b){ return b-a; });
    return out;
  }

  function simulateBand(pool, areaW, bandH, gap, rotateMode) {
    var qty = [], placements = [], x = 0, used = 0, guard = 0;
    for (var i = 0; i < pool.length; i++) qty[i] = pool[i].qty;
    while (x < areaW - EPS && guard++ < 2000) {
      var best = null, bestIndex = -1;
      for (var p = 0; p < pool.length; p++) {
        if (qty[p] <= 0) continue;
        var item = pool[p];
        var ors = orientationsFor(item, rotateMode);
        for (var o = 0; o < ors.length; o++) {
          var w = ors[o].w, h = r2(ors[o].h), remW = areaW - x;
          if (Math.abs(h - bandH) > 0.01 || w > remW + EPS) continue;
          var cand = { index: p, item: item, w: w, h: h, rot: ors[o].rot, area: w * h };
          if (!best || cand.area > best.area + EPS || (Math.abs(cand.area - best.area) < EPS && cand.w > best.w)) { best = cand; bestIndex = p; }
        }
      }
      if (!best) break;
      placements.push(best);
      qty[bestIndex]--;
      used += best.w * best.h;
      x += best.w + gap;
    }
    return { placements: placements, used: used, efficiency: bandH > 0 ? used / (areaW * bandH) : 0, leftover: areaW - (placements.length ? (x - gap) : 0), bandH: bandH };
  }

  function chooseBand(pool, areaW, remH, gap, rotateMode) {
    var heights = uniqueBandHeights(pool, remH, rotateMode);
    var best = null;
    for (var i = 0; i < heights.length; i++) {
      var sim = simulateBand(pool, areaW, heights[i], gap, rotateMode);
      if (!sim.placements.length) continue;
      if (!best || sim.efficiency > best.efficiency + EPS ||
        (Math.abs(sim.efficiency - best.efficiency) < EPS && sim.used > best.used + EPS) ||
        (Math.abs(sim.efficiency - best.efficiency) < EPS && Math.abs(sim.used - best.used) < EPS && sim.leftover < best.leftover - EPS)) {
        best = sim;
      }
    }
    return best;
  }

  function packHorizontalShelf(pool, area, gap, rotateMode, offsetBorder) {
    var d = borderPitchGap(gap, offsetBorder);
    var slots = [];
    var y = area.y, maxY = area.y + area.h, guard = 0;
    while (y < maxY - EPS && hasRemaining(pool) && guard++ < 4000) {
      var band = chooseBand(pool, area.w, maxY - y, d, rotateMode);
      if (!band) break;
      var x = area.x;
      for (var i = 0; i < band.placements.length; i++) {
        var cand = band.placements[i];
        addSlot(slots, cand.item, x, y, cand.w, cand.h, cand.rot, offsetBorder);
        x += cand.w + d;
      }
      y += band.bandH + d;
    }
    return slots;
  }

  function packSheet(pool, area, gap, rotateMode, offsetBorder) {
    /* FIX: packSheet sebelumnya memakai `gap` mentah (pitch antar-blok
       sesuai input user, default 0) untuk seluruh perhitungan tata letak
       (chooseBlock/evaluateBlock, splitRect, dan increment posisi X/Y),
       TANPA pernah menambahkan alokasi ruang untuk `offsetBorder` (garis
       potong yang digambar host MENJOROK KELUAR sejauh offsetBorder di
       setiap sisi foto, lihat drawOffsetBorder() di host/main.jsx). Ini
       konsisten dengan packReferenceA4()/packReferenceA5() (memakai
       borderPitchGap(0, offsetBorder)) dan packHorizontalShelf() (memakai
       borderPitchGap(gap, offsetBorder)) - keduanya SUDAH benar. Akibatnya,
       khusus di packSheet, slot yang ditempel bersebelahan dengan gap=0
       hanya berjarak 0mm secara fisik, sehingga garis offset-border milik
       dua slot yang bertetangga saling menjorok masuk sejauh 2x
       offsetBorder (default 2x1.5mm = 3mm) dan tumpang tindih secara
       visual. packSheet dipakai sebagai strategi default untuk SEMUA
       ukuran media selain A4/A5 (baik lebih kecil - mis. A6/4R/10x15 -
       maupun lebih besar - mis. A3/10R/20x30), jadi bug ini berdampak ke
       semua ukuran tersebut, persis seperti yang dilaporkan. */
    var d = borderPitchGap(gap, offsetBorder);
    var free = [{ x: area.x, y: area.y, w: area.w, h: area.h }];
    var slots = [];
    var guard = 0;
    while (free.length > 0 && guard++ < 4000) {
      free.sort(function (a, b) {
        if (Math.abs(a.y - b.y) > EPS) return a.y - b.y;
        if (Math.abs(a.x - b.x) > EPS) return a.x - b.x;
        return (b.w * b.h) - (a.w * a.h);
      });
      var placedIndex = -1;
      var block = null;
      for (var i = 0; i < free.length; i++) {
        block = chooseBlock(free[i], pool, d, rotateMode);
        if (block) { placedIndex = i; break; }
      }
      if (placedIndex < 0) break;
      var fr = free[placedIndex];
      var placedCount = 0;
      for (var r = 0; r < block.rows && placedCount < block.count; r++) {
        for (var c = 0; c < block.cols && placedCount < block.count; c++) {
          var it = block.item;
          if (addSlot(slots, it, fr.x + c * (block.w + d), fr.y + r * (block.h + d), block.w, block.h, block.rot, offsetBorder)) placedCount++;
        }
      }
      /* reserved = footprint blok INI + jarak pitch `d` di sisi kanan &
         bawahnya (persis seperti leftoverW/leftoverH pada splitRect()
         versi lama) - dipotong dari SEMUA free-rectangle yang masih
         ada di pool (bukan cuma `fr`), karena sejak fix di atas
         free-rectangle boleh saling tumpang tindih. */
      var reserved = { x: fr.x, y: fr.y, w: block.blockW + d, h: block.blockH + d };
      var nextFree = [];
      for (var k = 0; k < free.length; k++) {
        var pieces = subtractRect(free[k], reserved);
        for (var p = 0; p < pieces.length; p++) {
          if (pieces[p].w >= MIN_DIM && pieces[p].h >= MIN_DIM) nextFree.push(pieces[p]);
        }
      }
      free = pruneContainedRects(nextFree);
    }
    return slots;
  }

  /* mergeRowsBySize: lihat CHANGELOG.md versi 2.6.0 untuk latar belakang.
     Menggabungkan baris-baris order (rows) yang ukuran fisiknya
     (lebar x tinggi, dalam mm) PERSIS SAMA menjadi SATU pool item,
     supaya SEMUA fungsi packing di atas (yang sudah ada sebelumnya,
     TIDAK diubah sama sekali) menghitung kapasitas/grid berdasarkan
     jumlah gabungan - bukan per baris. Urutan baris asli dipertahankan
     di dalam `segments`, dikonsumsi berurutan oleh addSlot() lewat
     nextSegment(), sehingga foto/warna latar tiap slot tetap benar. */
  function mergeRowsBySize(rows) {
    var items = [];
    var mergedByKey = {};
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var key = r2(row.w) + "x" + r2(row.h);
      var merged = mergedByKey[key];
      if (!merged) {
        merged = { id: row.id, sizeId: row.sizeId, label: row.label, w: row.w, h: row.h, qty: 0, seq: 1, segments: [] };
        mergedByKey[key] = merged;
        items.push(merged);
      }
      merged.qty += row.qty;
      merged.segments.push({ id: row.id, seq: 1, srcId: row.srcId, srcPath: row.srcPath, bg: row.bg, label: row.label, sizeId: row.sizeId, qty: row.qty, captionText: row.captionText });
    }
    return items;
  }

  
```
