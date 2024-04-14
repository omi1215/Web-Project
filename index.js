const express=require('express');
const app=express();
const cars=require('./models');
const offers = require('./offers');
const path=require('path')


app.set('view engine','ejs');
app.set('views','./views')
app.use(express.static(path.join(__dirname, 'Assets')));
app.use(express.static(path.join(__dirname,'public')));
app.get("/",(req,res)=>{
    res.render('home_models',{cars, offers})
})

app.listen(5000,()=>{
    console.log("server started at http://localhost:5000");
})