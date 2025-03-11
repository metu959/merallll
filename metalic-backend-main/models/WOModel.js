const mongoose = require('mongoose');

const WOSchema = new mongoose.Schema({
    poNumber: { type: String, required: true },
    woNumber: { type: String, required: true, unique: true },
    poDate: { type: String, required: true }
});

module.exports = mongoose.model('WOModel', WOSchema);
