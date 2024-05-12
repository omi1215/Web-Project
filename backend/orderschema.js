const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    email:String,
    ammount:Number,
    date:String,
    status:String,
    carname:String,
    color:String,
    rim:String,
});

const order = mongoose.model('order', orderSchema, 'orders'); // Specify the collection name as the third argument

module.exports = order;