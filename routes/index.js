var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");

//root route
router.get("/", function(req, res){
    res.render("landing");
});

// show register form
router.get("/register", function(req, res){
   res.render("register"); 
});

//handle sign up logic
// router.post("/register", function(req, res){
//     var newUser = new User({ username: req.body.username });
//     User.register(newUser, req.body.password, function(err, user){
//         if(err){
//             req.flash("error", err.message);
//             return res.render("register");
//         }
//         passport.authenticate("linkedin")(req, res, function(){
//            req.flash("success", "Welcome to Job Camp " + user.username);
//            res.redirect("/jobs");
//         });
//     });
// });

//show login form
router.get("/login", function(req, res){
   res.render("login", { user: req.user }); 
});

//handling login logic
router.post("/login", passport.authenticate("linkedin", {
        successRedirect: "/jobs",
        failureRedirect: "/login"
    }), function(req, res) {
});

// logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect("/jobs");
});



module.exports = router;