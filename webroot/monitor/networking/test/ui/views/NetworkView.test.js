/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/views/NetworkView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite',
    'co-details-view-test-suite',
    'co-chart-view-line-test-suite',
    'co-chart-view-zoom-scatter-test-suite',

], function (cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite, DetailsViewTestSuite, LineWithFocusChartViewTestSuite, ZoomScatterChartViewTestSuite) {

    var moduleId = cttm.PROJECTS_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        /*
         /api/tenants/config/domains                                                                                                     done
         /api/tenants/config/projects                                                                                                    done
         /api/tenants/networks/default-domain:admin                                                                                      done
         /api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:admin:frontend                                       done
         /api/tenant/networking/flow-series/vn?minsSince=120&fqName=default-domain:admin:frontend&sampleCnt=120                          done
         /api/tenant/networking/network/stats/top?minsSince=10&fqName=default-domain:admin:frontend                                      done
         /api/tenant/monitoring/network-connected-graph?fqName=default-domain:admin:frontend                                             done
         /api/tenant/monitoring/network-config-graph?fqName=default-domain:admin:frontend                                                done
         /api/tenant/networking/virtual-machines/details?fqnUUID=ad8a9efc-9b7e-4425-9735-03bda0d2726e&count=10&type=vn                   done
         /api/tenant/networking/virtual-machines/summary                                                                                 done
         /api/tenant/networking/virtual-machine-interfaces/summary                                                                       done
         /api/tenant/networking/stats                                                                                                    done
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
        responses.push(cotr.createFakeServerResponse( {
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenants/networks/default-domain:admin'),
            body: JSON.stringify(TestMockdata.networksForAdminProjectMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-network/summary?fqNameRegExp=default-domain:admin:frontend'),
            body: JSON.stringify(TestMockdata.networkSummaryForFrontEndNetworkMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenant/networking/flow-series/vn?minsSince=120&fqName=default-domain:admin:frontend'),
            body: JSON.stringify(TestMockdata.flowSeriesForFrontendVNMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            method: "GET",
            url: cttu.getRegExForUrl('/api/tenant/networking/network/stats/top?minsSince=10&fqName=default-domain:admin:frontend'),
            body: JSON.stringify(TestMockdata.networkStatsForFrontendVNMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            method:"GET",
            url: cttu.getRegExForUrl('/api/tenant/monitoring/network-connected-graph?fqName=default-domain:admin:frontend'),
            body: JSON.stringify(TestMockdata.networkConnectedGraphForFrontEndNetworkMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            method:"GET",
            url: cttu.getRegExForUrl('/api/tenant/monitoring/network-config-graph?fqName=default-domain:admin:frontend'),
            body: JSON.stringify(TestMockdata.networkConfigGraphForFrontEndNetworkMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            method:"POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-machines/details?fqnUUID=ad8a9efc-9b7e-4425-9735-03bda0d2726e&count=10&nextCount=100&type=vn'),
            body: JSON.stringify(TestMockdata.virtualMachineDetailsByUUIDMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            method:"POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-machines/summary'),
            body: JSON.stringify(TestMockdata.virtualMachinesSummaryMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            method:"POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/virtual-machine-interfaces/summary'),
            body: JSON.stringify(TestMockdata.virtualMachinesInterfacesMockData)
        }));

        responses.push(cotr.createFakeServerResponse({
            method:"POST",
            url: cttu.getRegExForUrl('/api/tenant/networking/stats'),
            body: JSON.stringify(TestMockdata.virtualMachinesStatsMockData)
        }));

        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_networks',
        q: {
            view: 'details',
            type: 'network',
            "focusedElement": {
                "fqName": "default-domain:admin:frontend",
                "type": "virtual-network"
            }
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: ctwl.NETWORK_PORT_DIST_ID,
                    suites: [
                        {
                            class: ZoomScatterChartViewTestSuite,
                            groups: ['all']
                        }
                    ]
                },
                {
                    viewId: ctwl.NETWORK_DETAILS_ID,
                    suites: [
                        {
                            class: DetailsViewTestSuite,
                            groups: ['all'],
                            modelConfig: {
                                dataGenerator: cttu.commonDetailsDataGenerator
                            }
                        }
                    ]
                },
                {
                    viewId: ctwl.PROJECT_INSTANCE_GRID_ID,
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
                        }
                    ]
                },
                {
                    viewId: ctwl.NETWORK_TRAFFIC_STATS_ID,
                    suites: [
                        {
                            class: LineWithFocusChartViewTestSuite,
                            groups: ['all']
                        }
                    ]
                },
                {
                    viewId: ctwl.NETWORK_INTERFACE_GRID_ID,
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
                        }
                    ]
                }

                // TODO add heat chart view test suite
            ]
        } ;

    };

    var testInitFn = function(defObj) {
        //simulate click on all the tabs
        var networkTabsViewObj = mnPageLoader.mnView.viewMap[ctwl.NETWORK_TABS_ID],
            networkTabs = networkTabsViewObj.attributes.viewConfig.tabs;

        _.each(networkTabs, function(tab) {
            $("#" + tab.elementId + "-tab-link").trigger("click");
        });

        setTimeout(function() {
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