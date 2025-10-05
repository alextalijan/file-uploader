const { body, validationResult } = require('express-validator');

const registerValidations = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username field cannot be empty.')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must contain between 3 and 20 characters.')
    .custom((value) => {
      return /\s/.test(value);
    })
    .withMessage('Username cannot contain any empty spaces.'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('You must provide a password.'),
  body('passwordConfirmation')
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage('Password and confirmation must match.'),
];

module.exports = {
  indexGet: (req, res) => {},
  registerGet: (req, res) => {
    res.render('register');
  },
};
