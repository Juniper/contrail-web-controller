module.exports = function(config) {
  config.set({
    basePath: '../../../..',    //"contrail-web-ui" directory
    autoWatch: true,
    frameworks: ['qunit'],
    files: [
        "webroot/js/contrail-all-1.js",
        "webroot/js/contrail-all-2.js",
        "webroot/js/contrail-all-3.js",
        "webroot/js/contrail-all-4.js",
        "webroot/js/contrail-all-5.js",
        "webroot/config/vn/js/vn_config.js",
        "webroot/config/vn/views/vn_config.view",
        "webroot/js/test/config_global_mock.js",
        "webroot/js/test/utils_mock.js",
        "webroot/config/vn/test/configure_virtual_network_mock.js",        
        "webroot/js/test/config_global_test.js",
        "webroot/config/vn/test/configure_virtual_network_test.js"
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
        'webroot/config/vn/js/*.js': ['coverage'],
        '*.html': [],
        'webroot/config/vn/views/*.view' : ['html2js']
        },
    htmlReporter: {
      outputFile: './tests/units.html'
    },
    singleRun: true
  });
};
