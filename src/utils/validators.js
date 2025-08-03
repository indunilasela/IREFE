const { validationResult } = require('express-validator');
const { sendError } = require('../utils/responseHelper');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
    
    return sendError(res, 'Validation failed', 400, 'VALIDATION_ERROR', errorMessages);
  }
  
  next();
};

module.exports = {
  validate
};