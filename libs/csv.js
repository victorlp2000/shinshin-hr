
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

var conn = mysql.createConnection(mysqlAccount);

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
function importCsv(csv, sql, preprocess, callback) {
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
	/*
	var index;
	for (index in data) {
		console.log(data[index]);
	} */
}

function preProcessRoleData(data) {
	console.log('role data: ' + data.length);
	var index;
	for (index in data) {
		if (data[index][2] == '') {
			data[index][2] = null;
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
			importCsv(csv.volunteer, sql_insert_volunteer, preProcessVolunteerData, function(err) {
				if (err)
					callback(err);
				else {
					importCsv(csv.role, sql_insert_role, preProcessRoleData, function(err) {
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

var csv = {
	'volunteer': __dirname + '/hr_volunteer.csv',
	'role': __dirname + '/hr_role.csv'
}

if (process.argv.length == 4) {
	csv.volunteer = process.argv[2];
	csv.role = process.argv[3];
}

console.log(csv);
resetDB(conn, csv, function(err) {
	if (err)
		console.log(err);
	console.log('close db');
	conn.end();
});
