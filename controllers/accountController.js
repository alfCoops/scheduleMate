// Import the required modules
const mysql = require("mysql");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

// Load the configuration file containing environment variables
dotenv.config({ path: "./.env" });

// Set up the database connection using environment variables
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

// Async function to create a new account
exports.createAccount = async (req, res) => {
  try {
    // Hash the password provided by the user
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Extract the email and name from the request body
    var email = req.body.email;
    var name = req.body.name;

    // Set a cookie for the user
    res.cookie();

    // Create a user object with the name, email, and hashed password
    const user = [name, email, hashedPassword];

    // SQL query to insert the user into the database
    var sql = "INSERT INTO user (name, email, password) VALUES (?)";

    // Execute the SQL query using the async query function
    const result = await query(sql, [user]);

    // Set a cookie with the user ID and mark it as secure
    res.cookie("userId", result.insertId, { secure: true });

    // Redirect the user to the dashboard
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
  }
};

// Function to handle user logout
exports.logout = (req, res) => {
  // Clear the user ID cookie
  res.clearCookie(req.cookies.userId);

  // Redirect the user to the landing page
  res.redirect("/landingPage");
};

// Async function to handle user login
exports.login = async (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  try {
    // Get the user record by email using the async getUserByEmail function
    const rows = await getUserByEmail(email);

    // Check if a user record was found
    if (rows.length === 0) {
      return res.status(401).send("Invalid email or password");
    }

    // Compare the provided password with the stored hash using bcrypt
    const match = await bcrypt.compare(password, rows[0].password);

    // If the password does not match, return an error
    if (!match) {
      return res.status(401).send("Invalid email or password");
    } else {
      // Set the user ID cookie
      res.cookie("userId", rows[0].id);

      // Redirect the user to the dashboard or other authorized page
      
      console.log("Hello")
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Function to get a user record by email, using the async query function
function getUserByEmail(email) {
  return query("SELECT * FROM user WHERE email = ?", [email]);
}
function query(sql, params) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
