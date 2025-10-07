const { Router } = require('express');
const controller = require('../controllers/folderController');
const isLoggedIn = require('../utils/isLoggedIn');

const router = Router();

router.get('/new', isLoggedIn, controller.newFolderGet);
router.post('/new', isLoggedIn, controller.newFolderPost);
router.get('/:folderName/edit', isLoggedIn, controller.editFolderGet);
router.post('/:folderName/edit', isLoggedIn, controller.editFolderPost);
router.post('/:folderName/delete', isLoggedIn, controller.deleteFolder);
router.get('/:folderName', isLoggedIn, controller.folderGet);
router.post('/:folderName/share', isLoggedIn, controller.shareFolder);

module.exports = router;
