define([
    'co-test-constants',
    'co-test-runner',
    'co-test-utils',
    'ct-test-messages',
    'common/test/ui/unit/ct.parsers.mock.data',
    'common/test/ui/unit/ct.parsers.unit.test.suite'
], function (cotc, cotr, cotu, cttm, CTParsersUnitMockData, CTParsersUnitTestSuite) {

    var moduleId = cttm.CT_UNIT_TEST_MODULE;

    var testType = cotc.UNIT_TEST;

    function getTestConfig() {
        return {
            tests: [
                {
                    moduleId: "controller-parsers",
                    suites: [
                        {
                            class: CTParsersUnitTestSuite,
                            groups: ['all'],
                            mockData: CTParsersUnitMockData
                        }
                    ]
                }
            ]
        };
    };

    function testInitFn(defObj) {
        // Init the feature app.
        var initFeatureDefObj = $.Deferred();
        cotu.initFeatureApp(FEATURE_PCK_WEB_CONTROLLER, initFeatureDefObj);

        initFeatureDefObj.done(function() {
            defObj.resolve();
        });
        return;
    };

    cotr.startTestRunner({
        moduleId: moduleId,
        testType: testType,
        getTestConfig: getTestConfig,
        testInitFn: testInitFn
    });

});
