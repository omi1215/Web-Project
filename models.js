// Import mongoose and your Car model
const mongoose = require('mongoose');
const Car = require('./backend/carschema'); // Update the path accordingly

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Porchse', { useNewUrlParser: true, useUnifiedTopology: true });

// Function to retrieve cars from MongoDB and export them
async function getCarsFromDB() {
  try {
    // Retrieve all cars from the database
    const carsFromDB = await Car.find({});

    // Map the retrieved cars to match the format of your hardcoded data
    const mappedCars = carsFromDB.map(car => ({
      name: car.name,
      description: car.desc,
      price: car.price.toString(), // Convert price to string if necessary
      image: car.image,
      front:car.front,
      side:car.side,
      back:car.back,
      power:car.power,
      time:car.time,
      topspeed:car.topspeed
    }));

    // Export the mapped cars directly
    return mappedCars;
  } catch (error) {
    console.error('Error retrieving cars from MongoDB:', error);
    throw error; // Rethrow the error to handle it in index.js if needed
  }
}

module.exports = getCarsFromDB;
