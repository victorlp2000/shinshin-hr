var express = require('express');
var router = express.Router();
var http = require('http');
var htmlparser = require('htmlparser');

var options = {
	host: 'www.shinshinfoundation.org',
	path: '/pucha_photos/'
}

var pagehtml = "";

var handler = new htmlparser.DefaultHandler(function(err, dom) {
	if (err) {
		console.log(err);
	} else {
		var index;
		for (index in dom) {
			if (dom[index].type === "tag" && dom[index].name === "html") {
				parse_html_children(dom[index].children);
			}
		}
	}
});

function parse_html_children(html) {
	var index;
	for (index in html) {
		if (html[index].type === "tag" && html[index].name === "body") {
			parse_body_children(html[index].children);
		}
	}
}

function parse_body_children(body) {
	var index;
	for (index in body) {
		if (body[index].type === "tag" && body[index].name === "table") {
			parse_table_children(body[index].children);
		}
	}
}

function parse_table_children(table) {
	var index;
	for (index in table) {
		if (table[index].type === "tag" && table[index].name === "tr") {
			parse_tr_children(table[index].children);
		}
	}
}

function parse_tr_children(tr) {
	var index;
	for (index in tr) {
		if (tr[index].type === "tag" && tr[index].name === "td") {
			get_attribs(tr[index].children);
		}
	}
}

function get_attribs(obj) {
	for (index in obj) {
		if (obj[index].type === "tag" && obj[index].name === "a") {
			var href = obj[0].attribs.href;
			if (href != '/') {
				console.log(href);
				pagehtml += '<img src="http://www.shinshinfoundation.org/pucha_photos/' + href + '" width="100" />';
			}
		}
	}
}

var parser = new htmlparser.Parser(handler);

/* GET home page. */
router.get('/', function(req, res, next) {
	http.request(options, function(response) {
		var str = '';
		response.on('data', function(chunk) {
			str += chunk;
		});	
		response.on('end', function() {
			pagehtml = "<html><body>"
			parser.parseComplete(str);
			pagehtml += "</body></html>";
			res.send(pagehtml);
		});
	}).end();
});

module.exports = router;
