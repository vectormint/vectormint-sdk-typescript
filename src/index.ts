// GENERATED FILE — DO NOT EDIT BY HAND.
// Source: https://api.vectormint.app/v1/openapi.json (OpenAPI 1.8.0).
// Regenerate with: npm run generate

export type AuthMode = 'bearer' | 'x-api-key';
export type QueryScalar = string | number | boolean;
export type QueryValue = QueryScalar | readonly QueryScalar[] | null | undefined;
export type Query = Record<string, QueryValue>;

export interface ApiEnvelope {
  object?: string;
  status?: string;
  api_version?: string;
  retrieved_at?: string;
  meta?: Record<string, unknown>;
  data?: unknown;
  [key: string]: unknown;
}

export interface VectorMintConfig {
  apiKey: string;
  authMode?: AuthMode;
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
}

export class VectorMintError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, payload: unknown) {
    const message = payload && typeof payload === 'object' && 'error' in payload
      ? String((payload as any).error?.message ?? ('VectorMint request failed with HTTP ' + status))
      : 'VectorMint request failed with HTTP ' + status;
    super(message);
    this.name = 'VectorMintError';
    this.status = status;
    this.payload = payload;
  }
}

type RequestOptions = {
  path: Record<string, string>;
  query: Query;
  body?: unknown;
};

export class VectorMint {
  private readonly apiKey: string;
  private readonly authMode: AuthMode;
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof globalThis.fetch;

  constructor(config: VectorMintConfig) {
    if (!config?.apiKey || typeof config.apiKey !== 'string') throw new TypeError('apiKey is required');
    if (config.authMode && config.authMode !== 'bearer' && config.authMode !== 'x-api-key') {
      throw new TypeError('authMode must be bearer or x-api-key');
    }
    this.apiKey = config.apiKey;
    this.authMode = config.authMode ?? 'bearer';
    this.baseUrl = (config.baseUrl ?? 'https://api.vectormint.app/v1').replace(/\/+$/, '');
    const candidate = config.fetch ?? globalThis.fetch;
    if (typeof candidate !== 'function') throw new Error('A fetch implementation is required');
    this.fetchImpl = candidate.bind(globalThis);
  }

  private async request<T>(method: string, route: string, options: RequestOptions): Promise<T> {
    let rendered = route;
    for (const [name, value] of Object.entries(options.path)) {
      rendered = rendered.replace('{' + name + '}', encodeURIComponent(String(value)));
    }
    const url = new URL(this.baseUrl + rendered);
    for (const [name, value] of Object.entries(options.query)) {
      if (value === undefined || value === null) continue;
      const values = Array.isArray(value) ? value : [value];
      for (const item of values) url.searchParams.append(name, String(item));
    }

    const headers = new Headers({ Accept: 'application/json', 'User-Agent': 'vectormint-typescript/1.8.0' });
    if (this.authMode === 'x-api-key') headers.set('x-api-key', this.apiKey);
    else headers.set('Authorization', 'Bearer ' + this.apiKey);

    let body: string | undefined;
    if (options.body !== undefined) {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(options.body);
    }

    const response = await this.fetchImpl(url, { method, headers, body });
    const text = await response.text();
    let payload: unknown = null;
    if (text) {
      try { payload = JSON.parse(text); }
      catch { payload = text; }
    }
    if (!response.ok) throw new VectorMintError(response.status, payload);
    return payload as T;
  }

  async getApplicationRules<T = ApiEnvelope>(query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/application-rules", { path: {}, query, body: undefined });
  }

  async listCards<T = ApiEnvelope>(query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/cards", { path: {}, query, body: undefined });
  }

  async batchCards<T = ApiEnvelope>(body: unknown, query: Query = {}): Promise<T> {
    return this.request<T>("POST", "/cards/batch", { path: {}, query, body: body });
  }

  async compareCards<T = ApiEnvelope>(body: unknown, query: Query = {}): Promise<T> {
    return this.request<T>("POST", "/cards/compare", { path: {}, query, body: body });
  }

  async searchCards<T = ApiEnvelope>(query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/cards/search", { path: {}, query, body: undefined });
  }

  async getCard<T = ApiEnvelope>(id: string, query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/cards/{id}", { path: { "id": id }, query, body: undefined });
  }

  async getCardsIdAssets<T = ApiEnvelope>(id: string, query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/cards/{id}/assets", { path: { "id": id }, query, body: undefined });
  }

  async getCardBenefits<T = ApiEnvelope>(id: string, query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/cards/{id}/benefits", { path: { "id": id }, query, body: undefined });
  }

  async getCardCredits<T = ApiEnvelope>(id: string, query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/cards/{id}/credits", { path: { "id": id }, query, body: undefined });
  }

  async getCardFees<T = ApiEnvelope>(id: string, query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/cards/{id}/fees", { path: { "id": id }, query, body: undefined });
  }

  async getCardFreshness<T = ApiEnvelope>(id: string, query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/cards/{id}/freshness", { path: { "id": id }, query, body: undefined });
  }

  async getCardHistory<T = ApiEnvelope>(id: string, query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/cards/{id}/history", { path: { "id": id }, query, body: undefined });
  }

  async getCardOffers<T = ApiEnvelope>(id: string, query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/cards/{id}/offers", { path: { "id": id }, query, body: undefined });
  }

  async getCardPricing<T = ApiEnvelope>(id: string, query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/cards/{id}/pricing", { path: { "id": id }, query, body: undefined });
  }

  async getCardProvenance<T = ApiEnvelope>(id: string, query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/cards/{id}/provenance", { path: { "id": id }, query, body: undefined });
  }

  async getCardRewards<T = ApiEnvelope>(id: string, query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/cards/{id}/rewards", { path: { "id": id }, query, body: undefined });
  }

  async getCardsIdSnapshot<T = ApiEnvelope>(id: string, query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/cards/{id}/snapshot", { path: { "id": id }, query, body: undefined });
  }

  async getCatalogCoverage<T = ApiEnvelope>(query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/catalog/coverage", { path: {}, query, body: undefined });
  }

  async getCatalogExport<T = ApiEnvelope>(query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/catalog/export", { path: {}, query, body: undefined });
  }

  async getCatalogSnapshot<T = ApiEnvelope>(query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/catalog/snapshot", { path: {}, query, body: undefined });
  }

  async getCatalogSync<T = ApiEnvelope>(query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/catalog/sync", { path: {}, query, body: undefined });
  }

  async getCatalogVersions<T = ApiEnvelope>(query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/catalog/versions", { path: {}, query, body: undefined });
  }

  async getCategories<T = ApiEnvelope>(query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/categories", { path: {}, query, body: undefined });
  }

  async listChanges<T = ApiEnvelope>(query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/changes", { path: {}, query, body: undefined });
  }

  async listNotableChanges<T = ApiEnvelope>(query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/changes/notable", { path: {}, query, body: undefined });
  }

  async evaluateTransaction<T = ApiEnvelope>(body: unknown, query: Query = {}): Promise<T> {
    return this.request<T>("POST", "/evaluate", { path: {}, query, body: body });
  }

  async getIssuers<T = ApiEnvelope>(query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/issuers", { path: {}, query, body: undefined });
  }

  async getOffersNotable<T = ApiEnvelope>(query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/offers/notable", { path: {}, query, body: undefined });
  }

  async optimizeWallet<T = ApiEnvelope>(body: unknown, query: Query = {}): Promise<T> {
    return this.request<T>("POST", "/optimize", { path: {}, query, body: body });
  }

  async getProductChangePaths<T = ApiEnvelope>(query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/product-change-paths", { path: {}, query, body: undefined });
  }

  async getRewardCurrencies<T = ApiEnvelope>(query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/reward-currencies", { path: {}, query, body: undefined });
  }

  async listTransferPartners<T = ApiEnvelope>(query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/transfer-partners", { path: {}, query, body: undefined });
  }

  async listWebhooks<T = ApiEnvelope>(query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/webhooks", { path: {}, query, body: undefined });
  }

  async createWebhook<T = ApiEnvelope>(body: unknown, query: Query = {}): Promise<T> {
    return this.request<T>("POST", "/webhooks", { path: {}, query, body: body });
  }

  async getWebhook<T = ApiEnvelope>(id: string, query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/webhooks/{id}", { path: { "id": id }, query, body: undefined });
  }

  async updateWebhook<T = ApiEnvelope>(id: string, body: unknown, query: Query = {}): Promise<T> {
    return this.request<T>("PATCH", "/webhooks/{id}", { path: { "id": id }, query, body: body });
  }

  async deleteWebhook<T = ApiEnvelope>(id: string, query: Query = {}): Promise<T> {
    return this.request<T>("DELETE", "/webhooks/{id}", { path: { "id": id }, query, body: undefined });
  }

  async listWebhookDeliveries<T = ApiEnvelope>(id: string, query: Query = {}): Promise<T> {
    return this.request<T>("GET", "/webhooks/{id}/deliveries", { path: { "id": id }, query, body: undefined });
  }

  async testWebhook<T = ApiEnvelope>(id: string, query: Query = {}): Promise<T> {
    return this.request<T>("POST", "/webhooks/{id}/test", { path: { "id": id }, query, body: undefined });
  }
}
