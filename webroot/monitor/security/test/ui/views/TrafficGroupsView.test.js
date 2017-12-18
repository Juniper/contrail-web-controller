/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/views/NetworkView.mock.data',
    'monitor/security/test/ui/views/TrafficGroupsView.mock.data',
    'co-tabs-view-test-suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, TGMockData, TabsViewTestSuite) {

    var moduleId = cttm.TRAFFIC_GROUPS_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];
        responses.push(cotr.createFakeServerResponse({
            url: cttu.getRegExForUrl(ctwc.URL_ALL_DOMAINS),
            body: JSON.stringify(TestMockdata.domainsMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            url: cttu.getRegExForUrl(ctwc.URL_ALL_PROJECTS),
            body: JSON.stringify(TestMockdata.projectMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            url: /\/api\/tenants\/projects\/default-domain.*$/,
            body: JSON.stringify(TestMockdata.projectMockData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(cowc.URL_QE_QUERY),
            method: 'POST',
            body: JSON.stringify(TGMockData.epsClientMockData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(cowc.URL_QE_QUERY),
            method: 'POST',
            body: JSON.stringify(TGMockData.epsServerMockData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_GET_CONFIG_DETAILS),
            method: 'POST',
            body: JSON.stringify(TGMockData.tgConfigData)
        }));


        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_security_trafficgroups'
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    /**
     * Test cases for components in each project tab will be tested in their respective tab pages.
     */
    var getTestConfig = function() {
        return {
            rootView: trafficGroupsLoader.TrafficGroupsInitView,
            tests: []
        } ;

    };

    var testInitFn = function (defObj, onAllViewsRenderComplete) {
        setTimeout(function () {
                onAllViewsRenderComplete.notify();
                defObj.resolve();
            },
            // Add necessary timeout for the tab elements to load properly and resolve the promise
            cotc.PAGE_INIT_TIMEOUT * 10
        );

        return;
    };
    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, fakeServerConfig, pageConfig, getTestConfig, testInitFn);

    cotr.startTestRunner(pageTestConfig);

});
