# VectorMint TypeScript SDK

Official TypeScript SDK for the VectorMint REST API. The client is generated from VectorMint's canonical OpenAPI contract, is MIT licensed, and contains no license or tier gating. API quotas and endpoint entitlements are enforced server-side.

## Install

```bash
npm install github:vectormint/vectormint-sdk-typescript
```

**npm registry publication is still pending.** Until `@vectormint/sdk` is published to npm, install directly from this GitHub repository using the command above.

## 5-line quickstart

```ts
import { VectorMint } from '@vectormint/sdk';
const vm = new VectorMint({ apiKey: process.env.VECTORMINT_API_KEY! });
const result = await vm.searchCards({ q: 'chase', limit: 5 });
console.log(result.data);
// Use authMode: 'x-api-key' if you prefer the x-api-key header.
```

## Coverage

The generated client covers card list/search/get/batch/compare; offers, rewards, credits, fees, benefits, pricing, provenance, freshness, assets and history/snapshots; catalog sync/export/coverage; evaluate and optimize; issuers, categories, reward currencies, transfer partners, application rules, product-change paths, notable offers and changes; and webhook CRUD, deliveries and test calls.

## Regeneration

```bash
npm run generate
```

Generation reads `https://api.vectormint.app/v1/openapi.json`. CI regenerates on every push and pull request and fails if `src/index.ts` drifts from the OpenAPI contract.

## License

MIT © 2026 VectorMint
