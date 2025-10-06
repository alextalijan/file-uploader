const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const fs = require('fs');

const registerValidations = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username field cannot be empty.')
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must contain between 3 and 20 characters.')
    .custom((value) => {
      return !/\s/.test(value);
    })
    .withMessage('Username cannot contain any empty spaces.'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('You must provide a password.')
    .custom((value) => {
      return !/\s/.test(value);
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
  indexGet: async (req, res) => {
    const folders = await prisma.folder.findMany({
      where: {
        userId: req.user.id,
      },
    });

    const soloFiles = await prisma.file.findMany({
      where: {
        userId: req.user.id,
        folderId: null,
      },
    });

    const docs = [...folders, ...soloFiles];

    res.render('index', { docs });
  },
  registerGet: (req, res) => {
    res.render('register', { errors: null });
  },
  registerPost: [
    registerValidations,
    async (req, res, next) => {
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
  loginGet: (req, res) => {
    res.render('login');
  },
  loginPost: (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
    })(req, res, next);
  },
  logout: (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }

      res.redirect('/login');
    });
  },
  uploadFileGet: async (req, res, next) => {
    let folders;
    try {
      folders = await prisma.folder.findMany({
        where: {
          userId: req.user.id,
        },
      });
    } catch (err) {
      return next(err);
    }

    res.render('uploadFile', { folders });
  },
  uploadFilePost: async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next(new Error('No files uploaded.'));
    }

    // Check if a folder was selected in the form
    const folder = req.body.folder === 'none' ? null : req.body.folder;

    // Insert all files into db
    try {
      await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: `file-uploader/files/${req.user.id}/${req.body.folder || ''}`,
          });

          await fs.promises.unlink(file.path);

          await prisma.file.create({
            data: {
              name: file.originalname,
              url: result.secure_url,
              cloudinaryId: result.public_id,
              sizeInBytes: file.size,
              folderId: folder,
              userId: req.user.id,
            },
          });
        })
      );

      res.redirect('/');
    } catch (err) {
      next(err);
    }
  },
};
