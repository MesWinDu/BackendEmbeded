const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cors());


// Define a route that responds to GET requests to the root URL
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Define a route that responds to POST requests to the /api endpoint
app.post('/api', (req, res) => {
    res.json({ message: 'Received POST request' });
});

app.get("/api/fetchdata", (req, res) => {
    let FirstName = [];
    let Total = [];
    const db = new sqlite3.Database('Data.db', (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            db.serialize(() => {
                const query = `SELECT DISTINCT a.FirstName, COUNT(b.UserId) AS TotalLate FROM userrecord AS a INNER JOIN Present AS b ON a.UserId = b.UserId WHERE b.IsLate = 1 GROUP BY a.FirstName ORDER BY TotalLate DESC `;

                db.each(query, (err, row) => {
                    if (err) {
                        console.error(err.message);
                    }

                    // Push id and name into their respective arrays
                    FirstName.push(row.FirstName);
                    Total.push(row.TotalLate);
                }, () => {
                    // Once all rows have been retrieved, send the response
                    res.json({ "FirstName": FirstName, "Total": Total });
                    console.log("Data sent:", FirstName, Total);

                    // Close the database connection
                    db.close();
                    console.log("DB connection closed");
                });
            });
        }
    });
});
app.get("/api/fetchdataabsent", (req, res) => {
    let FirstName = [];
    let TotalAbsent = [];
    const db = new sqlite3.Database('Data.db', (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            db.serialize(() => {
                const query = `SELECT DISTINCT a.FirstName, COUNT(b.UserId) AS TotalAbsent FROM userrecord AS a INNER JOIN Absent AS b ON a.UserId = b.UserId GROUP BY a.FirstName ORDER BY TotalAbsent DESC`;

                db.each(query, (err, row) => {
                    if (err) {
                        console.error(err.message);
                    }
                    console.log(row)
                    // Push id and name into their respective arrays
                    FirstName.push(row.FirstName);
                    TotalAbsent.push(row.TotalAbsent);
                }, () => {
                    // Once all rows have been retrieved, send the response
                    res.json({ "FirstName": FirstName, "Total": TotalAbsent });
                    console.log("Data sent:", FirstName, TotalAbsent);

                    // Close the database connection
                    db.close();
                    console.log("DB connection closed");
                });
            });
        }
    });
});

app.get("/api/fetchdatapresenint", (req, res) => {
    let counts = [];
    let intervals = [];
    const db = new sqlite3.Database('Data.db', (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            db.serialize(() => {
                const query = `SELECT a.start||'-'|| a.end AS interval
                ,COUNT(b.time) AS count
                FROM intervals AS a LEFT JOIN present AS b 
                ON SUBSTRING(b.time, 12, 5)  >= a.start
                AND SUBSTRING(b.time, 12, 5) < a.end
                GROUP BY interval
                ORDER BY a.start;`;

                db.each(query, (err, row) => {
                    if (err) {
                        console.error(err.message);
                    }
                    console.log(row)
                    // Push id and name into their respective arrays
                    intervals.push(row.interval);
                    counts.push(row.count);
                }, () => {
                    // Once all rows have been retrieved, send the response
                    res.json({ "FirstName": intervals, "Total": counts });
                    console.log("Data sent:", intervals, counts);

                    // Close the database connection
                    db.close();
                    console.log("DB connection closed");
                });
            });
        }
    });
});

app.get("/api/fetchdatatotalparti", (req, res) => {
    const db = new sqlite3.Database('Data.db', (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            const today = new Date();
            const date = today.toISOString().slice(0, 10);
            const query = 'SELECT COUNT(IsPresent) AS count FROM userrecord WHERE IsPresent = 1';
            db.get(query, (err, row) => {
                if (err) {
                    console.error('Error querying database:', err);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    res.json({result:row.count});
                }
            });
        }
    })
})

app.post("/api/updatedata", (req, res) => {
    const db = new sqlite3.Database('Data.db', (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const query = `SELECT IsPresent FROM userrecord WHERE RFID ="${req.body.RFID}"`
        db.get(query, (err, row) => {
            if (err) {
                console.error('Error querying database:', err);
                db.close();
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (!row) {
                db.close();
                return res.json({ result: 'RFID not found' });
            }

            console.log(row.IsPresent);

            if (row.IsPresent == 1) {
                db.close();
                return res.json({ result: "Present" });
            }

            const getuidquery = `SELECT UserId FROM userrecord WHERE RFID ="${req.body.RFID}"`;
            db.get(getuidquery, (err, row) => {
                if (err) {
                    console.error('Error querying database:', err);
                    db.close();
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                if (!row) {
                    db.close();
                    return res.json({ result: 'RFID not found' });
                }

                const userid = row.UserId;
                console.log(userid);

                let queryInsertPresent;
                if (req.body.IsLate == 1) {
                    queryInsertPresent = `INSERT INTO Present VALUES (NULL,${userid},"${req.body.datetime}",1)`;
                } else {
                    queryInsertPresent = `INSERT INTO Present VALUES (NULL,${userid},"${req.body.datetime}",0)`;
                }

                db.run(queryInsertPresent, (err) => {
                    if (err) {
                        console.error('Error inserting into Present table:', err);
                        db.close();
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }

                    const queryUpdateUserRecord = `UPDATE userrecord SET IsPresent=1 WHERE UserId=${userid}`;
                    db.run(queryUpdateUserRecord, (err) => {
                        if (err) {
                            console.error('Error updating userrecord table:', err);
                            db.close();
                            return res.status(500).json({ error: 'Internal Server Error' });
                        }

                        db.close();
                        return res.json({ result: "SUCCESS" });
                    });
                });
            });
        });
    });
});

app.post("/api/getname", (req, res) => {
    const db = new sqlite3.Database('Data.db', (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const query = `SELECT FirstName,LastName FROM userrecord WHERE RFID = "${req.body.RFID}"`
        db.get(query, (err, row) => {
            console.log(row)
            if (!row) {
                db.close()
                return res.json({ result: "Unknown" })
            }
            else {
                db.close()
                return res.json({ result: row.FirstName + " " + row.LastName})
            }
        })
    })

})

app.get("/api/gettotalparticipants", (req, res) => {
    const db = new sqlite3.Database('Data.db', (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const query = `SELECT COUNT(IsPresent) AS count FROM userrecord `
        db.get(query, (err, row) => {
            db.close()
            return res.json({result: row.count})
        })
    })
})

app.get("/api/resettoday", (req, res) => {
    const db = new sqlite3.Database('Data.db', (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const query = `SELECT UserId FROM userrecord WHERE IsPresent = 0`;
        let absentlist = [];
        db.all(query, (err, rows) => {
            if (err) {
                console.error('Error retrieving data from database:', err.message);
                db.close();
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            rows.forEach(row => {
                absentlist.push(row.UserId);
            });
            console.log(absentlist);
            const insertPromises = absentlist.map(userId => {
                const queryupdate = `INSERT INTO Absent VALUES (NULL, ${userId})`;
                return new Promise((resolve, reject) => {
                    db.run(queryupdate, (err) => {
                        if (err) {
                            console.error('Error inserting data into database:', err.message);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                });
            });

            Promise.all(insertPromises)
                .then(() => {
                    const resetquery = `UPDATE userrecord SET IsPresent = 0 WHERE IsPresent = 1`;
                    db.run(resetquery, (err) => {
                        if (err) {
                            console.error('Error updating data in database:', err.message);
                            db.close();
                            return res.status(500).json({ error: 'Internal Server Error' });
                        }
                        db.close();
                        return res.json({ result: "Success" });
                    });
                })
                .catch(err => {
                    db.close();
                    return res.status(500).json({ error: 'Internal Server Error' });
                });
        });
    });
});

app.post("/api/presentparti",(req,res)=>{
    const db = new sqlite3.Database('Data.db',(err)=>{
        if (err){
            console.error('Error opening database:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }else{
            const query = `SELECT IsPresent FROM userrecord WHERE RFID ="${req.body.RFID}"`
            db.get(query,(err,row)=>{
                db.close()
                return res.json({result:row.IsPresent})
            })
        }
    })
})

app.get('/api/deletelate',(req,res)=>{
    const db = new sqlite3.Database('Data.db',(err)=>{
        const query = `DELETE FROM Present`
        db.run(query)
        return res.json({result:"Delete Success"})
    })
})

app.get('/api/deleteabsent',(req,res)=>{
    const db = new sqlite3.Database('Data.db',(err)=>{
        const query = `DELETE FROM Absent`
        db.run(query)
        return res.json({result:"Delete Success"})
    })
})

app.post('/test',(req,res)=>{
    console.log(req.header)
})


const PORT = process.env.PORT || 8081;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is listening on port ${PORT}`);
});
