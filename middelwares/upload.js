const universalFunction = require('../lib/universal-function');
const multer = require('multer');
const Model = require('../models');
const { MESSAGES } = require('../messages/messages');
const { STATUS_CODE } = require('../statusCodes/statusCodes')

module.exports = async function (req, res, next) {
    try {
        let layer = await Model.layers.findOne({ _id: req.query.layerId, isDeleted: false });
        if (!layer) {
            return universalFunction.sendResponse(res,STATUS_CODE.NOT_FOUND,MESSAGES.LAYER_NOT_FOUND);
        }
        let collection = await Model.collections.findOne({_id:layer.collectionId,isDeleted:false});
        if (collection && collection.userId == req.loggedUser.id) {
            req.layer = layer;
            req.uploadedFiles = [];
            multer({
                fileFilter: function (req, file, cb) {
                    if (file.mimetype !== 'image/png') {
                        req.fileValidationError = "IMAGE_MIMETYPE_NOT_SUPPORTED!";
                        return cb(null, false);
                    }
                    cb(null, true);
                },
                storage: multer.diskStorage({
                    destination: async (req, file, cb) => {
                        let directoryPath = `${process.cwd()}/${req.layer.path}`;
                        await universalFunction.makeDirectory(directoryPath);
                        cb(null, directoryPath);
                    },
                    filename: (req, file, cb) => {
                        req.uploadedFiles.push(file.originalname);
                        cb(null, `${file.originalname}`);
                    }
                })
            }).any()(req, res, next);
        } else {
            return universalFunction.sendResponse(res,STATUS_CODE.NOT_FOUND,MESSAGES.COLLECTION_NOT_FOUND)
        }
    } catch (error) {
        return universalFunction.errorResponse(res, MESSAGES.SERVER_ERROR);
    }
};