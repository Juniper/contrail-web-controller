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

    var testSuiteClass = function (CTParser, suiteConfig){

        CTParser = ifNull(CTParser, ctwp);

        var mockData = suiteConfig.mockData;

        module("Controller Parser Unit test suite");

        var CTParserUnitTestSuite = cotr.createTestSuite('CTParserUnitTestSuite');

        //Test group for data parsers
        var dataParserTestGroup = CTParserUnitTestSuite.createTestGroup('DataParser');

        dataParserTestGroup.registerTest(cotr.test("testInstanceDataParser", function() {
            //Declare the number of assert statements in current test case
            expect(1);
            deepEqual(
                CTParser.instanceDataParser(mockData.getInput({fnName:'instanceDataParser',type:'test2'})),
                mockData.getOutput({fnName:'instanceDataParser',type:'test2'}), 'Test instanceDataParser with valid data');

        }, cotc.SEVERITY_LOW));

        dataParserTestGroup.registerTest(cotr.test("Test valid ESI", function() {
            //Declare the number of assert statements in current test case
            equal(JSON.stringify(CTParser.isValidEsi(mockData.esiInput.ALL_00)), 'false' , 'Invalid ESI with all Zero');
            equal(JSON.stringify(CTParser.isValidEsi(mockData.esiInput.ALL_FF)), 'false' , 'Invalid ESI with all F');
            equal(JSON.stringify(CTParser.isValidEsi(mockData.esiInput.INVALID_ESI)), 'false' , 'Invalid ESI');
            equal(JSON.stringify(CTParser.isValidEsi(mockData.esiInput.VALID_ESI)), 'true' , 'Invalid ESI');

        }, cotc.SEVERITY_LOW));

        CTParserUnitTestSuite.run(suiteConfig.groups, suiteConfig.severity);
    };

    return testSuiteClass;
});