/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

require([
    'nm-module'
], function () {

    var initJSpath = pkgBaseDir + '/monitor/networking/ui/js/nm.init.js',
        initStatus = contentHandler.initFeatureModuleMap[initJSpath],
        deferredObj = initStatus['deferredObj'];

    initStatus['isInProgress'] = false;
    initStatus['isComplete'] = true;

    if(contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve();
    }
});
