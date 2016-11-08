/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/views/InstanceView.mock.data',
    'co-tabs-view-test-suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, TabsViewTestSuite) {

    var moduleId = cttm.INSTANCE_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

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
        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_DOMAINS),
            body: JSON.stringify(TestMockdata.domainsMockData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_PROJECTS),
            body: JSON.stringify(TestMockdata.projectsMockData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/projects\/default-domain.*$/,
            body: JSON.stringify(TestMockdata.projectsMockData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/networks\/default\-domain\:demo.*$/,
            body: JSON.stringify(TestMockdata.demoProjectMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            url: /\/api\/tenant\/networking\/virtual\-machines\/details.*$/,
            body: JSON.stringify(TestMockdata.virtualMachineMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            url: /\/api\/tenant\/networking\/virtual\-machine.*$/,
            body: JSON.stringify(TestMockdata.virtualMachineStatsMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            url: /\/api\/tenant\/monitoring\/instance\-connected\-graph.*$/,
            body: JSON.stringify(TestMockdata.virtualMachineConnectedGraphMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            method: "POST",
            url: cttu.getRegExForUrl(cowc.URL_QE_QUERY),
            body: JSON.stringify(TestMockdata.reportsQueryMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            url: /\/api\/tenant\/networking\/flow\-series\/vm.*$/,
            body: JSON.stringify(TestMockdata.virtualMachineFlowSeriesMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            method: "POST",
            url: cttu.getRegExForUrl(ctwc.URL_VM_INTERFACES),
            body: JSON.stringify(TestMockdata.virtualMachineInterfacesMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            url: /\/api\/tenant\/networking\/network\/stats\/top.*$/,
            body: JSON.stringify(TestMockdata.networkingStatsTopMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            method: "POST",
            url: cttu.getRegExForUrl(ctwc.URL_VM_VN_STATS),
            body: JSON.stringify(TestMockdata.networkingStatsMockData)
        }));
        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
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
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    /**
     * Test cases for components in each project tab will be tested in their respective tab pages.
     */
    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                 {
                    viewId: ctwl.INSTANCE_TABS_ID,
                    suites: [
                        {
                            class: TabsViewTestSuite,
                            groups: ['all']
                        }
                    ]
                }
            ]
        } ;

    };

    var testInitFn = function(defObj, onAllViewsRenderComplete) {
        setTimeout(function() {
                /**
                 * Tabs are already rendered so by default the event will not get fired.
                 * call the notify once tabs are activated.
                 */
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
