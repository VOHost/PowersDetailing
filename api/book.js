const { kv } = require('@vercel/kv');

const ALLOWED_TIMES = ['8:00 AM', '11:00 AM', '2:00 PM', '5:00 PM'];

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const { date, time } = req.body || {};

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date.' });
  }
  if (!time || !ALLOWED_TIMES.includes(time)) {
    return res.status(400).json({ error: 'Invalid time.' });
  }

  const [y, m, d] = date.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  if (dow === 0) {
    return res.status(400).json({ error: 'Bookings are only available Monday through Saturday.' });
  }

  try {
    // SADD is atomic in Redis — returns 1 if newly added, 0 if already existed
    const added = await kv.sadd(`bookings:${date}`, time);
    if (added === 0) {
      return res.status(409).json({
        error: 'That time slot was just taken. Please choose another.'
      });
    }
    // Expire booking data after 120 days to keep storage clean
    await kv.expire(`bookings:${date}`, 60 * 60 * 24 * 120);
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Booking failed. Please try again.' });
  }
};
