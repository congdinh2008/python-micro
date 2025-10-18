# E-Commerce Client Application

A modern, production-ready e-commerce frontend built with Svelte 5.5, SvelteKit 2.0, and Clean Architecture principles.

## 🎯 Features

### User Registration Module
- **Enhanced Validation**: Real-time form validation with Zod
  - Username: 3-50 characters, alphanumeric + underscore
  - Password: ≥8 characters, uppercase, special character, not matching username
  - Confirm password validation
- **Clean Architecture**: Separated Domain, Application, Infrastructure, and Presentation layers
- **Security**: XSS prevention, secure API communication, HTTPS ready
- **Accessibility**: WCAG AA compliant, keyboard navigation, ARIA labels
- **Error Handling**: Comprehensive error categorization (validation, network, server)
- **User Experience**: Debounced validation (300ms), loading states, success messages

## 🏗️ Architecture

This application follows **Clean Architecture** principles:

```
src/
├── lib/
│   ├── domain/              # Business entities and rules
│   │   ├── entities/        # Domain entities (User, Product, Order)
│   │   ├── validation/      # Validation schemas (Zod)
│   │   └── interfaces/      # Repository interfaces
│   ├── application/         # Use cases and business logic
│   │   └── usecases/        # Application use cases
│   ├── infrastructure/      # External interfaces
│   │   ├── api/            # HTTP client and API communication
│   │   └── repositories/   # Repository implementations
│   └── presentation/        # UI components
│       └── components/      # Svelte components
│           ├── ui/         # Reusable UI components
│           └── auth/       # Authentication components
└── routes/                  # SvelteKit routes
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (LTS)
- npm or pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` to set your API service URLs:
```env
VITE_USER_SERVICE_URL=http://localhost:8001
VITE_PRODUCT_SERVICE_URL=http://localhost:8002
VITE_ORDER_SERVICE_URL=http://localhost:8003
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 🧪 Testing

### Run all tests:
```bash
npm test
```

### Run tests in watch mode:
```bash
npm run test:watch
```

### Run tests with coverage:
```bash
npm test -- --coverage
```

## 🎨 Code Style

This project uses ESLint and Prettier for code quality:

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run check
```

## 📦 Project Structure

```
app/
├── src/
│   ├── lib/                 # Library code
│   │   ├── domain/          # Domain layer
│   │   ├── application/     # Application layer
│   │   ├── infrastructure/  # Infrastructure layer
│   │   └── presentation/    # Presentation layer
│   ├── routes/              # SvelteKit routes
│   ├── app.css              # Global styles
│   ├── app.html             # HTML template
│   └── app.d.ts             # Type definitions
├── static/                  # Static assets
├── tests/                   # Test files
├── package.json
├── svelte.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🔐 Security

### Implemented Security Measures

1. **Input Validation**: All user inputs validated client-side and server-side
2. **XSS Prevention**: Svelte's automatic escaping + content sanitization
3. **HTTPS**: Application ready for HTTPS deployment
4. **Token Security**: JWT tokens stored securely in localStorage
5. **Error Handling**: Safe error messages without exposing system details
6. **CORS**: Proper CORS configuration for API calls
7. **Rate Limiting**: Client-side debouncing to prevent abuse

### Security Checklist (OWASP ASVS)

- ✅ V1: Architecture, Design and Threat Modeling
- ✅ V2: Authentication
- ✅ V5: Validation, Sanitization and Encoding
- ✅ V7: Error Handling and Logging
- ✅ V8: Data Protection
- ✅ V14: Configuration

## ♿ Accessibility

This application meets **WCAG 2.1 Level AA** standards:

- ✅ Semantic HTML elements
- ✅ ARIA labels and roles
- ✅ Keyboard navigation (Tab, Enter, Esc)
- ✅ Focus indicators
- ✅ Color contrast ratios (4.5:1 for text)
- ✅ Alt text for images
- ✅ Form labels and error messages
- ✅ Screen reader support

## 📊 Test Coverage

Target: >85% coverage for validation and business logic

Current coverage areas:
- ✅ Validation schemas (100%)
- ✅ Use cases (100%)
- ✅ Repository interfaces
- ✅ API client error handling

## 🔄 API Integration

### User Service API

**Base URL**: `http://localhost:8001`

**Endpoints**:
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /validate-token` - Validate JWT token

### Error Handling

The application handles three types of errors:

1. **Validation Errors** (400, 422): Invalid input, displayed inline with fields
2. **Network Errors**: Connection issues, displayed with retry option
3. **Server Errors** (500+): Server problems, displayed with generic message

## 🎯 Features Roadmap

### ✅ Implemented
- User registration with enhanced validation
- Clean Architecture structure
- Comprehensive error handling
- Accessibility features
- Unit tests for domain and application layers

### 🔄 In Progress
- User login
- Token management
- Auth guards

### 📋 Planned
- Product catalog
- Shopping cart
- Order management
- User profile
- Password reset
- Real-time notifications

## 🛠️ Technology Stack

- **Framework**: SvelteKit 2.0
- **UI Library**: Svelte 5.5 (with Runes)
- **Language**: TypeScript 5.7
- **Styling**: TailwindCSS 3.4
- **Validation**: Zod 3.24
- **HTTP Client**: Axios 1.7
- **Testing**: Vitest 2.1
- **Build Tool**: Vite 6.0

## 📝 Contributing

1. Follow Clean Architecture principles
2. Write tests for new features
3. Ensure accessibility compliance
4. Use ESLint and Prettier
5. Update documentation

## 📄 License

This project is part of the python-micro repository.

## 👥 Authors

- Cong Dinh (@congdinh2008)

## 🔗 Related Documentation

- [Project Requirements](../REQUIREMENTS.md)
- [Backend Services](../../server/)
- [Deployment Guide](../../DEPLOYMENT.md)
