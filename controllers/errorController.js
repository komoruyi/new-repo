const errorController = {};

errorController.throwError = async function (req, res, next) {
  throw new Error("Intentional 500 error for testing");
};

module.exports = errorController;