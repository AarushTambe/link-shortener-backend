const pool = require("./db");

async function createUrl(shortCode, longUrl) {
  await pool.query(
    "INSERT INTO linkshortner (shortlink, longlink) VALUES ($1, $2)",
    [shortCode, longUrl]
  );
}

async function getLongUrl(shortCode) {
  const result = await pool.query(
    "SELECT longlink FROM linkshortner WHERE shortlink = $1",
    [shortCode]
  );

  return result.rows.length ? result.rows[0].longlink : null;
}

async function getShortUrl(longCode) {
  const result = await pool.query(
    "SELECT shortlink FROM linkshortner WHERE longlink = $1",
    [longCode]
  );

  return result.rows.length ? result.rows[0].shortlink : null;
}

async function getAllUrl() {
  const result = await pool.query("SELECT shortlink, longlink FROM linkshortner");
  return result.rows.length ? result.rows: null;
}

async function shortCodeExists(shortCode) {
  const result = await pool.query(
    "SELECT 1 FROM linkshortner WHERE shortlink = $1",
    [shortCode]
  );
  return result.rows.length > 0;
}

async function longCodeExists(code) {
  const result = await pool.query(
    "SELECT 1 FROM linkshortner WHERE longlink = $1",
    [code]
  );
  return result.rows.length > 0;
}
module.exports = { createUrl, getLongUrl, getAllUrl, shortCodeExists, longCodeExists, getShortUrl };