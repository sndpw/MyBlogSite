require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const fs = require('fs');
const multer = require('multer');
const path = require('path');


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

const posts = [];


mongoose.connect(process.env.URL, {useNewUrlParser: true});

const postSchema = {
    title : String,
    content : String,
    img:
    {
        data: String,
        contentType: String
    }
}

const Post = mongoose.model("Post", postSchema);
const ls = [{email:process.env.EMAIL,password:process.env.PASS}];
let flag = 0;

app.set('view engine', 'ejs');
const session = require('express-session');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
/*app.use('/uploads', express.static('uploads'));*/
app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", "0");
    next();
});

app.get("/", function(req, res){
    Post.find({}).then(function(posts){
        res.render("home", {homeContent:homeStartingContent, posts:posts});
    }).catch(function(err){
        console.log("Error");
    });
});

app.get("/about", function(req, res){
    res.render("about", {
        aboutContent:aboutContent, 
    });
});

app.get("/contact", function(req, res){
    res.render("contact", {
        contactContent:contactContent,
    });
});

app.get("/login", function(req, res){
    res.render("login");
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Path where files will be stored
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // Unique filename
    }
});

const upload = multer({ storage: storage }); // Use the storage configuration

app.get("/posts/:postTitle", function(req, res){
    const requestedPostTitle = (req.params.postTitle);
    Post.findOne({title:requestedPostTitle}).then(function(post){
            res.render("post",{pTitle:post.title, pBody:post.content, pImg: post.img});
        }
    ).catch(function(err){
        console.log("Error");
    })
});


function ensureAuthenticated(req, res, next) {
    if (req.session.authenticated) {
        return next();
    }
    res.redirect('/login');
}


// Define admin-only routes

app.get('/compose', ensureAuthenticated, (req, res) => {
    // Render admin compose page
    res.render("compose");
});


// Add more admin-only routes as needed
app.get("/editposts", function(req, res) {
    if (flag === 1) {
        Post.find({}).then(function(posts) {
            res.render("editposts", { posts: posts });
        }).catch(function(err) {
            console.log("Error");
        });
    } else {
        res.redirect("/login"); // Redirect to login if not authenticated
    }
});

app.get("/editpost/:postId", function(req, res) {
    if (flag === 1) {
        const postId = req.params.postId;
        Post.findById(postId).then(function(post) {
            if (post) {
                res.render("editpost", { post: post });
            } else {
                res.redirect("/editposts");
            }
        }).catch(function(err) {
            console.log("Error");
            res.redirect("/editposts");
        });
    } else {
        res.redirect("/login"); // Redirect to login if not authenticated
    }
});


app.post("/upload", upload.single("image"), (req, res) => {
    console.log("File uploaded successfully");
    // Your further logic goes here
    const filePath = req.file.path;
    const originalFileName = req.file.originalname;
    console.log(filePath);
    console.log(originalFileName);
});


app.post("/compose", upload.single("image"), async function(req, res) {
    try {
        const post = new Post({
            title: req.body.composeTitle,
            content: req.body.composeBody,
            img: {
                data: fs.readFileSync(req.file.path).toString("base64"),
                contentType: req.file.mimetype
            }
        });

        await post.save(); // Save the post to the database
        res.redirect("/editposts");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while saving the post.");
    }
});


app.post("/updatepost/:postId", upload.single("editImage"), function(req, res) {
    if (flag === 1) {
        const postId = req.params.postId;
        const editTitle = req.body.editTitle;
        const editBody = req.body.editBody;

        let updateData = { title: editTitle, content: editBody };
        
        // Check if a new image was uploaded
        if (req.file) {
            updateData.img = {
                data: fs.readFileSync(req.file.path).toString("base64"),
                contentType: req.file.mimetype
            };
        }
        
        Post.findByIdAndUpdate(postId, updateData)
            .then(function() {
                res.redirect("/editposts");
            })
            .catch(function(err) {
                console.log("Error");
                res.redirect("/editposts");
            });
        
    } else {
        res.redirect("/login"); // Redirect to login if not authenticated
    }
});

// Create a route for deleting posts
app.post("/deletepost/:postId", function(req, res) {
    if (flag === 1) {
        const postId = req.params.postId;

        // Delete the post
        Post.findByIdAndRemove(postId)
            .then(function(deletedPost) {
                if (!deletedPost) {
                    console.log("Post not found.");
                    res.redirect("/editposts");
                    return;
                }
                console.log("Post deleted successfully");
                res.redirect("/editposts");
            })
            .catch(function(err) {
                console.log("Error deleting the post:", err);
                res.redirect("/editposts");
            });
    } else {
        res.redirect("/login"); // Redirect to login if not authenticated
    }
});


app.post("/login", function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    if (email === ls[0].email && password === ls[0].password) {
        // Admin credentials are correct, render the admin panel
        flag = 1;
        req.session.authenticated = true;
        //res.render(__dirname + "/views/compose.ejs");
        res.redirect("/compose");
    } else {
        // Invalid credentials, redirect to login page
        res.redirect("/login");
        console.log("Invalid admin credentials");
    }
});

app.get("/logout", function(req, res) {
    flag = 0; // Reset the flag to indicate not authenticated
    req.session.authenticated = false; // Mark the user as not authenticated
    res.redirect('/login'); // Redirect to the login page after logout
});


app.listen(3000, function(){
    console.log("Server started");
});