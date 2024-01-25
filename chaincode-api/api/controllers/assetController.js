const User = require('../models/User.js');
const {
    createApplication,
    resubmitApplication,
    getAllApplications,
    getAllCertificates,
    getDeedByID,
    transferOwnership,
    getApplicationByID,
    verifyApplication,
} = require('../config/fabricGateway.js');

const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const { response } = require('express');
// const { NotFoundError } = require('../errors');

const puppeteer = require('puppeteer')
const path = require('path');
const fs = require('fs');
// const { Readable } = require('stream');

// -- Register new Land -- \\
async function registerLand(req, res, next) {
    const params = {
        dagNo: req.body.dagNo.toString(),
        dist: req.body.dist,
        div: req.body.div,
        khatianNo: req.body.khatianNo.toString(),
        mouza: req.body.mouza,
        nec: req.file.filename,
        oName: req.user.name,
        oNID: req.user.nid.toString(),
        payTx: req.body.payTx,
        upazila: req.body.upazila,
    }
    console.log(params);

    const response = await createApplication(params);
    console.log(response);
    if (!response) {
        return next(new BadRequestError('Failed to create Asset'));
    }

    res.status(StatusCodes.CREATED).json({
        success: true,
        msg: `Asset created Successfully`,
        txID: response,
    });
}

async function applicationResubmit(req, res, next) {
    const params = {
        id: req.params.id,
        dagNo: req.body.dagNo.toString(),
        dist: req.body.dist,
        div: req.body.div,
        khatianNo: req.body.khatianNo.toString(),
        mouza: req.body.mouza,
        nec: req.file.filename,
        oName: req.user.name,
        oNID: req.user.nid.toString(),
        payTx: req.body.payTx,
        upazila: req.body.upazila,
    }
    console.log(params);

    const response = await resubmitApplication(params);
    console.log(response);
    if (!response) {
        return next(new BadRequestError('Failed to create Asset'));
    }

    res.status(StatusCodes.CREATED).json({
        success: true,
        msg: `Asset created Successfully`,
        txID: response,
    });
}

async function getDashboard(req, res, next) {
    console.log(req.user);
    console.log(req.body);
    const limit = req.query.limit;
    const page = req.query.page || 1;

    const start = (page - 1) * limit;
    const end = page * limit;

    console.log(start, end);

    const params = {
        owner: req.user.nid.toString(),
        userType: req.user.type,
    };
    console.log(params);

    let response = await getAllApplications(params);
    console.log(response);
    console.log(response.empty);

    if (response.empty || !response) {
        return res.status(StatusCodes.OK).json({
            success: true,
            empty: true,
            msg: 'No application',
        });
    }

    response.data = response.data.slice(start, end);
    res.status(StatusCodes.OK).json(response);
}

async function allCertificates(req, res, next) {
    const limit = req.query.limit;
    const page = req.query.page || 1;

    const start = (page - 1) * limit;
    const end = page * limit;

    let response = await getAllCertificates();
    console.log(response);
    console.log(response.empty);

    if (response.empty || !response) {
        return res.status(StatusCodes.OK).json({
            success: true,
            empty: true,
            msg: 'No Certificates',
        });
    }

    response.data = response.data.slice(start, end);
    res.status(StatusCodes.OK).json(response);
}

async function getCertificateByID(req, res, next) {
    const result = await getDeedByID(req.params.id);
    if (result.empty) {
        return res.status(StatusCodes.OK).json({
            success: true,
            empty: true,
            msg: 'Certificate not found',
        });
    }
    res.status(StatusCodes.OK).json({ success: true, data: result });
}

async function downloadNEC(req, res, next) {
    const params = {
        id: req.params.id,
        oNID: req.user.nid.toString(),
        userType: req.user.type,
    };

    const result = await getApplicationByID(params);
    if (result.empty) {
        return res.status(StatusCodes.OK).json({
            success: true,
            empty: true,
            msg: 'Application not found',
        });
    }
    const filePath = path.join(__dirname, '../', 'uploads', `${result.NEC}`);
    const stream = fs.createReadStream(filePath);

    stream.on('error', (err) => {
        console.error('Error creating stream or reading file:', err);
        return next(new BadRequestError('NEC file not found'));
    });

    // const buffer = await ipfsFetch('QmQ51ZAVJiq2GbLBQ1MXsY6GfYDB6K5QYssiAvfMAELWXC');
    // const stream = Readable.from(buffer);

    res.setHeader('Content-Disposition', `attachment; filename=${req.params.nec}`);
    res.setHeader('Content-Type', 'application/pdf');

    stream.pipe(res);
    stream.on('end', () => {
        res.end();
    });
}

async function downloadCertificate(req, res, next) {
    const result = await getDeedByID(req.params.id);
    console.log(result);
    if (result.empty) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            empty: true,
            msg: 'Certificate not found',
        });
    }

    const templatePath = path.join(__dirname, '../', 'attestation.html');
    let attestation = await fs.readFileSync(templatePath, 'utf-8');

    for (const [key, value] of Object.entries(result)) {
        if (key === 'Authenticators' && Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                const arrayPlaceholder = new RegExp(`{{AUTHENTICATOR_${i + 1}}}`, 'g');
                attestation = attestation.replace(arrayPlaceholder, value[i]);
            }
        } else {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            attestation = attestation.replace(placeholder, value);
        }
    }

    // for (const [key, value] of Object.entries(result)) {
    //     const placeholder = new RegExp(`{{${key}`, 'g');
    //     attestation = attestation.replace(placeholder, value);
    // }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(attestation);

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        landscape: true,
    });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=download.pdf');
    // res.end(pdfBuffer);
    res.send(pdfBuffer);
}

async function sellLand(req, res, next) {

    const nid = req.body.newONID;
    console.log(nid);

    const user = await User.findOne({ nid: nid });
    console.log(user);
    if (!user) {
        console.log('No user');
        return next(new BadRequestError('Buyer is not a verified user 1'));
    }

    const params = {
        id: req.params.id,
        oNID: req.user.nid.toString(),
        newOName: user.name,
        newONID: user.nid.toString(),
    }
    console.log(params);

    const result = await transferOwnership(params);
    console.log(`Status Updated: ${result}`);

    if (!result) {
        return next(new BadRequestError('Failed to transfer land'));
    }

    res.status(StatusCodes.CREATED).json({
        success: true,
        msg: 'Land Ownership successfully updated',
    });
}

async function getLandInfo(req, res, next) {
    const params = {
        id: req.params.id,
        oNID: req.user.nid.toString(),
        userType: req.user.type,
    };

    let result = await getApplicationByID(params);
    if (result.empty) {
        return res.status(StatusCodes.OK).json({
            success: true,
            empty: true,
            msg: 'Application not found',
        });
    }

    res.status(StatusCodes.OK).json({ success: true, data: result });
}

async function updateLandStatus(req, res, next) {
    const params = {
        id: req.params.id,
        comment: req.body.comment,
        adminNID: req.user.nid.toString(),
        response: req.body.response.toString(),
        userType: req.user.type,
    }

    const result = await verifyApplication(params);
    console.log(`Status Updated: ${result}`);

    if (!result) {
        return next(new BadRequestError('Failed to approve land application'));
    }

    res.status(StatusCodes.CREATED).json({
        success: true,
        msg: 'Land application status updated'
    });
}

module.exports = {
    registerLand,
    applicationResubmit,
    getDashboard,
    allCertificates,
    getCertificateByID,
    sellLand,
    getLandInfo,
    updateLandStatus,
    downloadNEC,
    downloadCertificate,
};
