<a name="readme-top"></a>

<div align="center">

<h3 align="center">Property Block</h3>

<p align="center">
    A Land Registration System on Private Blockchain
    <br />
    <a href="https://github.com/MohammadRokib/PropertyBlock"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/MohammadRokib/PropertyBlock/issues/">Report Bug</a>
    ·
    <a href="https://www.linkedin.com/in/m0hammadrokib/">Linkedin</a>
    ·
    <a href="mohammadrokibkhan@gmail.com">Mail</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#quickstart">Quickstart</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#start-the-network">Start The Network</a></li>
        <li><a href="#install-server-dependencies">Install Server Dependencies</a></li>
        <li><a href="#api-documentation">API Documentation</a></li>
      </ul>
    </li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

In this project, I developed a Land Registration System using Hyperledger Fabric, a private blockchain, to securely store immutable land information and application details. Users can register and sell lands in a secure way. This solution will also prevent the possibility of selling a piece of land multiple times.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* Node.js
* Go
* Hyperledger Fabric
* MongoDB

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

In order to clone and run the project these have to be installed in your machine.

* [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  
  * Check if the installation was successfull or not with `git --version` and you should see a response like `git version x.x.x`

* [Node.js with nvm](https://github.com/nvm-sh/nvm)
  
  * You'll be able to run the following command if you install nodejs:
    
    - `node --version` and get an ouput like: `vx.x.x`

* [Go with gvm](https://github.com/moovweb/gvm)
  
  * You'll be able to run the following command if you install yarn:
    
    * `go version` and get an output like: `go version gox.x.x`

* [Hyperledger Fabric](https://hyperledger-fabric.readthedocs.io/en/release-2.5/getting_started.html)
  * You'll be able to run the following command if the installation was successfull:
    * `docker images` and all the images will show up in the terminal

### Quickstart

```shell
git clone https://github.com/MohammadRokib/PropertyBlock
cd PropertyBlock/chaincode-api/api/
npm i
```

Put this `.env` file in the `PropertyBlock/caincode-api/api` folder with necessary database connection key:

```env
MONGO_URI = 
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

### Start The Network

Type this command from the `PropertyBlock/test-network` folder:

```shell
./startledger.sh
```

This will start the **Fabric Network** with **2 Peers** **1 Orderer** and **Certificate Authority Server** for each.

### Install Server Dependencies
Go to folder: `PropertyBlock/chaincode-api/api`

* Generate public & private keys for JWT authentication:
  * Run this command:
  * `node generateKeypair.js` This will create a public and a private key.

* Start the server with this command:
  * `npm start`

### API Documentation
```shell
You can figure out by looking at the code inside api folder. I will update here soon.
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

MohammadRokib - [Linkedin](https://www.linkedin.com/in/m0hammadrokib/) - mohammadrokibkhan@gmail.com

GitHub: [https://github.com/MohammadRokib](https://github.com/MohammadRokib)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- [Hyperledger-Tutorial](https://hyperledger-fabric.readthedocs.io/en/release-2.5/tutorials.html)

- [Fabric-Sample](https://github.com/hyperledger/fabric-samples)

- [Node-Express-Tutorial](https://www.youtube.com/watch?v=qwfE7fSVaZM)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->

<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->