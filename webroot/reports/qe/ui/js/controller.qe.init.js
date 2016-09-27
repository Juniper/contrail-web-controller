/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

require([
    "qe-module",
    "controller-qe-module"
], function () {
    var initJSpath = window.pkgBaseDir + "/reports/qe/ui/js/controller.qe.init.js",
        initStatus = window.contentHandler.initFeatureModuleMap[initJSpath],
        deferredObj = initStatus.deferredObj;

    initStatus.isInProgress = false;
    initStatus.isComplete = true;

    if (contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve();
    }
});
