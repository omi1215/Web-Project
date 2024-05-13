const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./backend/mongoinit');
const Car=require('./backend/carschema')
const order=require('./backend/orderschema')
const getCarsFromDB = require('./models');
const offers = require('./offers');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const session=require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);

const bcrypt=require('bcryptjs')
const multer  = require('multer');
const { type } = require('os');
const app = express();
const port = 5000;
var cars;
var logined=0;
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



(async () => {
    try {
        cars = await getCarsFromDB();
    } catch (error) {
        console.error('Error:', error);
    }
})();
app.get('/',(req,res)=>{
    res.render('index',{cars,offers});
})


const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/Porchse',
    collection: 'sessions'
  });


  app.use(session({
    name: 'biscuit',
    secret: 'abc',
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 * 2 // 2 hours
    }
  }));
  store.on('error', function(error) {
    console.error(error);
  });

// Define the middleware function to calculate the total amount
const calculateTotalAmount = async (req, res, next) => {
    try {
        const totalAmountAggregate = await order.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" } // Corrected field name to "amount"
                }
            }
        ]);

        // Attach the total amount to the request object
        req.totalAmount = totalAmountAggregate.length > 0 ? totalAmountAggregate[0].totalAmount : 0;
        
        next(); // Call next to proceed to the next middleware/route handler
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
};

// Apply the middleware to routes where you want to access the total amount
app.use(calculateTotalAmount);

app.get('/admin', async (req, res) => {
    try {
        if(req.session.email){
        const user = await User.findOne({ email: req.session.email });
        if(user.status=='admin'){
            res.render('admin', {
                cars:cars,
                template:'',
                totalAmount: req.totalAmount // Access totalAmount from the request object
            });
        }
        else{
            res.redirect('/');
        }
       }
       else{
        res.redirect('/login');
       }
       
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/admin/createcar',async(req,res)=>{
    if(req.session.email){
        const user = await User.findOne({ email: req.session.email });
        if(user.status=='admin'){
            res.render('admin', { 
                cars:cars,
                totalAmount: req.totalAmount ,
                template: 'createcar', 
            });
        }
        else{
            res.redirect('/');
        }
    }
    else{
        res.redirect('/login');
    }
   
})
app.get('/admin/updatecar', async(req,res)=>{
    if(req.session.email){
        const user = await User.findOne({ email: req.session.email });
        if(user.status=='admin'){
            res.render('admin', { 
                cars:cars,
                totalAmount: req.totalAmount ,
                template: 'updatecar', 
            });
        }
        else{
            res.redirect('/');
        }
    }
    else{
        res.redirect('/login');
    }
    
})
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './Assets');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = `${Date.now()}-${file.originalname}`;
      cb(null, file.fieldname + '-' + uniqueSuffix);
    }
  });
  const upload = multer({ storage: storage })
  app.post('/admin/createcar', upload.fields([{ name: 'cover' }, { name: 'front' }, { name: 'side' }, { name: 'back' }]), async (req, res) => {
    try {
        const data = req.body;
        const files = req.files;

        
        const { cover, front, side, back } = files;

        const existingCar = await Car.findOne({ name: data.carname });
        if (existingCar) {
            
            console.error("Car with the same name already exists");
            return res.status(400).send("A car with the same name already exists");
        }

        
        await Car.create({
            name: data.carname,
            desc: data.desc,
            price: data.price,
            image: cover[0].path, 
            front: front[0].path,
            side: side[0].path,
            back: back[0].path,
            power: data.power,
            time: data.time,
            topspeed: data.topspeed
        });

        console.log("Car entered successfully");
        return res.redirect('/admin/createcar');
    } catch (error) {
        console.error("Error creating car:", error);
        return res.status(500).send("Internal Server Error");
    }
});



const CARS_PER_PAGE = 2;

app.get("/admin/showcars", async (req, res) => {
    try {
        // Get the page number from the query parameters, default to 1
        const page = parseInt(req.query.page) || 1;

        // Calculate skip value for pagination
        const skip = (page - 1) * CARS_PER_PAGE;

        // Initialize filter object
        const filter = {};

        // Check if searchname parameter exists and is not empty
        if (req.query.searchname && req.query.searchname.trim() !== '') {
            // Apply filter for car name search
            filter.name = { $regex: new RegExp(req.query.searchname.trim(), 'i') }; // Case insensitive search
        }

        // Count total number of cars based on filters
        const totalCars = await Car.countDocuments(filter);

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalCars / CARS_PER_PAGE);

        // Fetch cars for the current page based on filters
        const cars = await Car.find(filter).skip(skip).limit(CARS_PER_PAGE).lean();

        // Pass data to the view
        if(req.session.email){
            const user = await User.findOne({ email: req.session.email });
            if(user.status=='admin'){
                res.render('admin', { 
                    totalAmount: req.totalAmount ,
                    cars, 
                    template: 'showcars', 
                    totalPages,
                    currentPage: page
                });
            }
            else{
                res.redirect('/');
            }
        }
        else{
            res.redirect('/login');
        }
       
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/admin/deletecar',async (req,res)=>{
    if(req.session.email){
        const user = await User.findOne({ email: req.session.email });
        if(user.status=='admin'){
            res.render('admin', { 
                cars:cars,
                totalAmount: req.totalAmount ,
                template: 'deletecar', 
            });
        }
        else{
            res.redirect('/');
        }
    }
    else{
        res.redirect('/login');
    }
    
})
app.post('/admin/deletecar', async (req, res) => {
    const { deletecar } = req.body;
    try {
        // Find the car in the database based on its name
        const car = await Car.findOne({ name: deletecar });

        // Check if car exists
        if (!car) {
            // No car found with the specified name
            return res.status(400).send(`No car found with name ${deletecar}`);
        }
        
        // If car exists, proceed to delete
        await Car.deleteOne({ name: deletecar });

        // Send a success response without clearing the page
        res.redirect('/admin/deletecar');
    } catch (error) {
        // Handle errors
        console.error('Error deleting car:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/admin/updatecar', upload.fields([{ name: 'cover' }, { name: 'front' }, { name: 'side' }, { name: 'back' }]), async (req, res) => {
    try {
        const data = req.body;
        const files = req.files;
        const { cover, front, side, back } = files;
        
        const existingCar = await Car.findOne({ name: data.ucarname });

        if (!existingCar) {
            console.error("Car with the specified name does not exist");
            return res.status(404);
        }

        // Update only the fields that are non-empty
        const updateFields = {};
        if (data.carname) updateFields.name = data.carname;
        if (data.desc) updateFields.desc = data.desc;
        if (data.price) updateFields.price = data.price;
        if (cover && cover.length > 0) updateFields.image = cover[0].path;
        if (front && front.length > 0) updateFields.front = front[0].path;
        if (side && side.length > 0) updateFields.side = side[0].path;
        if (back && back.length > 0) updateFields.back = back[0].path;
        if (data.power) updateFields.power = data.power;
        if (data.time) updateFields.time = data.time;
        if (data.topspeed) updateFields.topspeed = data.topspeed;

        // Update the existing car with the non-empty fields
        await Car.updateOne({ name: data.ucarname }, updateFields);

        console.log("Car updated successfully");
        return res.redirect('/admin/createcar');
    } catch (error) {
        console.error("Error updating car:", error);
        return res.status(500).send("Internal Server Error");
    }
});


const ITEMS_PER_PAGE = 10;
app.get("/admin/showuser", async (req, res) => {
    try {
        // Get the page number from the query parameters, default to 1
        const page = parseInt(req.query.page) || 1;

        // Calculate skip value for pagination
        const skip = (page - 1) * ITEMS_PER_PAGE;

        // Initialize filter object
        const filter = {};

        // Check if searchname parameter exists and is not empty
        if (req.query.searchname && req.query.searchname.trim() !== '') {
            // Apply filter for name search
            filter.firstname = { $regex: new RegExp(req.query.searchname.trim(), 'i') }; // Case insensitive search
        }

        // Check if searchemail parameter exists and is not empty
        if (req.query.searchemail && req.query.searchemail.trim() !== '') {
            // Apply filter for email search
            filter.email = { $regex: new RegExp(req.query.searchemail.trim(), 'i') }; // Case insensitive search
        }

        // Count total number of users based on filters
        const totalUsers = await User.countDocuments(filter);

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

        // Fetch users for the current page based on filters
        const users = await User.find(filter).skip(skip).limit(ITEMS_PER_PAGE).lean();
        if(req.session.email){
            const user = await User.findOne({ email: req.session.email });
            if(user.status=='admin'){
                res.render('admin', { 
                    cars:cars,
                    totalAmount: req.totalAmount ,
                    users, 
                    template: 'showuser', 
                    totalPages,
                    currentPage: page
                });
            }
            else{
                res.redirect('/');
            }
        }
        else{
            res.redirect('/login');
        }

        // Pass data to the view
       
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get("/admin/deleteuser",async (req,res)=>{
    if(req.session.email){
        const user = await User.findOne({ email: req.session.email });
        if(user.status=='admin'){
            res.render('admin',{ totalAmount: req.totalAmount ,template:'deleteuser',cars:cars});
        }
        else{
            res.redirect('/');
        }
    }
    else{
        res.redirect('/login');
    }
    
});
app.get("/admin/updateuser", async (req,res)=>{
    if(req.session.email){
        const user = await User.findOne({ email: req.session.email });
        if(user.status=='admin'){
            res.render('admin',{ totalAmount: req.totalAmount ,template:'updateuser',cars:cars})
        }
        else{
            res.redirect('/');
        }
    }
    else{
        res.redirect('/login');
    }
   
});
// Inside index.js

// Handle create user request
app.post('/admin/showuser', async (req, res) => {
    const formData = req.body;
  
    // Process create user data
    res.sendStatus(200);
});
app.post('/admin/createUser', async (req, res) => {
    const formData = req.body;
    // Process create user data
    res.sendStatus(200);
});

app.post('/admin/updateUser', async (req, res) => {
    const { updateuser, updateemail, updatepassword, updatefirstname, middlename, updatelastname } = req.body;
    try {
        // Find user with the specific email
        const user = await User.findOne({ email: updateuser });
        if (!user) {
            // No user found with the specified email
            return res.status(400).send(`No user found with ${updateuser}`);
        }

        if (updateemail && updateemail !== updateuser) {
            // Check if the new email already exists
            const existingUser = await User.findOne({ email: updateemail });
            if (existingUser) {
                return res.status(400).send(`User already exists with ${updateemail}`);
            }
        }

        const updateData = {};
        if (updateemail) updateData.email = updateemail;
        if (updatefirstname) updateData.firstname = updatefirstname;
        if (middlename) updateData.middlename = middlename;
        if (updatelastname) updateData.lastname = updatelastname;
        if (updatepassword) {
            // Hash the new password
            const hashedPassword = await bcrypt.hash(updatepassword, 10);
            updateData.password = hashedPassword;
        }
        // You can add more fields to update here

        // Check if any update data is provided
        if (Object.keys(updateData).length > 0) {
            // Update user based on their email address
            await User.updateOne({ email: updateuser }, updateData);
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
    }
});




// Handle delete user request
app.post('/admin/deleteuser', async (req, res) => {
    const { deleteuser } = req.body;

    try {
        // Find the user in the database based on their email
        const user = await User.findOne({ email: deleteuser });

        // Check if user exists
        if (!user) {
            // No user found with the specified email
            return res.status(400).send(`No user found with ${deleteuser}`);
        }
        
        // If user exists, proceed to delete
        await User.deleteOne({ email: deleteuser });

        // Send a success response without clearing the pagee
    } catch (error) {
        // Handle errors
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




app.get("/buildcar", (req, res) => {
    const index = req.query.index;
    req.session.ind
    res.render('buildCar', { cars,index });
});
app.get('/buycar', async (req, res) => {
    try {
        // Access order data from session
        const { name, selectedrim, selectedcolor, price, email } = req.session.orderdata;

        // Create a new order document directly in the database
         await order.create({
            email: email,
            ammount: price,
            date: new Date().toISOString(),
            status: 'confirmed',
            carname: name,
            color: selectedcolor,
            rim: selectedrim
        });

        // Redirect to the order confirmation page or render it directly
        res.render('orderconfirm', { name, selectedrim, selectedcolor, price, email, cars });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).send("Error creating order");
    }
});

app.post("/buildCar", (req, res) => {
    try {

        // Access the data sent from the client-side
        const name = req.body.name;
        const selectedrim = req.body.selectedrim;
        const selectedcolor = req.body.selectedcolor;
        let price = req.body.price;
        price = parseInt(price);
        price = price + 1500 + 2500;
        email=req.session.email;
        if (req.session.email) {
            req.session.orderdata={ name, selectedrim, selectedcolor, price, email };
            res.redirect('/buycar');
        } else {
            res.redirect('/login'); 
        }
    } catch (error) {
        console.error("Error rendering order confirmation:", error);
        res.status(500).send("Error rendering order confirmation page");
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Failed to logout');
        } else {
            // Optionally, you can clear any session-related cookies
            res.clearCookie('biscuit');
            res.status(200).send('Logged out successfully');
        }
    });
});


const loginLoad = async(req,res)=>{
    try{
        // Check if user is already logged in
        if(req.session.email){
            console.log(`User ${req.session.email} is already logged in, redirecting to default route`);
            return res.redirect('/user_dash'); // Redirect to default route
        }
        res.render('login');
    } catch(error){
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body; 
        console.log(req.body);
        const userData = await User.findOne({ email: email });
        if (userData) {
            const passMatch =bcrypt.compare(password, userData.password);
            console.log(passMatch);
            if (passMatch) {
                if (userData.verified == 0) {
                    res.render('login', { message: 'Please verify your email' }); 
                } else {
                    req.session.email=email;
                    if(userData.status=='admin'){
                        res.redirect('/admin'); 
                    }
                    else{
                    res.redirect('/'); 
                    }
                    
                    
                }
            } else {
                res.render('login', { message: "Email and password is incorrect" });
            }
        } else {
            res.render('login', { message: "Email and password is incorrect" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}
app.post('/login',verifyLogin);
app.get('/login',loginLoad);

app.get("/signup", (req, res) => {
    res.render('signup',{cars:cars});
});

const sendVerifyMail = async(firstname, email)=>{
    try{
        const token = jwt.sign({ email, timestamp: Date.now() }, 'abc', { expiresIn: '15m' });
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
            html: '<p> Hi '+firstname+'!, please click here to <a href="http://localhost:5000/email_verified?email='+email+'&token='+token+'"> verify </a> your email </p>.'
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

app.post('/user_dash', async (req, res) => {
    try {
        const {newEmail } = req.body;

        // Find the user with the old email
        const user = await User.findOne({ email: req.session.email });

        if (!user) {
            // No user found with the old email
            return res.status(404).send('User not found');
        }

        // Update the user's email
        user.email = newEmail;
        req.session.email=newEmail;

        // Save the updated user
        await user.save();

        // Redirect back to the user dashboard
        res.redirect('/user_dash');
    } catch (error) {
        console.error('Error updating user email:', error);
        res.status(500).send('Internal Server Error');
    }
});


const verifyMail = async (req, res) => {
    var em;
    try {
        const {email,token}=req.query;
        em=email;
        const decoded = jwt.verify(token, 'abc');
        
        // Check if the token is expired
        const currentTime = Date.now();
        const expirationTime = decoded.timestamp + (15 * 60 * 1000); 
        console.log(`current time is ${currentTime}`);
        console.log(`expiration time is ${expirationTime}`);
        if (currentTime > expirationTime) {
           
            return res.status(400).send('Verification link has expired. Please request a new one.');
        }

        // Proceed with the verification process
        const updateInfo = await User.updateOne({ email }, { $set: { verified: 1 } });
        res.render('email_verified');
    } catch (error) {
       
        if(error.message=='jwt expired'){
            try{

                const user = await User.findOne({ email: em });
                if(!user){return res.status(404)}
                await User.deleteOne({ email: em });
                }catch(error){
                    console.log("error deleting user ");
                    return res.status(400).send('Try different email or contact our helpline porchse@gmail.com');
                }
         return res.status(500).send('Email expired');
        }
        return res.status(500).send('Internal Server Error');
    }
};


app.get("/email_verified", verifyMail);

app.get("/forgotpassword", (req, res) => {
    res.render('forgotpassword');
});

app.get("/email_verify", (req, res) => {
    const { email } = req.query;
    res.render('email_verify', { email });
});

app.get('/user_dash', (req, res) => {
    try {
        const email=req.session.email;
        res.render('user_dash',{cars,email});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
