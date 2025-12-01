const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation"); // you will create this file

// *******************************
// Inventory Management View
// *******************************
router.get(
  "/",
  utilities.handleErrors(invController.buildManagementView)
);

// *******************************
// Add Classification Routes
// *******************************
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);

router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.registerClassification)
);

// *******************************
// Add Inventory Routes
// *******************************
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
);

router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.registerInventory)
);

// *******************************
// Classification inventory view
// *******************************
router.get("/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// *******************************
// Vehicle detail view
// *******************************
router.get("/detail/:inv_id",
  utilities.handleErrors(invController.buildDetailView)
);

// *******************************
// Intentional 500 error
// *******************************
router.get("/trigger-error",
  utilities.handleErrors(invController.throwError)
);

module.exports = router;
