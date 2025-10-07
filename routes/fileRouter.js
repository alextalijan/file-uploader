const { Router } = require('express');
const controller = require('../controllers/fileController');
const isLoggedIn = require('../utils/isLoggedIn');

const router = Router();

router.get('/:fileId', isLoggedIn, controller.fileGet);
router.post('/:fileId/change-folder', isLoggedIn, controller.changeFolder);
router.post('/:fileId/delete', isLoggedIn, controller.deleteFile);
router.get('/:fileId/download', controller.downloadFile);

module.exports = router;
