define([
    'co-test-constants',
    'co-test-runner',
    'co-test-utils',
    'ct-test-messages',
    'monitor/networking/test/ui/unit/nm.parsers.mock.data',
    'nm-parsers-unit-test-suite',
    'monitor/networking/test/ui/unit/nm.utils.mock.data',
    'nm-utils-unit-test-suite',
], function (cotc, cotr, cotu, cttm, NMParsersUnitMockData, NMParsersUnitTestSuite, NMUtilsMockData, NMUtilsUnitTestSuite) {

    var moduleId = cttm.NM_UNIT_TEST_MODULE;

    var testType = cotc.UNIT_TEST;

    function getTestConfig() {
        return {
            tests: [
                /*{
                    moduleName: 'nm.parsers',
                    modulePathPrefix: 'controller-basedir/monitor/networking/ui/js/',
                    suites: [
                        {
                            class: NMParsersUnitTestSuite,
                            groups: ['all'],
                            mockData: NMParsersUnitMockData
                        }
                    ]
                },*/
                {
                    moduleName: 'nm.utils',
                    modulePathPrefix: 'controller-basedir/monitor/networking/ui/js/',
                    suites: [
                        {
                            class: NMUtilsUnitTestSuite,
                            groups: ['all'],
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
