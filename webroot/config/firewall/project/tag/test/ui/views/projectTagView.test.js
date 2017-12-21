/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */

define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'config/firewall/project/tag/test/ui/views/projectTagView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite',
    'config/firewall/project/tag/test/ui/views/projectTagModal.test.suite',
    'config/firewall/project/tag/test/ui/views/projectTagCustomModal.test.suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite, TagModalTestSuite, CustomTagModalTest) {

    var moduleId = cttm.PROJECT_TAG_GRID_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_DOMAINS),
            body: JSON.stringify(TestMockdata.projectTagDomainsData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: cttu.getRegExForUrl(ctwc.URL_ALL_PROJECTS),
            body: JSON.stringify(TestMockdata.projectTagPojectsData)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/get-project-role.*$/,
            body: JSON.stringify(TestMockdata.projectTagProjectRole)
        }));
        responses.push(cotr.createFakeServerResponse( {
            url: /\/api\/tenants\/config\/get-config-details.*$/,
            method : 'POST',
            body: JSON.stringify(TestMockdata.projectTagMockData)
        }));
        responses.push(cotr.createFakeServerResponse({
            url: /\/api\/tenants\/config\/create-config-object.*$/,
            method: 'POST',
            postBody: JSON.stringify(TestMockdata.projectTagModalOutput),
            body: JSON.stringify(null)
        }));
        responses.push(cotr.createFakeServerResponse({
            url: /\/api\/tenants\/config\/create-config-object.*$/,
            method: 'POST',
            postBody: JSON.stringify(TestMockdata.customTagModalOutput),
            body: JSON.stringify(null)
        }));
        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'config_tags_projectscopedtags'
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 2;

    var getTestConfig = function() {
        return {
            rootView: tagProjectPageLoader.projectTagView,
            tests: [
                {
                    viewId: ctwc.SECURITY_POLICY_TAG_GRID_ID,
                    suites: [
                        {
                            class: GridViewTestSuite,
                            groups: ['all']
                        },
                        {
                            class: TagModalTestSuite,
                            groups: ['all']
                        },
                        {
                            class: CustomTagModalTest,
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
