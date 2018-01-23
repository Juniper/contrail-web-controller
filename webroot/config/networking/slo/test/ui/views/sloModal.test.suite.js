/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'co-test-utils',
    'co-test-constants',
    'co-test-runner',
    'ct-test-messages',
    'config/networking/slo/test/ui/views/sloGridView.mock.data'
], function (_, cotu, cotc, cotr, cttm, TestMockdata) {

    var testSuiteClass = function (viewObj, suiteConfig) {
        var el = viewObj.el;
        module(cotu.formatTestModuleMessage("SLO Modal test cases", el.id));

        var gridViewCustomTestSuite =
            cotr.createTestSuite('ModalCustomTestSuite');
        var modalTestGroup = gridViewCustomTestSuite.createTestGroup('SLO Modal Test Group');
        //open popup
        if(suiteConfig.isGlobal){
            $($('.widget-toolbar-icon')[9]).trigger('click');
        }else{
           $($('.widget-toolbar-icon')[5]).trigger('click');
        }
        modalTestGroup.registerTest(cotr.test("Test case - create SLO with global rate", function(){
            var assert = arguments[0],
                done = assert.async()
            cotu.checkDOMElementExist(
                {selector: ('#configure-security_logging_object:visible')}, function(){
                cotu.checkDOMElementExist(
                    {selector: ('#configure-security_logging_object:not(:visible)')},
                    function(bool){
                        assert.equal(bool, true, 'Incorrect request payload');
                        done();
                });
            });
        }, cotc.SEVERITY_HIGH));
        gridViewCustomTestSuite.run(suiteConfig.groups, suiteConfig.severity);

        function modalTestCases() {
            //populate popup with mock input data
            var sloModalMockCNInput = TestMockdata.sloModalMockCNInput;
            $('#name input').val(sloModalMockCNInput.name).change();
            $('#security_logging_object_rate input').
            val(sloModalMockCNInput.security_logging_object_rate).change();
            //click on save button
            $('#configure-security_logging_objectbtn1').trigger('click');
        }

        //wait for modal to load
        cotu.checkDOMElementExist(
            {selector: '#s2id_security_group_refs_dropdown:visible', timeout: 5000},
                modalTestCases);
    }
    return testSuiteClass;
});
