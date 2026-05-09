const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

// Local database settings for now. Move them to environment variables before hosting.
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "studyflow",
    port: 8889
});

db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("MySQL Connected");
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.post("/signup", async (req, res) => {

    const { full_name, email, password } = req.body;
    const cleanFullName = String(full_name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    // Keep the backend strict too, because users can bypass browser validation.
    if (!cleanFullName || !isValidEmail(cleanEmail) || cleanPassword.length < 8) {
        return res.status(400).json({
            message: "Please enter a name, valid email, and password of at least 8 characters"
        });
    }

    try {

        // Store only the hashed password, never the plain password.
        const hashedPassword = await bcrypt.hash(cleanPassword, 10);

        const sql = `
            INSERT INTO users (full_name, email, password)
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [cleanFullName, cleanEmail, hashedPassword],
            (err, result) => {

                if (err) {
                    console.log(err);

                    if (err.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            message: "Email is already registered"
                        });
                    }

                    return res.status(500).json({
                        message: "Error creating account"
                    });
                }

                res.status(201).json({
                    message: "Account created successfully"
                });

            }
        );

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server error"
        });

    }

});

app.post("/signin", (req, res) => {

    const { email, password } = req.body;
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanPassword = String(password || "");

    if (!isValidEmail(cleanEmail) || !cleanPassword) {
        return res.status(400).json({
            message: "Please enter a valid email and password"
        });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [cleanEmail], async (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Server error"
            });
        }

        if (result.length === 0) {
            // Same message as wrong password so we do not reveal which emails exist.
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email
            }
        });

    });

});

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
