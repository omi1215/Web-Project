const express = require('express');
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

app.listen(5000, () => {
    console.log("server started at http://localhost:5000");
})