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
// Application                                                                //
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
						}
					},

					partials :
					{
						"partial-menu" : "source/menu.html",
						"partial-docs" : "source/docs.html"
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
