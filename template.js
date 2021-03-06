/**
 * grunt-wp-plugin
 * https://github.com/10up/grunt-wp-plugin
 *
 * Copyright (c) 2013 Eric Mann, 10up
 * Licensed under the MIT License
 */

'use strict';

// Basic template description
exports.description = 'Create a WordPress plugin.';

// Template-specific notes to be displayed before question prompts.
exports.notes = '';

// Template-specific notes to be displayed after the question prompts.
exports.after = '';

// Any existing file or directory matching this wildcard will cause a warning.
exports.warnOn = '*';

// Set default slug to current directory name
var slug = process.cwd().substring(process.cwd().lastIndexOf('/')+1)

// Set default plugin title
var title = slug.replace(/-/gi,' ').replace(/\w\S*/gi, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

// Set default function prefix
var prefix = '';
slug.split('-').forEach(function(element) {
	prefix += element.substring(0,1);
});

// The actual init template
exports.template = function( grunt, init, done ) {
	init.process( {}, [
		// Prompt for these values.
		init.prompt( 'title', title ),
		{
			name   : 'slug',
			message: 'Plugin slug (used for text domain)',
			default: slug
		},
		{
			name   : 'prefix',
			message: 'PHP function prefix (alpha and underscore characters only)',
			default: prefix
		},
		{
			name   : 'version',
			message: 'Version',
			default: '1.0.0'
		},
		{
			name   : 'description',
			message: 'Description',
			default: 'The best WordPress extension ever made!'
		},
		{
			name   : 'tags',
			message: 'Tags',
			default: 'e.g. custom, post, type'
		},
		{
			name   : 'homepage',
			message: 'Homepage',
			default: 'http://wordpress.org/plugins/' + slug
		},
		
		// Check ~/.grunt-init/defaults.json for global/system defaults
		init.prompt( 'author_name' ),
		init.prompt( 'author_email' ),
		init.prompt( 'author_url' ),
		{
			name: 'css_type',
			message: 'CSS Preprocessor: Will you use "Sass", "LESS", or "none" for CSS with this project?',
			default: 'Sass'
		}
	], function( err, props ) {
		props.keywords = [];
		props.devDependencies = {
			'grunt':                  'latest',
			'grunt-contrib-concat':   'latest',
			'grunt-contrib-uglify':   'latest',
			'grunt-contrib-cssmin':   'latest',
			'grunt-contrib-jshint':   'latest',
			'grunt-contrib-nodeunit': 'latest',
			'grunt-contrib-watch':    'latest',
			'grunt-contrib-clean':    'latest',
			'grunt-contrib-copy':     'latest',
			'grunt-csscomb':          'latest',
			'grunt-regex-replace':    'latest',
			'grunt-contrib-compress': 'latest',
			'grunt-dev-update':       'latest',
			'grunt-wp-i18n':          'latest',
			'load-grunt-tasks':       'latest'
		};
		
		// Sanitize names where we need to for PHP/JS
		//props.name = props.title.replace( /\s+/g, '-' ).toLowerCase();
		props.name = slug;
		
		// Development prefix (i.e. to prefix PHP function names, variables)
		props.prefix = props.prefix.replace('/[^a-z_]/i', '').toLowerCase();
		
		// Development prefix in all caps (e.g. for constants)
		props.prefix_caps = props.prefix.toUpperCase();
		
		// An additional value, safe to use as a JavaScript identifier.
		//props.js_safe_name = props.name.replace(/[\W_]+/g, '_').replace(/^(\d)/, '_$1');
		props.js_safe_name = slug;
		
		// An additional value that won't conflict with NodeUnit unit tests.
		props.js_test_safe_name = props.js_safe_name === 'test' ? 'myTest' : props.js_safe_name;
		props.js_safe_name_caps = props.js_safe_name.toUpperCase();

		// Files to copy and process
		var files = init.filesToCopy( props );

		switch( props.css_type.toLowerCase()[0] ) {
			case 'l':
				delete files[ 'assets/css/sass/' + props.js_safe_name + '.scss'];
				delete files[ 'assets/css/src/' + props.js_safe_name + '.css' ];
				
				props.devDependencies["grunt-contrib-less"] = "~0.5.0";
				props.css_type = 'less';
				break;
			case 'n':
			case undefined:
				delete files[ 'assets/css/less/' + props.js_safe_name + '.less'];
				delete files[ 'assets/css/sass/' + props.js_safe_name + '.scss'];
				
				props.css_type = 'none';
				break;
			// SASS is the default
			default:
				delete files[ 'assets/css/less/' + props.js_safe_name + '.less'];
				delete files[ 'assets/css/src/' + props.js_safe_name + '.css' ];
				
				props.devDependencies["grunt-contrib-sass"] = "~0.2.2";
				props.css_type = 'sass';
				break;
		}
		
		console.log( files );
		
		// Actually copy and process files
		init.copyAndProcess( files, props );
		
		// Generate package.json file
		init.writePackageJSON( 'package.json', props );
		
		// Done!
		done();
	});
};