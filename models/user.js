var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    linkedIn: {
        id : String,
        name: String,
        email: String
    }
});

UserSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model("User", UserSchema);