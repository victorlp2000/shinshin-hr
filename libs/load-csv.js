
var mysql = require('mysql');
var fs = require('fs');
var parse = require('csv-parse');
var mysqlAccount = require('../libs/mysql-account');
// sql statements
var sql_delete_volunteer = "DELETE from hr_volunteer";
var sql_delete_role = "DELETE from hr_role";
var sql_insert_volunteer = "INSERT INTO hr_volunteer" +
		"(id, first_name, last_name, name, photo_file, description)" +
		"VALUES ?";
var sql_insert_role = "INSERT INTO hr_role" +
		"(code, role, volunteer_id)" +
		"VALUES ?";

/**
	load csv file, parse into array object
	csvFile - filename of the csv file
	callback(data)
**/
function loadCsv(csvFile, callback) {
	var parser = parse({delimiter: ','}, function(err, data) {
    	callback(data);
		});
	fs.createReadStream(csvFile).pipe(parser);
}

/**
	run sql query with data
**/
function executeSql(conn, sql, data, callback) {
	conn.query(sql, [data], function(err) {
    	if (err)
    		callback(err);
    	else
    		callback(null);
    });
}

/**
	delete data from all hr tables
	need to delete role then delete volunteer
**/
function deleteRecords(conn, callback) {
	executeSql(conn, sql_delete_role, '', function(err) {
		if (err)
			callback(err);
		else {
			executeSql(conn, sql_delete_volunteer, '', function(err) {
				if (err)
					callback(err);
				else
					callback(null);
			});
		}
	});
}

function postInsert(conn, callback) {
	// insert all volunters
	var sql = "INSERT INTO hr_role(code, role) VALUES('Z', '义工列表')";
	executeSql(conn, sql, '', function(err) {
		if (err)
			callback(err);
		else {
			sql = "INSERT INTO hr_role(code, role, volunteer_id) SELECT 'Z001','',id FROM hr_volunteer";
			executeSql(conn, sql, '', function(err) {
				if (err)
					callback(err);
				else {
					conn.commit();
					callback(null);
				}
			});
		}
	});
}

/**
	import csv data and insert into database table
	csv - filename of csv file
	sql - statement to insert into table
	preprocess - data to be processed before insert
**/
function importCsv(conn, csv, sql, preprocess, callback) {
	loadCsv(csv, function(data) {
		if (preprocess)
			preprocess(data);
		executeSql(conn, sql, data, function(err) {
			if (err)
				callback(err);
			else {
				callback(null);
			}
		})
	});
}

function preProcessVolunteerData(data) {
	console.log('volunteer data: ' + data.length);
	var row, col;
	for (row in data) {
		for (col in data[row]) {
			if (data[row][col] == '\\N')
				data[row][col] = null;
		}
	}
}

function preProcessRoleData(data) {
	console.log('role data: ' + data.length);
	var row, col;
	for (row in data) {
		for (col in data[row]) {
			if (data[row][col] == '\\N' || data[row][col] == '') {
				data[row][col] = null;
			}
		}
		//console.log(data[index]);
	}
}

/**
	reset shinshin hr database, 
	delete existing data and reload from csv files
**/
function resetDB(conn, csv, callback) {
	deleteRecords(conn, function(err) {
		if (err)
			callback(err);
		else {
			importCsv(conn, csv.volunteer, sql_insert_volunteer, preProcessVolunteerData, function(err) {
				if (err)
					callback(err);
				else {
					importCsv(conn, csv.role, sql_insert_role, preProcessRoleData, function(err) {
						if (err)
							callback(err);
						else {
							postInsert(conn, function(err) {
								if (err)
									callback(err);
								else
									callback(null);
							});
						}
					});
				}
			});
		}
	});
}

function updateHrData(csv, callback) {
	var conn = mysql.createConnection(mysqlAccount);
	resetDB(conn, csv, function(err) {
		if (err) {
			console.log(err);
			callback(err);
		}
		console.log('close db');
		conn.end();
		callback(null, '');
	});
}

function verifyHrData(csv, callback) {
	console.log('verifying...');
	loadCsv(csv.volunteer, function(data) {
		console.log('check volunteer data');
		loadCsv(csv.role, function(data) {
			console.log('check role data');
			callback(null);
		});
	});
}

module.exports = {
	verifyHrData: verifyHrData,
	updateHrData: updateHrData
}