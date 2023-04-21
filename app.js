var createError = require('http-errors');
var express = require('express');
var path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session=require('express-session');
const nocache = require('nocache');
const hbs = require('express-handlebars');
const app = express();
const cloudinary = require('cloudinary');
// const fileUpload = require('express-fileupload');
const db = require('./config/connection');
const dotenv = require('dotenv');
dotenv.config();


//Database connection
db.connect((err)=>{
  if(err){
    console.log("connection error");
  }else{
    console.log("database connected");
  }
})


const userRouter = require('./routes/users');
const adminRouter = require('./routes/admin');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// console.log(hbs); // check if the hbs variable is defined

app.engine('hbs',hbs.engine({helpers:{
  inc: function (value, options) {

    return parseInt(value) + 1;
  },
  math: function(lvalue,operator,rvalue,options){
    lvalue = parseInt(lvalue);
    rvalue = parseInt(rvalue);

    return {
      "+": lvalue + rvalue,
      "-": lvalue - rvalue,
      "*": lvalue * rvalue,
      "/": lvalue / rvalue,
      "%": lvalue % rvalue,
    }[operator];
  },

  isEqual : function(value1,value2){
    return value1==value2;
  },

  isGreater : function(value1,value2){
    return (value1>value2)
  }
},
extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(nocache());
app.use(cookieParser());
app.use(session({resave:false,saveUninitialized: true,secret:"key",cookie:{maxAge:60000000}}));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(fileUpload());
app.use('/admin', adminRouter);
app.use('/', userRouter);



app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;