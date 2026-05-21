const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  const { date } = req.query;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date.' });
  }

  try {
    const booked = await kv.smembers(`bookings:${date}`);
    return res.json({ booked: booked || [] });
  } catch {
    return res.json({ booked: [] });
  }
};
