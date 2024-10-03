import connection from '../config/db.js';


// Function to fetch projects by user ID
export const getUserAppointments = (UUID) => {
    return new Promise((resolve, reject) => {
        // Query to get the user ID from the UUID
        const getUserIDQuery = 'SELECT idUser FROM user_instance WHERE idInstance = ?';
    
        connection.query(getUserIDQuery, [UUID], (err, results) => {
          if (err) {
            console.error('Error fetching user ID from UUID:', err);
            return reject(err);
          }
    
          if (results.length === 0) {
            return reject(new Error('User not found'));
          }
    
          const idUser = results[0].idUser;
          console.log(`User ID for UUID ${UUID}: ${idUser}`);
    
          // Now query the projects table with the idUser
          const getProjectsQuery = 'SELECT projects.*, users.UserName FROM projects JOIN users ON projects.idUser = users.idUser WHERE projects.idUser = ?';
    
          connection.query(getProjectsQuery, [idUser], (err, projects) => {
            if (err) {
              console.error('Error fetching projects for user:', err);
              return reject(err);
            }
    
            // Return the projects to the caller
            resolve(projects);
          });
        });
      });
    };

    export const getProjectDates = (MonthSelected, YearSelected, callback) => {
      const sql_query = 'SELECT StartDate, EndDateProjection FROM projects WHERE (month(StartDate) = ? OR month(EndDateProjection) = ?) AND (year(StartDate) = ? OR year(EndDateProjection) = ?)';
      connection.query(sql_query, [MonthSelected, MonthSelected, YearSelected, YearSelected], callback);
    };
    