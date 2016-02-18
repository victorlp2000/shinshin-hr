/**
	Created Mar. 2015 By Victor (Weiping) Liu

	parse data from hr_role, return json obj
*/
//(function() {
	
	function stringify(obj) {
		return JSON.stringify(obj, null, 2);
	}

	/**
	parse data from hr_role, return json obj

	return like [
			{
			    "code": "A",
			    "role": "创会理事",
			    "first_name": null,
			    "last_name": null,
			    "name": null,
			    "photo_file": null,
				"description": null
			},
			...
		]


		code: single char: as category name
			  single char + '#': code group widths
	*/
	function parseAssignData(data) {
		var index;
		var items = [];		// return 
		var currentItem;

		for (index in data) {
			var item = data[index];
			if (item.code.length < 1) {
				// wrong item, continue next
				console.log('wrong item:\n' + stringify(item));
				continue;
			}
			// category name, creat new category
			if (item.code.length == 1) {
				var i = items.push({'category': item.code, 'title': item.role});
				currentItem = items[i - 1];
				currentItem['members'] = [];
				currentItem['codeWidths'] = [1,3,3,3,3];	// default column widths
				currentItem.members.push(item);
				continue;
			}
			// check item for column width
			if (item.code.length == 2 && item.code.substring(1) == '#') {
				currentItem['codeWidths'] = item.role.split(',');
				continue;
			}
			// member item
			if (item.description) {
				// replace new-line into new paragraph
				item.description = item.description.replace('\n', '<p>');
			}
			currentItem.members.push(item);
		}
		//console.log(stringify(items));
		return items;
	}

	/**
		generate html source for tab menu, like

		<ul id="tabmenu">
			<li id="tabA"><a href="#tab-A">title</a></li>
			<li id="tabB"><a href="#tab-A">title</a></li>
			...
		</ul>
	*/
	function generateTabs(items) {
		var html = '<ul id="tabmenu">\n';
		for (var i in items) {
			var item = items[i];
            // jquery-ui tabs needs to have achor link in <li>
			html += '  <li id="tab' + item.category + '"><a href="#tab-' + item.category + '">' + item.title + '</a></li>\n';
		}
		html += '</ul>\n';
		return html;
	}

	/**
		generate html source for members, like
		
		<ul id="tabmenu">
			<li><a id="{CODE}" class="member">title</a></li>
		</ul>
	*/
	function generateMemberList(items) {
		var indent = '';
		/**
            returns number of sections in the code string

            @param code
            @param codeWidths - tells how code is devided into sections
            for example, if codeWidths as [0,2,3,2], means
            for code = '12345678', sections will be: 1 23 456 78
            the returned number will be 4
        */
        function getNumberOfSections(code, codeWidths) {
            var code = code.trim();
            var codeLength = code.length;
            var groups = 0;
            for (groups = 0; groups < codeWidths.length; groups ++) {
                if (codeLength < codeWidths[groups])
                    break;
                codeLength -= codeWidths[groups];
            }
            return groups;
        }

        /**
            combine needed fields values to generate
            text string for the list
        */
        function getMemberTitle(member) {
            var title = '';
            var separator = '';
            var fields = [
            	member.role,
            	member.first_name,
            	member.last_name,
            	member.name
            	];
            for (var i in fields) {
            	var value = fields[i];
            	if (value != null && value != '') {
            		title += separator + value;
                	separator = ' ';
            	}
            }
            return title;
        }

        /**
            generate a list item 
        */
        function addList(text, id) {
        	if (text == null || text == '')
        		return '';
            // with specific class (member), we can set attr by using jquery
            var str = indent + '<li><a id="' + id +
                      '" class="member">' +
                      text + '</a></li>\n';
            return str;
        }

        /**
            open a new level of list item
        */
        function openList(text, id) {
            var str = indent
            var str = indent + '<ul>\n';
            indent += ' ';
            str += addList(text, id);
            return str;
        }

        /**
            close the current level of the list
        */
        function closeList(text, id) {
            indent = indent.substring(1);
            var str = indent + '</ul>\n';
            if (text != null) {
                str += addList(text, id);
            }
            return str;
        }

        /**
            parse all elements in item.members
            generates and returns the html source
        */
        for (var i in items) {
	        var members = items[i].members;
	        var item = items[i];
	        var level = 0;
	        var html = '';
	        for (var i in members) {
	        	var member = members[i];
	        	if (member.code.length == 2 && member.code.substring(1) == '#') {
	        		cnotinue;
	        	}
	            var text = getMemberTitle(member);
		        var ll = getNumberOfSections(member.code, item.codeWidths);
                var id = item.category + i;
	            if (ll < level) {
	                while (ll < level) {
	                    level --;
	                    if (ll == level) {
	                        html += closeList(text, id);
	                    } else {
	                        html += closeList('', id);
	                    }
	                }
	            } else if (ll > level) {
	                while (ll > level) {
	                    level ++;
	                    if (ll == level) {
	                        html += openList(text, id);
	                    } else {
	                        html += openList('', id);
	                    }
	                }
	            } else {
	                html += addList(text, id);
	            }
	        }
	        while (level > 0) {
	            level --
	            html += closeList(null);
	        }
	        item['html'] = html;
	        //console.log(item['html']);
	    }
    }

    function generatePanels(items) {
    	var html = '';
    	generateMemberList(items);
    	for (var i in items) {
    		var item = items[i];
            // panel id must match with anchor href (see jquery-ui tabs)
    		html += '<div class="panel" id="tab-' + item.category + '">' + item.html + '</div>\n';
    	}
    	return html;
    }

    function findMemberById(id) {
    	if (!items) {
    		console.log('did not find global items');
    		return null;
    	}
    	var category = id.charAt(0);
        var index = id.substring(1);

    	for (var i in items) {
    		if (items[i].category == category) {
    			var item = items[i];
    			//console.log(item.title);
    			var member = item.members[index];
    			return member;
			}
    	}
    	return null;
    }


//})();
