/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define([
    'monitor-infra-module'
], function () {
    var initJSpath = pkgBaseDir +
        '/monitor/infrastructure/common/ui/js/monitor.infra.init.js',
        initStatus = contentHandler.initFeatureModuleMap[initJSpath],
        deferredObj = initStatus['deferredObj'];

        initStatus['isInProgress'] = false;
        initStatus['isComplete'] = true;

    if(contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve();
    }
    
});
