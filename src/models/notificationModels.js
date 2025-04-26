import pool from '../config/db.js';

export const getNotificationSettings = async (userId) => {
    const query = 'SELECT * FROM notification_settings WHERE idUser = ?';
    const [results] = await pool.query(query, [userId]);

    if (results.length === 0) {
        return {
            deal_notifications: 'None',
            appointment_reminders: 'None'
        };
    }

    return results[0];
};

export const updateNotificationSettings = async (userId, dealNotifications, appointmentReminders) => {
    // First check if settings exist
    const checkQuery = 'SELECT 1 FROM notification_settings WHERE idUser = ?';
    const [checkResult] = await pool.query(checkQuery, [userId]);

    if (checkResult.length > 0) {
        // Settings exist — update
        const updateQuery = `
            UPDATE notification_settings 
            SET deal_notifications = ?, appointment_reminders = ?
            WHERE idUser = ?
        `;
        const [updateResult] = await pool.query(updateQuery, [dealNotifications, appointmentReminders, userId]);
        return updateResult;
    } else {
        // No settings — insert
        const insertQuery = `
            INSERT INTO notification_settings (idUser, deal_notifications, appointment_reminders)
            VALUES (?, ?, ?)
        `;
        const [insertResult] = await pool.query(insertQuery, [userId, dealNotifications, appointmentReminders]);
        return insertResult;
    }
};
