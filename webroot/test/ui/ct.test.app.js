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
    coreBaseDir + '/js/common/core.app.utils.js',
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

        //Test Infra
        controllerTestAppPathObj["ct-test-utils"] = ctBaseDir + "/test/ui/ct.test.utils";
        controllerTestAppPathObj["ct-test-messages"] = ctBaseDir + "/test/ui/ct.test.messages";

        //Unit tests
        controllerTestAppPathObj["nm-parsers-unit-mock-data"] = ctBaseDir + "/monitor/networking/test/ui/unit/nm.parsers.mock.data";
        controllerTestAppPathObj["nm-parsers-unit-test-suite"] = ctBaseDir + "/monitor/networking/test/ui/unit/nm.parsers.unit.test.suite";
        controllerTestAppPathObj["nm-utils-unit-mock-data"] = ctBaseDir + "/monitor/networking/test/ui/unit/nm.utils.mock.data";
        controllerTestAppPathObj["nm-utils-unit-test-suite"] = ctBaseDir + "/monitor/networking/test/ui/unit/nm.utils.unit.test.suite";

        //View Tests
        controllerTestAppPathObj["network-list-view-mock-data"] = ctBaseDir + "/monitor/networking/test/ui/views/NetworkListView.mock.data";
        controllerTestAppPathObj["network-view-mock-data"] = ctBaseDir + "/monitor/networking/test/ui/views/NetworkView.mock.data";
        controllerTestAppPathObj["project-list-view-mock-data"] = ctBaseDir + "/monitor/networking/test/ui/views/ProjectListView.mock.data";
        controllerTestAppPathObj["project-view-mock-data"] = ctBaseDir + "/monitor/networking/test/ui/views/ProjectView.mock.data";
        controllerTestAppPathObj["dashboard-view-mock-data"] = ctBaseDir + "/monitor/networking/test/ui/views/DashboardView.mock.data";
        controllerTestAppPathObj["instance-list-view-mock-data"] = ctBaseDir + "/monitor/networking/test/ui/views/InstanceListView.mock.data";
        controllerTestAppPathObj["instance-view-mock-data"] = ctBaseDir + "/monitor/networking/test/ui/views/InstanceView.mock.data";
        controllerTestAppPathObj["flow-list-view-mock-data"] = ctBaseDir + "/monitor/networking/test/ui/views/FlowListView.mock.data";
        controllerTestAppPathObj["flow-grid-view-mock-data"] = ctBaseDir + "/monitor/networking/test/ui/views/FlowGridView.mock.data";

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