const { kv } = require('@vercel/kv');

const ALLOWED_TIMES = ['8:00 AM', '11:00 AM', '2:00 PM', '5:00 PM'];

// Simple admin cancel — requires a secret token so only Joshua can release slots.
// Call with: POST /api/cancel  { date, time, token }
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { date, time, token } = req.body || {};

  if (token !== process.env.CANCEL_SECRET) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date.' });
  }
  if (!time || !ALLOWED_TIMES.includes(time)) {
    return res.status(400).json({ error: 'Invalid time.' });
  }

  try {
    await kv.srem(`bookings:${date}`, time);
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Could not release slot.' });
  }
};
