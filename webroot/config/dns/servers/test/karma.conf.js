/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
module.exports = function(config) {
  config.set({
    basePath: '../../../../..',    //"contrail-web-ui" directory
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
        "webroot/config/dns/servers/js/dnsservers_config.js",
        "webroot/config/dns/servers/views/dnsservers_config.view",
        "webroot/config/dns/servers/test/dnsservers_config_mock.js",        
        "webroot/config/dns/servers/test/dnsservers_config_test.js"
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
        'webroot/config/dns/servers/js/*.js': ['coverage'],
        '*.html': [],
        'webroot/config/dns/servers/views/*.view' : ['html2js']
        },
    htmlReporter: {
      outputFile: './tests/units.html'
    },
    singleRun: true
  });
};
