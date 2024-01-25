const grpc = require("@grpc/grpc-js");
const fabric_gateway = require("@hyperledger/fabric-gateway");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const channelName = 'mychannel';
const chaincodeName = 'basic';
const mspIdMOL = 'Org1MSP';
const mspIdLRO = 'Org1MSP';

//-- Crypto materials --\\

// Path to crypto materials.
const cryptoPathMOL = path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com');
const cryptoPathLRO = path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org2.example.com');

// Path to user private key directory.
const keyDirectoryPathMOL = path.resolve(cryptoPathMOL, 'users', 'User1@org1.example.com', 'msp', 'keystore');
const keyDirectoryPathLRO = path.resolve(cryptoPathLRO, 'users', 'User1@org2.example.com', 'msp', 'keystore');

// Path to user certificate.
const certPathMOL = path.resolve(cryptoPathMOL, 'users', 'User1@org1.example.com', 'msp', 'signcerts', 'cert.pem');
const certPathLRO = path.resolve(cryptoPathLRO, 'users', 'User1@org2.example.com', 'msp', 'signcerts', 'cert.pem');

// Path to peer tls certificate.
const tlsCertPathMOL = path.resolve(cryptoPathMOL, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt');
const tlsCertPathLRO = path.resolve(cryptoPathLRO, 'peers', 'peer0.org2.example.com', 'tls', 'ca.crt');

// Gateway peer endpoint.
const peerEndpointMOL = 'localhost:7051';
const peerEndpointLRO = 'localhost:9051';

// Gateway peer SSL host name override.
const molHostAlias = 'peer0.org1.example.com';
const lroHostAlias = 'peer0.org2.example.com';

// --  Connection  -- \\

async function newGrpcConnection(tlsCertPath, peerEndpoint, peerHostAlias) {
    const tlsRootCert = await fs.promises.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

async function newIdentity(certPath, mspId) {
    const credentials = await fs.promises.readFile(certPath);
    return { mspId, credentials };
}

async function newSigner(keyDirectoryPath) {
    const files = await fs.promises.readdir(keyDirectoryPath);
    const keyPath = path.resolve(keyDirectoryPath, files[0]);
    const privateKeyPem = await fs.promises.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return fabric_gateway.signers.newPrivateKeySigner(privateKey);
}

module.exports = {
    cryptoPathMOL,
    cryptoPathLRO,
    keyDirectoryPathMOL,
    keyDirectoryPathLRO,
    certPathMOL,
    certPathLRO,
    tlsCertPathMOL,
    tlsCertPathLRO,
    peerEndpointMOL,
    peerEndpointLRO,
    molHostAlias,
    lroHostAlias,

    newGrpcConnection,
    newIdentity,
    newSigner,
};
