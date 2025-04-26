import pool from '../config/db.js';

export async function updateTenureForAllWorkers() {
  try {
    // Query all workers
    const [workers] = await pool.query('SELECT * FROM workers');

    for (const worker of workers) {
      // Calculate tenure
      const startWorkDate = new Date(worker.StartWorkDate);
      const currentDate = new Date();
      const tenure = currentDate.getFullYear() - startWorkDate.getFullYear();

      // Update tenure
      await pool.query('UPDATE workers SET tenure = ? WHERE idUser = ?', [tenure, worker.idUser]);

      console.log(`Tenure updated for worker with idUser ${worker.idUser}`);
    }
  } catch (err) {
    console.error('Error updating tenures:', err);
  }
}
