const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    name:String,
    desc:String,
    price:Number,
    image:String,
    front:String,
    side:String,
    back:String,
    power:Number,
    time:Number,
    topspeed:Number,
});

const Car = mongoose.model('Car', carSchema, 'cars'); // Specify the collection name as the third argument

module.exports = Car;