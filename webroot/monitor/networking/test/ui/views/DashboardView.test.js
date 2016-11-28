/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/views/DashboardView.mock.data',
    'co-tabs-view-test-suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, TabsViewTestSuite) {

    var moduleId = cttm.PROJECTS_LIST_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        /*
         /api/tenants/config/domains                      done
         /api/tenants/config/projects                     done
         /api/tenant/networking/virtual-networks/details  done
         /api/tenant/networking/network/stats/top?minsSince=10&fqName=default-domain:admin&useServerTime=true&type=port&_=1442526971361  done
         /api/tenant/monitoring/project-connected-graph?fqName=default-domain:admin&_=1442526971867 done
         /api/tenant/monitoring/project-config-graph?fqName=default-domain:admin&_=1442869670788 done
         /api/tenant/networking/virtual-networks/details?count=25&fqn=default-domain:admin&startAt=1442869670641 done
         /api/tenant/networking/virtual-machines/details?fqnUUID=ba710bf3-922d-4cda-bbb4-a2e2e76533bf&count=10&type=project  done
         /api/tenant/networking/virtual-machine-interfaces/summary  done
         /api/tenant/networking/stats done
         */

        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_DOMAINS),
            body: JSON.stringify(TestMockdata.domainsMockData)
        }));

        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_PROJECTS),
            body: JSON.stringify(TestMockdata.projectMockData)
        }));

        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/projects\/default-domain.*$/,
            body: JSON.stringify(TestMockdata.projectMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenant/networking/network/stats/top'),
            body: JSON.stringify(TestMockdata.portDistributionMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenant/monitoring/project-connected-graph'),
            body: JSON.stringify(TestMockdata.projectConnectedGraph)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenant/monitoring/project-config-graph'),
            body: JSON.stringify(TestMockdata.projectConfigGraph)
        }));
        responses.push(cotr.createFakeServerResponse({
            method:"POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-networks/details'),
            body: JSON.stringify(TestMockdata.networksMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            method:"POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-machines/details'),
            body: JSON.stringify(TestMockdata.virtualMachinesDetailsMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            method:"POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/stats'),
            body: JSON.stringify(TestMockdata.networksMockStatData)
        }));
        // how to differentiate between this POST request and the one for networks above

        //responses.push(cotr.createFakeServerResponse({
        //    method:"POST",
        //    url: cttu.getRegExForUrl('/api/tenant/networking/stats'),
        //    body: JSON.stringify(TestMockdata.virtualMachinesStatsMockData)
        //}));
        responses.push(cotr.createFakeServerResponse({
            method:"POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-machine-interfaces/summary'),
            body: JSON.stringify(TestMockdata.virtualMachinesSummaryMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            method:"POST",
            url: cttu.getRegExForUrl(ctwc.URL_GET_VIRTUAL_NETWORKS),
            body: JSON.stringify(TestMockdata.networksDetailsMockData)
        }));


        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_dashboard',
        q: {
            view: 'details',
            type: 'project'
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
                    viewId: ctwl.PROJECT_TABS_ID,
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
