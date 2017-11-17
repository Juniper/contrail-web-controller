/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'co-test-utils',
    'co-test-constants',
    'co-test-runner',
    'ct-test-messages',
    'config/infra/bgp/test/ui/views/bgpGridView.mock.data'
], function (_, cotu, cotc, cotr, cttm, TestMockdata) {

    var testSuiteClass = function (viewObj, suiteConfig) {
        var el = viewObj.el;
        module(cotu.formatTestModuleMessage("BGP Modal test cases", el.id));

        var gridViewCustomTestSuite =
            cotr.createTestSuite('ModalCustomTestSuite');
        var modalTestGroup = gridViewCustomTestSuite.createTestGroup('BGP Modal Test Group');
        //open popup
        $($('.widget-toolbar-icon')[5]).trigger('click');
        modalTestGroup.registerTest(cotr.test("Test case - create BGP router with router type controle node", function(){
            var assert = arguments[0],
                done = assert.async()
            cotu.checkDOMElementExist(
                {selector: ('#configure-bgp_router:visible')}, function(){
                cotu.checkDOMElementExist(
                    {selector: ('#configure-bgp_router:not(:visible)')},
                    function(bool){
                        assert.equal(bool, true, 'Incorrect request payload');
                        done();
                });
            });
        }, cotc.SEVERITY_HIGH));
        gridViewCustomTestSuite.run(suiteConfig.groups, suiteConfig.severity);

        function modalTestCases() {
            //populate popup with mock input data
            var bgpModalMockCNInput = TestMockdata.bgpModalMockCNInput;
            $('#user_created_router_type_dropdown').data('contrailDropdown').
                value(bgpModalMockCNInput.bgp_router_params_router_type, true);
            $('#display_name input').val(bgpModalMockCNInput.name).change();
            $('#user_created_vendor input').
            val(bgpModalMockCNInput.bgp_router_params_vendor).change();
            $('#user_created_address input').
            val(bgpModalMockCNInput.bgp_router_params_address).change();
            $('#user_created_identifier input').
            val(bgpModalMockCNInput.bgp_router_params_address).change();
            //click on save button
            $('#configure-bgp_routerbtn1').trigger('click');
        }

        //wait for modal to load
        cotu.checkDOMElementExist(
            {selector: '#s2id_user_created_router_type_dropdown:visible'},
                modalTestCases);
    }
    return testSuiteClass;
});
