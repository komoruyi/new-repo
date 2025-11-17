const { Pool } = require("pg");
require("dotenv").config();

/* ***************
 * Connection Pool
 * SSL Object needed for Render Postgres
 * But not needed for local Postgres
 * Determines automatically which to use
 * *************** */

// Determine if connecting to Render database
const isRender = process.env.DATABASE_URL.includes("render.com");

let pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isRender ? { rejectUnauthorized: false } : false,
});

// Added for troubleshooting queries during development
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params);
      console.log("executed query", { text });
      return res;
    } catch (error) {
      console.error("error in query", { text, error });
      throw error;
    }
  },
};