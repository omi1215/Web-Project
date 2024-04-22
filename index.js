const express = require('express');
const port = 3000;
const bodyParser = require('body-parser');
const app = express();
const cars = require('./models');
const offers = require('./offers');
const path = require('path')


app.set('view engine', 'ejs');
app.set('views', './views')
app.use(express.static(path.join(__dirname, 'Assets')));
app.use(express.static(path.join(__dirname, 'public')));
app.get("/", (req, res) => {
    res.render('index', { cars, offers })
})
app.get("/login", (req, res) => {
    res.render('login')
})
app.get("/signup", (req, res) => {
    res.render('signup')
})

app.use(bodyParser.json());


app.post('/signup', (req, res) => {
    console.log("Received sign-up data:", req.body);
    const { first_name, last_name, email } = req.body;

    // Process the received form data (e.g., save to database)

    console.log('First Name:', first_name);
    console.log('Last Name:', last_name);

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

app.listen(5000, () => {
    console.log("server started at http://localhost:5000");
})