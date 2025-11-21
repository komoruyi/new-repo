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


module.exports = invCont;
