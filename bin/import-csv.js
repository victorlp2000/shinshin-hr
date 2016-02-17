
var loadcsv = require('../libs/load-csv');

var csv = {
	'volunteer': __dirname + '/hr_volunteer.csv',
	'role': __dirname + '/hr_role.csv'
}

if (process.argv.length == 4) {
	csv.volunteer = process.argv[2];
	csv.role = process.argv[3];
}

console.log(csv);
loadcsv.updateHrData(csv, function(err) {
	if (err) {
		console.log(err);
	} else {
		console.log('successful.');
	}
});