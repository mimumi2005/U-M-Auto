// appointmentsModel.js
import connection from '../config/email.js';

export const getAppointmentsForTomorrow = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
    const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999));
    const tomorrowStartISO = tomorrowStart.toISOString();
    const tomorrowEndISO = tomorrowEnd.toISOString();

    // SQL query to fetch appointments along with user details
    const query = `
        SELECT 
            u.Username,
            u.Email,
            p.StartDate,
            p.EndDateProjection,
            p.ProjectInfo
        FROM 
            projects p
        JOIN 
            users u ON p.idUser = u.idUser
        WHERE 
            p.StartDate BETWEEN ? AND ?`; // Use StartDate to check for tomorrow's appointments

    try {
        // Execute the query
        const [rows] = await connection.execute(query, [tomorrowStartISO, tomorrowEndISO]);

        // Ensure rows is an array
        if (!Array.isArray(rows)) {
            throw new Error('Expected rows to be an array');
        }
        console.log(rows);
        return rows; // Return the fetched rows
    } catch (error) {
        console.error('Error fetching appointments:', error);
        throw error; // Rethrow the error for further handling
    }
};
