/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'jquery',
    'underscore',
    'co-test-utils',
    'co-test-messages',
    'co-test-constants',
    'co-test-runner'
], function ($, _, cotu, cotm, cotc, cotr) {

    var testSuiteClass = function (NMUtils, suiteConfig){

        NMUtils = ifNull(NMUtils, nmwu);
        
        var mockData = suiteConfig.mockData;

        module("NM Utils Unit test suite");

        var NMUtilsUnitTestSuite = cotr.createTestSuite('NMUtilsUnitTestSuite');

        /**
         * Test group for data parsers
         * */
        var basicUtilsTestGroup = NMUtilsUnitTestSuite.createTestGroup('BasicUtils');


        //basicUtilsTestGroup.registerTest(cotr.test("testGetUUIDByName", function() {
        //    expect(1);
        //    deepEqual(
        //        NMUtils.getUUIDByName(mockData.getInput({fnName:'getUUIDByName',type:'test1'})),
        //        mockData.getOutput({fnName:'getUUIDByName',type:'test1'}),
        //        'Test getUUIDByName with valid data'
        //    );
        //}, cotc.SEVERITY_LOW));

        basicUtilsTestGroup.registerTest(cotr.test("testGetMNConfigGraphConfig", function() {
            expect(1);
            var input = mockData.getInput({fnName:'getMNConfigGraphConfig',type:'test1'});
            deepEqual(
                NMUtils.getMNConfigGraphConfig(input.url, input.elementNameObject, input.keySuffix, input.type),
                mockData.getOutput({fnName:'getMNConfigGraphConfig',type:'test1'}),
                'Test getMNConfigGraphConfig with valid data'
            );
        }, cotc.SEVERITY_LOW));


        NMUtilsUnitTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});