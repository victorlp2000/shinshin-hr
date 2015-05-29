
var sqlite3 = require('sqlite3');
var path = require('path');

var getDatabaseName = function() {
	return path.resolve(__dirname + '/../database/hr.db');
}

var getVolunteerRole = function(callback) {
	var dbName = getDatabaseName();
	var db = new sqlite3.Database(dbName);
	var where = '';
	var fields = "code, hr_role.role, first_name, last_name, name, photo_file, description";
	var sql = "SELECT "+ fields + " FROM hr_role LEFT OUTER JOIN hr_volunteers ON hr_role.volunteer_id = hr_volunteers.volunteer_id";
	if (where != '') {
		sql += " WHERE " + where;
	}
	console.log(sql);
	db.all(sql, function(err, rows){
		if (err) {
			callback(err);
		} else {
			callback(null, rows);
		}
		db.close();
	});
}

module.exports = {
	getVolunteerRole: getVolunteerRole,
};
