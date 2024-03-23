// const sqlite3 = require('sqlite3').verbose();

// const db = new sqlite3.Database('sqlitecloud://admin:831411E6@nphirm81sk.sqlite.cloud:8860', (err) => {
//     if (err) {
//         console.error('Error opening database:', err.message);
//     } else {
//         console.log('Connected to the SQLite database.');
//     }
// });
// const RFID = "123"
// const query = `SELECT UserId FROM userrecord WHERE RFID ="${RFID}"`
// db.get(query, (err, row) => {
//     console.log(row)})
// let ids = [];
// let names = [];

// // Query the data and store in arrays
// db.serialize(() => {
//     const query = `SELECT DISTINCT a.FirstName,COUNT(b.UserId) AS TotalLate FROM userrecord AS a INNER JOIN Late AS b ON a.UserId = b.UserId GROUP BY a.FirstName ORDER BY TotalLate DESC`
//     db.each(query, (err, row) => {
//         if (err) {
//             console.error(err.message);
//         }
//         // Push id and name into their respective arrays
//         ids.push(row.FirstName);
//         names.push(row.TotalLate);
//     }, () => {
//         // Once all rows have been retrieved, log the arrays
//         console.log("IDs:", ids);
//         console.log("Names:", names);
//     });
// });

// // Close the database connection
// db.close();

// const date = new Date()
// console.log(date)
// const today = new Date();
//     const date = today.toISOString().slice(0, 10);

//     const query = 'SELECT COUNT(time) AS count FROM present WHERE time LIKE ?';
//     db.get(query, [`%${date}%`], (err, row) => {
//         if (err) {
//             console.error('Error querying database:', err);
//             res.status(500).json({ error: 'Internal Server Error' });
//         } else {
//             // Construct JSON response
//             const response = {
//                 date: date,
//                 count: row.count
//             };
//             res.json(response);
//         }
//     });
// const x = null
// if (!x){
//     console.log("asss")
// }
// Include SQLite3.js library (make sure to include it properly in your HTML)
// <script src="path/to/sqlite3.js"></script>

// Define connection information
const hostname = 'cqii9gu1sk.sqlite.cloud';
const port = '8860';
const username = 'admin';
const password = '831411E6';
const databaseName = 'Data.db';

// Construct connection string
const connectionString = `sqlite:///${databaseName}?host=${hostname}&port=${port}&username=${username}&password=${password}`;

// Create a new SQLite database connection
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(connectionString, (err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
  } else {
    console.log('Connected to the database.');
    // Now you can execute your queries or perform other database operations
  }
});

