const mongoose = require('mongoose');
//mebuat Schema
const Contact = mongoose.model('Contact', {
    nama: {
        type: String,
        required: true,
    },
    nohp: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
})


module.exports = Contact;