var express = require("express");
var router  = express.Router();
var job = require("../models/job");
var middleware = require("../middleware");


//INDEX - show all jobs
router.get("/", function(req, res){
    // Get all jobs from DB
    job.find({}, function(err, alljobs){
       if(err){
           console.log(err);
       } else {
          res.render("jobs/index",{jobs:alljobs});
       }
    });
});

//CREATE - add new job to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to jobs array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newjob = {name: name, image: image, description: desc, author:author}
    // Create a new job and save to DB
    job.create(newjob, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to jobs page
            console.log(newlyCreated);
            res.redirect("/jobs");
        }
    });
});

//NEW - show form to create new job
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("jobs/new"); 
});

// SHOW - shows more info about one job
router.get("/:id", function(req, res){
    //find the job with provided ID
    // job.findById(req.params.id).populate("comments").exec(function(err, foundJob){
    job.findById(req.params.id).exec(function(err, foundJob){
        if(err){
            console.log(err);
        } else {
            console.log(foundJob)
            //render show template with that job
            res.render("jobs/show", {job: foundJob});
        }
    });
});

// EDIT job ROUTE
router.get("/:id/edit", middleware.checkJobOwnership, function(req, res){
    job.findById(req.params.id, function(err, foundJob){
        res.render("jobs/edit", {job: foundJob});
    });
});

// UPDATE job ROUTE
router.put("/:id",middleware.checkJobOwnership, function(req, res){
    // find and update the correct job
    job.findByIdAndUpdate(req.params.id, req.body.job, function(err, updatedjob){
       if(err){
           res.redirect("/jobs");
       } else {
           //redirect somewhere(show page)
           res.redirect("/jobs/" + req.params.id);
       }
    });
});

// DESTROY job ROUTE
router.delete("/:id",middleware.checkJobOwnership, function(req, res){
   job.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/jobs");
      } else {
          res.redirect("/jobs");
      }
   });
});


module.exports = router;

