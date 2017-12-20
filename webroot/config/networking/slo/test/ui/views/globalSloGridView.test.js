/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'config/networking/slo/test/ui/views/sloGridView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite',
    'config/networking/slo/test/ui/views/sloModal.test.suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite, SLOModalTestSuite) {

    var moduleId = cttm.GLOBAL_SLO_GRID_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/admin\/config\/get-data.*$/,
            body: JSON.stringify(TestMockdata.globalNetworkPolicyMockData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/config\/securitygroup-details.*$/,
            body: JSON.stringify(TestMockdata.globalSecGrpMockData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/config\/get-config-details.*$/,
            method : 'POST',
            postBody: JSON.stringify(TestMockdata.globalSloMockDataInput),
            body: JSON.stringify(TestMockdata.globalSloMockDataOutput)
        }));
        responses.push(cotr.createFakeServerResponse({
            url: /\/api\/tenants\/config\/create-config-object.*$/,
            method: 'POST',
            postBody: JSON.stringify(TestMockdata.globalSloModalMockCNOutput),
            body: JSON.stringify(null)
        }));
        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'config_infra_gblconfig',
        q: {
            tab: {
                'global-config-tab' : 'slo_tab'
            }
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 2;

    var getTestConfig = function() {
        return {
            rootView: globalConfigPageLoader.globalConfigView,
            tests: [
                {
                    viewId: ctwc.SLO_GRID_ID,
                    suites: [
                        {
                            class: GridViewTestSuite,
                            groups: ['all']
                        },
                        {
                            class: SLOModalTestSuite,
                            groups: ['all'],
                            isGlobal: true
                        }
                    ]
                }
            ]
        } ;

    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, fakeServerConfig, pageConfig, getTestConfig);

    cotr.startTestRunner(pageTestConfig);

});
