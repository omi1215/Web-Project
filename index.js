const express = require('express');
const port = 3000;
const bodyParser = require('body-parser');
const app = express();
const cars = require('./models');
const offers = require('./offers');
const path = require('path')
const User =require('./backend/mongoinit')
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/Porchse')
const db=mongoose.connection;
db.on('error',console.error.bind(console,'Connection error : '));
db.once('open',function(){
    console.log('connected to Mongo DB');
})

app.set('view engine', 'ejs');
app.set('views', './views')
app.use(express.static(path.join(__dirname, 'Assets')));
app.use(express.static(path.join(__dirname, 'public')));


// app.get("/", (req, res) => {
//     res.render('index', { cars, offers })
// })
// Route to fetch user data from MongoDB and render admin page
// Route to fetch user data from MongoDB and render admin page
app.get("/", async (req, res) => {
    try {
        const users = await User.find({}).lean(); // Fetch users data from MongoDB
        console.log('All Users : ', users);
        res.render('admin', { users }); // Pass users data to the admin view
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



app.get("/buildcar", (req, res) => {
    var index=req.query.index
    var car = cars[index];
    console.log(car);
    res.render('buildCar', {car:car});
});
app.get("/login", (req, res) => {
    res.render('login')
})
app.get("/signup", (req, res) => {
    res.render('signup')
})

app.use(bodyParser.json());


app.post('/signup', (req, res) => {
    const { salutation,first_name, last_name,middle_name, email,password } = req.body;

    // Process the received form data (e.g., save to database)

    console.log(req.body);

    // Send a response back to the client with the processed data
    res.status(200).json({
        message: 'User signed up successfully',
        first_name: first_name,
        last_name: last_name
    });

});

app.get("/forgotpassword", (req, res) => {
    res.render('forgotpassword')
})
app.get("/email_verify", (req, res) => {
    const { email } = req.query;
    res.render('email_verify', { email });
});
app.listen(5000, () => {
    console.log("server started at http://localhost:5000");
})