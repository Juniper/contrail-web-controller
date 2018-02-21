/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'co-test-utils',
    'co-test-constants',
    'co-test-runner',
    'ct-test-messages',
    'config/networking/port/test/ui/views/portGridView.mock.data',
], function (_, cotu, cotc, cotr, cttm, TestMockdata) {

    var testSuiteClass = function (viewObj, suiteConfig) {
        var el = viewObj.el;
        module(cotu.formatTestModuleMessage("Port Modal test cases", el.id));
        var gridViewCustomTestSuite =
            cotr.createTestSuite('ModalCustomTestSuite');
        var modalTestGroup = gridViewCustomTestSuite.createTestGroup('Port Modal Test Group');
        //open popup
        $($('.widget-toolbar-icon')[4]).trigger('click');
        modalTestGroup.registerTest(cotr.test("Test case - create Ports", function(){
            var assert = arguments[0],
                done = assert.async()
            cotu.checkDOMElementExist(
                {selector: ('#configure-Ports:visible')}, function(){
                cotu.checkDOMElementExist(
                    {selector: ('#configure-Ports:not(:visible)')},
                    function(bool){
                        assert.equal(bool, true, 'Incorrect request payload');
                        done();
                });
            });
        }, cotc.SEVERITY_HIGH));
        gridViewCustomTestSuite.run(suiteConfig.groups, suiteConfig.severity);

        function modalTestCases() {
            var portModalMockCNInput = TestMockdata.portModalMockCNInput;
            equal($("#fatFlowAccordion").length, 1,
            "Fat Flows is not avilable");
            $('#configure-Portsbtn1').trigger('click');
        }
        //wait for modal to load
        cotu.checkDOMElementExist(
            {selector: '#s2id_virtualNetworkName_dropdown:visible'},
                modalTestCases);
    }
    return testSuiteClass;
});
