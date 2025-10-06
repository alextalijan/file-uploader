const { Router } = require('express');
const controller = require('../controllers/fileController');
const isLoggedIn = require('../utils/isLoggedIn');

const router = Router();

router.get('/:fileName', isLoggedIn, controller.fileGet);
router.post('/:fileName/change-folder', isLoggedIn, controller.changeFolder);

module.exports = router;
