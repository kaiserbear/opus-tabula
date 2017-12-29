var mongoose = require("mongoose");

var jobSchema = new mongoose.Schema({
   title: String,
   image: String,
   description: String,
   author: {
      username: String,
      picture: String
   },
   date: { type: Date, default: Date.now }
   // comments: [
   //    {
   //       type: mongoose.Schema.Types.ObjectId,
   //       ref: "Comment"
   //    }
   // ]
});

module.exports = mongoose.model("Job", jobSchema);