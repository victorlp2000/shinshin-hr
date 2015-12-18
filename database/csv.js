
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
    	console.log('data:');
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

function postInsert(conn) {
	// insert all volunters
	var sql = "INSERT INTO hr_role(code, role) VALUES('Z', '义工列表')";
	executeSql(conn, sql, '', function(err) {
		if (err)
			console.log(err);
		else {
			sql = "INSERT INTO hr_role(code, role, volunteer_id) SELECT 'Z001','',id FROM hr_volunteer";
			executeSql(conn, sql, '', function(err) {
				if (err)
					console.log(err);
				else {
					conn.commit();
					console.log('close db');
					conn.end();
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

/**
	reset shinshin hr database, 
	delete existing data and reload from csv files
**/
function resetDB(conn) {
	deleteRecords(conn, function(err) {
		if (err)
			console.log(err);
		else {
			importCsv(__dirname+'/hr_volunteer.csv', sql_insert_volunteer, null, function(err) {
				if (err)
					console.log(err);
				else {
					importCsv(__dirname+'/hr_role.csv',sql_insert_role, function(data) {
						var index;
						for (index in data) {
							if (data[index][2] == '') {
								data[index][2] = null;
							}
						}
					}, function(err) {
							if (err)
								console.log(err);
							else {
								postInsert(conn);
							}
						}
					);
				}
			});
		}
	});
}

resetDB(conn);
