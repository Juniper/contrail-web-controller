/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var coreBaseDir = "/base/contrail-web-core/webroot",
    ctBaseDir = "/base/contrail-web-controller/webroot",
    pkgBaseDir = ctBaseDir,
    featurePkg = 'webController';

var ctwu, ctwc, ctwgc, ctwgrc, ctwl, ctwm, ctwp, ctwvc,
    nmwu, nmwgc, nmwgrc, nmwp, nmwvc;

require([
    coreBaseDir + '/test/ui/js/co.test.app.utils.js'
], function () {
    require([coreBaseDir + '/test/ui/js/co.test.config.js'], function(testConf) {
        globalObj['env'] = testConf['env'];

        //will copy the testConfig to globalObj so window can access it later.
        globalObj['testConf'] = testConf;
        var bundles = {};
        if (globalObj['env'] == 'prod') {
            globalObj['buildBaseDir'] = '/dist';
            bundles = coreBundles;
        } else {
            globalObj['buildBaseDir'] = '';
        }
        globalObj['test-env'] = globalObj['env'] + "-test";

        requirejs.config({
            baseUrl: ctBaseDir,
            bundles: bundles,
            paths: getControllerTestAppPaths(coreBaseDir),
            map: coreAppMap,
            shim: getControllerTestAppShim(),
            waitSeconds: 0
        });

        require(['co-test-mockdata', 'co-test-init'], function (coreTestMockData) {
            setFeaturePkgAndInit(featurePkg, coreTestMockData);
        });

        function getControllerTestAppPaths(coreBaseDir) {
            var controllerTestAppPathObj = {};

            var coreAppPaths = getCoreAppPaths(coreBaseDir, globalObj['buildBaseDir']);
            var coreTestAppPaths = getCoreTestAppPaths(coreBaseDir);

            for (var key in coreAppPaths) {
                if (coreAppPaths.hasOwnProperty(key)) {
                    var value = coreAppPaths[key];
                    controllerTestAppPathObj[key] = value;
                }
            }

            for (var key in coreTestAppPaths) {
                if (coreTestAppPaths.hasOwnProperty(key)) {
                    var value = coreTestAppPaths[key];
                    controllerTestAppPathObj[key] = value;
                }
            }

            //Test Infra
            controllerTestAppPathObj["ct-test-utils"] = ctBaseDir + "/test/ui/ct.test.utils";
            controllerTestAppPathObj["ct-test-messages"] = ctBaseDir + "/test/ui/ct.test.messages";

            //Unit tests
            controllerTestAppPathObj["nm-parsers-unit-test-suite"] = ctBaseDir + "/monitor/networking/test/ui/unit/nm.parsers.unit.test.suite";
            controllerTestAppPathObj["nm-utils-unit-test-suite"] = ctBaseDir + "/monitor/networking/test/ui/unit/nm.utils.unit.test.suite";

            //Custom View Tests
            controllerTestAppPathObj["network-list-view-custom-test-suite"] = ctBaseDir + "/monitor/networking/test/ui/views/NetworkListView.custom.test.suite";

            return controllerTestAppPathObj;
        };

        function getControllerTestAppShim() {
            var controllerTestAppShim = {};

            for (var key in coreAppShim) {
                if (coreAppShim.hasOwnProperty(key)) {
                    var value = coreAppShim[key];
                    controllerTestAppShim[key] = value;
                }
            }

            for (var key in coreTestAppShim) {
                if (coreTestAppShim.hasOwnProperty(key)) {
                    var value = coreTestAppShim[key];
                    controllerTestAppShim[key] = value;
                }
            }

            return controllerTestAppShim;
        }

    });

});
