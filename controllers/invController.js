const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

invCont.buildDetailView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);

    const data = await invModel.getVehicleById(inv_id);

    if (!data) {
      return res.status(404).render("errors/error", {
        title: "Not Found",
        message: "Vehicle not found."
      });
    }

    const nav = await utilities.getNav();

    res.render("./inventory/details", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      vehicle: data
    });
  } catch (error) {
    next(error);
  }
};

// Intentional 500 error for testing
invCont.throwError = async function(req, res, next) {
  throw new Error("Intentional server error for testing.");
};

/* ****************************************
 * Task 1: Build Management View
 * **************************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const message = req.flash("notice");
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      message,
    });
  } catch (error) {
    next(error);
  }
};

/* ****************************************
 * Task 2a: Build Add Classification View
 * **************************************** */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const message = req.flash("notice");
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      message,
      errors: null,
      classification_name: "",
    });
  } catch (error) {
    next(error);
  }
};

/* ****************************************
 * Task 2b: Register Classification
 * **************************************** */
invCont.registerClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const { classification_name } = req.body;

    const result = await invModel.addClassification(classification_name);

    if (result.rowCount > 0) {
      req.flash("notice", `Classification "${classification_name}" added successfully.`);
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Failed to add classification.");
      res.status(501).render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        message: req.flash("notice"),
        errors: null,
        classification_name,
      });
    }
  } catch (error) {
    next(error);
  }
};

/* ****************************************
 * Task 3a: Build Add Inventory View
 * **************************************** */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    const message = req.flash("notice");

    res.render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      message,
      errors: null,
      classificationList,
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      inv_image: "/images/no-image.png",
      inv_thumbnail: "/images/no-image-tn.png",
    });
  } catch (error) {
    next(error);
  }
};

/* ****************************************
 * Task 3b: Register Inventory
 * **************************************** */
invCont.registerInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
    } = req.body;

    const invImg = inv_image || "/images/no-image.png";
    const invThumb = inv_thumbnail || "/images/no-image-tn.png";

    const result = await invModel.addInventory(
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      invImg,
      invThumb,
      inv_price,
      inv_miles,
      inv_color
    );

    if (result.rowCount > 0) {
      req.flash("notice", `Inventory item "${inv_make} ${inv_model}" added successfully.`);
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Failed to add inventory item.");
      const classificationList = await utilities.buildClassificationList(classification_id);
      res.status(501).render("./inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        message: req.flash("notice"),
        errors: null,
        classificationList,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_price,
        inv_miles,
        inv_color,
        inv_image: invImg,
        inv_thumbnail: invThumb,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
