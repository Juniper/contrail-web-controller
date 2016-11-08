/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/views/InstanceView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite',
], function (cotc, cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite) {

    var moduleId = cttm.INSTANCE_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
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
            url: cttu.getRegExForUrl(cowc.URL_QUERY),
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
            },
            "reload": "false",
            "tab": {
                "instance-tabs": "instance-interface"
            }
        }
    };

    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: ctwl.INSTANCE_INTERFACE_GRID_ID,
                    suites: [
                        {
                            class: GridViewTestSuite,
                            groups: ['all']
                        },
                        {
                            class: GridListModelTestSuite,
                            groups: ['all'],
                            modelConfig: {
                                dataGenerator: cttu.commonGridDataGenerator,
                                dataParsers: {
                                    mockDataParseFn: cttu.deleteSizeField,
                                    gridDataParseFn: cttu.deleteSizeField
                                }
                            }
                        },
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
