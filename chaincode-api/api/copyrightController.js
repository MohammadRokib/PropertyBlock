const User = require('../models/User.js');

const fss = require('fs');
const qr = require('qrcode');
const path = require('path');
const fs = require('fs').promises;
const base64 = require('base64-js');
const puppeteer = require('puppeteer');
const { Readable } = require('stream');
const { ipfsFetch } = require('ipfs-fetch');

const {
    createAsset,
    getAllAssets,
    readAssetByID,
    checkOrApprove,
    updateAssetInfo,
    downloadAttestation,
} = require('../config/fabricGateway.js');

const pinFileToIPFS = require('../config/pinataConfig.js');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError } = require('../errors');
const { NotFoundError } = require('../errors');
const { url } = require('inspector');

//-- Getting All Copyrights --\\
const getDashboard = async (req, res, next) => {
    const limit = req.query.limit;
    const page = req.query.page || 1;

    const start = (page - 1) * limit;
    const end = page * limit;

    const params = {
        categories: req.user.category,
        owner: req.user.id.toString(),
        userType: req.user.userType.toString(),
    };

    let response = await getAllAssets(params);
    console.log(response);
    if (response.empty) {
        return res.status(StatusCodes.OK).json({
            success: true,
            empty: true,
            msg: 'No data',
        });
    }

    response.data = response.data.slice(start, end);
    response.data = response.data.map(({ FileUrl, ...rest }) => rest);

    res.status(StatusCodes.OK).json(response);
};

//-- Getting a Single Copyright --\\
const getCopyright = async (req, res, next) => {
    const params = {
        id: req.params.id,
        categories: req.user.category,
        owner: req.user.id.toString(),
        userType: req.user.userType.toString(),
    };

    let result = await readAssetByID(params);
    if (result.empty) {
        return res.status(StatusCodes.OK).json({
            success: true,
            empty: true,
            msg: 'Application not found',
        });
    }
    const { FileUrl, ...response } = result;

    res.status(StatusCodes.OK).json({ success: true, data: response });
};

//-- Creating new copyright --\\
const createCopyright = async (req, res, next) => {

    const params = {
        filename: `${req.file.filename}`,
        src: `./uploads/${req.file.filename}`
    };

    // const cid = await pinFileToIPFS(params);
    const cid = 'QmQ51ZAVJiq2GbLBQ1MXsY6GfYDB6K5QYssiAvfMAELWXC';

    req.body.url = cid;
    req.body.status = 'pending';
    req.body.owner = req.user.id.toString();
    req.body.nid = req.user.nid.toString();
    req.body.id = req.user.id + Date.now();

    const response = await createAsset(req.body);
    if (!response) {
        return next(new BadRequestError('Failed to create Asset'));
    }
    res.status(StatusCodes.CREATED).json({ success: true, msg: 'Asset created successfully' });
};

const downloadCopyright = async (req, res, next) => {
    const params = {
        id: req.params.id,
        owner: req.user.id.toString()
    };

    const response = await readAssetByID(params);
    if (!response) {
        return next(new BadRequestError('No data found'));
    }

    const buffer = await ipfsFetch(response.FileUrl.toString());
    const stream = Readable.from(buffer);

    res.setHeader('Content-Disposition', `attachment; filename=${response.NID.toString()}`);
    res.setHeader('Content-Type', 'application/file');

    stream.pipe(res);
};

const updateCopyrightStatus = async (req, res, next) => {

    const params = {
        categories: req.user.category,
        user: req.user.nid.toString(),
        id: req.params.id.toString(),
        comment: req.body.comment.toString(),
        response: req.body.response.toString(),
        userType: req.user.userType.toString(),
    };

    const result = await checkOrApprove(params);
    console.log('Status update');
    console.log(result);
    if (!result) {
        return next(new BadRequestError('Status update failed'));
    }

    res.status(StatusCodes.CREATED).json({ success: true, msg: 'Asset status updated successfully' });
};

const updateCopyrightInfo = async (req, res, next) => {
    const params = {
        filename: `${req.file.filename}`,
        src: `./uploads/${req.file.filename}`,
    };

    // const cid = await pinFileToIPFS(params);
    const cid = 'QmQ51ZAVJiq2GbLBQ1MXsY6GfYDB6K5QYssiAvfMAELWXC';

    req.body.fileurl = cid;
    req.body.owner = req.user.id.toString();
    req.body.id = req.params.id.toString();
    req.body.userType = req.user.userType.toString();

    const response = await updateAssetInfo(req.body);
    if (!response) {
        return next(new BadRequestError('Failed to create Asset'));
    }
    res.status(StatusCodes.CREATED).json({ success: true, msg: 'Asset created successfully' });
};

const downloadCertificate = async (req, res, next) => {
    const params = {
        id: req.params.id,
        owner: req.user.id.toString(),
        userType: req.user.userType.toString(),
    };

    let result = await downloadAttestation(params);
    if (result.empty) {
        return res.status(StatusCodes.OK).json({
            success: true,
            empty: true,
            msg: 'Unable to download Copyright certificate',
        });
    }

    res.status(StatusCodes.OK).json({ success: true, data: result });

    // const link = `http://localhost:3000/api/v1/public/certificate/${result.ID}`;
    // const code = await new Promise((resolve, reject) => {
    //     qr.toDataURL(link, (err, url) => {
    //         if (err) reject(err);
    //         resolve(url);
    //     })
    // });
    // result.QRcode = `${code}`;

    // const htmlFilePath = path.join(__dirname, '../', 'attestation.html');
    // let htmlContent = await fs.readFile(htmlFilePath, 'utf-8');

    // for (const [key, value] of Object.entries(result)) {
    //     const placeholder = new RegExp(`{{${key}}}`, 'g');
    //     htmlContent = htmlContent.replace(placeholder, value);
    // }

    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.setContent(htmlContent);

    // const pdfBuffer = await page.pdf({
    //     format: 'A4',
    //     printBackground: true,
    //     preferCSSPageSize: true,
    // });

    // await browser.close();

    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', 'attachment; filename=download.pdf');
    // res.end(pdfBuffer);
};

const deleteCopyright = async (req, res) => {
    res.send('Delete Copyright');
};

const testController = async (req, res, next) => {
    for (const cat of req.user.category) {
        console.log(cat);
    }
    res.send(req.user);
};

module.exports = {
    getDashboard,
    getCopyright,
    testController,
    createCopyright,
    deleteCopyright,
    downloadCopyright,
    updateCopyrightInfo,
    downloadCertificate,
    updateCopyrightStatus,
};
