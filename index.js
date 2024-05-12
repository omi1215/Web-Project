const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./backend/mongoinit');
const Car=require('./backend/carschema')
const order=require('./backend/orderschema')
const getCarsFromDB = require('./models');
const offers = require('./offers');
const bcrypt=require('bcryptjs')
const multer  = require('multer')
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
     
        res.render('admin', {
            template:'',
            totalAmount: req.totalAmount // Access totalAmount from the request object
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/admin/createcar',(req,res)=>{
    res.render('admin', { 
        totalAmount: req.totalAmount ,
        template: 'createcar', 
    });
})
app.get('/admin/updatecar',(req,res)=>{
    res.render('admin', { 
        totalAmount: req.totalAmount ,
        template: 'updatecar', 
    });
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
        res.render('admin', { 
            totalAmount: req.totalAmount ,
            cars, 
            template: 'showcars', 
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/admin/deletecar',(req,res)=>{
    res.render('admin', { 
        totalAmount: req.totalAmount ,
        template: 'deletecar', 
    });
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

        // Pass data to the view
        res.render('admin', { 
            totalAmount: req.totalAmount ,
            users, 
            template: 'showuser', 
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get("/admin/deleteuser",(req,res)=>{
    res.render('admin',{ totalAmount: req.totalAmount ,template:'deleteuser'})
});
app.get("/admin/updateuser",(req,res)=>{
    res.render('admin',{ totalAmount: req.totalAmount ,template:'updateuser'})
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
    const car = cars[index];
    res.render('buildCar', { car });
});
app.post('/buildcar')
app.get("/login", (req, res) => {
    res.render('login');
});

app.get("/signup", (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { salutation, first_name, last_name, middle_name, email, password } = req.body;
    var n_pass;
        try {
        const user = await User.findOne({ email }).lean();
        if (user) {
            // Handle case if user already exists
        } else {
            bcrypt.genSalt(10,(err,salt)=>{
                bcrypt.hash(password,salt,async(err,hash)=>{
                    if(err){
                        console.error(err);
                        return;
                    }
                    await User.create({ firstname:first_name, middlename:last_name, lastname: middle_name, email: email, password: hash, status: "user",verified:0 });
                    console.log("data entered");
                })
            })
           
        }
        res.status(200).json({
            message: 'User signed up successfully',
            first_name: first_name,
            last_name: last_name
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

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
