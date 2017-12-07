/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'config/networking/loadbalancer/test/ui/views/lbGridView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite) {

    var moduleId = cttm.LB_GRID_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_DOMAINS),
            body: JSON.stringify(TestMockdata.loadbalancerDomainsData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_PROJECTS),
            body: JSON.stringify(TestMockdata.loadbalancerPojectsData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/get-project-role.*$/,
            body: JSON.stringify(TestMockdata.loadbalancerProjectRole)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/config\/lbaas\/load-balancers-details.*$/,
            body: JSON.stringify(TestMockdata.loadbalancerMockData)
        }));
        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'config_load_balancer'
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 2;

    var getTestConfig = function() {
        return {
            rootView: configlBaaSLoader.lbCfgView,
            tests: [
                {
                    viewId: ctwl.CFG_LB_GRID_ID,
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