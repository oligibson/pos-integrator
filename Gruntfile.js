// Generated on 2015-06-11 using generator-angular 0.11.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'
var fs = require('fs-extra');

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths for the application
    var bower = require('./bower.json');
    var appConfig = {
        app: bower.appPath || 'demo',
        mainFiles: bower.main,
        dist: 'dist'
    };

    var shell = require('shelljs');
    var semver = require('semver');

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: appConfig,
        pkg: require('./bower.json'),
        version: require('./bower.json').version,

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
                    'Gruntfile.js',
                    '<%= yeoman.app %>/scripts/{,*/}*.js',
                    'src/{,*/}*.js',
                    '!src/{,*/}*spec.js'
                ]
            },
            test: {
                options: {
                    jshintrc: 'misc/.jshintrc'
                },
                src: [
                    'src/{,*/}*spec.js',
                    'e2e/{,*/}*spec.js'
                ]
            }
        },
        // Also ensure no ddescribe and iit (or Jasmine 2.0 equivalent) have made it into the code
        'ddescribe-iit': {
            files: [
                'test/*.spec.js'
            ],
            options: {
                disallowed: ['ddescribe', 'iit', 'fit', 'fdescribe']
            }
        },


        // Automatically inject Bower components into the app - devDependencies required as this is a test app
        wiredep: {
            app: {
                cwd: '<%= yeoman.app %>',
                src: ['demo/index.html'],
                devDependencies: true,
                includeSelf: true
            },
            test: {
                devDependencies: true,
                src: '<%= karma.unit.configFile %>',
                ignorePath: /\.\.\//,
                fileTypes: {
                    js: {
                        block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
                        detect: {
                            js: /'(.*\.js)'/gi
                        },
                        replace: {
                            js: '\'{{filePath}}\','
                        }
                    }
                }
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    dest: 'dist',
                    src: [
                        'bower.json',
                        'README.md'
                    ]
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= yeoman.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            },
            'local-deploy-meta-data': {
                dest: 'demo/.bower.json',
                src: 'bower.json'
            },
            'assets': {
                dest: 'dist/assets/',
                src: ['{,*/}*.{png,jpg,jpeg,gif,webp,svg}'],
                cwd: 'src/assets',
                expand: true
            },
            docs: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'demo',
                    dest: 'demo/dist',
                    src: [
                        '{app,components}/**/*',
                        '!{app,components}/**/*.spec.js',
                        '!{app,components}/**/*.less',
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'bower_components/**/*',
                        'assets/images/**/*',
                        'assets/fonts/**/*',
                        'index.html',
                        'manifest.yml',
                        'bower.json'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: '.tmp',
                    dest: 'demo/dist',
                    src: [
                        '**/*'
                    ]
                }]
            }
        },
        // Test settings
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        },
        changelog: {
            options: {
                dest: 'CHANGELOG.md',
                versionFile: 'bower.json'
            }
        },
        'contrib-release': {
            options: {
                commitMessage: '<%= version %>',
                tagName: '<%= version %>',
                bump: false, // we have our own bump
                npm: false,
                file: 'bower.json'
            }
        },
        stage: {
            options: {
                files: ['CHANGELOG.md']
            }
        },
        gitadd: {
            release: {
                options: {
                    force: true
                },
                files: {
                    src: ['README.md', 'CHANGELOG.md', '.currentversion']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-git');
    grunt.loadNpmTasks('grunt-string-replace');

    grunt.registerTask('stage', 'git add files before running the release task', function () {
        var files = this.options().files;
        grunt.util.spawn({
            cmd: process.platform === 'win32' ? 'git.cmd' : 'git',
            args: ['add'].concat(files)
        }, grunt.task.current.async());
    });

    grunt.registerTask('bump', 'bump manifest version', function (type) {
        var options = this.options({
            file: 'bower.json'
        });

        function setup(file, type) {
            var pkg = grunt.file.readJSON(file);
            var oldVersion = pkg.version;
            var newVersion = pkg.version = semver.inc(pkg.version, type || 'patch');
            return {
                file: file,
                pkg: pkg,
                newVersion: newVersion,
                oldVersion: oldVersion
            };
        }

        function replaceReadmeVersion(oldVersion, newVersion) {
            grunt.config.set('string-replace', {
                inline: {
                    files: {
                        'README.md': 'README.md'
                    },
                    options: {
                        replacements: [
                            {
                                pattern: new RegExp("ssh://git@po.toolbox:7999/cm/pos-integrator.git#~" + oldVersion, "i"),
                                replacement: 'ssh://git@po.toolbox:7999/cm/pos-integrator.git#~' + newVersion
                            }
                        ]
                    }
                }
            });
            grunt.task.run('string-replace');
            grunt.log.ok('replaced readme version ' + oldVersion + ' with ' + newVersion);
        }

        function writeCurrentVersionToFile(version) {
            fs.writeFileSync('.currentversion', 'VERSION=' + version);
        }

        var config = setup(options.file, type);
        grunt.file.write(config.file, JSON.stringify(config.pkg, null, '  ') + '\n');
        replaceReadmeVersion(config.oldVersion, config.newVersion);
        writeCurrentVersionToFile(config.newVersion);
        grunt.log.ok('Version bumped to ' + config.newVersion);
    });


    grunt.registerTask('test', [
        //'clean:dist',
        //'copy:dist',
        //'demo-create-bower-file',
        //'injector:less',
        //'search:injectModules',
        //'concat',
        //'ngtemplates',
        //'copy:assets',
        //'concurrent:test',
        //'wiredep',
        //'autoprefixer',
        'karma',
        'ddescribe-iit'
    ]);

    //grunt.registerTask('build', [
    //    'clean:dist',
    //    'copy:dist',
    //    'demo-create-bower-file',
    //    'injector:less',
    //    'search:injectModules',
    //    'concat',
    //    'ngtemplates',
    //    'concurrent:dist',
    //    'wiredep',
    //    'copy:assets',
    //    'autoprefixer',
    //    'copy:dist',
    //    'build-docs'
    //]);

    grunt.task.renameTask('release', 'contrib-release');
    grunt.registerTask('release', function (type) {
        type = type === 'minor' || type === 'major' ? type : 'patch';
        grunt.task.run([
            'bump:' + type,
            'changelog',
            'gitadd:release',
            'stage',
            'contrib-release'
        ]);
    });

    grunt.registerTask('default', ['test']);

};
