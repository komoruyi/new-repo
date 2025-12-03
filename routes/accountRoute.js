const express = require('express')
const router = new express.Router()
const utilities = require('../utilities')
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

// Login view
router.get('/login', utilities.handleErrors(accountController.buildLogin))

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

router.post(
  '/register',
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.loginProcess)
)

// Logout route - destroys session and clears token cookie(s), then redirects home
router.get(
  "/logout",
  utilities.handleErrors(accountController.logout)
)

// Account management view — requires the general login check before delivering the management page
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

/* *******************************
   Update Account Routes
   - GET /account/update/:clientId  -> show account update form (protected)
   - POST /account/update           -> process account update OR password change (protected)
   Both routes require the user to be logged in (utilities.checkLogin).
   *********************************/
router.get(
  "/update/:clientId",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccountView)
)

router.post(
  "/update",
  utilities.checkLogin,
  // Register both rule sets (they are conditional in the validators)
  regValidate.accountUpdateRules(),
  regValidate.passwordRules(),
  // Consolidated check middleware renders update view with errors/sticky data when validation fails
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

module.exports = router