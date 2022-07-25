const joi = require("joi");

const verifyValidation = (req, res, next) => {
  const schema = joi.object({
    email: joi.string().required(),
  });
  const resultValidation = schema.validate(req.body);
  if (resultValidation.error) {
    return res.status(400).json({
      message: "No validate",
      response: null,
      error: resultValidation.error,
    });
  }
  next();
};

module.exports = verifyValidation;
