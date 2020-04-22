//
// LaunchBar Unicode
//
// default.js
//
// Copyright (c) 2020 Stephen Chong
// https://github.com/snchong
//

var char_category_file = "/Contents/Resources/Categories.json";
var all_items_file = "/Contents/Resources/all.json";
var data_file_dir = "/Contents/Resources/";

function filename_from_cat_id(cat_id) {
    return Action.path + data_file_dir + "cat-" + cat_id + ".json";
}

function loadAllItems() {
    var datafile = Action.path + all_items_file;
    if (!File.exists(datafile)) {
	createDatafiles();
    }

    if (!File.exists(datafile)) {
	LaunchBar.alert("Could not create data files");
	return;
    }
    return File.readJSON(datafile);    
}

function loadCategoryData(cat_id) {
    var datafile = filename_from_cat_id(cat_id);

    if (!File.exists(datafile)) {
	createDatafiles();
    }

    if (!File.exists(datafile)) {
	LaunchBar.alert("Could not create data files; could not find " + datafile);
	return;
    }
    return File.readJSON(datafile);
}




function createDatafiles() {
    LaunchBar.log("Creating data files from " + char_category_file);
    var chardata = File.readJSON(Action.path+char_category_file);

    function cat_num_to_string(n) {
	return n.toString(36);
    }
    
    var cat_count = 1;
    
    var all_items = [];
    var top_category = { chain : [], id:"0", items : [], categories : {} };
    for (var ind = 0; ind < chardata.length; ind++) {
	var ch = chardata[ind];
	var curr_cat = top_category;

	for (var i = 1; i <= 5; i++) {
	    var levelkey = 'level'+i;
	    var cat = ch[levelkey];

	    if (!(levelkey in ch) || cat == "") {
		// insert the character data into curr_cat
		var e = charEntry(ch,curr_cat.chain);
		all_items.push(e);
		curr_cat.items.push(e);
		break;		
	    }
	    
	    // Otherwise, we navigate down one level
	    if (!(cat in curr_cat.categories)) {
		// category is not yet a child of curr_cat
		var cat_id = cat_num_to_string(cat_count++);

		var newchain = curr_cat.chain.slice();
		newchain.push(cat);

		var c = {
		    title: cat,
		    label: "Category",
		    icon: "Category.icns",
		    actionReturnsItems: true,
		    action: "runWithItem",
		    actionArgument: {id:cat_id},
		};
		all_items.push(c);
		curr_cat.items.push(c);
		curr_cat.categories[cat] = {
		    chain : newchain,
		    id:cat_id,
		    items : [],
		    categories : {},
		}
	    }
	    curr_cat = curr_cat.categories[cat];
	}
    }


    var sort_fn = function(a, b) {
        var l1 = a.label;
        var l2 = b.label;
	// Categories go first
	if (l1 == "Category" && l2 != "Category") {
	    return -1;
	}
	if (l2 == "Category" && l1 != "Category") {
	    return 1;
	}
	if (l1 == "Category") {
	    // Sort categories by title
            var t1 = a.title;
            var t2 = b.title;
	    
	    return t1 < t2 ? -1 : t1 > t2;
	}
	// Sort characters by unicode character, which is in the actionArgument field
        var c1 = a.actionArgument;
        var c2 = b.actionArgument;
	    
	return c1 < c2 ? -1 : c1 > c2;
    };

    all_items.sort(sort_fn);
    
    // Now write the files
    function visitCats(cat) {
	cat.items.sort(sort_fn);

	var filename = filename_from_cat_id(cat.id);

	LaunchBar.log("Writing file " + filename);
	File.writeJSON(cat.items, filename, {prettyPrint: false});
	
	for (subcat in cat.categories) {
	    visitCats(cat.categories[subcat]);
	}
    }

    visitCats(top_category);

    File.writeJSON(all_items, Action.path + all_items_file, {prettyPrint: false});

}

function charEntry(ch, chain) {
    var decimal = parseInt("0x"+ch.code)
    var character = String.fromCodePoint(decimal);
    var iconIdentifier = "character:" + character;
    var unicode = "U+" + ch.code;
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
                title: decimal.toString(),
                label: "Decimal",
            },
            {
                title: chain.join(" ▷ "),
                label: "Category",
            },
            {
                title: "Paste character",
		action: "pasteChar",
		actionArgument: character,
            },
        ],
    };
}

function runWithItem(arg) {
    return loadCategoryData(arg.id);
}
function run() {
    return loadCategoryData("0"); // cat id of the top category
}
function runWithString(s) {    
    // filter all
    s = s.toUpperCase();
    return loadAllItems().filter(function (e) {
	return (e.title.toUpperCase().search(s) >= 0 || (e.hasOwnProperty("subtitle") && (e.subtitle.toUpperCase().search(s) >= 0)));
    });
}


/*
 * Paste the character c
 */
function pasteChar(c) {
    LaunchBar.paste(c);
}