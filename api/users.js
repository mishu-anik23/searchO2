import { getPool, setCors } from './lib/db.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;

  const url = new URL(req.url, 'http://localhost');
  const search = (url.searchParams.get('search') || '').trim();
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 200);
  const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
  const offset = (page - 1) * limit;

  try {
    const pool = getPool();
    let queryText = `
      SELECT 
        u.id, 
        u.email, 
        u.display_name, 
        u.role, 
        u.auth_provider, 
        u.created_at, 
        u.status, 
        u.last_login_at,
        u.whatsapp_phone,
        u.github_id,
        (u.password_hash IS NOT NULL) AS has_encrypted_password,
        f.name AS farm_name,
        f.money AS farm_money,
        f.total_o2 AS farm_total_o2
      FROM public.users u
      LEFT JOIN public.farms f ON f.user_id = u.id
    `;
    const params = [];

    if (search) {
      params.push('%' + search.toLowerCase() + '%');
      queryText += `
        WHERE LOWER(u.email) LIKE $1 
           OR LOWER(u.display_name) LIKE $1 
           OR u.whatsapp_phone LIKE $1
           OR CAST(u.id AS TEXT) LIKE $1
      `;
    }

    queryText += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(queryText, params);

    const countRes = await pool.query('SELECT COUNT(*) FROM public.users');
    const total = parseInt(countRes.rows[0].count, 10);

    return res.status(200).json({
      users: result.rows.map(r => ({
        id: r.id,
        email: r.email,
        display_name: r.display_name,
        displayName: r.display_name,
        role: r.role,
        auth_provider: r.auth_provider,
        authProvider: r.auth_provider,
        created_at: r.created_at,
        status: r.status,
        last_login_at: r.last_login_at,
        whatsapp_phone: r.whatsapp_phone,
        github_id: r.github_id,
        hasEncryptedPassword: r.has_encrypted_password,
        farmName: r.farm_name,
        farmMoney: r.farm_money,
        farmTotalO2: r.farm_total_o2
      })),
      total,
      page,
      limit
    });
  } catch (err) {
    console.error('Fetch users error:', err);
    return res.status(500).json({ error: 'Database users error: ' + err.message });
  }
}
