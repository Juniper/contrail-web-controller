/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'monitor/networking/ui/js/views/MonitorNetworkingView',
    'co-test-utils',
    'network-list-view-mockdata',
    'test-slickgrid',
    'test-messages'
], function (MonitorNetworkingView, TestUtils, TestMockdata, TestSlickGrid, TestMessages) {
    module(TestMessages.NETWORKS_GRID_MODULE, {
        setup: function () {
            this.server = sinon.fakeServer.create();
            $.ajaxSetup({
                cache: true
            });
        },
        teardown: function () {
            this.server.restore();
            delete this.server;
        }
    });

    var monitorNetworkingView = new MonitorNetworkingView();

    asyncTest(TestMessages.TEST_LOAD_NETWORKS_GRID, function (assert) {
        expect(0);
        var fakeServer = this.server,
            testConfigObj = {
                'prefixId': 'project-network-grid',
                'cols': nmwgc.projectNetworksColumns,
                'addnCols': ['detail'],
                'gridElId': '#' + ctwl.PROJECT_NETWORK_GRID_ID
            };

        fakeServer.autoRespond = true;

        fakeServer.respondWith(
            "GET", TestUtils.getRegExForUrl(ctwc.URL_ALL_DOMAINS),
            [200, {"Content-Type": "application/json"}, JSON.stringify(TestMockdata.domainsMockData)]);
        fakeServer.respondWith(
            "GET", /\/api\/tenants\/projects\/default-domain.*$/,
            [200, {"Content-Type": "application/json"}, JSON.stringify(TestMockdata.projectMockData)]);
        fakeServer.respondWith(
            "POST", TestUtils.getRegExForUrl(ctwc.URL_ALL_NETWORKS_DETAILS),
            [200, {"Content-Type": "application/json"}, JSON.stringify(TestMockdata.networksMockData)]);
        fakeServer.respondWith(
            "POST", TestUtils.getRegExForUrl(ctwc.URL_VM_VN_STATS),
            [200, {"Content-Type": "application/json"}, JSON.stringify(TestMockdata.networksMockStatData)]);

        mnPageLoader.renderView('renderNetworks', {
            "view": "list",
            "type": "network"
        }, monitorNetworkingView);

        window.setTimeout(function () {
            TestSlickGrid.executeSlickGridTests(testConfigObj['gridElId'], TestMockdata.networksMockData, testConfigObj);
            QUnit.start();
        }, 3000);
    });
});