/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/views/ProjectView.mock.data',
    'co-chart-view-zoom-scatter-test-suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, ZoomScatterChartViewTestSuite) {

    var moduleId = cttm.PROJECTS_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function () {
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

        responses.push(cotr.createFakeServerResponse({
            url: /\/api\/tenants\/get-project-role.*$/,
            body: JSON.stringify(null)
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
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-networks/details'),
            body: JSON.stringify(TestMockdata.networksMockData)
        }));
        
        responses.push(cotr.createFakeServerResponse({
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-machines/details'),
            body: JSON.stringify(TestMockdata.virtualMachinesDetailsMockData)
        }));
        
        responses.push(cotr.createFakeServerResponse({
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/stats'),
            body: JSON.stringify(TestMockdata.networksMockStatData)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-machine-interfaces/summary'),
            body: JSON.stringify(TestMockdata.virtualMachinesSummaryMockData)
        }));

        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_projects',
        q: {
            view: 'details',
            type: 'project',
            "focusedElement": {
                "fqName": "default-domain:admin",
                "type": "project"
            },
            "tab": {
                "project-tabs": "project-ports-scatter-chart"
            },
            "reload": "false"
        }
    };

    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function () {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: ctwl.PROJECT_PORTS_SCATTER_CHART_ID,
                    suites: [
                        {
                            class: ZoomScatterChartViewTestSuite,
                            groups: ['all']
                        }
                    ]
                }
            ]
        };

    };

    /**
     * testInitFn is not truly required here as tab will be activated via URL on page load.
     * implementing this function can add some timeout till the QUnit can be fired.
     * manually notify the renderComplete event as rootView will not trigger one in this case as all views
     * are already rendered.
     * @param defObj
     * @param renderComplete
     */
    var testInitFn = function(defObj, renderComplete) {
        setTimeout(function() {
            renderComplete.notify();
            defObj.resolve();
        }, cotc.PAGE_INIT_TIMEOUT * 10);

        return;
    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, fakeServerConfig, pageConfig, getTestConfig, testInitFn);

    cotr.startTestRunner(pageTestConfig);

});
