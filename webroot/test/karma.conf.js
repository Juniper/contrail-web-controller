/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
module.exports = function(config) {
  config.set({
    basePath: '../..',    //"contrail-web-ui" directory
    autoWatch: true,
    frameworks: ['qunit'],
    files: [
        //{pattern:"webroot/monitor/bgp/test/monitor_infra_dashboard.html",watched:false},
        "webroot/js/contrail-all-1.js",
        "webroot/js/contrail-all-2.js",
        "webroot/js/contrail-all-3.js",
        "webroot/js/contrail-all-4.js",
        "webroot/js/contrail-all-5.js",
        "webroot/assets/sinon/sinon.js",
        "webroot/js/test/utils_mock.js",
        "webroot/monitor/bgp/js/monitor_infra_dashboard.js",
        "webroot/monitor/bgp/js/monitor_infra_computenode.js",
        "webroot/monitor/bgp/test/monitor_infra_dashboard_mock.js",
        "webroot/monitor/bgp/test/monitor_infra_dashboard_test.js",
        "webroot/monitor/bgp/test/monitor_infra_computenode_mock.js",
        "webroot/monitor/bgp/test/monitor_infra_computenode_test.js",
        "webroot/monitor/bgp/js/monitor_infra_controlnode.js",
    	"webroot/monitor/bgp/test/monitor_infra_controlnode_mock.js",
    	"webroot/monitor/bgp/test/monitor_infra_controlnode_test.js",
    	"webroot/monitor/bgp/js/monitor_infra_analyticnode.js",
    	"webroot/monitor/bgp/test/monitor_infra_analyticsnode_mock.js",
    	"webroot/monitor/bgp/test/monitor_infra_analyticsnode_test.js",
        "webroot/monitor/tenant_network/js/tenant_monitor_network.js",
        "webroot/monitor/tenant_network/js/tenant_monitor_domain.js",
        "webroot/monitor/tenant_network/js/tenant_monitor_instance.js",
        "webroot/monitor/tenant_network/js/tenant_monitor_project.js",
        "webroot/monitor/tenant_network/js/tenant_monitor_topology.js",
        "webroot/monitor/tenant_network/test/tenant_monitor_network_mock.js",
        "webroot/monitor/tenant_network/test/tenant_monitor_network_test.js",

        "webroot/config/services/instances/js/svcinstances_config.js",
        "webroot/config/services/instances/views/svcinstances_config.view",
        "webroot/config/services/instances/views/svcinstances_config_ut.view",
        "webroot/config/services/instances/test/config_service_instance_test.js",
        "webroot/config/services/instances/test/config_service_instance_mock.js",
        "webroot/config/services/template/js/svctemplate_config.js",
        "webroot/config/services/template/views/svctemplate_config.view",
        "webroot/config/services/template/test/config_service_template_test.js",
        "webroot/config/services/template/test/config_service_template_mock.js",
    ],
    plugins:[
        'karma-phantomjs-launcher',
        'karma-coverage',
        'karma-qunit',
        'karma-htmlfile-reporter',
        'karma-junit-reporter',
        'karma-html2js-preprocessor',
        'karma-firefox-launcher',
        'karma-chrome-launcher',
    ],
    browsers: [
        'PhantomJS'
        //'Firefox',
        //'Chrome'
        ],

    reporters: ['progress','html','coverage','junit'],
    // the default configuration
    junitReporter: {
      outputFile: 'test-results.xml',
      suite: ''
    },
    preprocessors: { 
        'webroot/monitor/bgp/js/*.js': ['coverage'],
        'webroot/monitor/tenant_network/js/*.js': ['coverage'],
        'webroot/config/services/instances/js/*.js': ['coverage'],
		'webroot/config/services/instances/views/*.view' : ['html2js'],
        'webroot/config/services/template/js/*.js': ['coverage'],
		'webroot/config/services/template/views/*.view' : ['html2js'],
        '*.html': []
        },
    htmlReporter: {
      outputFile: './tests/units.html'
    },
    singleRun: true
  });
};
