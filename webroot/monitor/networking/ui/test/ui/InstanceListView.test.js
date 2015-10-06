/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-unit',
    'ct-test-utils',
    'ct-test-messages',
    'instance-list-view-mock-data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite'
], function (CUnit, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite) {

    var moduleId = cttm.INSTANCES_LIST_VIEW_COMMON_TEST_MODULE;

    var fakeServerConfig = CUnit.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        /*
            /api/tenants/config/domains
            /api/tenants/config/projects                            need to add [done]
            /api/tenants/networks/default-domain:admin              need to add [done]
            /api/tenant/networking/virtual-machines/details?fqnUUID=ba710bf3-922d-4cda-bbb4-a2e2e76533bf&count=25&type=project  need  to add [POST request]  [done]
            /api/tenant/networking/stats [done]
            /api/tenant/networking/virtual-machine-interfaces/summary  need to add
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
            url: /\/api\/tenants\/projects\/default\-domain\:admin.*$/,
            body: JSON.stringify(TestMockdata.adminProjectMockData)
        }));
        responses.push(CUnit.createFakeServerResponse({
            method:"POST",
            url: /\/api\/tenant\/networking\/virtual-machines\/details.*$/,
            body: JSON.stringify(TestMockdata.virtualMachinesMockData)
        }));
        responses.push(CUnit.createFakeServerResponse({
            method: "POST",
            url: cttu.getRegExForUrl(ctwc.URL_VM_VN_STATS),
            body: JSON.stringify(TestMockdata.virtualMachinesMockStatData)
        }));
        responses.push(CUnit.createFakeServerResponse({
            method: "POST",
            url: cttu.getRegExForUrl(ctwc.URL_VM_INTERFACES),
            body: JSON.stringify(TestMockdata.virtualMachinesInterfacesMockData)
        }));

        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = CUnit.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_instances',
        q: {
            view: 'list',
            type: 'instance',
            project: 'default-domain:admin'
        }
    };
    pageConfig.loadTimeout = 2000;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: 'project-instance-grid',
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
                        //{
                        //    class: CustomTestSuite,
                        //    groups: ['all'],
                        //    severity: cotc.SEVERITY_LOW
                        //},
                    ]
                }
            ]
        } ;

    };

    var pageTestConfig = CUnit.createPageTestConfig(moduleId, fakeServerConfig, pageConfig, getTestConfig);

    CUnit.startTestRunner(pageTestConfig);

});