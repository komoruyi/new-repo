const pool = require("../database/");

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);
    // return the inserted row (or null if not inserted)
    return result.rowCount > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("registerAccount error: ", error);
    return null;
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT account_id FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount > 0;
  } catch (error) {
    console.error("checkExistingEmail error: ", error);
    return false;
  }
}

/* *****************************
 *   Get account by email
 *   Returns account row or null
 * *************************** */
async function getAccountByEmail(account_email) {
  try {
    const sql =
      "SELECT account_id, account_firstname, account_lastname, account_email, account_password, account_type FROM account WHERE account_email = $1";
    const result = await pool.query(sql, [account_email]);
    return result.rowCount > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("getAccountByEmail error: ", error);
    return null;
  }
}

/* *****************************
 *   Get account by id
 *   Returns account row or null
 * *************************** */
async function getAccountById(account_id) {
  try {
    const sql =
      "SELECT account_id, account_firstname, account_lastname, account_email, account_password, account_type FROM account WHERE account_id = $1";
    const result = await pool.query(sql, [account_id]);
    return result.rowCount > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("getAccountById error: ", error);
    return null;
  }
}

/* *****************************
 *   Update account information (firstname, lastname, email)
 *   Returns true if update succeeded
 * *************************** */
async function updateAccount(account_id, firstname, lastname, email) {
  try {
    const sql =
      "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4";
    const result = await pool.query(sql, [firstname, lastname, email, account_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("updateAccount error: ", error);
    return false;
  }
}

/* *****************************
 *   Update password (hashed)
 *   Returns true if update succeeded
 * *************************** */
async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2";
    const result = await pool.query(sql, [hashedPassword, account_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("updatePassword error: ", error);
    return false;
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword,
};