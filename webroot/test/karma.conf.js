/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
module.exports = function(config) {
  config.set({
    basePath: '../../..',    //"contrail-web-ui" directory
    autoWatch: true,
    frameworks: ['qunit'],
    files: [
        //{pattern:"webroot/monitor/bgp/test/monitor_infra_dashboard.html",watched:false},
        "contrail-web-core/webroot/js/contrail-all-1.js",
        "contrail-web-core/webroot/js/contrail-all-2.js",
        "contrail-web-core/webroot/js/contrail-all-3.js",
        "contrail-web-core/webroot/js/contrail-all-4.js",
        "contrail-web-core/webroot/js/contrail-all-5.js",
        "contrail-web-core/webroot/assets/sinon/sinon.js",
        "contrail-web-core/webroot/js/test/utils_mock.js",
        "contrail-web-controller/webroot/monitor/infra/dashboard/ui/js/monitor_infra_dashboard.js",
        "contrail-web-controller/webroot/monitor/infra/vrouter/ui/js/monitor_infra_vrouter.js",
        "contrail-web-controller/webroot/monitor/infra/controlnode/ui/js/monitor_infra_controlnode.js",
    	"contrail-web-controller/webroot/monitor/infra/analyticsnode/ui/js/monitor_infra_analyticnode.js",
        "contrail-web-controller/webroot/monitor/infra/test/monitor_infra_dashboard_mock.js",
        "contrail-web-controller/webroot/monitor/infra/test/monitor_infra_dashboard_test.js",
        "contrail-web-controller/webroot/monitor/infra/test/monitor_infra_computenode_mock.js",
        "contrail-web-controller/webroot/monitor/infra/test/monitor_infra_computenode_test.js",
    	"contrail-web-controller/webroot/monitor/infra/test/monitor_infra_controlnode_mock.js",
    	"contrail-web-controller/webroot/monitor/infra/test/monitor_infra_controlnode_test.js",
    	"contrail-web-controller/webroot/monitor/infra/test/monitor_infra_analyticsnode_mock.js",
    	"contrail-web-controller/webroot/monitor/infra/test/monitor_infra_analyticsnode_test.js",
        "contrail-web-controller/webroot/monitor/tenant-network/network/ui/js/tenant_monitor_network.js",
        "contrail-web-controller/webroot/monitor/tenant-network/dashboard/ui/js/tenant_monitor_dashboard.js",
        "contrail-web-controller/webroot/monitor/tenant-network/instance/ui/js/tenant_monitor_instance.js",
        "contrail-web-controller/webroot/monitor/tenant-network/project/ui/js/tenant_monitor_project.js",
        "contrail-web-controller/webroot/monitor/tenant-network/common/ui/js/tenant_monitor_topology.js",
        "contrail-web-controller/webroot/monitor/tenant-network/test/tenant_monitor_network_mock.js",
        "contrail-web-controller/webroot/monitor/tenant-network/test/tenant_monitor_network_test.js",

        "contrail-web-controller/webroot/config/services/instances/ui/js/svcinstances_config.js",
        "contrail-web-controller/webroot/config/services/instances/ui/views/svcinstances_config.view",
        "contrail-web-controller/webroot/config/services/instances/ui/views/svcinstances_config_ut.view",
        "contrail-web-controller/webroot/config/services/instances/test/config_service_instance_test.js",
        "contrail-web-controller/webroot/config/services/instances/test/config_service_instance_mock.js",
        "contrail-web-controller/webroot/config/services/template/ui/js/svctemplate_config.js",
        "contrail-web-controller/webroot/config/services/template/ui/views/svctemplate_config.view",
        "contrail-web-controller/webroot/config/services/template/test/config_service_template_test.js",
        "contrail-web-controller/webroot/config/services/template/test/config_service_template_mock.js",
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
        'contrail-web-controller/webroot/monitor/bgp/js/*.js': ['coverage'],
        'contrail-web-controller/webroot/monitor/tenant_network/js/*.js': ['coverage'],
        'contrail-web-controller/webroot/config/services/instances/ui/js/*.js': ['coverage'],
        'contrail-web-controller/webroot/config/services/instances/ui/views/*.view' : ['html2js'],
        'contrail-web-controller/webroot/config/services/template/ui/js/*.js': ['coverage'],
        'contrail-web-controller/webroot/config/services/template/ui/views/*.view' : ['html2js'],
        '*.html': []
        },
    htmlReporter: {
      outputFile: './tests/units.html'
    },
    singleRun: false
  });
};
