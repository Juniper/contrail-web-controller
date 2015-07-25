/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-utils',
    'network-list-view-mockdata',
    'test-slickgrid',
    'test-messages'
], function (TestUtils, TestMockdata, TestSlickGrid, TestMessages) {
    var self = this;
    module(TestMessages.NETWORKS_GRID_MODULE, {
        setup: function () {
            self.server = sinon.fakeServer.create();
            self.server.autoRespond = true;

            $.ajaxSetup({
                cache: true
            });
        },
        teardown: function () {
            self.server.restore();
            delete self.server;
        }
    });

    asyncTest(TestMessages.TEST_LOAD_NETWORKS_GRID, function (assert) {
        expect(0);
        var hashParams = {
            p: 'mon_networking_networks',
            q: {
                view: 'list',
                type: 'network'
            }
        };
        loadFeature(hashParams);
        contentHandler.featureAppDefObj.done(function () {
            var fakeServer = self.server;

            fakeServer.respondWith( "GET", TestUtils.getRegExForUrl(ctwc.URL_ALL_DOMAINS), [200, {"Content-Type": "application/json"}, JSON.stringify(TestMockdata.domainsMockData)]);
            fakeServer.respondWith( "GET", /\/api\/tenants\/projects\/default-domain.*$/, [200, {"Content-Type": "application/json"}, JSON.stringify(TestMockdata.projectMockData)]);
            fakeServer.respondWith( "POST", TestUtils.getRegExForUrl(ctwc.URL_ALL_NETWORKS_DETAILS), [200, {"Content-Type": "application/json"}, JSON.stringify(TestMockdata.networksMockData)]);
            fakeServer.respondWith( "POST", TestUtils.getRegExForUrl(ctwc.URL_VM_VN_STATS), [200, {"Content-Type": "application/json"}, JSON.stringify(TestMockdata.networksMockStatData)]);

            setTimeout(function() {
                var testConfigObj = {
                    'prefixId': 'project-network-grid',
                    'cols': nmwgc.projectNetworksColumns,
                    'addnCols': ['detail'],
                    'gridElId': '#' + ctwl.PROJECT_NETWORK_GRID_ID
                };
                TestSlickGrid.executeSlickGridTests(testConfigObj['gridElId'], TestMockdata.networksMockData, testConfigObj);
                QUnit.start();
            }, 1000)
        });
    });
});