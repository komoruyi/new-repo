// Middleware to verify a JWT and require accountType "Employee" or "Admin"
// Place at ./lib/jwtAuth.js
const jwt = require("jsonwebtoken");
const utilities = require("../utilities/");

const ALLOWED = new Set(["Employee", "Admin"]);
const TOKEN_COOKIE_NAME = "jwt"; // if you store the token in a cookie
const ENV_SECRET_NAME = "JWT_SECRET"; // use this key in your .env

module.exports = async function jwtAuth(req, res, next) {
  try {
    // 1) Read token from Authorization Bearer header OR cookie named 'jwt'
    let token = null;
    const authHeader = req.get("Authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.slice(7).trim();
    } else if (req.cookies && req.cookies[TOKEN_COOKIE_NAME]) {
      token = req.cookies[TOKEN_COOKIE_NAME];
    }

    // 2) If no token, render login view with message
    if (!token) {
      const nav = await utilities.getNav();
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        message: "You must be logged in as an Employee or Admin to access that page.",
      });
    }

    // 3) Verify token
    const secret = process.env[ENV_SECRET_NAME] || process.env.JWT_SECRET;
    if (!secret) {
      // developer misconfiguration: secret missing
      console.error("JWT secret not configured (JWT_SECRET).");
      const nav = await utilities.getNav();
      return res.status(500).render("account/login", {
        title: "Login",
        nav,
        message: "Server configuration error (missing JWT secret). Contact admin.",
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      const nav = await utilities.getNav();
      const msg =
        err.name === "TokenExpiredError"
          ? "Your session has expired. Please log in again."
          : "Invalid authentication token. Please log in.";
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        message: msg,
      });
    }

    // 4) Check accountType
    const accountType = payload.accountType || payload.accType || payload.role;
    if (!accountType || !ALLOWED.has(accountType)) {
      const nav = await utilities.getNav();
      return res.status(403).render("account/login", {
        title: "Login",
        nav,
        message:
          "You do not have permission to access that page. Sign in with an Employee or Admin account.",
      });
    }

    // 5) Success: attach user info for downstream handlers and continue
    req.user = payload;
    return next();
  } catch (err) {
    console.error("Unexpected error in jwtAuth middleware:", err);
    const nav = await utilities.getNav();
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      message: "Server error validating session. Please try again later.",
    });
  }
};