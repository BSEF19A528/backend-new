const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express(); //created app variable and assigning the result of calling express

//cors
app.use(
  cors({
    "Access-Control-Allow-Origin": "*",
  })
);

//importing error handling
const AppError = require("./utils/appError");
const globalErrorHandler = require("./Controllers/errorController");

//importing routes
const userRouter = require("./Routes/userRoutes");
const courseRouter = require("./Routes/courseRoutes");

//GLOBAL MIDDLEWARES

//Body parser -- reading data from body into req.body
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

//middleware for serving static files
app.use("/public/img/users", express.static("public/img/users"));
app.use("/public/img/courses", express.static("public/img/courses"));

//morgan middleware
if (process.env.NODE_ENV === "development") {
  //Morgan Middleware
  app.use(morgan("dev"));
}

//Routes
app.use("/api/v1/users", userRouter); //middleware
app.use("/api/v1/courses", courseRouter);

//Defining handler for the routes that are not cached by our routes.
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//global middleware for error handling
app.use(globalErrorHandler);

//exporting app to server.js
module.exports = app;
