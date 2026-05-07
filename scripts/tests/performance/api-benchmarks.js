import { test } from 'node:test';
import assert from 'node:assert';
import { performance } from 'node:perf_hooks';

/**
 * API Performance Test Suite
 * 
 * This script measures the response times of the optimized Admin API endpoints.
 * 
 * Instructions:
 * 1. Ensure the backend server is running (e.g., http://localhost:5000)
 * 2. Set the ADMIN_EMAIL and ADMIN_PASSWORD environment variables or update the config below.
 * 3. Run with: node tests/performance/api-benchmarks.js
 */

const CONFIG = {
  BASE_URL: process.env.API_URL || 'http://localhost:5000/api',
  ADMIN_EMAIL: 'admin@gmail.com',
  ADMIN_PASSWORD: 'Abcd@123',
  REPEATS: 5, // Number of times to repeat each test for averaging
};

let accessToken = '';

async function login() {
  console.log(CONFIG.ADMIN_EMAIL,CONFIG.ADMIN_PASSWORD)
  console.log('Logging in to get access token...');
  
  const res = await fetch(`${CONFIG.BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: CONFIG.ADMIN_EMAIL, password: CONFIG.ADMIN_PASSWORD }),
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Login failed: ${err.error || res.statusText}`);
  }
  
  const data = await res.json();
  accessToken = data.accessToken;
  console.log('Login successful.\n');
}

async function measureRequest(label, url, options = {}) {
  const timings = [];
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    ...options.headers
  };

  console.log(`Measuring ${label}...`);
  
  for (let i = 0; i < CONFIG.REPEATS; i++) {
    const start = performance.now();
    const res = await fetch(`${CONFIG.BASE_URL}${url}`, { ...options, headers });
    const end = performance.now();
    
    if (!res.ok) {
      console.error(`  Iteration ${i+1}: Failed with status ${res.status}`);
      continue;
    }
    
    const data = await res.json();
    const duration = end - start;
    timings.push(duration);
    
    // On first run, report data size
    if (i === 0) {
      const size = JSON.stringify(data).length;
      console.log(`  Payload size: ${(size / 1024).toFixed(2)} KB`);
      if (data.properties) console.log(`  Items returned: ${data.properties.length}`);
    }
  }

  const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
  const min = Math.min(...timings);
  const max = Math.max(...timings);

  console.log(`  Avg: ${avg.toFixed(2)}ms | Min: ${min.toFixed(2)}ms | Max: ${max.toFixed(2)}ms\n`);
  
  return { avg, min, max };
}

async function runBenchmarks() {
  try {
    await login();

    // Adjusted thresholds to account for network latency to Firebase Cloud
    await test('Admin Stats Performance (Parallel Counts)', async () => {
      const result = await measureRequest('Admin Stats', '/admin/stats');
      assert.ok(result.avg < 1500, 'Stats should return in under 1.5s');
    });

    await test('Admin Properties Paginated (Page 1)', async () => {
      const result = await measureRequest('Admin Properties (limit=20)', '/admin/properties?limit=20');
      assert.ok(result.avg < 1500, 'Paginated list should return in under 1.5s');
    });

    await test('Admin Properties Search Performance', async () => {
      const result = await measureRequest('Admin Properties Search', '/admin/properties?q=a&limit=20');
      assert.ok(result.avg < 2000, 'Search should return in under 2s');
    });

    console.log('Benchmarks completed successfully.');
  } catch (err) {
    console.error('Benchmark suite failed:', err.message);
    process.exit(1);
  }
}

runBenchmarks();
