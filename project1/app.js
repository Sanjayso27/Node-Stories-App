const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const morgan = require("morgan");
const exphbs = require("express-handlebars").engine;
const passport = require("passport");
const session = require("express-session");
// used for storing sessions of the user
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
// Load config
// config file where we will store all the global variable
dotenv.config({ path: "./config/config.env" });

// Passport config
require("./config/passport")(passport);

connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method Override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

//logging
if (process.env.NODE_ENV === "development") {
  // the http method and the response on the console
  app.use(morgan("dev"));
}

// Handlebar Helpers
const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require("./helpers/hbs");

// Handlebars
// console.log(formatDate)
app.engine(
  ".hbs",
  exphbs({
    helpers: { formatDate, stripTags, truncate, editIcon, select },
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

// how passport session and express session work together(??)
// Sessions should be above the passport session 
app.use(
  session({
    secret: "keyboard cat",
    //we don't waant to save the session if nothing is modified
    resave: false,
    // dont create session until something is initialised
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global var
//  res. locals is an object that contains the local variables for the response which are scoped to the request only and therefore just available for the views rendered during that request or response cycle.
app.use(function (req, res, next) {
  // we have user field thanks to passport middleware
  res.locals.user = req.user || null;
  next();
});

// static folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));
app.use("/users",require("./routes/users"));

const port = process.env.PORT || 3000;

app.listen(
  port,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);
