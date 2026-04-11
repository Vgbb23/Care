/**
 * Renomeie para fruitfy-config.js.
 *
 * Recomendado: rodar `node server.mjs` (porta padrão 3847) e abrir o checkout.
 * O checkout em localhost usa o proxy /api/fruitfy/pix-charge (sem CORS).
 * Token e IDs ficam em fruitfy.secrets.json na raiz (copie de fruitfy.secrets.example.json).
 *
 * Modo legado (direto no navegador): costuma falhar com "Failed to fetch" por CORS.
 * Só use token/storeId/productId aqui se tiver outra forma de contornar CORS.
 */
window.FRUITFY_CONFIG = {
  /** Caminho do proxy (sempre este path; a URL base vem de fruitfyProxyOrigin / porta). */
  proxyPath: '/api/fruitfy/pix-charge',
  /** Em localhost, use proxy. Defina false para forçar chamada direta (pode dar CORS). */
  useFruitfyProxy: true,
  /**
   * Porta onde roda `node server.mjs` (padrão 3847; não use 5173 se o Vite estiver nela).
   * Com Live Server, o checkout chama http://127.0.0.1:ESTA_PORTA/api/fruitfy/pix-charge.
   */
  fruitfyProxyPort: 3847,
  /** Opcional: URL base fixa do proxy (ex. Live Server + Node em outra porta). */
  fruitfyProxyOrigin: '',
  /** false = usar fruitfyProxyPort fixo; omitir/true = mesmo host/porta da página (recomendado com node server.mjs). */
  fruitfyProxySameOrigin: true,
  apiBase: 'https://api.fruitfy.io',
  chargePath: '/api/pix/charge',
  token: '',
  storeId: '',
  productId: ''
};
