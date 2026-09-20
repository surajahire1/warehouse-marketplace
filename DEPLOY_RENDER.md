# 🚀 Deploying Warehouse Marketplace on Render (Step-by-Step Guide)

This guide walks you through deploying both the **Node.js/Express backend** and the **Angular 18 frontend** to [Render.com](https://render.com) using free-tier services and a cloud MongoDB Atlas database.

---

## 📋 Prerequisites Checklist

1. A **GitHub account** with this repository pushed (`https://github.com/surajahire1/warehouse-marketplace`).
2. A free **[Render.com](https://render.com)** account.
3. A free **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)** account (Render free tier does not host persistent MongoDB).

---

## Step 1: Set Up Free Cloud MongoDB (MongoDB Atlas)

1. Go to **[mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)** and sign in.
2. Click **Create a Deployment** and choose the **M0 Free** cluster (Shared, 512MB free forever).
3. Under **Security Quickstart**:
   - **Username & Password**: Create a database user (e.g. username: `admin`, password: `YourStrongPassword123`). Save these credentials!
   - **IP Access List**: Select **Allow Access from Anywhere** (`0.0.0.0/0`) so Render servers can connect.
4. Click **Create User** and **Finish and Close**.
5. Click **Connect** $\rightarrow$ **Drivers** (Node.js).
6. Copy your connection string. It looks like:
   ```
   mongodb+srv://admin:YourStrongPassword123@cluster0.xxxxx.mongodb.net/warehouse_db?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your real password and ensure the database name is `/warehouse_db` before the `?`)*.

---

## Step 2: Deploy using Render Blueprint (Recommended - 1 Click)

Render reads our included [`render.yaml`](./render.yaml) file to automatically provision both the Backend Web Service and Frontend Static Site with optimal settings, SPA route rewrites, and build commands.

1. Go to your **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** in the top-right corner and select **Blueprint**.
3. Connect your GitHub repository: `warehouse-marketplace`.
4. Render will detect `render.yaml` and display two services:
   - `warehouse-marketplace-backend` (Web Service)
   - `warehouse-marketplace-frontend` (Static Site)
5. Fill in the required environment variables prompted on screen:
   - **MONGO_URI**: Paste your MongoDB Atlas connection string from Step 1.
   - **CLIENT_URL**: You can leave this blank initially or enter `*`. Once the frontend finishes deploying, you can update it to your frontend URL (e.g., `https://warehouse-marketplace-frontend.onrender.com`).
   - **RAZORPAY_KEY_ID** & **RAZORPAY_KEY_SECRET**: (Optional test keys `rzp_test_warehousespace` / `rzp_test_secret_key_12345`).
6. Click **Apply**.
7. Render will automatically build and deploy both services!

---

## Step 3: Alternative Manual Deployment (If not using Blueprint)

### A. Deploy Backend Web Service
1. On Render, click **New +** $\rightarrow$ **Web Service**.
2. Connect your repo and configure:
   - **Name**: `warehouse-marketplace-backend`
   - **Region**: Oregon (or nearest)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/v1/health`
3. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGO_URI` | *Your Atlas connection string* |
   | `JWT_SECRET` | *A long random secret string (32+ chars)* |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | `*` (or your frontend onrender.com URL) |
   | `PLATFORM_COMMISSION_PERCENT` | `10` |
4. Click **Create Web Service**. Copy the generated URL (e.g. `https://warehouse-marketplace-backend.onrender.com`).

---

### B. Deploy Frontend Static Site
1. On Render, click **New +** $\rightarrow$ **Static Site**.
2. Connect your repo and configure:
   - **Name**: `warehouse-marketplace-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && node scripts/set-env.js && npm run build`
   - **Publish Directory**: `dist/warehouse-marketplace-frontend/browser`
3. Under **Redirects / Rewrites**:
   - Add rule:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
   *(This is crucial for Angular client-side routes like `/warehouses`, `/customer/inquiries`, etc.)*
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `API_URL` | `https://warehouse-marketplace-backend.onrender.com/api/v1` *(Replace with your backend Render URL)* |
5. Click **Create Static Site**.

---

## 🎯 Step 4: Verify & Seed Data

1. **Automatic Database Seeding**:
   - When the backend starts up for the first time, it automatically connects to MongoDB Atlas and seeds **16 Pan-India logistics facilities** and default manager credentials!
2. **Default Accounts**:
   - **Host / Manager**: `palmbee@gmail.com` (Password: `password123`) or `manager@example.com` (Password: `password123`)
   - **Customer**: `customer@example.com` (Password: `password123`) or register a new customer account directly on the live website.
3. **Backend Health Check**:
   - Visit `https://<your-backend>.onrender.com/` in your browser. You will see:
     ```json
     {
       "success": true,
       "service": "Warehouse Marketplace API",
       "status": "operational",
       "environment": "production",
       "version": "1.0.0"
     }
     ```

---

## 💡 Render Free Tier Notes

- **Cold Starts**: Render free Web Services spin down after 15 minutes of inactivity. The first request after sleep may take ~30-50 seconds to spin up.
- **CORS Support**: The backend automatically permits `*.onrender.com` domains, preventing any CORS blocking out-of-the-box.
- **Continuous Deployment**: Whenever you push commits to GitHub `main`, Render automatically triggers a new zero-downtime deployment.
