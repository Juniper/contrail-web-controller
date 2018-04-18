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
        {pattern: 'contrail-web-core/webroot/dist/assets/**/!(tests)/*.js', included: false},

        {pattern: 'contrail-web-core/webroot/assets/**/*.css', included: false},
        {pattern: 'contrail-web-core/webroot/common/ui/css/**/*.css', included: false},
        {pattern: 'contrail-web-core/webroot/common/ui/css/**/*.ttf', included: false},
        {pattern: 'contrail-web-core/webroot/common/ui/css/**/*.woff', included: false},
        {pattern: 'contrail-web-core/webroot/common/ui/css/**/*.svg', included: false},
        {pattern: 'contrail-web-core/webroot/test/ui/**/*.css', included: false},

        {pattern: 'contrail-web-core/webroot/assets/**/*.woff', included: false},
        {pattern: 'contrail-web-core/webroot/assets/**/*.ttf', included: false},
        {pattern: 'contrail-web-core/webroot/assets/**/*.svg', included: false},

        {pattern: 'contrail-web-core/webroot/img/**/*.png', included: false},
        {pattern: 'contrail-web-core/webroot/common/ui/css/**/*.png', included: false},
        {pattern: 'contrail-web-core/webroot/assets/**/*.png', included: false},
        {pattern: 'contrail-web-core/webroot/common/ui/css/**/*.gif', included: false},
        {pattern: 'contrail-web-core/webroot/assets/**/*.map', included: false},

        //Everything except library test suites and test files.
        {pattern: 'contrail-web-core/webroot/test/ui/js/**/{!(*.test.js), !(*.lib.test.suite.js)}', included: false},

        {pattern: 'contrail-web-controller/webroot/test/ui/ct.test.app.js'},
        {pattern: 'contrail-web-controller/webroot/test/ui/*.js', included: false},
        {pattern: 'contrail-web-controller/webroot/monitor/**/*.css', included: false},
        {pattern: 'contrail-web-controller/webroot/monitor/**/*.tmpl', included: false},
        {pattern: 'contrail-web-controller/webroot/config/**/*.tmpl', included: false},
        {pattern: 'contrail-web-controller/webroot/common/ui/templates/*.tmpl', included: false},
        {pattern: 'contrail-web-controller/webroot/common/**/{!(*.test.js), !(*.unit.test.js)}', included: false},

        //For dist dir
        {pattern: 'contrail-web-controller/webroot/dist/monitor/**/*.tmpl', included: false},
        {pattern: 'contrail-web-controller/webroot/dist/common/ui/templates/*.tmpl', included: false},
        {pattern: 'contrail-web-controller/webroot/dist/common/**/{!(*.test.js), !(*.unit.test.js)}', included: false},

        {pattern: 'contrail-web-controller/webroot/monitor/**/ui/js/**/*.js', included: false},
        {pattern: 'contrail-web-controller/webroot/*.xml', included: false},
        {pattern: 'contrail-web-controller/webroot/dist/**/ui/js/**/*.js', included: false},


        {pattern: 'contrail-web-core/webroot/js/**/*.js', included: false},
        {pattern: 'contrail-web-core/webroot/dist/js/**/*.js', included: false},
        {pattern: 'contrail-web-core/webroot/common/ui/templates/*.tmpl', included: false},

        //Reports dir
        {pattern: 'contrail-web-core/webroot/reports/**/!(api)/**/*.js', included: false},
        {pattern: 'contrail-web-core/webroot/reports/**/default.config.json', included: false},
        {pattern: 'contrail-web-core/webroot/dist/reports/**/!(api)/**/*.js', included: false},
        {pattern: 'contrail-web-core/webroot/dist/reports/**/default.config.json', included: false},

        {pattern: 'contrail-web-controller/webroot/**/test/**/*.mock.data.js', included: false},
        {pattern: 'contrail-web-controller/webroot/**/test/**/*.unit.test.suite.js', included: false}
    ];

    function browserSubdirFn(browser, platform) {
        // normalization process to keep a consistent browser name
        return browser.toLowerCase().split(' ')[0];
    };

    var karmaConfig = {
        options: {
            configFile: 'karma.config.js'
        },
        TrafficGroupsView: {
            options: {
                files: [
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/security/test/ui/views/TrafficGroupsView.test.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/security/test/ui/views/TrafficGroupsParsers.test.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/security/trafficgroups/ui/js/**/*.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/security/trafficgroups/ui/js/*.js',
                        included: false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/security/trafficgroups/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir: __dirname + '/reports/tests/sm/views/',
                    outputFile: 'traffic-groups-view-test-results.xml',
                    suite: 'TrafficGroupsView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/sm/views/traffic-groups-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/sm/views/TrafficGroupsView/',
                    subdir: browserSubdirFn
                },
                feature: 'sm'
            }
        },
        networkListView: {
            options: {
                files: [
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/NetworkListView.test.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/NetworkGridViewError.test.js',
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
                    outputDir: __dirname + '/reports/tests/nm/views/',
                    outputFile: 'network-list-view-test-results.xml',
                    suite: 'networkListView',
                    useBrowserName: false
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
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/NetworkViewDetails.test.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/NetworkViewInstances.test.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/NetworkViewInterfaces.test.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/NetworkViewTrafficStatistics.test.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/NetworkViewPortDistribution.test.js',
                        included: false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir: __dirname + '/reports/tests/nm/views/',
                    outputFile: 'network-view-test-results.xml',
                    suite: 'networkView',
                    useBrowserName: false
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
                    outputDir: __dirname + '/reports/tests/nm/views/',
                    outputFile: 'project-list-view-test-results.xml',
                    suite: 'projectListView',
                    useBrowserName: false
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
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/ProjectViewNetworks.test.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/ProjectViewInstances.test.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/ProjectViewInterfaces.test.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/ProjectViewPortDistribution.test.js',
                        included: false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir: __dirname + '/reports/tests/nm/views/',
                    outputFile: 'project-view-test-results.xml',
                    suite: 'projectView',
                    useBrowserName: false
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
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/DashboardViewNetworks.test.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/DashboardViewInstances.test.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/DashboardViewInterfaces.test.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/DashboardViewPortDistribution.test.js',
                        included: false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir: __dirname + '/reports/tests/nm/views/',
                    outputFile: 'dashBoard-view-test-results.xml',
                    suite: 'dashBoardView',
                    useBrowserName: false
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
                    outputDir: __dirname + '/reports/tests/nm/views/',
                    outputFile: 'instance-list-view-test-results.xml',
                    suite: 'instanceListView',
                    useBrowserName: false
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
        instanceView: {
            options: {
                files: [
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/InstanceView.test.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/InstanceViewDetails.test.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/InstanceViewInterfaces.test.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/InstanceViewTrafficStatistics.test.js',
                        included: false
                    },
                    //Commenting out since this chart will be moved to new D3 line bar chart.
                    // {
                    //     pattern: 'contrail-web-controller/webroot/monitor/networking/test/ui/views/InstanceViewCPUMemory.test.js',
                    //     included: false
                    // }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir: __dirname + '/reports/tests/nm/views/',
                    outputFile: 'instance-view-test-results.xml',
                    suite: 'InstanceView',
                    useBrowserName: false
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
                    outputDir: __dirname + '/reports/tests/nm/views/',
                    outputFile: 'flow-list-view-test-results.xml',
                    suite: 'FlowListView',
                    useBrowserName: false
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
                    outputDir: __dirname + '/reports/tests/nm/views/',
                    outputFile: 'flow-grid-view-test-results.xml',
                    suite: 'FlowGridView',
                    useBrowserName: false
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
                    outputDir: __dirname + '/reports/tests/nm/unit/',
                    outputFile: 'nm-unit-test-results.xml',
                    suite: 'unit',
                    useBrowserName: false
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
        },
        ctUnit: {
            options: {
                files: [
                    {
                        pattern: 'contrail-web-controller/webroot/common/test/ui/unit/ct.unit.test.js',
                        included: false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/common/ui/js/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir: __dirname + '/reports/tests/webController/unit/',
                    outputFile: 'ct-unit-test-results.xml',
                    suite: 'unit',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/webController/unit/ct-unit-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/webController/unit/',
                    subdir: browserSubdirFn
                },
                feature: 'ct'
            }
        },
        physicalRoutersGridView: {
            options: {
                files: [
                    {
                        pattern: 'contrail-web-controller/webroot/config/physicaldevices/physicalrouters/ui/js/*.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/config/physicaldevices/physicalrouters/ui/js/**/*.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/config/physicaldevices/physicalrouters/test/ui/views/*.js',
                        included: false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/physicaldevices/physicalrouters/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir: __dirname + '/reports/tests/config/views/',
                    outputFile: 'physical-routers-grid-view-test-results.xml',
                    suite: 'physicalRoutersGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/config/views/physical-routers-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/physicalRoutersGridView/',
                    subdir: browserSubdirFn
                },
                feature: 'config'
            }
        },
        physicalInterfacesGridView: {
            options: {
                files: [
                    {
                        pattern: 'contrail-web-controller/webroot/config/physicaldevices/interfaces/ui/js/*.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/config/physicaldevices/interfaces/ui/templates/interfaces.tmpl',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/config/physicaldevices/interfaces/ui/js/**/*.js',
                        included: false
                    },
                    {
                        pattern: 'contrail-web-controller/webroot/config/physicaldevices/interfaces/test/ui/views/*.js',
                        included: false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/physicaldevices/interfaces/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir: __dirname + '/reports/tests/config/views/',
                    outputFile: 'physical-interfaces-grid-view-test-results.xml',
                    suite: 'physicalInterfacesGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile: __dirname + '/reports/tests/config/views/physical-interfaces-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/physicalInterfacesGridView/',
                    subdir: browserSubdirFn
                },
                feature: 'config'
            }
        },
        bgpRoutersGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/bgp/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/bgp/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/bgp/ui/templates/*.tmpl',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/bgp/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/infra/bgp/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'bgp-routers-grid-view-test-results.xml',
                    suite: 'bgpRoutersGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/bgp-routers-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/bgpRoutersGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        dnsServersGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/dns/servers/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/dns/servers/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/dns/servers/test/ui/views/dnsServersGridView.mock.data.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/dns/servers/test/ui/views/dnsServersGridView.test.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/dns/servers/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'dns-servers-grid-view-test-results.xml',
                    suite: 'dnsServersGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/dns-servers-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/dnsServersGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        dnsRecordsGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/dns/records/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/dns/records/ui/templates/*.tmpl',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/dns/records/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/dns/records/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/dns/records/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'dns-records-grid-view-test-results.xml',
                    suite: 'dnsRecordsGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/dns-records-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/dnsRecordsGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        bgpAsAServiceGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/services/bgpasaservice/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/services/bgpasaservice/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/services/bgpasaservice/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/services/bgpasaservice/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'bgp-as-a-service-grid-view-test-results.xml',
                    suite: 'bgpAsAServiceGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/bgp-as-a-service-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/bgpAsAServiceGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        portGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/common/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/common/ui/js/models/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/port/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/port/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/port/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/networking/port/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Port-grid-view-test-results.xml',
                    suite: 'portGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/port-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/portGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        //sloGridView : {
        //    options: {
        //        files: [
        //            {
        //                pattern : 'contrail-web-controller/webroot/config/networking/slo/ui/js/*.js',
        //                included : false
        //            },
        //            {
        //                pattern : 'contrail-web-controller/webroot/config/networking/slo/ui/js/**/*.js',
        //                included : false
        //            },
        //            {
        //                pattern : 'contrail-web-controller/webroot/config/networking/slo/test/ui/views/sloGridView.test.js',
        //                included : false
        //            },
        //            {
        //                pattern : 'contrail-web-controller/webroot/config/networking/slo/test/ui/views/sloGridView.mock.data.js',
        //                included : false
        //            },
        //            {
        //                pattern : 'contrail-web-controller/webroot/config/networking/slo/test/ui/views/sloModal.test.suite.js',
        //                included : false
        //            },
        //            {
        //                pattern : 'contrail-web-controller/webroot/config/networking/slo/common/ui/js/**/*.js',
        //                included : false
        //            }
        //        ],
        //        preprocessors: {
        //            'contrail-web-controller/webroot/config/networking/slo/ui/js/**/*.js': ['coverage']
        //        },
        //        junitReporter: {
        //            outputDir:__dirname + '/reports/tests/config/views/',
        //            outputFile: 'Slo-grid-view-test-results.xml',
        //            suite: 'sloGridView',
        //            useBrowserName: false
        //        },
        //        htmlReporter: {
        //            outputFile:__dirname + '/reports/tests/config/views/slo-grid-view-test-results.html'
        //        },
        //        coverageReporter: {
        //            type: 'html',
        //            dir: __dirname + '/reports/coverage/config/views/sloGridView/',
        //            subdir : browserSubdirFn
        //        },
        //        feature: 'config'
        //    }
        //},
        //gloablSloGridView : {
        //    options: {
        //        files: [
        //            {
        //                pattern : 'contrail-web-controller/webroot/config/networking/slo/test/ui/views/globalSloGridView.test.js',
        //                included : false
        //            },
        //            {
        //                pattern : 'contrail-web-controller/webroot/config/networking/slo/test/ui/views/sloGridView.mock.data.js',
        //                included : false
        //            },
        //            {
        //                pattern : 'contrail-web-controller/webroot/config/networking/slo/test/ui/views/sloModal.test.suite.js',
        //                included : false
        //            },
        //            {
        //                pattern : 'contrail-web-controller/webroot/config/networking/slo/common/ui/js/**/*.js',
        //                included : false
        //            },
        //            {
        //                pattern : 'contrail-web-controller/webroot/config/infra/globalconfig/ui/js/*.js',
        //                included : false
        //            },
        //            {
        //                pattern : 'contrail-web-controller/webroot/config/infra/globalconfig/ui/js/**/*.js',
        //                included : false
        //            }
        //        ],
        //        preprocessors: {
        //            'contrail-web-controller/webroot/config/networking/infra/globalconfig/ui/js/**/*.js': ['coverage']
        //        },
        //        junitReporter: {
        //            outputDir:__dirname + '/reports/tests/config/views/',
        //            outputFile: 'Gloabl-slo-grid-view-test-results.xml',
        //            suite: 'gloablSloGridView',
        //            useBrowserName: false
        //        },
        //        htmlReporter: {
        //            outputFile:__dirname + '/reports/tests/config/views/global-slo-grid-view-test-results.html'
        //        },
        //        coverageReporter: {
        //            type: 'html',
        //            dir: __dirname + '/reports/coverage/config/views/gloablSloGridView/',
        //            subdir : browserSubdirFn
        //        },
        //        feature: 'config'
        //    }
        //},
        qosGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/qos/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/qos/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/qos/test/ui/views/qosGridView.test.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/qos/test/ui/views/qosGridView.mock.data.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/qos/common/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/globalconfig/ui/js/**/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/networking/qos/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Qos-grid-view-test-results.xml',
                    suite: 'qosGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/qos-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/qosGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
//        globalVRouterEncryptionGridView : {
//            options: {
//                files: [
//                    {
//                        pattern : 'contrail-web-controller/webroot/config/infra/globalconfig/ui/js/*.js',
//                        included : false
//                    },
//                    {
//                        pattern : 'contrail-web-controller/webroot/config/infra/globalconfig/ui/js/**/*.js',
//                        included : false
//                    },
//                    {
//                        pattern : 'contrail-web-controller/webroot/config/infra/globalconfig/test/ui/views/*.js',
//                        included : false
//                    }
//                ],
//                preprocessors: {
//                    'contrail-web-controller/webroot/config/infra/globalconfig/ui/js/**/*.js': ['coverage']
//                },
//                junitReporter: {
//                    outputDir:__dirname + '/reports/tests/config/views/',
//                    outputFile: 'global-vrouter-encryption-grid-view-test-results.xml',
//                    suite: 'globalVRouterEncryptionGridView',
//                    useBrowserName: false
//                },
//                htmlReporter: {
//                    outputFile:__dirname + '/reports/tests/config/views/global-vrouter-encryption-grid-view-test-results.html'
//                },
//                coverageReporter: {
//                    type: 'html',
//                    dir: __dirname + '/reports/coverage/config/views/globalVRouterEncryptionGridView/',
//                    subdir : browserSubdirFn
//                },
//                feature: 'config'
//            }
//        },
        gloablQosGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/qos/test/ui/views/globalQosGridView.test.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/qos/test/ui/views/qosGridView.mock.data.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/qos/common/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/globalconfig/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/globalconfig/ui/js/**/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/infra/globalconfig/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Gloabl-qos-grid-view-test-results.xml',
                    suite: 'gloablQosGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/global-qos-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/gloablQosGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        svcTempGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/services/templates/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/services/templates/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/services/templates/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/services/templates/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Service-template-grid-view-test-results.xml',
                    suite: 'svcTempGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/service-template-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/svcTempGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        svcInstanceGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/services/instances/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/services/instances/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/services/instances/test/instanceGridView.mock.data.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/services/instances/test/instanceGridView.test.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/services/instances/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Service-instances-grid-view-test-results.xml',
                    suite: 'svcInstanceGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/service-instances-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/svcInstanceGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        svcHealthCheckGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/services/svchealthcheck/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/services/svchealthcheck/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/services/svchealthcheck/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/services/svchealthcheck/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Service-health-check-grid-view-test-results.xml',
                    suite: 'svcHealthCheckGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/service-health-check-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/svcHealthCheckGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        vnGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/networks/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/networks/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/networks/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/networking/networks/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Vn-grid-view-test-results.xml',
                    suite: 'vnGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/vn-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/vnGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        fipCfgGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/fip/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/fip/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/fip/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/networking/fip/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'fip-grid-view-test-results.xml',
                    suite: 'fipCfgGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/fip-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/fipGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        logicalRouterGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/logicalrouter/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/logicalrouter/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/logicalrouter/test/ui/views/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/common/ui/js/**/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/networking/logicalrouter/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'logicalrouter-grid-view-test-results.xml',
                    suite: 'logicalRouterGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/logicalrouter-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/logicalRouterGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        ipamCfgGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/ipam/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/ipam/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/ipam/test/ui/views/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/networks/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/networks/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/networks/test/ui/views/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/networks/ui/js/models/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/networking/ipam/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'ipam-grid-view-test-results.xml',
                    suite: 'ipamCfgGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/ipam-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/ipamCfgGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        policyGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/policy/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/policy/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/policy/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/networking/policy/ui/js/**/*.js': []
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'policy-grid-view-test-results.xml',
                    suite: 'policyGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/policy-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/policyGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        secGrpGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/securitygroup/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/securitygroup/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/securitygroup/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/networking/securitygroup/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'secgrp-grid-view-test-results.xml',
                    suite: 'secGrpGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/secgrp-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/secGrpGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        routeAggregateGridView : {
             options: {
                files: [
                    {
                       pattern : 'contrail-web-controller/webroot/config/networking/routeaggregate/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/routeaggregate/ui/js/views/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/routeaggregate/ui/js/models/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/routeaggregate/test/ui/views/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/routetable/ui/js/*.js',
                         included : false
                    },
                    {
                         pattern : 'contrail-web-controller/webroot/config/networking/routetable/ui/js/views/*.js',
                         included : false
                     },
                     {
                         pattern : 'contrail-web-controller/webroot/config/networking/routetable/ui/js/models/*.js',
                         included : false
                     }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/networking/routetable/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'route-aggregate-grid-view-test-results.xml',
                    suite: 'routeAggregateGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/route-aggregate-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/routeAggregateGridView/',
                   subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        loadBalancerGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/loadbalancer/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/loadbalancer/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/loadbalancer/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/networking/loadbalancer/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Load-balancer-grid-view-test-results.xml',
                    suite: 'loadBalancerGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/load-balancer-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/loadBalancerGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        alarmGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/alarm/project/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/alarm/common/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/alarm/common/ui/templates/**/*.tmpl',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/alarm/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/alarm/project/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Alarm-grid-view-test-results.xml',
                    suite: 'alarmGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/alarm-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/alarmGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        globalTagGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/tag/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/tag/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/tag/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/fwpolicywizard/common/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/tag/ui/js/tagUtils.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/tag/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/infra/tag/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Global-tag-grid-view-test-results.xml',
                    suite: 'globalTagGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/global-tag-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/globalTagGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        projectTagGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/project/tag/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/project/tag/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/tag/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/fwpolicywizard/common/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/tag/ui/js/tagUtils.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/project/tag/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/firewall/project/tag/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Project-tag-grid-view-test-results.xml',
                    suite: 'projectTagGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/project-tag-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/projectTagGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        projectAddressGrpGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/**/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/fwpolicywizard/common/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/policy/ui/js/views/policyFormatters.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/project/addressgroup/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/addressgroup/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/project/addressgroup/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/firewall/project/addressgroup/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Project-address-group-policy-grid-view-test-results.xml',
                    suite: 'projectAddressGrpGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/project-address-group-policy-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/projectAddressGrpGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        projectServiceGrpGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/**/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/fwpolicywizard/common/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/policy/ui/js/views/policyFormatters.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/project/applicationpolicy/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/applicationpolicy/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/project/servicegroup/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/fwpolicy/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/servicegroup/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/project/servicegroup/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/firewall/project/servicegroup/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Project-service-group-policy-grid-view-test-results.xml',
                    suite: 'projectServiceGrpGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/project-service-group-policy-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/projectServiceGrpGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        projectFwPolicyGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/fwpolicywizard/common/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/fwpolicy/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/project/applicationpolicy/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/applicationpolicy/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/policy/ui/js/views/policyFormatters.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/project/fwpolicy/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/project/fwpolicy/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/firewall/project/fwpolicy/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Project-policy-grid-view-test-results.xml',
                    suite: 'projectFwPolicyGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/project-policy-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/projectFwPolicyGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        projectApsGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/ui/js/views/fwProjectView.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/project/applicationpolicy/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/applicationpolicy/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/project/applicationpolicy/test/ui/views/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/fwpolicywizard/common/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/fwpolicy/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/fwpolicy/ui/js/fwPolicy.utils.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/policy/ui/js/views/policyFormatters.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/firewall/project/applicationpolicy/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Project-aps-grid-view-test-results.xml',
                    suite: 'projectApsGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/project-aps-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/projectApsGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        globalAddressGrpGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/firewall/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/firewall/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/fwpolicywizard/common/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/policy/ui/js/views/policyFormatters.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/addressgroup/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/addressgroup/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/firewall/common/addressgroup/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Global-address-group-policy-grid-view-test-results.xml',
                    suite: 'globalAddressGrpGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/global-address-group-policy-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/globalAddressGrpGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        globalServiceGrpGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/firewall/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/firewall/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/fwpolicywizard/common/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/policy/ui/js/views/policyFormatters.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/applicationpolicy/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/fwpolicy/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/servicegroup/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/servicegroup/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/firewall/common/servicegroup/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Global-service-group-policy-grid-view-test-results.xml',
                    suite: 'globalServiceGrpGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/global-service-group-policy-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/globalServiceGrpGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        globalFwPolicyGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/firewall/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/firewall/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/fwpolicywizard/common/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/fwpolicy/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/applicationpolicy/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/policy/ui/js/views/policyFormatters.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/fwpolicy/test/ui/views/*.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/firewall/common/fwpolicy/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Global-policy-grid-view-test-results.xml',
                    suite: 'globalFwPolicyGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/global-policy-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/globalFwPolicyGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        },
        globalApsGridView : {
            options: {
                files: [
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/firewall/ui/js/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/infra/firewall/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/applicationpolicy/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/applicationpolicy/test/ui/views/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/fwpolicywizard/common/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/fwpolicy/ui/js/**/*.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/firewall/common/fwpolicy/ui/js/fwPolicy.utils.js',
                        included : false
                    },
                    {
                        pattern : 'contrail-web-controller/webroot/config/networking/policy/ui/js/views/policyFormatters.js',
                        included : false
                    }
                ],
                preprocessors: {
                    'contrail-web-controller/webroot/config/firewall/common/applicationpolicy/ui/js/**/*.js': ['coverage']
                },
                junitReporter: {
                    outputDir:__dirname + '/reports/tests/config/views/',
                    outputFile: 'Global-aps-grid-view-test-results.xml',
                    suite: 'globalApsGridView',
                    useBrowserName: false
                },
                htmlReporter: {
                    outputFile:__dirname + '/reports/tests/config/views/global-aps-grid-view-test-results.html'
                },
                coverageReporter: {
                    type: 'html',
                    dir: __dirname + '/reports/coverage/config/views/globalApsGridView/',
                    subdir : browserSubdirFn
                },
                feature: 'config'
            }
        }
    };

    var allTestFiles = [],
        allNMTestFiles = [],
        allSMTestFiles = [],
        allConfigTestFiles = [];

    for (var target in karmaConfig) {
        if (target != 'options') {
            allTestFiles = allTestFiles.concat(karmaConfig[target]['options']['files']);
            var feature = karmaConfig[target]['options']['feature'];
            if (feature == 'nm') {
                allNMTestFiles = allNMTestFiles.concat(karmaConfig[target]['options']['files']);
            }
            if (feature == 'sm') {
                allSMTestFiles = allSMTestFiles.concat(karmaConfig[target]['options']['files']);
            }
            if(feature == 'config') {
                allConfigTestFiles = allConfigTestFiles.concat(karmaConfig[target]['options']['files']);
            }
            karmaConfig[target]['options']['files'] = commonFiles.concat(karmaConfig[target]['options']['files']);
        }
    }

    karmaConfig['runAllNMTests'] = {
        options: {
            files: [],
            preprocessors: {
                'contrail-web-core/webroot/js/**/*.js': ['coverage'],
                'contrail-web-controller/webroot/monitor/networking/ui/js/**/*.js': ['coverage']
            },
            junitReporter: {
                outputDir: __dirname + '/reports/tests/nm/',
                outputFile: 'nm-test-results.xml',
                suite: 'nm',
                useBrowserName: false
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

    karmaConfig['runAllSMTests'] = {
        options: {
            files: [],
            preprocessors: {
                'contrail-web-core/webroot/js/**/*.js': ['coverage'],
                'contrail-web-controller/webroot/monitor/security/**/ui/js/**/*.js': ['coverage']
            },
            junitReporter: {
                outputDir: __dirname + '/reports/tests/sm/',
                outputFile: 'sm-test-results.xml',
                suite: 'sm',
                useBrowserName: false
            },
            htmlReporter: {
                outputFile: __dirname + '/reports/tests/sm/sm-test-results.html'
            },
            coverageReporter: {
                reporters: [
                    {
                        type: 'html',
                        dir: __dirname + '/reports/coverage/sm/',
                        subdir: browserSubdirFn
                    },
                    {
                        type: 'json',
                        dir: __dirname + '/reports/coverage/sm/',
                        subdir: browserSubdirFn
                    }
                ]
            }
        }
    };

    karmaConfig['runAllConfigTests'] = {
        options: {
            files: [],
            preprocessors: {
                'contrail-web-core/webroot/js/**/*.js': ['coverage'],
                'contrail-web-controller/webroot/config/**/ui/js/**/*.js': ['coverage']
            },
            junitReporter: {
                outputDir: __dirname + '/reports/tests/nm/',
                outputFile: 'config-test-results.xml',
                suite: 'config',
                useBrowserName: false
            },
            htmlReporter: {
                outputFile: __dirname + '/reports/tests/config/config-test-results.html'
            },
            coverageReporter: {
                reporters: [
                    {
                        type: 'html',
                        dir: __dirname + '/reports/coverage/config/',
                        subdir: browserSubdirFn
                    },
                    {
                        type: 'json',
                        dir: __dirname + '/reports/coverage/config/',
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
                'contrail-web-core/webroot/js/**/*.js': ['coverage'],
                'contrail-web-controller/webroot/**/ui/js/**/*.js': ['coverage']
            },
            junitReporter: {
                outputDir: __dirname + '/reports/tests/',
                outputFile: 'web-controller-test-results.xml',
                suite: 'webController',
                useBrowserName: false
            },
            htmlReporter: {
                outputFile: __dirname + '/reports/tests/web-controller-test-results.html'
            },
            coverageReporter: {
                 reporters: [
                    {
                        type: 'html',
                        dir: __dirname + '/reports/coverage/webController/',
                        subdir: browserSubdirFn
                    },
                    {
                        type: 'json',
                        dir: __dirname + '/reports/coverage/webController/',
                        subdir: browserSubdirFn
                    },
                    {
                        type: 'cobertura',
                        dir: __dirname + '/reports/coverage/webController/',
                        subdir: browserSubdirFn
                    }
                ]
            }
        }
    };
    // Now add the test files along with common files.
    karmaConfig['runAllNMTests']['options']['files'] = commonFiles.concat(allNMTestFiles);
    karmaConfig['runAllSMTests']['options']['files'] = commonFiles.concat(allSMTestFiles);
    karmaConfig['runAllConfigTests']['options']['files'] = commonFiles.concat(allConfigTestFiles);
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
        },
        smNoMerge: {
            TrafficGroupsView: 'TrafficGroupsView'
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
        grunt.warn('No Task specified. \n To run all the tests, run:\n grunt run \n\n ' +
            'To run specific feature (for eg: nm, config, sm) tests, run:\n grunt run:nm\n    OR \n grunt nm\n\n');
    });

    grunt.registerTask('install-hook', 'install hook for test infra', function() {
        var fs = require('fs');
        grunt.file.copy('../../../.pre-commit', '../../../.git/hooks/pre-commit');
        fs.chmodSync('../../../.git/hooks/pre-commit', '755');
        grunt.log.writeln('now on git commit will execute unit tests before committing..');
    });

    grunt.registerTask('run', 'Web Controller Test Cases', function (feature) {
        if (feature == null) {
            grunt.log.writeln('>>>>>>>> No feature specified. will run all the feature tests. <<<<<<<');
            grunt.log.writeln('If you need to run specific feature tests only; then run: grunt run:nm\n\n');
            grunt.task.run('karma:runAllTests');
            grunt.log.writeln('Test results: ' + karmaConfig['runAllTests']['options']['htmlReporter']['outputFile']);
            printCoverageReportLoc(karmaConfig['runAllTests']['options']['coverageReporter'])

        } else if (feature == 'nm') {
            grunt.log.writeln('>>>>>>>> Running Network Monitoring feature tests. <<<<<<<');
            grunt.task.run('karma:runAllNMTests');
            grunt.log.writeln('Test results: ' + karmaConfig['runAllNMTests']['options']['htmlReporter']['outputFile']);
            printCoverageReportLoc(karmaConfig['runAllNMTests']['options']['coverageReporter']);
        } else if (feature == 'sm') {
            grunt.log.writeln('>>>>>>>> Running Security Monitoring feature tests. <<<<<<<');
            grunt.task.run('karma:runAllSMTests');
            grunt.log.writeln('Test results: ' + karmaConfig['runAllSMTests']['options']['htmlReporter']['outputFile']);
            printCoverageReportLoc(karmaConfig['runAllSMTests']['options']['coverageReporter']);
        }else if (feature == 'config') {
            grunt.log.writeln('>>>>>>>> Running Config feature tests. <<<<<<<');
            grunt.task.run('karma:runAllConfigTests');
            grunt.log.writeln('Test results: ' + karmaConfig['runAllConfigTests']['options']['htmlReporter']['outputFile']);
            printCoverageReportLoc(karmaConfig['runAllConfigTests']['options']['coverageReporter']);
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

    grunt.registerTask('sm', 'Security Monitoring Test Cases', function (target) {
        if (target == null) {
            grunt.log.writeln('>>>>>>>> Running Security Monitoring feature tests. <<<<<<<');
            grunt.task.run('karma:runAllSMTests');
            grunt.log.writeln('Test results: ' + karmaConfig['runAllSMTests']['options']['htmlReporter']['outputFile']);
            printCoverageReportLoc(karmaConfig['runAllSMTests']['options']['coverageReporter']);
        } else if (target == 'TrafficGroupsView') {
            grunt.task.run('karma:TrafficGroupsView');
        } else if (target == 'runAllNoMerge') {
            grunt.log.writeln('>>>>>>> Running all Security Monitoring tests one by one. Results will not be Merged. <<<<<<');
            grunt.task.run(['karma:TrafficGroupsView']);
        }
    });

    grunt.registerTask('config', 'Config Test Cases', function(target){
        var testDir = 'runAllConfigTests';
        switch(target) {
            case 'virtualnetworks' :
                grunt.task.run('karma:vnGridView');
                testDir = 'vnGridView';
                break;
            case 'ipams' :
                grunt.task.run('karma:ipamCfgGridView');
                testDir = 'ipamCfgGridView';
                break;
            case 'fip' :
                grunt.task.run('karma:fipCfgGridView');
                testDir = 'fipCfgGridView';
                break;
            case 'logicalrouter' :
                grunt.task.run('karma:logicalRouterGridView');
                testDir = 'logicalRouterGridView';
                break;
            case 'policy' :
                grunt.task.run('karma:policyGridView');
                testDir = 'policyGridView';
                break;
            case 'securitygroup' :
                grunt.task.run('karma:secGrpGridView');
                testDir = 'secGrpGridView';
                break;
            case 'physicalrouters' :
                grunt.task.run('karma:physicalRoutersGridView');
                testDir = 'physicalRoutersGridView';
                break;
            case 'physicalinterfaces' :
                grunt.task.run('karma:physicalInterfacesGridView');
                testDir = 'physicalInterfacesGridView';
                break;
            case 'bgprouters' :
                grunt.task.run('karma:bgpRoutersGridView');
                testDir = 'bgpRoutersGridView';
                break;
            case 'dnsservers' :
                grunt.task.run('karma:dnsServersGridView');
                testDir = 'dnsServersGridView';
                break;
            case 'dnsrecords' :
                grunt.task.run('karma:dnsRecordsGridView');
                testDir = 'dnsRecordsGridView'
                break;
            case 'bgpasaservice' :
                grunt.task.run('karma:bgpAsAServiceGridView');
                testDir = 'bgpAsAServiceGridView'
                break;
            case 'port' :
                grunt.task.run('karma:portGridView');
                testDir = 'portGridView'
                break;
            case 'slo' :
                grunt.task.run('karma:sloGridView');
                testDir = 'sloGridView'
                break;
            case 'qos' :
                grunt.task.run('karma:qosGridView');
                testDir = 'qosGridView'
                break;
            case 'globalslo' :
                grunt.task.run('karma:gloablSloGridView');
                testDir = 'gloablSloGridView'
                break;
            case 'globalqos' :
                grunt.task.run('karma:gloablQosGridView');
                testDir = 'gloablQosGridView'
                break;
            case 'servicetemplate' :
                grunt.task.run('karma:svcTempGridView');
                testDir = 'svcTempGridView'
                break;
            case 'serviceinstance' :
                grunt.task.run('karma:svcInstanceGridView');
                testDir = 'svcInstanceGridView'
                break;
            case 'servicehealthcheck' :
                grunt.task.run('karma:svcHealthCheckGridView');
                testDir = 'svcHealthCheckGridView'
                break;
            case 'routeaggregates' :
                grunt.task.run('karma:routeAggregateGridView');
                testDir = 'routeAggregateGridView'
                break;
            case 'loadbalancer' :
                grunt.task.run('karma:loadBalancerGridView');
                testDir = 'loadBalancerGridView'
                break;
            case 'alarm' :
                grunt.task.run('karma:alarmGridView');
                testDir = 'alarmGridView'
                break;
            case 'globaltag' :
                grunt.task.run('karma:globalTagGridView');
                testDir = 'globalTagGridView'
                break;
            case 'projecttag' :
                grunt.task.run('karma:projectTagGridView');
                testDir = 'projectTagGridView'
                break;
            case 'projectaddressgroup' :
                grunt.task.run('karma:projectAddressGrpGridView');
                testDir = 'projectAddressGrpGridView'
                break;
            case 'projectservicegroup' :
                grunt.task.run('karma:projectServiceGrpGridView');
                testDir = 'projectServiceGrpGridView'
                break;
            case 'projectfwpolicy' :
                grunt.task.run('karma:projectFwPolicyGridView');
                testDir = 'projectFwPolicyGridView'
                break;
            case 'projectaps' :
                grunt.task.run('karma:projectApsGridView');
                testDir = 'projectApsGridView'
                break;
            case 'globaladdressgroup' :
                grunt.task.run('karma:globalAddressGrpGridView');
                testDir = 'globalAddressGrpGridView'
                break;
            case 'globalservicegroup' :
                grunt.task.run('karma:globalServiceGrpGridView');
                testDir = 'globalServiceGrpGridView'
                break;
            case 'globalfwpolicy' :
                grunt.task.run('karma:globalFwPolicyGridView');
                testDir = 'globalFwPolicyGridView'
                break;
            case 'globalvrouterencryption' :
                grunt.task.run('karma:globalVRouterEncryptionGridView');
                            testDir = 'globalVRouterEncryptionGridView'
                	break;
            case 'globalaps' :
                grunt.task.run('karma:globalApsGridView');
                testDir = 'globalApsGridView'    
                	break;
            case 'ctunit' :
                grunt.task.run('karma:ctUnit');
                testDir = 'ctUnit'
                break;
            default :
                grunt.task.run('karma:runAllConfigTests');
                testDir = 'runAllConfigTests';
                break;
        };
        grunt.log.writeln('Test results: ' + karmaConfig[testDir]['options']['htmlReporter']['outputFile']);
        printCoverageReportLoc(karmaConfig[testDir]['options']['coverageReporter']);
    });
};
