# 🎨 E-Commerce Microservices - Svelte Frontend Client# 📱 Client - Frontend Application (Coming Soon)



<div align="center">## 🎯 Overview



![Svelte](https://img.shields.io/badge/Svelte-5.5-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)This directory will contain the **Svelte frontend application** for the E-commerce Microservices Platform.

![SvelteKit](https://img.shields.io/badge/SvelteKit-2.0-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)

![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)## 🚧 Status: **Planned for Implementation**

![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)The client application will provide:



**Modern, Production-Ready E-Commerce Frontend**- ✅ Modern, responsive user interface

- ✅ Product browsing and search

[Features](#-features) • [Tech Stack](#-technology-stack) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Architecture](#-architecture)- ✅ Shopping cart functionality

- ✅ User authentication and registration

</div>- ✅ Order management

- ✅ Real-time notifications

---

## 🛠️ Technology Stack (Planned)

## 📋 Table of Contents

- **Framework**: Svelte/SvelteKit

- [Overview](#-overview)- **Styling**: TailwindCSS

- [Features](#-features)- **State Management**: Svelte stores

- [Technology Stack](#-technology-stack)- **API Communication**: Fetch API / Axios

- [Prerequisites](#-prerequisites)- **Build Tool**: Vite

- [Quick Start](#-quick-start)- **Package Manager**: npm/pnpm

- [Project Structure](#-project-structure)

- [Architecture](#-architecture)## 📁 Planned Structure

- [API Integration](#-api-integration)

- [State Management](#-state-management)```

- [Routing](#-routing)client/

- [Styling](#-styling)├── src/

- [Testing](#-testing)│   ├── lib/

- [Performance](#-performance)│   │   ├── api/           # API client modules

- [Security](#-security)│   │   │   ├── auth.ts

- [Deployment](#-deployment)│   │   │   ├── products.ts

- [Contributing](#-contributing)│   │   │   └── orders.ts

- [Troubleshooting](#-troubleshooting)│   │   ├── stores/        # Svelte stores

│   │   │   ├── auth.ts

---│   │   │   ├── cart.ts

│   │   │   └── products.ts

## 🎯 Overview│   │   ├── components/    # Reusable components

│   │   └── utils/

This is a **modern, production-ready Svelte frontend application** built with SvelteKit 2.0 and TailwindCSS 3.4, designed to integrate seamlessly with Python microservices backend. The application provides a complete e-commerce experience with authentication, product management, shopping cart, and order processing.│   ├── routes/            # SvelteKit routes

│   │   ├── +page.svelte

### Key Highlights│   │   ├── login/

│   │   ├── products/

- ⚡ **Blazing Fast**: Svelte's compile-time optimization and Vite's HMR│   │   └── orders/

- 🎨 **Modern UI**: TailwindCSS 3.4 with custom design system│   └── app.html

- 📱 **Responsive**: Mobile-first design, works on all devices├── static/

- 🔐 **Secure**: JWT authentication, XSS protection, CSRF tokens├── svelte.config.js

- ♿ **Accessible**: WCAG 2.1 AA compliant├── vite.config.js

- 🌐 **i18n Ready**: Multi-language support structure└── package.json

- 🎭 **Type-Safe**: Full TypeScript coverage```

- 🧪 **Tested**: Unit, integration, and E2E tests

- 📊 **Observable**: Analytics, error tracking, performance monitoring## 🔗 API Integration



---The client will communicate with the backend microservices:



## ✨ Features- **User Service**: `http://localhost:8001` - Authentication

- **Product Service**: `http://localhost:8002` - Product catalog

### User Features- **Order Service**: `http://localhost:8003` - Order management



#### 🔐 Authentication & Authorization## 🚀 Quick Start (When Implemented)

- User registration with email verification

- Login with JWT token management```bash

- Password reset functionality# Install dependencies

- Social login integration (Google, GitHub)npm install

- Remember me functionality

- Session management with auto-renewal# Run development server

npm run dev

#### 🛍️ Product Catalog

- Product listing with pagination# Build for production

- Advanced search with filters (category, price, rating)npm run build

- Product details with image gallery

- Product reviews and ratings# Preview production build

- Related products recommendationsnpm run preview

- Wishlist management```

- Product comparison

## 📝 Features Roadmap

#### 🛒 Shopping Cart

- Add/remove/update cart items### Phase 1: Basic Setup

- Real-time price calculation- [ ] Initialize SvelteKit project

- Persistent cart (localStorage + backend sync)- [ ] Setup TailwindCSS

- Cart preview in header- [ ] Configure API client

- Quantity validation- [ ] Implement authentication stores

- Stock availability checks

### Phase 2: Core Features

#### 📦 Order Management- [ ] User registration and login

- Checkout process with validation- [ ] Product listing and details

- Multiple shipping addresses- [ ] Shopping cart

- Order history and tracking- [ ] Checkout process

- Order details and invoices

- Reorder functionality### Phase 3: Advanced Features

- Order status updates (real-time via WebSocket)- [ ] Real-time notifications (WebSocket)

- [ ] Order history

#### 👤 User Profile- [ ] User profile management

- Profile information management- [ ] Product search and filters

- Avatar upload with image optimization

- Address book management### Phase 4: Polish

- Order history- [ ] Responsive design

- Notification preferences- [ ] Loading states and error handling

- Account settings- [ ] Animations and transitions

- [ ] SEO optimization

#### 🔔 Real-Time Notifications

- Order status updates## 🔐 Authentication Flow

- WebSocket integration

- Toast notifications```typescript

- Push notifications (PWA)// Example authentication flow (planned)

- Email notificationsimport { authStore } from '$lib/stores/auth';

import { userApi } from '$lib/api/client';

### Developer Features

// Login

#### 🛠️ Development Experienceconst token = await userApi.auth.login(username, password);

- Hot Module Replacement (HMR)authStore.setToken(token);

- TypeScript with strict mode

- ESLint + Prettier configuration// Make authenticated requests

- Pre-commit hooks (Husky)const products = await productApi.products.list();

- VS Code recommended extensions```

- Debug configurations

## 📚 Documentation

#### 🧪 Testing

- Vitest for unit testsSee the main [README.md](../README.md) for:

- Playwright for E2E tests- Architecture overview

- Testing Library for component tests- API documentation

- Mock Service Worker (MSW) for API mocking- Backend service details

- Code coverage reports- Deployment guide



#### 📊 Monitoring & Analytics## 👥 Contributing

- Error tracking (Sentry integration ready)

- Performance monitoringWhen implementing the client:

- User analytics (privacy-focused)

- Custom event tracking1. Follow Svelte best practices

- A/B testing framework2. Use TypeScript for type safety

3. Implement proper error handling

---4. Write component tests

5. Maintain responsive design

## 🚀 Technology Stack6. Follow accessibility guidelines



### Core Framework---

- **[Svelte 5.5](https://svelte.dev/)** - Cybernetically enhanced web apps (Latest with Runes API)

- **[SvelteKit 2.0](https://kit.svelte.dev/)** - Full-stack framework for Svelte**Note**: This is a placeholder for future development. The backend microservices are fully functional and ready for frontend integration.

- **[TypeScript 5.6](https://www.typescriptlang.org/)** - Typed JavaScript at scale

- **[Vite 5.4](https://vitejs.dev/)** - Next generation frontend toolingFor immediate testing, use:

- Swagger UI: `http://localhost:8001/docs` (User Service)

### UI & Styling- Swagger UI: `http://localhost:8002/docs` (Product Service)

- **[TailwindCSS 3.4](https://tailwindcss.com/)** - Utility-first CSS framework- Swagger UI: `http://localhost:8003/docs` (Order Service)

- **[Tailwind Merge](https://github.com/dcastil/tailwind-merge)** - Merge Tailwind classes without conflicts- Postman Collection: `../deployment/postman_collection.json`

- **[clsx](https://github.com/lukeed/clsx)** - Construct className strings conditionally
- **[Lucide Svelte](https://lucide.dev/)** - Beautiful & consistent icons
- **[Svelte Headless UI](https://svelte-headlessui.goss.io/)** - Unstyled, accessible components

### State Management
- **[Svelte Stores](https://svelte.dev/docs#run-time-svelte-store)** - Built-in reactive stores
- **[TanStack Query (Svelte Query)](https://tanstack.com/query/latest)** - Powerful data synchronization
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

### API & Data Fetching
- **[Axios](https://axios-http.com/)** - Promise-based HTTP client
- **[Socket.io Client](https://socket.io/)** - Real-time WebSocket communication
- **[TanStack Query](https://tanstack.com/query/latest)** - Server state management

### Forms & Validation
- **[Superforms](https://superforms.rocks/)** - SvelteKit form library
- **[Zod](https://zod.dev/)** - Schema validation
- **[Valibot](https://valibot.dev/)** - Alternative validation library

### Testing
- **[Vitest](https://vitest.dev/)** - Vite-native unit test framework
- **[Playwright](https://playwright.dev/)** - Reliable E2E testing
- **[Testing Library (Svelte)](https://testing-library.com/svelte)** - Component testing
- **[MSW](https://mswjs.io/)** - API mocking

### Development Tools
- **[ESLint](https://eslint.org/)** - Linting utility
- **[Prettier](https://prettier.io/)** - Code formatter
- **[Husky](https://typicode.github.io/husky/)** - Git hooks
- **[lint-staged](https://github.com/okonet/lint-staged)** - Run linters on staged files
- **[Commitlint](https://commitlint.js.org/)** - Lint commit messages

### Build & Deployment
- **[Vite](https://vitejs.dev/)** - Build tool
- **[vite-plugin-pwa](https://vite-pwa-org.netlify.app/)** - PWA support
- **[Docker](https://www.docker.com/)** - Containerization
- **[Nginx](https://nginx.org/)** - Production web server

---

## 📋 Prerequisites

### Required
- **Node.js** >= 20.x (LTS recommended)
- **npm** >= 10.x or **pnpm** >= 8.x (recommended)
- **Git** >= 2.40

### Recommended
- **VS Code** with extensions:
  - Svelte for VS Code
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier
  - TypeScript Vue Plugin (Volar)

### Backend Services
Make sure the Python microservices are running:
```bash
# From micro-src directory
docker compose up -d
```

Services should be available at:
- User Service: http://localhost:8001
- Product Service: http://localhost:8002
- Order Service: http://localhost:8003

---

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository (if not already done)
cd micro-src/client

# Install dependencies (using pnpm - recommended)
pnpm install

# Or using npm
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
nano .env.local
```

**.env.local** example:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost
VITE_USER_SERVICE_URL=http://localhost:8001
VITE_PRODUCT_SERVICE_URL=http://localhost:8002
VITE_ORDER_SERVICE_URL=http://localhost:8003

# WebSocket Configuration
VITE_WS_URL=ws://localhost:8004

# Application Configuration
VITE_APP_NAME=E-Commerce Platform
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=true
VITE_ENABLE_WEBSOCKET=true

# Pagination
VITE_DEFAULT_PAGE_SIZE=20
VITE_MAX_PAGE_SIZE=100

# Authentication
VITE_TOKEN_STORAGE_KEY=auth_token
VITE_TOKEN_REFRESH_BEFORE=300000

# File Upload
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
```

### 3. Development Server

```bash
# Start development server
pnpm dev

# Or with npm
npm run dev

# Server will start at http://localhost:5173
```

### 4. Build for Production

```bash
# Build production bundle
pnpm build

# Preview production build
pnpm preview

# Or with npm
npm run build
npm run preview
```

### 5. Docker Deployment

```bash
# Build Docker image
docker build -t ecommerce-client:latest .

# Run container
docker run -p 3000:80 ecommerce-client:latest

# Or use docker compose
docker compose up client
```

---

## 📁 Project Structure

```
client/
├── .husky/                      # Git hooks
├── .vscode/                     # VS Code configuration
│   ├── extensions.json
│   ├── settings.json
│   └── launch.json
├── public/                      # Static assets
│   ├── favicon.ico
│   ├── robots.txt
│   └── manifest.json
├── src/
│   ├── lib/                     # Library code
│   │   ├── api/                 # API clients
│   │   │   ├── client.ts        # Base HTTP client
│   │   │   ├── auth.api.ts      # Authentication API
│   │   │   ├── product.api.ts   # Product API
│   │   │   ├── order.api.ts     # Order API
│   │   │   └── index.ts
│   │   ├── stores/              # Svelte stores
│   │   │   ├── auth.store.ts    # Authentication state
│   │   │   ├── cart.store.ts    # Shopping cart state
│   │   │   ├── product.store.ts # Product catalog state
│   │   │   ├── order.store.ts   # Order state
│   │   │   ├── ui.store.ts      # UI state (modals, toasts)
│   │   │   └── index.ts
│   │   ├── components/          # Reusable components
│   │   │   ├── ui/              # Base UI components
│   │   │   │   ├── Button.svelte
│   │   │   │   ├── Input.svelte
│   │   │   │   ├── Card.svelte
│   │   │   │   ├── Modal.svelte
│   │   │   │   ├── Toast.svelte
│   │   │   │   ├── Spinner.svelte
│   │   │   │   └── ...
│   │   │   ├── layout/          # Layout components
│   │   │   │   ├── Header.svelte
│   │   │   │   ├── Footer.svelte
│   │   │   │   ├── Sidebar.svelte
│   │   │   │   └── Navigation.svelte
│   │   │   ├── auth/            # Authentication components
│   │   │   │   ├── LoginForm.svelte
│   │   │   │   ├── RegisterForm.svelte
│   │   │   │   └── ProtectedRoute.svelte
│   │   │   ├── product/         # Product components
│   │   │   │   ├── ProductCard.svelte
│   │   │   │   ├── ProductList.svelte
│   │   │   │   ├── ProductDetail.svelte
│   │   │   │   ├── ProductFilter.svelte
│   │   │   │   └── ProductSearch.svelte
│   │   │   ├── cart/            # Cart components
│   │   │   │   ├── CartItem.svelte
│   │   │   │   ├── CartSummary.svelte
│   │   │   │   └── CartDrawer.svelte
│   │   │   └── order/           # Order components
│   │   │       ├── OrderList.svelte
│   │   │       ├── OrderDetail.svelte
│   │   │       └── OrderStatus.svelte
│   │   ├── utils/               # Utility functions
│   │   │   ├── validation.ts    # Validation helpers
│   │   │   ├── formatting.ts    # Format helpers
│   │   │   ├── storage.ts       # LocalStorage helpers
│   │   │   ├── token.ts         # JWT token helpers
│   │   │   ├── error.ts         # Error handling
│   │   │   └── constants.ts     # App constants
│   │   ├── types/               # TypeScript types
│   │   │   ├── user.types.ts
│   │   │   ├── product.types.ts
│   │   │   ├── order.types.ts
│   │   │   ├── api.types.ts
│   │   │   └── index.ts
│   │   ├── schemas/             # Zod validation schemas
│   │   │   ├── auth.schema.ts
│   │   │   ├── product.schema.ts
│   │   │   └── order.schema.ts
│   │   └── config/              # App configuration
│   │       ├── env.ts           # Environment variables
│   │       └── constants.ts     # Constants
│   ├── routes/                  # SvelteKit routes (file-based routing)
│   │   ├── +layout.svelte       # Root layout
│   │   ├── +layout.ts           # Root layout load
│   │   ├── +page.svelte         # Home page
│   │   ├── +page.ts             # Home page load
│   │   ├── +error.svelte        # Error page
│   │   ├── auth/                # Auth routes
│   │   │   ├── login/
│   │   │   │   ├── +page.svelte
│   │   │   │   └── +page.ts
│   │   │   ├── register/
│   │   │   │   ├── +page.svelte
│   │   │   │   └── +page.ts
│   │   │   └── reset-password/
│   │   │       ├── +page.svelte
│   │   │       └── +page.ts
│   │   ├── products/            # Product routes
│   │   │   ├── +page.svelte     # Product list
│   │   │   ├── +page.ts
│   │   │   └── [id]/            # Product detail
│   │   │       ├── +page.svelte
│   │   │       └── +page.ts
│   │   ├── cart/                # Cart route
│   │   │   ├── +page.svelte
│   │   │   └── +page.ts
│   │   ├── checkout/            # Checkout route
│   │   │   ├── +page.svelte
│   │   │   └── +page.server.ts  # Server-side logic
│   │   ├── orders/              # Order routes
│   │   │   ├── +page.svelte     # Order list
│   │   │   ├── +page.ts
│   │   │   └── [id]/            # Order detail
│   │   │       ├── +page.svelte
│   │   │       └── +page.ts
│   │   └── profile/             # User profile
│   │       ├── +layout.svelte
│   │       ├── +page.svelte     # Profile overview
│   │       ├── settings/
│   │       └── addresses/
│   ├── app.html                 # HTML template
│   ├── app.css                  # Global styles
│   └── hooks.server.ts          # SvelteKit server hooks
├── tests/                       # Test files
│   ├── unit/                    # Unit tests
│   │   ├── components/
│   │   ├── stores/
│   │   └── utils/
│   ├── integration/             # Integration tests
│   └── e2e/                     # E2E tests (Playwright)
│       ├── auth.spec.ts
│       ├── products.spec.ts
│       └── checkout.spec.ts
├── .env.example                 # Environment template
├── .eslintrc.cjs                # ESLint config
├── .gitignore
├── .prettierrc                  # Prettier config
├── docker-compose.yml           # Docker compose for client
├── Dockerfile                   # Multi-stage Docker build
├── nginx.conf                   # Nginx configuration
├── package.json
├── playwright.config.ts         # Playwright config
├── postcss.config.js            # PostCSS config
├── README.md                    # This file
├── REQUIREMENTS.md              # Detailed requirements
├── svelte.config.js             # SvelteKit config
├── tailwind.config.js           # TailwindCSS config
├── tsconfig.json                # TypeScript config
└── vite.config.ts               # Vite config
```

---

## 🏗️ Architecture

### Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         App Shell                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Header Component                  │   │
│  │  [Logo] [Search] [Cart] [User Menu]                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Router Outlet                      │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │         Page Component (Route)              │   │   │
│  │  │  ┌────────────────────────────────────┐    │   │   │
│  │  │  │  Feature Components                │    │   │   │
│  │  │  │  ├─ ProductList                    │    │   │   │
│  │  │  │  │  └─ ProductCard (reusable)     │    │   │   │
│  │  │  │  ├─ ProductFilter                  │    │   │   │
│  │  │  │  └─ Pagination                     │    │   │   │
│  │  │  └────────────────────────────────────┘    │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Footer Component                  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   UI Layer   │─────▶│ Store Layer  │◀────▶│  API Layer   │
│  (Components)│◀─────│  (State Mgmt)│      │ (HTTP Client)│
└──────────────┘      └──────────────┘      └──────────────┘
                             │                      │
                             │                      ▼
                             │              ┌──────────────┐
                             │              │   Backend    │
                             │              │ Microservices│
                             ▼              └──────────────┘
                      ┌──────────────┐
                      │ LocalStorage │
                      │    (Cache)   │
                      └──────────────┘
```

### State Management Strategy

1. **Local Component State**: `$state()` rune for component-specific state
2. **Shared State**: Svelte stores for cross-component state
3. **Server State**: TanStack Query for API data caching
4. **Persistent State**: LocalStorage with store synchronization

---

## 🔌 API Integration

### HTTP Client Configuration

The application uses a centralized HTTP client with:
- Request/response interceptors
- Token attachment
- Error handling
- Retry logic
- Request cancellation

Example usage:

```typescript
// lib/api/client.ts
import axios, { type AxiosInstance } from 'axios';
import { authStore } from '$lib/stores/auth.store';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor: Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = authStore.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          authStore.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config = {}) {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data: unknown, config = {}) {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  // ... other methods
}

// Create service instances
export const userApi = new ApiClient(import.meta.env.VITE_USER_SERVICE_URL);
export const productApi = new ApiClient(import.meta.env.VITE_PRODUCT_SERVICE_URL);
export const orderApi = new ApiClient(import.meta.env.VITE_ORDER_SERVICE_URL);
```

### Service Integration Patterns

See [REQUIREMENTS.md](./REQUIREMENTS.md) for detailed API integration specifications.

---

## 🗄️ State Management

### Svelte 5 Runes API

```svelte
<script lang="ts">
  import { type Product } from '$lib/types';
  
  // Reactive state with runes
  let products = $state<Product[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  
  // Derived state
  let totalItems = $derived(products.length);
  let hasProducts = $derived(products.length > 0);
  
  // Effect
  $effect(() => {
    fetchProducts();
  });
  
  async function fetchProducts() {
    try {
      loading = true;
      products = await productApi.list();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
</script>
```

### Store Patterns

```typescript
// lib/stores/cart.store.ts
import { writable, derived } from 'svelte/store';
import type { CartItem } from '$lib/types';

function createCartStore() {
  const { subscribe, set, update } = writable<CartItem[]>([]);

  return {
    subscribe,
    
    addItem: (item: CartItem) => {
      update(items => {
        const existingIndex = items.findIndex(i => i.id === item.id);
        if (existingIndex >= 0) {
          items[existingIndex].quantity += item.quantity;
          return items;
        }
        return [...items, item];
      });
    },
    
    removeItem: (id: number) => {
      update(items => items.filter(item => item.id !== id));
    },
    
    clear: () => set([]),
    
    // Load from localStorage
    init: () => {
      const saved = localStorage.getItem('cart');
      if (saved) {
        set(JSON.parse(saved));
      }
    }
  };
}

export const cartStore = createCartStore();

// Derived store for cart totals
export const cartTotals = derived(cartStore, $cart => ({
  itemCount: $cart.reduce((sum, item) => sum + item.quantity, 0),
  subtotal: $cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
}));

// Persist cart to localStorage
cartStore.subscribe(items => {
  localStorage.setItem('cart', JSON.stringify(items));
});
```

---

## 🛣️ Routing

SvelteKit uses **file-based routing**:

| Route | File | Description |
|-------|------|-------------|
| `/` | `routes/+page.svelte` | Home page |
| `/products` | `routes/products/+page.svelte` | Product list |
| `/products/[id]` | `routes/products/[id]/+page.svelte` | Product detail |
| `/cart` | `routes/cart/+page.svelte` | Shopping cart |
| `/checkout` | `routes/checkout/+page.svelte` | Checkout |
| `/orders` | `routes/orders/+page.svelte` | Order list |
| `/orders/[id]` | `routes/orders/[id]/+page.svelte` | Order detail |
| `/auth/login` | `routes/auth/login/+page.svelte` | Login |
| `/auth/register` | `routes/auth/register/+page.svelte` | Register |
| `/profile` | `routes/profile/+page.svelte` | User profile |

### Protected Routes

```typescript
// routes/orders/+page.ts
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { authStore } from '$lib/stores/auth.store';

export const load: PageLoad = async () => {
  const isAuthenticated = authStore.isAuthenticated();
  
  if (!isAuthenticated) {
    throw redirect(302, '/auth/login');
  }
  
  // Load data
  return {
    orders: await orderApi.list()
  };
};
```

---

## 🎨 Styling

### TailwindCSS 3.4 Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        // ... custom color palette
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
```

### Component Styling Pattern

```svelte
<script lang="ts">
  import { cn } from '$lib/utils/cn';
  
  let {
    variant = 'primary',
    size = 'md',
    class: className = '',
    ...props
  } = $props();
  
  const baseStyles = 'rounded-lg font-medium transition-colors';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
</script>

<button
  class={cn(baseStyles, variants[variant], sizes[size], className)}
  {...props}
>
  {@render children?.()}
</button>
```

---

## 🧪 Testing

### Unit Tests (Vitest)

```typescript
// tests/unit/stores/cart.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { cartStore, cartTotals } from '$lib/stores/cart.store';

describe('Cart Store', () => {
  beforeEach(() => {
    cartStore.clear();
  });

  it('should add item to cart', () => {
    const item = { id: 1, name: 'Product', price: 99.99, quantity: 1 };
    cartStore.addItem(item);
    
    const cart = get(cartStore);
    expect(cart).toHaveLength(1);
    expect(cart[0]).toEqual(item);
  });

  it('should calculate cart totals', () => {
    cartStore.addItem({ id: 1, name: 'Product 1', price: 10, quantity: 2 });
    cartStore.addItem({ id: 2, name: 'Product 2', price: 20, quantity: 1 });
    
    const totals = get(cartTotals);
    expect(totals.itemCount).toBe(3);
    expect(totals.subtotal).toBe(40);
  });
});
```

### Component Tests

```typescript
// tests/unit/components/ProductCard.test.ts
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import ProductCard from '$lib/components/product/ProductCard.svelte';

describe('ProductCard', () => {
  const product = {
    id: 1,
    name: 'Test Product',
    price: 99.99,
    description: 'Test description',
  };

  it('should render product information', () => {
    render(ProductCard, { props: { product } });
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('should emit add-to-cart event', async () => {
    const { component } = render(ProductCard, { props: { product } });
    const addButton = screen.getByRole('button', { name: /add to cart/i });
    
    let eventFired = false;
    component.$on('add-to-cart', () => { eventFired = true; });
    
    await addButton.click();
    expect(eventFired).toBe(true);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/login');
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('should complete checkout', async ({ page }) => {
    // Add product to cart
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child button');
    
    // Go to cart
    await page.click('[data-testid="cart-button"]');
    await expect(page).toHaveURL('/cart');
    
    // Proceed to checkout
    await page.click('button:has-text("Checkout")');
    await expect(page).toHaveURL('/checkout');
    
    // Fill checkout form
    await page.fill('[name="address"]', '123 Test St');
    await page.fill('[name="city"]', 'Test City');
    await page.fill('[name="zipcode"]', '12345');
    
    // Submit order
    await page.click('button[type="submit"]');
    
    // Verify order success
    await expect(page.locator('text=Order placed successfully')).toBeVisible();
  });
});
```

### Run Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run E2E tests in UI mode
pnpm test:e2e:ui
```

---

## ⚡ Performance

### Optimization Strategies

1. **Code Splitting**: Automatic route-based splitting by SvelteKit
2. **Lazy Loading**: Dynamic imports for heavy components
3. **Image Optimization**: Use modern formats (WebP, AVIF)
4. **Caching**: Aggressive caching with TanStack Query
5. **Bundle Analysis**: Analyze bundle size with `vite-plugin-bundle-visualizer`

### Performance Budgets

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.9s
- **Total Bundle Size**: < 200KB (gzipped)

### Monitoring

```typescript
// lib/utils/performance.ts
export function measurePerformance(metricName: string) {
  if (!window.performance) return;
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`${metricName}:`, entry.duration);
      // Send to analytics
    }
  });
  
  observer.observe({ entryTypes: ['measure'] });
}
```

---

## 🔐 Security

### Security Measures

1. **XSS Protection**: Svelte automatically escapes HTML
2. **CSRF Protection**: Token-based validation
3. **Content Security Policy**: Strict CSP headers
4. **HTTPS Only**: Force secure connections in production
5. **Token Management**: Secure storage and rotation
6. **Input Validation**: Zod schemas for all user inputs
7. **Rate Limiting**: Client-side request throttling

### Environment Variable Security

```typescript
// lib/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  VITE_USER_SERVICE_URL: z.string().url(),
  VITE_PRODUCT_SERVICE_URL: z.string().url(),
  VITE_ORDER_SERVICE_URL: z.string().url(),
  // ... other vars
});

export const env = envSchema.parse({
  VITE_USER_SERVICE_URL: import.meta.env.VITE_USER_SERVICE_URL,
  VITE_PRODUCT_SERVICE_URL: import.meta.env.VITE_PRODUCT_SERVICE_URL,
  VITE_ORDER_SERVICE_URL: import.meta.env.VITE_ORDER_SERVICE_URL,
});
```

---

## 🚀 Deployment

### Production Build

```bash
# Build for production
pnpm build

# Output directory: build/
```

### Docker Deployment

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints updated
- [ ] Build optimized for production
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Performance monitoring enabled
- [ ] Backup strategy in place

---

## 👥 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add shopping cart functionality
fix: resolve login redirect issue
docs: update API integration guide
style: format code with prettier
refactor: simplify cart store logic
test: add unit tests for auth service
chore: update dependencies
```

### Code Review Guidelines

- [ ] Code follows style guide
- [ ] Tests pass
- [ ] TypeScript types are correct
- [ ] Components are accessible
- [ ] Performance is acceptable
- [ ] Documentation is updated

---

## 🔧 Troubleshooting

### Common Issues

#### 1. CORS Errors

**Problem**: API requests blocked by CORS policy

**Solution**: Configure backend CORS or use proxy

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

#### 2. Module Not Found

**Problem**: TypeScript can't find modules

**Solution**: Check `tsconfig.json` paths

```json
{
  "compilerOptions": {
    "paths": {
      "$lib": ["./src/lib"],
      "$lib/*": ["./src/lib/*"]
    }
  }
}
```

#### 3. Build Failures

**Problem**: Production build fails

**Solution**: 
```bash
# Clear cache
pnpm clean
rm -rf node_modules .svelte-kit
pnpm install
pnpm build
```

#### 4. Hot Reload Not Working

**Problem**: Changes don't reflect

**Solution**: 
```bash
# Restart dev server
pnpm dev --force
```

---

## 📚 Documentation

- [Requirements Specification](./REQUIREMENTS.md) - Detailed functional requirements
- [API Documentation](../server/README.md) - Backend API reference
- [Architecture Guide](../ARCHITECTURE.md) - System architecture
- [Deployment Guide](../DEPLOYMENT.md) - Production deployment

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

---

## 🤝 Support

- **Documentation**: Check docs folder
- **Issues**: [GitHub Issues](https://github.com/congdinh2008/python-micro/issues)
- **Discussions**: [GitHub Discussions](https://github.com/congdinh2008/python-micro/discussions)

---

## 🎓 Learning Resources

### Svelte & SvelteKit
- [Svelte Tutorial](https://svelte.dev/tutorial)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Svelte 5 Runes Guide](https://svelte.dev/docs/svelte/what-are-runes)

### TailwindCSS
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

---

<div align="center">

**Built with ❤️ using Svelte 5, TailwindCSS 3.4, and TypeScript**

[⬆ Back to Top](#-e-commerce-microservices---svelte-frontend-client)

</div>
