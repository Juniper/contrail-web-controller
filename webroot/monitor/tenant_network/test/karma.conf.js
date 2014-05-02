module.exports = function(config) {
  config.set({
    basePath: '../../../..',    //"contrail-web-ui" directory
    autoWatch: true,
    frameworks: ['qunit'],
    files: [
        //{pattern:"webroot/monitor/bgp/test/monitor_infra_dashboard.html",watched:false},
        "webroot/assets/sinon/sinon.js",
        "webroot/js/contrail-all-1.js",
        "webroot/js/contrail-all-2.js",
        "webroot/js/contrail-all-3.js",
        "webroot/js/contrail-all-4.js",
        "webroot/js/contrail-all-5.js",
        "webroot/monitor/tenant_network/js/tenant_monitor_network.js",
        "webroot/monitor/tenant_network/js/tenant_monitor_instance.js",
        "webroot/monitor/tenant_network/js/tenant_monitor_project.js",
        "webroot/monitor/tenant_network/js/tenant_monitor_topology.js",
        "webroot/monitor/tenant_network/js/tenant_monitor_domain.js",
        "webroot/monitor/tenant_network/test/tenant_monitor_network_mock.js",
        "webroot/monitor/tenant_network/test/tenant_monitor_network_test.js",
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
        'webroot/monitor/tenant_network/js/*.js': ['coverage'],
        '*.html': []
        },
    htmlReporter: {
      outputFile: './tests/units.html'
    },
    singleRun: true
  });
};
