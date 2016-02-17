var express = require('express');
var path = require('path');
var router = express.Router();
var dbapi = require('../libs/db-api');
var zip = require('express-zip');

/* GET users listing. */
router.get('/', function(req, res, next) {
	console.log(__filename);
	if ('photo' in req.query) {
        var filename = path.resolve('./database/photos/' + req.query.photo);
        var options = {
            headers: {
                'Content-Type': 'image'
            }
        };            

        res.sendFile(filename, options);
	} else if ('photofile' in req.query) {
		dbapi.getVolunteerPhotoFile(function(err, rows) {
			if (err) {
				res.json(err);
			} else {
				res.json(rows);
			}
		});
	} else if ('role' in req.query) {
		dbapi.getVolunteerRole(function(err, rows) {
			if (err) {
				res.json(err);
			} else {
				res.json(rows);
			}
		});
	} else if ('csv' in req.query) {
		dbapi.getCsvFiles(function(err, files) {
			if (err) {
				res.json(err);
			} else {
				var f;
				var list = [];
				for (f in files) {
					list.push({'path': files[f], 'name': path.basename(files[f])});
				}
				res.zip(list);
			}
		});
	} else {
		res.render("not a group");
	}
});

module.exports = router;
