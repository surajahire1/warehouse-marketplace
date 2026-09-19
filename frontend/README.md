# Warehouse Marketplace Frontend (Angular 18+)

Modern, standalone-first Angular application with Signals and feature-driven architecture.

## Architecture
- **Standalone Components**: Zero `NgModule` overhead.
- **Signals**: Modern reactive state management in `AuthService` (`signal`, `computed`).
- **Core / Features / Shared**:
  - `core/`: Singleton services, functional HTTP interceptors (`auth.interceptor.ts`), and functional route guards (`auth.guard.ts`, `role.guard.ts`).
  - `features/`: Domain routes (`public`, `auth`, `customer`, `manager`, `admin`).
  - `shared/`: Reusable widgets (`capacity-gauge`, `status-badge`, `navbar`).

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npm start
# or ng serve
```
App runs at `http://localhost:4200/`. Proxies API calls to `http://localhost:5000/api/v1`.

### 3. Build for Production
```bash
npm run build
```
Build output is generated in `dist/warehouse-marketplace-frontend/`.
