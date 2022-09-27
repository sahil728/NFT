const mongoose = require('mongoose');
const APP_CONSTANTS = require('../constant/APP_CONSTANTS');

const userTypes = [
    APP_CONSTANTS.USER_TYPE.USER,
    APP_CONSTANTS.USER_TYPE.ADMIN
];

const Schema = mongoose.Schema;
const UserModel = new Schema({
    userName: {
        type: String, required :true
    },
    email: {
        type: String, index: true, required: true
    },
    password: {
        type: String, index: true, required: true
    },
    userType: {
        type: String,
        enum: userTypes,
        default: userTypes[0]
    },
    isDeleted: {
        type: Boolean,
        default:false
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
},{timestamps:true});

module.exports = mongoose.model('users', UserModel);