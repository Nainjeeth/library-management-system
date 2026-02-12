//lib login
const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const app = express();
const encoder = bodyParser.urlencoded({ extended: true });

app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session management
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'newuser',
    password: 'azdpk7371A',
    database: 'nodejs'
});

// Connect to database
connection.connect(function (error) {
    if (error) {
        console.error('Database connection failed: ' + error.stack);
        return;
    }
    console.log('Connected to database successfully');
});


app.get("/", function (req, res) {
    if (req.session.loggedin) {
        res.redirect("/welcome");
    } else {
        res.sendFile(path.join(__dirname, "liblogin.html"), function (err) {
            if (err) {
                console.error("Error sending liblogin.html:", err);
                res.status(err.status).end();
            }
        });
    }
});

app.post("/", encoder, function (req, res) {
    const username = req.body.username;

    console.log("Received login request:", username);

    const query = "SELECT * FROM loginuser WHERE user_name = ?";
    connection.query(query, [username], function (error, results) {
        if (error) {
            console.error("Query error: " + error.stack);
            res.redirect("/?error=true");
        } else if (results.length > 0) {
            console.log("Login successful for user:", username);
            req.session.loggedin = true;
            req.session.user_id = results[0].user_id;
            req.session.user = {
                id: results[0].user_id,
                name: results[0].stu_name,
                student_id: results[0].user_name,
                phone: results[0].phno,
                email: results[0].email
            };
            res.redirect("/welcome");
        } else {
            console.log("Login failed for user:", username);
            res.redirect("/?error=true");
        }
        res.end();
    });
});

// When login is successful
app.get("/welcome", function (req, res) {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, "librarian.html"), function (err) {
            if (err) {
                console.error("Error sending librarian.html:", err);
                res.status(err.status).end();
            }
        });
    } else {
        res.redirect("/");
    }
});
// Serve the HTML form

// Add book
app.post('/add-book', (req, res) => {
    const { book_no, title, borrowed_date, renewal_date } = req.body;
    const user_id = req.session.user_id; // Get user ID from session

    if (!user_id) {
        res.json({ success: false, message: "User not logged in" });
        return;
    }

    const bookQuery = 'INSERT INTO books (user_id, book_no, title, borrowed_date, renewal_date) VALUES (?, ?, ?, ?, ?)';
    connection.query(bookQuery, [user_id, book_no, title, borrowed_date, renewal_date], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ success: false });
        } else {
            const book_id = result.insertId; // Get the ID of the inserted book
            const userBookQuery = 'INSERT INTO user_books (user_id, book_id) VALUES (?, ?)';
            connection.query(userBookQuery, [user_id, book_id], (err, result) => {
                if (err) {
                    console.error(err);
                    res.json({ success: false });
                } else {
                    res.json({ success: true });
                }
            });
        }
    });
});


// Fetch for specific user books
app.get('/get-books', (req, res) => {
    const user_id = req.session.user_id; // Get user ID from session

    if (!user_id) {
        res.json({ success: false, books: [] });
        return;
    }

    const query = `
        SELECT b.* FROM books b
        JOIN user_books ub ON b.book_id = ub.book_id
        WHERE ub.user_id = ?
    `;
    connection.query(query, [user_id], (err, results) => {
        if (err) {
            console.error(err);
            res.json({ success: false, books: [] });
        } else {
            res.json({ success: true, books: results });
        }
    });
});


// Delete book
app.post('/delete-book', (req, res) => {
    const { book_id } = req.body;
    const user_id = req.session.user_id; // Get user ID from session

    const userBookDeleteQuery = 'DELETE FROM user_books WHERE user_id = ? AND book_id = ?';
    connection.query(userBookDeleteQuery, [user_id, book_id], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ success: false });
        } else {
            const bookDeleteQuery = 'DELETE FROM books WHERE book_id = ?';
            connection.query(bookDeleteQuery, [book_id], (err, result) => {
                if (err) {
                    console.error(err);
                    res.json({ success: false });
                } else {
                    res.json({ success: true });
                }
            });
        }
    });
});


// Renew book
app.post('/renew-book', (req, res) => {
    const { book_id, borrowed_date, renewal_date } = req.body;
    const query = 'UPDATE books SET borrowed_date = ?, renewal_date = ? WHERE book_id = ?';
    connection.query(query, [borrowed_date, renewal_date, book_id], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ success: false });
        } else {
            res.json({ success: true });
        }
    });
});

// Logout route
app.get("/logout", function (req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
        }
        res.redirect("/");
    });
});

// Route to fetch user details
app.get("/user-details", function (req, res) {
    if (req.session.loggedin) {
        res.json(req.session.user);
    } else {
        res.status(401).send('Unauthorized');
    }
});


app.listen(4500, () => {
    console.log('Server is running on port 4500');
});
