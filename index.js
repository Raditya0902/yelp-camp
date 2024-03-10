if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
} //loading env variables from .env file using the dotenv package.

//importing required modules
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoStore = require("connect-mongo")(session);

const User = require("./models/user");
const ExpressError = require("./utils/ExpressError");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

//database setup
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/YelpCamp";
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

//initializing express server
const app = express();

//setting ejs as view engine.
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//parsing request bodies
app.use(express.urlencoded({ extended: true }));

//for supporting PUT and DELETE HTTP methods
app.use(methodOverride("_method"));

//serving static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

//protecting against MongoDB query injection attacks.
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

//setting up session storage using MongoDB with the MongoStore instance.
const secret = process.env.SECRET || "thisshouldbeabettersecret";
const store = new MongoStore({
  url: dbUrl,
  secret,
  touchAfter: 24 * 3600,
});
store.on("error", function (e) {
  console.log("session store error", e);
});

const sessionConfig = {
  store, // MongoStore instance created earlier, specifying where session data should be stored (in MongoDB).
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
//configures the session middleware with the options stored in sessionConfig.
app.use(session(sessionConfig));

//enables flash messages in an Express application, allowing developers to provide temporary feedback to users as they navigate through the application!
app.use(flash());

//configuring CSP headers using the helmet middleware in an express application! or this code enhances the security of the Express application by configuring CSP(content security policy) headers to restrict the sources from which various types of content can be loaded, thereby mitigating the risk of certain types of attacks.
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

//this code sets up passport.js with the LocalStrategy for user authentication in an express application. Enabling the authentication of users based on their credentials and providing mechanisms for maintaining user authentication state acroos requests.
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  console.log(req.session);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "aditya@gmail.com", username: "aditya" });
  const newUser = await User.register(user, "chicken");
  res.send(newUser);
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
  res.send("404");
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no, Something went wrong.";
  res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000; // on port 8000 or 3000
app.listen(port, () => {
  console.log("Listening on port " + port + ".");
});


//ok