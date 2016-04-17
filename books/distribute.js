
var parse = require('csv-parse');
var fs = require('fs')

function distribute(csvFile, head, columnName, list) {
	console.log('distribute: ' + csvFile);
	console.log('header: ' + head);
	var cIndex = columnIndex(columnName);
	if (cIndex == -1) {
		return;
	}
	console.log('column: ' + cIndex);
	console.log('distribute: ' + list);
	
	// descending sort 
	var sorting = function(a, b) {
		return (a[cIndex] > b[cIndex]);
	}

	var distributing = {
		dataIndex: 0,
		dataSet : null,
		dataBegin: 0,

		setHeader: function(header) {
			console.log('setHeader()...');
			var i;
			for (i = 0; i < this.dataSet.length; i++) {
				this.dataSet[i].push(header);
			}
			this.dataBegin ++;
		},

		insertTotal: function() {
			console.log('insertTotal()...');
			this.dataBegin ++;
			var i, element, columns;
			for (i = 0; i < this.dataSet.length; i++) {
				if (this.dataSet[i].length > 0) {
					columns = this.dataSet[i][0].length;
				} else {
					columns = cIndex;
				}
				element = new Array(columns);
				var dataEnd = this.dataSet[i].length - this.dataBegin + 3;
				element[cIndex] = "=SUM(" + columnName + (this.dataBegin + 1) + ":" + columnName + dataEnd + ")";
				this.dataSet[i].splice(this.dataBegin - 1, 0, element);
			}
		},

		initDataList: function(elements) {
			console.log('initDataList()...');
			var i;
			this.dataSet = new Array(elements);
			for (i = 0; i < elements; i++) {
				this.dataSet[i] = new Array();
			}
		},

		// distribute a book to files 
		putData: function(data) {
			//console.log('putData()...');
			// get total number of books from the specific data column
			var books = parseInt(data[cIndex]);
			//console.log('books: ' + books);
			// asign to data-set

			while (books > 0) {
				// how many books per set
				var n = Math.ceil(parseInt(data[cIndex]) / list.length);
				if (n < 1)
					n = 1;
				if (n > books)
					n = books;
				var line = data.slice(0);
				line[cIndex] = n.toString();	// set new number
				//console.log(line);
				//console.log('dataIndex:' + this.dataIndex);
				while (list[this.dataIndex] < 0) {
					this.dataIndex ++;
					if (this.dataIndex >= this.dataSet.length)
						this.dataIndex = 0;
				}
				//console.log('------ set into file: ' + this.dataIndex + "[" + n + "]");
				this.dataSet[this.dataIndex].push(line);
				list[this.dataIndex] -= n;
				this.dataIndex ++;
				if (this.dataIndex >= this.dataSet.length)
					this.dataIndex = 0;
				books -= n;
			}
		},

		printInfo: function() {
			console.log('printInfo()...');
			var i, j, total = 0;
			for (i = 0; i < this.dataSet.length; i ++) {
				var summary = 0;
				for (j = this.dataBegin; j < this.dataSet[i].length; j++) {
					summary += parseInt(this.dataSet[i][j][cIndex]);
				}
				total += summary;
				console.log("Book Set[" + i + "] " + summary);
			}
			console.log("Total: " + total);
		},

		saveToFiles: function(prefix) {
			console.log('saveToFiles()...');
			var i, line;
			for (i = 0; i < this.dataSet.length; i++) {
				var filename = prefix + i.toString() + ".csv";
				var file = fs.createWriteStream(filename);
				this.dataSet[i].forEach(function(v) {
					file.write(v + '\n');
				})
				file.end();
			}
		},
	}

	function setList(total) {
		var i;
		var knownTotal = 0;
		var knownItems = 0;
		for (i = 0; i < list.length; i++) {
			if (list[i] != -1 && list[i] != 0) {
				knownTotal += list[i];
				knownItems ++;
			}
		}
		var average = Math.ceil((total - knownTotal) / (list.length - knownItems));
		for (i = 0; i < list.length; i++) {
			if (list[i] == -1 || list[i] == 0) {
				list[i] = average;
			}
		}
		console.log("set list: " + list);
	}

	var parser = parse({delimiter: ','}, function(err, data0) {
		var data;
		var i;

		if (head != 0) {
			data = data0.slice(1);
		} else {
			data = data0;
		}
		// sort descending, handle big number first
		data.sort(sorting);
		// get total number of books
		var n, total = 0;
		for (i = 0; i < data.length; i++) {
			n = parseInt(data[i][cIndex]);
			if (n > list.length * 5) {
				console.log("number is too big at line (> 5 per school)" + i);
			}
			total += n;
		}
		
		// assign number of book for each set
		setList(total);

		// distributing...
		distributing.initDataList(list.length);
		if (head)
			distributing.setHeader(data0[0]);
		
		for (i = 0; i < data.length; i++) {
			distributing.putData(data[i]);
		}
		distributing.insertTotal();
		distributing.printInfo();
		distributing.saveToFiles('out-');
	});
	fs.createReadStream(csvFile).pipe(parser);
}

// convert column name like 'A' to 0, 'B' to 1, ...
// 'AA' to 26, 'AB' to 27, ...
function columnIndex(name) {
	var index;
	// column name like 'A'... 'AA'...
	name = name.toUpperCase();
	for (index = 0; index < name.length; index ++) {
		if (name.charAt(index) < 'A' || name.charAt(index) > 'Z') {
			console.log('error');
			return -1;
		}
	}
	index = 0;
	while (name.length > 0) {
		index = index * 26 + (name.charCodeAt(0) - 'A'.charCodeAt(0) + 1);
		name = name.substr(1);
		//console.log(name + ' ' + index);
	}
	return index - 1;
}

distribute('欣欣教育基金会.csv', 1, 'D', [1000, -1, 2000, -1]);
//distribute('test.csv', 1, 'D', [-1, -1, -1, -1]);
