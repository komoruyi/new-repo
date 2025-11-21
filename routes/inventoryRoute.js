const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Vehicle detail route
router.get("/detail/:inv_id", invController.buildDetailView);

// Intentional 500 error route
router.get("/trigger-error", utilities.handleErrors(invController.throwError));
module.exports = router;