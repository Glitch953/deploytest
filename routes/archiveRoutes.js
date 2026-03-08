const express = require('express');
const router = express.Router();
const archiveController = require('../controllers/archiveController');

router.get('/', archiveController.getArchiveData);
router.get('/:id', archiveController.getArchiveItemById);
router.post('/', archiveController.createArchiveItem);
router.put('/:id', archiveController.updateArchiveItem);
router.delete('/:id', archiveController.deleteArchiveItem);

module.exports = router;
