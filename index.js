const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./backend/mongoinit');
const cars = require('./models');
const offers = require('./offers');
const bcrypt=require('bcryptjs');
const nodemailer = require('nodemailer');
const app = express();
const port = 5000;

mongoose.connect('mongodb://localhost:27017/Porchse');
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
});

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

const sendVerifyMail = async(firstname, email)=>{
    try{
        const transporter = nodemailer.createTransport({
            host : 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth:{
                user:'f219272@cfd.nu.edu.pk',
                pass:'@studentoffast@'
            }
        });
        const mailOptions ={
            from: 'f219272@cfd.nu.edu.pk',
            to: email,
            subject: 'Email verification',
            html: '<p> Hi '+firstname+'!, please click here to <a href="http://localhost:5000/email_verified?email='+email+'"> verify </a> your email </p>.'
        }
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }
            else{
                console.log("email has been sent:-", info.response);
            }
        })
    }
    catch(error){
        console.log(error.message);
    }
}
app.post('/signup', async (req, res) => {
    const { salutation, first_name, last_name, middle_name, email, password } = req.body;
    try {
        const user = await User.findOne({ email }).lean();
        if (user) {
            return res.status(409).json({ message: 'User already exists' });
        }
        
        bcrypt.genSalt(10, async (err, salt) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            bcrypt.hash(password, salt, async (err, hash) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                try {
                    const userCreated = await User.create({ salutation, first_name, last_name, middle_name, email, password: hash, status: 'user', verified: 0 });
                    if (userCreated) {
                        sendVerifyMail(first_name, email);
                        console.log("User created successfully, redirecting...");
                        return res.json({ success: true, redirectTo: '/email_verify' }); 
                    } else {
                        return res.status(500).json({ error: 'Registration failed' });
                    }
                    
                } catch (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Registration failed' });
                }
            });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



const verifyMail = async (req, res) => {
    try {
        const { email } = req.query;
        const updateInfo = await User.updateOne({ email }, { $set: { verified: 1 } });
        console.log(updateInfo);
        res.render('email_verified'); 
    } catch (error) {
        console.log(error.message);
    }
}

app.get("/email_verified", verifyMail);

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
