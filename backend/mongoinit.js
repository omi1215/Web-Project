const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    salutation:String,
    title:String,
    firstname: String,
    middlename: String,
    lastname: String,
    email: String,
    password: String,
    status: String,
    verified:Number,
});

const User = mongoose.model('User', userSchema, 'user'); // Specify the collection name as the third argument

module.exports = User;
