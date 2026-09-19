# Warehouse Marketplace Backend

Node.js, Express & MongoDB (Mongoose) REST API.

## Core Features
1. **JWT Authentication & RBAC**: Customer, Manager, Admin role isolation.
2. **Geospatial Proximity Search**: `$nearSphere` queries over GeoJSON `Point` coordinates.
3. **Dynamic Overlap Booking Engine**: Evaluates peak capacity usage over overlapping date ranges using sweep-line event algorithm.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and adjust credentials:
```bash
cp .env.example .env
```

### 3. Start Database (MongoDB)
Ensure MongoDB is running locally on port `27017` or use Docker:
```bash
docker run -d -p 27017:27017 --name mongo mongo:7.0
```

### 4. Run Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## API Endpoints Overview
- `GET /api/v1/health` - Server health check
- `POST /api/v1/auth/register` - Create customer or manager account
- `POST /api/v1/auth/login` - Authenticate and obtain JWT
- `GET /api/v1/warehouses` - Geospatial & city search (`?longitude=..&latitude=..&radiusKm=25`)
- `GET /api/v1/warehouses/:id` - Warehouse details
- `GET /api/v1/bookings/warehouses/:id/availability` - Calculate availability for date range & quantity
- `POST /api/v1/bookings` - Create reservation
- `GET /api/v1/bookings/my-bookings` - Customer booking list
