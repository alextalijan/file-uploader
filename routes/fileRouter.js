const { Router } = require('express');
const controller = require('../controllers/fileController');
const isLoggedIn = require('../utils/isLoggedIn');

const router = Router();

router.get('/:fileName', controller.fileGet);

module.exports = router;
