const mongoose = require("mongoose");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://localhost:27017/YelpCamp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => {
  array[Math.floor(Math.random() * array.length)];
};

const seedDb = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const randomNumber = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "641af2bb4929465a40608aa4",
      location: `${cities[randomNumber].city}, ${cities[randomNumber].state}`,
      title: `${descriptors[Math.floor(Math.random() * descriptors.length)]} ${
        places[Math.floor(Math.random() * places.length)]
      }`,
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[randomNumber].longitude,
          cities[randomNumber].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dvu6lzyay/image/upload/v1679666202/YelpCamp/auvl9dr8r5eih2vqzwff.png",
          filename: "YelpCamp/auvl9dr8r5eih2vqzwff",
        },
        {
          url: "https://res.cloudinary.com/dvu6lzyay/image/upload/v1679666205/YelpCamp/av5gxdobywtghfxrfyge.png",
          filename: "YelpCamp/av5gxdobywtghfxrfyge",
        },
      ],
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus asperiores, totam aut inventore quam nihil nam enim vero eum dignissimos assumenda praesentium iste eaque, tenetur atque consequuntur. Reprehenderit, dignissimos autem.",
    });
    await camp.save();
  }
};

seedDb().then(() => {
  mongoose.connection.close();
});
