import pool from '../config/db.js';

export async function attachUser(req, res, next) {
  if (!req.session || !req.session.userId) {
    return next(); // No session, move on
  }

  try {
    const [userInstanceResults] = await pool.query(
      `SELECT 
         ui.idInstance, 
         u.idUser, 
         u.Username, 
         u.email,
         a.idUser AS isAdmin,
         w.idUser AS isWorker
       FROM users u
       LEFT JOIN user_instance ui ON u.idUser = ui.idUser
       LEFT JOIN administrators a ON u.idUser = a.idUser
       LEFT JOIN workers w ON u.idUser = w.idUser
       WHERE u.idUser = ?`,
      [req.session.userId]
    );

    const user = userInstanceResults[0];

    if (!user || !user.idInstance) {
      req.session.destroy(() => {
        return res.redirect('/?sessionEnded=true');
      });
    } else {
      req.user = {
        id: user.idUser,
        username: user.Username,
        email: user.email,
        UUID: user.idInstance,
        isAdmin: !!user.isAdmin,
        isWorker: !!user.isWorker
      };
      next();
    }

  } catch (err) {
    console.error('Error in attachUser middleware:', err);
    return res.status(500).send('Internal Server Error');
  }
}
