/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-unit',
    'ct-test-utils',
    'ct-test-messages',
    'project-list-view-mock-data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite'
], function (CUnit, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite) {

    var moduleId = cttm.PROJECTS_LIST_VIEW_COMMON_TEST_MODULE;

    var fakeServerConfig = CUnit.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        /*
            /api/tenants/config/domains
            /api/tenants/projects/default-domain
            /api/tenant/networking/virtual-networks/details?count=25
            /api/tenant/networking/stats
        */

        responses.push(CUnit.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_DOMAINS),
            body: JSON.stringify(TestMockdata.domainsMockData)
        }));
        responses.push(CUnit.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_PROJECTS),
            body: JSON.stringify(TestMockdata.projectMockData)
        }));
        responses.push(CUnit.createFakeServerResponse({
            method:"POST",
            url: cttu.getRegExForUrl(ctwc.URL_ALL_NETWORKS_DETAILS),
            body: JSON.stringify(TestMockdata.networksMockData)
        }));
        responses.push(CUnit.createFakeServerResponse({
            method: "POST",
            url: cttu.getRegExForUrl(ctwc.URL_VM_VN_STATS),
            body: JSON.stringify(TestMockdata.networksMockStatData)
        }));

        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = CUnit.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_projects',
        q: {
            view: 'list',
            type: 'project'
        }
    };
    pageConfig.loadTimeout = 2000;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: 'projects-grid',
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