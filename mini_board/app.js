// モジュール登録
let express = require('express');
let path = require('path');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require("body-parser");
let session = require('express-session');
let validator = require('express-validator')
let createError = require('http-errors');

// ルーター定義
let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let homeRouter = require('./routes/home');

// アプリ定義 
let app = express();

// view フォルダのセット
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// モジュールセット
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// session 設定の定義
let session_opt = {
	secret : 'keyboard cat',
	resave : false,
	saveUninitialized : false,
	cookie : { maxAge: 60 * 60 * 1000},
};

// session セット
app.use(session(session_opt));

// ルーターセット
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/home', homeRouter);



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
