// Netlify Function: /.netlify/functions/comments
// Requires env: MONGODB_URI (and optional MONGODB_DB, MONGODB_COLLECTION, ALLOWED_ORIGIN)
const { MongoClient } = require('mongodb');

let client;
async function getDb() {
  if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');
  if (!client) client = new MongoClient(process.env.MONGODB_URI);
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  const dbName = process.env.MONGODB_DB || 'qm_course_site';
  return client.db(dbName);
}

function headers() {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
}

exports.handler = async (event) => {
  const hdrs = headers();
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: hdrs, body: '' };
  }

  try {
    const db = await getDb();
    const col = db.collection(process.env.MONGODB_COLLECTION || 'discussion');

    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      const limit = Math.min(parseInt(params.limit || '200', 10) || 200, 500);
      const items = await col
        .find({}, { projection: { ip: 0 } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      return { statusCode: 200, headers: hdrs, body: JSON.stringify(items.map(({ _id, ...r }) => ({ id: String(_id), ...r }))) };
    }

    if (event.httpMethod === 'POST') {
      let body;
      try { body = JSON.parse(event.body || '{}'); } catch { body = {}; }
      const name = String(body.name || '').trim().slice(0, 80) || 'Anonymous';
      const emailRaw = String(body.email || '').trim().slice(0, 120);
      const email = emailRaw || undefined;
      const msg = String(body.msg || '').trim();
      if (!msg) return { statusCode: 400, headers: hdrs, body: JSON.stringify({ error: 'Message required' }) };
      if (msg.length > 5000) return { statusCode: 400, headers: hdrs, body: JSON.stringify({ error: 'Message too long' }) };
      const now = new Date();

      const ip = (event.headers['x-forwarded-for'] || '').split(',')[0].trim() || event.headers['client-ip'] || '';
      await col.createIndex({ ip: 1, createdAt: -1 });
      if (ip) {
        const last = await col.find({ ip }).sort({ createdAt: -1 }).limit(1).toArray();
        if (last[0] && now - new Date(last[0].createdAt) < 5000) {
          return { statusCode: 429, headers: hdrs, body: JSON.stringify({ error: 'Too many requests. Please wait a moment.' }) };
        }
      }

      const doc = { name, email, msg, createdAt: now, ip };
      const { insertedId } = await col.insertOne(doc);
      return { statusCode: 201, headers: hdrs, body: JSON.stringify({ id: String(insertedId), name, email, msg, createdAt: now }) };
    }

    return { statusCode: 405, headers: hdrs, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers: headers(), body: JSON.stringify({ error: 'Server error' }) };
  }
};

