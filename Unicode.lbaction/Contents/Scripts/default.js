//
// LaunchBar Unicode
//
// default.js
//
// Copyright (c) 2020 Stephen Chong
// https://github.com/snchong
//

var char_category_file = "/Contents/Resources/Categories.json";
var unicode_data_file = "/Contents/Resources/unicode_data.json";

function convertCharData() {
    LaunchBar.log("Converting character data from " + char_category_file);
    var chardata = File.readJSON(Action.path+char_category_file);


    var chldrn = [];
    var lists_to_sort = [chldrn];
    var dict = { children : chldrn };
    var nav_top = { d : dict };
    for (var ind = 0; ind < chardata.length; ind++) {
	var ch = chardata[ind];
	var nav = nav_top;
	if (ch.level1 == "Control") {
	    continue;
	}
	
	for (var i = 1; i <= 5; i++) {
	    var levelkey = 'level'+i;
	    var cat = ch[levelkey];

	    if (!(levelkey in ch) || cat == "") {
		// insert the character data into d
		nav.d.children.push(charEntry(ch));
		break;		
	    }
	    // Otherwise, we navigate down one level
	    if (!(cat in nav)) {
		// category is not yet in the navaigation dict
		// Create it
		chldrn = [];
		lists_to_sort.push(chldrn);
		var newd = {
		    title: cat,
		    label: "Category",
		    icon: "Category.icns",
		    children : chldrn,
		};
		nav.d.children.push(newd);
		nav[cat] = { d : newd };		
	    }
	    nav = nav[cat];
	}
    }


    // Now sort...
    for (var i = 0; i < lists_to_sort.length; i++) {
	lists_to_sort[i].sort(function(a, b) {
            var t1 = a.title;
            var t2 = b.title;
            var l1 = a.label;
            var l2 = b.label;
	    // Categories go first
	    if (l1 == "Category" && l2 != "Category") {
		return -1;
	    }
	    if (l2 == "Category" && l1 != "Category") {
		return 1;
	    }
	    return t1 < t2 ? -1 : t1 > t2;
	});
    }

    return dict.children;
}

function loadCharData() {
    var datafile = Action.path+unicode_data_file;

    if (!File.exists(datafile)) {
	LaunchBar.log("Creating unicode data " + unicode_data_file);
	var unicode_data = convertCharData();
	File.writeJSON(unicode_data, datafile, {prettyPrint: false});
	return unicode_data;
    }
    else {
	LaunchBar.log("Loading unicode data from " + unicode_data_file);
	return File.readJSON(datafile);
    }
}

function run(arg) {
    return loadCharData();

}

function charEntry(ch) {
    var character = String.fromCodePoint(parseInt("0x"+ch.code));
    var iconIdentifier = "character:" + character;
    var unicode = "U+" + character.charCodeAt(0).toString(16).toUpperCase();
    var decimal = character.charCodeAt(0).toString(10).toUpperCase();
    return {
        title: ch.name,
        subtitle: "Unicode " + unicode +"; decimal " + decimal,
        label: unicode,
        icon: iconIdentifier,
	action: "pasteChar",
	actionArgument: character,
        children: [
            {
                title: ch.name,
                label: "Character",
            },
            {
                title: unicode,
                label: "Unicode",
            },
            {
                title: decimal,
                label: "Decimal",
            },
            {
                title: "Paste character",
		action: "pasteChar",
		actionArgument: character,
            },
        ],
    };
}

/*
 * Paste the character c
 */
function pasteChar(c) {
    LaunchBar.paste(c);
}