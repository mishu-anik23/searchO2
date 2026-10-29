import { setCors } from '../lib/db.js';

export default async function handler(req, res) {
  if (setCors(req, res)) return;
  return res.status(200).json({ ok: true, message: 'Logged out successfully' });
}
