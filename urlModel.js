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
async function createUrl(shortCode, longUrl) {
  await pool.query(
    "INSERT INTO linkshortner (shortlink, longlink) VALUES ($1, $2)",
    [shortCode, longUrl]
  );
}

/*
  Resolve a shortcode to its corresponding long URL.
  Returns null if no mapping exists.
 */
async function getLongUrl(shortCode) {
  const result = await pool.query(
    "SELECT longlink FROM linkshortner WHERE shortlink = $1",
    [shortCode]
  );

  return result.rows.length ? result.rows[0].longlink : null;
}


/*
  Resolve a longcode to its corresponding short URL.
  Returns null if no mapping exists. 
 */
async function getShortUrl(longCode) {
  const result = await pool.query(
    "SELECT shortlink FROM linkshortner WHERE longlink = $1",
    [longCode]
  );

  return result.rows.length ? result.rows[0].shortlink : null;
}

/*
  Retrives both shortlink and longlink from database.
  Returns null if no mapping exists.
*/
async function getAllUrl() {
  const result = await pool.query("SELECT shortlink, longlink FROM linkshortner");
  return result.rows.length ? result.rows: null;
}

/* 
  Checks whether a Short URL already exist.
  Used to enforce one-to-one mappping
*/
async function shortCodeExists(shortCode) {
  const result = await pool.query(
    "SELECT 1 FROM linkshortner WHERE shortlink = $1",
    [shortCode]
  );
  return result.rows.length > 0;
}

/*
  Checks whether a Long URL already exist.
  Used to enforce one-to-one mappping
*/
async function longCodeExists(code) {
  const result = await pool.query(
    "SELECT 1 FROM linkshortner WHERE longlink = $1",
    [code]
  );
  return result.rows.length > 0;
}

/*
  Delete a short link by shortcode
*/
async function deletelink(shortcode) {
  const result = await pool.query(
    "DELETE FROM linkshortner WHERE shortlink=$1",
    [shortcode]
  );
  return result.rowCount;
}
module.exports = { createUrl, getLongUrl, getAllUrl, shortCodeExists, longCodeExists, getShortUrl, deletelink };