const express = require('express');
const router = express.Router();
const { uploadFile, getPOData, convertToWO, getWOData } = require('../controllers/fileController');

router.post('/upload', uploadFile);
router.get('/po-data', getPOData);
router.post('/convert-to-wo', convertToWO);
router.get('/wo-data', getWOData);

module.exports = router;