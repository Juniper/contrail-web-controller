/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
module.exports = function (config) {
    config.set({
        basePath: __dirname + '/../../../..',
        autoWatch: false,
        frameworks: ['qunit', 'sinon', 'requirejs'],
        plugins: [
            'karma-phantomjs-launcher',
            'karma-coverage',
            'karma-qunit',
            'karma-sinon',
            'karma-htmlfile-reporter',
            //'karma-html-reporter',
            'karma-requirejs',
            'karma-junit-reporter',
            'karma-html2js-preprocessor',
            'karma-firefox-launcher',
            'karma-chrome-launcher',
        ],
        browsers: [
            'PhantomJS',
            //'Firefox',
            //'Chrome'
        ],

        //port: 8143,

        reporters: ['progress', 'html', 'coverage', 'junit'],
        // the default configuration
        junitReporter: {
            outputFile: 'test/reports/test-results.xml',
            suite: ''
        },
        preprocessors: {
            '*.view': ['html2js']
        },
        htmlReporter: {
            outputFile: 'test/reports/units.html'
        },
        singleRun: true,
        colors: true
    });
};
