/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'config/networking/securitygroup/test/ui/views/secGrpGridView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite) {
    var moduleId = cttm.SEC_GRP_GRID_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_DOMAINS),
            body: JSON.stringify(TestMockdata.vnDomainsData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_PROJECTS),
            body: JSON.stringify(TestMockdata.vnPojectsData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/config\/securitygroup.*$/,
            body: JSON.stringify(TestMockdata.securityGrp)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/config\/securitygroup-details.*$/,
            body: JSON.stringify(TestMockdata.securityGrpDetails)
        }));
        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'config_net_sg'
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 2;

    var getTestConfig = function() {
        return {
            rootView: secGrpPageLoader.secGrpView,
            tests: [
                {
                    viewId: ctwl.SEC_GRP_GRID_ID,
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
