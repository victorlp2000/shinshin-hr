var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var formidable = require('formidable'),
    util = require('util'),
    fs   = require('fs-extra');

var routes = require('./routes/index');
var dbapi = require('./routes/dbapi');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(qt.static(__dirname + "/"));

app.use('/', routes);
app.use('/api', dbapi);

app.post('/upload', function(req, res) {
  var form = new formidable.IncomingForm();
  form.multiples = true;
  form.parse(req, function(err, fields, files) {
    // do not response until finished uploading
  });

  form.on('end', function(fields, files) {
    console.log("==================");
    /* Temporary location of our uploaded file */
    var temp_path = this.openedFiles[0].path;
    /* The file name of the uploaded file */
    var file_name = this.openedFiles[0].name;
    /* Location where we want to copy the uploaded file */
    var new_location = __dirname + '/public/images/' + file_name;

    fs.copy(temp_path, new_location, function(err) {  
      if (err) {
        console.error(err);
      } else {
        console.log("success!")
      }
    });
    res.json({"url": "/images/" + file_name});
  });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
