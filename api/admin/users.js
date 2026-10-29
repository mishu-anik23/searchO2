import usersHandler from '../users.js';

export default async function handler(req, res) {
  return usersHandler(req, res);
}
