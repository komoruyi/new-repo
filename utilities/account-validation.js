const utilities = require("./index");
const accountModel = require("../models/account-model");
const { body, validationResult } = require("express-validator");
const validate = {};

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    // valid email is required and cannot already exist in the DB
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check registration data and return errors or continue
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* ******************************
 * Login Data Validation Rules
 * ***************************** */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ];
};

/* ******************************
 * Check login data
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/login", {
      title: "Login",
      nav,
      errors,
      account_email,
    });
  }
  next();
};

/* ******************************
 * Account Update Validation Rules
 * - For the account info update (first, last, email)
 * - Email uniqueness check excludes the current account id
 * ***************************** */
validate.accountUpdateRules = () => {
  return [
    body("clientFirstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a first name (at least 2 characters)."),

    body("clientLastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name (at least 2 characters)."),

    body("clientEmail")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .bail()
      .custom(async (clientEmail, { req }) => {
        // Only enforce uniqueness when updating account info.
        // If email exists and belongs to a different account, fail.
        const accountId = Number(req.body.clientId || req.body.account_id || 0);
        const existing = await accountModel.getAccountByEmail(clientEmail);
        if (existing && Number(existing.clientid) !== Number(accountId)) {
          throw new Error("The provided email is already in use.");
        }
        return true;
      }),
  ];
};

/* ******************************
 * Password Validation Rules
 * - For password change only
 * - Uses same strength as registration
 * ***************************** */
validate.passwordRules = () => {
  return [
    body("clientPassword")
      .if((value, { req }) => req.body.action === "changePassword")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password does not meet requirements. Must be at least 12 characters and include uppercase, lowercase, number, and special character."
      ),

    body("confirmPassword")
      .if((value, { req }) => req.body.action === "changePassword")
      .trim()
      .custom((confirmPassword, { req }) => {
        if (confirmPassword !== req.body.clientPassword) {
          throw new Error("Password confirmation does not match the new password.");
        }
        return true;
      }),
  ];
};

/* ******************************
 * Check update data and return errors or continue
 * - If validation fails, re-render the update view with sticky form data
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Create sticky data from submitted values or fallback to session client
    const formData = {
      clientId:
        req.body.clientId ||
        req.body.account_id ||
        (req.session && req.session.client && req.session.client.clientId) ||
        "",
      clientFirstname: req.body.clientFirstname || "",
      clientLastname: req.body.clientLastname || "",
      clientEmail: req.body.clientEmail || "",
    };

    const nav = await utilities.getNav();

    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      client: formData, // view will use this to populate inputs (sticky)
      errors: errors.array(),
      formData,
    });
  }
  next();
};

module.exports = validate;