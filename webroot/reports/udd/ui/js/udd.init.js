/* Copyright (c) 2016 Juniper Networks, Inc. All rights reserved. */

define([
    "text!reports/qe/ui/templates/qe.tmpl",
    "text!reports/udd/ui/templates/udd.tmpl",
    "reports/udd/ui/js/udd.main"
], function (QETemplates, UDDTemplates) {
    var initJSpath = window.pkgBaseDir + "/reports/udd/ui/js/udd.init.js";
    var initStatus = window.contentHandler.initFeatureModuleMap[initJSpath];
    var deferredObj = initStatus.deferredObj;

    initStatus.isInProgress = false;
    initStatus.isComplete = true;

    $("body").append(QETemplates);
    $("body").append(UDDTemplates);

    if (window.contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve();
    }
});
