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
  - [Project structure](#project-structure)

<!-- /TOC -->
<!-- /TOC -->
<!-- /TOC -->
<!-- /TOC -->

# Introduction
This application is a Node server used for communicating with a python server, a Chemometec instrument and a React client. The server is works in the following flow:
- start WebSocket server
- Fetch robot connection status
- Fetch python server connection
- Fetch XM30 instrument connection
- Fetch Frontend Client connection

The flow will only move on to the next step when a successful connection has been established. E.g. The server will start fetching the Python server connection when the robot connection status is true, aka the robot has an Ip address.

# Getting started

Make sure you have the following installed:

- Node.js
- git
- npm
- Chrome
- Powershell (You can use the one embedded in VS Code)

# Clone repo
Start by cloning the repo. This can be done with the following command in the terminal:
`git clone https://github.com/hdi-chemometec/XmRobotControl.git`

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

The REST server can be accessed at : `http://127.0.0.1:4000`
The WebSocket server can be accessed at : `http://127.0.0.1:8084`

# Code

## Tech stack

The primary tech stack is as follows:

- Typescript - language
- Node.js - server
- ESLint - linting

## Project structure
The project is divided into 3 main parts:
- main file
- src folder
- Types folder

The main file is the file that starts the application and starts the flow. The flow starts with starting up the WebSocket server, and trying to fetch the robot's Ip address.

The src file contains all of the different functions used by the server. These files are divided into similar features. E.g. All of the Rest functions used to communicate with the python server are contained in the `RESTRobotFunctions.ts` folder.

The Types folder contains the different types that are used to test on.