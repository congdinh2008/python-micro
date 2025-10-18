# 📋 E-Commerce Client - Detailed Requirements Specification

<div align="center">

**Comprehensive Functional & Technical Requirements**

Version 1.0.0 | October 18, 2025

</div>

---

## 📑 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Functional Requirements](#functional-requirements)
   - [User Management](#user-management)
   - [Product Catalog](#product-catalog)
   - [Shopping Cart](#shopping-cart)
   - [Order Management](#order-management)
   - [User Interface](#user-interface)
3. [Technical Requirements](#technical-requirements)
   - [Technology Stack](#technology-stack)
   - [API Integration](#api-integration)
   - [State Management](#state-management)
   - [Security](#security)
   - [Performance](#performance)
   - [Testing](#testing)
4. [Non-Functional Requirements](#non-functional-requirements)
5. [Development Standards](#development-standards)
6. [Deployment Requirements](#deployment-requirements)
7. [Acceptance Criteria](#acceptance-criteria)

---

## 🎯 Executive Summary

This document specifies the complete requirements for building a modern, production-ready e-commerce frontend application using **Svelte 5.5**, **SvelteKit 2.0**, and **TailwindCSS 3.4**. The application must integrate seamlessly with existing Python microservices (User, Product, Order, and Notification services) to provide a complete e-commerce experience.

### Project Goals

1. **Modern User Experience**: Provide a fast, responsive, and intuitive interface
2. **Seamless Integration**: Connect with Python microservices backend
3. **Production Ready**: Meet enterprise-grade quality standards
4. **Maintainable**: Follow best practices and clean architecture
5. **Scalable**: Support future feature additions

### Target Users

- **End Users**: Customers shopping for products
- **Developers**: Team members maintaining and extending the application
- **DevOps**: Team members deploying and monitoring the application

---

## 📋 Functional Requirements

### 1. User Management

#### 1.1 User Registration

**Priority**: High | **Status**: Required

**Requirements**:

- **FR-UM-001**: System shall provide a registration form with the following fields:
  - Username (required, 3-50 characters, alphanumeric + underscore)
  - Password (required, minimum 6 characters, at least 1 uppercase)
  - Confirm Password (must match password)

- **FR-UM-002**: System shall validate all input fields client-side before submission

- **FR-UM-003**: System shall display appropriate error messages for:
  - Invalid username format
  - Weak password
  - Password mismatch
  - Username already exists (from server)
  - Network errors

- **FR-UM-004**: System shall redirect user to login page after successful registration

- **FR-UM-005**: System shall display success message confirming registration

**API Integration**:
```typescript
POST http://localhost:8001/register
Content-Type: application/json

Request Body:
{
  "username": "string",
  "password": "string"
}

Response 201:
{
  "id": number,
  "username": "string",
  "is_active": boolean,
  "created_at": "ISO-8601 datetime"
}

Error Responses:
400: { "detail": "Username already exists" }
422: { "detail": [{ "loc": [], "msg": "string", "type": "string" }] }
```

**UI Components Required**:
- `RegisterForm.svelte`: Main registration form
- `Input.svelte`: Text input component with validation
- `Button.svelte`: Submit button
- `Alert.svelte`: Error/success message display

**Validation Schema** (Zod):
```typescript
const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

---

#### 1.2 User Login

**Priority**: High | **Status**: Required

**Requirements**:

- **FR-UM-006**: System shall provide a login form with:
  - Username field (required)
  - Password field (required, masked)
  - "Remember me" checkbox (optional)
  - "Forgot password?" link

- **FR-UM-007**: System shall authenticate user via User Service API

- **FR-UM-008**: System shall store JWT token securely in localStorage or sessionStorage

- **FR-UM-009**: System shall redirect authenticated users to home page or previous page

- **FR-UM-010**: System shall display error messages for:
  - Invalid credentials
  - Account not active
  - Network errors

- **FR-UM-011**: System shall auto-login users with valid token on page refresh

- **FR-UM-012**: System shall implement token refresh mechanism before expiration

**API Integration**:
```typescript
POST http://localhost:8001/login
Content-Type: application/x-www-form-urlencoded

Request Body (form-encoded):
username=string&password=string

Response 200:
{
  "access_token": "string (JWT)",
  "token_type": "bearer"
}

Error Responses:
401: { "detail": "Incorrect username or password" }
```

**State Management**:
```typescript
// lib/stores/auth.store.ts
interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Methods required:
- login(username: string, password: string): Promise<void>
- logout(): void
- refreshToken(): Promise<void>
- validateToken(): Promise<boolean>
- getUser(): Promise<User>
```

---

#### 1.3 User Logout

**Priority**: High | **Status**: Required

**Requirements**:

- **FR-UM-013**: System shall provide logout button in user menu

- **FR-UM-014**: System shall clear authentication token from storage

- **FR-UM-015**: System shall clear all user-related state

- **FR-UM-016**: System shall redirect user to home page

- **FR-UM-017**: System shall display confirmation message

---

#### 1.4 Profile Management

**Priority**: Medium | **Status**: Future Enhancement

**Requirements**:

- **FR-UM-018**: System shall display user profile information
- **FR-UM-019**: System shall allow users to update their profile
- **FR-UM-020**: System shall support avatar upload
- **FR-UM-021**: System shall allow password change
- **FR-UM-022**: System shall maintain address book

---

### 2. Product Catalog

#### 2.1 Product Listing

**Priority**: High | **Status**: Required

**Requirements**:

- **FR-PC-001**: System shall display products in a responsive grid layout
  - Desktop: 4 columns
  - Tablet: 3 columns
  - Mobile: 1-2 columns

- **FR-PC-002**: System shall display for each product:
  - Product image (placeholder if not available)
  - Product name
  - Product price (formatted as currency)
  - Product description (truncated)
  - "Add to Cart" button
  - "View Details" link

- **FR-PC-003**: System shall implement pagination with:
  - Page size selector (10, 20, 50 items)
  - Page number navigation
  - "Previous" and "Next" buttons
  - Display of current page and total pages

- **FR-PC-004**: System shall cache product list for performance

- **FR-PC-005**: System shall handle loading states with skeleton loaders

- **FR-PC-006**: System shall display appropriate messages for:
  - No products available
  - Loading state
  - Error state

**API Integration**:
```typescript
GET http://localhost:8002/products?skip=0&limit=20
Authorization: Bearer {token}

Response 200:
[
  {
    "id": number,
    "name": "string",
    "description": "string",
    "price": number (Decimal as string),
    "quantity": number,
    "created_at": "ISO-8601 datetime",
    "updated_at": "ISO-8601 datetime"
  }
]

Error Responses:
401: { "detail": "Not authenticated" }
500: { "detail": "Internal server error" }
```

**Component Structure**:
```
ProductListPage (+page.svelte)
├── ProductFilter (filters)
├── ProductGrid
│   └── ProductCard (repeated)
│       ├── ProductImage
│       ├── ProductInfo
│       └── ProductActions
└── Pagination
```

---

#### 2.2 Product Search & Filters

**Priority**: Medium | **Status**: Required

**Requirements**:

- **FR-PC-007**: System shall provide search input in header

- **FR-PC-008**: System shall implement client-side filtering by:
  - Product name
  - Description content
  - Price range

- **FR-PC-009**: System shall provide filter options:
  - Price range slider (min-max)
  - Sort by: Name (A-Z, Z-A), Price (Low-High, High-Low), Newest

- **FR-PC-010**: System shall display active filters with ability to clear

- **FR-PC-011**: System shall update URL query parameters for shareable filters

- **FR-PC-012**: System shall debounce search input (300ms)

**Implementation**:
```typescript
// lib/stores/product.store.ts
interface ProductFilters {
  search: string;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc' | 'newest';
}

// Derived store for filtered products
export const filteredProducts = derived(
  [productStore, filterStore],
  ([$products, $filters]) => {
    return $products
      .filter(p => filterBySearch(p, $filters.search))
      .filter(p => filterByPrice(p, $filters))
      .sort((a, b) => sortProducts(a, b, $filters.sortBy));
  }
);
```

---

#### 2.3 Product Details

**Priority**: High | **Status**: Required

**Requirements**:

- **FR-PC-013**: System shall display detailed product information:
  - Full product name
  - Complete description
  - Price (prominent display)
  - Stock availability status
  - Created/Updated dates

- **FR-PC-014**: System shall provide quantity selector (1-stock limit)

- **FR-PC-015**: System shall display "Add to Cart" button
  - Disabled if out of stock
  - Shows loading state during add operation

- **FR-PC-016**: System shall show related products (if available)

- **FR-PC-017**: System shall implement breadcrumb navigation

- **FR-PC-018**: System shall handle 404 for non-existent products

**API Integration**:
```typescript
GET http://localhost:8002/products/{product_id}
Authorization: Bearer {token}

Response 200:
{
  "id": number,
  "name": "string",
  "description": "string",
  "price": number,
  "quantity": number,
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}

Error Responses:
404: { "detail": "Product not found" }
401: { "detail": "Not authenticated" }
```

**Route**: `/products/[id]`

---

### 3. Shopping Cart

#### 3.1 Cart Management

**Priority**: High | **Status**: Required

**Requirements**:

- **FR-SC-001**: System shall maintain cart state across page refreshes

- **FR-SC-002**: System shall store cart data in:
  - LocalStorage for persistence
  - Svelte store for reactivity
  - Backend sync for authenticated users (future)

- **FR-SC-003**: System shall support cart operations:
  - Add item (with quantity)
  - Remove item
  - Update item quantity
  - Clear cart

- **FR-SC-004**: System shall validate:
  - Item not already in cart (or merge quantities)
  - Quantity does not exceed stock
  - Positive quantity values

- **FR-SC-005**: System shall display cart icon in header with:
  - Item count badge
  - Animated update on changes

**Cart State Interface**:
```typescript
interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  lastUpdated: Date;
}

// Derived calculations
interface CartTotals {
  itemCount: number;        // Total items
  uniqueItems: number;      // Unique products
  subtotal: number;         // Sum before tax/shipping
  tax: number;             // Calculated tax (if applicable)
  shipping: number;        // Shipping cost (if applicable)
  total: number;           // Final total
}
```

---

#### 3.2 Cart Page

**Priority**: High | **Status**: Required

**Requirements**:

- **FR-SC-006**: System shall display cart page with:
  - List of all cart items
  - Empty cart message if no items
  - "Continue Shopping" button
  - "Proceed to Checkout" button

- **FR-SC-007**: For each cart item, display:
  - Product image (thumbnail)
  - Product name (linked to detail page)
  - Unit price
  - Quantity selector
  - Subtotal (price × quantity)
  - Remove button

- **FR-SC-008**: System shall display cart summary:
  - Subtotal
  - Estimated tax (if applicable)
  - Shipping cost (if applicable)
  - Total amount

- **FR-SC-009**: System shall update totals in real-time on quantity changes

- **FR-SC-010**: System shall confirm before removing items

- **FR-SC-011**: System shall show success message after quantity updates

**Route**: `/cart`

**Component Structure**:
```
CartPage (+page.svelte)
├── CartHeader
├── CartItemList
│   └── CartItem (repeated)
│       ├── CartItemImage
│       ├── CartItemInfo
│       ├── QuantitySelector
│       └── RemoveButton
├── CartSummary
│   ├── PriceBreakdown
│   └── CheckoutButton
└── EmptyCart (conditional)
```

---

#### 3.3 Cart Drawer (Mini Cart)

**Priority**: Medium | **Status**: Optional

**Requirements**:

- **FR-SC-012**: System shall display cart drawer on header icon click

- **FR-SC-013**: Cart drawer shall show:
  - List of cart items (limited to 5, scrollable)
  - Cart totals
  - "View Cart" button
  - "Checkout" button

- **FR-SC-014**: System shall allow quick remove from drawer

- **FR-SC-015**: Drawer shall close on outside click or ESC key

---

### 4. Order Management

#### 4.1 Checkout Process

**Priority**: High | **Status**: Required

**Requirements**:

- **FR-OM-001**: System shall require authentication for checkout

- **FR-OM-002**: System shall redirect unauthenticated users to login
  - Save cart state
  - Redirect back to checkout after login

- **FR-OM-003**: System shall validate cart before checkout:
  - Cart not empty
  - All items in stock
  - Valid quantities

- **FR-OM-004**: System shall create order via Order Service API

- **FR-OM-005**: System shall display order confirmation:
  - Order ID
  - Order items
  - Order total
  - Estimated delivery (if applicable)

- **FR-OM-006**: System shall clear cart after successful order

- **FR-OM-007**: System shall handle checkout errors:
  - Product out of stock
  - Price changed
  - Network errors
  - Payment errors (future)

**API Integration**:
```typescript
POST http://localhost:8003/orders
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "product_id": number,
  "quantity": number
}

Response 201:
{
  "id": number,
  "user_id": number,
  "product_id": number,
  "quantity": number,
  "total_price": number,
  "status": "pending",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}

Error Responses:
400: { "detail": "Product not found or insufficient stock" }
401: { "detail": "Not authenticated" }
```

**Note**: Current backend supports single-product orders. Multi-product checkout requires creating multiple orders.

**Checkout Flow**:
```
Cart Page → Click "Checkout"
         ↓
   Authentication Check
         ↓
   Order Creation (for each cart item)
         ↓
   Order Confirmation
         ↓
   Clear Cart
```

---

#### 4.2 Order History

**Priority**: High | **Status**: Required

**Requirements**:

- **FR-OM-008**: System shall display user's order history

- **FR-OM-009**: System shall show for each order:
  - Order ID
  - Order date
  - Order status (pending, confirmed, shipped, delivered, cancelled)
  - Order total
  - "View Details" link

- **FR-OM-010**: System shall implement pagination for order list

- **FR-OM-011**: System shall allow filtering by:
  - Order status
  - Date range

- **FR-OM-012**: System shall sort orders by date (newest first) by default

**API Integration**:
```typescript
GET http://localhost:8003/orders?skip=0&limit=20
Authorization: Bearer {token}

Response 200:
[
  {
    "id": number,
    "user_id": number,
    "product_id": number,
    "quantity": number,
    "total_price": number,
    "status": "pending",
    "created_at": "ISO-8601",
    "updated_at": "ISO-8601"
  }
]
```

**Route**: `/orders`

---

#### 4.3 Order Details

**Priority**: High | **Status**: Required

**Requirements**:

- **FR-OM-013**: System shall display detailed order information:
  - Order ID
  - Order date
  - Order status with visual indicator
  - Product details
  - Quantity
  - Unit price
  - Total price
  - Order timeline (if available)

- **FR-OM-014**: System shall fetch product details for order items

- **FR-OM-015**: System shall display order status history (future)

- **FR-OM-016**: System shall allow order cancellation (if pending)

- **FR-OM-017**: System shall provide "Reorder" functionality

**API Integration**:
```typescript
GET http://localhost:8003/orders/{order_id}
Authorization: Bearer {token}

Response 200:
{
  "id": number,
  "user_id": number,
  "product_id": number,
  "quantity": number,
  "total_price": number,
  "status": "pending",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}

Error Responses:
404: { "detail": "Order not found" }
403: { "detail": "Not authorized to view this order" }
```

**Route**: `/orders/[id]`

---

#### 4.4 Real-Time Order Updates

**Priority**: Medium | **Status**: Future Enhancement

**Requirements**:

- **FR-OM-018**: System shall connect to WebSocket for real-time updates

- **FR-OM-019**: System shall subscribe to order status changes

- **FR-OM-020**: System shall display toast notifications for updates

- **FR-OM-021**: System shall update order list/details in real-time

**WebSocket Integration**:
```typescript
// Connect to notification service
ws://localhost:8004

// Message format
{
  "event": "order.status.changed",
  "data": {
    "order_id": number,
    "status": "confirmed" | "shipped" | "delivered",
    "timestamp": "ISO-8601"
  }
}
```

---

### 5. User Interface

#### 5.1 Layout & Navigation

**Priority**: High | **Status**: Required

**Requirements**:

- **FR-UI-001**: System shall implement responsive layout:
  - Header (fixed/sticky)
  - Main content area
  - Footer

- **FR-UI-002**: Header shall include:
  - Application logo (linked to home)
  - Search bar (prominent on desktop)
  - Navigation links (Products, Orders for auth users)
  - Cart icon with badge
  - User menu (Login/Register or Profile/Logout)

- **FR-UI-003**: Footer shall include:
  - Copyright information
  - Quick links
  - Social media links (if applicable)

- **FR-UI-004**: System shall highlight active navigation item

- **FR-UI-005**: System shall implement mobile navigation:
  - Hamburger menu
  - Slide-out drawer
  - Overlay for modal behavior

**Component**: `lib/components/layout/Header.svelte`

---

#### 5.2 Responsive Design

**Priority**: High | **Status**: Required

**Requirements**:

- **FR-UI-006**: System shall support breakpoints:
  - Mobile: < 640px (sm)
  - Tablet: 640px - 1024px (md, lg)
  - Desktop: > 1024px (xl, 2xl)

- **FR-UI-007**: System shall adapt layouts:
  - Grid columns adjust to screen size
  - Touch-friendly buttons on mobile (min 44x44px)
  - Simplified navigation on mobile
  - Stacked layout on small screens

- **FR-UI-008**: System shall use mobile-first CSS approach

- **FR-UI-009**: Images shall be responsive (max-width: 100%)

---

#### 5.3 Loading States

**Priority**: High | **Status**: Required

**Requirements**:

- **FR-UI-010**: System shall display loading indicators for:
  - Page transitions
  - API calls
  - Form submissions
  - Image loading

- **FR-UI-011**: System shall use appropriate loaders:
  - Skeleton screens for content
  - Spinners for actions
  - Progress bars for uploads (future)

- **FR-UI-012**: System shall prevent duplicate submissions during loading

**Component**: `lib/components/ui/Spinner.svelte`, `SkeletonCard.svelte`

---

#### 5.4 Error Handling

**Priority**: High | **Status**: Required

**Requirements**:

- **FR-UI-013**: System shall display user-friendly error messages

- **FR-UI-014**: System shall categorize errors:
  - Validation errors (inline with fields)
  - API errors (toast notifications or alert boxes)
  - Network errors (retry option)
  - 404 errors (custom page)
  - 500 errors (generic error page)

- **FR-UI-015**: System shall provide error recovery actions:
  - Retry button
  - Back to home link
  - Contact support (future)

- **FR-UI-016**: System shall log errors to console (dev) / monitoring (prod)

**Component**: `lib/components/ui/Alert.svelte`, `Toast.svelte`

---

#### 5.5 Notifications

**Priority**: Medium | **Status**: Required

**Requirements**:

- **FR-UI-017**: System shall display toast notifications for:
  - Success messages (green)
  - Error messages (red)
  - Warning messages (yellow)
  - Info messages (blue)

- **FR-UI-018**: Toasts shall:
  - Auto-dismiss after 5 seconds (configurable)
  - Be dismissible by user
  - Stack if multiple
  - Animate in/out

- **FR-UI-019**: System shall queue notifications if many at once

**Component**: `lib/components/ui/Toast.svelte`

**Store**: `lib/stores/ui.store.ts`

```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Methods
- showToast(toast: Omit<Toast, 'id'>): void
- dismissToast(id: string): void
- clearToasts(): void
```

---

#### 5.6 Accessibility

**Priority**: High | **Status**: Required

**Requirements**:

- **FR-UI-020**: System shall meet WCAG 2.1 Level AA standards

- **FR-UI-021**: System shall implement:
  - Semantic HTML elements
  - ARIA labels and roles
  - Keyboard navigation (Tab, Enter, Esc, Arrow keys)
  - Focus indicators (visible outline)
  - Skip to main content link

- **FR-UI-022**: System shall ensure color contrast ratios:
  - Normal text: 4.5:1
  - Large text: 3:1
  - UI components: 3:1

- **FR-UI-023**: System shall provide text alternatives:
  - Alt text for images
  - Labels for form inputs
  - Titles for links/buttons

- **FR-UI-024**: System shall support screen readers

- **FR-UI-025**: System shall avoid:
  - Auto-playing media
  - Flashing content (seizure risk)
  - Relying solely on color for information

---

#### 5.7 Design System

**Priority**: Medium | **Status**: Required

**Requirements**:

- **FR-UI-026**: System shall implement consistent design:
  - Color palette (primary, secondary, neutral, semantic)
  - Typography scale
  - Spacing scale (4px base grid)
  - Border radius values
  - Shadow system

- **FR-UI-027**: System shall use TailwindCSS utilities

- **FR-UI-028**: System shall define reusable components:
  - Button (variants: primary, secondary, outline, ghost, danger)
  - Input (text, email, password, number)
  - Select dropdown
  - Checkbox / Radio
  - Card
  - Modal
  - Badge
  - Avatar

**Config**: `tailwind.config.js`

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
      },
      // ... other colors
    }
  }
}
```

---

## 🔧 Technical Requirements

### 1. Technology Stack

**TR-TS-001**: Use Svelte 5.5 with Runes API

**TR-TS-002**: Use SvelteKit 2.0 for routing and SSR capabilities

**TR-TS-003**: Use TypeScript 5.6 with strict mode enabled

**TR-TS-004**: Use TailwindCSS 3.4 for styling

**TR-TS-005**: Use Vite 5.4 as build tool

**TR-TS-006**: Use pnpm as package manager (recommended)

---

### 2. API Integration

#### 2.1 HTTP Client

**TR-API-001**: Implement centralized API client using Axios

**TR-API-002**: Configure base URLs from environment variables

**TR-API-003**: Implement request interceptors for:
- Adding authentication token
- Request logging (development)

**TR-API-004**: Implement response interceptors for:
- Error handling
- Token refresh
- Response logging (development)

**TR-API-005**: Implement retry logic for network failures

**TR-API-006**: Set appropriate timeouts (10s for API calls)

**Implementation**:
```typescript
// lib/api/client.ts
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { authStore } from '$lib/stores/auth.store';
import { goto } from '$app/navigation';

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
    // Request interceptor
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

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear auth and redirect to login
          authStore.logout();
          goto('/auth/login');
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Service instances
export const userApi = new ApiClient(import.meta.env.VITE_USER_SERVICE_URL);
export const productApi = new ApiClient(import.meta.env.VITE_PRODUCT_SERVICE_URL);
export const orderApi = new ApiClient(import.meta.env.VITE_ORDER_SERVICE_URL);
```

---

#### 2.2 Service APIs

**User Service API** (`lib/api/auth.api.ts`):
```typescript
import { userApi } from './client';
import type { LoginRequest, LoginResponse, RegisterRequest, UserResponse } from '$lib/types';

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    return userApi.post<LoginResponse>('/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
  },

  async register(data: RegisterRequest): Promise<UserResponse> {
    return userApi.post<UserResponse>('/register', data);
  },

  async validateToken(token: string): Promise<{ valid: boolean; username?: string; user_id?: number }> {
    return userApi.post('/validate-token', { token });
  }
};
```

**Product Service API** (`lib/api/product.api.ts`):
```typescript
import { productApi } from './client';
import type { Product, ProductListParams } from '$lib/types';

export const productService = {
  async list(params?: ProductListParams): Promise<Product[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return productApi.get<Product[]>(`/products?${queryParams}`);
  },

  async getById(id: number): Promise<Product> {
    return productApi.get<Product>(`/products/${id}`);
  }
};
```

**Order Service API** (`lib/api/order.api.ts`):
```typescript
import { orderApi } from './client';
import type { Order, CreateOrderRequest, OrderListParams } from '$lib/types';

export const orderService = {
  async create(data: CreateOrderRequest): Promise<Order> {
    return orderApi.post<Order>('/orders', data);
  },

  async list(params?: OrderListParams): Promise<Order[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip) queryParams.append('skip', params.skip.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    return orderApi.get<Order[]>(`/orders?${queryParams}`);
  },

  async getById(id: number): Promise<Order> {
    return orderApi.get<Order>(`/orders/${id}`);
  }
};
```

---

### 3. State Management

**TR-SM-001**: Use Svelte 5 Runes (`$state`, `$derived`, `$effect`) for local component state

**TR-SM-002**: Use Svelte stores for shared application state

**TR-SM-003**: Implement custom stores for domain logic

**TR-SM-004**: Use TanStack Query for server state management (optional but recommended)

**TR-SM-005**: Persist critical state to localStorage

**TR-SM-006**: Implement state synchronization between tabs (future)

#### Store Structure:

**Authentication Store** (`lib/stores/auth.store.ts`):
```typescript
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { User } from '$lib/types';

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    token: null,
    user: null,
    loading: false,
    error: null,
  });

  // Load token from localStorage on init
  if (browser) {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      update(state => ({ ...state, token: storedToken }));
    }
  }

  return {
    subscribe,
    
    async login(username: string, password: string) {
      update(state => ({ ...state, loading: true, error: null }));
      
      try {
        const response = await authApi.login({ username, password });
        const token = response.access_token;
        
        // Store token
        if (browser) {
          localStorage.setItem('auth_token', token);
        }
        
        update(state => ({ ...state, token, loading: false }));
      } catch (error: any) {
        update(state => ({ 
          ...state, 
          loading: false, 
          error: error.response?.data?.detail || 'Login failed' 
        }));
        throw error;
      }
    },
    
    logout() {
      if (browser) {
        localStorage.removeItem('auth_token');
      }
      set({ token: null, user: null, loading: false, error: null });
    },
    
    getToken(): string | null {
      let token: string | null = null;
      subscribe(state => { token = state.token; })();
      return token;
    }
  };
}

export const authStore = createAuthStore();

// Derived store for auth status
export const isAuthenticated = derived(
  authStore,
  $auth => $auth.token !== null
);
```

**Cart Store** (`lib/stores/cart.store.ts`):
```typescript
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { CartItem } from '$lib/types';

const CART_STORAGE_KEY = 'shopping_cart';

function createCartStore() {
  const { subscribe, set, update } = writable<CartItem[]>([]);

  // Load from localStorage
  if (browser) {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        set(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e);
      }
    }
  }

  // Persist to localStorage on changes
  if (browser) {
    subscribe(items => {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    });
  }

  return {
    subscribe,
    
    addItem(product: Product, quantity: number = 1) {
      update(items => {
        const existingIndex = items.findIndex(item => item.productId === product.id);
        
        if (existingIndex >= 0) {
          // Update quantity
          const newQuantity = items[existingIndex].quantity + quantity;
          if (newQuantity > product.quantity) {
            throw new Error('Cannot add more than available stock');
          }
          items[existingIndex].quantity = newQuantity;
          return items;
        } else {
          // Add new item
          return [...items, {
            id: Date.now(),
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            maxStock: product.quantity,
          }];
        }
      });
    },
    
    removeItem(productId: number) {
      update(items => items.filter(item => item.productId !== productId));
    },
    
    updateQuantity(productId: number, quantity: number) {
      update(items => {
        const item = items.find(i => i.productId === productId);
        if (!item) return items;
        
        if (quantity <= 0) {
          return items.filter(i => i.productId !== productId);
        }
        
        if (quantity > item.maxStock) {
          throw new Error('Cannot exceed available stock');
        }
        
        return items.map(i => 
          i.productId === productId ? { ...i, quantity } : i
        );
      });
    },
    
    clear() {
      set([]);
    }
  };
}

export const cartStore = createCartStore();

// Derived stores
export const cartTotals = derived(cartStore, $cart => ({
  itemCount: $cart.reduce((sum, item) => sum + item.quantity, 0),
  uniqueItems: $cart.length,
  subtotal: $cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
}));

export const isCartEmpty = derived(cartStore, $cart => $cart.length === 0);
```

**UI Store** (`lib/stores/ui.store.ts`):
```typescript
import { writable } from 'svelte/store';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface UIState {
  toasts: Toast[];
  isMenuOpen: boolean;
  isCartDrawerOpen: boolean;
}

function createUIStore() {
  const { subscribe, update } = writable<UIState>({
    toasts: [],
    isMenuOpen: false,
    isCartDrawerOpen: false,
  });

  return {
    subscribe,
    
    showToast(toast: Omit<Toast, 'id'>) {
      const id = `toast-${Date.now()}`;
      const newToast: Toast = { id, ...toast };
      
      update(state => ({
        ...state,
        toasts: [...state.toasts, newToast],
      }));
      
      // Auto-dismiss
      const duration = toast.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => {
          this.dismissToast(id);
        }, duration);
      }
    },
    
    dismissToast(id: string) {
      update(state => ({
        ...state,
        toasts: state.toasts.filter(t => t.id !== id),
      }));
    },
    
    toggleMenu() {
      update(state => ({
        ...state,
        isMenuOpen: !state.isMenuOpen,
      }));
    },
    
    toggleCartDrawer() {
      update(state => ({
        ...state,
        isCartDrawerOpen: !state.isCartDrawerOpen,
      }));
    },
  };
}

export const uiStore = createUIStore();
```

---

### 4. Security

**TR-SEC-001**: Never expose API secrets or keys in client code

**TR-SEC-002**: Store JWT tokens securely (localStorage with XSS considerations)

**TR-SEC-003**: Implement token expiration handling

**TR-SEC-004**: Validate all user inputs client-side (Zod schemas)

**TR-SEC-005**: Sanitize user-generated content before display

**TR-SEC-006**: Use HTTPS in production

**TR-SEC-007**: Implement Content Security Policy (CSP) headers

**TR-SEC-008**: Prevent clickjacking with X-Frame-Options

**TR-SEC-009**: Use httpOnly cookies for sensitive data (future)

**TR-SEC-010**: Implement rate limiting on API calls (client-side throttling)

---

### 5. Performance

**TR-PERF-001**: Lazy load routes and components

**TR-PERF-002**: Implement code splitting (automatic with SvelteKit)

**TR-PERF-003**: Optimize images (use modern formats, lazy loading)

**TR-PERF-004**: Minimize bundle size (tree-shaking, compression)

**TR-PERF-005**: Cache API responses (TanStack Query)

**TR-PERF-006**: Debounce search inputs (300ms)

**TR-PERF-007**: Throttle scroll events

**TR-PERF-008**: Use virtual scrolling for long lists (future)

**TR-PERF-009**: Implement service worker for offline support (PWA)

**TR-PERF-010**: Optimize CSS (purge unused, minify)

**Performance Targets**:
- Time to Interactive (TTI): < 4s on 3G
- First Contentful Paint (FCP): < 2s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Total Blocking Time (TBT): < 300ms

---

### 6. Testing

#### 6.1 Unit Testing

**TR-TEST-001**: Use Vitest for unit tests

**TR-TEST-002**: Test coverage target: > 70%

**TR-TEST-003**: Test all utility functions

**TR-TEST-004**: Test store logic

**TR-TEST-005**: Test validation schemas

**Example**:
```typescript
// tests/unit/utils/validation.test.ts
import { describe, it, expect } from 'vitest';
import { registerSchema } from '$lib/schemas/auth.schema';

describe('Register Schema', () => {
  it('should validate correct user data', () => {
    const validData = {
      username: 'testuser',
      password: 'Test@123',
      confirmPassword: 'Test@123',
    };
    
    expect(() => registerSchema.parse(validData)).not.toThrow();
  });

  it('should reject short username', () => {
    const invalidData = {
      username: 'ab',
      password: 'Test@123',
      confirmPassword: 'Test@123',
    };
    
    expect(() => registerSchema.parse(invalidData)).toThrow();
  });
});
```

---

#### 6.2 Component Testing

**TR-TEST-006**: Use Testing Library (Svelte) for component tests

**TR-TEST-007**: Test user interactions

**TR-TEST-008**: Test component rendering

**TR-TEST-009**: Mock API calls with MSW

**Example**:
```typescript
// tests/unit/components/LoginForm.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from '$lib/components/auth/LoginForm.svelte';
import { authApi } from '$lib/api/auth.api';

vi.mock('$lib/api/auth.api');

describe('LoginForm', () => {
  it('should submit form with valid data', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ access_token: 'token', token_type: 'bearer' });
    vi.mocked(authApi.login).mockImplementation(mockLogin);

    render(LoginForm);
    
    await fireEvent.input(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    await fireEvent.input(screen.getByLabelText('Password'), { target: { value: 'Test@123' } });
    await fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'Test@123',
      });
    });
  });
});
```

---

#### 6.3 E2E Testing

**TR-TEST-010**: Use Playwright for E2E tests

**TR-TEST-011**: Test critical user flows:
- User registration
- User login
- Product browsing
- Add to cart
- Checkout process
- Order history

**TR-TEST-012**: Run E2E tests in CI/CD pipeline

**Example**:
```typescript
// tests/e2e/user-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('E-Commerce User Flow', () => {
  test('complete purchase flow', async ({ page }) => {
    // 1. Register
    await page.goto('/auth/register');
    await page.fill('[name="username"]', 'e2euser');
    await page.fill('[name="password"]', 'Test@123');
    await page.fill('[name="confirmPassword"]', 'Test@123');
    await page.click('button[type="submit"]');
    
    // 2. Login
    await page.goto('/auth/login');
    await page.fill('[name="username"]', 'e2euser');
    await page.fill('[name="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    
    // 3. Browse products
    await page.goto('/products');
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible();
    
    // 4. Add to cart
    await page.locator('[data-testid="product-card"]').first().locator('button:has-text("Add to Cart")').click();
    await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('1');
    
    // 5. Checkout
    await page.click('[data-testid="cart-icon"]');
    await page.click('button:has-text("Checkout")');
    await expect(page.locator('text=Order placed successfully')).toBeVisible();
    
    // 6. View order
    await page.goto('/orders');
    await expect(page.locator('[data-testid="order-item"]').first()).toBeVisible();
  });
});
```

---

## 📏 Non-Functional Requirements

### 1. Usability

**NFR-US-001**: Application shall be intuitive and require no training for basic operations

**NFR-US-002**: All actions shall provide immediate feedback (< 100ms perceived)

**NFR-US-003**: Error messages shall be clear and actionable

**NFR-US-004**: Application shall support keyboard navigation

**NFR-US-005**: Application shall support browser back/forward buttons

---

### 2. Reliability

**NFR-REL-001**: Application shall handle network failures gracefully

**NFR-REL-002**: Application shall retry failed API calls (max 3 attempts)

**NFR-REL-003**: Application shall maintain state during temporary disconnections

**NFR-REL-004**: Application shall recover from crashes without data loss (cart persistence)

---

### 3. Performance

**NFR-PERF-001**: Initial page load shall complete in < 3s (on 4G)

**NFR-PERF-002**: Page transitions shall be instantaneous (< 200ms)

**NFR-PERF-003**: Search results shall appear within 500ms

**NFR-PERF-004**: Bundle size shall not exceed 500KB (gzipped)

**NFR-PERF-005**: Application shall support 1000+ concurrent users (backend dependent)

---

### 4. Scalability

**NFR-SCAL-001**: Application shall handle 10,000+ products without performance degradation

**NFR-SCAL-002**: Application shall support pagination for all lists

**NFR-SCAL-003**: Application architecture shall support feature additions without refactoring

---

### 5. Maintainability

**NFR-MAIN-001**: Code shall follow consistent style guide (ESLint + Prettier)

**NFR-MAIN-002**: Components shall be modular and reusable

**NFR-MAIN-003**: All functions/components shall have JSDoc comments

**NFR-MAIN-004**: Application shall have comprehensive documentation

**NFR-MAIN-005**: Dependencies shall be kept up-to-date (monthly review)

---

### 6. Portability

**NFR-PORT-001**: Application shall work on modern browsers:
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

**NFR-PORT-002**: Application shall be deployable on:
- Docker containers
- Static hosting (Vercel, Netlify)
- Traditional web servers (Nginx)

---

## 🛠️ Development Standards

### 1. Code Style

**DEV-CS-001**: Use Prettier with provided config

**DEV-CS-002**: Use ESLint with Svelte plugin

**DEV-CS-003**: Enable TypeScript strict mode

**DEV-CS-004**: Use meaningful variable/function names

**DEV-CS-005**: Avoid abbreviations except common ones (id, url, api)

**DEV-CS-006**: Maximum function length: 50 lines

**DEV-CS-007**: Maximum file length: 300 lines

---

### 2. Git Workflow

**DEV-GIT-001**: Use Conventional Commits format

**DEV-GIT-002**: Create feature branches from `main`

**DEV-GIT-003**: Require PR reviews before merging

**DEV-GIT-004**: Squash commits on merge

**DEV-GIT-005**: Delete branches after merge

**Commit Format**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

### 3. Documentation

**DEV-DOC-001**: Maintain up-to-date README.md

**DEV-DOC-002**: Document all public APIs

**DEV-DOC-003**: Include inline comments for complex logic

**DEV-DOC-004**: Maintain CHANGELOG.md

**DEV-DOC-005**: Document environment variables

---

### 4. Component Standards

**DEV-COMP-001**: Components shall be single-responsibility

**DEV-COMP-002**: Props shall be typed and documented

**DEV-COMP-003**: Events shall be typed

**DEV-COMP-004**: Components shall handle own error states

**DEV-COMP-005**: Styles shall be scoped or use Tailwind

**Component Template**:
```svelte
<script lang="ts">
  /**
   * @component MyComponent
   * @description Brief description of what this component does
   */

  // Types
  interface Props {
    /** Description of prop */
    myProp: string;
    /** Optional prop with default */
    optional?: number;
  }

  // Props
  let { myProp, optional = 10 }: Props = $props();

  // State
  let localState = $state(0);

  // Derived
  let computed = $derived(localState * 2);

  // Functions
  function handleClick() {
    // Implementation
  }
</script>

<!-- Template -->
<div class="my-component">
  <!-- Content -->
</div>

<!-- Styles (if needed) -->
<style>
  /* Scoped styles */
</style>
```

---

## 🚀 Deployment Requirements

### 1. Environment Configuration

**DEP-ENV-001**: Support multiple environments:
- Development
- Staging
- Production

**DEP-ENV-002**: Use environment variables for configuration

**DEP-ENV-003**: Never commit secrets to repository

**DEP-ENV-004**: Document all required environment variables

---

### 2. Build Process

**DEP-BUILD-001**: Optimize bundle for production

**DEP-BUILD-002**: Generate source maps for debugging

**DEP-BUILD-003**: Minify CSS and JavaScript

**DEP-BUILD-004**: Compress assets (gzip/brotli)

**DEP-BUILD-005**: Generate static assets with cache busting

---

### 3. Docker Deployment

**DEP-DOCKER-001**: Use multi-stage build for optimal image size

**DEP-DOCKER-002**: Run as non-root user

**DEP-DOCKER-003**: Include health check endpoint

**DEP-DOCKER-004**: Use .dockerignore to exclude unnecessary files

**Dockerfile**:
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm@8 && pnpm install --frozen-lockfile

# Build application
COPY . .
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

### 4. CI/CD Pipeline

**DEP-CICD-001**: Automate testing on PR

**DEP-CICD-002**: Automate linting and formatting checks

**DEP-CICD-003**: Automate build on merge to main

**DEP-CICD-004**: Automate deployment to staging

**DEP-CICD-005**: Manual approval for production deployment

---

## ✅ Acceptance Criteria

### Phase 1: Core Features (MVP)

- [ ] User can register account
- [ ] User can login/logout
- [ ] User can browse products
- [ ] User can view product details
- [ ] User can add products to cart
- [ ] User can view cart
- [ ] User can update cart quantities
- [ ] User can remove items from cart
- [ ] User can checkout (create order)
- [ ] User can view order history
- [ ] User can view order details
- [ ] Application is responsive on mobile/tablet/desktop
- [ ] Application handles errors gracefully
- [ ] Application persists cart across sessions

### Phase 2: Enhanced Features

- [ ] User can search products
- [ ] User can filter products
- [ ] User can sort products
- [ ] Cart drawer/mini cart
- [ ] Real-time order updates via WebSocket
- [ ] Toast notifications for actions
- [ ] Loading states for all async operations
- [ ] Keyboard navigation support
- [ ] WCAG 2.1 AA compliance

### Phase 3: Advanced Features

- [ ] User profile management
- [ ] Password reset flow
- [ ] Social login (Google, GitHub)
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Order tracking
- [ ] PWA support (offline mode)
- [ ] Multiple language support (i18n)

---

## 📊 Definition of Done

A feature is considered complete when:

1. ✅ Code is written and follows style guide
2. ✅ Unit tests written and passing (> 70% coverage)
3. ✅ Component tests written and passing
4. ✅ E2E tests written and passing (if applicable)
5. ✅ Code reviewed and approved
6. ✅ Documentation updated
7. ✅ Accessibility requirements met
8. ✅ No console errors or warnings
9. ✅ Responsive on all breakpoints
10. ✅ Deployed to staging and tested

---

## 🔄 Change Management

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-10-18 | Cong Dinh | Initial requirements document |

### Change Request Process

1. Propose change in GitHub issue
2. Discuss with team
3. Update requirements document
4. Update version number
5. Communicate to stakeholders

---

## 📞 Contact & Support

**Project Owner**: Cong Dinh (@congdinh2008)

**Repository**: https://github.com/congdinh2008/python-micro

**Documentation**: See `/docs` folder

---

<div align="center">

**Requirements Specification v1.0.0**

Last Updated: October 18, 2025

[⬆ Back to Top](#-e-commerce-client---detailed-requirements-specification)

</div>
