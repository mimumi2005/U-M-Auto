import pool from '../config/db.js';

export const getUserAppointments = async (UUID) => {
    const getUserIDQuery = 'SELECT idUser FROM user_instance WHERE idInstance = ?';
    const [userResults] = await pool.query(getUserIDQuery, [UUID]);

    if (userResults.length === 0) {
        throw new Error('User not found');
    }

    const idUser = userResults[0].idUser;

    const getProjectsQuery = `
        SELECT projects.*, users.UserName, project_status.statusName
        FROM projects 
        JOIN users ON projects.idUser = users.idUser
        JOIN project_status ON projects.idStatus = project_status.idStatus
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

export const cancelAppointment = async (idProjects) => {
    const [result] = await pool.query(
        `UPDATE projects 
       SET idStatus = (SELECT idStatus FROM project_status WHERE statusName = 'Cancelled' LIMIT 1) 
       WHERE idProjects = ?`,
        [idProjects]
    );
    return result;
};