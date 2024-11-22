import connection from '../config/db.js';

export const getNotificationSettings = (userId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM notification_settings WHERE idUser = ?';
        connection.query(query, [userId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results[0]); // Return first matching record
            }
        });
    });
};

export const updateNotificationSettings = (userId, dealNotifications, appointmentReminders) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE notification_settings SET deal_notifications = ?, appointment_reminders = ? WHERE idUser = ?';
        connection.query(query, [dealNotifications, appointmentReminders, userId], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};