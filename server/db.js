const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  port: 3307, 
  user: 'root', 
  password: 'root', 
  database: 'todo_list_db' 
});


module.exports = db;