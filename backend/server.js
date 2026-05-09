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

app.get("/tasks", (req, res) => {
    const userId = Number(req.query.user_id);

    if (!userId) {
        return res.status(400).json({
            message: "User id is required"
        });
    }

    const sql = `
        SELECT
            id,
            course_name AS courseName,
            task_title AS taskTitle,
            DATE_FORMAT(due_date, '%Y-%m-%d') AS taskDate,
            task_type AS taskType,
            task_status AS taskStatus,
            progress_percentage AS progressPercentage
        FROM tasks
        WHERE user_id = ?
        ORDER BY due_date ASC
    `;

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Error loading tasks"
            });
        }

        if (result.length === 0) {
            return res.json([]);
        }

        const taskIds = result.map((task) => task.id);
        const subtasksSql = `
            SELECT
                id,
                task_id AS taskId,
                subtask_text AS text,
                completed
            FROM subtasks
            WHERE task_id IN (?)
            ORDER BY id ASC
        `;

        db.query(subtasksSql, [taskIds], (subtaskErr, subtasks) => {
            if (subtaskErr) {
                console.log(subtaskErr);
                return res.status(500).json({
                    message: "Error loading subtasks"
                });
            }

            const tasks = result.map((task) => ({
                ...task,
                progressPercentage: Number(task.progressPercentage) || 0,
                subtasks: subtasks
                    .filter((subtask) => subtask.taskId === task.id)
                    .map((subtask) => ({
                        id: subtask.id,
                        text: subtask.text,
                        completed: Boolean(subtask.completed)
                    }))
            }));

            res.json(tasks);
        });
    });
});

app.post("/tasks", (req, res) => {
    const userId = Number(req.body.user_id);
    const courseName = String(req.body.courseName || "").trim();
    const taskTitle = String(req.body.taskTitle || "").trim();
    const taskDate = String(req.body.taskDate || "").trim();
    const taskType = String(req.body.taskType || "").trim();
    const taskStatus = getTaskStatus(taskDate, 0);

    if (!userId || !courseName || !taskTitle || !isValidDate(taskDate) || !isValidTaskType(taskType)) {
        return res.status(400).json({
            message: "Please fill all task fields"
        });
    }

    const sql = `
        INSERT INTO tasks
            (user_id, course_name, task_title, due_date, task_type, task_status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [userId, courseName, taskTitle, taskDate, taskType, taskStatus], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Error adding task"
            });
        }

        res.status(201).json({
            message: "Task added",
            task: {
                id: result.insertId,
                courseName,
                taskTitle,
                taskDate,
                taskType,
                taskStatus,
                progressPercentage: 0,
                subtasks: []
            }
        });
    });
});

app.put("/tasks/:id", (req, res) => {
    const taskId = Number(req.params.id);
    const userId = Number(req.body.user_id);
    const courseName = String(req.body.courseName || "").trim();
    const taskTitle = String(req.body.taskTitle || "").trim();
    const taskDate = String(req.body.taskDate || "").trim();
    const taskType = String(req.body.taskType || "").trim();
    const subtasks = normalizeSubtasks(req.body.subtasks);
    const progressPercentage = getProgressPercentage(subtasks);
    const taskStatus = getTaskStatus(taskDate, progressPercentage);

    if (!taskId || !userId || !courseName || !taskTitle || !isValidDate(taskDate) || !isValidTaskType(taskType)) {
        return res.status(400).json({
            message: "Please fill all task fields"
        });
    }

    const sql = `
        UPDATE tasks
        SET
            course_name = ?,
            task_title = ?,
            due_date = ?,
            task_type = ?,
            task_status = ?,
            progress_percentage = ?
        WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [courseName, taskTitle, taskDate, taskType, taskStatus, progressPercentage, taskId, userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Error updating task"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        db.query("DELETE FROM subtasks WHERE task_id = ?", [taskId], (deleteErr) => {
            if (deleteErr) {
                console.log(deleteErr);
                return res.status(500).json({
                    message: "Error updating subtasks"
                });
            }

            if (subtasks.length === 0) {
                return res.json({
                    message: "Task updated",
                    task: {
                        id: taskId,
                        courseName,
                        taskTitle,
                        taskDate,
                        taskType,
                        taskStatus,
                        progressPercentage,
                        subtasks: []
                    }
                });
            }

            const values = subtasks.map((subtask) => [
                taskId,
                subtask.text,
                subtask.completed ? 1 : 0
            ]);

            db.query(
                "INSERT INTO subtasks (task_id, subtask_text, completed) VALUES ?",
                [values],
                (insertErr, insertResult) => {
                    if (insertErr) {
                        console.log(insertErr);
                        return res.status(500).json({
                            message: "Error saving subtasks"
                        });
                    }

                    const savedSubtasks = subtasks.map((subtask, index) => ({
                        id: insertResult.insertId + index,
                        text: subtask.text,
                        completed: subtask.completed
                    }));

                    res.json({
                        message: "Task updated",
                        task: {
                            id: taskId,
                            courseName,
                            taskTitle,
                            taskDate,
                            taskType,
                            taskStatus,
                            progressPercentage,
                            subtasks: savedSubtasks
                        }
                    });
                }
            );
        });
    });
});

app.delete("/tasks/:id", (req, res) => {
    const taskId = Number(req.params.id);
    const userId = Number(req.query.user_id);

    if (!taskId || !userId) {
        return res.status(400).json({
            message: "Task id and user id are required"
        });
    }

    const sql = "DELETE FROM tasks WHERE id = ? AND user_id = ?";

    db.query(sql, [taskId, userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Error deleting task"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted"
        });
    });
});

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidDate(dateValue) {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateValue);
}

function isValidTaskType(taskType) {
    return taskType === "individual" || taskType === "group";
}

function normalizeSubtasks(subtasks) {
    if (!Array.isArray(subtasks)) {
        return [];
    }

    return subtasks
        .map((subtask) => ({
            text: String(subtask.text || "").trim(),
            completed: Boolean(subtask.completed)
        }))
        .filter((subtask) => subtask.text !== "");
}

function getProgressPercentage(subtasks) {
    if (subtasks.length === 0) {
        return 0;
    }

    const completedCount = subtasks.filter((subtask) => subtask.completed).length;
    return Math.round((completedCount / subtasks.length) * 100);
}

function getTaskStatus(taskDate, progressPercentage) {
    if (progressPercentage === 100) {
        return "Completed";
    }

    return isPastDate(taskDate) ? "Late" : "In Progress";
}

function isPastDate(dateValue) {
    const [year, month, day] = dateValue.split("-").map(Number);
    const dueDate = new Date(year, month - 1, day);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
}
