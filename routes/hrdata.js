var express = require('express');
var path = require('path');
var router = express.Router();

/* GET users listing. */
router.post('/import', function(req, res, next) {
	console.log('import...');
	res.end();
})

router.post('/export', function(req, res, next) {
	console.log('export...');
	res.end();
})

module.exports = router;