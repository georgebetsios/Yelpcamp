if (process.env.NODE_ENV !== "production") {  //if we are not in production environment loading .env
    require('dotenv').config();
}

console.log(process.env.NODE_ENV);
const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilities/ExpressError');
const path = require('path');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStradegy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');
// const dbUrl = process.env.DB_URL;
const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp';

const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize');

mongoose.connect(dbUrl);
// mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();

app.engine('ejs', ejsMate);// χρησιμοποιεί το ejs-mate για layout inheritance
app.set('view engine', 'ejs');// ορίζεις ejs ως template engine
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({ replaceWith: '_' })); 

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on('error', function(e) {
    console.log("SESSION STORE ERROR", e);
})

const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}



app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));
// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     // "https://api.tiles.mapbox.com/",
//     // "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
//     "https://cdn.maptiler.com/", // add this
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://stackpath.bootstrapcdn.com/",
//     // "https://api.mapbox.com/",
//     // "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
//     "https://cdn.jsdelivr.net",
//     "https://cdn.maptiler.com/", // add this
// ];
// const connectSrcUrls = [
//     // "https://api.mapbox.com/",
//     // "https://a.tiles.mapbox.com/",
//     // "https://b.tiles.mapbox.com/",
//     // "https://events.mapbox.com/",
//     "https://api.maptiler.com/", // add this
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/dq5max8fc/",
//                 "https://images.unsplash.com/",
//                 "https://api.maptiler.com/",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );
            

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStradegy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



// app.get('/fakeuser', async (req, res) => {
//     const user = new User({ email: 'djbetsi@gmail.com', username: 'djbetsi' });
//     const newUser = await User.register(user, 'chicken');
//     res.send(newUser);
// })

app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);
app.use('/', userRoutes);


app.get('/', (req, res) => {
    res.render('home')
});

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})