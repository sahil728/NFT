const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const collectionModel = new Schema({
    userId: {
        type: Schema.Types.ObjectId,ref:'users', index: true, required: true
    },
    name: {
        type: Schema.Types.String, index: true, required: true
    },
    format: {
        type: Object({
            height: Schema.Types.Number,
            width: Schema.Types.Number
        }),
        required:true
    },
    layersOrder: {
        type: Array(Schema.Types.ObjectId),
        default: []
    },
    path: {
        type: Schema.Types.String, index: true, required: true
    },
    isDeleted: {
        type: Schema.Types.Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('collections', collectionModel);