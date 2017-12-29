var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    // LocalStrategy = require("passport-local"),
    LinkedinStrategy = require('passport-linkedin-oauth2/lib').Strategy,

    methodOverride = require("method-override"),
    Job = require("./models/job"),
    // Comment     = require("./models/comment"),
    User = require("./models/user"),
    seedDB = require("./seeds"),
    sass = require('node-sass'),
    dotenv = require('dotenv').config();

//requiring routes

// var commentRoutes    = require("./routes/comments"),
var jobRoutes = require("./routes/jobs"),
    indexRoutes = require("./routes/index");

var url = process.env.DATABASEURL;
var port = process.env.PORT;
var ip = process.env.IP;
var clientID = process.env.LINKEDIN_CLIENT_ID;
var clientSecret = process.env.LINKEDIN_CLIENT_SECRET;


mongoose.connect(url);

app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB(); //seed the database

// ******** PASSPORT CONFIGURATION

app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// passport.use('local', new LocalStrategy(User.authenticate()));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use('linkedin', new LinkedinStrategy({
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: "http://localhost:3000/auth/linkedin/callback",
        scope: ['r_basicprofile', 'r_emailaddress'],
        passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        req.session.accessToken = accessToken;

        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                // find the user in the database based on their linkedIn id
                User.findOne({ 'linkedIn.id' : profile.id }, function(err, user) {

                    if (err)
                        return done(err);

                    // if the user is found, then update their details?
                    if (user) {
                        return done(null, {user : user, profile : profile}); // user found, return that user and their profile
                    }

                    else {
                        // if there is no user found with that linkedIn id, create them
                        var newUser = new User();
                        // set all of the linkedIn information in our user model
                        newUser.linkedIn.id    = profile.id; // set the users linked id
                        newUser.linkedIn.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                        newUser.linkedIn.email = profile.emails[0].value; // linkedIn can return multiple emails so we'll take the first
                        // save our user to the database
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            // if successful, return the new user
                            return done(null, newUser);
                        });
                    }

                });

            } else if (req.user) {

                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session
                // update the current users linkedIn credentials
                user.linkedIn.id    = profile.id;
                // user.linkedIn.token = token;
                user.linkedIn.name  = profile.name.givenName + ' ' + profile.name.familyName;
                user.linkedIn.email = profile.emails[0].value;


                // save the user
                user.save(function(err) {

                    if (err)
                        throw err;
                    return done(null, user);
                });
            }
        });
    }
));

// GET /auth/linkedin
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Linkedin authentication will involve
//   redirecting the user to linkedin.com.  After authorization, Linkedin
//   will redirect the user back to this application at /auth/linkedin/callback
app.get('/auth/linkedin',
  passport.authenticate('linkedin', { state: 'SOME STATE' }),
  function(req, res){
    // The request will be redirected to Linkedin for authentication, so this
    // function will not be called.
  });

// GET /auth/linkedin/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });


// ********* PASSPORT CONFIGURATION

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    // res.locals.linkedInProfile = req.profile;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/jobs", jobRoutes);
// app.use("/campgrounds/:id/comments", commentRoutes);


app.listen(port, ip, function() {
    console.log("The Job Camp Server Has Started!");
});