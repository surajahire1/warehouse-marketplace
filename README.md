# Warehouse Booking & Management Marketplace

An on-demand B2B/B2C marketplace connecting businesses in need of storage with warehouse operators. 

## Features
- **Geospatial Warehouse Search**: Find storage near any city or coordinates using MongoDB `2dsphere` queries.
- **Dynamic Overlapping Booking Engine**: Fractional and total capacity reservation across custom date ranges.
- **3 Role Ecosystem**: Customer (Renter), Warehouse Manager (Host), and Super Admin.
- **KYC Verification**: Tiered compliance and listing verification.
- **Modern Tech Stack**: Node.js + Express + Mongoose backend and Angular 17/18+ (Standalone, Signals) frontend.

## Architecture
- `backend/`: Node.js, Express, MongoDB (Mongoose), JWT, Zod.
- `frontend/`: Modern Angular (Standalone Components, Signals, Core/Shared/Features architecture).
- `docker-compose.yml`: Multi-container local development with MongoDB.
