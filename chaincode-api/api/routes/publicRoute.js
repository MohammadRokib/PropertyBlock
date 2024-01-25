const express = require('express');
const router = express.Router();

const {
    allCertificates,
    getCertificateByID,
} = require('../controllers/assetController.js');

router.route('/application/certificates').get(allCertificates);
router.route('/application/certificate/:id').get(getCertificateByID);

module.exports = router;
