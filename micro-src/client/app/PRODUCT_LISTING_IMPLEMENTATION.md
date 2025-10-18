# Product Listing Feature - Implementation Guide

## Overview

This document describes the implementation of the product listing feature with pagination, search, filtering, and caching capabilities following Clean Architecture principles.

## Architecture

The implementation follows a layered architecture pattern:

```
┌─────────────────────────────────────────┐
│     Presentation Layer (Svelte)         │
│  - ProductCard, ProductGrid, Filters    │
│  - Pagination, SkeletonLoader           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     Application Layer (TypeScript)      │
│  - ProductQueryUseCase                  │
│  - productStore, filterStore            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     Domain Layer (TypeScript)           │
│  - Product Entity, ProductFilters DTO   │
│  - IProductRepository interface         │
│  - Validation Schemas (Zod)             │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     Infrastructure Layer (TypeScript)   │
│  - ProductRepository                    │
│  - CacheManager (stale-while-revalidate)│
│  - API Client (axios with retry)        │
└─────────────────────────────────────────┘
```

## Key Features

### 1. Clean Architecture
- **Domain Layer**: Contains business entities and rules
- **Application Layer**: Orchestrates business logic
- **Infrastructure Layer**: Implements external concerns (API, caching)
- **Presentation Layer**: UI components

### 2. Caching Strategy (Stale-While-Revalidate)
```typescript
// Cache configuration
{
  staleTime: 5 * 60 * 1000,  // 5 minutes - data is fresh
  cacheTime: 10 * 60 * 1000  // 10 minutes - data is cached
}
```

**How it works:**
1. First request: Fetch from API, cache result
2. Within 5 min: Return cached data immediately
3. 5-10 min: Return cached data, fetch fresh data in background
4. After 10 min: Fetch fresh data, cache expires

### 3. Debounced Search
```typescript
const debouncedSearch = debounce((value: string) => {
  search = value;
  emitFilterChange();
}, 300); // Wait 300ms after user stops typing
```

### 4. Client-Side Filtering & Sorting
- **Search**: Filters by product name and description
- **Price Range**: Min/max price filtering
- **Sort Options**: 
  - Name (A-Z, Z-A)
  - Price (Low-High, High-Low)
  - Stock Availability
  - Rating (placeholder for future)

### 5. Pagination
- Configurable page size (10, 20, 50 items)
- Page navigation with ellipsis for large page counts
- URL query parameter synchronization

### 6. Performance Optimizations
- **Code Splitting**: Automatic via SvelteKit routes
- **Lazy Loading**: Images load only when visible
- **Skeleton Loaders**: Perceived performance during loading
- **Bundle Size**: ~276KB uncompressed (~90KB gzipped)

## File Structure

```
src/
├── lib/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── Product.ts              # Product entity & DTOs
│   │   ├── interfaces/
│   │   │   └── IProductRepository.ts   # Repository interface
│   │   └── validation/
│   │       ├── productFilterSchema.ts  # Zod validation schemas
│   │       └── productFilterSchema.test.ts
│   │
│   ├── application/
│   │   ├── usecases/
│   │   │   ├── ProductQueryUseCase.ts  # Product query logic
│   │   │   └── ProductQueryUseCase.test.ts
│   │   └── stores/
│   │       └── productStore.ts         # Svelte stores
│   │
│   ├── infrastructure/
│   │   ├── api/
│   │   │   └── apiClient.ts            # HTTP client with retry
│   │   ├── cache/
│   │   │   ├── cacheManager.ts         # Cache implementation
│   │   │   └── cacheManager.test.ts
│   │   └── repositories/
│   │       └── ProductRepository.ts    # Repository implementation
│   │
│   ├── presentation/
│   │   └── components/
│   │       ├── products/
│   │       │   ├── ProductCard.svelte
│   │       │   ├── ProductGrid.svelte
│   │       │   └── ProductFilter.svelte
│   │       └── ui/
│   │           ├── Pagination.svelte
│   │           ├── SkeletonLoader.svelte
│   │           └── EmptyState.svelte
│   │
│   └── utils/
│       ├── debounce.ts                 # Debounce utility
│       └── formatters.ts               # Formatting utilities
│
└── routes/
    └── products/
        └── +page.svelte                # Products page
```

## Usage Examples

### Fetching Products with Filters

```typescript
import { productStore, filterStore } from '$lib/application/stores/productStore';

// Set filters
filterStore.setSearch('laptop');
filterStore.setPriceRange(100, 1000);
filterStore.setSortBy('price_asc');

// Fetch products
await productStore.fetchProducts(
  {
    search: 'laptop',
    minPrice: 100,
    maxPrice: 1000,
    sortBy: 'price_asc'
  },
  1,  // page
  20  // pageSize
);
```

### Using the Cache Manager

```typescript
import { cacheManager } from '$lib/infrastructure/cache/cacheManager';

// Set data in cache
cacheManager.set('products:list', products, {
  staleTime: 5 * 60 * 1000,
  cacheTime: 10 * 60 * 1000
});

// Get from cache
const cachedProducts = cacheManager.get<Product[]>('products:list');

// Check if stale
if (cacheManager.isStale('products:list')) {
  // Fetch fresh data in background
}

// Invalidate cache
cacheManager.invalidate('products:list');
cacheManager.invalidatePattern(/^products:/);
```

### Debouncing User Input

```typescript
import { debounce } from '$lib/utils/debounce';

const debouncedSearch = debounce((searchTerm: string) => {
  // This will only execute 300ms after user stops typing
  performSearch(searchTerm);
}, 300);

// In your input handler
function handleInput(event) {
  debouncedSearch(event.target.value);
}
```

## API Integration

### Product Service Endpoints

**List Products**
```
GET /products?skip=0&limit=20
Response: Product[]
```

**Get Product by ID**
```
GET /products/{id}
Response: Product
```

### API Client Configuration

The API client includes:
- **Retry Logic**: 3 retries with 1s delay for network errors
- **Timeout**: 10 seconds per request
- **Error Handling**: Categorized errors (validation, network, server)
- **Auth Token**: Automatic injection from localStorage

## Testing

### Test Coverage

```
Test Files: 7 passed
Tests: 92 passed
- ProductQueryUseCase: 13 tests
- productFilterSchema: 14 tests  
- cacheManager: 8 tests
- (Plus 57 existing tests)
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test -- --coverage
```

## Performance Metrics

### Bundle Size Analysis
```
Total JS: ~276KB uncompressed
Estimated gzipped: ~90KB
Main chunks:
- chunks/60LHu_9O.js: 91.82 KB (27.08 KB gzipped)
- chunks/BR6fd_an.js: 33.86 KB (13.07 KB gzipped)
- chunks/BnXqGItS.js: 31.23 KB (12.13 KB gzipped)
```

### Optimization Techniques Applied
1. **Code Splitting**: Routes automatically split
2. **Tree Shaking**: Unused code removed
3. **Lazy Loading**: Images and components
4. **Caching**: Reduce API calls
5. **Debouncing**: Reduce search requests

## Accessibility Features

### Semantic HTML
- `<article>` for product cards
- `<nav>` for pagination
- `<label>` for form inputs

### ARIA Attributes
- `aria-label` on buttons and links
- `aria-current="page"` on active page
- `role="alert"` for error messages

### Keyboard Navigation
- All interactive elements focusable
- Visible focus indicators
- Tab order follows visual layout

## Mobile Responsiveness

### Breakpoints
```css
/* Mobile: 1 column */
@media (max-width: 640px) {
  grid-template-columns: 1fr;
}

/* Tablet: 2-3 columns */
@media (min-width: 641px) and (max-width: 1024px) {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

/* Desktop: 4 columns */
@media (min-width: 1025px) {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}
```

## Future Enhancements

1. **Server-Side Filtering**: Move filtering logic to backend
2. **Infinite Scroll**: Alternative to pagination
3. **Product Rating**: Sort by rating when available
4. **Image Optimization**: WebP format, responsive images
5. **Virtual Scrolling**: For large product lists
6. **Wishlist Integration**: Save favorite products
7. **Advanced Filters**: Category, brand, tags
8. **Price History**: Show price trends

## Known Limitations

1. **Backend Dependency**: Currently uses mock pagination (fetches more items and filters client-side)
2. **No Image Upload**: Products use placeholder images
3. **No Product Reviews**: Rating sort is placeholder
4. **Limited Cache Invalidation**: Manual invalidation on mutations

## Troubleshooting

### Products Not Loading
```typescript
// Check API connection
console.log(import.meta.env.VITE_PRODUCT_SERVICE_URL);

// Verify backend is running
curl http://localhost:8002/products

// Check browser console for errors
```

### Cache Not Working
```typescript
// Clear cache manually
import { cacheManager } from '$lib/infrastructure/cache/cacheManager';
cacheManager.clear();

// Check cache entries
console.log(cacheManager.get('products:list:0:20'));
```

### Search Not Debouncing
```typescript
// Verify debounce is imported correctly
import { debounce } from '$lib/utils/debounce';

// Check delay value (should be 300ms)
const debouncedFn = debounce(fn, 300);
```

## Contributing

When adding new features:

1. Follow Clean Architecture principles
2. Add unit tests (target >85% coverage)
3. Update TypeScript types
4. Add accessibility features
5. Test on mobile devices
6. Update this documentation

## References

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Stale-While-Revalidate](https://web.dev/stale-while-revalidate/)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
