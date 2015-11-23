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

    var testSuiteClass = function (NMParser, suiteConfig){

        NMParser = ifNull(NMParser, nmwp);

        var mockData = suiteConfig.mockData;

        module("NM Parser Unit test suite");

        var NMParserUnitTestSuite = cotr.createTestSuite('NMParserUnitTestSuite');

        /**
         * Test group for data parsers
         * */
        var dataParserTestGroup = NMParserUnitTestSuite.createTestGroup('DataParser');

        // Input output data mismatch
        //dataParserTestGroup.registerTest(cotr.test("testNetworkDataParser", function() {
        //    //Declare the number of assert statements in current test case
        //    expect(2);
        //    deepEqual(
        //        NMParser.networkDataParser(mockData.getInput({fnName:'networkDataParser',type:'test1'})),
        //        mockData.getOutput({fnName:'networkDataParser',type:'test1'}),
        //        'Test networkDataParser with valid data'
        //    );
        //
        //    deepEqual(
        //        NMParser.networkDataParser(mockData.getInput({fnName:'networkDataParser',type:'test2'})),
        //        mockData.getOutput({fnName:'networkDataParser',type:'test2'}),
        //        'Test networkDataParser with valid data'
        //    );
        //
        //}, cotc.SEVERITY_LOW));

        NMParserUnitTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});