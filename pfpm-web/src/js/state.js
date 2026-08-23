/* =====================================================================
 * src/js/state.js - state form web app (versi standalone, non-CEP).
 * ---------------------------------------------------------------------
 * ADAPTASI dari client/js/state.js milik plugin CEP "Pas Foto Production
 * Manager". Struktur data & buildJob() DISENGAJA dibuat semirip mungkin
 * dengan versi asli supaya client/js/layout-engine.js (PFLayout) bisa
 * dipakai ulang TANPA PERUBAHAN SAMA SEKALI (murni kalkulasi geometri,
 * lihat catatan kepala file layout-engine.js).
 *
 * Perbedaan dari versi CEP:
 *  - Foto TIDAK punya filesystem path (tidak ada akses Node/filesystem
 *    di browser murni). Sebagai gantinya tiap foto menyimpan `file`
 *    (objek File asli dari <input type=file>/drag-drop, dipakai nanti
 *    oleh canvas renderer utk menggambar pixel) + `thumb` (blob URL
 *    utk ditampilkan sebagai <img>, lihat URL.createObjectURL).
 *  - field `sourcePath` di buildJob() SENGAJA dikosongkan ("") - di versi
 *    CEP dipakai host/main.jsx utk `new File(path)` membuka file dari
 *    disk, tidak relevan di sini. Identitas foto tiap slot cukup lewat
 *    `sourceId` (di-lookup balik ke state.photos lewat photoById() saat
 *    render/export), jadi layout-engine.js tidak perlu tahu bedanya -
 *    field sourcePath yang dilewatkannya tetap ada di object slot tapi
 *    memang tidak dipakai.
 *  - Foto TIDAK dipersist ke localStorage (File object tidak bisa
 *    diserialisasi ke JSON) - PERSIS SAMA seperti perilaku versi CEP:
 *    di sana pun state.photos selalu direset ke [] tiap sesi baru
 *    (lihat load()), jadi ini bukan pengurangan fitur, cuma
 *    melanjutkan perilaku yang sudah ada.
 *  - Fitur chroma-key / "Ganti Background" berbasis deteksi warna foto
 *    (bg-swap.js di versi CEP) SENGAJA TIDAK diikutkan di tahap ini
 *    (lihat catatan proyek: fitur ini dipangkas dari roadmap konversi
 *    web app). `photo.bg` di sini HANYA warna solid di belakang PNG
 *    transparan (sama seperti swatch "Ganti Background" per foto di
 *    kartu Sumber Foto versi CEP) - bukan chroma-key, jadi tetap valid
 *    dipertahankan.
 * ===================================================================== */
(function (root) {
  "use strict";

  var KEY = "pfweb.state.v1";

  var DEFAULT_SIZES = [
    { id: "4x6", label: "4x6", width: 40, height: 60 },
    { id: "3x4", label: "3x4", width: 30, height: 40 },
    { id: "2x3", label: "2x3", width: 20, height: 30 },
    { id: "2R", label: "2R", width: 60, height: 90 },
    { id: "3R", label: "3R", width: 89, height: 127 },
    { id: "4R", label: "4R", width: 102, height: 152 },
    { id: "5R", label: "5R", width: 127, height: 178 },
    { id: "6R", label: "6R", width: 152, height: 203 },
    { id: "8R", label: "8R", width: 203, height: 254 }
  ];

  /* paket cetak foto default: sama seperti tombol "Paket Cetak Foto" (4x6=4, 3x4=4, 2x3=6) */
  var PRINT_PACKAGE = [
    { sizeId: "4x6", quantity: 4 },
    { sizeId: "3x4", quantity: 4 },
    { sizeId: "2x3", quantity: 6 }
  ];

  var defaults = {
    items: [],
    media: { type: "A5", orientation: "portrait", margin: 4.5, gap: 0, customWidth: 210, customHeight: 297 },
    options: {
      offsetBorder: 1.5,
      noBorder: false,
      rotateMode: "auto",
      cutGuide: false,
      grouping: "flat",
      fitMode: "fill",
      position: "center"
    }
  };

  var COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

  /* preset warna background standar pas foto (di belakang PNG transparan).
     value "" = tanpa background (transparan, perilaku default). */
  var BG_PRESETS = [
    { id: "none", label: "Transparan", value: "" },
    { id: "white", label: "Putih", value: "#ffffff" },
    { id: "red", label: "Merah", value: "#e0201f" },
    { id: "blue", label: "Biru", value: "#1a56db" },
    { id: "lightblue", label: "Biru Muda", value: "#4a90d9" },
    { id: "gray", label: "Abu-abu", value: "#a0a0a0" }
  ];

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  var state = clone(defaults);
  state.photos = [];

  /** Bangun daftar item default (paket cetak foto) untuk sesi baru. */
  function defaultItems() {
    return PRINT_PACKAGE.map(function (p) {
      var preset = DEFAULT_SIZES.filter(function (s) { return s.id === p.sizeId; })[0] || DEFAULT_SIZES[0];
      return {
        id: uid("item"),
        sizeId: preset.id,
        label: preset.label,
        width: preset.width,
        height: preset.height,
        quantity: p.quantity,
        sourceId: ""
      };
    });
  }

  function load() {
    /* PERSIS SAMA seperti versi CEP: tiap sesi baru (buka halaman)
       selalu kembali ke kondisi default - foto kosong, order = paket
       cetak foto, media/opsi default. save() di bawah tetap menulis ke
       localStorage utk paritas dgn versi CEP (belum dipakai utk apa2 -
       versi CEP sendiri juga tidak pernah membaca baliknya saat load).
       Resume otomatis antar sesi belum termasuk scope tahap ini - kalau
       nanti dibutuhkan, ini titik yang tepat utk ditambahkan. */
    state.photos = [];
    state.items = defaultItems();
    state.media = clone(defaults.media);
    state.options = clone(defaults.options);
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ media: state.media, options: state.options })); } catch (e) {}
  }

  function uid(prefix) {
    return (prefix || "id") + "-" + Math.random().toString(36).substr(2, 7);
  }

  function nextColor() {
    return COLORS[state.photos.length % COLORS.length];
  }

  /** Tambah foto dari File object (input picker atau drag-drop). */
  function addPhoto(file) {
    var thumb = "";
    try { thumb = URL.createObjectURL(file); } catch (e) { thumb = ""; }
    var p = { id: uid("photo"), name: file.name, file: file, thumb: thumb, color: nextColor(), bg: "" };
    state.photos.push(p);
    return p;
  }

  /** Set warna background (hex "#rrggbb" atau "" untuk transparan) untuk satu foto sumber. */
  function setPhotoBg(id, hex) {
    var p = photoById(id);
    if (!p) return;
    p.bg = hex || "";
  }

  function removePhoto(id) {
    var p = photoById(id);
    if (p && p.thumb) { try { URL.revokeObjectURL(p.thumb); } catch (e) {} }
    state.photos = state.photos.filter(function (x) { return x.id !== id; });
    state.items.forEach(function (it) { if (it.sourceId === id) it.sourceId = ""; });
  }

  function addItem(sizeId) {
    var preset = DEFAULT_SIZES.filter(function (s) { return s.id === sizeId; })[0] || DEFAULT_SIZES[0];
    var item = {
      id: uid("item"),
      sizeId: preset.id,
      label: preset.label,
      width: preset.width,
      height: preset.height,
      quantity: preset.id === "2x3" ? 6 : 4,
      sourceId: state.photos.length ? state.photos[0].id : ""
    };
    state.items.push(item);
    return item;
  }

  function removeItem(id) {
    state.items = state.items.filter(function (i) { return i.id !== id; });
  }

  function photoById(id) {
    return state.photos.filter(function (p) { return p.id === id; })[0] || null;
  }

  function reset() {
    state.photos.forEach(function (p) { if (p.thumb) { try { URL.revokeObjectURL(p.thumb); } catch (e) {} } });
    state.photos = [];
    state.items = defaultItems();
    state.media = clone(defaults.media);
    state.options = clone(defaults.options);
    clearEditorState();
    save();
  }

  /** Membangun job object untuk PFLayout.generate() - bentuk output
      disamakan persis dengan versi CEP supaya layout-engine.js reusable
      tanpa perubahan (lihat catatan kepala file). */
  function buildJob() {
    var items = state.items.map(function (it) {
      var src = photoById(it.sourceId);
      return {
        id: it.sizeId + "|" + it.id.substr(-4),
        sizeId: it.sizeId,
        label: it.label,
        width: Number(it.width),
        height: Number(it.height),
        quantity: Number(it.quantity),
        sourceId: it.sourceId,
        sourcePath: "",
        backgroundColor: src ? (src.bg || "") : ""
      };
    });
    return { items: items, media: clone(state.media), options: clone(state.options) };
  }

  load();

  /* ---------------- slot editor: overrides & duplicates ----------------
     Dipakai TAHAP 3 (Slot Editor interaktif). Beda pendekatan dari CEP:
     di CEP, "state" slot yang sudah di-generate itu DOKUMEN ILLUSTRATOR
     itu sendiri (host/main.jsx baca ulang lewat metadata item.note tiap
     kali perlu tahu kondisi slot). Di web tidak ada dokumen terpisah -
     kita SENDIRI yang jadi sumber kebenarannya, jadi cukup disimpan
     langsung di memori di sini, tidak perlu "baca ulang dari kanvas".

     - `overrides[slotId]` = edit manual pada slot ASLI hasil
       PFLayout.generate() (dikunci lewat slotId yang sama seperti versi
       CEP - lihat catatan reconcile di CLAUDE.md soal batasan stabilitas
       slotId antar regenerate). dx/dy = geser posisi frame dari titik
       hasil algoritma packing (mm) - INI PADANAN api.nudge versi CEP.
       crop = pan+zoom foto DI DALAM frame (padanan api.crop). rotationExtra
       = rotasi TAMBAHAN pada KONTEN foto SAJA, tidak mengubah ukuran/
       footprint frame (lihat catatan CLAUDE.md kenapa ini SENGAJA beda
       dari rotate90 versi CEP yang memutar frame+border sekaligus -
       potensi tabrakan sama slot tetangga kalau frame ikut diputar tanpa
       layout-engine ikut menghitung ulang). sourceId = "" berarti tidak
       di-override (tetap ikut pilihan Order Ukuran); string non-kosong
       berarti foto slot ini diganti manual, lepas dari Order Ukuran.
       backgroundColor = null berarti tidak di-override (ikut warna bg
       foto sumbernya); string (termasuk "" utk transparan) berarti
       di-override manual.
     - `duplicates` = daftar slot HASIL DUPLIKAT, masing-masing objek
       BERDIRI SENDIRI (bukan lewat overrides) karena tidak ikut disusun
       ulang oleh layout-engine sama sekali - padanan `duplicateGroups`
       versi CEP. */
  var overrides = {};
  var duplicates = [];

  function emptyOverride() {
    return { dx: 0, dy: 0, crop: { x: 0, y: 0, scale: 100 }, rotationExtra: 0, flipH: false, flipV: false, sourceId: "", backgroundColor: null };
  }

  function getOverride(slotId) { return overrides[slotId] || null; }

  function ensureOverride(slotId) {
    if (!overrides[slotId]) overrides[slotId] = emptyOverride();
    return overrides[slotId];
  }

  function nudgeOverride(slotId, dxMm, dyMm) {
    var o = ensureOverride(slotId);
    o.dx += Number(dxMm) || 0;
    o.dy += Number(dyMm) || 0;
  }

  /** Dipakai saat drag mouse (posisi ABSOLUT relatif ke titik hasil
      algoritma packing, beda dari nudgeOverride yang MENAMBAH delta -
      drag butuh "set langsung" supaya elemen persis ikut kursor tanpa
      efek numerik berlipat tiap event mousemove). */
  function setOverridePos(slotId, dxMm, dyMm) {
    var o = ensureOverride(slotId);
    o.dx = Number(dxMm) || 0;
    o.dy = Number(dyMm) || 0;
  }

  function setDuplicatePos(slotId, x, y) {
    var d = duplicateById(slotId);
    if (!d) return;
    d.x = Number(x) || 0;
    d.y = Number(y) || 0;
  }

  function setOverrideCrop(slotId, patch) {
    var o = ensureOverride(slotId);
    if (patch.dx !== undefined) o.crop.x += Number(patch.dx) || 0;
    if (patch.dy !== undefined) o.crop.y += Number(patch.dy) || 0;
    if (patch.scale !== undefined) o.crop.scale = Math.max(20, Math.min(600, (Number(o.crop.scale) || 100) + Number(patch.scale)));
    if (patch.reset) o.crop = { x: 0, y: 0, scale: 100 };
  }

  function rotateOverride(slotId) {
    var o = ensureOverride(slotId);
    o.rotationExtra = (Number(o.rotationExtra) + 90) % 360;
  }

  function flipOverride(slotId, axis) {
    var o = ensureOverride(slotId);
    if (axis === "h") o.flipH = !o.flipH;
    if (axis === "v") o.flipV = !o.flipV;
  }

  function setOverrideSource(slotId, sourceId) {
    var o = ensureOverride(slotId);
    o.sourceId = sourceId || "";
  }

  function setOverrideBg(slotId, hex) {
    var o = ensureOverride(slotId);
    o.backgroundColor = (hex === null) ? null : (hex || "");
  }

  function resetOverride(slotId) { delete overrides[slotId]; }

  /** resolved = data slot yang SUDAH digabung dengan override (dari
      render pass) - dipakai sebagai titik awal duplikat supaya salinan
      persis meniru tampilan slot aslinya saat tombol Duplikat ditekan. */
  /** `resolved.x/y` di sini SUDAH berupa POSISI TARGET yang diinginkan
      (pemanggil di app.js yang menghitung arah atas/bawah/kiri/kanan dari
      tombol dpad-plus, lihat renderEditor()) - fungsi ini cuma clamp
      supaya tidak keluar batas lembar lalu menyimpannya sebagai slot
      duplikat baru yang berdiri sendiri. */
  function duplicateSlot(resolved, sheetIndex, sheetW, sheetH) {
    var dup = {
      slotId: resolved.slotId + "-copy-" + uid("").replace(/^id-/, ""),
      sheetIndex: sheetIndex,
      sizeId: resolved.sizeId,
      label: resolved.label,
      x: Math.max(0, Math.min(resolved.x, Math.max(0, sheetW - resolved.width))),
      y: Math.max(0, Math.min(resolved.y, Math.max(0, sheetH - resolved.height))),
      width: resolved.width,
      height: resolved.height,
      physicalWidth: resolved.physicalWidth,
      physicalHeight: resolved.physicalHeight,
      rotation: resolved.rotation,
      offsetBorder: resolved.offsetBorder,
      sourceId: resolved.sourceId,
      backgroundColor: resolved.backgroundColor || "",
      crop: { x: resolved.crop.x, y: resolved.crop.y, scale: resolved.crop.scale },
      rotationExtra: resolved.rotationExtra || 0,
      flipH: !!resolved.flipH,
      flipV: !!resolved.flipV
    };
    duplicates.push(dup);
    return dup;
  }

  function removeDuplicate(slotId) {
    duplicates = duplicates.filter(function (d) { return d.slotId !== slotId; });
  }

  function isDuplicate(slotId) {
    return duplicates.some(function (d) { return d.slotId === slotId; });
  }

  function duplicateById(slotId) {
    return duplicates.filter(function (d) { return d.slotId === slotId; })[0] || null;
  }

  function clearEditorState() {
    overrides = {};
    duplicates = [];
  }

  root.PFState = {
    get: function () { return state; },
    save: save,
    reset: reset,
    uid: uid,
    sizes: DEFAULT_SIZES,
    colors: COLORS,
    bgPresets: BG_PRESETS,
    addPhoto: addPhoto,
    setPhotoBg: setPhotoBg,
    removePhoto: removePhoto,
    addItem: addItem,
    removeItem: removeItem,
    photoById: photoById,
    buildJob: buildJob,
    /* slot editor (tahap 3) */
    getOverride: getOverride,
    nudgeOverride: nudgeOverride,
    setOverridePos: setOverridePos,
    setOverrideCrop: setOverrideCrop,
    rotateOverride: rotateOverride,
    flipOverride: flipOverride,
    setOverrideSource: setOverrideSource,
    setOverrideBg: setOverrideBg,
    resetOverride: resetOverride,
    duplicateSlot: duplicateSlot,
    removeDuplicate: removeDuplicate,
    isDuplicate: isDuplicate,
    duplicateById: duplicateById,
    setDuplicatePos: setDuplicatePos,
    duplicates: function () { return duplicates; }
  };
})(typeof window !== "undefined" ? window : this);
