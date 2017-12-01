/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define([
    'co-test-constants',
    'co-test-runner',
    'ct-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/views/FlowGridView.mock.data',
    'co-grid-contrail-list-model-test-suite',
    'co-grid-view-test-suite'
], function (cotc, cotr, cttu, cttm, TestMockdata, GridListModelTestSuite, GridViewTestSuite) {

    var moduleId = cttm.PROJECTS_VIEW_COMMON_TEST_MODULE;

    var testType = cotc.VIEW_TEST;

    var fakeServerConfig = cotr.getDefaultFakeServerConfig();

    var fakeServerResponsesConfig = function() {
        var responses = [];

        /*
         * Full Query
         * /api/admin/reports/query?port=9110
         * &timeRange=600
         * &table=FlowSeriesTable
         * &fromTimeUTC=1443653652505
         * &toTimeUTC=1443654252505
         * &select=sourcevn%2C+destvn%2C+sourceip%2C+destip%2C+protocol%2C+sport%2C+dport%2C+SUM(bytes)%2C+SUM(packets)%2Cflow_count
         * &where=
         *   (dport%3D9110+AND+sourcevn%3Ddefault-domain%3Aadmin%3Afrontend+AND+protocol%3D6)
         *       +OR+
         *   (dport%3D9110+AND+sourcevn%3Ddefault-domain%3Aadmin%3Afrontend+AND+protocol%3D1)
         *       +OR+
         *   (dport%3D9110+AND+sourcevn%3Ddefault-domain%3Aadmin%3Afrontend+AND+protocol%3D17)
         * */

        var postData = {
            async: false,
            formModelAttrs: {
                port: 9110,
                table_name: "FlowSeriesTable",
                table_type: "FLOW",
                form_time_utc: "now-10m",
                to_time_utc: "now"
            }
        };
        responses.push(cotr.createFakeServerResponse( {
            method: "POST",
            url: cttu.getRegExForUrl("/api/qe/query"),
            data: JSON.stringify(postData),
            body: JSON.stringify(TestMockdata.flowsMockData)
        }));

        return responses;
    };
    fakeServerConfig.getResponsesConfig = fakeServerResponsesConfig;

    var pageConfig = cotr.getDefaultPageConfig();
    pageConfig.hashParams = {
        p: 'mon_networking_networks',
        q: {
            "fqName": "default-domain:admin:frontend",
            "port": "9110",
            "portType": "dst",
            "type": "flow",
            "view": "details"
        }
    };
    pageConfig.loadTimeout = cotc.PAGE_LOAD_TIMEOUT * 5;

    var getTestConfig = function() {
        return {
            rootView: mnPageLoader.mnView,
            tests: [
                {
                    viewId: ctwl.PROJECT_FLOW_GRID_ID,
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
                                dataParsers: {}
                            }
                        }
                    ]
                },
            ]
        } ;

    };

    var pageTestConfig = cotr.createPageTestConfig(moduleId, testType, fakeServerConfig, pageConfig, getTestConfig);

    cotr.startTestRunner(pageTestConfig);

});
