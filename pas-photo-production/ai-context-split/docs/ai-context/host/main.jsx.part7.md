<!-- AI CONTEXT | original: host/main.jsx | part 7 dari 11 | api.createDocument -->
```jsx
api.createDocument = function (raw) {
    var prevLevel = null;
    try {
      var data = payload(raw);
      var media = data.media || {};
      var size = mediaSize(media);
      var w = size[0], h = size[1];
      if (media.orientation === "landscape") {
        var tmp = w;
        w = h;
        h = tmp;
      }

      /* Silence any preset/color-profile dialog so behaviour matches an
         unattended File > New. */
      try {
        prevLevel = app.userInteractionLevel;
        app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;
      } catch (eLvl) { prevLevel = null; }

      /* --------------------------------------------------------------
         Prefer app.documents.addDocument(preset, DocumentPreset, false).
         This is the SAME path File > New uses internally, so Illustrator
         takes care of view centering, pasteboard placement and rulers.
         Fallback to app.documents.add() only if the preset API is missing
         (very old CS5 hosts).
         -------------------------------------------------------------- */
      var doc = null;
      var presetName = pickStartupPreset();

      try {
        if (typeof DocumentPreset !== "undefined" && app.documents.addDocument) {
          var dp = new DocumentPreset();
          var mediaLabel = (media.type === "CUSTOM") ? (Math.round(w) + "x" + Math.round(h) + "mm") : (media.type || "A4");
          dp.title          = "Pas Foto " + mediaLabel;
          dp.width          = w * MM;
          dp.height         = h * MM;
          dp.units          = RulerUnits.Millimeters;
          dp.colorMode      = DocumentColorSpace.RGB;
          dp.numArtboards   = 1;
          try { dp.previewMode  = DocumentPreviewMode.DefaultPreview; } catch (ePM) {}
          try { dp.rasterResolution = DocumentRasterResolution.ScreenResolution; } catch (eRR) {}
          try { dp.transparencyGrid = DocumentTransparencyGrid.TransparencyGridNone; } catch (eTG) {}
          doc = app.documents.addDocument(presetName, dp, false);
        }
      } catch (eAdd) { doc = null; }

      /* Fallback for old hosts */
      if (!doc) {
        doc = app.documents.add(DocumentColorSpace.RGB, w * MM, h * MM);
      }

      /* Basic metadata to match manual File > New results. */
      try { doc.artboards[0].name = ((media.type === "CUSTOM") ? (Math.round(w) + "x" + Math.round(h) + "mm") : (media.type || "A4")) + " " + (media.orientation || "portrait"); } catch (eName) {}
      try { doc.artboards.setActiveArtboardIndex(0); } catch (eActive) {}
      try { doc.rulerUnits = RulerUnits.Millimeters; } catch (eRuler) {}

      /* Bring the freshly created document to the foreground WITHOUT
         calling any view-fitting menu command. File > New leaves the new
         artboard perfectly centered in its own window; forcing "fitin" or
         "fitall" here is what caused the artboard to jump/scroll. Simply
         activate the doc and let Illustrator's own window handling do the
         rest. */
      try { doc.activate(); } catch (eAct) {}
      try { app.redraw(); } catch (eRD) {}

      if (prevLevel !== null) {
        try { app.userInteractionLevel = prevLevel; } catch (eLvl2) {}
      }
      return response(true,
        "Dokumen baru dibuat: " + (media.type || "A4") + " " + Math.round(w) + "x" + Math.round(h) + "mm.",
        { width: w, height: h });
    } catch (e) {
      if (prevLevel !== null) {
        try { app.userInteractionLevel = prevLevel; } catch (eLvl3) {}
      }
      return response(false, "Create document gagal: " + e.message);
    }
  };

  
```
