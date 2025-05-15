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
        return rows; 
    } catch (error) {
        console.error('Error fetching appointments:', error);
        throw error; // Rethrow the error for further handling
    }
};


export const getAppointmentsForHour = async () => {
    // Get current time and add one hour
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0); // Set to start of next hour
    const hourEnd = new Date(nextHour);
    hourEnd.setMinutes(59, 59, 999); // End of the hour

    // Convert to ISO strings for the query
    const hourStartISO = nextHour.toISOString();
    const hourEndISO = hourEnd.toISOString();

    // SQL query to fetch appointments in the next hour
    const query = `
        SELECT 
            u.idUser,
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
            p.StartDate BETWEEN ? AND ?`;

    try {
        // Execute the query
        const [rows] = await connection.execute(query, [hourStartISO, hourEndISO]);

        // Ensure rows is an array
        if (!Array.isArray(rows)) {
            throw new Error('Expected rows to be an array');
        }
        console.log('Next hour appointments:', rows);
        return rows;
    } catch (error) {
        console.error('Error fetching next hour appointments:', error);
        throw error;
    }
};