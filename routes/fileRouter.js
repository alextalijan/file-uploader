const { Router } = require('express');
const controller = require('../controllers/fileController');
const isLoggedIn = require('../utils/isLoggedIn');

const router = Router();

router.get('/:fileName', isLoggedIn, controller.fileGet);
router.post('/:fileName/change-folder', isLoggedIn, controller.changeFolder);
router.post('/:fileName/delete', isLoggedIn, controller.deleteFile);
router.get('/:fileName/download', isLoggedIn, controller.downloadFile);

module.exports = router;
