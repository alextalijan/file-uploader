const { Router } = require('express');
const controller = require('../controllers/folderController');
const isLoggedIn = require('../utils/isLoggedIn');

const router = Router();

router.get('/new', isLoggedIn, controller.newFolderGet);
router.post('/new', isLoggedIn, controller.newFolderPost);
router.get('/:folderName/edit', isLoggedIn, controller.editFolderGet);

module.exports = router;
