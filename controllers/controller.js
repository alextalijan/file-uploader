const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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
    .withMessage('You must provide a password.')
    .custom((value) => {
      return /\s/.test(value);
    })
    .withMessage('Password cannot contain any empty spaces.'),
  body('passwordConfirmation')
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage('Password and confirmation must match.'),
];

const prisma = new PrismaClient();

module.exports = {
  indexGet: (req, res) => {},
  registerGet: (req, res) => {
    res.render('register');
  },
  registerPost: [
    registerValidations,
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.locals.inputs = {
          username: req.body.username,
          password: req.body.password,
          passwordConfirmation: req.body.passwordConfirmation,
        };
        res.render('register', { errors: errors.array() });
      }

      // Check if the username already exists
      const user = await prisma.user.findUnique({
        where: {
          username: req.body.username.trim().toLowerCase(),
        },
      });
      if (user) {
        return next(
          new Error('This username is already in use. Please try another one.')
        );
      }

      // Generate user's hash
      let hash;
      try {
        hash = await bcrypt.hash(req.body.password.trim(), 10);
      } catch (err) {
        next(err);
      }

      // Add user to the database
      await prisma.user.create({
        data: {
          username: req.body.username.trim().toLowerCase(),
          hash,
        },
      });

      res.redirect('/login');
    },
  ],
};
