/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'config/networking/ipam/test/ui/views/ipamCfgGridView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite',
    'config/networking/ipam/test/ui/views/ipamCfgModal.test.suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite,ipamModalTestSuite) {

    var moduleId = cttm.IPAM_GRID_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_DOMAINS),
            body: JSON.stringify(TestMockdata.domainData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_PROJECTS),
            body: JSON.stringify(TestMockdata.projectData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/config\/ipam-details.*$/,
            body: JSON.stringify(TestMockdata.ipamsData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/config\/virtual-DNSs.*$/,
            body: JSON.stringify(TestMockdata.virtualDNsData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/config\/get-config-details.*$/,
            body: JSON.stringify(TestMockdata.tagsMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            url: /\/api\/tenants\/config\/ipams.*$/,
            method: 'POST',
            postBody: JSON.stringify(TestMockdata.ipamModalMockCNIOutput),
            body: JSON.stringify(null)
        }));
        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'config_networking_ipam'
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 2;

    var getTestConfig = function() {
        return {
            rootView: ipamCfgLoader.ipamCfgView,
            tests: [
                {
                    viewId: ctwl.CFG_IPAM_GRID_ID,
                    suites: [
                        {
                            class: GridViewTestSuite,
                            groups: ['all']
                        },
                        {
                            class: ipamModalTestSuite,
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
