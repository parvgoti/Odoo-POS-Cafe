#!/usr/bin/env node
/**
 * API & Integration Mastery — Quick API Tester (2026)
 * =====================================================
 * CLI tool for testing API endpoints fast.
 *
 * Usage:
 *   node api-tester.js GET https://api.example.com/health
 *   node api-tester.js POST https://api.example.com/users '{"name":"John"}'
 *   node api-tester.js GET https://api.example.com/users -H "Authorization: Bearer xxx"
 *   node api-tester.js --env .env GET /api/v1/users
 */

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  console.log(`
  🔧 API Tester — Quick endpoint testing

  Usage:
    node api-tester.js <METHOD> <URL> [BODY] [OPTIONS]

  Methods:  GET, POST, PUT, PATCH, DELETE, HEAD

  Options:
    -H "Header: Value"    Add custom header
    -t <ms>               Timeout (default: 10000)
    --json                Force JSON content-type
    --verbose             Show full request/response details
    --timing              Show timing breakdown

  Examples:
    node api-tester.js GET https://httpbin.org/get
    node api-tester.js POST https://httpbin.org/post '{"test": true}'
    node api-tester.js GET https://api.example.com/users -H "Authorization: Bearer TOKEN"
  `);
  process.exit(0);
}


// ============================================
// PARSE ARGUMENTS
// ============================================
let method = 'GET';
let url = '';
let body = null;
let headers = { 'Accept': 'application/json' };
let timeout = 10000;
let verbose = false;
let showTiming = false;

let i = 0;
while (i < args.length) {
  const arg = args[i];

  if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(arg.toUpperCase())) {
    method = arg.toUpperCase();
    i++;
    continue;
  }

  if (arg.startsWith('http://') || arg.startsWith('https://') || arg.startsWith('/')) {
    url = arg;
    i++;
    continue;
  }

  if (arg === '-H' && args[i + 1]) {
    const [key, ...valueParts] = args[i + 1].split(':');
    headers[key.trim()] = valueParts.join(':').trim();
    i += 2;
    continue;
  }

  if (arg === '-t' && args[i + 1]) {
    timeout = parseInt(args[i + 1]);
    i += 2;
    continue;
  }

  if (arg === '--json') {
    headers['Content-Type'] = 'application/json';
    i++;
    continue;
  }

  if (arg === '--verbose') {
    verbose = true;
    i++;
    continue;
  }

  if (arg === '--timing') {
    showTiming = true;
    i++;
    continue;
  }

  // Assume it's the request body
  if (arg.startsWith('{') || arg.startsWith('[')) {
    body = arg;
    headers['Content-Type'] = 'application/json';
    i++;
    continue;
  }

  i++;
}

if (!url) {
  console.error('❌ No URL provided');
  process.exit(1);
}


// ============================================
// EXECUTE REQUEST
// ============================================
async function run() {
  console.log(`\n  ${method} ${url}`);

  if (verbose) {
    console.log('  Headers:');
    Object.entries(headers).forEach(([k, v]) => {
      const displayValue = k.toLowerCase().includes('auth') ? v.slice(0, 20) + '...' : v;
      console.log(`    ${k}: ${displayValue}`);
    });
    if (body) console.log(`  Body: ${body.slice(0, 200)}`);
  }

  console.log('');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const config = {
    method,
    headers,
    signal: controller.signal,
  };

  if (body && !['GET', 'HEAD'].includes(method)) {
    config.body = body;
  }

  const startTime = performance.now();
  let dnsTime, connectTime, responseTime;

  try {
    const response = await fetch(url, config);
    responseTime = performance.now() - startTime;
    clearTimeout(timeoutId);

    // Status
    const statusColor = response.status < 300 ? '\x1b[32m'    // green
      : response.status < 400 ? '\x1b[33m'                     // yellow
      : '\x1b[31m';                                             // red
    const reset = '\x1b[0m';

    console.log(`  Status:  ${statusColor}${response.status} ${response.statusText}${reset}`);
    console.log(`  Time:    ${responseTime.toFixed(0)}ms`);

    // Response headers
    if (verbose) {
      console.log('  Response Headers:');
      response.headers.forEach((value, key) => {
        console.log(`    ${key}: ${value}`);
      });
    }

    // Specific headers of interest
    const rateLimit = response.headers.get('x-ratelimit-remaining');
    const retryAfter = response.headers.get('retry-after');
    const requestId = response.headers.get('x-request-id');

    if (rateLimit) console.log(`  Rate Limit Remaining: ${rateLimit}`);
    if (retryAfter) console.log(`  Retry After: ${retryAfter}s`);
    if (requestId) console.log(`  Request ID: ${requestId}`);

    // Body
    const contentType = response.headers.get('content-type') || '';
    let responseBody;

    if (contentType.includes('application/json')) {
      responseBody = await response.json();
      console.log('\n  Response Body:');
      console.log(indent(JSON.stringify(responseBody, null, 2)));
    } else {
      responseBody = await response.text();
      if (responseBody.length > 0) {
        console.log('\n  Response Body:');
        console.log(indent(responseBody.slice(0, 2000)));
        if (responseBody.length > 2000) {
          console.log(`\n  ... (${responseBody.length} total bytes)`);
        }
      }
    }

    // Timing breakdown
    if (showTiming) {
      console.log('\n  ⏱️  Timing:');
      console.log(`    Total:        ${responseTime.toFixed(0)}ms`);
      const size = response.headers.get('content-length');
      if (size) console.log(`    Content Size: ${formatBytes(parseInt(size))}`);
    }

    console.log('');

  } catch (err) {
    clearTimeout(timeoutId);
    const elapsed = performance.now() - startTime;

    if (err.name === 'AbortError') {
      console.log(`  ❌ TIMEOUT after ${timeout}ms`);
    } else {
      console.log(`  ❌ ERROR: ${err.message}`);
    }
    console.log(`  Time: ${elapsed.toFixed(0)}ms\n`);
    process.exit(1);
  }
}

function indent(text, spaces = 4) {
  const pad = ' '.repeat(spaces);
  return text.split('\n').map(line => pad + line).join('\n');
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

run();
