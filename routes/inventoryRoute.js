const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation"); // you will create this file
const jwtAuth = require("../lib/jwtAuth"); // JWT middleware - protects admin routes

// *******************************
// Inventory Management View (ADMIN ONLY)
// *******************************
router.get(
  "/",
  jwtAuth,
  utilities.handleErrors(invController.buildManagementView)
);

// New JSON endpoint used by client-side JS to get inventory for a classification
// This is used by the management UI, so protect it as well.
router.get(
  "/getInventory/:classification_id",
  jwtAuth,
  utilities.handleErrors(invController.getInventoryJSON)
);

// *******************************
// Add Classification Routes (ADMIN ONLY)
// *******************************
router.get(
  "/add-classification",
  jwtAuth,
  utilities.handleErrors(invController.buildAddClassification)
);

router.post(
  "/add-classification",
  jwtAuth,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.registerClassification)
);

// *******************************
// Add Inventory Routes (ADMIN ONLY)
// *******************************
router.get(
  "/add-inventory",
  jwtAuth,
  utilities.handleErrors(invController.buildAddInventory)
);

router.post(
  "/add-inventory",
  jwtAuth,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.registerInventory)
);

// *******************************
// Update Inventory Route (ADMIN ONLY)
// Route: POST /inv/update
// *******************************
router.post(
  "/update",
  jwtAuth,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.updateInventory)
);

// *******************************
// Classification inventory view (PUBLIC)
// *******************************
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// *******************************
// Vehicle detail view (PUBLIC)
// *******************************
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildDetailView)
);

// *******************************
// Edit Inventory view (ADMIN ONLY)
// Route: /inv/edit/:inv_id
// *******************************
router.get(
  "/edit/:inv_id",
  jwtAuth,
  utilities.handleErrors(invController.buildEditInventoryView)
);

// *******************************
// Intentional 500 error
// *******************************
router.get(
  "/trigger-error",
  utilities.handleErrors(invController.throwError)
);

module.exports = router;
