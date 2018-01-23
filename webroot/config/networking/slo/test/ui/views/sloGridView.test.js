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

    var moduleId = cttm.SLO_GRID_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_DOMAINS),
            body: JSON.stringify(TestMockdata.sloDomainsData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_PROJECTS),
            body: JSON.stringify(TestMockdata.sloPojectsData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/admin\/config\/get-data.*$/,
            body: JSON.stringify(TestMockdata.networkPolicyMockData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/config\/securitygroup-details.*$/,
            body: JSON.stringify(TestMockdata.secGrpMockData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/config\/get-config-details.*$/,
            method : 'POST',
            postBody: JSON.stringify(TestMockdata.sloMockDataInput),
            body: JSON.stringify(TestMockdata.sloMockDataOutput)
        }));
        responses.push(cotr.createFakeServerResponse({
            url: /\/api\/tenants\/config\/create-config-object.*$/,
            method: 'POST',
            postBody: JSON.stringify(TestMockdata.sloModalMockCNOutput),
            body: JSON.stringify(null)
        }));
        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'config_net_slo'
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 2;

    var getTestConfig = function() {
        return {
            rootView: configSloPageLoader.sloView,
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
                            isGlobal: false
                        }
                    ]
                }
            ]
        } ;

    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, fakeServerConfig, pageConfig, getTestConfig);

    cotr.startTestRunner(pageTestConfig);

});
