/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'config/dns/records/test/ui/views/dnsRecordsGridView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite) {

    var moduleId = cttm.DNS_RECORDS_GRID_VIEW_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];
        responses.push(cotr.createFakeServerResponse({
            url : cttu.getRegExForUrl(ctwc.URL_ALL_DOMAINS),
            body: JSON.stringify(TestMockdata.dnsRecordsDomainMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            url : /\/api\/tenants\/config\/list-virtual-DNSs.*$/,
            body: JSON.stringify(TestMockdata.dnsServerListMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            url : /\/api\/tenants\/config\/get-config-details.*$/,
            method: "POST",
            body: JSON.stringify(TestMockdata.dnsRecordsMockData)
        }));

        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'config_dns_records',
        q: {
            uuid:'e59247c6-280f-47b7-a3f3-994f3108cf93'
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 2;

    var getTestConfig = function() {
        return {
            rootView: configDNSRecordsLoader.dnsRecordsView,
            tests: [
                {
                    viewId: ctwc.DNS_RECORDS_GRID_ID,
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
