const express = require("express");
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const crypto = require('crypto')
const path = require('path')
const upload = require("./config/multerconfig");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname , "public")))


app.get("/", (req, res) => {
  res.render("signup");
});

const middleWare = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.redirect("/login");

  jwt.verify(token, "shhhh", (err, result) => {
    if (err) return res.redirect("/login");
    req.user = result;
    next();
  });
};

app.get("/profile/uploads", (req, res) => {
  res.render("profileupload");
});
app.post("/upload",middleWare , upload.single("image") , async(req, res) => {
  let user =await userModel.findOne({email: req.user.email})
  user.profilepic = req.file.filename;
  await user.save()
  res.redirect("/profile")
});

app.get("/logout", (req, res) => {
    res.cookie  ("token" , "");
    res.redirect('/login')
});

app.get("/profile", middleWare, async (req, res) => {
  const user = await userModel.findById(req.user.userid).populate("posts")
  res.render("profile", { user });
});


app.post("/post", middleWare, async (req, res) => {
  const user = await userModel.findById(req.user.userid);
  let {content} = req.body;
  let post = await postModel.create({
    user: user._id,
    content,
  })

  user.posts.push(post._id)
  await user.save();
  res.redirect('/profile');
});

app.get('/like/:id', middleWare, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  if(post.likes.indexOf(req.user.userid) === -1){
    post.likes.push(req.user.userid);
    
  }
  else{
    post.likes.pull(req.user.userid)
  }
      await post.save();
      res.redirect('/profile')
});

app.get("/edit/:id", middleWare, async (req, res) => {
  const post = await postModel.findById(req.params.id);
  const user = await userModel.findOne({email: req.user.email})
  if (!post) return res.redirect("/profile"); 
  res.render("edit", { post , user });
});

app.post("/edit/:id", middleWare, async (req, res) => {
  const { content } = req.body; 
  const post = await postModel.findById(req.params.id);
  
  if (!post) return res.redirect("/profile");  
  post.content = content;
  await post.save();
  
  res.redirect("/profile");
});


app.post("/create", async (req, res) => {
  const { name, username, age, email, password } = req.body;
  let user = await userModel.findOne({ email });

  if (user) {
    return res.send("user already exist");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  user = await userModel.create({
    name,
    username,
    age,
    email,
    password: hash,
  });

  const token = jwt.sign({ email: email, userid: user._id }, "shhhh");
  res.cookie("token", token);
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await userModel.findOne({ email });

  if (!user) return res.redirect("/");

  bcrypt.compare(password, user.password, (err, result) => {
    if (err) return res.send("Error Occured");
    if (!result) return res.send("Invalid password");
    const token = jwt.sign({ email: email, userid: user._id }, "shhhh");
    res.cookie("token", token);
    res.redirect("/profile");
  });
});

app.listen(4000, () => {
    try {
        console.log("server is running");        
    } catch (error) {
        console.log("Spmething went Wrong");
        
    }
});
