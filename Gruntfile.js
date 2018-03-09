'use strict';

module.exports = function (grunt) {

  grunt.initConfig({

    tslint: {
      options: {
        // can be a configuration object or a filepath to tslint.json 
        configuration: 'tslint.json',
        // If set to true, tslint errors will be reported, but not fail the task 
        // If set to false, tslint errors will be reported, and the task will fail 
        force: false,
        fix: false
      },
      files: {
        src: ['src/**/*.ts']
      }
    },

    ts: {
      default: {
        src: ['./src/**/*.ts', './src/**/*.js'],
        outDir: './built',
        options: {
          rootDir: './src',
          allowJs: true,
          target: 'es5',
          sourceMap: true,
          removeComments: false,
          verbose: false
        }
      }
    },

    meta: {
      pkg: grunt.file.readJSON('package.json'),
      src: {
        js: [
          // order is important!
          'built/ng-obiba.js',
          'built/graphics/graphics.js',
          'built/utils/utils.js',
          'built/notification/notification.js',
          'built/notification/notification-controller.js',
          'built/rest/rest.js',
          'built/form/form.js',
          'built/form/form-service.js',
          'built/form/form-directive.js',
          'built/alert/alert.js',
          'built/alert/alert-service.js',
          'built/alert/alert-directive.js',
          'built/comments/comments.js',
          'built/comments/comments-directive.js',
          'built/directives/**/*.js'
        ]
      }
    },

    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          "dist/css/ng-obiba.css": "less/ng-obiba.less" // destination file and source file
        }
      }
    },

    clean: {
      build: ['<%= destination_dir %>/bower_components', 'tmp', 'dist', 'built'],
      tmp: ['tmp']
    },

    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    },

    /* convert AngularJs html templates to cached JavaScript */
    html2js: {
      main: {
        options: {},
        src: ['src/**/*.tpl.html'],
        dest: 'tmp/<%= meta.pkg.name %>.templates.js'
      }
    },

    concat: {
      options: {
        separator: '\n',
        banner: '/*!\n' +
          ' * <%= meta.pkg.name %> - v<%= meta.pkg.version %>\n' +
          ' * <%= meta.pkg.homepage %>\n *\n' +
          ' * License: <%= meta.pkg.license %>\n' +
          ' * Date: <%= grunt.template.today("yyyy-mm-dd") %>\n' +
          ' */\n'
      },
      dist: {
        src: ['<%= meta.src.js %>', 'tmp/*.js'],
        dest: 'dist/<%= meta.pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        // Preserve banner
        preserveComments: 'some'
      },
      dist: {
        files: {
          'dist/<%= meta.pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    jshint: {
      files: ['built/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    }
  });

  grunt.loadNpmTasks("grunt-tslint");
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('default', ['clean:build', 'tslint', 'ts', 'less', 'jshint', 'html2js', 'concat', 'clean:tmp', 'karma', 'uglify']);

};