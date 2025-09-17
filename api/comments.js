// Vercel serverless function: /api/comments
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

function cors(res) {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const db = await getDb();
    const col = db.collection(process.env.MONGODB_COLLECTION || 'discussion');

    if (req.method === 'GET') {
      const limit = Math.min(parseInt((req.query?.limit || '200'), 10) || 200, 500);
      const items = await col
        .find({}, { projection: { ip: 0 } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      res.status(200).json(items.map(({ _id, ...r }) => ({ id: String(_id), ...r })));
      return;
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
      }
      const name = String(body.name || '').trim().slice(0, 80) || 'Anonymous';
      const emailRaw = String(body.email || '').trim().slice(0, 120);
      const email = emailRaw || undefined;
      const msg = String(body.msg || '').trim();
      if (!msg) { res.status(400).json({ error: 'Message required' }); return; }
      if (msg.length > 5000) { res.status(400).json({ error: 'Message too long' }); return; }
      const now = new Date();

      // naive rate limit per IP: 1 post / 5s
      const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '';
      await col.createIndex({ ip: 1, createdAt: -1 });
      if (ip) {
        const last = await col.find({ ip }).sort({ createdAt: -1 }).limit(1).toArray();
        if (last[0] && now - new Date(last[0].createdAt) < 5000) {
          res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
          return;
        }
      }

      const doc = { name, email, msg, createdAt: now, ip };
      const { insertedId } = await col.insertOne(doc);
      res.status(201).json({ id: String(insertedId), name, email, msg, createdAt: now });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

