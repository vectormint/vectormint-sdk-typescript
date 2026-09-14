import fs from 'node:fs';
import path from 'node:path';

const SPEC_URL = process.env.VECTORMINT_OPENAPI_URL || 'https://api.vectormint.app/v1/openapi.json';
const SPEC_FILE = process.env.VECTORMINT_OPENAPI_FILE || '';
const OUTPUT = path.resolve('src/index.ts');
const METHODS = ['get', 'post', 'put', 'patch', 'delete'];
const FRIENDLY_NAMES = {"get /cards":["listCards","list_cards"],"get /cards/search":["searchCards","search_cards"],"post /cards/batch":["batchCards","batch_cards"],"post /cards/compare":["compareCards","compare_cards"],"get /cards/{id}":["getCard","get_card"],"get /cards/{id}/offers":["getCardOffers","get_card_offers"],"get /cards/{id}/rewards":["getCardRewards","get_card_rewards"],"get /cards/{id}/credits":["getCardCredits","get_card_credits"],"get /cards/{id}/fees":["getCardFees","get_card_fees"],"get /cards/{id}/benefits":["getCardBenefits","get_card_benefits"],"get /cards/{id}/provenance":["getCardProvenance","get_card_provenance"],"get /cards/{id}/history":["getCardHistory","get_card_history"],"get /cards/{id}/pricing":["getCardPricing","get_card_pricing"],"get /cards/{id}/freshness":["getCardFreshness","get_card_freshness"],"get /cards/{id}/assets":["getCardsIdAssets","get_cards_id_assets"],"get /cards/{id}/snapshot":["getCardsIdSnapshot","get_cards_id_snapshot"],"get /catalog/snapshot":["getCatalogSnapshot","get_catalog_snapshot"],"get /catalog/sync":["getCatalogSync","get_catalog_sync"],"get /catalog/export":["getCatalogExport","get_catalog_export"],"get /catalog/versions":["getCatalogVersions","get_catalog_versions"],"get /catalog/coverage":["getCatalogCoverage","get_catalog_coverage"],"post /evaluate":["evaluateTransaction","evaluate_transaction"],"post /optimize":["optimizeWallet","optimize_wallet"],"get /issuers":["getIssuers","get_issuers"],"get /categories":["getCategories","get_categories"],"get /reward-currencies":["getRewardCurrencies","get_reward_currencies"],"get /transfer-partners":["listTransferPartners","list_transfer_partners"],"get /application-rules":["getApplicationRules","get_application_rules"],"get /product-change-paths":["getProductChangePaths","get_product_change_paths"],"get /offers/notable":["getOffersNotable","get_offers_notable"],"get /changes":["listChanges","list_changes"],"get /changes/notable":["listNotableChanges","list_notable_changes"],"get /webhooks":["listWebhooks","list_webhooks"],"post /webhooks":["createWebhook","create_webhook"],"get /webhooks/{id}":["getWebhook","get_webhook"],"patch /webhooks/{id}":["updateWebhook","update_webhook"],"delete /webhooks/{id}":["deleteWebhook","delete_webhook"],"get /webhooks/{id}/deliveries":["listWebhookDeliveries","list_webhook_deliveries"],"post /webhooks/{id}/test":["testWebhook","test_webhook"]};

function resolveRef(spec, value) {
  if (!value || typeof value !== 'object' || !value.$ref) return value;
  const ref = String(value.$ref);
  if (!ref.startsWith('#/')) throw new Error(`Only local OpenAPI refs are supported: ${ref}`);
  let cursor = spec;
  for (const token of ref.slice(2).split('/')) cursor = cursor?.[token.replace(/~1/g, '/').replace(/~0/g, '~')];
  if (!cursor) throw new Error(`Unable to resolve OpenAPI ref ${ref}`);
  return cursor;
}

function hasApiKeySecurity(spec, operation) {
  const security = operation.security ?? spec.security ?? [];
  return security.some(entry => Object.hasOwn(entry, 'BearerAuth') || Object.hasOwn(entry, 'ApiKeyHeader'));
}

function words(value) {
  return value.replace(/[{}]/g, ' ').split(/[^A-Za-z0-9]+/).filter(Boolean).map(part => part.toLowerCase());
}

function pascal(parts) {
  return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function defaultNames(method, route) {
  const routeWords = words(route);
  return [`${method}${pascal(routeWords)}`, `${method}_${routeWords.join('_')}`];
}

function safeIdentifier(value) {
  const candidate = value.replace(/[^A-Za-z0-9_$]/g, '_');
  return /^[A-Za-z_$]/.test(candidate) ? candidate : `_${candidate}`;
}

function collectOperations(spec) {
  const operations = [];
  const usedTs = new Set();
  for (const route of Object.keys(spec.paths ?? {}).sort()) {
    const item = spec.paths?.[route];
    if (!item) continue;
    for (const method of METHODS) {
      const operation = resolveRef(spec, item[method]);
      if (!operation || !hasApiKeySecurity(spec, operation)) continue;
      const key = `${method} ${route}`;
      let [tsName] = FRIENDLY_NAMES[key] ?? defaultNames(method, route);
      if (usedTs.has(tsName)) tsName = `${tsName}${pascal([method])}`;
      usedTs.add(tsName);
      const parameters = [...(item.parameters ?? []), ...(operation.parameters ?? [])]
        .map(parameter => resolveRef(spec, parameter)).filter(Boolean);
      const pathParams = parameters.filter(p => p.in === 'path' && p.name).map(p => String(p.name));
      for (const match of route.matchAll(/\{([^}]+)\}/g)) if (!pathParams.includes(match[1])) pathParams.push(match[1]);
      operations.push({ method, path: route, tsName, pathParams, hasBody: Boolean(resolveRef(spec, operation.requestBody)) });
    }
  }
  return operations;
}

function tsMethod(operation) {
  const pathArgs = operation.pathParams.map(name => `${safeIdentifier(name)}: string`).join(', ');
  const args = [pathArgs, operation.hasBody ? 'body: unknown' : '', 'query: Query = {}'].filter(Boolean).join(', ');
  const pathObject = operation.pathParams.length
    ? `{ ${operation.pathParams.map(name => `${JSON.stringify(name)}: ${safeIdentifier(name)}`).join(', ')} }`
    : '{}';
  return `  async ${operation.tsName}<T = ApiEnvelope>(${args}): Promise<T> {\n` +
    `    return this.request<T>(${JSON.stringify(operation.method.toUpperCase())}, ${JSON.stringify(operation.path)}, { path: ${pathObject}, query, body: ${operation.hasBody ? 'body' : 'undefined'} });\n` +
    '  }';
}

function render(version, operations) {
  return "// GENERATED FILE — DO NOT EDIT BY HAND.\n// Source: https://api.vectormint.app/v1/openapi.json (OpenAPI 1.8.0).\n// Regenerate with: npm run generate\n\nexport type AuthMode = 'bearer' | 'x-api-key';\nexport type QueryScalar = string | number | boolean;\nexport type QueryValue = QueryScalar | readonly QueryScalar[] | null | undefined;\nexport type Query = Record<string, QueryValue>;\n\nexport interface ApiEnvelope {\n  object?: string;\n  status?: string;\n  api_version?: string;\n  retrieved_at?: string;\n  meta?: Record<string, unknown>;\n  data?: unknown;\n  [key: string]: unknown;\n}\n\nexport interface VectorMintConfig {\n  apiKey: string;\n  authMode?: AuthMode;\n  baseUrl?: string;\n  fetch?: typeof globalThis.fetch;\n}\n\nexport class VectorMintError extends Error {\n  readonly status: number;\n  readonly payload: unknown;\n\n  constructor(status: number, payload: unknown) {\n    const message = payload && typeof payload === 'object' && 'error' in payload\n      ? String((payload as any).error?.message ?? ('VectorMint request failed with HTTP ' + status))\n      : 'VectorMint request failed with HTTP ' + status;\n    super(message);\n    this.name = 'VectorMintError';\n    this.status = status;\n    this.payload = payload;\n  }\n}\n\ntype RequestOptions = {\n  path: Record<string, string>;\n  query: Query;\n  body?: unknown;\n};\n\nexport class VectorMint {\n  private readonly apiKey: string;\n  private readonly authMode: AuthMode;\n  private readonly baseUrl: string;\n  private readonly fetchImpl: typeof globalThis.fetch;\n\n  constructor(config: VectorMintConfig) {\n    if (!config?.apiKey || typeof config.apiKey !== 'string') throw new TypeError('apiKey is required');\n    if (config.authMode && config.authMode !== 'bearer' && config.authMode !== 'x-api-key') {\n      throw new TypeError('authMode must be bearer or x-api-key');\n    }\n    this.apiKey = config.apiKey;\n    this.authMode = config.authMode ?? 'bearer';\n    this.baseUrl = (config.baseUrl ?? 'https://api.vectormint.app/v1').replace(/\\/+$/, '');\n    const candidate = config.fetch ?? globalThis.fetch;\n    if (typeof candidate !== 'function') throw new Error('A fetch implementation is required');\n    this.fetchImpl = candidate.bind(globalThis);\n  }\n\n  private async request<T>(method: string, route: string, options: RequestOptions): Promise<T> {\n    let rendered = route;\n    for (const [name, value] of Object.entries(options.path)) {\n      rendered = rendered.replace('{' + name + '}', encodeURIComponent(String(value)));\n    }\n    const url = new URL(this.baseUrl + rendered);\n    for (const [name, value] of Object.entries(options.query)) {\n      if (value === undefined || value === null) continue;\n      const values = Array.isArray(value) ? value : [value];\n      for (const item of values) url.searchParams.append(name, String(item));\n    }\n\n    const headers = new Headers({ Accept: 'application/json', 'User-Agent': 'vectormint-typescript/1.8.0' });\n    if (this.authMode === 'x-api-key') headers.set('x-api-key', this.apiKey);\n    else headers.set('Authorization', 'Bearer ' + this.apiKey);\n\n    let body: string | undefined;\n    if (options.body !== undefined) {\n      headers.set('Content-Type', 'application/json');\n      body = JSON.stringify(options.body);\n    }\n\n    const response = await this.fetchImpl(url, { method, headers, body });\n    const text = await response.text();\n    let payload: unknown = null;\n    if (text) {\n      try { payload = JSON.parse(text); }\n      catch { payload = text; }\n    }\n    if (!response.ok) throw new VectorMintError(response.status, payload);\n    return payload as T;\n  }\n\n".replace('OpenAPI 1.8.0', `OpenAPI ${version}`) + operations.map(tsMethod).join('\n\n') + '\n}\n';
}

async function loadSpec() {
  if (SPEC_FILE) return JSON.parse(fs.readFileSync(SPEC_FILE, 'utf8'));
  const response = await fetch(SPEC_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`OpenAPI download failed with HTTP ${response.status}`);
  return response.json();
}

const spec = await loadSpec();
const operations = collectOperations(spec);
if (!operations.length) throw new Error('No API-key-authenticated OpenAPI operations were found.');
fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, render(spec.info?.version ?? 'unknown', operations));
console.log(`Generated ${operations.length} TypeScript SDK operations from OpenAPI ${spec.info?.version ?? 'unknown'}.`);
