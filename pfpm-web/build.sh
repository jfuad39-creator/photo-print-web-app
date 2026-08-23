#!/usr/bin/env bash
# =====================================================================
# build.sh - gabungkan src/ jadi SATU file .html mandiri (offline).
# ---------------------------------------------------------------------
# Kenapa perlu di-bundle: tujuan akhir proyek ini adalah file .html yang
# bisa diklik 2x dan langsung jalan tanpa server/koneksi - <link
# rel=stylesheet href=...> dan <script src=...> tetap PERLU dipisah saat
# development (lebih gampang diedit/dibaca), tapi untuk versi yang
# dibagikan ke user, semuanya di-inline jadi satu file supaya tidak ada
# dependency file eksternal yang bisa "ke-lupa ikut" saat file
# dipindah/dikirim.
#
# Pakai: ./build.sh  ->  hasil di dist/pas-foto-web.html
# =====================================================================
set -euo pipefail
cd "$(dirname "$0")"

SRC_HTML="src/index.html"
OUT_DIR="dist"
OUT_FILE="$OUT_DIR/pas-foto-web.html"

mkdir -p "$OUT_DIR"

node -e '
const fs = require("fs");

const html = fs.readFileSync("src/index.html", "utf8");
const css = fs.readFileSync("src/css/theme.css", "utf8");
const jsFiles = ["src/js/state.js", "src/js/layout-engine.js", "src/js/app.js"];
const js = jsFiles.map(f => "/* ==== " + f + " ==== */\n" + fs.readFileSync(f, "utf8")).join("\n\n");

/* PENTING: replacer di .replace() harus FUNCTION, bukan string literal.
   Kalau string, JS menafsirkan "$" di dalamnya sebagai pola pengganti
   khusus (mis. "$$" -> literal "$" tunggal, "$&" -> seluruh match) - dan
   app.js MEMANG punya "function $$(sel)" di dalamnya, jadi kalau lewat
   string replacer, "$$" itu ketelan jadi "$" tunggal dan app rusak
   (dua fungsi ke-declare sebagai nama "$" yang sama). Function replacer
   me-return isinya APA ADANYA, tanpa pola substitusi apa pun. */
let out = html
  .replace(/<link rel="stylesheet" href="css\/theme\.css" \/>/, () => "<style>\n" + css + "\n</style>")
  .replace(/<script src="js\/state\.js"><\/script>\s*<script src="js\/layout-engine\.js"><\/script>\s*<script src="js\/app\.js"><\/script>/, () => "<script>\n" + js + "\n</script>");

if (out.includes("<link rel=\"stylesheet\"")) throw new Error("CSS <link> gagal digantikan - cek pola regex vs src/index.html");
if (out.includes("<script src=")) throw new Error("<script src> gagal digantikan - cek pola regex vs src/index.html");

fs.writeFileSync("'"$OUT_FILE"'", out, "utf8");
console.log("Bundled ->", "'"$OUT_FILE"'", "(" + (Buffer.byteLength(out) / 1024).toFixed(1) + " KB)");
'
