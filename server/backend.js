require('dotenv').config();

const oracledb = require('oracledb');
const express = require('express');
const cors = require('cors');

oracledb.initOracleClient({ libDir: 'instantclient_21_12' });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
    console.log("Hello");
})

//Creating tables endpoint
app.post('/create-table', async (req, res) => {
    let connection;
    console.log("HIIII")
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_CONNECTION_STRING
        });

        const tableCreationStatements = [
            `CREATE TABLE Account (
                AccountID INT PRIMARY KEY,
                AccountName VARCHAR(255) NOT NULL,
                FirstName VARCHAR(255) NOT NULL,
                LastName VARCHAR(255) NOT NULL,
                Email VARCHAR(255) NOT NULL,
                Password VARCHAR(255) NOT NULL,
                Rating INT CHECK (Rating >= 1 AND Rating <= 5)
            )`,
            `CREATE TABLE Passenger (
                PassengerID INT PRIMARY KEY,
                AccountID INT,
                SubscriptionType VARCHAR(255),
                DiscountPercent INT CHECK (DiscountPercent >= 0 AND DiscountPercent <= 100),
                NumOfReferrals VARCHAR(255),
                FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
            )`,
            `CREATE TABLE Driver (
                DriverID INT PRIMARY KEY,
                AccountID INT,
                LicenseNumber VARCHAR(255) NOT NULL,
                Experience INT,
                FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
            )`,
            `CREATE TABLE Car_Model (
                VINNumber INT CHECK (VINNumber >= 00000000000000001 and VINNumber <= 999999999999999999),
                CarModelName VARCHAR(255),
                CarYear INT CHECK (CarYear > 0 and CarYear <= 2024),
                PRIMARY KEY (VINNumber, CarModelName)
            )`,
            `CREATE TABLE Car_Make (
                CarID INT PRIMARY KEY,
                CarMakeName VARCHAR(255),
                CarModelName VARCHAR(255),
                VINNumber INT,
                CarTier VARCHAR(255),
                FOREIGN KEY (VINNumber, CarModelName) REFERENCES Car_Model(VINNumber, CarModelName)
            )`,
            `CREATE TABLE Registered_Car (
                CarID INT,
                DriverID INT,
                CarInsurance VARCHAR(255) CHECK (CarInsurance = 'Yes' OR CarInsurance = 'No'),
                FOREIGN KEY (DriverID) REFERENCES Driver(DriverID),
                FOREIGN KEY (CarID) REFERENCES Car_Make(CarID),
                PRIMARY KEY (CarID, DriverID)
            )`,
            `CREATE TABLE Item (
                ItemID INT PRIMARY KEY,
                ItemName VARCHAR(255),
                ItemPrice DECIMAL(5, 2),
                ItemStore VARCHAR(255),
                ItemDescription VARCHAR(255)
            )`,
            `CREATE TABLE ORDERS(
                OrderID INT PRIMARY KEY,
                OrderDate DATE DEFAULT SYSDATE,
                OrderCost DECIMAL(5, 2),
                DriverID INT,
                FOREIGN KEY (DriverID) REFERENCES Driver(DriverID)
            )`,
            `CREATE TABLE PickupOrder (
                PickupOrderID INT PRIMARY KEY,
                OrderID INT,
                PassengerID INT,
                FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
                FOREIGN KEY (PassengerID) REFERENCES Passenger(PassengerID)
            )`,
            `CREATE TABLE PackageOrder (
                PackageOrderID INT PRIMARY KEY,
                OrderID INT,
                ItemID INT,
                FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
                FOREIGN KEY (ItemID) REFERENCES Item(ItemID)
            )`
        ];

        for (const statement of tableCreationStatements) {
            try {
                await connection.execute(statement, [], { autoCommit: true });
            } catch (err) {
                console.error('Error executing statement: ', statement, 'Error: ', err);
            }
        }

        res.status(200).send("Tables created successfully");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating tables: " + err.message);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});


//Inserting into table endpoint
app.post('/populate-table', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_CONNECTION_STRING
        });

        const insertStatements = [
            `INSERT INTO Account VALUES (1000, 'BillP5', 'Bill', 'Vier', 'BillVier@gmail.com', 'Bill19', 4)`,
            `INSERT INTO Account VALUES (1001, 'BobD5', 'Bob', 'Vier', 'BobVier@gmail.com', 'Bob1973', 4)`,
            `INSERT INTO Account VALUES (1002, 'JimD5', 'Jim', 'Vier', 'JimVier@gmail.com', 'Jim1923', 2)`,
            `INSERT INTO Account VALUES (1003, 'JeffD3', 'Jeff', 'Vier', 'JeffVier@gmail.com', 'Jeff12', 1)`,
            `INSERT INTO Account VALUES (1004, 'Jeff43', 'Jeff', 'Smith', 'JeffSmith@gmail.com', 'Jeff', 2)`,
            `INSERT INTO Account VALUES (1005, 'Joe21', 'Joe', 'Doe', 'JoeDoe@gmail.com', 'Joe3', 2)`,
            `INSERT INTO Account VALUES (1006, 'Josh21', 'Josh', 'Doe', 'JoshDoe@gmail.com', 'Josh33', 4)`,
            `INSERT INTO Account VALUES (1007, 'JakeP1', 'Jake', 'Paul', 'JakePaul@gmail.com', 'Jakey1', 3)`,
            `INSERT INTO Account VALUES (1008, 'TomH3', 'Tom', 'Hardy', 'TomHardy@gmail.com', 'TomH_19', 3)`,
            `INSERT INTO Account VALUES (1009, 'AmyP2', 'Amy', 'Poehler', 'AmyPoehler@gmail.com', 'Amy', 5)`,
            `INSERT INTO Account VALUES (1010, 'SteveC4', 'Steve', 'Carell', 'SteveCarell@gmail.com', 'Steve', 4)`,
          
            `INSERT INTO Passenger VALUES (2000, 1000, 'premium', 30, '5')`,
            `INSERT INTO Passenger VALUES (2001, 1006, 'premium', 30, '5')`,
            `INSERT INTO Passenger VALUES (2002, 1007, 'basic', 10, '3')`,
            `INSERT INTO Passenger VALUES (2003, 1008, 'premium', 25, '8')`,
          
            `INSERT INTO Driver VALUES (3000, 1001, 'U5143-32118-03671', 1)`,
            `INSERT INTO Driver VALUES (3001, 1002, 'U5123-75128-46672', 3)`,
            `INSERT INTO Driver VALUES (3002, 1003, 'G2114-55223-42672', 5)`,
            `INSERT INTO Driver VALUES (3003, 1004, 'R1234-56783-36782', 1)`,
            `INSERT INTO Driver VALUES (3004, 1009, 'T4345-67894-23678', 4)`,
            `INSERT INTO Driver VALUES (3005, 1010, 'L5678-43211-98567', 6)`,
          
            `INSERT INTO Car_Model VALUES (60000000000000024, 'camry', 2013)`,
            `INSERT INTO Car_Model VALUES (60000000000000025, 'i3', 2015)`,
            `INSERT INTO Car_Model VALUES (60000000000000026, 'a4', 2015)`,
            `INSERT INTO Car_Model VALUES (60000000000000027, 'c400', 2014)`,
          
            `INSERT INTO Car_Make VALUES (4000, 'toyota', 'camry', 60000000000000024, 'economy')`,
            `INSERT INTO Car_Make VALUES (4001, 'BMW', 'i3', 60000000000000025, 'platinum')`,
            `INSERT INTO Car_Make VALUES (4002, 'audi', 'a4', 60000000000000026, 'green')`,
            `INSERT INTO Car_Make VALUES (4003, 'mercedes', 'c400', 60000000000000027, 'platinum')`,
          
            `INSERT INTO Registered_Car VALUES (4000, 3000, 'Yes')`,
            `INSERT INTO Registered_Car VALUES (4001, 3001, 'Yes')`,
            `INSERT INTO Registered_Car VALUES (4002, 3002, 'Yes')`,
            `INSERT INTO Registered_Car VALUES (4003, 3003, 'Yes')`,
          
            `INSERT INTO Item VALUES (7001, 'Nike Shoe 2', 1.00, 'Nike', 'White running shoes')`,
            `INSERT INTO Item VALUES (7002, 'Adidas Jacket', 79.99, 'Adidas', 'Blue sports jacket')`,
            `INSERT INTO Item VALUES (7003, 'Apple iPhone', 999.99, 'Apple Store', 'Latest iPhone mode')`,
          
            `INSERT INTO ORDERS VALUES (8000, DATE '2015-10-23', 5.00, 3000)`,
            `INSERT INTO ORDERS VALUES (8001, DATE '2016-03-18', 8.00, 3001)`,
            `INSERT INTO ORDERS VALUES (8002, DATE '2017-01-19', 50.00, 3002)`,
            `INSERT INTO ORDERS VALUES (8003, DATE '2018-08-21', 99.00, 3003)`,
            `INSERT INTO ORDERS VALUES (8004, DATE '2019-11-22', 15.00, 3004)`,
          
            `INSERT INTO PickupOrder VALUES (9000, 8000, 2000)`,
            `INSERT INTO PickupOrder VALUES (9001, 8002, 2001)`,
            `INSERT INTO PickupOrder VALUES (9002, 8003, 2002)`,
            `INSERT INTO PickupOrder VALUES (9003, 8004, 2003)`,
          
            `INSERT INTO PackageOrder VALUES (10002, 8001, 7001)`,
            `INSERT INTO PackageOrder VALUES (10003, 8004, 7002)`
          ];

        for (const statement of insertStatements) {
            await connection.execute(statement, [], { autoCommit: true });
        }

        res.status(200).send();

    } catch (err) {
        console.error(err);
        res.status(500).send("Error Populating tables: " + err.message);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});


//Dropping table endpoint
app.post('/drop-table', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_CONNECTION_STRING
        });
        console.log("Successfully connected to Oracle Database");

        const dropTableSql = [
            `DROP TABLE ACCOUNT CASCADE CONSTRAINTS`,
            `DROP TABLE PASSENGER CASCADE CONSTRAINTS`,
            `DROP TABLE DRIVER CASCADE CONSTRAINTS`,
            `DROP TABLE ITEM CASCADE CONSTRAINTS`,
            `DROP TABLE ORDERS CASCADE CONSTRAINTS`,
            `DROP TABLE PACKAGEORDER CASCADE CONSTRAINTS`,
            `DROP TABLE PICKUPORDER CASCADE CONSTRAINTS`,
            `DROP TABLE Registered_Car CASCADE CONSTRAINTS`,
            `DROP TABLE Car_Model CASCADE CONSTRAINTS`,
            `DROP TABLE Car_Make CASCADE CONSTRAINTS`
        ];
        for (const statement of dropTableSql) {
            try {
                await connection.execute(statement, [], { autoCommit: true });
            } catch (err) {
                console.error('Error Dropping table statement: ', statement, 'Error: ', err);
            }
        }
        
        res.status(200).send();

    } catch (err) {
        console.error(err);
        res.status(500);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

// Query Table 
app.post('/query-table', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_CONNECTION_STRING
        });
        console.log("Successfully connected to Oracle Database");

        const queryTableSql = [
            `SELECT DISTINCT FirstName, LastName
            FROM Account
            INNER JOIN Passenger ON Account.AccountID = Passenger.AccountID
            ORDER BY FirstName, LastName;
            `,
            `SELECT po.PackageOrderID, o.OrderCost, o.OrderDate
            FROM PackageOrder po
            INNER JOIN Orders o ON po.OrderID = o.OrderID
            WHERE o.OrderCost < 500
            ORDER BY o.OrderCost;
            `,
            `SELECT DISTINCT a.Firstname, a.LastName
            FROM Account a 
            INNER JOIN Driver d ON a.AccountID = d.AccountID
            WHERE experience >= 3
            ORDER BY experience DESC;
            `,
            `SELECT DISTINCT a.FirstName, a.LastName, COUNT(po.orderID) as total_amount
            FROM Account a
            INNER JOIN Passenger p ON a.AccountID = p.AccountID
            INNER JOIN PickupOrder po ON p.PassengerID = po.PassengerID
            GROUP BY a.FirstName, a.LastName 
            ORDER BY total_amount;
            `
        ];
        for (const statement of queryTableSql) {
            try {
                await connection.execute(statement, [], { autoCommit: true });
            } catch (err) {
                console.error('Error querying table statement: ', statement, 'Error: ', err);
            }
        }
        
        res.status(200).send("Tables queried succesffuly ");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error querying tables: " + err.message);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//Viewing table endpoint
app.get('/select-table', async (req, res) => {
    let connection;

    const tableName = req.query.table;
    console.log(tableName);

    try {
        // Establish a connection to the Oracle Database
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_CONNECTION_STRING
        });
        // Execute the SELECT query
        const result = await connection.execute(`select * from ${tableName}`, [], {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
          });

        // Send the result back to the client
        console.log(result);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Error executing query: ' + error.message);

    } finally {
        // Release the connection when done
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing connection:', error);
            }
        }
    }
});

//Custom Search table endpoint
app.get('/search-table', async (req, res) => {
    let connection;

    const sqlQuery = req.query.sqlQuery;

    try {
        // Establish a connection to the Oracle Database
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_CONNECTION_STRING
        });
        // Execute the SELECT query
        const result = await connection.execute(sqlQuery, [], {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
          });

        // Send the result back to the client
        console.log(result);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Error executing query: ' + error.message);

    } finally {
        // Release the connection when done
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing connection:', error);
            }
        }
    }
});

// Update a row in a specific table
app.post('/update-row', async (req, res) => {

    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_CONNECTION_STRING
        });

        const { tableName, rowData, keyColumn, keyValue } = req.body;

        // Construct the SQL Update Statement
        const setClause = Object.entries(rowData)
            .map(([key, value]) => `${key} = '${value}'`)
            .join(', ');

        const updateSql = `UPDATE ${tableName} SET ${setClause} WHERE ${keyColumn} = '${keyValue}'`;

        await connection.execute(updateSql, [], { autoCommit: true });

        res.status(200).send("Row updated successfully");
    } catch (err) {
        console.error('Error updating row:', err);
        res.status(500).json({ message: 'Error updating row: ' + err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});



//Viewing table endpoint
app.get('/query1-table', async (req, res) => {
    let connection;

    const tableName = req.query.table;
    console.log(tableName);

    try {
        // Establish a connection to the Oracle Database
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_CONNECTION_STRING
        });
        // Execute the SELECT query
        const result = await connection.execute(`SELECT DISTINCT FirstName, LastName
        FROM Account
        INNER JOIN Passenger ON Account.AccountID = Passenger.AccountID
        ORDER BY FirstName, LastName`, [], {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
          });

        // Send the result back to the client
        console.log(result);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Error executing query: ' + error.message);

    } finally {
        // Release the connection when done
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing connection:', error);
            }
        }
    }
});

//Viewing table endpoint
app.get('/query2-table', async (req, res) => {
    let connection;

    const tableName = req.query.table;
    console.log(tableName);

    try {
        // Establish a connection to the Oracle Database
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_CONNECTION_STRING
        });
        // Execute the SELECT query
        const result = await connection.execute(`SELECT po.PackageOrderID, o.OrderCost, o.OrderDate
        FROM PackageOrder po
        INNER JOIN Orders o ON po.OrderID = o.OrderID
        WHERE o.OrderCost < 500
        ORDER BY o.OrderCost
        `, [], {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
          });

        // Send the result back to the client
        console.log(result);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Error executing query: ' + error.message);

    } finally {
        // Release the connection when done
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing connection:', error);
            }
        }
    }
});

//Viewing table endpoint
app.get('/query3-table', async (req, res) => {
    let connection;

    const tableName = req.query.table;
    console.log(tableName);

    try {
        // Establish a connection to the Oracle Database
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_CONNECTION_STRING
        });
        // Execute the SELECT query
        const result = await connection.execute(`SELECT DISTINCT a.Firstname, a.LastName
        FROM Account a 
        INNER JOIN Driver d ON a.AccountID = d.AccountID
        WHERE experience >= 3
        ORDER BY experience DESC`, [], {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
          });

        // Send the result back to the client
        console.log(result);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Error executing query: ' + error.message);

    } finally {
        // Release the connection when done
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing connection:', error);
            }
        }
    }
});

//Viewing table endpoint
app.get('/query4-table', async (req, res) => {
    let connection;

    const tableName = req.query.table;
    console.log(tableName);

    try {
        // Establish a connection to the Oracle Database
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectionString: process.env.DB_CONNECTION_STRING
        });
        // Execute the SELECT query
        const result = await connection.execute(`SELECT DISTINCT a.FirstName, a.LastName, COUNT(po.orderID) as total_amount
        FROM Account a
        INNER JOIN Passenger p ON a.AccountID = p.AccountID
        INNER JOIN PickupOrder po ON p.PassengerID = po.PassengerID
        GROUP BY a.FirstName, a.LastName 
        ORDER BY total_amount`, [], {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
          });

        // Send the result back to the client
        console.log(result);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('Error executing query: ' + error.message);

    } finally {
        // Release the connection when done
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing connection:', error);
            }
        }
    }
});

const port = 4000;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
