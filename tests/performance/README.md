# Performance Testing Guide

This folder contains test cases and scripts to measure the performance of the Real Estate application, specifically the admin dashboard and backend API.

## 1. API Benchmarks (`api-benchmarks.js`)

Measures the response times, payload sizes, and throughput of the optimized admin endpoints.

### How to Run:
1. Ensure the backend server is running locally (default: `http://localhost:5000`).
2. Update the `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the script if they differ from the defaults.
3. Run the following command from the project root:
   ```bash
   node tests/performance/api-benchmarks.js
   ```

### What it Measures:
- **Admin Stats**: Checks the response time of the optimized `/admin/stats` route (using Firestore field projections).
- **Admin Properties (Paginated)**: Checks the speed of fetching a single page (20 items) from the new paginated route.
- **Admin Properties Search**: Measures the speed of server-side searching through the property database.

## 2. Load Testing (`load-test.js`)

Simulates concurrent admin users to ensure the system handles multi-user traffic without significant degradation.

### How to Run:
```bash
node tests/performance/load-test.js
```

### Metrics:
- **Requests per Second (RPS)**: Throughput of the system.
- **P95 Latency**: The maximum time 95% of requests took to complete.

## 3. Frontend Performance (Manual/Lighthouse)

To test the frontend performance:
1. Run the production build: `npm run build` in the `frontend` folder.
2. Serve the `dist` folder using a static server (e.g., `npx serve dist`).
3. Open Chrome DevTools -> **Lighthouse** tab.
4. Run a "Navigation" report for "Desktop" and "Mobile".

**Key Benchmarks:**
- **LCP (Largest Contentful Paint)**: Should be < 2.5s.
- **TBT (Total Blocking Time)**: Should be < 300ms.
- **CLS (Cumulative Layout Shift)**: Should be < 0.1.

---

*Note: These tests are designed to run in a Node.js environment and do not require external testing frameworks.*
