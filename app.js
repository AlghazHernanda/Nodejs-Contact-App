const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const { body, validationResult, check } = require('express-validator');
const methodOverride = require('method-override');

const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

require('./utils/db');
const Contact = require('./model/contact')

const app = express();
const port = 3000;

//set up method override
app.use(methodOverride('_method'))

//setup EJS
app.set('view engine', 'ejs')
app.use(expressLayouts)//third party middleware
app.use(express.static('public'));//build in middleware, agar bisa mengakses folder public img dan lainnya
app.use(express.urlencoded({ extended: true }));


//konfigurasi flash message
app.use(cookieParser('secret'))
app.use(session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}))
app.use(flash());

//halaman home
app.get('/', (req, res) => {
    //res.sendFile('./index.html', { root: __dirname })

    const mahasiswa = [
        {
            nama: 'Alghaz',
            email: 'alghaz@gmail'
        },
        {
            nama: 'budi',
            email: 'budi@gmail'
        },
        {
            nama: 'andi',
            email: 'andi@gmail'
        }
    ];

    res.render('index', {
        layout: 'layouts/main-layout',
        nama: 'alghaz hernanda',
        title: 'Halaman Home',
        mahasiswa: mahasiswa
    }); //cara memanggil file yg ada di view
})

app.get('/about', (req, res) => {
    res.render('about', {
        layout: 'layouts/main-layout',
        title: 'Halaman About'
    });
})

app.get('/contact', async (req, res) => {
    const contacts = await Contact.find();

    res.render('contact', {
        layout: 'layouts/main-layout',
        title: 'Halaman Contact',
        contacts: contacts,
        msg: req.flash('msg'),
    });
})

//halaman form tambah data contact, ini harus duluan agar tidak di eksekusi oleh route :nama
app.get('/contact/add', (req, res) => {

    res.render('add-contact', {
        layout: 'layouts/main-layout',
        title: 'Form Tambah Data Contact',

    });
});

//proses tambah data
app.post('/contact',
    [
        //cek validasi semuanyaa
        body('nama').custom(async (value) => {
            const duplikat = await Contact.findOne({ nama: value });
            if (duplikat) {
                throw new Error('Nama contact sudah digunakan!')
            }
            return true;
        }),
        check('email', 'Email tidak valid').isEmail(),
        check('nohp', 'No HP tidak valid').isMobilePhone('id-ID')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //return res.status(400).json({ errors: errors.array()});
            res.render('add-contact', {
                layout: 'layouts/main-layout',
                title: 'Form Tambah Data Contact',
                errors: errors.array(),
            })
        }
        else {
            Contact.insertMany(req.body, (error, result) => {

                //kirimkan flash message
                req.flash('msg', 'Data berhasil ditambahkan!');

                res.redirect('/contact');
            })
        }
    }
);

// //proses delete contact
// app.get('/contact/delete/:nama', async (req, res) => {
//     const contact = await Contact.findOne({ nama: req.params.nama })

//     //jika contact tidka ada
//     if (!contact) {
//         res.status(404);
//         res.send('<h1>404</h1>');
//     }
//     else {
//         Contact.deleteOne({ _id: contact.id }).then((result) => {

//             req.flash('msg', 'Data berhasil dihapus!');

//             res.redirect('/contact');
//         })
//     }
// })


//memakai route 'DELETE'
app.delete('/contact', (req, res) => {
    Contact.deleteOne({ nama: req.params.nama }).then((result) => {

        req.flash('msg', 'Data berhasil dihapus!');
        res.redirect('/contact');
    })
})

//tampilan ubah data contact
app.get('/contact/edit/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama })

    res.render('edit-contact', {
        layout: 'layouts/main-layout',
        title: 'Form Ubah Data Contact',
        contact: contact,

    });
});

//proses ubah data
app.put('/contact',
    [
        //cek validasi semuanyaa
        body('nama').custom(async (value, { req }) => {
            const duplikat = await Contact.findOne({ nama: value });
            if (value !== req.body.oldNama && duplikat) {
                throw new Error('Nama contact sudah digunakan!')
            }
            return true;
        }),
        check('email', 'Email tidak valid').isEmail(),
        check('nohp', 'No HP tidak valid').isMobilePhone('id-ID')
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            //return res.status(400).json({ errors: errors.array()});
            res.render('edit-contact', {
                layout: 'layouts/main-layout',
                title: 'Form Ubah Data Contact',
                errors: errors.array(),
                contact: req.body,
            })
        }
        else {
            Contact.updateOne(
                {
                    _id: req.body._id
                },
                {
                    $set: {
                        nama: req.body.nama,
                        email: req.body.email,
                        nohp: req.body.nohp,
                    }
                }).then((result) => {

                    //kirimkan flash message
                    req.flash('msg', 'Data berhasil diubah!');

                    res.redirect('/contact');
                });
        }
    }
);


//halaman detail contact
app.get('/contact/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama });

    res.render('detail', {
        layout: 'layouts/main-layout',
        title: 'Halaman Detail Contact',
        contact: contact,
    });
})



app.listen(port, () => {
    console.log(`Mongo Contact App | listening at http://localhost:${port}`);
})