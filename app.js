var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var formidable = require('formidable'),
    util = require('util'),
    fs   = require('fs-extra');
var multer = require('multer');

var routes = require('./routes/index');
var dbapi = require('./routes/dbapi');
var hrdata = require('./routes/hrdata');
var loadcsv = require('./libs/load-csv');

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
//app.use('/hrdata', hrdata);

var uploading = multer({
  dest: '/tmp',
  inMemory: true,
  onFileUploadStart: function(file) {
    console.log('Starting ' + file.fieldname);
  },
  onFileUploadData: function(file, data) {
    console.log('Got a chunk of data!');
  },
  onFileUploadComplete: function(file) {
    console.log('Completed file!');
  },
  onParseStart: function() {
    console.log('Starting to parse request!');
  },
  onParseEnd: function(req, next) {
    console.log('Done parsing!');
    next();
  },
  onError: function(e, next) {
    if (e) {
      console.log(e.stack);
    }
    next();
  }
});

app.post('/hrdata/import', uploading.any(), function(req, res, next) {
  console.log(req.files);
  var volunteer = null;
  var role = null;
  var f;
  var csv = {
    'volunteer': null,
    'role': null
  }

  for (f in req.files) {
    if (req.files[f].originalname == 'hr_volunteer.csv')
      csv.volunteer = req.files[f].path;
    if (req.files[f].originalname == 'hr_role.csv')
      csv.role = req.files[f].path;
  }

  if (csv.volunteer != null && csv.role != null) {
    loadcsv.verifyHrData(csv, function(err) {
      if (err) {
        var err = new Error('wrong csv files');
        err.status = 700;
        next(err);
      } else {
        // update into database
        loadcsv.updateHrData(csv, function(err) {
          if (err) {
            throw new Error('error in importing into database');
          }
          res.redirect(req.get('referer'));
        });
      }
    });
  } else {
  	var err = new Error('file name must be volunteer.csv and role.csv');
    err.status = 700;
	  next(err);
  }
});

app.get('/hrdata/export', function(req, res, next) {
  console.log('export ...');
  res.redirect('/api?csv');
})

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
