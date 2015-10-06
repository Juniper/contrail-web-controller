/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-unit',
    'ct-test-utils',
    'ct-test-messages',
    'instance-view-mock-data',
    'co-tabs-view-test-suite',
    'co-details-view-test-suite',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite',
    'co-chart-view-line-bar-test-suite'
], function (CUnit, cttu, cttm, TestMockdata, TabsViewTestSuite, DetailsViewTestSuite,
             GridListModelTestSuite, GridViewTestSuite, LineBarChartViewTestSuite) {

    var moduleId = cttm.INSTANCE_VIEW_COMMON_TEST_MODULE;

    var fakeServerConfig = CUnit.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        /**
         URIs
         /api/tenants/config/domains [done]
         /api/tenants/config/projects [done
         /api/tenants/projects/default-domain [done]
         /api/tenants/networks/default-domain:demo [done]
         /api/tenant/networking/virtual-machine [done]
         /api/tenant/monitoring/instance-connected-graph [done]
         /api/tenant/networking/virtual-machine-interfaces/summary [done]
         /api/tenant/networking/flow-series/vm [done]
         /api/tenant/networking/network/stats/top [done]
         /api/tenant/networking/stats [done]
         */

        var responses = [];
        /**
         *  /api/tenants/config/domains
         */
        responses.push(CUnit.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_DOMAINS),
            body: JSON.stringify(TestMockdata.domainsMockData)
        }));
        responses.push(CUnit.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_PROJECTS),
            body: JSON.stringify(TestMockdata.projectsMockData)
        }));
        responses.push(CUnit.createFakeServerResponse( {
            url: /\/api\/tenants\/projects\/default\-domain.*$/,
            body: JSON.stringify(TestMockdata.projectsMockData)
        }));
        responses.push(CUnit.createFakeServerResponse( {
            url: /\/api\/tenants\/networks\/default\-domain\:demo.*$/,
            body: JSON.stringify(TestMockdata.demoProjectMockData)
        }));
        responses.push(CUnit.createFakeServerResponse({
            url: /\/api\/tenant\/networking\/virtual\-machines\/details.*$/,
            body: JSON.stringify(TestMockdata.virtualMachineMockData)
        }));
        responses.push(CUnit.createFakeServerResponse({
            url: /\/api\/tenant\/networking\/virtual\-machine.*$/,
            body: JSON.stringify(TestMockdata.virtualMachineStatsMockData)
        }));
        responses.push(CUnit.createFakeServerResponse({
            url: /\/api\/tenant\/monitoring\/instance\-connected\-graph.*$/,
            body: JSON.stringify(TestMockdata.virtualMachineConnectedGraphMockData)
        }));
        responses.push(CUnit.createFakeServerResponse({
            method: "POST",
            url: cttu.getRegExForUrl(ctwc.URL_QUERY),
            body: JSON.stringify(TestMockdata.reportsQueryMockData)
        }));
        responses.push(CUnit.createFakeServerResponse({
            url: /\/api\/tenant\/networking\/flow\-series\/vm.*$/,
            body: JSON.stringify(TestMockdata.virtualMachineFlowSeriesMockData)
        }));
        responses.push(CUnit.createFakeServerResponse({
            method: "POST",
            url: cttu.getRegExForUrl(ctwc.URL_VM_INTERFACES),
            body: JSON.stringify(TestMockdata.virtualMachineInterfacesMockData)
        }));
        responses.push(CUnit.createFakeServerResponse({
            url: /\/api\/tenant\/networking\/network\/stats\/top.*$/,
            body: JSON.stringify(TestMockdata.networkingStatsTopMockData)
        }));
        responses.push(CUnit.createFakeServerResponse({
            method: "POST",
            url: cttu.getRegExForUrl(ctwc.URL_VM_VN_STATS),
            body: JSON.stringify(TestMockdata.networkingStatsMockData)
        }));
        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = CUnit.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_instances',
        q: {
            view: 'details',
            type: 'instance',
            "focusedElement": {
                "fqName": "default-domain:demo:st_vn101",
                "type": "virtual-machine",
                "uuid": "0275be58-4e5f-440e-81fa-07aac3fb1623",
                "vmName": "st_vn101_vm21"
            }
        }
    };
    pageConfig.loadTimeout = 2000;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                 {
                    viewId: ctwl.INSTANCE_TABS_ID,
                    suites: [
                        {
                            class: TabsViewTestSuite,
                            groups: ['all'],
                            severity: cotc.SEVERITY_LOW
                        }
                    ]
                },
                {
                    viewId: ctwl.INSTANCE_DETAILS_ID,
                    suites: [
                        {
                            class: DetailsViewTestSuite,
                            groups: ['all'],
                            severity: cotc.SEVERITY_LOW,
                            modelConfig: {
                                dataGenerator: cttu.commonDetailsDataGenerator
                            }
                        }
                    ]
                },
                {
                    viewId: ctwl.INSTANCE_CPU_MEM_STATS_ID,
                    suites: [
                        {
                            class: LineBarChartViewTestSuite,
                            groups: ['all'],
                            severity: cotc.SEVERITY_LOW
                        }
                    ]
                },
                {
                    viewId: ctwl.INSTANCE_INTERFACE_GRID_ID,
                    suites: [
                        {
                            class: GridViewTestSuite,
                            groups: ['all'],
                            severity: cotc.SEVERITY_LOW
                        },
                        {
                            class: GridListModelTestSuite,
                            groups: ['all'],
                            severity: cotc.SEVERITY_LOW,
                            modelConfig: {
                                dataGenerator: cttu.commonGridDataGenerator,
                                dataParsers: {
                                    mockDataParseFn: cttu.deleteSizeField,
                                    gridDataParseFn: cttu.deleteSizeField
                                }
                            }
                        },
                    ]
                },
            ]
        } ;

    };

    var testInitFn = function() {
        //simulate click on all the tabs
        var instanceTabsViewObj = mnPageLoader.mnView.viewMap[ctwl.INSTANCE_TABS_ID],
            instanceTabs = instanceTabsViewObj.attributes.viewConfig.tabs;

        _.each(instanceTabs, function(tab) {
            $("#" + tab.elementId + "-tab-link").trigger("click");
        });

        return;
    };

    var pageTestConfig = CUnit.createPageTestConfig(moduleId, fakeServerConfig, pageConfig, getTestConfig, testInitFn);

    CUnit.startTestRunner(pageTestConfig);

});