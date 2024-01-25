const path = require('path');
const multer = require('multer');
const express = require('express');

const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    filename: (req, file, callback) => {
        console.log('multer');
        const suffix = '-' + Date.now();
        const ext = path.extname(file.originalname);
        callback(null, req.user.nid.toString() + suffix + ext);
        // callback(null, '888' + suffix + ext);
    },
});

const router = express.Router();
const handleUpload = multer({ storage: storage });

const {
    registerLand,
    applicationResubmit,
    getDashboard,
    allCertificates,
    sellLand,
    getLandInfo,
    updateLandStatus,
    downloadNEC,
    downloadCertificate,
} = require('../controllers/assetController.js');

const { getProfile, updateProfile } = require('../controllers/profileController.js');

//-- User profile routes/end-points --\\
router.route('/profile').get(getProfile);
router.route('/profile/update').patch(updateProfile);


router.route('/register').post(handleUpload.single('nec'), registerLand);
router.route('/application/resubmit/:id').post(handleUpload.single('nec'), applicationResubmit);
router.route('/application/:id').get(getLandInfo);
router.route('/applications').get(getDashboard);
router.route('/application/certificates').get(allCertificates);
router.route('/application/transfer/:id').post(sellLand);
router.route('/application/download/:id').get(downloadCertificate);
router.route('/application/download/nec/:id').get(downloadNEC);
router.route('/dashboard').get(getDashboard);

router.route('/application/verify/:id').post(updateLandStatus);

module.exports = router;
