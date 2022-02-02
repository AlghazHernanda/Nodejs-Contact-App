const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/alz', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});


// //menambah 1 data
// const contact1 = new Contact({
//     nama: 'alghazzz',
//     nohp: '08187273722',
//     email: 'alghaz.h@gmail.com'
// })

// //simpan ke collection
// contact1.save().then((contact) => console.log(contact))