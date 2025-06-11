const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campgrounds');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //YOUR USER ID
            author: '68441ee8e0378cc992ed3c01',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Corrupti architecto aspernatur repudiandae est. Necessitatibus magni quasi molestiae debitis pariatur? Eveniet fugit laudantium adipisci. Saepe officia accusantium odit, distinctio ea reiciendis!',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dq5max8fc/image/upload/v1749464871/Yelpcamp/n441lhgqmjltxcarntjb.jpg',
                    filename: 'Yelpcamp/n441lhgqmjltxcarntjb',
                },
                {
                    url: 'https://res.cloudinary.com/dq5max8fc/image/upload/v1749464870/Yelpcamp/lahwdi8pt5bqkz6ddbjk.png',
                    filename: 'Yelpcamp/lahwdi8pt5bqkz6ddbjk',
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})