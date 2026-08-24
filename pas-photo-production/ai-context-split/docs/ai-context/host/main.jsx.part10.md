<!-- AI CONTEXT | original: host/main.jsx | part 10 dari 11 | api.crop, api.flip, api.rotate90, api.replacePhoto, api.setBackground, api.setBackgroundBySize, api.captionAdjust, api.captionAdjustBySize, api.resetArtboard, api.duplicateSlot, api.deleteSlot -->
```jsx
api.crop = function (raw) { var d = payload(raw); return applyToSelection(function (doc, item, meta) { meta.crop = meta.crop || { x: 0, y: 0, scale: 100 }; if (d.reset) meta.crop = { x: 0, y: 0, scale: 100 }; else { meta.crop.x = num(meta.crop.x, 0) + num(d.dx, 0); meta.crop.y = num(meta.crop.y, 0) + num(d.dy, 0); if (d.scale) meta.crop.scale = Math.max(20, Math.min(600, num(meta.crop.scale, 100) + num(d.scale, 0))); } return rebuildPhoto(doc, item, meta); }, "Crop diterapkan pada {n} slot."); };
  api.flip = function (raw) { var d = payload(raw); return applyToSelection(function (doc, item, meta) { if (d.horizontal) meta.flipH = !meta.flipH; if (d.vertical) meta.flipV = !meta.flipV; return rebuildPhoto(doc, item, meta); }, "Flip diterapkan pada {n} slot."); };
  api.rotate90 = function () { return applyToSelection(function (doc, item, meta) { item.rotate(90, true, true, true, true, Transformation.CENTER); var borders = borderItemsForSlot(doc, meta.slotId); for (var b = 0; b < borders.length; b++) borders[b].rotate(90, true, true, true, true, Transformation.CENTER); meta.rotation = (num(meta.rotation, 0) + 90) % 360; meta.frame = { left: item.left, top: item.top, w: item.width, h: item.height }; setMeta(item, meta); }, "{n} slot diputar 90\u00b0."); };
  api.replacePhoto = function (raw) { var d = payload(raw); if (!d.path) return response(false, "Path foto baru tidak diberikan."); return applyToSelection(function (doc, item, meta) { meta.sourcePath = d.path; meta.sourceId = d.sourceId || meta.sourceId; meta.sourceOverridden = true; meta.crop = { x: 0, y: 0, scale: 100 }; return rebuildPhoto(doc, item, meta); }, "Foto pada {n} slot diganti."); };

  api.setBackground = function (raw) { var d = payload(raw); var hex = (typeof d.hex === "string") ? d.hex : ""; return applyToSelection(function (doc, item, meta) { return setSlotBackground(doc, item, meta, hex); }, hex ? "Background diterapkan pada {n} slot." : "Background dihapus pada {n} slot."); };

  api.setBackgroundBySize = function (raw) {
    try {
      var d = payload(raw);
      if (!d.sizeId) return response(false, "Ukuran tidak diberikan.");
      var hex = (typeof d.hex === "string") ? d.hex : "";
      var doc = activeDoc();
      var count = 0;
      for (var i = 0; i < doc.pageItems.length; i++) {
        var it = doc.pageItems[i];
        var m = getMeta(it);
        if (m && m.sizeId === d.sizeId) { setSlotBackground(doc, it, m, hex); count++; }
      }
      app.redraw();
      if (!count) return response(false, "Tidak ada slot ukuran " + d.sizeId + " di dokumen ini.");
      return response(true, (hex ? "Background diterapkan" : "Background dihapus") + " pada " + count + " slot ukuran " + d.sizeId + ".", { count: count });
    } catch (e) { return response(false, e.message); }
  };

  /* api.captionAdjust: atur ukuran font &/atau tracking (kerning) label
     teks pada slot yang SEDANG DIPILIH di artboard - lihat
     adjustCaptionOnSlot(). Slot terpilih yang tidak punya caption aktif
     dilewati (tidak dihitung error), sisanya tetap diproses. */
  api.captionAdjust = function (raw) {
    var d = payload(raw);
    try {
      var doc = activeDoc();
      var slots = selectedSlots();
      if (!slots.length) return response(false, "Pilih minimal satu slot foto di artboard.");
      var changed = 0, reselect = [];
      for (var i = 0; i < slots.length; i++) {
        var meta = getMeta(slots[i]);
        if (adjustCaptionOnSlot(slots[i], meta, d)) { changed++; reselect.push(slots[i]); }
      }
      if (reselect.length) { try { doc.selection = reselect; } catch (eSel) {} }
      app.redraw();
      if (!changed) return response(false, "Slot terpilih tidak punya label aktif.");
      return response(true, (d.reset ? "Label direset" : "Label diperbarui") + " pada " + changed + " slot.", { count: changed });
    } catch (e) { return response(false, e.message); }
  };

  /* api.captionAdjustBySize: sama seperti api.captionAdjust, tapi
     diterapkan ke SEMUA slot dengan sizeId tertentu di seluruh dokumen -
     tidak perlu select satu-satu, persis pola api.setBackgroundBySize. */
  api.captionAdjustBySize = function (raw) {
    try {
      var d = payload(raw);
      if (!d.sizeId) return response(false, "Ukuran tidak diberikan.");
      var doc = activeDoc();
      var count = 0;
      for (var i = 0; i < doc.pageItems.length; i++) {
        var it = doc.pageItems[i];
        var m = getMeta(it);
        if (m && m.sizeId === d.sizeId) { if (adjustCaptionOnSlot(it, m, d)) count++; }
      }
      app.redraw();
      if (!count) return response(false, "Tidak ada slot ukuran " + d.sizeId + " dengan label aktif di dokumen ini.");
      return response(true, (d.reset ? "Label direset" : "Label diperbarui") + " pada " + count + " slot ukuran " + d.sizeId + ".", { count: count });
    } catch (e) { return response(false, e.message); }
  };

  api.resetArtboard = function () {
    try {
      var doc = activeDoc();
      var removed = clearGenerated(doc);
      /* Selain layer, artboard "Sheet NN" sisa hasil generate PFPM juga
         ikut dihapus di sini - dokumen selalu wajib punya minimal 1
         artboard, jadi loop berhenti begitu tersisa 1 artboard terakhir. */
      var pfpmSheetNameRe = /^Sheet \d+$/;
      var removedArtboards = 0;
      for (var ai = doc.artboards.length - 1; ai >= 0; ai--) {
        if (doc.artboards.length <= 1) break;
        if (pfpmSheetNameRe.test(doc.artboards[ai].name)) {
          try { doc.artboards.remove(ai); removedArtboards++; } catch (eRAb) {}
        }
      }
      doc.selection = null;
      app.redraw();
      if (!removed && !removedArtboards) return response(true, "Tidak ada hasil generate PFPM untuk dihapus.", { removed: 0, removedArtboards: 0 });
      var msg = "Hasil generate PFPM sebelumnya dihapus (" + removed + " layer" + (removedArtboards > 0 ? ", " + removedArtboards + " artboard" : "") + ").";
      return response(true, msg, { removed: removed, removedArtboards: removedArtboards });
    } catch (e) { return response(false, "Reset gagal: " + e.message); }
  };

  api.duplicateSlot = function (raw) { var d = payload(raw); var dir = (d.dir === "left" || d.dir === "up" || d.dir === "down") ? d.dir : "right"; var horizontal = (dir === "left" || dir === "right"); return applyToSelection(function (doc, item, meta) { var borders = borderItemsForSlot(doc, meta.slotId); var shiftAmt = borders.length ? (horizontal ? borders[0].width : borders[0].height) : (horizontal ? item.width : item.height); var dx = 0, dy = 0; if (dir === "right") dx = shiftAmt; else if (dir === "left") dx = -shiftAmt; else if (dir === "up") dy = shiftAmt; else if (dir === "down") dy = -shiftAmt; var dup = item.duplicate(item.parent, ElementPlacement.PLACEATEND); dup.left = item.left + dx; dup.top = item.top + dy; var m2 = getMeta(dup) || meta; m2.slotId = meta.slotId + "-copy"; m2.frame = { left: m2.frame.left + dx, top: m2.frame.top + dy, w: m2.frame.w, h: m2.frame.h }; setMeta(dup, m2); for (var b = 0; b < borders.length; b++) { var bd = borders[b].duplicate(borders[b].parent, ElementPlacement.PLACEATEND); bd.left = borders[b].left + dx; bd.top = borders[b].top + dy; markBorder(bd, m2.slotId); } return dup; }, "{n} slot diduplikasi."); };

  api.deleteSlot = function () { return applyToSelection(function (doc, item, meta) { var borders = borderItemsForSlot(doc, meta.slotId); for (var b = borders.length - 1; b >= 0; b--) { try { borders[b].remove(); } catch (e) {} } try { item.remove(); } catch (e) {} }, "{n} slot dihapus."); };
  
```
