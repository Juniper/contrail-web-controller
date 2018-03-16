/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'config/infra/globalconfig/test/ui/views/globalVRouterEncryptionGridViewTest.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite',
    'config/infra/globalconfig/test/ui/views/globalVRouterEncryptionListView.custom.test.suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite, CustomGridTestSuite) {

    var moduleId = cttm.GLOBAL_VROUTER_ENCRYPTION_GRID_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];
        responses.push(cotr.createFakeServerResponse( {
    			url: cttu.getRegExForUrl(ctwc.URL_CFG_VROUTER_DETAILS), 
    			body: JSON.stringify(TestMockdata.vroutersDetailMockData)
        }));
        responses.push(cotr.createFakeServerResponse( {
        		url: cttu.getRegExForUrl(ctwc.URL_GET_CONFIG_DETAILS), 
        	    method : 'POST',
            body: JSON.stringify(TestMockdata.vrouterConfigDetails)
        }));
        
        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'config_infra_gblconfig',
        q: {
            tab: {
                'global-config-tab' : 'global_security_configs'
            }
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 2;

    var getTestConfig = function() {
        return {
            rootView: globalConfigPageLoader.globalConfigView,
            tests: [
                {
                    viewId: ctwc.GLOBAL_VROUTER_ENCRYPTION_GRID_ID,
                    suites: [
                       {
                            class: CustomGridTestSuite,
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