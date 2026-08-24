<!-- AI CONTEXT | original: client/js/app.js | part 5 dari 8 | preview -->
```javascript
function preview() {
    var box = $("#preview");
    var msg = $("#previewMsg");
    box.innerHTML = "";
    msg.textContent = "";
    msg.className = "msg";
    lastLayout = null;

    var st = S.get();
    renderCaptionTab(st);
    if (!st.items.length) { msg.textContent = "Tambahkan minimal satu ukuran."; return; }

    var missing = st.items.filter(function (i) { return i.quantity > 0 && !i.sourceId; });
    if (missing.length) {
      msg.className = "msg err";
      msg.textContent = "Ada baris tanpa foto sumber. Pilih foto pada setiap ukuran.";
      return;
    }

    var layout;
    try { layout = L.generate(S.buildJob()); }
    catch (e) { msg.className = "msg err"; msg.textContent = e.message; return; }

    lastLayout = layout;

    /* FIX: Hitung lebar tersedia lebih aman.
       Sebelumnya memakai box.clientWidth - padding - 6, yang terlalu
       mepet sehingga sheet bisa terpotong. Sekarang kurangi extra
       margin 24px (2x10px padding + 4px buffer) untuk memastikan sheet
       selalu muat termasuk border dan scrollbar. */
    var RV_W = 30;
    var rawW = box.clientWidth || 320;
    var availW = Math.max(120, rawW - RV_W - 24);

    layout.sheets.forEach(function (sheet) {
      var scale = Math.min(availW / sheet.width, 3.2);
      var wPx = Math.round(sheet.width * scale);
      var hPx = Math.round(sheet.height * scale);

      var blockEl = el("div", "sheet-block");
      blockEl.appendChild(el("div", "sheet-caption",
        "Sheet " + sheet.index + " \u00b7 " + sheet.slots.length + " foto \u00b7 " + sheet.efficiency.toFixed(1) + "%"));

      var stage = el("div", "sheet-stage");

      var hRuler = el("div", "ruler-h");
      hRuler.style.width = wPx + "px";
      hRuler.style.marginLeft = RV_W + "px";
      hRuler.innerHTML = '<span class="ruler-arrow">\u25c0</span><span class="ruler-line"></span><span class="ruler-arrow">\u25b6</span>';
      stage.appendChild(hRuler);

      var row = el("div", "stage-row");

      var vRuler = el("div", "ruler-v");
      vRuler.style.height = hPx + "px";
      vRuler.style.width = RV_W + "px";
      vRuler.innerHTML =
        '<span class="rv-label">' + sheet.height + " mm</span>" +
        '<span class="rv-arrows"><span class="ruler-arrow">\u25b2</span><span class="rv-line"></span><span class="ruler-arrow">\u25bc</span></span>';
      row.appendChild(vRuler);

      var page = el("div", "sheet");
      page.style.width = wPx + "px";
      page.style.height = hPx + "px";

      var mSide = Math.round((sheet.margin || 0) * scale);
      var mTop = Math.round((sheet.marginTop != null ? sheet.marginTop : (sheet.margin || 0)) * scale);
      if (mSide > 0 || mTop > 0) {
        var guide = el("div", "sheet-guide");
        guide.style.left = mSide + "px"; guide.style.top = mTop + "px";
        guide.style.right = mSide + "px"; guide.style.bottom = mSide + "px";
        page.appendChild(guide);
      }

      sheet.slots.forEach(function (s) {
        var d = el("div", "slot" + (s.rotation ? " rot" : ""));
        d.style.left = (s.x * scale) + "px";
        d.style.top = (s.y * scale) + "px";
        d.style.width = (s.width * scale) + "px";
        d.style.height = (s.height * scale) + "px";

        var photo = S.get().photos.filter(function (p) { return p.path === s.sourcePath; })[0];

        var rot = ((Number(s.rotation) || 0) % 360 + 360) % 360;
        var swapped = (rot % 180) !== 0;
        var pw = swapped ? s.height : s.width;
        var ph = swapped ? s.width : s.height;

        var photoEl = el("div", "slot-photo");
        photoEl.style.width = (pw * scale) + "px";
        photoEl.style.height = (ph * scale) + "px";
        photoEl.style.transform = "translate(-50%,-50%)" + (rot ? " rotate(" + rot + "deg)" : "");
        if (photo && isRenderable(photo.path)) {
          photoEl.style.backgroundImage = "url('" + (photo.thumb || fileUrl(photo.path)) + "')";
          photoEl.style.backgroundColor = (photo && photo.bg) ? photo.bg : "transparent";
        } else {
          photoEl.style.background = (photo && photo.color) || "#8aa";
        }
        d.appendChild(photoEl);

        /* overlay bar caption (kalau aktif & slot ini punya teks hasil
           resolusi) - hanya perkiraan visual, bukan render presisi (yang
           presisi ada di host/main.jsx saat Generate); cukup untuk
           mengecek dari Preview kalau labelnya sudah muncul di slot yang
           benar sebelum benar-benar generate ke Illustrator. */
        if (layout.caption && layout.caption.enabled && s.captionText) {
          var capMm = Math.max(0, Number(layout.caption.heightMm) || 8);
          var capPx = capMm * scale;
          if (capPx > 1) {
            var capEl = el("div", "slot-caption");
            capEl.style.height = Math.round(capPx) + "px";
            capEl.textContent = s.captionText;
            d.appendChild(capEl);
          }
        }

        d.title = s.label + " " + s.physicalWidth + "\u00d7" + s.physicalHeight + "mm" + (s.rotation ? " (rotasi 90\u00b0)" : "");
        page.appendChild(d);
      });

      if (!(layout.options && layout.options.noBorder)) {
        sheet.slots.forEach(function (s) {
          var ob = Math.max(0, Number(s.offsetBorder) || 0);
          var bd = el("div", "slot-border");
          bd.style.left = ((s.x - ob) * scale) + "px";
          bd.style.top = ((s.y - ob) * scale) + "px";
          bd.style.width = ((s.width + 2 * ob) * scale) + "px";
          bd.style.height = ((s.height + 2 * ob) * scale) + "px";
          page.appendChild(bd);
        });
      }

      row.appendChild(page);
      stage.appendChild(row);
      blockEl.appendChild(stage);
      box.appendChild(blockEl);
    });

    msg.className = "msg ok";
    msg.textContent = "Efisiensi " + layout.efficiency.toFixed(1) + "% \u00b7 " +
      layout.placed + "/" + layout.totalSlots + " foto tersusun pada " + layout.sheets.length + " lembar.";
    if (layout.unplaced > 0) {
      msg.className = "msg err";
      msg.textContent += " (" + layout.unplaced + " foto tidak muat!)";
    }
  }
```
