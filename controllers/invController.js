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

/**
 * buildEditInventoryView
 * Controller to present the "Edit Inventory" view for a given inventory item.
 * Expects req.params.inv_id to contain the inventory id. Loads the inventory
 * record and classification list, then renders the edit template.
 */
invCont.buildEditInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id, 10);
    if (Number.isNaN(inv_id)) {
      return res.status(400).render("errors/error", {
        title: "Bad Request",
        message: "Invalid inventory id"
      });
    }

    const data = await invModel.getVehicleById(inv_id);

    if (!data) {
      return res.status(404).render("errors/error", {
        title: "Not Found",
        message: "Vehicle not found"
      });
    }

    const nav = await utilities.getNav();
    // Pass the current classification_id so the select list can mark it selected
    const classificationList = await utilities.buildClassificationList(data.classification_id);

    res.render("./inventory/edit-inventory", {
      title: `Edit ${data.inv_make} ${data.inv_model}`,
      nav,
      message: req.flash("notice"),
      errors: null,
      classificationList,
      inv_id: data.inv_id ?? data.invId ?? inv_id,
      inv_make: data.inv_make ?? "",
      inv_model: data.inv_model ?? "",
      inv_year: data.inv_year ?? "",
      inv_description: data.inv_description ?? "",
      inv_image: data.inv_image ?? "/images/no-image.png",
      inv_thumbnail: data.inv_thumbnail ?? "/images/no-image-tn.png",
      inv_price: data.inv_price ?? "",
      inv_miles: data.inv_miles ?? "",
      inv_color: data.inv_color ?? "",
      classification_id: data.classification_id ?? null,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();

    const {
      inv_id: invIdRaw,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body;

    const inv_id = parseInt(invIdRaw, 10);

    // Call model to perform update. Adjust parameter order to match your model signature.
    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    );

    // Determine success: support either rowCount (pg) or returned object
    const success =
      (updateResult && typeof updateResult.rowCount === "number" && updateResult.rowCount > 0) ||
      (updateResult && (updateResult.inv_make || updateResult.inv_model));

    if (success) {
      const make = updateResult?.inv_make ?? inv_make;
      const model = updateResult?.inv_model ?? inv_model;
      const itemName = `${make} ${model}`;
      req.flash("notice", `The ${itemName} was successfully updated.`);
      return res.redirect("/inv/");
    }

    // Update failed: re-render edit-inventory with submitted values (sticky)
    const classificationList = await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the update failed.");
    return res.status(501).render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors: null,
      message: req.flash("notice"),
      inv_id: inv_id || invIdRaw,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
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

    // Build the classification select list for the management view
    const classificationSelect = await utilities.buildClassificationList();

    const message = req.flash("notice");
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      message,
      classificationSelect,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classification_id, 10);
    const invData = await invModel.getInventoryByClassificationId(classification_id);
    if (Array.isArray(invData) && invData.length > 0) {
      return res.json(invData);
    } else {
      // Return an empty array if nothing found so client-side can handle it gracefully
      return res.json([]);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
