const universalFunction = require('../lib/universal-function');
const Model = require('../models');
const messageList = require("../messages/messages");
const statusCodeList = require("../statusCodes/statusCodes");
const statusCodes = statusCodeList.STATUS_CODE;
const messages = messageList.MESSAGES;
const fs = require('fs');

module.exports.register = async function (req) {
    try {
        let payload = req.body;
        let existingUser = await Model.users.findOne({
            email: payload.email
        });

        if (existingUser) {
            return {
                status: statusCodes.UNPROCESSABLE_ENTITY,
                message: messages.EMAIL_ALREADY_TAKEN
            };
        }
        payload.password = await universalFunction.hashPasswordUsingBcrypt(payload.password);
        let user = await Model.users.create(payload);
        let accessToken = await universalFunction.jwtSign(user);

        return {
            status: statusCodes.CREATED,
            message: messages.USER_REGISTER_SUCCESSFULLY,
            data: {
                accessToken: accessToken,
                userType: user.userType
            }
        };

    } catch (error) {

        throw error;

    }
}

module.exports.login = async function (req) {
    try {

        let payload = req.body;
        let user = await Model.users.findOne({
            email: payload.email,
            isDeleted: false
        });

        if (!user) return {
            status: statusCodes.NOT_FOUND,
            message: messages.USER_NOT_FOUND
        };

        let passwordIsCorrect = await universalFunction.comparePasswordUsingBcrypt(payload.password, user.password);

        if (!passwordIsCorrect) {
            return {
                status: statusCodes.BAD_REQUEST,
                message: messages.INVALID_PASSWORD
            }
        };

        if (user.isBlocked) {
            return {
                status: statusCodes.FORBIDDEN,
                message: messages.USER_NOT_ALLOWDED_TO_LOGIN
            };
        }
        let accessToken = await universalFunction.jwtSign(user);

        return {
            status: statusCodes.SUCCESS,
            message: messages.USER_LOGIN_SUCCESSFULLY,
            data: {
                accessToken: accessToken,
                userType: user.userType
            }
        }
    }
    catch (error) {

        throw error;

    };
}

module.exports.createCollection = async function (payload) {
    try {
        let { loggedUser } = payload;
        if (loggedUser) {
            let { height, width, name } = payload.body;
            let existing = await Model.collections.findOne({ userId: loggedUser._id, name, isDeleted: false });
            if (existing) {
                return {
                    status: statusCodes.UNPROCESSABLE_ENTITY,
                    message: messages.COLLECTION_ALREADY_EXIST
                }
            }
            let format = {
                height: parseInt(height),
                width: parseInt(width)
            };
            const path = `Uploads/${loggedUser.id}/${name}`;
            let collection = await Model.collections.create({
                name,
                format,
                path,
                userId: loggedUser._id
            });
            const buildDir = `${process.cwd()}/${path}/build`;
            const layersDir = `${process.cwd()}/${path}/Layers`;
            await universalFunction.makeDirectory(layersDir);
            await universalFunction.makeDirectory(buildDir);

            return {
                status: statusCodes.CREATED,
                message: messages.COLLECTION_CREATED_SUCCESSFULLY,
                data: { collection }
            }
        }
        else {
            return {
                status: statusCodes.NOT_FOUND,
                message: messages.USER_NOT_FOUND
            }
        };

    } catch (error) {
        throw error;
    }
};

module.exports.getCollections = async function (payload) {
    try {
        let { loggedUser } = payload;
        if (loggedUser) {
            let collections = await Model.collections.find({ userId: loggedUser._id, isDeleted: false });
            return {
                status: statusCodes.SUCCESS,
                message: messages.COLLECTIONS_LOADED_SUCCESSFULLY,
                data: { collections }
            }
        }
        else {
            return { status: statusCodes.NOT_FOUND, message: messages.USER_NOT_FOUND }
        };
    } catch (error) {
        throw error;
    }
};

module.exports.addLayer = async function (payload) {
    try {
        let { loggedUser } = payload;
        let { name } = payload.body;
        if (loggedUser) {
            let collection = await Model.collections.findOne({ userId: loggedUser._id, _id: payload.query.collectionId, isDeleted: false });
            if (!collection) {
                return { status: statusCodes.NOT_FOUND, message: messages.COLLECTION_NOT_FOUND }
            }
            let path = `${collection.path}/Layers/${name}`;
            let layer = await Model.layers.findOne({
                collectionId: collection._id,
                name,
                isDeleted: false
            });
            if (layer) {
                return { status: statusCodes.UNPROCESSABLE_ENTITY, message: messages.LAYER_ALREADY_EXIST }
            }
            await universalFunction.makeDirectory(`${process.cwd()}/${path}`);
            layer = await Model.layers.create({
                name,
                collectionId: collection._id,
                path
            });
            collection.layersOrder.push(layer._id);
            await Model.collections.findByIdAndUpdate(collection._id, {
                layersOrder: collection.layersOrder
            });
            return { status: statusCodes.CREATED, message: messages.LAYER_CREATED_SUCCESSFULLY, data: { layer } }
        }
        else {
            return { status: statusCodes.NOT_FOUND, message: messages.USER_NOT_FOUND }
        };
    } catch (error) {
        throw error;
    }
};

module.exports.getLayers = async (payload) => {
    try {
        let { loggedUser } = payload;
        if (loggedUser) {
            let collection = await Model.collections.findOne({ userId: loggedUser._id, _id: payload.query.collectionId, isDeleted: false });
            if (!collection) {
                return { status: statusCodes.NOT_FOUND, message: messages.COLLECTION_NOT_FOUND }
            };
            let layers = await Model.layers.find({ collectionId: collection._id, isDeleted: false });
            return { status: statusCodes.CREATED, message: messages.LAYERS_LOADED_SUCCESSFULLY, data: { layers } }
        }
        else {
            return { status: statusCodes.NOT_FOUND, message: messages.USER_NOT_FOUND }
        };
    } catch (error) {
        throw error;
    }
};


module.exports.uploadImages = async function (payload) {
    try {
        let { layer } = payload;
        if (payload.fileValidationError) {
            let directoryPath = `${process.cwd()}/${layer.path}`;
            for (let file of payload.uploadedFiles) {
                await universalFunction.deleteFile(`${directoryPath}/${file}`);
            };
            return { status: statusCodes.UNPROCESSABLE_ENTITY, message: payload.fileValidationError }
        }
        else {
            let layerDir = `${process.cwd()}/${layer.path}`;
            const [a, ...layerUrl] = layer.path.split('/');
            const Images = [];
            for (let file of payload.uploadedFiles) {
                if (fs.existsSync(`${layerDir}/${file}`)) {
                    Images.push({
                        name: file,
                        layerId: layer._id,
                        imagePath: `${layer.path}/${file}`,
                        imageUrl: `/Images/${layerUrl.join('/')}/${file}`,
                    });
                }
            };
            let images = await Model.images.insertMany(Images);
            return { status: statusCodes.SUCCESS, message: messages.IMAGES_UPLOADED_SUCCESSFULLY, data: { images } }
        }
    } catch (error) {
        throw error;
    }
};


module.exports.getImages = async function (payload) {
    try {
        let { loggedUser } = payload;
        if (loggedUser) {
            let layer = await Model.layers.findOne({ _id: payload.query.layerId, isDeleted: false });
            if (!layer) {
                return { status: statusCodes.NOT_FOUND, message: messages.LAYER_NOT_FOUND }
            };
            let collection = await Model.collections.findOne({ userId: loggedUser._id, _id: layer.collectionId, isDeleted: false });
            if (!collection) {
                return { status: statusCodes.NOT_FOUND, message: messages.COLLECTION_NOT_FOUND}
            };
            let Images = await Model.images.find({ layerId: layer._id, isDeleted: false });
            return { status: statusCodes.NOT_FOUND, message: messages.IMAGES_LOADED_SUCCESSFULLY, data: { Images } }
        }
        else {
            return { status: statusCodes.NOT_FOUND, message: messages.USER_NOT_FOUND }
        };
    } catch (error) {
        throw error;
    }
};