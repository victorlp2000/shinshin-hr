/**
    Written: Weiping Liu
    Created: Jun 8, 2016

    Generate sql from csv file:

        $ csv-to sql csvfile table sqlfile
            csvfile - csv filename
            table - table name
            sqlfile - optional, default 'test.sql'

        first row: column names
        second row: data type and optional length
            I - for integer
            C - for char
            V - for varchar
            D - for date
        default data type: V

    CSV file:
        Encoding: Unicode 16 LE, delimitor: TAB

    SQL script generated as:
        CREATE TABLE table (...);
        INSERT INTO TABLE table VALUES (...),(...), ...,(...);
*/
var csv = require('csv');
var fs = require('fs');
var iconvlite = require('iconv-lite');

var outputStream;
var columns = [];
var types = [];

function getColumns(csvfile, callback) {
    //console.log("report column wodths from " + csvfile);
    var datatypes = [];
    var widths = [];
    var parser = csv.parse({delimiter: '\t'});
    parser.on('readable', function() {
        var record;
        while (record = parser.read()) {
            var i;
            if (parser.count == 1) {
                columns = record;
                for (i = 0; i < record.length; i++) {
                    widths[i] = 0;
                }
            } else if (parser.count == 2) {
                datatypes = record;
            } else {
                for (i = 0; i < record.length; i++) {
                    widths[i] = Math.max(widths[i], Buffer.byteLength(record[i]));
                }
            }
        }
    });
    parser.on('error', function(err) {
        console.log(err);
    });

    parser.on('finish', function() {
        var data = [];
        for (var i in columns) {
            var name = columns[i];
            var type;
            var size = widths[i];
            type = datatypes[i].trim().toUpperCase();
           
            if (type === undefined || type === '') {
                type = 'VARCHAR';
            } else if (type.charAt(0) == 'I') {
                type = 'INTEGER';
            } else if (type.charAt(0) == 'D') {
                type = 'DATE';
            } else {
                type = 'VARCHAR';
            }
            types[i] = type;
            data.push({'name': name, 'type': type, 'size': size});
        }
        callback(null, data);
    })

    var converter = iconvlite.decodeStream('utf-16le');

    fs.createReadStream(csvfile, 'utf-16le').pipe(converter).pipe(parser);
}

function CreateTable(tableName, csvFile, callback) {
    var endline = '\n';
    var i, column;
    outputStream.write('CREATE TABLE IF NOT EXISTS ' + tableName + ' (' + endline);
    getColumns(csvFile, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            // start from row 2 (1 column-name, 2: type&size)
            for (i in data) {
                column = data[i];
                if (i > 0)
                    outputStream.write(',\n');
                switch (column.type) {
                    case 'DATE':
                    case 'INTEGER':
                        outputStream.write('\t' + column.name + '\t' + column.type);
                        break;
                    default:
                        outputStream.write('\t' + column.name + '\t' + column.type + '(' + column.size + ')');
                        break;
                }
            }
        }
        outputStream.write('\n\t);\n');
        console.log('created table: ' + tableName);
        callback(err);
    })
}

function insertData(tableName, csvFile, callback) {
    var parser = csv.parse({delimiter: '\t'});
    var line = 0;
    outputStream.write('INSERT INTO ' + tableName + ' VALUES ');
    parser.on('readable', function() {
        var record;
        var i;
        var endline = '';
        while (record = parser.read()) {
            line ++;
            if (line <= 2)
                continue;

            // end last line
            if (line > 3)
                outputStream.write(',\n');
            
            var separator = '';
            var sql = '(';
            for (i in record) {
                if (i != 0)
                    separator = ',';
                // escape '
                record[i].replace("'", "''");
                sql += separator + "'" + record[i] + "'";
            }
            sql += ')';
            outputStream.write(sql);
        }
    });
    parser.on('error', function(err) {
        console.log(err);
    });

    parser.on('finish', function() {
        // close last insert
        outputStream.write(';\n');
        console.log('inserted ' + (line - 2) + ' row(s).');
        callback(null);
    })

    var converter = iconvlite.decodeStream('utf-16le');

    fs.createReadStream(csvFile, 'utf-16le').pipe(converter).pipe(parser);
}

if (process.argv.length > 2) {
    var csvFile = process.argv[2];
    var table = 'testTable';
    var sqlFile = 'test.sql';
    if (process.argv.length > 3) {
        table = process.argv[3];
    }
    if (process.argv.length > 4) {
        sqlFile = process.argv[4];
    }

    console.log('generated: ' + sqlFile);
    outputStream = fs.createWriteStream(sqlFile);
    outputStream.write('DROP TABLE IF EXISTS ' + table + ';\n')
    CreateTable(table, csvFile, function(err) {
        if (err) {
            console.log(err);
        } else {
            insertData(table, csvFile, function(err) {
                outputStream.end();
            })
        }
    });
} else {
    console.log(process.argv[1], 'csv-file [table-name] [sql-file]');
    console.log('\tcsv-file:');
    console.log('\t  first-row: column-name');
    console.log('\t  second-row: data-type');
}