<!-- AI CONTEXT | original: client/js/app.js | part 3 dari 8 | bindOptions, syncTopbarHeight, switchTab -->
```javascript
function bindOptions() {
    var st = S.get();
    $("#mediaType").value = st.media.type;
    $("#orientation").value = st.media.orientation;
    $("#margin").value = st.media.margin;
    $("#gap").value = st.media.gap;
    $("#customWidth").value = st.media.customWidth;
    $("#customHeight").value = st.media.customHeight;
    $("#customSizeFields").style.display = (st.media.type === "CUSTOM") ? "" : "none";
    $("#offsetBorder").value = st.options.offsetBorder;
    $("#noBorder").checked = !!st.options.noBorder;
    $("#offsetBorder").disabled = !!st.options.noBorder;
    $("#rotateMode").value = st.options.rotateMode;
    $("#cutGuide").checked = !!st.options.cutGuide;
    $("#artboards").checked = st.options.artboards !== false;
    $("#replacePrev").checked = st.options.replacePrev !== false;
    $$("input[name=\"grouping\"]").forEach(function (r) { r.checked = (r.value === st.options.grouping); });
    $$("input[name=\"fitMode\"]").forEach(function (r) { r.checked = (r.value === (st.options.fitMode || "fill")); });
    $$("input[name=\"position\"]").forEach(function (r) {
      r.checked = (r.value === (st.options.position || "center"));
      r.closest(".pos-radio").classList.toggle("active", r.checked);
    });

    function on(id, fn) { $(id).onchange = function (e) { fn(e.target); S.save(); preview(); }; }
    on("#mediaType", function (t) {
      st.media.type = t.value;
      $("#customSizeFields").style.display = (t.value === "CUSTOM") ? "" : "none";
    });
    on("#orientation", function (t) { st.media.orientation = t.value; });
    on("#margin", function (t) { st.media.margin = Number(t.value) || 0; });
    on("#gap", function (t) { st.media.gap = Number(t.value) || 0; });
    on("#customWidth", function (t) { st.media.customWidth = Math.max(10, Number(t.value) || 210); });
    on("#customHeight", function (t) { st.media.customHeight = Math.max(10, Number(t.value) || 297); });
    on("#offsetBorder", function (t) { st.options.offsetBorder = Number(t.value) || 0; });
    on("#noBorder", function (t) { st.options.noBorder = t.checked; $("#offsetBorder").disabled = t.checked; });
    on("#rotateMode", function (t) { st.options.rotateMode = t.value; });
    on("#cutGuide", function (t) { st.options.cutGuide = t.checked; });
    on("#artboards", function (t) { st.options.artboards = t.checked; });
    on("#replacePrev", function (t) { st.options.replacePrev = t.checked; });
    $$("input[name=\"grouping\"]").forEach(function (r) {
      r.onchange = function () { if (r.checked) { st.options.grouping = r.value; S.save(); } };
    });
    $$("input[name=\"fitMode\"]").forEach(function (r) {
      r.onchange = function () { if (r.checked) { st.options.fitMode = r.value; S.save(); } };
    });
    $$("input[name=\"position\"]").forEach(function (r) {
      r.onchange = function () {
        if (!r.checked) return;
        st.options.position = r.value;
        $$("input[name=\"position\"]").forEach(function (o) { o.closest(".pos-radio").classList.toggle("active", o.checked); });
        S.save();
        preview();
      };
    });

    attachSpinner($("#margin"));
    attachSpinner($("#gap"));
    attachSpinner($("#customWidth"));
    attachSpinner($("#customHeight"));
    attachSpinner($("#offsetBorder"));
  }

  /* ---------------- tab bar (Setup / Slot Editor) ----------------
     Tab bar di-pin (position:sticky) tepat di bawah topbar lewat CSS
     var --topbar-h (lihat theme.css). Topbar bisa berubah tinggi
     (topbar-actions boleh wrap ke baris ke-2 di panel sempit), jadi
     nilainya diukur ulang dari DOM tiap kali panel resize supaya
     tab-bar selalu menempel pas tanpa celah/tabrakan. */
  function syncTopbarHeight() {
    var tb = $(".topbar");
    if (!tb) return;
    document.documentElement.style.setProperty("--topbar-h", tb.offsetHeight + "px");
  }

  /* TAB_PANELS: peta nama tab -> id panel/tombolnya. "label" (tab Label
     teks caption) ditambahkan di sini saja - switchTab() generik untuk
     jumlah tab berapa pun, tidak perlu diubah lagi kalau nanti nambah tab. */
  var TAB_PANELS = {
    setup: { panel: "tabSetup", btn: "tabBtnSetup" },
    editor: { panel: "tabEditor", btn: "tabBtnEditor" },
    label: { panel: "tabLabel", btn: "tabBtnLabel" }
  };
  function switchTab(name) {
    Object.keys(TAB_PANELS).forEach(function (key) {
      var t = TAB_PANELS[key];
      var isActive = key === name;
      $("#" + t.panel).classList.toggle("active", isActive);
      $("#" + t.btn).classList.toggle("active", isActive);
      $("#" + t.btn).setAttribute("aria-selected", String(isActive));
    });
    /* preview-box bisa saja sempat digambar ulang (mis. lewat popup
       "Buat Dokumen Baru" atau tombol Reset di topbar, keduanya tetap
       bisa dipicu walau tab Setup sedang tidak aktif) selagi #tabSetup
       disembunyikan (display:none -> clientWidth 0). Gambar ulang di
       sini supaya preview selalu memakai lebar asli begitu tab Setup
       terlihat lagi, bukan fallback 320px di preview(). */
    if (name === "setup") preview();
  }
  $("#tabBtnSetup").onclick = function () { switchTab("setup"); };
  $("#tabBtnEditor").onclick = function () { switchTab("editor"); };
  $("#tabBtnLabel").onclick = function () { switchTab("label"); };

  /* ---------------- media & layout panel (collapsible, default tersembunyi) ---------------- */
  $("#mediaLayoutToggle").onclick = function () {
    var body = $("#mediaLayoutBody");
    var open = !body.classList.contains("open");
    body.classList.toggle("open", open);
    $("#mediaLayoutToggle").setAttribute("aria-expanded", String(open));
  };

  /* ---------------- structure panel (collapsible, default tersembunyi) ---------------- */
  $("#structureToggle").onclick = function () {
    var body = $("#structureBody");
    var open = !body.classList.contains("open");
    body.classList.toggle("open", open);
    $("#structureToggle").setAttribute("aria-expanded", String(open));
  };

  /* ---------------- tab Label (caption) ----------------
     Render field global + daftar override per foto/per baris Order Ukuran.
     Dipanggil dari preview() (lihat di bawah) supaya selalu sinkron begitu
     ada foto/baris ditambah-hapus atau teksnya diubah - input pakai
     onchange (bukan oninput) persis seperti field ".nm" (nama foto),
     supaya rebuild DOM di sini tidak memutus fokus user saat sedang
     mengetik (baru rebuild setelah blur/Enter). */
  
```
