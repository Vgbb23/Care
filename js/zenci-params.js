/**
 * Guarda parâmetros da URL (?utm_*, fbclid, etc.) em sessionStorage para todas as páginas.
 * Leitura: getZenciAttribution() — usado no checkout ao gerar o PIX.
 */
(function () {
  var STORAGE_KEY = 'zenciAttribution';
  var MAX_KEYS = 60;
  var MAX_KEY_LEN = 80;
  var MAX_VAL_LEN = 2000;

  function parseCurrentQuery() {
    var search = window.location.search;
    if (!search || search.length < 2) return {};
    var params = new URLSearchParams(search);
    var out = {};
    var n = 0;
    params.forEach(function (value, key) {
      if (n >= MAX_KEYS) return;
      if (!key || String(key).length > MAX_KEY_LEN) return;
      var k = String(key);
      var v = value == null ? '' : String(value).slice(0, MAX_VAL_LEN);
      if (v !== '') {
        out[k] = v;
        n++;
      }
    });
    return out;
  }

  function readStored() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      var o = JSON.parse(raw);
      return o && typeof o === 'object' && !Array.isArray(o) ? o : {};
    } catch (e) {
      return {};
    }
  }

  function writeStored(obj) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {}
  }

  /** Mescla: parâmetros já guardados + da URL atual (a URL sobrescreve a mesma chave). */
  function syncFromUrl() {
    var prev = readStored();
    var fromUrl = parseCurrentQuery();
    var merged = Object.assign({}, prev, fromUrl);
    writeStored(merged);
    return merged;
  }

  syncFromUrl();

  window.getZenciAttribution = function () {
    return readStored();
  };

  window.zenciAttributionStorageKey = STORAGE_KEY;

  /** Chame antes de ir ao checkout se mudou a URL sem reload (raro). */
  window.zenciParamsRefresh = syncFromUrl;
})();
