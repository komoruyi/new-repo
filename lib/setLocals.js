// Simple middleware to expose session values to EJS templates
module.exports = function setLocals(req, res, next) {
    // Make sure this runs after express-session is configured so req.session exists
    res.locals.loggedin = !!(req.session && req.session.loggedin);
    res.locals.client = req.session ? req.session.client : null;
    next();
  };