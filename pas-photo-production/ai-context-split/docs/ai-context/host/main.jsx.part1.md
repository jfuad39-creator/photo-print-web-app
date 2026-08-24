<!-- AI CONTEXT | original: host/main.jsx | part 1 dari 11 | response, payload, safeName, pad2, rgb, num, hexToRgb, activeDoc, getMeta, getBorderMeta, setMeta, resolveSlot -->
```jsx
/* =====================================================================
 * host/main.jsx - Pas Foto Print
 * ---------------------------------------------------------------------
 * ExtendScript (ES3) yang jalan di dalam proses Adobe Illustrator.
 * Semua manipulasi dokumen (artboard, pageItems, layer) terjadi di sini,
 * dipanggil dari panel lewat client/js/bridge.js -> evalScript.
 *
 * Catatan desain penting: api.generate() memanggil collectPreservedState()
 * SEBELUM menghapus layer hasil generate lama, supaya edit manual di
 * artboard (background/foto per-slot, crop, flip, slot hasil Duplicate)
 * tidak ikut hilang saat generate ulang. Dikenali lewat slotId yang
 * stabil lintas generate selama baris pesanan ukurannya tidak dihapus
 * dari panel (lihat createSlot()). Batasan yang disengaja: rotasi manual
 * ("Putar 90") pada satu slot tidak ikut dipertahankan otomatis, karena
 * bisa membuat foto/bingkai tidak sinkron dengan hasil susun ulang baru
 * dari layout-engine.
 *
 * Riwayat perubahan lengkap: lihat CHANGELOG.md.
 * ===================================================================== */

#target illustrator

/* ---------- JSON polyfill (ES3 Illustrator) ---------- */
if (typeof JSON !== "object") { JSON = {}; }
if (!JSON.stringify) {
  JSON.stringify = function (obj) {
    var t = typeof obj;
    if (t !== "object" || obj === null) {
      if (t === "string") {
        return '"' + obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
          .replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
      }
      if (t === "number" && !isFinite(obj)) return "null";
      return String(obj);
    }
    var json = [], arr = (obj && obj.constructor === Array);
    for (var k in obj) {
      if (!obj.hasOwnProperty(k)) continue;
      var v = obj[k], vt = typeof v;
      if (vt === "function" || vt === "undefined") continue;
      json.push((arr ? "" : '"' + k + '":') + JSON.stringify(v));
    }
    return (arr ? "[" : "{") + json.join(",") + (arr ? "]" : "}");
  };
}
if (!JSON.parse) {
  JSON.parse = function (str) { try { return eval("(" + str + ")"); } catch (e) { return {}; } };
}

var PFPM = PFPM || {};

(function (api) {
  var MM = 72 / 25.4;
  var SHEET_GAP_MM = 15;

  function response(ok, message, data) { var r = { ok: ok, message: message }; if (data !== undefined && data !== null) r.data = data; return JSON.stringify(r); }
  function payload(raw) { try { return JSON.parse(decodeURIComponent(raw || "%7B%7D")); } catch (e) { return {}; } }
  function safeName(v) { return String(v === undefined || v === null ? "ITEM" : v).replace(/[\\\/:*?"<>|\r\n]/g, "-"); }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function rgb(r, g, b) { var c = new RGBColor(); c.red = r; c.green = g; c.blue = b; return c; }
  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }
  function hexToRgb(hex) {
    if (!hex || typeof hex !== "string") return null;
    var m = hex.replace(/^#/, "").match(/^([0-9a-fA-F]{6})$/);
    if (!m) return null;
    var n = parseInt(m[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function activeDoc() { if (app.documents.length === 0) throw new Error("Tidak ada dokumen Illustrator yang terbuka."); return app.activeDocument; }

  function getMeta(item) { if (!item) return null; var note = ""; try { note = item.note; } catch (e) { return null; } if (!note) return null; try { var m = JSON.parse(note); return (m && m.pfpm) ? m : null; } catch (e) { return null; } }
  function getBorderMeta(item) { if (!item) return null; try { var note = item.note; if (!note) return null; var m = JSON.parse(note); return (m && m.pfpmBorder) ? m : null; } catch (e) { return null; } }
  function setMeta(item, meta) { meta.pfpm = true; item.note = JSON.stringify(meta); }

  function resolveSlot(item) { var cur = item, guard = 0; while (cur && guard++ < 40) { if (getMeta(cur)) return cur; try { cur = cur.parent; } catch (e) { return null; } if (!cur || cur.typename === "Layer" || cur.typename === "Document") return null; } return null; }
  function findSlotById(doc, slotId) { for (var i = 0; i < doc.pageItems.length; i++) { var m = getMeta(doc.pageItems[i]); if (m && m.slotId === slotId) return doc.pageItems[i]; } return null; }
  function borderItemsForSlot(doc, slotId) { var out = []; for (var i = 0; i < doc.pageItems.length; i++) { var bm = getBorderMeta(doc.pageItems[i]); if (bm && bm.slotId === slotId) out.push(doc.pageItems[i]); } return out; }

  function selectedSlots() { var doc = activeDoc(); var sel = doc.selection; var out = [], seen = {}; if (!sel || !sel.length) return out; for (var i = 0; i < sel.length; i++) { var s = resolveSlot(sel[i]); if (!s) { var bm = getBorderMeta(sel[i]); if (bm && bm.slotId) s = findSlotById(doc, bm.slotId); } if (!s) continue; var m = getMeta(s); var key = m.slotId + "|" + s.left + "|" + s.top; if (seen[key]) continue; seen[key] = true; out.push(s); } return out; }

  function findClipPath(item) { if (!item) return null; if (item.typename === "PathItem" && item.clipping) return item; if (item.typename === "GroupItem") { for (var i = 0; i < item.pageItems.length; i++) { var f = findClipPath(item.pageItems[i]); if (f) return f; } } return null; }
  function findPlaced(item) { if (!item) return null; if (item.typename === "PlacedItem" || item.typename === "RasterItem") return item; if (item.typename === "GroupItem") { for (var i = 0; i < item.pageItems.length; i++) { var f = findPlaced(item.pageItems[i]); if (f) return f; } } return null; }

  function getLayer(doc, name) { var lyr = null; for (var i = 0; i < doc.layers.length; i++) { if (doc.layers[i].name === name) { lyr = doc.layers[i]; break; } } if (!lyr) { lyr = doc.layers.add(); lyr.name = name; } lyr.locked = false; lyr.visible = true; return lyr; }
  function nextJobId(doc) { var used = {}, i, m; for (i = 0; i < doc.layers.length; i++) { m = doc.layers[i].name.match(/^PF-(\d+)\b/); if (m) used[parseInt(m[1], 10)] = true; } for (i = 0; i < doc.groupItems.length; i++) { m = doc.groupItems[i].name.match(/PF-(\d+)/); if (m) used[parseInt(m[1], 10)] = true; } var n = 1; while (used[n]) n++; return "PF-" + (n < 10 ? "00" : n < 100 ? "0" : "") + n; }

  /* Layer PFPM selalu dinamai "<jobId> Sheet NN" / "<jobId> Cut Guide NN" (lihat api.generate).
     Menghapus semua layer yang cocok pola ini = membersihkan seluruh hasil generate PFPM
     sebelumnya di dokumen, dipakai oleh api.resetArtboard dan (opsional) sebelum generate baru. */
  var GENERATED_LAYER_RE = /^PF-\d+\s+(Sheet|Cut Guide)\s+\d+/;
  function clearGenerated(doc) {
    var removed = 0;
    for (var i = doc.layers.length - 1; i >= 0; i--) {
      var lyr = doc.layers[i];
      if (GENERATED_LAYER_RE.test(lyr.name)) {
        try { lyr.locked = false; lyr.remove(); removed++; } catch (e) {}
      }
    }
    return removed;
  }

  
```
