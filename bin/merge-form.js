/*
    将学校管理系统导出的项目申请结果form_basic.csv汇总成summary.csv
    命令格式：
        $ node summary.js 项目名称 导出结果.csv
    例如：
        $ node summary.js 图书项目 ～/Downloads/form_basic.csv
    将会在summary.csv文件中增加一列 ‘图书项目’（或者替换原有的列）
    
    form_basic.csv
    地区  学校编号    学校名
    江西  143     江西省奉新縣于洲鎮思諭欣欣三小學
    青海  126     青海省大通縣長寧鎮諾發欣欣完全小學
    青海  89      青海省互助土族自治縣東溝鄉卡子修貞欣欣小學
    吉林  38      吉林省通榆縣羊井鄉黎明村小學
    山东  152     山東省高密市注泃鎮慶葵欣欣小學

    summary.csv
    地区  学校编号 图书项目 电子化设备 工程项目
    合计  80      29     19       25
    安徽  251     1
    安徽  255     1      1
    安徽  256                     1
*/
var fs = require('fs');
var csv = require('csv');

var summaryFilename = 'summary.csv';
var summary = {};
var columns = {};   // column names
var HEAD = 'head';
var SUM = 'sum';
// summary['school-number'] = ['地区', '学校编号', '项目1', ...]
// columns['项目1'] = columnIndex;

// initialize summary object with two basic rows
function initSummary() {
    console.log('---init summary...');
    // two rows
    summary[HEAD] =  ['地区', '学校编号'];
    summary[SUM] = ['', ''];
    // two columns
    columns['地区'] = 0;
    columns['学校编号'] = 1;
}

// load existing summary.csv into summary
// we need callback to make sure all data loaded before process other data
function loadSummary(callback) {
    console.log('---load summary from', summaryFilename);
    var data = null;
    try {
        data = fs.readFileSync(summaryFilename);
        csv.parse(data, function(err, data) {
            if (err) {
                console.log(err);
                initSummary();
            } else {
                var i, j;
                for (i in data) {
                    if (i == 0) {
                        // header row, init columns
                        for (j in data[0]) {
                            // set columnName = index
                            columns[data[0][j]] = j;
                        }
                        // copy header row
                        summary[HEAD] = data[i];
                    } else if (i == 1) {
                        // copy sum row (space holder)
                        summary[SUM] = data[i];
                    } else {
                        // using school-number as index
                        summary[data[i][1]] = data[i];
                    }
                }
            }
            callback();
        })
    } catch (e) {
        initSummary();
        callback();
    }
}

// save summary data into file
function saveSummary() {
    console.log('---save summary to', summaryFilename);
    var data = '';
    var stringifier = csv.stringify();

    // handler, when received a row
    stringifier.on('readable', function() {
        while (row = stringifier.read()) {
            data += row;
        }
    });

    // handler: when finished all rows
    stringifier.on('finish', function() {
        //console.log('---writing...');
        //console.log(data);
        fs.writeFile(summaryFilename, data, function(err) {
            if (err) {
                console.log('Error in write file ' + summaryFilename);
            }
        })
    });

    var i;
    var rows = getNumberOfRows();

    // feeding HEAD row into stringifier
    stringifier.write(summary[HEAD]);

    for (i in summary[HEAD]) {
        if (i > 1) {
            var cName = convertIndexToColumnName(i);
            summary[SUM][i] = '=SUM(' + cName + '3:' + cName + rows + ')';
        }
    }
    summary[SUM][0] = '合计';
    summary[SUM][1] = '=COUNT(B3:B' + rows + ')';

    // feeding SUM row into
    stringifier.write(summary[SUM]);

    // feeding all other data rows
    for (i in summary) {
        if (i != HEAD && i != SUM)
            stringifier.write(summary[i]);
    }

    // finish feeding data
    stringifier.end();
}

// return total number of rows in summary
function getNumberOfRows() {
    var i, r = 0;
    for (i in summary) {
        r ++;
    }
    return r;
}

// convert index number [1, 2, ...] into name [A, B, ...]
function convertIndexToColumnName(index) {
    var c = String.fromCharCode(65 + parseInt(index));
    //console.log('column: ', index, c);
    return c;
}

function addSummaryData(name, csvfile, callback) {
    console.log('---addSummaryData: ', name, csvfile);
    var i, j = 0;

    // check if the given column name existing
    if (columns[name] == null) {
        for (i in columns) {
            j ++;
        }
        console.log('---append new column', name, 'at', j);
        // append new column
        columns[name] = j;
        summary[HEAD][j] = name;
    } else {
        // get index from existing column
        j = columns[name];
        console.log('---replace column', name, 'at', j);
    }
    // clear the colummn values
    for (i in summary) {
        if (i != HEAD && i != SUM)
            summary[i][j] = '';
    }

    // loading csv data (utf16 le)
    try {
        var data = fs.readFileSync(csvfile, 'utf16le');
        //console.log(data);
        csv.parse(data, {delimiter: '\t'}, function(err, data) {
            if (err) {
                console.log('---error in adding column: ' + name);
                console.log(err);
            }
            for (i in data) {
                // ignore the first header row and rows column less than 2 
                if (i > 0 && data[i].length > 1) {
                    //console.log(data[i]);
                    if (summary[data[i][1]] == null) {
                        //console.log('---add new row');
                        summary[data[i][1]] = [data[i][0], data[i][1]];
                    }
                    // set value to 1
                    summary[data[i][1]][columns[name]] = 1;
                }
            }
            console.log('---finish', i, name);
            callback(name);
        })
    } catch (err) {
        console.log('--- error in process file: ' + csvfile);
        callback(name);
    }
}

var args = process.argv.splice(2);
if (args.length > 0) {
    loadSummary(function() {
        if (args.length > 1) {
            addSummaryData(args[0], args[1], function(item) {
                //console.log(summary);
                saveSummary();
            });
            args = args.splice(2);
        }
    });
} else {
    console.log('Missing [name] [csv-file]');
}
