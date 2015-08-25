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
    coreBaseDir + '/js/core-app-utils.js',
    coreBaseDir + '/test/ui/js/co.test.app.utils.js'
], function () {
    globalObj = {'env': "test"};

    requirejs.config({
        baseUrl: ctBaseDir,
        paths: getControllerTestAppPaths(coreBaseDir),
        map: coreAppMap,
        shim: getControllerTestAppShim(),
        waitSeconds: 0
    });

    require(['co-test-init'], function () {
        setFeaturePkgAndInit(featurePkg);
    });

    function getControllerTestAppPaths(coreBaseDir) {
        var controllerTestAppPathObj = {};

        var coreAppPaths = getCoreAppPaths(coreBaseDir);
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

        controllerTestAppPathObj["ct-test-utils"] = ctBaseDir + "/test/ui/ct.test.utils";
        controllerTestAppPathObj["ct-test-messages"] = ctBaseDir + "/test/ui/ct.test.messages";
        controllerTestAppPathObj["network-list-view-mock-data"] = ctBaseDir + "/monitor/networking/ui/test/ui/NetworkListView.mock.data";
        controllerTestAppPathObj["network-list-view-custom-test-suite"] = ctBaseDir + "/monitor/networking/ui/test/ui/NetworkListView.custom.test.suite";

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