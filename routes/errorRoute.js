const express = require("express");
const router = express.Router();
const errorController = require("../controllers/errorController");
const utilities = require("../utilities");

router.get(
  "/error-test",
  utilities.handleErrors(errorController.throwError)
);

module.exports = router;