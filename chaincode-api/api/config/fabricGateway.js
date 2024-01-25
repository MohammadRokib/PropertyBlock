const fabric_gateway = require("@hyperledger/fabric-gateway");
const util = require("util");
const connect = require('./connect.js');

const channelName = 'mychannel';
const chaincodeName = 'basic';

const mspIdMOL = 'Org1MSP';
const mspIdLRO = 'Org2MSP';
let contractMOL, contractLRO;
const utf8Decoder = new util.TextDecoder();

async function initConnectLedger() {
    return async () => {
        const clientMOL = await connect.newGrpcConnection(
            connect.tlsCertPathMOL,
            connect.peerEndpointMOL,
            connect.molHostAlias,
        );
        const gatewayMOL = await fabric_gateway.connect({
            client: clientMOL,
            identity: await connect.newIdentity(connect.certPathMOL, mspIdMOL),
            signer: await connect.newSigner(connect.keyDirectoryPathMOL),
        });

        const clientLRO = await connect.newGrpcConnection(
            connect.tlsCertPathLRO,
            connect.peerEndpointLRO,
            connect.lroHostAlias,
        );
        const gatewayLRO = await fabric_gateway.connect({
            client: clientLRO,
            identity: await connect.newIdentity(connect.certPathLRO, mspIdLRO),
            signer: await connect.newSigner(connect.keyDirectoryPathLRO),
        });

        try {
            console.log('Starting fabric connection');

            contractMOL = gatewayMOL.getNetwork(channelName).getContract(chaincodeName);
            contractLRO = gatewayLRO.getNetwork(channelName).getContract(chaincodeName);

            console.log('Connected to peer successfully')
        } catch (err) {
            console.log('Error during initalization: ', err);
            process.exit(1);
        }
    }
}

async function userAssets(params) {
    const { owner, userType } = params;
    try {
        const resultBytes = await contractMOL.evaluateTransaction('GetAllUserApplications', owner, userType);
        const resultJson = utf8Decoder.decode(resultBytes);
        let result = JSON.parse(resultJson);
        result = result.reverse();
        console.log(result);

        const statuses = ['pending', 'approved', 'registered', 'rejected', 'for-sale'];
        const statCount = {};
        statuses.forEach(status => statCount[status] = 0);

        result.forEach(entry => {
            const status = entry.Status;
            statCount[status] = (statCount[status] || 0) + 1;
        });

        const stat = {
            Pending: statCount['pending'],
            Approved: statCount['approved'],
            Registered: statCount['registered'],
            Rejected: statCount['rejected'],
            For_Sale: statCount['for-sale'],
        }

        return {
            success: true,
            data: result,
            stat: stat,
        }

    } catch (err) {
        console.log(err);
        return {
            msg: 'No data found',
            empty: true,
        }
    }
}

async function adminAssets(params) {
    const { owner, userType } = params;
    let resultBytes;

    try {
        if (userType == "mol") {
            resultBytes = await contractMOL.evaluateTransaction('GetAllAdminApplications', owner, userType);
        } else {
            resultBytes = await contractLRO.evaluateTransaction('GetAllAdminApplications', owner, userType);
        }
        const resultJson = utf8Decoder.decode(resultBytes);
        let result = JSON.parse(resultJson);
        result = result.reverse();
        console.log(result);

        return {
            success: true,
            data: result,
        }

    } catch (err) {
        console.log(err);
        return {
            msg: 'No data found',
            empty: true,
        }
    }
}

// -- Apply for new Application -- \\
async function createApplication(params) {
    const { dagNo, dist, div, khatianNo, mouza, nec, oName, oNID, payTx, upazila } = params;
    console.log('\n--> Submit Transaction: CreateApplication, creates new application');
    try {
        const resultBytes = await contractMOL.submitTransaction('CreateApplication', dagNo, dist, div, khatianNo, mouza, nec, oName, oNID, payTx, upazila);
        const result = utf8Decoder.decode(resultBytes);

        console.log('*** Transaction committed successfully');
        return result;

    } catch (err) {
        console.log(err);
        return false;
    }
}

async function resubmitApplication(params) {
    const { id, dagNo, dist, div, khatianNo, mouza, nec, oName, oNID, payTx, upazila } = params;
    console.log('\n--> Submit Transaction: CreateApplication, creates new application');
    try {
        const resultBytes = await contractMOL.submitTransaction('ResubmitApplication', id, dagNo, dist, div, khatianNo, mouza, nec, oName, oNID, payTx, upazila);
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);

        console.log('*** Transaction committed successfully');
        return result;

    } catch (err) {
        console.log(err);
        return false;
    }
}

async function getAllApplications(params) {
    let response;
    if (params.userType === 'user') {
        response = await userAssets(params);
    } else {
        response = await adminAssets(params);
    }
    return response;
}

async function getAllCertificates() {
    try {
        const resultBytes = await contractLRO.evaluateTransaction('GetAllCertificates');
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);

        return {
            success: true,
            data: result,
        }
    } catch (err) {
        console.log(err);
        return {
            msg: 'No data found',
            empty: true,
        }

    }
}

async function transferOwnership(params) {
    const { id, oNID, newOName, newONID } = params;
    console.log(params);
    try {
        await contractLRO.submitTransaction('TransferOwnerShip', id, oNID, newOName, newONID);
        console.log('Ownership transfer successful');
        return true;
    } catch (err) {
        console.log(err)
        return false;
    }
}

async function getDeedByID(id) {
    try {
        const resultBytes = await contractMOL.evaluateTransaction('ReadDeedByID', id);
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);

        console.log(result);
        return result;
    } catch (err) {
        console.log(err);
        return {
            msg: 'No application found',
            empty: true,
        }
    }

}

async function getApplicationByID(params) {
    const { id, oNID, userType } = params;
    console.log(params);

    try {
        let resultBytes
        if (userType === "mol" || userType === "user") {
            resultBytes = await contractMOL.evaluateTransaction('ReadApplicationByID', id, oNID, userType);
        } else {
            resultBytes = await contractLRO.evaluateTransaction('ReadApplicationByID', id, oNID, userType);
        }
        const resultJson = utf8Decoder.decode(resultBytes);
        let result = JSON.parse(resultJson);
        console.log(result);
        return result;
    } catch (err) {
        console.log(err);
        return {
            msg: 'No application found',
            empty: true,
        }
    }
}

async function verifyApplication(params) {
    const { id, comment, adminNID, response, userType } = params;
    console.log(params);

    try {
        if (userType == 'mol') {
            await contractMOL.submitTransaction('ApproveApplication', id, comment, adminNID, response, userType);
            console.log('Application approved');
            return true;
        } else if (userType == 'lro') {
            await contractLRO.submitTransaction('RegisterApplication', id, comment, adminNID, response, userType);
            console.log('Application approved');
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }
}

module.exports = {
    initConnectLedger,
    createApplication,
    resubmitApplication,
    getAllApplications,
    getAllCertificates,
    getDeedByID,
    transferOwnership,
    getApplicationByID,
    verifyApplication,
};
