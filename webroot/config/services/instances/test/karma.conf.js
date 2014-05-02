module.exports = function(config) {
  config.set({
    basePath: '../../../../../',    //"contrail-web-ui" directory
    autoWatch: true,
    frameworks: ['qunit'],
    files: [
        //{pattern:"webroot/monitor/bgp/test/monitor_infra_dashboard.html",watched:false},
        "webroot/js/contrail-all-1.js",
        "webroot/js/contrail-all-2.js",
        "webroot/js/contrail-all-3.js",
        "webroot/js/contrail-all-4.js",
        "webroot/js/contrail-all-5.js",
        "webroot/js/test/utils_mock.js",		
        "webroot/config/services/instances/js/svcinstances_config.js",
        "webroot/config/services/instances/views/svcinstances_config.view",
        "webroot/config/services/instances/views/svcinstances_config_ut.view",
        "webroot/config/services/instances/test/config_service_instance_test.js",
        "webroot/config/services/instances/test/config_service_instance_mock.js",
        "webroot/assets/sinon/sinon.js"
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
        'webroot/config/services/instances/js/*.js': ['coverage'],
		'webroot/config/services/instances/views/*.view' : ['html2js'],
        },
    htmlReporter: {
      outputFile: './tests/units.html'
    },
    singleRun: true
  });
};
