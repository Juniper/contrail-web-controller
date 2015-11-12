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
        {pattern: 'contrail-web-core/webroot/css/**/*.svg', included: false},
        {pattern: 'contrail-web-core/webroot/test/ui/**/*.css', included: false},

        {pattern: 'contrail-web-core/webroot/assets/**/*.woff', included: false},
        {pattern: 'contrail-web-core/webroot/assets/**/*.ttf', included: false},
        {pattern: 'contrail-web-core/webroot/assets/**/*.svg', included: false},

        {pattern: 'contrail-web-core/webroot/img/**/*.png', included: false},
        {pattern: 'contrail-web-core/webroot/css/**/*.png', included: false},
        {pattern: 'contrail-web-core/webroot/assets/**/*.png', included: false},
        {pattern: 'contrail-web-core/webroot/css/**/*.gif', included: false},

        //Everything except library test suites and test files.
        {pattern: 'contrail-web-core/webroot/test/ui/js/**/{!(*.test.js), !(*.lib.test.suite.js)}', included: false},

        {pattern: 'contrail-web-controller/webroot/test/ui/ct.test.app.js'},
        {pattern: 'contrail-web-controller/webroot/test/ui/*.js', included: false},
        {pattern: 'contrail-web-controller/webroot/monitor/**/*.tmpl', included: false},
        {pattern: 'contrail-web-controller/webroot/common/ui/templates/*.tmpl', included: false},
        {pattern: 'contrail-web-controller/webroot/common/**/*.js', included: false},

        {pattern: 'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js', included: false},

        {pattern: 'contrail-web-controller/webroot/*.xml', included: false},

        {pattern: 'contrail-web-core/webroot/js/**/*.js', included: false},
        {pattern: 'contrail-web-core/webroot/templates/*.tmpl', included: false},

        {pattern: 'contrail-web-controller/webroot/monitor/networking/test/**/*.mock.data.js', included: false},
        {pattern: 'contrail-web-controller/webroot/monitor/networking/test/**/*.unit.test.suite.js', included: false}
    ];

    function browserSubdirFn(browser, platform) {
        // normalization process to keep a consistent browser name
        return browser.toLowerCase().split(' ')[0];
    };

    var karmaConfig = {
        options: {
            configFile: 'karma.config.js'
        },
        networkListView: {
            options: {
                files: [
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/NetworkListView.test.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/NetworkListView.custom.test.suite.js',
                        included: false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/network-list-view-test-results.xml',
                    suite: 'networkListView'
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/network-list-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/nm/views/networkListView/',
                    subdir: browserSubdirFn
                },
                feature: 'nm'
            }
        },
        networkView: {
            options: {
                files: [
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/NetworkView.test.js',
                        included: false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/network-view-test-results.xml',
                    suite: 'networkView'
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/network-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/nm/views/networkView/',
                    subdir: browserSubdirFn
                },
                feature: 'nm'
            }
        },
        projectListView: {
            options: {
                files: [
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/ProjectListView.test.js',
                        included: false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/project-list-view-test-results.xml',
                    suite: 'projectListView'
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/project-list-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/nm/views/projectListView/',
                    subdir: browserSubdirFn
                },
                feature: 'nm'
            }
        },
        projectView: {
            options: {
                files: [
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/ProjectView.test.js',
                        included: false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/project-view-test-results.xml',
                    suite: 'projectView'
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/project-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/nm/views/projectView/',
                    subdir: browserSubdirFn
                },
                feature: 'nm'
            }
        },
        dashBoardView: {
            options: {
                files: [
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/DashboardView.test.js',
                        included: false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/dashBoard-view-test-results.xml',
                    suite: 'dashBoardView'
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/dashBoard-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/nm/views/dashBoardView/',
                    subdir: browserSubdirFn
                },
                feature: 'nm'
            }
        },
        instanceListView: {
            options: {
                files: [
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/InstanceListView.test.js',
                        included: false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/instance-list-view-test-results.xml',
                    suite: 'instanceListView',
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/instance-list-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/nm/views/instanceListView/',
                    subdir: browserSubdirFn
                },
                feature: 'nm'
            }
        },
        flowListView: {
            options: {
                files: [
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/FlowListView.test.js',
                        included: false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/flow-list-view-test-results.xml',
                    suite: 'FlowListView',
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/flow-list-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/nm/views/flowListView/',
                    subdir: browserSubdirFn
                },
                feature: 'nm'
            }
        },
        flowGridView: {
            options: {
                files: [
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/FlowGridView.test.js',
                        included: false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/flow-grid-view-test-results.xml',
                    suite: 'FlowGridView',
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/flow-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/nm/views/flowGridView/',
                    subdir: browserSubdirFn
                },
                feature: 'nm'
            }
        },
        instanceView: {
            options: {
                files: [
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/InstanceView.test.js',
                        included: false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/instance-view-test-results.xml',
                    suite: 'InstanceView',
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/views/instance-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/nm/views/instanceView/',
                    subdir: browserSubdirFn
                },
                feature: 'nm'
            }
        },
        nmUnit: {
            options: {
                files: [
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/unit/nm.unit.test.js',
                        included: false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/*.js': ['coverage']
                },
                junitReporter: {
                    outputFile: __dirname + '/reports/tests/nm/unit/nm-unit-test-results.xml',
                    suite: 'InstanceView',
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/nm/unit/nm-unit-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/nm/unit/',
                    subdir: browserSubdirFn
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
        options: {
            files: [],
            preprocessors: {
                'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
            },
            junitReporter: {
                outputFile: __dirname + '/reports/tests/nm/nm-test-results.xml',
                suite: 'networkMonitoring',
            },
            htmlReporter: {
                outputFile: __dirname + '/reports/tests/nm/nm-test-results.html'
            },
            coverageReporter: {
                reporters: [
                    {
                        type: 'html',
                        dir: __dirname + '/reports/coverage/nm/',
                        subdir: browserSubdirFn
                    },
                    {
                        type: 'json',
                        dir: __dirname + '/reports/coverage/nm/',
                        subdir: browserSubdirFn
                    }
                ]
            }
        }
    };
    karmaConfig['runAllTests'] = {
        options: {
            files: [],
            preprocessors: {
                'contrail-web-controller/webroot/monitor/**/ui/js/**/*.js': ['coverage']
            },
            junitReporter: {
                outputFile: __dirname + '/reports/tests/web-controller-test-results.xml',
                suite: 'webController',
            },
            htmlReporter: {
                outputFile: __dirname + '/reports/tests/web-controller-test-results.html'
            },
            coverageReporter: {
                type: 'html',
                dir: __dirname + '/reports/coverage/webController/',
                subdir: browserSubdirFn
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
        nmNoMerge: {
            networkListView: 'networkListView',
            networkView: 'networkView',
            projectListView: 'projectListView',
            projectView: 'projectView',
            dashBoardView: 'dashBoardView',
            instanceListView: 'instanceListView',
            instanceView: 'instanceView',
            flowListView: 'flowListView',
            flowGridView: 'flowGridView'
        }
    });

    function printCoverageReportLoc(reporter) {
        grunt.log.writeln('Coverage Reports: ');
        var reporters = reporter['reporters'] ? reporter['reporters'] : [reporter]
        for (var i = 0; i < reporters.length; i++) {
            grunt.log.writeln('Type: ' + reporters[i]['type']);
            grunt.log.writeln('Dir: ' + reporters[i]['dir']);
        }
    };

    grunt.registerTask('default', function () {
        grunt.warn('No Task specified. \n To run all the tests, run:\n grunt runAllTests \n\n ' +
            'To run specific feature (for eg: nm) tests, run:\n grunt runAllTests:nm\n    OR \n grunt nm\n\n');
    });

    grunt.registerTask('runAllTests', 'Web Controller Test Cases', function (feature) {
        if (feature == null) {
            grunt.log.writeln('>>>>>>>> No feature specified. will run all the feature tests. <<<<<<<');
            grunt.log.writeln('If you need to run specific feature tests only; then run: grunt runAllTests:nm\n\n');
            grunt.task.run('karma:runAllTests');
            grunt.log.writeln('Test results: ' + karmaConfig['runAllTests']['options']['htmlReporter']['outputFile']);
            printCoverageReportLoc(karmaConfig['runAllTests']['options']['coverageReporter'])

        } else if (feature == 'nm') {
            grunt.log.writeln('>>>>>>>> Running Network Monitoring feature tests. <<<<<<<');
            grunt.task.run('karma:runAllNMTests');
            grunt.log.writeln('Test results: ' + karmaConfig['runAllNMTests']['options']['htmlReporter']['outputFile']);
            printCoverageReportLoc(karmaConfig['runAllNMTests']['options']['coverageReporter']);
        }
    });

    grunt.registerTask('nm', 'Network Monitoring Test Cases', function (target) {
        if (target == null) {
            grunt.log.writeln('>>>>>>>> Running Network Monitoring feature tests. <<<<<<<');
            grunt.task.run('karma:runAllNMTests');
            grunt.log.writeln('Test results: ' + karmaConfig['runAllNMTests']['options']['htmlReporter']['outputFile']);
            printCoverageReportLoc(karmaConfig['runAllNMTests']['options']['coverageReporter']);
        } else if (target == 'networkListView') {
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
        } else if (target == 'unit') {
            grunt.task.run('karma:nmUnit');
        } else if (target == 'runAllNoMerge') {
            grunt.log.writeln('>>>>>>> Running all Network Monitoring tests one by one. Results will not be Merged. <<<<<<');
            grunt.task.run(['karma:networkView', 'karma:projectListView', 'karma:projectView', 'karma:dashBoardView',
                'karma:instanceListView', 'karma:instanceView', 'karma:flowListView', 'karma:flowGridView']);
        }
    });
};