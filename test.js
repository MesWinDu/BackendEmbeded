const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('Data.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});
const RFID = "123"
const query = `SELECT UserId FROM userrecord WHERE RFID ="${RFID}"`
db.get(query, (err, row) => {
    console.log(row)})
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
