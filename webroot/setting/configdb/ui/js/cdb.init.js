/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    "controller-basedir/setting/configdb/ui/js/cdb.main"
], function () {

    var initJSpath = window.pkgBaseDir + "/setting/configdb/ui/js/cdb.init.js",
        initStatus = window.contentHandler.initFeatureModuleMap[initJSpath],
        deferredObj = initStatus.deferredObj;

    initStatus.isInProgress = false;
    initStatus.isComplete = true;

    if(contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve();
    }
});
