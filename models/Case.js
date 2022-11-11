const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    location: String,
    temperature: Number,
});

const Case = mongoose.model('Case', CaseSchema);

module.exports = Case;