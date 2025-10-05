const { Router } = require('express');
const controller = require('../controllers/controller');
const multer = require('multer');

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Middleware for protecting routes from logged out users
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login');
  }
}

router.get('/', isLoggedIn, controller.indexGet);
router.get('/register', controller.registerGet);
router.post('/register', controller.registerPost);
router.get('/login', controller.loginGet);
router.post('/login', controller.loginPost);
router.get('/logout', isLoggedIn, controller.logout);
router.get('/upload', isLoggedIn, controller.uploadFileGet);
router.post(
  '/upload',
  isLoggedIn,
  upload.array('files', 10),
  controller.uploadFilePost
);

module.exports = router;
