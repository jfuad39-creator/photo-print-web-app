<!-- AI CONTEXT | original: host/main.jsx | part 11 dari 11 | api.undo, api.print, api.pickFiles, api.fromSelection, api.docInfo, api.ping -->
```jsx
api.undo = function () { try { app.undo(); app.redraw(); return response(true, "Undo."); } catch (e) { try { app.executeMenuCommand("undo"); return response(true, "Undo."); } catch (e2) { return response(false, "Undo gagal: " + e2.message); } } };

  /* api.print: membuka dialog Print NATIVE Illustrator (File > Print) untuk
     dokumen aktif - bukan cetak langsung tanpa dialog, supaya user tetap
     bisa memilih printer/ukuran kertas/dsb seperti biasa.
     CATATAN: ID menu Illustrator itu case-sensitive - yang benar "Print"
     (P besar), BUKAN "print". Memakai casing yang salah tidak membuat
     command dikenali sehingga Illustrator melempar error parameter
     ("1346458189 ('PARM')") alih-alih membuka dialog. Kalau versi
     Illustrator tertentu ternyata memakai casing lain, dicoba beberapa
     varian sebagai fallback supaya tetap jalan. */
  api.print = function () {
    try {
      activeDoc();
      var candidates = ["Print", "print", "PRINT"];
      var lastErr = null;
      for (var i = 0; i < candidates.length; i++) {
        try {
          app.executeMenuCommand(candidates[i]);
          return response(true, "Dialog Print dibuka.");
        } catch (eTry) {
          lastErr = eTry;
        }
      }
      throw lastErr || new Error("Command menu Print tidak dikenali.");
    } catch (e) {
      return response(false, "Print gagal: " + e.message);
    }
  };

  api.pickFiles = function () { try { var files = File.openDialog("Pilih foto (JPG / PNG / TIFF)", "*.jpg;*.jpeg;*.png;*.tif;*.tiff", true); if (!files) return response(true, "Dibatalkan.", { files: [] }); if (!(files instanceof Array)) files = [files]; var out = []; for (var i = 0; i < files.length; i++) { out.push({ path: files[i].fsName, name: decodeURI(files[i].name) }); } return response(true, out.length + " file dipilih.", { files: out }); } catch (e) { return response(false, e.message); } };
  api.fromSelection = function () { try { var doc = activeDoc(); var sel = doc.selection; if (!sel || !sel.length) return response(false, "Tidak ada objek terpilih di Illustrator."); var out = []; function walk(it) { if (!it) return; if (it.typename === "PlacedItem" || it.typename === "RasterItem") { try { var f = it.file; if (f) out.push({ path: f.fsName, name: decodeURI(f.name) }); } catch (e) {} return; } if (it.typename === "GroupItem") { for (var i = 0; i < it.pageItems.length; i++) walk(it.pageItems[i]); } } for (var i = 0; i < sel.length; i++) walk(sel[i]); if (!out.length) return response(false, "Objek terpilih bukan foto linked (PlacedItem)."); return response(true, out.length + " foto diambil dari seleksi.", { files: out }); } catch (e) { return response(false, e.message); } };
  api.docInfo = function () { try { var doc = activeDoc(); return response(true, "OK", { name: doc.name, artboards: doc.artboards.length, version: app.version }); } catch (e) { return response(false, e.message); } };
  api.ping = function () { return response(true, "PFPM host v2.7.4 siap.", { version: "2.7.4" }); };

})(PFPM);
```
