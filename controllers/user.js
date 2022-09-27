const Handler = require("../handlers");
const APP_CONSTANTS = require('../constant/APP_CONSTANTS');
const universalFunction = require("../lib/universal-function");



module.exports.register = async function (req, res) {
    try {
        const response = await Handler.user.register(req);
        return universalFunction.sendResponse(res, response.status, response.message, response.data);

    } catch (error) {

        return universalFunction.errorResponse(res, error);

    }
};

module.exports.login = async function (req, res) {
    try {
        
        const response = await Handler.user.login(req);
        return universalFunction.sendResponse(res, response.status, response.message, response.data);

    } catch (error) {

        return universalFunction.errorResponse(res, error);

    }
};

module.exports.createCollection = async (req, res) => {
    try {
        const response = await Handler.user.createCollection(req);
        await universalFunction.sendResponse(res, response.status, response.message, response.data);
    } catch (error) {
        return universalFunction.errorResponse(res, error);
    }
};

module.exports.getCollections = async (req, res) => {
    try {
        const response = await Handler.user.getCollections(req);
        await universalFunction.sendResponse(res, response.status, response.message, response.data);
    } catch (error) {
        return universalFunction.errorResponse(res, error);
    }
};

module.exports.addLayer = async (req, res) => {
    try {
        const response = await Handler.user.addLayer(req);
        await universalFunction.sendResponse(res, response.status, response.message, response.data);
    } catch (error) {
        return universalFunction.errorResponse(res, error);
    }
};

module.exports.getLayers = async (req, res) => {
    try {
        const response = await Handler.user.getLayers(req);
        await universalFunction.sendResponse(res, response.status, response.message, response.data);
    } catch (error) {
        return universalFunction.errorResponse(res, error);
    }
};


module.exports.uploadImages = async (req, res) => {
    try {
        const response = await Handler.user.uploadImages(req);
        await universalFunction.sendResponse(res, response.status, response.message, response.data);
    } catch (error) {
        return universalFunction.errorResponse(res, error);
    }
};

module.exports.getImages = async (req, res) => {
    try {
        const response = await Handler.user.getImages(req);
        await universalFunction.sendResponse(res, response.status, response.message, response.data);
    } catch (error) {
        return universalFunction.errorResponse(res, error);
    }
};