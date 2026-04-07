# SmartShop Recommendation Engine (Current Implementation)

## Overview

SmartShop uses a multi-strategy recommendation system implemented in:

- `backend/utils/recommendation.js`
- `backend/routes/recommendationRoutes.js`

The API supports five algorithm modes:

- `ml`
- `content`
- `collaborative`
- `popular`
- `hybrid`

All recommendation responses are normalized to include safe image, rating, and review fields.

---

## Route Layer Behavior (`recommendationRoutes.js`)

### Timing Middleware

`req.startTime` is attached at router start, so every response includes measurable `responseTime`.

### Limit Validation

`limit` is parsed and clamped:

- invalid or missing -> `8`
- min -> `1`
- max -> `50`

### Output Normalization

Each product recommendation is formatted to guarantee:

- `image_urls`: always non-empty array
  - uses `image_urls` if valid
  - fallback to `[image_url]`
  - final fallback to `['/placeholder.jpg']`
- `rating`: numeric, default `0`
- `reviewCount`: integer, default `0`

### Collaborative Fallback Metadata

For `GET /api/recommendations/product/:productId?algorithm=collaborative`:

- if user is logged in: collaborative is used
- if user is not logged in: falls back to content-based, with:
  - `algorithm_used: "content (fallback)"`

For `GET /api/recommendations/user/personalized`:

- route is protected (`protect`)
- returns metadata:
  - `fallback` (boolean)
  - `fallback_reason` (`no_purchases`, `no_similar_users`, `error`)
  - `algorithm_used` (`collaborative` or `popularity`)

---

## Algorithm Implementations (`recommendation.js`)

## 1) Content-Based (`getRelatedProducts(productId, limit)`)

### Data source

- target product from `products`
- recommendation candidates from `products` + `reviews`

### Scoring logic

`similarity_score`:

- +3 if same category
- +2 if price is within 30% range of target product

Products are sorted by:

1. `similarity_score DESC`
2. `created_at DESC`

### Safety/Fallback

- excludes target product
- only `stock_quantity > 0`
- if target product not found/error -> fallback to popular

### Rating/review support

Query includes:

- `COALESCE(AVG(r.rating), 0) AS rating`
- `COUNT(r.id) AS reviewCount`

---

## 2) Collaborative Filtering (`getUserRecommendations(userId, limit, returnMetadata)`)

### Steps

1. Fetch user purchased product IDs from `order_items` + `orders`.
2. Find similar users who bought those products.
3. Recommend products bought by similar users but not by current user.
4. Rank by `purchase_count DESC`, then `created_at DESC`.

### SQL array binding fix

Dynamic placeholders are used for `IN (...)` clauses:

- purchase IDs placeholder string from array length
- user IDs placeholder string from array length

This avoids unreliable direct array binding patterns.

### Fallback paths

- no purchases -> popular (`fallbackReason: no_purchases`)
- no similar users -> popular (`fallbackReason: no_similar_users`)
- any error -> popular (`fallbackReason: error`)

When `returnMetadata=true`, returns:

```json
{
  "recommendations": [],
  "fallback": true,
  "fallbackReason": "no_purchases",
  "algorithm_used": "popularity"
}
```

---

## 3) Popularity-Based (`getPopularProducts(limit)`)

### Score formula

`popularity_score`:

- `(purchase_count * 2)`
- `+3` if featured
- `+2` if new

Sorted by:

1. `popularity_score DESC`
2. `created_at DESC`

Includes rating and review count via `LEFT JOIN reviews`.

---

## 4) ML Similarity (`getMLRecommendations(productId, limit)`)

### Cache

In-memory cache (`mlCache`) stores the full product feature dataset:

- cache key model: single shared dataset
- TTL: 5 minutes
- methods:
  - auto reuse if fresh
  - `RecommendationEngine.invalidateCache()` for invalidation on product changes

### Feature vector dimensions

Each product vector includes:

1. category one-hot encoding
2. normalized price
3. featured flag
4. new flag
5. normalized stock quantity
6. normalized discount percentage
7. product age factor (newer weighted higher)
8. price tier (budget/mid/premium)

### Similarity

Cosine similarity between target vector and candidate vectors.

Post-processing:

- filter `similarity > 0.1`
- sort descending similarity
- add `confidence = round(similarity * 100)`

### Fallbacks

- target not found -> popular
- target vector missing -> content
- no good ML matches -> content
- errors -> content

---

## 5) Hybrid (`getHybridRecommendations(productId, userId, limit)`)

Runs and merges:

- ML recommendations
- content-based recommendations
- popular recommendations

Then:

- deduplicates by product ID
- excludes current product ID
- preserves first-seen ranking priority
- truncates to `limit`

Fallback on errors -> popular

---

## API Endpoints

## Product-scoped recommendations

`GET /api/recommendations/product/:productId`

Query params:

- `algorithm`: `ml | content | collaborative | popular | hybrid` (default: `ml`)
- `limit`: clamped to 1..50 (default: 8)

Returns:

- `algorithm` (requested)
- `algorithm_used` (actual used, includes fallback annotation)
- `recommendations`
- `count`
- `performance.responseTime`

## Personalized recommendations

`GET /api/recommendations/user/personalized` (auth required)

Returns:

- `algorithm: collaborative`
- `algorithm_used`
- `fallback`
- `fallback_reason`
- normalized recommendations

## Popular recommendations

`GET /api/recommendations/popular`

## Hybrid recommendations

`GET /api/recommendations/hybrid/:productId`

## Health check

`GET /api/recommendations/health`

---

## Notes for Frontend Integration

- Always read `algorithm_used` instead of assuming requested algorithm succeeded.
- For collaborative requests, show fallback message when:
  - `algorithm_used !== 'collaborative'` or `fallback === true`
- Product cards can rely on:
  - `image_urls[0]` always existing
  - numeric `rating`
  - integer `reviewCount`

---

## Current Status Summary

The recommendation engine is production-ready for current scope with:

- robust input clamping
- strong output normalization
- dynamic SQL placeholder safety for collaborative filtering
- cache-backed ML feature loading (5-minute TTL)
- explicit fallback metadata for better UX/debugging
