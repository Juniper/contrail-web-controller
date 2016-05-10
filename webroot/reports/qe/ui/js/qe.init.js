/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

require([
    'qe-module'
], function () {
    
    var initJSpath = pkgBaseDir + '/reports/qe/ui/js/qe.init.js',
        initStatus = contentHandler.initFeatureModuleMap[initJSpath],
        deferredObj = initStatus['deferredObj'];

    initStatus['isInProgress'] = false;
    initStatus['isComplete'] = true;

    if (contrail.checkIfExist(deferredObj)) {
        deferredObj.resolve();
    }
});
