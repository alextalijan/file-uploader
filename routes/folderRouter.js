const { Router } = require('express');
const controller = require('../controllers/folderController');
const isLoggedIn = require('../utils/isLoggedIn');

const router = Router();

router.get('/new', isLoggedIn, controller.newFolderGet);
router.post('/new', isLoggedIn, controller.newFolderPost);
router.get('/:folderId/edit', isLoggedIn, controller.editFolderGet);
router.post('/:folderId/edit', isLoggedIn, controller.editFolderPost);
router.post('/:folderId/delete', isLoggedIn, controller.deleteFolder);
router.get('/:folderId', isLoggedIn, controller.folderGet);
router.post('/:folderId/share', isLoggedIn, controller.shareFolder);

module.exports = router;
