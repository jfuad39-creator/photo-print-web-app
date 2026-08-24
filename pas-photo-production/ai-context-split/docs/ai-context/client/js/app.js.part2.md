<!-- AI CONTEXT | original: client/js/app.js | part 2 dari 8 | renderSizePresets, renderOrder, renderSizeTargetSelect -->
```javascript


  $("#btnAddPhoto").onclick = function () {
    if (!B.isCEP) { toast("Fitur ini hanya aktif di dalam Illustrator.", "err"); return; }
    B.call("pickFiles", {}, function (res) {
      if (!res.ok) return toast(res.message, "err");
      addPhotoPaths((res.data && res.data.files) || []);
    });
  };

  $("#btnFromSelection").onclick = function () {
    if (!B.isCEP) { toast("Fitur ini hanya aktif di dalam Illustrator.", "err"); return; }
    B.call("fromSelection", {}, function (res) {
      if (!res.ok) return toast(res.message, "err");
      addPhotoPaths((res.data && res.data.files) || []);
    });
  };

  var dz = $("#dropZone");
  ["dragenter", "dragover"].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add("over"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove("over"); });
  });
  dz.addEventListener("drop", function (e) {
    var list = e.dataTransfer && e.dataTransfer.files;
    if (!list || !list.length) return;
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      var p = f.path || f.name;
      if (!/\.(jpe?g|png|tiff?)$/i.test(p)) continue;
      out.push({ name: f.name, path: p });
    }
    if (!out.length) return toast("Hanya JPG / PNG / TIFF yang didukung.", "err");
    addPhotoPaths(out);
  });

  /* ---------------- order ---------------- */
  function renderSizePresets() {
    var sel = $("#sizePreset");
    sel.innerHTML = "";
    S.sizes.forEach(function (s) {
      var o = el("option");
      o.value = s.id;
      o.textContent = sizeOptionText(s.label, s.width, s.height);
      sel.appendChild(o);
    });
  }

  function renderOrder() {
    var wrap = $("#orderList");
    var st = S.get();
    wrap.innerHTML = "";
    $("#orderHint").style.display = st.items.length ? "none" : "block";

    var showSrc = st.photos.length > 1;

    st.items.forEach(function (it) {
      var row = el("div", "order-row" + (showSrc ? " has-src" : ""));
      var opts = st.photos.map(function (p) {
        return '<option value="' + esc(p.id) + '"' + (p.id === it.sourceId ? " selected" : "") + '>' + esc(p.name) + "</option>";
      }).join("");
      row.innerHTML =
        '<span class="tag">' + esc(it.label) + "</span>" +
        '<input class="input w" type="number" step="1" min="5" value="' + it.width + '" title="Lebar (mm)" />' +
        '<input class="input h" type="number" step="1" min="5" value="' + it.height + '" title="Tinggi (mm)" />' +
        '<input class="input q" type="number" step="1" min="1" value="' + it.quantity + '" title="Quantity" />' +
        (showSrc ? '<select class="input src">' + (opts || '<option value="">\u2014 pilih foto \u2014</option>') + "</select>" : "") +
        '<button class="x" title="Hapus baris"><svg class="ic"><use xlink:href="#i-trash"/></svg></button>';

      row.querySelector(".w").onchange = function (e) { it.width = Number(e.target.value) || 10; S.save(); preview(); };
      row.querySelector(".h").onchange = function (e) { it.height = Number(e.target.value) || 10; S.save(); preview(); };
      row.querySelector(".q").onchange = function (e) { it.quantity = Math.max(0, parseInt(e.target.value, 10) || 0); S.save(); preview(); };
      if (showSrc) row.querySelector(".src").onchange = function (e) { it.sourceId = e.target.value; S.save(); preview(); };
      row.querySelector(".x").onclick = function () { S.removeItem(it.id); renderOrder(); preview(); };
      attachSpinner(row.querySelector(".w"));
      attachSpinner(row.querySelector(".h"));
      attachSpinner(row.querySelector(".q"));
      wrap.appendChild(row);
    });

    renderSizeTargetSelect("#bgSizeTarget");
    renderSizeTargetSelect("#capSizeTarget");
  }

  /* dropdown "Terapkan ke Ukuran Ini" - dipakai bareng oleh blok Ganti
     Background (#bgSizeTarget) dan blok Font & Kerning Label
     (#capSizeTarget) - diambil dari daftar ukuran yang sedang dipakai di
     Order Ukuran, unik per sizeId. */
  function renderSizeTargetSelect(selector) {
    var sel = $(selector);
    if (!sel) return;
    var st = S.get();
    var seen = {}, opts = [];
    st.items.forEach(function (it) {
      if (seen[it.sizeId]) return;
      seen[it.sizeId] = true;
      opts.push(it);
    });
    sel.innerHTML = opts.length
      ? opts.map(function (it) {
          return '<option value="' + esc(it.sizeId) + '">' + esc(sizeOptionText(it.label, it.width, it.height)) + "</option>";
        }).join("")
      : '<option value="">\u2014 tidak ada ukuran \u2014</option>';
  }

  $("#btnAddItem").onclick = function () {
    S.addItem($("#sizePreset").value);
    renderOrder(); preview();
  };

  /* paket cetak foto: isi cepat qty default 4x6=4, 3x4=4, 2x3=6 */
  var PRINT_PACKAGE = [
    { sizeId: "4x6", quantity: 4 },
    { sizeId: "3x4", quantity: 4 },
    { sizeId: "2x3", quantity: 6 }
  ];
  $("#btnPrintPackage").onclick = function () {
    var st = S.get();
    PRINT_PACKAGE.forEach(function (p) {
      var existing = st.items.filter(function (it) { return it.sizeId === p.sizeId; })[0];
      if (existing) existing.quantity = p.quantity;
      else S.addItem(p.sizeId);
    });
    S.save();
    renderOrder(); preview();
    toast("Paket cetak foto diterapkan.", "ok");
  };

  /* ---------------- options ---------------- */
  
```
