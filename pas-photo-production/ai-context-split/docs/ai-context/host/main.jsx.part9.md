<!-- AI CONTEXT | original: host/main.jsx | part 9 dari 11 | api.ungroupAll, api.selectionInfo, rebuildPhoto, applyToSelection, api.nudge -->
```jsx
;

  api.ungroupAll = function () { try { var doc = activeDoc(); var moved = 0; function isSlotGroup(g) { return !!getMeta(g); } function flatten(container, targetLayer, depth) { if (depth > 12) return; var groups = []; var i; for (i = 0; i < container.groupItems.length; i++) groups.push(container.groupItems[i]); for (i = 0; i < groups.length; i++) { var g = groups[i]; if (!g || !g.parent) continue; if (g.clipped || isSlotGroup(g)) { try { g.move(targetLayer, ElementPlacement.PLACEATEND); moved++; } catch (e) {} continue; } flatten(g, targetLayer, depth + 1); var kids = []; for (var k = 0; k < g.pageItems.length; k++) kids.push(g.pageItems[k]); for (var n = 0; n < kids.length; n++) { try { kids[n].move(targetLayer, ElementPlacement.PLACEATEND); moved++; } catch (e) {} } try { g.remove(); } catch (e) {} } } for (var L = 0; L < doc.layers.length; L++) { var lyr = doc.layers[L]; if (lyr.locked) continue; flatten(lyr, lyr, 0); } app.redraw(); return response(true, "Ungroup selesai. " + moved + " objek dilepas dari group.", { moved: moved }); } catch (e) { return response(false, "Ungroup gagal: " + e.message); } };

  /* selectionInfo: dulu backgroundColor cuma dibaca dari slots[0] (slot
     pertama yang terpilih), jadi kalau user multi-select beberapa slot
     dengan warna berbeda-beda, panel tidak bisa tahu itu campuran - hanya
     kelihatan warna slot pertama saja. Sekarang SEMUA slot terpilih
     dibaca, dikumpulkan jadi daftar warna unik (bgColors) + flag bgMixed,
     supaya panel (lihat refreshSelection + bgLiveIndicatorHtml di app.js)
     bisa menampilkan swatch "background saat ini" yang akurat, termasuk
     kondisi campuran - dipakai supaya area Slot Editor ikut menunjukkan
     hasil background terbaru setelah "Terapkan ke Slot Terpilih/Ukuran
     Ini" diklik, tanpa perlu lihat langsung ke kanvas. */
  api.selectionInfo = function () {
    try {
      var slots = selectedSlots();
      if (!slots.length) return response(true, "Tidak ada slot terpilih.", { count: 0 });
      var m = getMeta(slots[0]);
      var bgSeen = {}, bgColors = [];
      for (var i = 0; i < slots.length; i++) {
        var mi = getMeta(slots[i]);
        var hexI = (mi && mi.backgroundColor) || "";
        if (!bgSeen.hasOwnProperty(hexI)) { bgSeen[hexI] = true; bgColors.push(hexI); }
      }
      /* Ukuran font & tracking label DIBACA LANGSUNG dari text frame yang
         ada di artboard (kalau ketemu) - bukan cuma dari meta - supaya
         selalu akurat termasuk hasil auto-fit yang tidak disimpan sebagai
         override eksplisit ke meta.captionFontSizeOverride. */
      var capFontSize = null, capTracking = 0;
      if (m && m.captionEnabled) {
        var capTf = findCaptionText(slots[0]);
        if (capTf) {
          try { capFontSize = capTf.textRange.characterAttributes.size; } catch (eCapSz) {}
          try { capTracking = capTf.textRange.characterAttributes.tracking; } catch (eCapTr) {}
        }
        if (capFontSize === null) capFontSize = (typeof m.captionFontSizeOverride === "number") ? m.captionFontSizeOverride : m.captionFontSize;
      }
      return response(true, slots.length + " slot terpilih.", {
        count: slots.length, slotId: m.slotId, sizeId: m.sizeId, label: m.label,
        sourceId: m.sourceId, sourcePath: m.sourcePath, rotation: m.rotation,
        crop: m.crop, mode: m.mode, backgroundColor: m.backgroundColor || "",
        bgColors: bgColors, bgMixed: bgColors.length > 1,
        size: m.physicalWidth + "x" + m.physicalHeight + "mm",
        captionEnabled: !!(m && m.captionEnabled), captionFontSize: capFontSize, captionTracking: capTracking
      });
    } catch (e) { return response(false, e.message); }
  };

  function rebuildPhoto(doc, slotItem, meta) { if (meta.mode === "none" || slotItem.typename === "PlacedItem") { var file = new File(meta.sourcePath); if (!file.exists) throw new Error("Foto sumber tidak ditemukan: " + meta.sourcePath); var parent = slotItem.parent; var np = doc.placedItems.add(); np.file = file; np.move(parent, ElementPlacement.PLACEATBEGINNING); np.name = slotItem.name; fitPlaced(np, meta.frame, meta); setMeta(np, meta); try { slotItem.remove(); } catch (e) {} return np; } var clip = findClipPath(slotItem); if (!clip) throw new Error("Clipping frame tidak ditemukan pada slot ini.");
    /* clip.width/height bisa LEBIH BESAR dari fw/fh asli kalau caption aktif
       (lihat catatan fwClip/fhClip/capHVisual di createSlot() - clip mask
       diperlebar sejauh offsetBorder di sisi caption). Kembalikan dulu ke
       ukuran asli (kurangi offsetBorder itu) SEBELUM dipakai menghitung
       ulang capH2/photoFrame di bawah, supaya hasilnya konsisten dengan
       createSlot() - kalau tidak, foto yang diganti manual lewat slot ini
       bisa jadi sedikit lebih besar / salah posisi dibanding hasil generate
       aslinya. */
    var rawFrame = { left: clip.left, top: clip.top, w: clip.width, h: clip.height };
    var frame = rawFrame;
    if (meta.captionEnabled && meta.captionText) {
      var obPt = Math.max(0, num(meta.offsetBorder, 1.5)) * MM;
      frame = meta.rotation
        ? { left: rawFrame.left, top: rawFrame.top, w: rawFrame.w - obPt, h: rawFrame.h }
        : { left: rawFrame.left, top: rawFrame.top, w: rawFrame.w, h: rawFrame.h - obPt };
    }
    meta.frame = frame;
    if (meta.captionEnabled && meta.captionText) { var capH2 = Math.min((meta.rotation ? frame.w : frame.h) * 0.6, Math.max(0, num(meta.captionHeightMm, 8)) * MM); frame = meta.rotation ? { left: frame.left, top: frame.top, w: frame.w - capH2, h: frame.h } : { left: frame.left, top: frame.top, w: frame.w, h: frame.h - capH2 }; } var old = findPlaced(slotItem); var container = old ? old.parent : slotItem; var f2 = new File(meta.sourcePath); if (!f2.exists) throw new Error("Foto sumber tidak ditemukan: " + meta.sourcePath); if (old) { try { old.remove(); } catch (e) {} } var placed = doc.placedItems.add(); placed.file = f2; placed.name = "PHOTO " + safeName(meta.sourceId); placed.move(container, ElementPlacement.PLACEATEND); if (container.typename === "GroupItem") { var bgRectRB = findBgRect(container); if (bgRectRB) { try { bgRectRB.move(container, ElementPlacement.PLACEATEND); } catch (eBgRB) {} } } fitPlaced(placed, frame, meta); setMeta(slotItem, meta); return slotItem; }

  function applyToSelection(fn, okMsg) { try { var doc = activeDoc(); var slots = selectedSlots(); if (!slots.length) return response(false, "Pilih minimal satu slot foto di artboard."); var reselect = []; for (var i = 0; i < slots.length; i++) { var r = fn(doc, slots[i], getMeta(slots[i])); if (r) reselect.push(r); } if (reselect.length) { try { doc.selection = reselect; } catch (eSel) {} } app.redraw(); return response(true, okMsg.replace("{n}", slots.length), { count: slots.length }); } catch (e) { return response(false, e.message); } }

  api.nudge = function (raw) { var d = payload(raw); var dx = num(d.dx, 0) * MM, dy = num(d.dy, 0) * MM; return applyToSelection(function (doc, item, meta) { item.left += dx; item.top -= dy; var borders = borderItemsForSlot(doc, meta.slotId); for (var b = 0; b < borders.length; b++) { borders[b].left += dx; borders[b].top -= dy; } if (meta) { meta.frame.left += dx; meta.frame.top -= dy; setMeta(item, meta); } }, "{n} slot digeser."); };
  
```
