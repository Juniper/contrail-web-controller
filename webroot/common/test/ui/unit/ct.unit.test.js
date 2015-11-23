define([
    'co-test-runner',
    'co-test-utils',
    'ct-test-messages',
    'common/test/ui/unit/ct.parsers.mock.data',
    'common/test/ui/unit/ct.parsers.unit.test.suite'
], function (cotr, cotu, cttm, CTParsersUnitMockData, CTParsersUnitTestSuite) {

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
        defObj.resolve();
        return;
    };

    cotr.startTestRunner({
        moduleId: moduleId,
        testType: testType,
        getTestConfig: getTestConfig,
        testInitFn: testInitFn
    });

});