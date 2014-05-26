module.exports = function (grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    clean: ['<%= destination_dir %>/bower_components', 'tmp'],

    /* convert AngularJs html templates to cached JavaScript */
    html2js: {
      main: {
        options: {},
        src: ['src/**/*.tpl.html'],
        dest: 'tmp/<%= pkg.name %>.templates.js'
      }
    },

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['src/**/*.js', 'tmp/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    jshint: {
      files: ['src/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-html2js');

  grunt.registerTask('default', ['clean', 'jshint', 'html2js', 'concat', 'uglify']);

};