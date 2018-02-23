/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'co-test-utils',
    'co-test-constants',
    'co-test-runner',
    'ct-test-messages',
], function (_, cotu, cotc, CUnit, cttm) {
    var testSuiteClass = function (viewObj, suiteConfig) {

        var viewConfig = cotu.getViewConfigObj(viewObj),
            el = viewObj.el,
            gridData = $(el).data('contrailGrid');
            gridItems = gridData._dataView.getItems();

        var viewConfigHeader = viewConfig.elementConfig.header,
            viewConfigColHeader = viewConfig.elementConfig.columnHeader,
            viewConfigBody = viewConfig.elementConfig.body,
            viewConfigFooter = viewConfig.elementConfig.footer;

        module(cotu.formatTestModuleMessage('Global Config vRouter Encryption Grid view - Custom Tests', el.id));

        var gridViewCustomTestSuite = CUnit.createTestSuite('GridViewCustomTestSuite');

        /**
         * Grid Body group Custom test cases
         */

        var bodyTestGroup = gridViewCustomTestSuite.createTestGroup('body');


        /**
         * This is a sample custom test for Global config vRouter Encryption list grid.
         * In this testcase, we'll check for first row Traffic Encrypt  value (2nd Column).
         */

        bodyTestGroup.registerTest(CUnit.test(cttm.GLOBAL_VROUTER_ENCRYPTION_GRID_COLUMN_VALUE_CHECK, function() {
            expect(1);
            equal($($(el).find('.grid-body .slick_row_id_0 .slick-cell')[1]).text().trim(), "all",
               "Custom test to assert 1st row 2nd col value");

        }, cotc.SEVERITY_MEDIUM));
        
        bodyTestGroup.registerTest(CUnit.test(cttm.GLOBAL_VROUTER_ENCRYPTION_EDIT_CHECK, function() {
        		expect(0);         
            $(el).find('.widget-toolbar-icon').trigger('click');
           
        }, cotc.SEVERITY_MEDIUM));

        gridViewCustomTestSuite.run(suiteConfig.groups, suiteConfig.severity);

    };

    return testSuiteClass;
});