/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var coreBaseDir = "/base/contrail-web-core/webroot",
    ctBaseDir = "/base/contrail-web-controller/webroot";

require(["/base/contrail-web-core/webroot/js/core-app-utils.js"], function () {
    globalObj['env'] = "test";
    requirejs.config({
        baseUrl: ctBaseDir,
        paths: getControllerTestAppPaths(getCoreAppPaths(coreBaseDir)),
        map: coreAppMap,
        shim: coreAppShim,
        waitSeconds: 0
    });

    require(['ct-test-init'], function () {
    });
});

function getControllerTestAppPaths(coreAppPaths) {
    var controllerTestAppPathObj = {};

    for (var key in coreAppPaths) {
        if (coreAppPaths.hasOwnProperty(key)) {
            var value = coreAppPaths[key];
            controllerTestAppPathObj[key] = value;
        }
    }

    controllerTestAppPathObj ["co-test-utils"] = coreBaseDir + "/test/ui/co.test.utils";
    controllerTestAppPathObj ["co-test-mockdata"] = coreBaseDir + "/test/ui/co.test.mockdata";
    controllerTestAppPathObj ["test-slickgrid"] = coreBaseDir + "/test/ui/slickgrid.test.common";

    controllerTestAppPathObj ["network-list-view-mockdata"] = ctBaseDir + "/monitor/networking/ui/test/ui/NetworkListViewMockData";
    controllerTestAppPathObj ["test-messages"] = ctBaseDir + "/test/ui/ct.test.messages";
    controllerTestAppPathObj["ct-test-init"] = ctBaseDir + "/test/ui/ct.test.init";

    return controllerTestAppPathObj;
};
