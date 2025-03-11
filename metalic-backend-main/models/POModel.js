const mongoose = require('mongoose');

const POMetaSchema = new mongoose.Schema({
    poNumber: { type: String, required: true, unique:true },
    poDate: { type: String, required: true },
    fileName: { type: String, required: true, unique:true },
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('POMeta', POMetaSchema);