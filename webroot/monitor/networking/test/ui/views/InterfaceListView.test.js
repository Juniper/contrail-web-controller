/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/views/InterfaceListView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite',
    'co-chart-view-zoom-scatter-test-suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite, ZoomScatterChartTestSuite) {

    var moduleId = cttm.INTERFACES_LIST_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        /*
            /api/tenants/config/domains
            /api/tenants/config/projects
            /api/tenants/networks/default-domain:admin
            /api/tenant/networking/stats
            /api/tenant/networking/virtual-machine-interfaces/summary
        */

        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_DOMAINS),
            body: JSON.stringify(TestMockdata.domainsMockData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_PROJECTS),
            body: JSON.stringify(TestMockdata.projectsMockData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/projects\/default\-domain\:admin.*$/,
            body: JSON.stringify(TestMockdata.adminProjectMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            method: "POST",
            url: cttu.getRegExForUrl(ctwc.URL_VM_VN_STATS),
            body: JSON.stringify(TestMockdata.interfacesMockStatData)
        }));
        responses.push(cotr.createFakeServerResponse({
            method: "POST",
            url: cttu.getRegExForUrl(ctwc.URL_VM_INTERFACES),
            body: JSON.stringify(TestMockdata.virtualMachinesInterfacesMockData)
        }));

        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_interfaces',
        q: {
            view: 'list',
            type: 'interface'
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: 'interfaces-traffic-throughput-chart',
                    suites: [
                        {
                            class: ZoomScatterChartTestSuite,
                            groups: ['all']
                        }
                    ]
                },
                {
                    viewId: 'interface-grid',
                    suites: [
                        {
                            class: GridViewTestSuite,
                            groups: ['all']
                        }
                    ]
                }
            ]
        };

    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, fakeServerConfig, pageConfig, getTestConfig);

    cotr.startTestRunner(pageTestConfig);

});
