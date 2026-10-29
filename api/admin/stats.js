import { getPool, setCors } from '../lib/db.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  try {
    const pool = getPool();
    const usersRes = await pool.query('SELECT role FROM public.users');
    const users = usersRes.rows || [];

    let farmsCount = 0;
    try {
      const farmsRes = await pool.query('SELECT COUNT(*) FROM public.farms');
      farmsCount = parseInt(farmsRes.rows[0].count, 10);
    } catch(e){}

    const stats = {
      totalUsers: users.length,
      totalGuests: users.filter(u => u.role === 'guest').length,
      totalRegistered: users.filter(u => u.role === 'user').length,
      totalAdmins: users.filter(u => u.role === 'admin').length,
      totalFarmsCount: farmsCount,
      activeSessionsCount: 1
    };

    return res.status(200).json(stats);
  } catch(err) {
    return res.status(500).json({ error: 'Stats error: ' + err.message });
  }
}
