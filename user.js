const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/miniproject");

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  age: String,
  email: String,
  password: String,
  profilepic:{
    type: String,
    default: "default.png",
  },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
});


const userModel = mongoose.model('user', userSchema);
module.exports = userModel;