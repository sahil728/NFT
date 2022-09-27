const joi = require('joi');


module.exports.registerSchema = {
    body: joi.object({
        userName: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).required()
    })
};

module.exports.loginSchema = {
    body: joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).required()
    })
};

module.exports.createCollectionSchema = {
    body: joi.object({
        name: joi.string().required(),
        height: joi.number().required(),
        width: joi.number().required()
    })
};

module.exports.addLayerSchema = {
    body: joi.object({
        name: joi.string().required()
    }),
    query: joi.object({
        collectionId: joi.string().hex().length(24).required()
    })
};

module.exports.getLayersSchema = {
    query: joi.object({
        collectionId: joi.string().hex().length(24).required()
    })
};

module.exports.uploadImagesSchema = {
    query: joi.object({
        layerId: joi.string().hex().length(24).required()
    })
};

module.exports.getImagesSchema = {
    query: joi.object({
        layerId: joi.string().hex().length(24).required()
    })
};

module.exports.generateNFTSchema = {
    query: joi.object({
        collectionId: joi.string().hex().length(24).required()
    })
};