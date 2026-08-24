/* Compact CSInterface bridge for CEP 10/11 with browser fallback. */
function SystemPath() {}
SystemPath.USER_DATA = "userData";
SystemPath.COMMON_FILES = "commonFiles";
SystemPath.MY_DOCUMENTS = "myDocuments";
SystemPath.APPLICATION = "application";
SystemPath.EXTENSION = "extension";
SystemPath.HOST_APPLICATION = "hostApplication";

function CSEvent(type, scope, appId, extensionId) {
  this.type = type; this.scope = scope || "APPLICATION";
  this.appId = appId; this.extensionId = extensionId; this.data = "";
}
function ColorType() {}
ColorType.RGB = "rgb"; ColorType.NONE = "none";

function CSInterface() { this.hostEnvironment = this.getHostEnvironment(); }
CSInterface.THEME_COLOR_CHANGED_EVENT = "com.adobe.csxs.events.ThemeColorChanged";
CSInterface.prototype.isCEP = function () {
  return typeof window !== "undefined" && !!window.__adobe_cep__;
};
CSInterface.prototype.getHostEnvironment = function () {
  if (!this.isCEP()) return { appName: "BROWSER", appVersion: "0", isBrowser: true };
  try { return JSON.parse(window.__adobe_cep__.getHostEnvironment()); }
  catch (e) { return { appName: "ILST", appVersion: "0" }; }
};
CSInterface.prototype.getApplicationID = function () { return this.getHostEnvironment().appName || "ILST"; };
CSInterface.prototype.getExtensionID = function () { return this.isCEP() ? window.__adobe_cep__.getExtensionId() : "browser"; };
CSInterface.prototype.getSystemPath = function (type) {
  if (!this.isCEP()) return "";
  var path = decodeURI(window.__adobe_cep__.getSystemPath(type));
  if (path.indexOf("file://") === 0) path = path.substr(7);
  if (/^\/[a-zA-Z]:/.test(path)) path = path.substr(1);
  return path;
};
CSInterface.prototype.evalScript = function (script, callback) {
  if (!this.isCEP()) {
    if (callback) callback(JSON.stringify({ ok: false, message: "Panel berjalan dalam mode browser." }));
    return;
  }
  window.__adobe_cep__.evalScript(script, callback || function () {});
};
CSInterface.prototype.addEventListener = function (type, fn, obj) { if (this.isCEP()) window.__adobe_cep__.addEventListener(type, fn, obj); };
CSInterface.prototype.removeEventListener = function (type, fn, obj) { if (this.isCEP()) window.__adobe_cep__.removeEventListener(type, fn, obj); };
CSInterface.prototype.dispatchEvent = function (event) {
  if (!this.isCEP()) return;
  if (typeof event.data === "object") event.data = JSON.stringify(event.data);
  window.__adobe_cep__.dispatchEvent(event);
};
CSInterface.prototype.requestOpenExtension = function (id, params) { if (this.isCEP()) window.__adobe_cep__.requestOpenExtension(id, params); };
CSInterface.prototype.closeExtension = function () { if (this.isCEP()) window.__adobe_cep__.closeExtension(); };
CSInterface.prototype.openURLInDefaultBrowser = function (url) {
  if (this.isCEP() && typeof cep !== "undefined" && cep.util) return cep.util.openURLInDefaultBrowser(url);
  window.open(url, "_blank");
};
CSInterface.prototype.getHostCapabilities = function () {
  if (!this.isCEP()) return {};
  try { return JSON.parse(window.__adobe_cep__.getHostCapabilities()); } catch (e) { return {}; }
};
CSInterface.prototype.getOSInformation = function () {
  var ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  return ua.indexOf("Windows") >= 0 ? "Windows" : ua.indexOf("Mac") >= 0 ? "Mac OS X" : "Unknown";
};
CSInterface.prototype.setWindowTitle = function (title) {
  if (!this.isCEP()) { document.title = title; return; }
  try { window.__adobe_cep__.invokeSync("setWindowTitle", title); } catch (e) {}
};
CSInterface.prototype.resizeContent = function (w, h) {
  if (this.isCEP()) try { window.__adobe_cep__.resizeContent(w, h); } catch (e) {}
};