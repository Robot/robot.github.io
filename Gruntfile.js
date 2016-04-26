////////////////////////////////////////////////////////////////////////////////
// -------------------------------------------------------------------------- //
//                                                                            //
//                       (C) 2010-2016 Robot Developers                       //
//                       See LICENSE for licensing info                       //
//                                                                            //
// -------------------------------------------------------------------------- //
////////////////////////////////////////////////////////////////////////////////

"use strict";

//----------------------------------------------------------------------------//
// Modules                                                                    //
//----------------------------------------------------------------------------//

var mMarked    = require ("marked"      );
var mHighlight = require ("highlight.js");

mMarked.setOptions
({
	// Include the highlight settings
	highlight: function (code, lang)
	{
		return lang ?
			mHighlight.highlight     (lang, code).value:
			mHighlight.highlightAuto (      code).value;
	}
});



//----------------------------------------------------------------------------//
// Functions                                                                  //
//----------------------------------------------------------------------------//

////////////////////////////////////////////////////////////////////////////////

var mLinkAPI =
[
	{ name: "int8",			page: "global",		link: "data-types"	},
	{ name: "int16",		page: "global",		link: "data-types"	},
	{ name: "int32",		page: "global",		link: "data-types"	},
	{ name: "int64",		page: "global",		link: "data-types"	},

	{ name: "uint8",		page: "global",		link: "data-types"	},
	{ name: "uint16",		page: "global",		link: "data-types"	},
	{ name: "uint32",		page: "global",		link: "data-types"	},
	{ name: "uint64",		page: "global",		link: "data-types"	},

	{ name: "real32",		page: "global",		link: "data-types"	},
	{ name: "real64",		page: "global",		link: "data-types"	},

	{ name: "intptr",		page: "global",		link: "data-types"	},
	{ name: "uintptr",		page: "global",		link: "data-types"	},

	{ name: "Hash",			page: "hash",		link: false			},
	{ name: "Color",		page: "color",		link: false			},
	{ name: "Image",		page: "image",		link: false			},
	{ name: "Range",		page: "range",		link: false			},
	{ name: "Point",		page: "point",		link: false			},
	{ name: "Size",			page: "size",		link: false			},
	{ name: "Bounds",		page: "bounds",		link: false			},
	{ name: "ValueMap",		page: "enum",		link: "types"		},

	{ name: "Key",			page: "keyboard",	link: "key"			},
	{ name: "KeyList",		page: "keyboard",	link: "types"		},
	{ name: "KeyState",		page: "keyboard",	link: "types"		},
	{ name: "Button",		page: "mouse",		link: "button"		},
	{ name: "ButtonState",	page: "mouse",		link: "types"		},

	{ name: "Process",		page: "process",	link: false			},
	{ name: "ProcessList",	page: "process",	link: "types"		},
	{ name: "Module",		page: "module",		link: false			},
	{ name: "ModuleList",	page: "process",	link: "types"		},
	{ name: "Segment",		page: "module",		link: "segment"		},
	{ name: "SegmentList",	page: "module",		link: "types"		},
	{ name: "Memory",		page: "memory",		link: false			},
	{ name: "Stats",		page: "memory",		link: "stats"		},
	{ name: "Region",		page: "memory",		link: "region"		},
	{ name: "RegionList",	page: "memory",		link: "types"		},
	{ name: "Flags",		page: "memory",		link: "flags"		},
	{ name: "AddressList",	page: "memory",		link: "types"		},

	{ name: "Window",		page: "window",		link: false			},
	{ name: "WindowList",	page: "window",		link: "types"		},
	{ name: "Screen",		page: "screen",		link: false			},
	{ name: "ScreenList",	page: "screen",		link: "types"		},
];

// Compile the data in the linkAPI array
for (var i = 0; i < mLinkAPI.length; ++i)
{
	var name = mLinkAPI[i].name;
	var page = mLinkAPI[i].page;
	var link = mLinkAPI[i].link;

	mLinkAPI[i].page = "<a href=\"/api/" + page + ".html" +
		(link ? "#" + link : "") + "\">" + name + "</a>";

	mLinkAPI[i].name = new RegExp
		("\\b" + name + "\\b", "gm");
}

////////////////////////////////////////////////////////////////////////////////

function parseSrc (content)
{
	var parsed = [ ]; // Fully tokenized input
	var result = [ ]; // The resulting array
	var object = { }; // The resulting object
	var duplex = { }; // Operator overloading

	// Standardize and remove all C++ comments
	content = content.replace (/\r?\n/gm, "\n")
		  .replace (/(?:^|[^\\])\/\/.*$/gm, "")
		  .replace (  /\/\*[\s\S]*?\*\//gm, "")
		  .split (/(\t+|\(|\)|;)/);

	var accum = "";
	var level = 0;
	// Loop through every line in the source
	for (var l = 0; l < content.length; ++l)
	{
		// Make sure to ignore empty tokens
		if (content[l].trim().length !== 0)
		{
			// Check for params list
			if (content[l] === "(")
			{
				accum += content[l];
				++level; continue;
			}

			// Check if params over
			if (content[l] === ")")
			{
				accum += content[l];
				if (--level === 0)
				{
					// Nested brackets are over
					parsed.push (accum.trim());
					accum = "";
				}

				continue;
			}

			if (accum)
			{
				// Collecting params
				accum += content[l];
				continue;
			}

			// Handle static as a special keyword
			if (content[l].indexOf ("static ") >= 0)
			{
				parsed.push ("static");
				content[l] = content[l]
					.replace ("static ", "");
			}

			// Remove miscellaneous chars
			var token = content[l].trim()
				  .replace (/\n|:/gm, "");

			// Handle assignment operator
			if (token === "operator" &&
				content[l+1] === "(" &&
				content[l+3] === ")") {
				token += " ()"; l += 3;
			}

			parsed.push (token);
		}
	}

	// Loop through all parsed tokens
	for (var p = 0; p < parsed.length; )
	{
		var token = parsed[p++];
		if (token === "public")
		{
			// Push separator value
			if (result.length !== 0)
				result.push ({ });
			continue;
		}

		var line = { };
		// Check static keyword
		if (token === "static")
		{
			line.static = true;
			token = parsed[p++];
		}

		// Check explicit keyword
		if (token === "explicit")
			token = parsed[p++];

		line.return = token;
		token = parsed[p++];

		if (token.charAt (0) === "(")
		{
			// Value must be a ctor
			line.name = line.return;
			line.return = "";
		}

		else
		{
			// Normal function
			line.name = token;
			token = parsed[p++];

			if (token === ";")
			{
				// Must be variable
				result.push (line);
				continue;
			}
		}

		if (!duplex[line.name])
			 duplex[line.name] = 0;
		   ++duplex[line.name];

		if (token.charAt (0) !== "(")
			// Expecting start of parameters list
			throw new Error ("Expecting \"(\"");

		line.args = token;
		token = parsed[p++];

		// Check const keyword
		if (token === "const")
		{
			line.const = true;
			token = parsed[p++];
		}

		if (token !== ";")
			// Expecting end of line declaration
			throw new Error ("Expecting \";\"");

		// Must be variable
		result.push (line);
	}

	// Loop through results and assign link names
	for (var i = result.length - 1; i >= 0; --i)
	{
		var name = result[i].name;
		// Check for separator
		if (name === undefined)
			continue;

		if (name.indexOf ("operator") >= 0)
		{
			// Properly handle negation
			if (name === "operator -" &&
				result[i].args === "(void)")
			{
				name = "OpNeg";
				--duplex[result[i].name];
			}

			switch (name)
			{
				case "operator +=": name = "OpAddEq"; break;
				case "operator -=": name = "OpSubEq"; break;
				case "operator *=": name = "OpMulEq"; break;
				case "operator /=": name = "OpDivEq"; break;

				case "operator +" : name = "OpAdd";   break;
				case "operator -" : name = "OpSub";   break;
				case "operator *" : name = "OpMul";   break;
				case "operator /" : name = "OpDiv";   break;

				case "operator |=": name = "OpOrEq";  break;
				case "operator |" : name = "OpOr";    break;
				case "operator &=": name = "OpAndEq"; break;
				case "operator &" : name = "OpAnd";   break;

				case "operator <" : name = "OpLt";    break;
				case "operator >" : name = "OpGt";    break;
				case "operator <=": name = "OpLe";    break;
				case "operator >=": name = "OpGe";    break;

				case "operator ==": name = "OpEq";    break;
				case "operator !=": name = "OpNe";    break;

				case "operator =" : name = "OpAs";    break;
				case "operator ()": name = "OpFn";    break;
			}
		}

		// Process constructors separately
		else if (!result[i].return.length)
			name = "Ctor";

		// For function overloading
		if (duplex[result[i].name] > 1)
			name += duplex[result[i].name]--;

		// Assign new link name
		result[i].link = name;
	}

	// Loop through results and create object
	for (var i = 0; i < result.length; ++i)
		object[result[i].link || ("empty" + i)] = result[i];

	return object;
};



//----------------------------------------------------------------------------//
// Grunt                                                                      //
//----------------------------------------------------------------------------//

////////////////////////////////////////////////////////////////////////////////

module.exports = function (grunt)
{
	grunt.initConfig
	({
		//----------------------------------------------------------------------------//
		// Clean                                                                      //
		//----------------------------------------------------------------------------//

		"clean":
		{
			all:
			[
				"index.html",
				"api/", "docs/",
				"common/*.css",
				"!common/normalize.css"
			]
		},



		//----------------------------------------------------------------------------//
		// Watch                                                                      //
		//----------------------------------------------------------------------------//

		"watch":
		{
			"stylus":
			{
				files: "source/**/*.styl",
				tasks: "stylus"
			},

			"hbs":
			{
				files: "source/**/*.html",
				tasks: "hbs"
			}
		},



		//----------------------------------------------------------------------------//
		// Stylus                                                                     //
		//----------------------------------------------------------------------------//

		"stylus":
		{
			all:
			{
				options:
				{
					compress: false,
					import: [ "nib" ]
				},

				files:
				{
					"common/home.css": "source/home.styl",
					"common/docs.css": "source/docs.styl"
				}
			}
		},



		//----------------------------------------------------------------------------//
		// Handlebars                                                                 //
		//----------------------------------------------------------------------------//

		"hbs":
		{
			all:
			{
				options:
				{
					layout: "source/common.html",

					helpers:
					{
						// Inline conditional comparison check
						"ifeq": function (key, value, content)
						{
							return key === value ?
								content.fn      (this) :
								content.inverse (this);
						},

						// Inline conditional comparison check
						"ifne": function (key, value, content)
						{
							return key !== value ?
								content.fn      (this) :
								content.inverse (this);
						},

						// Convert to lower case
						"toLower": function (str)
						{
							return str.toLowerCase();
						},

						// Convert to upper case
						"toUpper": function (str)
						{
							return str.toUpperCase();
						},

						// Inline HTML context editing
						"context": function (context)
						{
							var value = JSON.parse (context.fn (this));
							for (var attrname in value)
								this[attrname] = value[attrname];
						},

						// Inline string block insertion
						"string": function (name, value)
						{
							this[name] = value.fn (this);
						},

						// Inline marked processing
						"marked": function (value)
						{
							return mMarked
								(value.fn (this));
						},

						// Inline class block processing
						"class": function (name, value)
						{
							var source = parseSrc (value.fn (this));
							source.name = name; this[name] = source;
						},

						// Inline api link rendering
						"linkAPI": function (content)
						{
							content = content.fn (this);
							// Auto link all of the Robot data types
							for (var i = 0; i < mLinkAPI.length; ++i)
							{
								content = content.replace
										(mLinkAPI[i].name,
										 mLinkAPI[i].page);
							}

							return content;
						}
					},

					partials:
					{
						"partial-menu" : "source/menu.html",
						"partial-docs" : "source/docs.html",
						"partial-edit" : "source/edit.html",
						"partial-inc"  : "source/include.html",
						"partial-class": "source/class.html",
						"partial-fn"   : "source/function.html"
					}
				},

				files:
				{
					"index.html"			: "source/home.html",

					"docs/about.html"		: "source/docs/about.html",
					"docs/usage.html"		: "source/docs/usage.html",
					"docs/node.html"		: "source/docs/node.html",
					"docs/platforms.html"	: "source/docs/platforms.html",
					"docs/versioning.html"	: "source/docs/versioning.html",

					"docs/philosophy.html"	: "source/docs/philosophy.html",
					"docs/contributing.html": "source/docs/contributing.html",
					"docs/conduct.html"		: "source/docs/conduct.html",
					"docs/branding.html"	: "source/docs/branding.html",
					"docs/attributions.html": "source/docs/attributions.html",

					"api/global.html"		: "source/api/global.html",
					"api/enum.html"			: "source/api/enum.html",
					"api/hash.html"			: "source/api/hash.html",
					"api/color.html"		: "source/api/color.html",
					"api/image.html"		: "source/api/image.html",
					"api/range.html"		: "source/api/range.html",
					"api/point.html"		: "source/api/point.html",
					"api/size.html"			: "source/api/size.html",
					"api/bounds.html"		: "source/api/bounds.html",

					"api/keyboard.html"		: "source/api/keyboard.html",
					"api/mouse.html"		: "source/api/mouse.html",
					"api/process.html"		: "source/api/process.html",
					"api/module.html"		: "source/api/module.html",
					"api/memory.html"		: "source/api/memory.html",
					"api/window.html"		: "source/api/window.html",
					"api/screen.html"		: "source/api/screen.html",
					"api/timer.html"		: "source/api/timer.html",
					"api/clipboard.html"	: "source/api/clipboard.html"
				}
			}
		}
	});



	//----------------------------------------------------------------------------//
	// Loaders                                                                    //
	//----------------------------------------------------------------------------//

	grunt.loadNpmTasks ("grunt-contrib-clean" );
	grunt.loadNpmTasks ("grunt-contrib-watch" );
	grunt.loadNpmTasks ("grunt-contrib-stylus");
	grunt.loadNpmTasks ("grunt-static-hbs"    );

	grunt.registerTask ("default", ["stylus", "hbs"]);
}
