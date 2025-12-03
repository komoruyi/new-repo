const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
    });
  } catch (err) {
    next(err);
  }
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
  } catch (err) {
    next(err);
  }
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const {
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    } = req.body;

    // Hash the password before storing
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hashSync(account_password, 10);
    } catch (error) {
      req.flash(
        "notice",
        "Sorry, there was an error processing the registration."
      );
      return res.status(500).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
      });
    }

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      );
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(501).render("account/register", {
        title: "Registration",
        nav,
      });
    }
  } catch (err) {
    next(err);
  }
}

/* ****************************************
 *  Deliver Account Management view
 * *************************************** */
async function buildManagement(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const client = res.locals.client || (req.session ? req.session.client : null);

    if (!client) {
      req.flash("notice", "Please log in to access account management.");
      return res.redirect("/account/login");
    }

    res.render("account/index", {
      title: "Account Management",
      nav,
      client,
    });
  } catch (err) {
    next(err);
  }
}

/* ****************************************
 *  Build Update Account View (GET)
 *  - Fetches latest account data from DB and renders the update form
 * *************************************** */
async function buildUpdateAccountView(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const loggedInClient = res.locals.client || (req.session ? req.session.client : null);
    const requestedClientId = Number(req.params.clientId);

    if (!loggedInClient) {
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        message: "Please log in to update your account.",
      });
    }

    // Only allow a client to edit their own account (extend if Admins should edit others)
    if (loggedInClient.clientId !== requestedClientId) {
      return res.status(403).render("account/login", {
        title: "Login",
        nav,
        message: "You are not authorized to update that account.",
      });
    }

    // Get freshest data from DB
    const accountData = await accountModel.getAccountById(requestedClientId);
    if (!accountData) {
      req.flash("notice", "Account not found.");
      return res.redirect("/account");
    }

    const client = {
      clientId: accountData.clientid,
      clientFirstname: accountData.clientfirstname,
      clientLastname: accountData.clientlastname,
      clientEmail: accountData.clientemail,
      accountType: accountData.accounttype || "Client",
    };

    res.render("account/update", {
      title: "Update Account",
      nav,
      client,
      errors: null,
      formData: null,
    });
  } catch (err) {
    next(err);
  }
}

/* ****************************************
 *  Process Account Update (POST)
 *  - Handles two separate flows depending on hidden `action` field:
 *    * action === 'changePassword'  -> password change flow
 *    * otherwise -> account info update flow (first/last/email)
 *  - Validators run before this controller (express-validator middleware).
 * *************************************** */
async function updateAccount(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const loggedInClient = res.locals.client || (req.session ? req.session.client : null);

    if (!loggedInClient) {
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        message: "Please log in to update your account.",
      });
    }

    const action = req.body.action || ""; // 'changePassword' when password form submitted
    const accountId = Number(req.body.clientId || req.body.account_id || 0);

    // Ensure requester is the owner of the account being modified
    if (loggedInClient.clientId !== accountId) {
      return res.status(403).render("account/login", {
        title: "Login",
        nav,
        message: "You are not authorized to update that account.",
      });
    }

    // ---------- Password change flow ----------
    if (action === "changePassword") {
      const newPassword = req.body.clientPassword;
      // Password validation has been performed by middleware; proceed to hash and update.
      let hashedPassword;
      try {
        hashedPassword = await bcrypt.hashSync(newPassword, 10);
      } catch (err) {
        req.flash("notice", "There was an error processing your password. Please try again.");
        return res.status(500).render("account/update", {
          title: "Update Account",
          nav,
          client: loggedInClient,
          errors: [{ msg: "Password hashing failed." }],
          formData: null,
        });
      }

      const pwdResult = await accountModel.updatePassword(accountId, hashedPassword);
      if (pwdResult) {
        // Refresh session/client info from DB
        const refreshed = await accountModel.getAccountById(accountId);
        const updatedClient = {
          clientId: refreshed.clientid,
          clientFirstname: refreshed.clientfirstname,
          clientLastname: refreshed.clientlastname,
          clientEmail: refreshed.clientemail,
          accountType: refreshed.accounttype || "Client",
        };
        req.session.client = updatedClient;
        res.locals.client = updatedClient;

        req.flash("notice", "Password changed successfully.");
        return res.redirect("/account");
      } else {
        req.flash("notice", "Password change failed. Please try again.");
        return res.status(500).render("account/update", {
          title: "Update Account",
          nav,
          client: loggedInClient,
          errors: [{ msg: "Password update failed." }],
          formData: null,
        });
      }
    }

    // ---------- Account info update flow (first/last/email) ----------
    const firstName = req.body.clientFirstname;
    const lastName = req.body.clientLastname;
    const email = req.body.clientEmail;

    const infoResult = await accountModel.updateAccount(accountId, firstName, lastName, email);
    if (infoResult) {
      // Reload account row and update session
      const refreshed = await accountModel.getAccountById(accountId);
      const updatedClient = {
        clientId: refreshed.clientid,
        clientFirstname: refreshed.clientfirstname,
        clientLastname: refreshed.clientlastname,
        clientEmail: refreshed.clientemail,
        accountType: refreshed.accounttype || "Client",
      };
      if (req.session) {
        req.session.client = updatedClient;
      }
      res.locals.client = updatedClient;

      req.flash("notice", "Account information updated successfully.");
      return res.redirect("/account");
    } else {
      // Update failed
      req.flash("notice", "Account update failed. Please try again.");
      return res.status(500).render("account/update", {
        title: "Update Account",
        nav,
        client: { clientId: accountId, clientFirstname: firstName, clientLastname: lastName, clientEmail: email },
        errors: [{ msg: "Account update failed." }],
        formData: { clientFirstname: firstName, clientLastname: lastName, clientEmail: email },
      });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  buildManagement,
  buildUpdateAccountView,
  updateAccount,
};