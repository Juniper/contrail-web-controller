/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'config/dns/servers/test/ui/views/dnsServersGridView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite'
], function (cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite) {

    var moduleId = cttm.DNS_SERVERS_GRID_VIEW_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/config\/domains.*$/,
            body: JSON.stringify(TestMockdata.dnsServerDomainsMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            url : /\/api\/admin\/config\/get-data\?type=virtual-DNS&count=4&fqnUUID=07fbaa4b-c7b8-4f3d-996e-9d8b1830b288.*$/,
            body: JSON.stringify(TestMockdata.dnsServersMockData)
        }));

        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'config_dns_servers'
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 2;

    var getTestConfig = function() {
        return {
            rootView: configDNSServerLoader.dnsServersView,
            tests: [
                {
                    viewId: ctwc.DNS_SERVER_GRID_ID,
                    suites: [
                        {
                            class: GridViewTestSuite,
                            groups: ['all']
                        }
                    ]
                }
            ]
        } ;

    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, fakeServerConfig, pageConfig, getTestConfig);

    cotr.startTestRunner(pageTestConfig);

});
