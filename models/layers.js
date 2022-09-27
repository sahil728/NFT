const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const layerModel = new Schema({
    collectionId: {
        type: Schema.Types.ObjectId, ref:'collections',index: true, required: true
    },
    name: {
        type: Schema.Types.String, index: true, required: true
    },
    path: {
        type: Schema.Types.String, index: true, required: true
    },
    isDeleted: {
        type: Schema.Types.Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('layers', layerModel);