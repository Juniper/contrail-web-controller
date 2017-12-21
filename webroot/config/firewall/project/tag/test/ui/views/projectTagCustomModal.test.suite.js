/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'co-test-utils',
    'co-test-constants',
    'co-test-runner',
    'ct-test-messages',
    'config/firewall/project/tag/test/ui/views/projectTagView.mock.data'
], function (_, cotu, cotc, cotr, cttm, TestMockdata) {

    var testSuiteClass = function (viewObj, suiteConfig) {
        var el = viewObj.el;
        module(cotu.formatTestModuleMessage("Custom tag modal test cases", el.id));

        var gridViewCustomTestSuite =
            cotr.createTestSuite('CustomTagModalCustomTestSuite');
        var modalTestGroup = gridViewCustomTestSuite.createTestGroup('Custom Tag Modal Test Group');

        modalTestGroup.registerTest(cotr.test("Test case - create Custom tag", function(){
            var assert = arguments[0],
                done = assert.async()
            cotu.checkDOMElementExist(
                {selector: ('#configure-tag:visible')}, function(){
                cotu.checkDOMElementExist(
                    {selector: ('#configure-tag:not(:visible)')},
                    function(bool){
                        assert.equal(bool, true, 'Incorrect request payload');
                        done();
                });
            });
        }, cotc.SEVERITY_HIGH));
        gridViewCustomTestSuite.run(suiteConfig.groups, suiteConfig.severity);

        function modalTestCases() {
            //populate popup with mock input data
            var tagModalMockInput = TestMockdata.customTagModalInput;
            $('#tag_type_name .custom-combobox-input').
                val(tagModalMockInput.tag_type).change();
            $('#tag_value input').val(tagModalMockInput.tag_value).change();
            //click on save button
            $('#configure-tagbtn1').trigger('click');
        }

        //open popup
        setTimeout(function(){
            $($('.widget-toolbar-icon')[5]).trigger('click');
            //wait for modal to load
            cotu.checkDOMElementExist(
                {selector: '#tag_type_name .custom-combobox-input:visible'},
                    modalTestCases);
        }, 20000);
    }
    return testSuiteClass;
});
