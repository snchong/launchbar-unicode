//
// LaunchBar Unicode
//
// default.js
//
// Copyright (c) 2020 Stephen Chong
// https://github.com/snchong
//

var char_category_file = "/Contents/Resources/Categories.json";
var data_file_dir = "/Contents/Resources/";

function filename_from_cat_chain(chain) {
    var s = Action.path + data_file_dir + "cat";
    for (var i = 0; i < chain.length; i++) {
	s += "-";	
	s += chain[i].replace(/[\W]+/g,"_");
    }
    
    return s+".json";
}

function createDatafiles() {
    LaunchBar.log("Creating data files from " + char_category_file);
    var chardata = File.readJSON(Action.path+char_category_file);


    var chldrn = [];
    var top_category = { chain : [], items : [], categories : {} };
    for (var ind = 0; ind < chardata.length; ind++) {
	var ch = chardata[ind];
	var curr_cat = top_category;
	if (ch.level1 == "Control") {
	    continue;
	}

	var category_chain = [];
	
	for (var i = 1; i <= 5; i++) {
	    var levelkey = 'level'+i;
	    var cat = ch[levelkey];

	    if (!(levelkey in ch) || cat == "") {
		// insert the character data into curr_cat
		curr_cat.items.push(charEntry(ch));
		break;		
	    }
	    
	    // Otherwise, we navigate down one level
	    if (!(cat in curr_cat.categories)) {
		// category is not yet a child of curr_cat

		var newchain = curr_cat.chain.slice();
		newchain.push(cat);
		
		curr_cat.items.push({
		    title: cat,
		    label: "Category",
		    icon: "Category.icns",
		    actionReturnsItems: true,
		    action: "run",
		    actionArgument: {chain:newchain},
		});
		curr_cat.categories[cat] = {
		    chain : newchain,
		    items : [],
		    categories : {},
		}
	    }
	    curr_cat = curr_cat.categories[cat];
	}
    }


    // Now write the files
    function visitCats(cat) {
	cat.items.sort(function(a, b) {
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

	var filename = filename_from_cat_chain(cat.chain);

	LaunchBar.log("Writing file " + filename);
	File.writeJSON(cat.items, filename, {prettyPrint: false});
	
	for (subcat in cat.categories) {
	    visitCats(cat.categories[subcat]);
	}
    }

    visitCats(top_category);
}

function loadCategoryData(chain) {
    var datafile = filename_from_cat_chain(chain);

    if (!File.exists(datafile)) {
	createDatafiles();
    }

    if (!File.exists(datafile)) {
	LaunchBar.alert("Could not create data files");
	return;
    }
    LaunchBar.log("Reading datafile " + datafile);
    return File.readJSON(datafile);
}

function run(arg) {
    if (!arg) {
	arg = { chain : [] };
    }
    return loadCategoryData(arg.chain);

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