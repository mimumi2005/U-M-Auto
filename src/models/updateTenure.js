
import connection from '../config/db.js'; // Importing connection
// Function for updating tenure automatically
export function updateTenureForAllWorkers() {
    // Query all workers from the database
    const getAllWorkersQuery = 'SELECT * FROM workers';
    connection.query(getAllWorkersQuery, (err, workers) => {
      if (err) {
        console.error('Error fetching workers:', err);
        return;
      }
      // Iterate through each worker
      workers.forEach(worker => {
        // Calculate tenure based on StartWorkDate
        const startWorkDate = new Date(worker.StartWorkDate);
        const currentDate = new Date();
        const tenure = currentDate.getFullYear() - startWorkDate.getFullYear();
        // Update tenure in the database
        const updateTenureQuery = 'UPDATE workers SET tenure = ? WHERE idUser = ?';
        connection.query(updateTenureQuery, [tenure, worker.idUser], (updateErr, updateResult) => {
          if (updateErr) {
            console.error('Error updating tenure:', updateErr);
            return;
          }
          console.log(`Tenure updated for worker with idUser ${worker.idUser}`);
        });
      });
    });
  }