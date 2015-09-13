////////////////////////////////////////////////////////////////////////////////
// -------------------------------------------------------------------------- //
//                                                                            //
//                       (C) 2010-2015 Robot Developers                       //
//                       See LICENSE for licensing info                       //
//                                                                            //
// -------------------------------------------------------------------------- //
////////////////////////////////////////////////////////////////////////////////

"use strict";

//----------------------------------------------------------------------------//
// Modules                                                                    //
//----------------------------------------------------------------------------//

var mMarked = require ("marked");

mMarked.setOptions
({
	breaks: true,
	// Set highlight settings
	highlight: function (code)
	{
		return require ("highlight.js")
			.highlightAuto (code).value;
	}
});



//----------------------------------------------------------------------------//
// Functions                                                                  //
//----------------------------------------------------------------------------//

////////////////////////////////////////////////////////////////////////////////

function parseSrc (content)
{
	var parsed = [ ]; // Fully tokenized input
	var result = [ ]; // The resulting context
	var duplex = { }; // Operator overloading

	// Standardize and remove all C++ comments
	content = content.replace (/\r?\n/gm, "\n")
		  .replace (/(?:^|[^\\])\/\/.*$/gm, "")
		  .replace (  /\/\*[\s\S]*?\*\//gm, "")
		  .split (/\n/);

	// Loop through every line in the source
	for (var l = 0; l < content.length; ++l)
	{
		var tokens = content[l]
			// Split line into tokens
			.split (/(\s+|\(|\)|;|,)/);

		var first = true;
		// Loop through every token in the line
		for (var t = 0; t < tokens.length; ++t)
		{
			tokens[t] = tokens[t].trim();
			// Ignore any empty tokens
			if (tokens[t].length !== 0)
			{
				// Preserve parameter formatting hints
				if (first === true && parsed.length &&
					parsed[parsed.length-1] !== ";" &&
					parsed[parsed.length-1] !== "public:")
					tokens[t] = "\n " + tokens[t];

				parsed.push (tokens[t]); first = false;
			}
		}
	}

	// Loop through all parsed tokens
	for (var p = 0; p < parsed.length; )
	{
		var token = parsed[p++];
		if (token === "public:")
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

		// Check virtual keyword
		if (token === "virtual")
		{
			line.virtual = true;
			token = parsed[p++];
		}

		// Check explicit keyword
		if (token === "explicit")
			token = parsed[p++];

		line.return = "";
		// Check const keyword
		if (token === "const")
		{
			line.return = "const ";
			token = parsed[p++];
		}

		line.return += token;
		token = parsed[p++];

		if (token === "(")
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

			// Check for operator function
			if (line.name === "operator")
			{
				if (token === "(")
				{
					// Handle operator()
					line.name += " ()";
					token = parsed[p++];
					token = parsed[p++];
				}

				else
				{
					line.name += " " + token;
					token = parsed[p++];
				}
			}
		}

		if (!duplex[line.name])
			 duplex[line.name] = 0;
		   ++duplex[line.name];

		if (token !== "(")
			// Expecting start of parameters list
			throw new Error ("Expecting \"(\"");
		token = parsed[p++];

		line.args = [ ];
		// Iterate parameters
		while (token !== ")")
		{
			// Empty params list
			if (token === "void")
			{
				token = parsed[p++];
				continue;
			}

			var arg = { type: "" };
			// Check const keyword
			if (token ===    "const" ||
				token === "\n const")
			{
				arg.type = token + " ";
				token = parsed[p++];
			}

			arg.type += token;
			token = parsed[p++];

			arg.name = token;
			token = parsed[p++];

			// Assemble default
			if (token === "=")
			{
				token = parsed[p++];
				arg.default = "";

				var level = 0;
				while (true)
				{
					if (token === "(") ++level;
					if (token === ")") --level;

					arg.default += token;
					token = parsed[p++];

					if (level === 0 &&
					   (token === "," ||
						token === ")"))
						break;
				}
			}

			line.args.push (arg);
			if (token !== "," &&
				token !== ")")
				throw new Error ("Expecting \",\" or \")\"");


			if (token === ",")
				token = parsed[p++];
		}

		if (token !== ")")
			// Expecting end of parameters list
			throw new Error ("Expecting \")\"");
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
		line = { };
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
				!result[i].args.length)
				name = "operator-neg";

			switch (name)
			{
				case "operator +=" : name = "operator-add-eq"; break;
				case "operator -=" : name = "operator-sub-eq"; break;
				case "operator *=" : name = "operator-mul-eq"; break;
				case "operator /=" : name = "operator-div-eq"; break;

				case "operator +"  : name = "operator-add";    break;
				case "operator -"  : name = "operator-sub";    break;
				case "operator *"  : name = "operator-mul";    break;
				case "operator /"  : name = "operator-div";    break;

				case "operator &=" : name = "operator-and-eq"; break;
				case "operator &"  : name = "operator-and";    break;
				case "operator |=" : name = "operator-or-eq";  break;
				case "operator |"  : name = "operator-or";     break;

				case "operator <"  : name = "operator-lt";     break;
				case "operator >"  : name = "operator-gt";     break;
				case "operator <=" : name = "operator-le";     break;
				case "operator >=" : name = "operator-ge";     break;

				case "operator ==" : name = "operator-eq";     break;
				case "operator !=" : name = "operator-ne";     break;

				case "operator ="  : name = "operator-as";     break;
				case "operator ()" : name = "operator-fn";     break;
			}
		}

		// If operator overloading
		else if (duplex[name] > 1)
			name += "-" + duplex[name]--;

		// Assign new link name
		result[i].link = name;
	}

	return result;
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

		"clean" :
		{
			all :
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

		"watch" :
		{
			"stylus" :
			{
				files : "source/**/*.styl",
				tasks : "stylus"
			},

			"hbs" :
			{
				files : "source/**/*.html",
				tasks : "hbs"
			}
		},



		//----------------------------------------------------------------------------//
		// Stylus                                                                     //
		//----------------------------------------------------------------------------//

		"stylus" :
		{
			all :
			{
				options :
				{
					compress : false,
					import : [ "nib" ]
				},

				files :
				{
					"common/home.css" : "source/home.styl",
					"common/docs.css" : "source/docs.styl"
				}
			}
		},



		//----------------------------------------------------------------------------//
		// Handlebars                                                                 //
		//----------------------------------------------------------------------------//

		"hbs" :
		{
			all :
			{
				options :
				{
					layout : "source/common.html",

					helpers :
					{
						// Inline conditional comparison check
						"ifeq" : function (key, value, content)
						{
							return key === value ?
								content.fn      (this) :
								content.inverse (this);
						},

						// Inline conditional comparison check
						"ifne" : function (key, value, content)
						{
							return key !== value ?
								content.fn      (this) :
								content.inverse (this);
						},

						// Inline HTML context editing
						"context" : function (context)
						{
							var value = JSON.parse (context.fn (this));
							for (var attrname in value)
								this[attrname] = value[attrname];
						},

						// Inline string block insertion
						"string" : function (name, value)
						{
							this[name] = value.fn (this);
						},

						// Inline marked processing
						"marked" : function (value)
						{
							return mMarked
								(value.fn (this));
						},

						// Inline source block processing
						"source" : function (name, value)
						{
							this[name] = parseSrc
								(value.fn (this));
						}
					},

					partials :
					{
						"partial-menu"  : "source/menu.html",
						"partial-docs"  : "source/docs.html",
						"partial-table" : "source/table.html"
					}
				},

				files :
				{
					"index.html"			: "source/home.html",

					"docs/about.html"		: "source/docs/about.html",
					"docs/usage.html"		: "source/docs/usage.html",
					"docs/platforms.html"	: "source/docs/platforms.html",
					"docs/versioning.html"	: "source/docs/versioning.html",
					"docs/changes.html"		: "source/docs/changes.html",

					"docs/philosophy.html"	: "source/docs/philosophy.html",
					"docs/contributing.html": "source/docs/contributing.html",
					"docs/resources.html"	: "source/docs/resources.html",
					"docs/attribution.html"	: "source/docs/attribution.html",

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
