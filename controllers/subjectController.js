const mysql = require("mysql");
const dotenv = require("dotenv");

const { promisify } = require('util');

//define configuration file
dotenv.config({ path: "./.env" });

//Database  connection
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});
const query = promisify(db.query).bind(db);

// Add a new subject to the database
exports.addSubject = async (req, res) => {
  const sql = 'INSERT INTO subjects (name, hours, colour, userId) VALUES (?)';
  const name = req.body.newEventSub;
  const hours = req.body.hours || 0;
  const colour = req.body.color;
  const user = req.cookies.userId;
  const dbInsert = [name, hours, colour, user];

  try {
    await query(sql, [dbInsert]);
    res.redirect('/dashboard');
  } catch (err) {
    console.log('Error in addSubject:', err);
    res.status(500).send('Internal server error');
  }
};

// Render the new subject page
exports.getSubject = (req, res) => {
  res.render('newSubject.ejs');
};

// Render the edit subject page
exports.openEditSub = async (req, res) => {
  const subId = req.params['id'].replace(':', '');
  const sql = 'SELECT * FROM subjects WHERE id=?';

  try {
    const result = await query(sql, subId);
    const subData = Object.values(JSON.parse(JSON.stringify(result)));
    res.render('editSub.ejs', { subject: subData[0] });
  } catch (err) {
    console.log('Error in openEditSub:', err);
    res.status(500).send('Internal server error');
  }
};

// Update a subject in the database
exports.editSubject = async (req, res) => {
  const id = (req.params['id'].replace(':', ''));
  const subName = req.body.newEventSub;
  const subHours = req.body.hours;
  const subColour = req.body.color;
  const updateData = { name: subName, hours: subHours, colour: subColour };
  const conditions = [updateData, id];

  try {
    await query('UPDATE subjects SET ? WHERE id=?', conditions);

    const goalUpdateData = { subject: subName };
    await query('UPDATE goals SET ? WHERE subject = ?', [goalUpdateData, subName]);
    await query('UPDATE event SET ? WHERE subject = ?', [goalUpdateData, subName]);

    res.redirect('/dashboard');
  } catch (err) {
    console.log('Error in editSubject:', err);
    res.status(500).send('Internal server error');
  }
};

// Render the delete subject confirmation page
exports.openDeleteSubject = (req, res) => {
  const subId = req.params['id'].replace(':', '');
  res.render('deleteSubConfirmation.ejs', { id: subId });
};

// Delete a subject from the database
exports.deleteSubject = async (req, res) => {
  const subId = req.params['id'].replace(':', '');
  const sql = 'DELETE FROM subjects WHERE id = ?';

  try {
    await query(sql, subId);
    res.redirect('/dashboard');
  } catch (err) {
    console.log('Error in deleteSubject:', err);
    res.status(500).send('Internal server error');
  }
};
