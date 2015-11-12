define([
    'co-test-runner',
    'co-test-utils',
    'ct-test-messages',
    'nm-parsers-unit-mock-data',
    'nm-parsers-unit-test-suite',
    'nm-utils-unit-mock-data',
    'nm-utils-unit-test-suite',
], function (cotr, cotu, cttm, NMParsersUnitMockData, NMParsersUnitTestSuite, NMUtilsMockData, NMUtilsUnitTestSuite) {

    var moduleId = cttm.NM_UNIT_TEST_MODULE;

    var testType = cotc.UNIT_TEST;

    function getTestConfig() {
        return {
            tests: [
                {
                    moduleName: 'nm.parsers',
                    modulePathPrefix: 'monitor/networking/ui/js/',
                    suites: [
                        {
                            class: NMParsersUnitTestSuite,
                            groups: ['all'],
                            severity: cotc.SEVERITY_LOW,
                            mockData: NMParsersUnitMockData
                        }
                    ]
                },
                {
                    moduleName: 'nm.utils',
                    modulePathPrefix: 'monitor/networking/ui/js/',
                    suites: [
                        {
                            class: NMUtilsUnitTestSuite,
                            groups: ['all'],
                            severity: cotc.SEVERITY_LOW,
                            mockData: NMUtilsMockData
                        }
                    ]
                }
            ]
        };
    };

    function testInitFn(defObj) {
        // Init the feature module for all the helper Fns to load.
        var initJSFile = '/monitor/networking/ui/js/nm.init.js';
        var initFeatureDefObj = $.Deferred();

        cotu.initFeatureModule(initJSFile, initFeatureDefObj);

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