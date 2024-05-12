const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./backend/mongoinit');
const cars = require('./models');
const offers = require('./offers');
const bcrypt=require('bcryptjs')

const app = express();
const port = 5000;

mongoose.connect('mongodb://localhost:27017/Porchse', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error: '));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static(path.join(__dirname, 'Assets')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    try {
        const users = await User.find({}).lean(); 
        console.log('All Users:', users);
        res.render('admin', { users }); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
app.post('/admin/updateuser',(req,res)=>{
    const formdata=req.body;
    console.log(formdata);
})
app.get("/buildcar", (req, res) => {
    const index = req.query.index;
    const car = cars[index];
    console.log(car);
    res.render('buildCar', { car });
});

app.get("/login", (req, res) => {
    res.render('login');
});

app.get("/signup", (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { salutation, first_name, last_name, middle_name, email, password } = req.body;
    var n_pass;
        try {
        const user = await User.findOne({ email }).lean();
        if (user) {
            // Handle case if user already exists
        } else {
            bcrypt.genSalt(10,(err,salt)=>{
                bcrypt.hash(password,salt,async(err,hash)=>{
                    if(err){
                        console.error(err);
                        return;
                    }
                    await User.create({ firstname:first_name, middlename:last_name, lastname: middle_name, email: email, password: hash, status: "user",verified:0 });
                    console.log("data entered");
                })
            })
           
        }
        res.status(200).json({
            message: 'User signed up successfully',
            first_name: first_name,
            last_name: last_name
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/forgotpassword", (req, res) => {
    res.render('forgotpassword');
});

app.get("/email_verify", (req, res) => {
    const { email } = req.query;
    res.render('email_verify', { email });
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
