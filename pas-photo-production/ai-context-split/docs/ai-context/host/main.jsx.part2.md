<!-- AI CONTEXT | original: host/main.jsx | part 2 dari 11 | fitPlaced, markBorder, drawOffsetBorder, bringBordersToFront, addBackgroundRect, markCaptionPart, isCaptionPart, findBgRect, findCaptionBar, findCaptionText -->
```jsx
function fitPlaced(placed, frame, meta) { var crop = meta.crop || { x: 0, y: 0, scale: 100 }; if (meta.rotation) placed.rotate(meta.rotation, true, true, true, true, Transformation.CENTER); var pw = placed.width || 1; var ph = placed.height || 1; var ratio = (meta.fitMode === "fit") ? Math.min(frame.w / pw, frame.h / ph) : Math.max(frame.w / pw, frame.h / ph); if (!isFinite(ratio) || ratio <= 0) ratio = 1; placed.resize(ratio * 100, ratio * 100, true, true, true, true, ratio * 100, Transformation.CENTER); var sc = num(crop.scale, 100); if (sc && sc !== 100) { placed.resize(sc, sc, true, true, true, true, sc, Transformation.CENTER); } if (meta.flipH || meta.flipV) { placed.resize(meta.flipH ? -100 : 100, meta.flipV ? -100 : 100, true, true, true, true, 0, Transformation.CENTER); } placed.left = frame.left + (frame.w - placed.width) / 2 + num(crop.x, 0) * MM; placed.top = frame.top - (frame.h - placed.height) / 2 - num(crop.y, 0) * MM; }

  function markBorder(item, slotId) { item.note = JSON.stringify({ pfpmBorder: true, slotId: slotId }); }
  function drawOffsetBorder(parent, top, left, fw, fh, offsetBorder, baseName, slotId) { var black = rgb(0, 0, 0); var o = Math.max(0, offsetBorder); var stroke = parent.pathItems.rectangle(top + o, left - o, fw + (2 * o), fh + (2 * o)); stroke.name = baseName + " (OFFSET BORDER " + Math.round((o / MM) * 100) / 100 + "mm / 0.3PT)"; stroke.filled = false; stroke.stroked = true; stroke.strokeColor = black; stroke.strokeWidth = 0.3; markBorder(stroke, slotId); try { stroke.move(parent, ElementPlacement.PLACEATBEGINNING); } catch (e) {} }
  function bringBordersToFront(parent) { var borders = [], i; for (i = 0; i < parent.pageItems.length; i++) { if (getBorderMeta(parent.pageItems[i])) borders.push(parent.pageItems[i]); } for (i = 0; i < borders.length; i++) { try { borders[i].zOrder(ZOrderMethod.BRINGTOFRONT); } catch (e) {} } }

  function addBackgroundRect(clipGroup, top, left, fw, fh, hex, baseName) {
    var c = hexToRgb(hex);
    if (!c) return null;
    var bg = clipGroup.pathItems.rectangle(top, left, fw, fh);
    bg.name = baseName + " (BG " + hex + ")";
    bg.filled = true;
    bg.fillColor = rgb(c.r, c.g, c.b);
    bg.stroked = false;
    return bg;
  }

  /* markCaptionPart / isCaptionPart: penanda pada bar putih & text frame
     caption (lihat addCaptionBar) supaya bisa dibedakan dari background
     rect studio saat dicari lewat findBgRect() di bawah - lihat catatan
     di findBgRect. Penanda ini baru ada mulai v2.7.3 - slot yang sudah
     di-generate SEBELUM v2.7.3 tidak punya tag ini sama sekali (sudah
     terlanjur digambar tanpa tag), jadi findBgRect/findCaptionBar/
     findCaptionText di bawah TIDAK BOLEH bergantung 100% ke tag ini -
     harus tetap benar juga untuk slot lama yang belum punya tag, lewat
     urutan z-order yang memang dari dulu selalu konsisten (lihat catatan
     masing-masing fungsi). */
  function markCaptionPart(item) { try { item.note = JSON.stringify({ pfpmCaptionPart: true }); } catch (e) {} }
  function isCaptionPart(item) { if (!item) return false; try { var note = item.note; if (!note) return false; var m = JSON.parse(note); return !!(m && m.pfpmCaptionPart); } catch (e) { return false; } }

  /* Cari rectangle background STUDIO yang sudah ada di dalam clipGroup
     (kalau ada) - dipakai setSlotBackground() (ganti warna background lewat
     Slot Editor) dan rebuildPhoto() (susun ulang z-order setelah ganti
     foto). PENTING: sejak fitur caption ada, clipGroup BISA berisi 2
     PathItem non-clip (bukan cuma 1 seperti asumsi lama komentar ini) -
     bar putih caption (lihat addCaptionBar) JUGA sebuah PathItem non-clip.
     Kalau tidak dibedakan, fungsi ini bisa salah menganggap BAR CAPTION
     sebagai background rect studio - akibatnya ganti warna background
     malah mewarnai ulang (atau bahkan MENGHAPUS, kalau background di-set
     "tanpa warna") bar caption-nya.

     Dibedakan lewat DUA lapis: (1) isCaptionPart() - tag eksplisit, akurat
     tapi cuma ada di slot hasil v2.7.3 ke atas; (2) urutan z-order - bar
     caption SELALU ditaruh paling depan (PLACEATBEGINNING, lihat
     addCaptionBar) dan background rect SELALU ditaruh paling belakang
     (PLACEATEND, lihat createSlot/setSlotBackground) di SETIAP versi
     plugin ini, dari sejak fitur caption pertama ada - bukan cuma sejak
     v2.7.3. clipGroup.pageItems terurut DEPAN ke BELAKANG (index 0 =
     paling depan), jadi dengan TERUS menimpa `found` di setiap match
     (bukan langsung return di match pertama), yang tersisa di akhir loop
     adalah match PALING BELAKANG - itulah background rect-nya, benar baik
     untuk slot baru (yang bar-nya juga ke-exclude lewat tag) MAUPUN slot
     lama (yang bar-nya belum ke-tag, tapi tetap kalah posisi karena ada
     di depan, bukan belakang). */
  function findBgRect(clipGroup) {
    if (!clipGroup || clipGroup.typename !== "GroupItem") return null;
    var found = null;
    for (var i = 0; i < clipGroup.pageItems.length; i++) {
      var it = clipGroup.pageItems[i];
      if (it.typename === "PathItem" && !it.clipping && !isCaptionPart(it)) found = it;
    }
    return found;
  }

  /* findCaptionBar / findCaptionText: kebalikan dari findBgRect - cari
     KHUSUS bagian caption (bar putih / text frame) di dalam clipGroup,
     dipakai oleh adjustCaptionOnSlot() (atur ukuran font & tracking label
     dari Slot Editor). Sama seperti findBgRect, keduanya tetap harus benar
     untuk slot lama yang belum punya tag pfpmCaptionPart. */
  function findCaptionBar(clipGroup) {
    if (!clipGroup || clipGroup.typename !== "GroupItem") return null;
    var fallback = null;
    for (var i = 0; i < clipGroup.pageItems.length; i++) {
      var it = clipGroup.pageItems[i];
      if (it.typename === "PathItem" && !it.clipping) {
        if (isCaptionPart(it)) return it;
        /* Belum ketemu yang bertanda - simpan match PALING DEPAN pertama
           sebagai fallback. Untuk slot lama (belum ditandai), bar caption
           selalu ada di posisi ini (PLACEATBEGINNING) - background rect
           selalu di belakang, jadi tidak akan salah ambil. */
        if (!fallback) fallback = it;
      }
    }
    return fallback;
  }
  function findCaptionText(clipGroup) {
    if (!clipGroup || clipGroup.typename !== "GroupItem") return null;
    for (var i = 0; i < clipGroup.pageItems.length; i++) {
      var it = clipGroup.pageItems[i];
      /* Cuma ada SATU TextFrame yang mungkin ada di dalam clipGroup - teks
         caption itu sendiri (semua PathItem lain, foto, dst bukan
         TextFrame) - jadi tidak butuh tag sama sekali di sini, otomatis
         benar untuk slot lama maupun baru. */
      if (it.typename === "TextFrame") return it;
    }
    return null;
  }

  /* Set / ganti / hapus warna background pada satu slot (clipGroup) yang sudah ada
     di artboard. hex="" berarti hapus background (kembali transparan). */
  
```
