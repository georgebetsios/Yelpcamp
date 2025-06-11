const User = require('../models/user');
const passport = require('passport');

module.exports.renderRegister =  (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registerUser = await User.register(user, password);
        req.login(registerUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            req.flash('error', 'Invalid username or password');
            return res.redirect('/login');
        }

        // Save returnTo before login:
        const redirectUrl = req.session.returnTo || '/campgrounds';

        req.logIn(user, (err) => {
            if (err) return next(err);

            delete req.session.returnTo; // remove it after grabbing value
            req.flash('success', 'Welcome back!');
            res.redirect(redirectUrl);
        });
    })(req, res, next);
}

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}