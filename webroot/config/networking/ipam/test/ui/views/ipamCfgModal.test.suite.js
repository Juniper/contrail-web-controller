/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'co-test-utils',
    'co-test-constants',
    'co-test-runner',
    'ct-test-messages',
    'config/networking/ipam/test/ui/views/ipamCfgGridView.mock.data',
], function (_, cotu, cotc, cotr, cttm, TestMockdata) {

    var testSuiteClass = function (viewObj, suiteConfig) {
        var el = viewObj.el;
        module(cotu.formatTestModuleMessage("IPAM Modal test cases", el.id));
        var gridViewCustomTestSuite =
            cotr.createTestSuite('ModalCustomTestSuite');
        var modalTestGroup = gridViewCustomTestSuite.createTestGroup('IPAM Modal Test Group');
        //open popup
        $($('.widget-toolbar-icon')[5]).trigger('click');
        modalTestGroup.registerTest(cotr.test("Test case - create IPAM", function(){
            var assert = arguments[0],
                done = assert.async()
            cotu.checkDOMElementExist(
                {selector: ('#configure-IPAM:visible')}, function(){
                cotu.checkDOMElementExist(
                    {selector: ('#configure-IPAM:not(:visible)')},
                    function(bool){
                        assert.equal(bool, true, 'Incorrect request payload');
                        done();
                });
            });
        }, cotc.SEVERITY_HIGH));
        gridViewCustomTestSuite.run(suiteConfig.groups, suiteConfig.severity);

        function modalTestCases() {
            //populate popup with mock input data
            var ipamModalMockCNInput = TestMockdata.ipamModalMockCNInput;
            $('#name input').val(ipamModalMockCNInput.name).change();
            $("#ipam_subnet_method input:radio:last").prop("checked", true).trigger("click");
            $('#dns_method_dropdown').data('contrailDropdown').value(ipamModalMockCNInput.ipam_dns_method, true);
            equal($("#ipam_subnet_method input:radio:last").prop("checked"), true,
                  "Flat subnet is not avilable");
            $('#configure-IPAMbtn1').trigger('click');
        }
        //wait for modal to load
        cotu.checkDOMElementExist(
            {selector: '#s2id_dns_method_dropdown:visible'},
                modalTestCases);
    }
    return testSuiteClass;
});
