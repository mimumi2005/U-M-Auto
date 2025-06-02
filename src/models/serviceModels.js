import pool from "../config/db.js";

// Model to get project dates for a given month and year
export const getProjectDates = async (month, year) => {
  const sql_query = `
    SELECT StartDate, EndDateProjection 
    FROM projects 
    WHERE 
      (YEAR(StartDate) = ? AND MONTH(StartDate) = ?) OR 
      (YEAR(EndDateProjection) = ? AND MONTH(EndDateProjection) = ?) OR
      (StartDate < LAST_DAY(CONCAT(?, '-', ?, '-01')) AND EndDateProjection > LAST_DAY(CONCAT(?, '-', ?, '-01')))
  `;

  const [results] = await pool.query(sql_query, [
    year, month,
    year, month,
    year, month,
    year, month
  ]);
  return results;
};
