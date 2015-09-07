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
					"common/index.css"	: "source/index.styl",
					"common/api.css"	: "source/api.styl",
					"common/docs.css"	: "source/docs.styl"
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
						"partial-menu"	: "source/menu.html",
						"partial-api"	: "source/api.html",
						"partial-docs"	: "source/docs.html"
					}
				},

				files :
				{
					"index.html"		: "source/index.html"
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
