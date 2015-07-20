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
        {pattern: 'contrail-web-core/webroot/assets/**/*.js', included: false},
        {pattern: 'contrail-web-core/webroot/assets/**/*.css', included: false},
        {pattern: 'contrail-web-core/webroot/css/**/*.css', included: false},

        {pattern: 'contrail-web-core/webroot/font/**/*.woff', included: false},
        {pattern: 'contrail-web-core/webroot/img/**/*.png', included: false},
        {pattern: 'contrail-web-core/webroot/assets/**/*.woff', included: false},
        {pattern: 'contrail-web-core/webroot/assets/**/*.ttf', included: false},

        {pattern: 'contrail-web-core/webroot/test/ui/**/*.css', included: false},

        {pattern: 'contrail-web-core/webroot/views/**/*.view', included: false},
        {pattern: 'contrail-web-core/webroot/js/**/*.js', included: false},
        {pattern: 'contrail-web-core/webroot/test/ui/**/*.js', included: false},

        {pattern: 'contrail-web-controller/webroot/test/ui/ct.test.app.js'},

        {pattern: 'contrail-web-controller/webroot/test/ui/*.js', included: false},

        {pattern: 'contrail-web-controller/webroot/monitor/networking/ui/templates/**/*.tmpl', included: false},

        {pattern: 'contrail-web-controller/webroot/common/**/*.js', included: false},
        {pattern: 'contrail-web-controller/webroot/monitor/**/*.js', included: false},

        {pattern: 'contrail-web-controller/webroot/**/*.xml', included: false},
        {pattern: 'contrail-web-core/webroot/js/**/*.js', included: false}
    ];
    var karmaCfg = {
        options     : {
            configFile: 'karma.conf.js',
        },
        nm  : {
            options: {
                files: [
                    {pattern: 'contrail-web-controller/webroot/monitor/networking/ui/test/ui/NetworkListViewTest.js', included: false}
                ]
            }
        }
    };

    /* Start - Create all target that will run unit test cases from all features */
    var allCfg = {'options': {
        files        : commonFiles,
        preprocessors: {}
    }};
    for (var feature in karmaCfg) {
        if (feature != 'options') {
            allCfg['options']['files'] = allCfg['options']['files'].concat(karmaCfg[feature]['options']['files']);
            for (var path in karmaCfg[feature]['options']['preprocessors'])
                allCfg['options']['preprocessors'][path] = karmaCfg[feature]['options']['preprocessors'][path];
            karmaCfg[feature]['options']['files'] = commonFiles.concat(karmaCfg[feature]['options']['files']);
        }
    }
    karmaCfg['all'] = allCfg;
    /* End - Create all target that will run unit test cases from all features */

    grunt.initConfig({
        pkg   : grunt.file.readJSON(__dirname + "/../../../../contrail-web-core/package.json"),
        karma : karmaCfg,
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            files  : [ "Gruntfile.js"]
        },
    });
};