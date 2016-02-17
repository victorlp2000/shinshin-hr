var path = require('path');
var mysqlAccount = require('./mysql-account');
var db = 'mysql';
var fs = require('fs');

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

function rowToCsv(row) {
	var c;
	var line = '';
	function appendLine(c) {
		if (line != '')
			line += ',';
		line += c;
	}
	for (c in row) {
		var column = row[c];
		var type = typeof(column);
		if (column == null || type === 'undefined' || type === 'null') {
			column = '';
			appendLine(column);
		} else if (type === 'number') {
			appendLine(column);
		} else if (type === 'string') {
			appendLine('"' + column.replace('"', '\\"') + '"');
		} else {
			throw new Error('unhandled data type: ' + type);
		}
	}
	return line;
}

function getVolunteerCsvFile(callback) {
	console.log('getVolunteerCsvFile');
	var filename = '/tmp/volunteer.csv';
	var sql = "SELECT * FROM hr_volunteer";
	var mysql = require('mysql');
	var conn = mysql.createConnection(mysqlAccount);
	conn.query(sql, function(err, rows, fields) {
    	if (err) {
    		console.log(sql);
    		callback(err);
    		conn.end();
    	} else {
    		//console.log(rows);
    		var r;
    		var lines = '';
    		for (r in rows) {
    			var line = rowToCsv(rows[r]);
    			//console.log(line);
    			lines += line + '\n';
    		}
    		var tmpFile = '/tmp/volunteer.csv';
    		fs.writeFile(tmpFile, lines, function() {
    			callback(null, tmpFile);
    		}); 
    		conn.end();
    	}
	});
}

function getRoleCsvFile(callback) {
	console.log('getRoleCsvFile');
	var filename = '/tmp/role.csv';
	var sql = "SELECT * FROM hr_role";
	var mysql = require('mysql');
	var conn = mysql.createConnection(mysqlAccount);
	conn.query(sql, function(err, rows, fields) {
    	if (err) {
    		console.log(sql);
    		callback(err);
    		conn.end();
    	} else {
    		//console.log(rows);
    		var r;
    		var lines = '';
    		for (r in rows) {
    			var line = rowToCsv(rows[r]);
    			//console.log(line);
    			lines += line + '\n';
    		}
    		var tmpFile = '/tmp/role.csv';
    		fs.writeFile(tmpFile, lines, function() {
    			callback(null, tmpFile);
    		}); 
    		conn.end();
    	}
	});
}

function getCsvFiles(callback) {
	var file1, file2;
	console.log('getCsvFiles...');
	getVolunteerCsvFile(function(err, data) {
		file1 = data;
		getRoleCsvFile(function(err, data) {
			file2 = data;
			callback(null, [file1, file2]);
		});
	});
}

module.exports = {
	getVolunteerRole: getVolunteerRole,
	getVolunteerPhotoFile: getVolunteerPhotoFile,
	getVolunteerCsvFile: getVolunteerCsvFile,
	getRoleCsvFile: getRoleCsvFile,
	getCsvFiles: getCsvFiles
};
