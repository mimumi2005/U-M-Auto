import mysql2 from "mysql2";

const connection  = mysql2.createConnection({
  
    host: "localhost",
    database: "CarRepairShop",
    user: "root",
    password: "root",
  });

  // Connect to MySQL
connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err.message);
      process.exit(1);
    }
    console.log('Connected to MySQL database.');
  });
  
  export default connection;