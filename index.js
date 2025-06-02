const https = require('https');

const CRON_SECRET = process.env.CRON_SECRET;
const API_HOST = 'mye-bay-sniper.vercel.app';

if (!CRON_SECRET) {
  console.error('CRON_SECRET is required');
  process.exit(1);
}

function callEndpoint(path, name) {
  const options = {
    hostname: API_HOST,
    path: path,
    method: 'GET',
    headers: {
      'x-cron-secret': CRON_SECRET,
      'User-Agent': 'MyeBaySniper-Cron/1.0'
    },
    timeout: 25000 // 25 second timeout
  };

  const req = https.get(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`[${new Date().toISOString()}] ${name}: ${res.statusCode} - ${data.substring(0, 100)}`);
    });
  });

  req.on('timeout', () => {
    console.error(`[${new Date().toISOString()}] ${name} timeout`);
    req.destroy();
  });

  req.on('error', err => {
    console.error(`[${new Date().toISOString()}] ${name} error:`, err.message);
  });
}

// Keep-alive to prevent cold starts
setInterval(() => {
  console.log(`[${new Date().toISOString()}] Heartbeat - Cron scheduler running`);
}, 60000); // Every minute

// Check snipes every 5 seconds
setInterval(() => {
  callEndpoint('/api/cron/check-snipes', 'Check snipes');
}, 5000);

// Check results every 2 minutes
setInterval(() => {
  callEndpoint('/api/cron/check-auction-results', 'Check results');
}, 120000);

// Run immediately on start
callEndpoint('/api/cron/check-snipes', 'Initial check');

console.log('✅ Cron scheduler started');
console.log(`📡 Calling https://${API_HOST}`);
console.log('⏰ Check snipes: every 5 seconds');
console.log('📊 Check results: every 2 minutes');
console.log('🔑 CRON_SECRET:', CRON_SECRET ? 'Set (' + CRON_SECRET.length + ' chars)' : 'NOT SET!');

// Restart on uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1); // Railway will auto-restart
});