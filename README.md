# Node Server

<!-- TOC -->

- [Node Server](#node-server)
- [Introduction](#introduction)
- [Getting started](#getting-started)
- [Clone repo](#clone-repo)
- [Installing dependencies](#installing-dependencies)
- [Build and run](#build-and-run)
- [Code](#code)
    - [Tech stack](#tech-stack)

<!-- /TOC -->
<!-- /TOC -->
<!-- /TOC -->
<!-- /TOC -->

# Introduction
This application is a Node server used for communicating with a python server, a Chemometec instrument and a React client. 

# Getting started

Make sure you have the following installed:

- Node.js
- git
- npm
- Chrome
- Powershell (You can use the one embedded in VS Code)

# Clone repo
Start by cloning the repo. This can be done with the following command in the terminal:
`git clone https://github.com/hdi-chemometec/RobotServer.git`

# Installing dependencies
Before the application can be run you will need to install it's dependencies. This can be done with the following command in the terminal:
`npm install`

# Build and run

**Run server**
There's a number of scripts that can be used to build and test the applications. These scripts can be found in the package.json file in the root folder of the project. The most important scripts are listed below:

**Build server**
The project is written in TypeScript. When building the project there will be build a corresponding Javascript file that is run when starting the server.

This will build the server:
`npm run build`

**Run server**
This will start the server:
`npm start`

The server can be accessed at : `http://127.0.0.1:8083` 

# Code

## Tech stack

The primary tech stack is as follows:

- Typescript - language
- Node.js - server
- ESLint - linting

**Project structure**
The projects structure has the different features put into different folders.