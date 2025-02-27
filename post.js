const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: [
    {type: mongoose.Schema.Types.ObjectId , ref: 'user'}
  ],
  content : String,
  date:{
    type: Date,
    default: Date.now
  },
  likes:[
    {type: mongoose.Schema.Types.ObjectId , ref: 'user'}
  ]
});

const postModel = mongoose.model("post", postSchema);
module.exports = postModel;
