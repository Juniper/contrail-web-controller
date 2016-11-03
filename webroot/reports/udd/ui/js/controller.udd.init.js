/* Copyright (c) 2016 Juniper Networks, Inc. All rights reserved. */

define([
    "udd-module"
], function () {
    var initJSpath = window.pkgBaseDir + "/reports/udd/ui/js/controller.udd.init.js";
    var initStatus = window.contentHandler.initFeatureModuleMap[initJSpath];
    var deferredObj = initStatus.deferredObj;

    initStatus.isInProgress = false;
    initStatus.isComplete = true;

    if (window.contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve();
    }
});
