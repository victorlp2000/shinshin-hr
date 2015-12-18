var path = require('path');
var mysqlAccount = require('./mysql-account');
var db = 'mysql';

var getDatabaseName = function() {
	return path.resolve(__dirname + '/../database/hr.db');
}

function getVolunteerRole(callback) {
	var where = '';
	var fields = "code, hr_role.role, first_name, last_name, name, photo_file, description";
	var sql = "SELECT "+ fields + " FROM hr_role LEFT OUTER JOIN hr_volunteer ON hr_role.volunteer_id = hr_volunteer.id";
	if (where != '') {
		sql += " WHERE " + where;
	}
	if (db == 'sqlite3') {
		var sqlite3 = require('sqlite3');
		var dbName = getDatabaseName();
		var conn = new sqlite3.Database(dbName);
		console.log(sql);
		conn.all(sql, function(err, rows){
			if (err) {
				callback(err);
			} else {
				callback(null, rows);
			}
			conn.close();
		});
	} else {
		var mysql = require('mysql');
		var conn = mysql.createConnection(mysqlAccount);
		conn.query(sql, function(err, rows, fields) {
	    	if (err) {
	    		console.log(sql);
	    		callback(err);
	    		conn.end();
	    	} else {
	    		console.log(rows);
	    		callback(null, rows);
	    		conn.end();
	    	}
    	});
	}
}

function getVolunteerPhotoFile(callback) {
	var sql = "SELECT first_name, last_name, name, photo_file from hr_volunteer";
	var mysql = require('mysql');
	var conn = mysql.createConnection(mysqlAccount);
	conn.query(sql, function(err, rows, fields) {
    	if (err) {
    		console.log(sql);
    		callback(err);
    		conn.end();
    	} else {
    		console.log(rows);
    		callback(null, rows);
    		conn.end();
    	}
	});
}

module.exports = {
	getVolunteerRole: getVolunteerRole,
	getVolunteerPhotoFile: getVolunteerPhotoFile,
};
