const { Router } = require('express');
const controller = require('../controllers/indexController');
const multer = require('multer');
const isLoggedIn = require('../utils/isLoggedIn');

const router = Router();
const upload = multer({ dest: 'uploads/' });

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
router.get('/share/:folderId', controller.sharedFolderGet);

module.exports = router;
