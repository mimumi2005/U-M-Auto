import pool from '../config/db.js';

export const getUserAppointments = async (UUID) => {
    const getUserIDQuery = 'SELECT idUser FROM user_instance WHERE idInstance = ?';
    const [userResults] = await pool.query(getUserIDQuery, [UUID]);

    if (userResults.length === 0) {
        throw new Error('User not found');
    }

    const idUser = userResults[0].idUser;

    const getProjectsQuery = `
        SELECT projects.*, users.UserName 
        FROM projects 
        JOIN users ON projects.idUser = users.idUser 
        WHERE projects.idUser = ?
    `;
    const [projects] = await pool.query(getProjectsQuery, [idUser]);
    return projects;
};

export const getProjectDates = async (MonthSelected, YearSelected) => {
    const sql_query = `
        SELECT StartDate, EndDateProjection 
        FROM projects 
        WHERE 
          (YEAR(StartDate) = ? AND MONTH(StartDate) = ?) OR 
          (YEAR(EndDateProjection) = ? AND MONTH(EndDateProjection) = ?) OR
          (StartDate < LAST_DAY(CONCAT(?, '-', ?, '-01')) AND EndDateProjection > LAST_DAY(CONCAT(?, '-', ?, '-01')))
    `;
    const [results] = await pool.query(sql_query, [
        YearSelected, MonthSelected,
        YearSelected, MonthSelected,
        YearSelected, MonthSelected,
        YearSelected, MonthSelected
    ]);
    return results;
};
