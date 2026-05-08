import 'dotenv/config';
// Using native fetch available in Node 18+

async function wipeUpstash() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.error('❌ Error: UPSTASH_REDIS_REST_URL or TOKEN not found in .env');
    return;
  }

  console.log('🚀 Connecting to Upstash at:', url);
  
  try {
    const response = await fetch(`${url}/flushdb`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Upstash Redis Cleared Successfully!', result);
    } else {
      console.error('❌ Failed to clear Upstash:', result);
    }
  } catch (err) {
    console.error('❌ Network Error:', err.message);
  }
}

wipeUpstash();
