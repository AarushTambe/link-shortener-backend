/*
  Database access functions.
  All SQL interactions are isolated here to
  keep the API layer clean and readable
*/

const pool = require("./db");

/*
  Insert a new shortcode → long URL mapping.
  Relies on database constraints for uniqueness. 
*/
async function createUrl(shortCode, longUrl, account) {
  await pool.query(
    "INSERT INTO linkshortner (shortlink, longlink, account) VALUES ($1, $2, $3)",
    [shortCode, longUrl, account]
  );
}

/*
  Resolve a shortcode to its corresponding long URL.
  Returns null if no mapping exists.
 */
async function getLongUrl(shortCode, account) {
  const result = await pool.query(
    "SELECT longlink FROM linkshortner WHERE shortlink = $1 and account=$2",
    [shortCode, account]
  );

  return result.rows.length ? result.rows[0].longlink : null;
}


/*
  Retrives both shortlink and longlink from database.
  Returns null if no mapping exists.
*/
async function getAllUrl(account) {
  const result = await pool.query("SELECT shortlink, longlink FROM linkshortner where account=$1",
    [account]
  );
  return result.rows.length ? result.rows: null;
}

/* 
  Checks whether a Short URL already exist.
  Used to enforce one-to-one mappping
*/
async function shortCodeExists(shortCode, account) {
  const result = await pool.query(
    "SELECT 1 FROM linkshortner WHERE shortlink = $1 and account =$2",
    [shortCode, account]
  );
  return result.rows.length > 0;
}


/*
  Delete a short link by shortcode
*/
async function deletelink(shortcode, account) {
  const result = await pool.query(
    "DELETE FROM linkshortner WHERE shortlink=$1 and account= $2",
    [shortcode, account]
  );
  return result.rowCount;
}

/*
creating a user account  
*/
async function register(account, key) {
  await pool.query(
    "INSERT INTO login (account = $1 and key = $2",
    [account, key]
  );
}

/*
logging into existing user account 
*/
async function verifyLogin(account, key) {
  const result = await pool.query(
    "SELECT 1 FROM login WHERE account = $1 and key = $2",
    [account]
  );
  return result.rows.length > 0;
}
module.exports = { createUrl, getLongUrl, getAllUrl, shortCodeExists, deletelink, register, verifyLogin };