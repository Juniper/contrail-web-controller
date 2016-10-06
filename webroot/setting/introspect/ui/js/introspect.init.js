/*
 * Copyright (c) 2016
 * Juniper Networks, Inc. All rights reserved.
 */

require([
    "controller-basedir/setting/introspect/ui/js/introspect.module"
], function () {

    var initJSpath = window.pkgBaseDir + "/setting/introspect/ui/js/introspect.init.js",
        initStatus = window.contentHandler.initFeatureModuleMap[initJSpath],
        deferredObj = initStatus.deferredObj;

    initStatus.isInProgress = false;
    initStatus.isComplete = true;

    if (contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve();
    }
});
