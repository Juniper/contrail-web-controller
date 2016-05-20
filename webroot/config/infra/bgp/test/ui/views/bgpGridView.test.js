/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'config/infra/bgp/test/ui/views/bgpGridView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite) {

    var moduleId = cttm.BGP_GRID_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/config\/bgp\/get-bgp-routers.*$/,
            body: JSON.stringify(TestMockdata.bgpMockData)
        }));

        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'config_infra_bgp',
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 2;

    var getTestConfig = function() {
        return {
            rootView: configBGPPageLoader.bgpView,
            tests: [
                {
                    viewId: ctwl.BGP_GRID_ID,
                    suites: [
                        {
                            class: GridViewTestSuite,
                            groups: ['all']
                        }
                    ]
                }
            ]
        } ;

    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, fakeServerConfig, pageConfig, getTestConfig);

    cotr.startTestRunner(pageTestConfig);

});
