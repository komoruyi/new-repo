const utilities = require("./index");
const invModel = require("../models/inventory-model");
const { body, validationResult } = require("express-validator");
const validate = {};

/* **********************************
 * Classification Data Validation Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a classification name.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name cannot contain spaces or special characters."),
  ];
};

validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name,
    });
  }
  next();
};

/* **********************************
 * Inventory Data Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Please select a classification."),
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide the vehicle make."),
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide the vehicle model."),
    body("inv_year")
      .trim()
      .notEmpty()
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Please provide a valid year."),
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a description."),
    body("inv_price")
      .trim()
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid price."),
    body("inv_miles")
      .trim()
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Please provide valid miles."),
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide the vehicle color."),
  ];
};

validate.checkInventoryData = async (req, res, next) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classification_id);

    return res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      classificationList,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });
  }
  next();
};

module.exports = validate;