
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
  //console.log('--- loading:', csvFile);
  var parser = parse({delimiter: ','}, function(err, data) {
      callback(err, data);
    });
  fs.createReadStream(csvFile).pipe(parser);
}

/**
  run sql query with data
**/
function executeSql(conn, sql, data, callback) {
    conn.query(sql, [data], function(err) {
        if (err) {
          err.message = data;
        }
      callback(err);
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
  loadCsv(csv, function(err, data) {
    if (err) {
      return callback(err);
    }
    //console.log('---- data ---');
    //console.log(data);
    //console.log('--- end data ---');
    if (preprocess) {
      preprocess(data);
    }
    var bulk = false;
    if (bulk) {
      executeSql(conn, sql, data, function(err) {
        if (err)
          callback(err);
        else {
          callback(null);
        }
      })
    } else {
      // insert one by one to capture data error
      var i;
      var m = data.length;
      var err = null;
      for (i in data) {
        var datarow = [data[i]];
        executeSql(conn, sql, datarow, function(err) {
          if (err) {
            console.log(err);
          }
          m --;
          if (m == 0 || err != null) {
            callback(err);
          }
        })
      }
    }
  });
}

function preProcessVolunteerData(data) {
  //console.log('volunteer data: ' + data.length);
  var row, col;
  for (row in data) {
    for (col in data[row]) {
      if (data[row][col] == '\\N')
        data[row][col] = null;
    }
  }
}

function preProcessRoleData(data) {
  //console.log('role data: ' + data.length);
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

function checkVolunteerData(data) {
  var i;
  for (i in data) {
    if (data[i].length != 6) {
      console.log('checkVolunteerData: wrong number of columns');
      return false;
    }
  }
  return true;
}

function checkRoleData(data) {
  var i;
  for (i in data) {
    if (data[i].length != 3) {
      console.log('checkRoleData: wrong number of columns');
      return false;
    }
  }
  return true;
}

function verifyHrData(csv, callback) {
  console.log('verifying1...' + csv.volunteer);
  loadCsv(csv.volunteer, function(err, data1) {
    if (err) {
      return callback(err);
    }
    if (checkVolunteerData(data1) == false) {
      callback(new Error('wrong volunteer.csv'));
    }
    console.log('verifying2...' + csv.role);
    loadCsv(csv.role, function(err, data2) {
      if (err) {
        return callback(err);
      }
      if (checkRoleData(data2) == false) {
        callback(new Error('wrong role.csv'));
      } else {
        callback(null);
      }
    });
  });
}

module.exports = {
  verifyHrData: verifyHrData,
  updateHrData: updateHrData
}