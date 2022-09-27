const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const nftModel = new Schema({
    collectionId: {
        type: Schema.Types.ObjectId, ref:'collections',index: true, required: true
    },
    jsonPath: {
        type: Schema.Types.String, index: true, required: true
    },
    imageUrl: {
        type: Schema.Types.String, index: true, required: true
    },
    imagePath: {
        type: Schema.Types.String, index: true, required: true
    },
    isDeleted: {
        type: Schema.Types.Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('nfts', nftModel);