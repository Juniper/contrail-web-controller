/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
/*jshint node:true */
module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks('grunt-qunit-junit');
    grunt.loadNpmTasks('grunt-karma');
    //this option is to avoid interruption of test case execution on failure of one in sequence
    //grunt.option('force',true);
    grunt.option('stack', true);

    var commonFiles = [
        {pattern: 'contrail-web-core/webroot/assets/**/!(tests)/*.js', included: false},

        {pattern: 'contrail-web-core/webroot/assets/**/*.css', included: false},
        {pattern: 'contrail-web-core/webroot/css/**/*.css', included: false},
        {pattern: 'contrail-web-core/webroot/css/**/*.ttf', included: false},
        {pattern: 'contrail-web-core/webroot/css/**/*.woff', included: false},
        {pattern: 'contrail-web-core/webroot/test/ui/**/*.css', included: false},

        {pattern: 'contrail-web-core/webroot/assets/**/*.woff', included: false},
        {pattern: 'contrail-web-core/webroot/assets/**/*.ttf', included: false},

        {pattern: 'contrail-web-core/webroot/img/**/*.png', included: false},
        {pattern: 'contrail-web-core/webroot/css/**/*.png', included: false},
        {pattern: 'contrail-web-core/webroot/assets/select2/styles/**/*.png', included: false},
        {pattern: 'contrail-web-core/webroot/css/**/*.gif', included: false},

        //Everything except library test suites and test files.
        {pattern: 'contrail-web-core/webroot/test/ui/js/**/{!(*.test.js), !(*.lib.test.suite.js)}', included: false},

        {pattern: 'contrail-web-controller/webroot/test/ui/ct.test.app.js'},
        {pattern: 'contrail-web-controller/webroot/test/ui/*.js', included: false},
        {pattern: 'contrail-web-controller/webroot/monitor/**/*.tmpl', included: false},
        {pattern: 'contrail-web-controller/webroot/common/ui/templates/*.tmpl', included: false},
        {pattern: 'contrail-web-controller/webroot/common/**/*.js', included: false},

        {pattern: 'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js', included: false},

        {pattern: 'contrail-web-controller/webroot/config/linklocalservices/**/*.js', included: false},
        {pattern: 'contrail-web-controller/webroot/*.xml', included: false},

        {pattern: 'contrail-web-core/webroot/js/**/*.js', included: false},
        {pattern: 'contrail-web-core/webroot/templates/*.tmpl', included: false},

        {pattern: 'contrail-web-controller/webroot/monitor/networking/ui/test/ui/*.mock.data.js', included: false}
    ];
    var karmaConfig = {
        options: {
            configFile: 'karma.config.js'
        },
        networkListView: {
            options: {
                files: [
                    {pattern: 'contrail-web-controller/webroot/monitor/networking/ui/test/ui/NetworkListView.test.js', included: false},
                    {pattern: 'contrail-web-controller/webroot/monitor/networking/ui/test/ui/NetworkListView.custom.test.suite.js', included: false}
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/network-list-view-test-results.xml',
                    suite: 'networkListView'
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/network-list-view-test-results.html'
                },
                coverageReporter: {
                    type : 'html',
                    dir : __dirname + '/reports/coverage/nm/networkListView/'
                },
                feature: 'nm'
            }
        },
        networkView: {
            options: {
                files: [
                    {pattern: 'contrail-web-controller/webroot/monitor/networking/ui/test/ui/NetworkView.test.js', included: false}
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/network-view-test-results.xml',
                    suite: 'networkView'
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/network-view-test-results.html'
                },
                coverageReporter: {
                    type : 'html',
                    dir : __dirname + '/reports/coverage/nm/networkView/'
                },
                feature: 'nm'
            }
        },
        projectListView: {
            options: {
                files: [
                    {pattern: 'contrail-web-controller/webroot/monitor/networking/ui/test/ui/ProjectListView.test.js', included: false}
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/project-list-view-test-results.xml',
                    suite: 'projectListView'
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/project-list-view-test-results.html'
                },
                coverageReporter: {
                    type : 'html',
                    dir : __dirname + '/reports/coverage/nm/projectListView/'
                },
                feature: 'nm'
            }
        },
        projectView: {
            options: {
                files: [
                    {pattern: 'contrail-web-controller/webroot/monitor/networking/ui/test/ui/ProjectView.test.js', included: false}
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/project-view-test-results.xml',
                    suite: 'projectView'
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/project-view-test-results.html'
                },
                coverageReporter: {
                    type : 'html',
                    dir : __dirname + '/reports/coverage/nm/projectView/'
                },
                feature: 'nm'
            }
        },
        dashBoardView: {
            options: {
                files: [
                    {pattern: 'contrail-web-controller/webroot/monitor/networking/ui/test/ui/DashboardView.test.js', included: false}
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/dashBoard-view-test-results.xml',
                    suite: 'dashBoardView'
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/dashBoard-view-test-results.html'
                },
                coverageReporter: {
                    type : 'html',
                    dir : __dirname + '/reports/coverage/nm/dashBoardView/'
                },
                feature: 'nm'
            }
        },
        instanceListView: {
            options: {
                files: [
                    {pattern: 'contrail-web-controller/webroot/monitor/networking/ui/test/ui/InstanceListView.test.js', included: false}
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/instance-list-view-test-results.xml',
                    suite: 'instanceListView',
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/instance-list-view-test-results.html'
                },
                coverageReporter: {
                    type : 'html',
                    dir : __dirname + '/reports/coverage/nm/instanceListView/'
                },
                feature: 'nm'
            }
        },
        flowListView: {
            options: {
                files: [
                    {pattern: 'contrail-web-controller/webroot/monitor/networking/ui/test/ui/FlowListView.test.js', included: false}
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/flow-list-view-test-results.xml',
                    suite: 'FlowListView',
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/flow-list-view-test-results.html'
                },
                coverageReporter: {
                    type : 'html',
                    dir : __dirname + '/reports/coverage/nm/flowListView/'
                },
                feature: 'nm'
            }
        },
        flowGridView: {
            options: {
                files: [
                    {pattern: 'contrail-web-controller/webroot/monitor/networking/ui/test/ui/FlowGridView.test.js', included: false}
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/flow-grid-view-test-results.xml',
                    suite: 'FlowGridView',
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/flow-grid-view-test-results.html'
                },
                coverageReporter: {
                    type : 'html',
                    dir : __dirname + '/reports/coverage/nm/flowGridView/'
                },
                feature: 'nm'
            }
        },
        instanceView: {
            options: {
                files: [
                    {pattern: 'contrail-web-controller/webroot/monitor/networking/ui/test/ui/InstanceView.test.js', included: false}
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/instance-view-test-results.xml',
                    suite: 'InstanceView',
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/instance-view-test-results.html'
                },
                coverageReporter: {
                    type : 'html',
                    dir : __dirname + '/reports/coverage/nm/instanceView/'
                },
                feature: 'nm'
            }
        }
    };

    var allTestFiles = [],
        allNMTestFiles = [];

    for (var target in karmaConfig) {
        if (target != 'options') {
            allTestFiles = allTestFiles.concat(karmaConfig[target]['options']['files']);
            var feature = karmaConfig[target]['options']['feature'];
            if (feature == 'nm') {
                allNMTestFiles = allNMTestFiles.concat(karmaConfig[target]['options']['files']);
            }
            karmaConfig[target]['options']['files'] = commonFiles.concat(karmaConfig[target]['options']['files']);
        }
    }

    karmaConfig['runAllNMTests'] = {
        options:{
            files: [],
                preprocessors: {
                'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
            },
            junitReporter: {
                outputFile: __dirname + '/reports/tests/nm-test-results.xml',
                    suite: 'networkMonitoring',
            },
            htmlReporter: {
                outputFile: __dirname + '/reports/tests/nm-test-results.html'
            },
            coverageReporter: {
                type : 'html',
                    dir : __dirname + '/reports/coverage/nm/'
            }
        }
    };
    karmaConfig['runAllTests'] = {
        options:{
            files: [],
                preprocessors: {
                'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
            },
            junitReporter: {
                outputFile: __dirname + '/reports/tests/web-controller-test-results.xml',
                    suite: 'webController',
            },
            htmlReporter: {
                outputFile: __dirname + '/reports/tests/web-controller-test-results.html'
            },
            coverageReporter: {
                type : 'html',
                    dir : __dirname + '/reports/coverage/webController/'
            }
        }
    };
    // Now add the test files along with common files.
    karmaConfig['runAllNMTests']['options']['files'] = commonFiles.concat(allNMTestFiles);
    karmaConfig['runAllTests']['options']['files'] = commonFiles.concat(allTestFiles);

    grunt.initConfig({
        pkg: grunt.file.readJSON(__dirname + "/../../../../contrail-web-core/package.json"),
        karma: karmaConfig,
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            files: ["Gruntfile.js"]
        },
        nmNoMerge : {
            networkListView : 'networkListView',
            networkView     : 'networkView',
            projectListView : 'projectListView',
            projectView     : 'projectView',
            dashBoardView   : 'dashBoardView',
            instanceListView: 'instanceListView',
            instanceView    : 'instanceView',
            flowListView    : 'flowListView',
            flowGridView    : 'flowGridView'
        }
    });

    grunt.registerTask('default', function() {
        grunt.warn('No Task specified. \n To run all the tests, run:\n grunt runAllTests \n\n ' +
            'To run specific feature (for eg: nm) tests, run:\n grunt runAllTests:nm\n    OR \n grunt nm\n\n');
    });

    grunt.registerTask('runAllTests', 'Web Controller Test Cases', function(feature) {
        if (feature == null) {
            grunt.log.writeln('>>>>>>>> No feature specified. will run all the feature tests. <<<<<<<');
            grunt.log.writeln('If you need to run specific feature tests only; then run: grunt runAllTests:nm\n\n');
            grunt.task.run('karma:runAllTests');
            grunt.log.writeln('Test results: ' + karmaConfig['runAllTests']['options']['htmlReporter']['outputFile']);
            grunt.log.writeln('Coverage Report: ' + karmaConfig['runAllTests']['options']['coverageReporter']['dir']);
        } else if(feature == 'nm') {
            grunt.log.writeln('>>>>>>>> Running Network Monitoring feature tests. <<<<<<<');
            grunt.task.run('karma:runAllNMTests');
            grunt.log.writeln('Test results: ' + karmaConfig['runAllNMTests']['options']['htmlReporter']['outputFile']);
            grunt.log.writeln('Coverage Report: ' + karmaConfig['runAllNMTests']['options']['coverageReporter']['dir']);
        }
    });

    grunt.registerTask('nm', 'Network Monitoring Test Cases', function (target) {
        if (target == null) {
            grunt.log.writeln('>>>>>>>> Running Network Monitoring feature tests. <<<<<<<');
            grunt.task.run('karma:runAllNMTests');
            grunt.log.writeln('Test results: ' + karmaConfig['runAllNMTests']['options']['htmlReporter']['outputFile']);
            grunt.log.writeln('Coverage Report: ' + karmaConfig['runAllNMTests']['options']['coverageReporter']['dir']);
        }else if (target == 'networkListView') {
            grunt.task.run('karma:networkListView');
        } else if (target == 'networkView') {
            grunt.task.run('karma:networkView');
        } else if (target == 'projectListView') {
            grunt.task.run('karma:projectListView');
        } else if (target == 'projectView') {
            grunt.task.run('karma:projectView');
        } else if (target == 'dashBoardView') {
            grunt.task.run('karma:dashBoardView');
        } else if (target == 'instanceListView') {
            grunt.task.run('karma:instanceListView');
        } else if (target == 'instanceView') {
            grunt.task.run('karma:instanceView');
        } else if (target == 'flowListView') {
            grunt.task.run('karma:flowListView');
        } else if (target == 'flowGridView') {
            grunt.task.run('karma:flowGridView');
        } else if (target == 'runAllNoMerge') {
            grunt.log.writeln('>>>>>>> Running all Network Monitoring tests one by one. Results will not be Merged. <<<<<<');
            grunt.task.run(['karma:networkView', 'karma:projectListView', 'karma:projectView', 'karma:dashBoardView',
                'karma:instanceListView', 'karma:instanceView', 'karma:flowListView', 'karma:flowGridView']);
        }
    });
};