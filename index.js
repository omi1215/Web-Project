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
    console.log("inside post");
    console.log(req.body);
    const { first_name, last_name , email  } = req.body;

  
    console.log('Received sign-up data:', { first_name, last_name , email  });

    
    res.status(200).json({ message: 'User signed up successfully' });
});


app.listen(5000, () => {
    console.log("server started at http://localhost:5000");
})