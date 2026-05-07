import { performance } from 'node:perf_hooks';

/**
 * Basic Load Test
 * 
 * Simulates multiple concurrent admin users hitting the dashboard.
 */

const CONFIG = {
  BASE_URL: process.env.API_URL || 'http://localhost:5000/api',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@example.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  CONCURRENCY: 10, // Number of concurrent users
  TOTAL_REQUESTS: 100, // Total requests to fire
};

let accessToken = '';

async function login() {
  const res = await fetch(`${CONFIG.BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: CONFIG.ADMIN_EMAIL, password: CONFIG.ADMIN_PASSWORD }),
  });
  const data = await res.json();
  accessToken = data.accessToken;
}

async function sendRequest() {
  const start = performance.now();
  const res = await fetch(`${CONFIG.BASE_URL}/admin/properties?limit=20`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const end = performance.now();
  return res.ok ? end - start : null;
}

async function runLoadTest() {
  try {
    await login();
    console.log(`Starting load test with ${CONFIG.CONCURRENCY} concurrent users...`);
    
    const startTime = performance.now();
    const latencies = [];
    let completed = 0;

    const workers = Array.from({ length: CONFIG.CONCURRENCY }, async () => {
      while (completed < CONFIG.TOTAL_REQUESTS) {
        completed++;
        const latency = await sendRequest();
        if (latency !== null) latencies.push(latency);
      }
    });

    await Promise.all(workers);
    const endTime = performance.now();
    const totalDuration = (endTime - startTime) / 1000;

    latencies.sort((a, b) => a - b);
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const rps = latencies.length / totalDuration;

    console.log('\n--- Load Test Results ---');
    console.log(`Total Requests: ${latencies.length}`);
    console.log(`Total Duration: ${totalDuration.toFixed(2)}s`);
    console.log(`Throughput:     ${rps.toFixed(2)} req/sec`);
    console.log(`Avg Latency:    ${avg.toFixed(2)}ms`);
    console.log(`P95 Latency:    ${p95.toFixed(2)}ms`);
    console.log('-------------------------\n');

  } catch (err) {
    console.error('Load test failed:', err.message);
  }
}

runLoadTest();
