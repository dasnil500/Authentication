var express               = require("express"),
    mongoose              = require("mongoose"),
    bodyParser            = require("body-parser"),
    User                  = require("./models/user"),
    passport              = require("passport"),
    LocalStrategy         = require("passport-local");

// Package config
mongoose.connect('mongodb://localhost:27017/auth_demo_app', {useNewUrlParser: true, useUnifiedTopology: true});
var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

//Set up express-session with app.js
app.use(require('express-session')({
  secret: 'Hi there', //used to encode or decode sessions in encrypted form
  resave: false,
  saveUninitialized: false
}));

//Set up app.js to use passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Home route
app.get("/", function(req, res){
    res.render("home");
});

//Secret route with middleware
app.get("/secret", isLoggedIn, function(req, res){
  res.render('secret');
});

//Register routes
app.get("/register", function(req, res){
  res.render('register');
});

app.post("/register", function(req, res){ //handling user sign up
  User.register(new User({username: req.body.username}), req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.render('register');
    }
    passport.authenticate("local")(req, res, function(){
      res.redirect("/secret");
    });
  });
});

//Login routes
app.get("/login", function(req, res){
  res.render('login');
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/secret",
  failureRedirect: "/login"
}), function(req, res){

})

//LogOut route
app.get("/logout", function(req, res){
  req.logOut();
  res.redirect("/");
});

//Logout middleware which will be used
//to check before entering secret page
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}



app.listen(3000, () => console.log(`Example app listening at http://localhost:${3000}`));
